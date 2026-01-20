 import { tool } from "@opencode-ai/plugin"
import * as fs from "fs/promises"
import * as path from "path"
import crypto from "crypto"

function computeSha256(contents: string): string {
  return crypto.createHash("sha256").update(contents, "utf8").digest("hex")
}

function splitLines(contents: string): string[] {
  return contents.replace(/\r\n?/g, "\n").split("\n")
}

function detectLineEnding(text: string): string {
  const crlf = text.match(/\r\n/)
  if (crlf) return "\r\n"
  return "\n"
}

function frontmatterError({filename, token = null, offset, limit, start, seek, error}:
  {filename: string, token?: string|null, offset?: number, limit?: number, start?: number, seek?: string, error: string}): string {
  const out = [
    `---`,
    `filename: ${filename}`,
    `token: ${token}`,
    offset !== undefined ? `offset: ${offset}` : undefined,
    limit !== undefined ? `limit: ${limit}` : undefined,
    start !== undefined ? `start: ${start}` : undefined,
    seek !== undefined ? `seek: ${seek}` : undefined,
    `error: ${error.replace(/\n/g," ")}`,
    `---`
  ].filter(Boolean)
  return out.join("\n")
}

function getRowRange(params: { offset?: number, limit?: number, start?: number, end?: number, defaultLimit?: number, maxLimit?: number, totalRows: number }) {
  const { offset, limit, start, end, defaultLimit, maxLimit, totalRows } = params;
  let _offset: number = 1;
  let _limit: number = defaultLimit ?? 40;
  let error: string | null = null;

  if (start !== undefined || end !== undefined) {
    if (start !== undefined && start < 1) {
      error = `invalid: start must be >= 1`;
    } else if (end !== undefined && end < 1) {
      error = `invalid: end must be >= 1`;
    } else if (start !== undefined && end !== undefined && end < start) {
      error = `invalid: end must be >= start`;
    } else {
      _offset = start ?? 1;
      _limit = end !== undefined ? end - _offset + 1 : _limit;
    }
  } else if (offset !== undefined || limit !== undefined) {
    if (offset !== undefined && offset < 1) {
      error = `invalid: offset must be >= 1`;
    } else if (limit !== undefined && limit < 0) {
      error = `invalid: limit must be >= 0`;
    } else {
      _offset = offset ?? 1;
      _limit = limit ?? defaultLimit ?? 40;
    }
  }

  if (_limit > (maxLimit ?? 100)) {
    error = `invalid: limit must not exceed ${maxLimit ?? 100}`;
  }
  if (_offset > totalRows + 1) {
    error = `Offset/start (${_offset}) out of bounds (file has ${totalRows} rows)`;
  }
  if (_offset - 1 + _limit > totalRows) {
    _limit = totalRows - (_offset - 1);
  }
  if (_limit < 0) _limit = 0;

  return { offset: _offset, limit: _limit, start, end, error };
}

function padRowNumber(n: number): string {
  return n.toString().padStart(5, "0")
}

function parseRegex(pat: string): RegExp|null {
  if (/^\/.+\/[gimuy]*$/.test(pat)) {
    const match = pat.match(/^\/(.+)\/(.*)$/)
    if (!match) return null
    try {
      return new RegExp(match[1], match[2])
    } catch {
      return null
    }
  }
  try {
    return new RegExp(pat)
  } catch {
    return null
  }
}

export const text_read = tool({
  description: "Read a file with token and row numbering, supporting offset/limit/start/end and regex seek.",
  args: {
    filename: tool.schema.string().describe("File path to read (absolute or relative to CWD)"),
    offset: tool.schema.number().optional().describe("Row offset (1-based, optional)"),
    limit: tool.schema.number().optional().describe("Max rows to return (1-100, optional)"),
    start: tool.schema.number().optional().describe("Start row (1-based, optional, inclusive)"),
    end: tool.schema.number().optional().describe("End row (1-based, optional, inclusive)"),
    seek: tool.schema.string().optional().describe("Regex pattern to seek and return rows from first match. Cannot use with start.")
  },
  async execute(args, context) {
    const { filename, offset, limit, start, end, seek } = args
    let absPath = path.isAbsolute(filename) ? filename : path.resolve(process.cwd(), filename)
    let fileExists = true
    let contents: string = ""
    let lines: string[] = []
    try {
      contents = await fs.readFile(absPath, "utf8")
      lines = splitLines(contents)
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        fileExists = false
        lines = []
      } else {
        return frontmatterError({filename: absPath, error: `Could not read file: ${err.message}`})
      }
    }
    const totalRows = lines.length
    let _offset = offset
    let _limit = limit ?? 40
    let _start = start
    let matchIdx: number|undefined = undefined
    let seekUsed = false
    if (seek !== undefined) {
      if (start !== undefined) {
        return frontmatterError({filename: absPath, error: "Cannot use seek with start parameter", seek})
      }
      const re = parseRegex(seek)
      if (!re) {
        return frontmatterError({filename: absPath, error: "Invalid seek regex", seek})
      }
      // Default offset for seek is 1-based (first line)
      const fromOffset = offset !== undefined ? Math.max(Number(offset), 1) : 1
      let toIdx = totalRows
      if (end !== undefined) {
        toIdx = Math.min(totalRows, end)
      }
      for (let i = fromOffset - 1; i < toIdx; i++) {
        if (re.test(lines[i])) {
          matchIdx = i
          break;
        }
      }
      if (matchIdx === undefined) {
        return frontmatterError({filename: absPath, error: "No match found.", token: fileExists?computeSha256(contents):null, seek, offset: fromOffset, limit: _limit})
      }
      _offset = matchIdx + 1;
      seekUsed = true
    }
    const range = getRowRange({ offset: _offset, limit: _limit, start: _start, end: seekUsed ? undefined : end, defaultLimit: 40, maxLimit: 100, totalRows });
    if (range.error) {
      return frontmatterError({filename: absPath, error: range.error, offset: range.offset, limit: range.limit, start: range.start, seek})
    }
    let selected: string[] = [];
    for (let i = 0; i < range.limit; i++) {
      const idx = (range.offset - 1) + i
      if (idx < lines.length) {
        selected.push(lines[idx])
      }
    }
    const token = fileExists ? computeSha256(contents) : null
    // Build YAML frontmatter
    const meta: string[] = [
      `---`,
      `filename: ${absPath}`,
      `token: ${token}`,
      `offset: ${range.offset}`,
      `limit: ${range.limit}`,
      range.start !== undefined ? `start: ${range.start}` : undefined,
      seek !== undefined ? `seek: ${seek}` : undefined,
      `---`
    ].filter(Boolean)
    let numberedRows = selected.map((row, i) => `${padRowNumber(range.offset + i)}|${row}`)
    return [...meta, ...numberedRows].join("\n")
  }
})

interface PatchOp {
  offset?: number
  limit?: number
  start?: number
  end?: number
  rows: string[]
}

interface PatchRequest {
  filename: string
  token: string | null
  patches: PatchOp[]
}

function comparePatchOffsets(a: PatchOp, b: PatchOp): number {
  const ao = a.offset ?? a.start ?? 1
  const bo = b.offset ?? b.start ?? 1
  return ao - bo
}

function detectOverlaps(sortedPatches: (PatchOp & { patchIdx: number, ogStart: number, ogEnd: number })[]): string | null {
  for (let i = 1; i < sortedPatches.length; i++) {
    const prev = sortedPatches[i - 1]
    const curr = sortedPatches[i]
    if (curr.ogStart <= prev.ogEnd) {
      return `Overlapping patches: patch ${prev.patchIdx + 1} (rows ${prev.ogStart}-${prev.ogEnd}) and patch ${curr.patchIdx + 1} (rows ${curr.ogStart}-${curr.ogEnd})`
    }
  }
  return null
}

export const text_patch = tool({
  description: "Apply one or more patches to a file based on offset/limit or start/end, with SHA integrity verification.",
  args: {
    filename: tool.schema.string().describe("File path to patch (absolute or relative to CWD)"),
    token: tool.schema.string().nullable().describe("SHA token from text_read; null for new files"),
    patches: tool.schema.array(
      tool.schema.object({
        offset: tool.schema.number().optional(),
        limit: tool.schema.number().optional(),
        start: tool.schema.number().optional(),
        end: tool.schema.number().optional(),
        rows: tool.schema.array(tool.schema.string())
      })
    ).describe("Array of patch ops: { offset/limit/start/end, rows: [] }"),
  },
  async execute(args, context) {
    const { filename, token, patches } = args as PatchRequest
    const absPath = path.isAbsolute(filename) ? filename : path.resolve(process.cwd(), filename)
    let lines: string[] = []
    let fileExists = true
    let fileText: string = ""
    let fileWasNew = false
    let lineEnding = "\n"
    try {
      fileText = await fs.readFile(absPath, "utf8")
      lines = splitLines(fileText)
      lineEnding = detectLineEnding(fileText)
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        fileExists = false
        lines = []
        lineEnding = "\n"
      } else {
        return frontmatterError({filename: absPath, error: `Could not read file: ${err.message}`})
      }
    }
    if (token !== null) {
      const sha = computeSha256(fileText)
      if (sha !== token) {
        return frontmatterError({filename: absPath, error: "File has changed. Please read the file again.", token})
      }
    } else if (!fileExists) {
      fileWasNew = true
    } else {
      return frontmatterError({filename: absPath, error: "Token is null but file already exists.", token})
    }
    const totalRows = lines.length
    const normalized: (PatchOp & { patchIdx: number, ogStart: number, ogEnd: number, limit: number, offset: number })[] = []
    for (let i = 0; i < patches.length; i++) {
      const patch = patches[i]
      let rng = getRowRange({ ...patch, defaultLimit: 0, maxLimit: 1e6, totalRows })
      if (rng.error) {
        return frontmatterError({filename: absPath, error: `Patch #${i+1}: ${rng.error}`, token})
      }
      let ogStart = rng.offset
      let ogEnd = rng.offset + rng.limit - 1
      if (rng.limit === 0) ogEnd = ogStart - 1
      normalized.push({ ...patch, patchIdx: i, ogStart, ogEnd, limit: rng.limit, offset: rng.offset })
    }
    normalized.sort((a, b) => a.ogStart - b.ogStart)
    const relevantPatches = normalized.filter(p => !(p.ogEnd < p.ogStart))
    const overlapErr = detectOverlaps(relevantPatches)
    if (overlapErr) {
      return frontmatterError({filename: absPath, error: overlapErr, token})
    }
    let patched: string[] = Array.from(lines)
    let shift = 0
    for (const patch of normalized) {
      const origStartIdx = patch.ogStart - 1
      const origLimit = patch.limit
      const insertRows = patch.rows
      const curStartIdx = origStartIdx + shift
      if (patch.limit < 0 || patch.offset < 1) {
        return frontmatterError({filename: absPath, error: `Patch #${patch.patchIdx+1} invalid offset/limit`, token})
      }
      if (patch.limit > 0 && (origStartIdx < 0 || (origStartIdx + origLimit) > (patched.length + 1))) {
        return frontmatterError({filename: absPath, error: `Patch #${patch.patchIdx+1} out of file bounds (rows ${patch.ogStart}-${patch.ogEnd})`, token})
      }
      patched.splice(curStartIdx, origLimit, ...insertRows)
      shift += (insertRows.length - origLimit)
    }
    if (fileWasNew) {
      const parentDir = path.dirname(absPath)
      await fs.mkdir(parentDir, { recursive: true })
    }
    try {
      await fs.writeFile(absPath, patched.join(lineEnding), { encoding: "utf8" })
      if (fileWasNew) {
        return "success: File created successfully"
      }
      return "success: Patches applied successfully"
    } catch (err: any) {
      return frontmatterError({filename: absPath, error: `Could not write file: ${err.message}` , token})
    }
  }
})

const text_patcher_default = tool({
  description: "Handle file reading and writing through operational transforms",
  args: {},
  async execute() {
    return "Text Patcher tool - use text_read or text_patch sub-tools for file operations."
  }
})

export default text_patcher_default
