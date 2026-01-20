import { tool } from "@opencode-ai/plugin"
import * as fs from "fs/promises"
import * as path from "path"
import crypto from "crypto"

/**
 * Computes the SHA-256 hash (as hex string) of the supplied file contents.
 * @param contents - File contents (as string)
 * @returns SHA-256 hash in hex
 */
function computeSha256(contents: string): string {
  return crypto.createHash("sha256").update(contents, "utf8").digest("hex")
}

/**
 * Formats the file as an array of rows (for patch/read APIs)
 * @param contents - The full file contents
 * @returns Array of lines as in the file (with line endings removed)
 */
function splitLines(contents: string): string[] {
  return contents.replace(/\r\n?/g, "\n").split("\n")
}

/**
 * Validates and computes the effective (offset, limit) from any combination of (offset/limit) or (start/end), enforced as 1-based inclusive.
 * @param params - Input params
 * @returns offset, limit and errors if any.
 */
function getRowRange(params: { offset?: number, limit?: number, start?: number, end?: number, defaultLimit?: number, maxLimit?: number, totalRows: number }) {
  const { offset, limit, start, end, defaultLimit, maxLimit, totalRows } = params
  let _offset: number = 1
  let _limit: number = defaultLimit ?? 40
  let error: string | null = null

  if (start !== undefined || end !== undefined) {
    if (start !== undefined && start < 1) {
      error = `start must be >= 1`
    } else if (end !== undefined && end < 1) {
      error = `end must be >= 1`
    } else if (start !== undefined && end !== undefined && end < start) {
      error = `end must be >= start`
    } else {
      _offset = start ?? 1
      _limit = (end !== undefined ? ((end - _offset) + 1) : (_limit))
    }
  } else if (offset !== undefined || limit !== undefined) {
    if (offset !== undefined && offset < 1) {
      error = `offset must be >= 1`
    } else if (limit !== undefined && limit < 1) {
      error = `limit must be >= 1`
    } else {
      _offset = offset ?? 1
      _limit = limit ?? defaultLimit ?? 40
    }
  }
  if (_limit > (maxLimit ?? 100)) {
    error = `limit must not exceed ${(maxLimit ?? 100)}`
  }
  // Adjust for file length
  if (_offset > totalRows + 1) {
    error = `Offset/start (${_offset}) exceeds file length (${totalRows})`
  }
  if ((_offset - 1) + _limit > totalRows) {
    _limit = totalRows - (_offset - 1)
  }
  if (_limit < 0) _limit = 0
  return { offset: _offset, limit: _limit, start: start, end: end, error }
}

/**
 * Formats a row number as a zero-padded 5-digit string.
 */
function padRowNumber(n: number): string {
  return n.toString().padStart(5, "0")
}

/**
 * Reads a file and returns frontmatter with SHA token and the selected rows.
 */
export const text_read = tool({
  description: "Read a file with token and row numbering, supporting offset/limit/start/end.",
  args: {
    filename: tool.schema.string().describe("File path to read (absolute or relative to CWD)"),
    offset: tool.schema.number().optional().describe("Row offset (1-based, optional)"),
    limit: tool.schema.number().optional().describe("Max rows to return (1-100, optional)"),
    start: tool.schema.number().optional().describe("Start row (1-based, optional, inclusive)"),
    end: tool.schema.number().optional().describe("End row (1-based, optional, inclusive)"),
  },
  async execute(args, context) {
    const { filename, offset, limit, start, end } = args
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
        return { error: `Could not read file: ${err.message}` }
      }
    }
    const totalRows = lines.length
    const range = getRowRange({ offset, limit, start, end, defaultLimit: 40, maxLimit: 100, totalRows })
    if (range.error) {
      return { error: range.error }
    }
    const selected: string[] = []
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
      range.end !== undefined ? `end: ${range.end}` : undefined,
      `---`
    ].filter(Boolean)
    // Format with line numbers
    let numberedRows = selected.map((row, i) => `${padRowNumber(range.offset + i)}|${row}`)
    return [...meta, ...numberedRows].join("\n")
  }
})

/**
 * Type def for a per-patch operation.
 */
interface PatchOp {
  offset?: number
  limit?: number
  start?: number
  end?: number
  rows: string[]
}

/**
 * Type def for the text_patch tool parameters.
 */
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

/**
 * Detect if any patch ranges overlap (1-based, sorted patch list)
 * Returns error string if overlap found, or null if no overlap.
 */
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

/**
 * Applies multiple row-based patches to the file atomically, verifying SHA token.
 */
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
    try {
      fileText = await fs.readFile(absPath, "utf8")
      lines = splitLines(fileText)
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        fileExists = false
        lines = []
      } else {
        return { success: false, error: `Could not read file: ${err.message}` }
      }
    }
    // If token is not null, verify against file contents
    if (token !== null) {
      const sha = computeSha256(fileText)
      if (sha !== token) {
        return { success: false, error: "File has changed. Please read the file again." }
      }
    } else if (!fileExists) {
      fileWasNew = true
    } else {
      return { success: false, error: "Token is null but file already exists." }
    }
    const totalRows = lines.length
    // Compute effective patch ranges, sort and check overlaps
    const normalized: (PatchOp & { patchIdx: number, ogStart: number, ogEnd: number, limit: number, offset: number })[] = []
    for (let i = 0; i < patches.length; i++) {
      const patch = patches[i]
      // Compute range
      let rng = getRowRange({ ...patch, defaultLimit: 0, maxLimit: 1e6, totalRows })
      if (rng.error) {
        return { success: false, error: `Patch #${i+1}: ${rng.error}` }
      }
      // Compute start/end (1-based, inclusive)
      let ogStart = rng.offset
      let ogEnd = rng.offset + rng.limit - 1
      if (rng.limit === 0) ogEnd = ogStart - 1 // insert or append
      normalized.push({ ...patch, patchIdx: i, ogStart, ogEnd, limit: rng.limit, offset: rng.offset })
    }
    // Sort by offset ASC
    normalized.sort((a, b) => a.ogStart - b.ogStart)
    // Check for overlaps (skip pure inserts/appends where ogEnd < ogStart)
    const relevantPatches = normalized.filter(p => !(p.ogEnd < p.ogStart))
    const overlapErr = detectOverlaps(relevantPatches)
    if (overlapErr) {
      return { success: false, error: overlapErr }
    }
    // Apply all patches atomically
    let patched: string[] = Array.from(lines)
    let shift = 0
    for (const patch of normalized) {
      // Effective indices in current buffer after shift
      const origStartIdx = patch.ogStart - 1
      const origLimit = patch.limit
      const insertRows = patch.rows
      // Adjust start for cumulative shift
      const curStartIdx = origStartIdx + shift
      // If deletion (rows.length == 0): remove origLimit rows at curStartIdx
      // If replace: remove origLimit, insert rows (could be shorter/longer/same)
      // If insert: limit==0, just insert rows at origStartIdx+shift
      // Bounds guards
      if (patch.limit < 0 || patch.offset < 1) {
        return { success: false, error: `Patch #${patch.patchIdx+1} invalid offset/limit` }
      }
      if (patch.limit > 0 && (origStartIdx < 0 || (origStartIdx + origLimit) > (patched.length + 1))) {
        return { success: false, error: `Patch #${patch.patchIdx+1} out of file bounds (rows ${patch.ogStart}-${patch.ogEnd})`}
      }
      patched.splice(curStartIdx, origLimit, ...insertRows)
      shift += (insertRows.length - origLimit)
    }
    try {
      await fs.writeFile(absPath, patched.join("\n"), { encoding: "utf8" })
      if (fileWasNew) {
        return { success: true, message: "File created successfully" }
      }
      return { success: true, message: "Patches applied successfully" }
    } catch (err: any) {
      return { success: false, error: `Could not write file: ${err.message}` }
    }
  }
})

/**
 * The default tool exports info about sub-tools and usage.
 */
const text_patcher_default = tool({
  description: "Text Patcher tool - use text_read or text_patch sub-tools for file operations.",
  args: {},
  async execute() {
    return "Text Patcher tool - use text_read or text_patch sub-tools for file operations."
  }
})

export default text_patcher_default
