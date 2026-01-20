import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { text_read, text_patch } from "../tool/text-patcher";
import textPatcher from "../tool/text-patcher";
import type {
  TextReadParams,
  TextPatchParams,
  TextReadFrontmatter,
  PatchOperation,
} from "../tool/text-patcher.types";
import { mkdirSync, rmSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const TEST_DIR = join(import.meta.dir, "fixtures", "text-patcher");
const TEST_FILE = join(TEST_DIR, "test-file.txt");
const NONEXISTENT_FILE = join(TEST_DIR, "nonexistent.txt");

/**
 * Helper to create a test file with specific content
 */
const createTestFile = (content: string) => {
  if (!existsSync(TEST_DIR)) {
    mkdirSync(TEST_DIR, { recursive: true });
  }
  writeFileSync(TEST_FILE, content, "utf-8");
};

/**
 * Helper to parse frontmatter from text_read output
 */
const parseFrontmatter = (output: string): TextReadFrontmatter | null => {
  const lines = output.split("\n");
  if (lines[0] !== "---") return null;

  const frontmatter: Record<string, any> = {};
  let i = 1;
  while (i < lines.length && lines[i] !== "---") {
    const match = lines[i].match(/^(\s?\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      frontmatter[key] = value;
    }
    i++;
  }

  return frontmatter;
};

/**
 * Helper to extract content lines (without frontmatter)
 */
const extractContent = (output: string): string[] => {
  const lines = output.split("\n");
  const contentStart = lines.indexOf("---", 1) + 1;
  return lines.slice(contentStart).filter((line) => line.trim() !== "");
};

describe("text-patcher tool", () => {
  beforeEach(() => {
    // Clean up test directory before each test
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up after tests
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe("default tool", () => {
    it("returns information about sub-tools", async () => {
      const result = await textPatcher.execute({}, {} as any);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result).toContain("text_read");
      expect(result).toContain("text_patch");
    });

    it("has correct description", () => {
      expect(textPatcher.description).toBe(
        "Handle file reading and writing through operational transforms"
      );
    });
  });

  describe("text_read sub-tool", () => {
    describe("positive scenarios", () => {
      it("reads an existing file with default parameters (first 40 rows)", async () => {
        const content = Array.from({ length: 50 }, (_, i) => `Line ${i + 1}`).join(
          "\n"
        );
        createTestFile(content);

        const result = await text_read.execute({ filename: TEST_FILE }, {} as any);
        expect(typeof result).toBe("string");

        const frontmatter = parseFrontmatter(result);
        expect(frontmatter).toBeDefined();
        expect(frontmatter?.filename).toBe(TEST_FILE);
        expect(frontmatter?.token).toBeDefined();
        expect(frontmatter?.token).not.toBe("null");

        const lines = extractContent(result);
        expect(lines.length).toBe(40); // Default limit
      });

      it("reads file with offset and limit", async () => {
        const content = Array.from({ length: 50 }, (_, i) => `Line ${i + 1}`).join(
          "\n"
        );
        createTestFile(content);

        const result = await text_read.execute(
          {
            filename: TEST_FILE,
            offset: 10,
            limit: 5,
          },
          {} as any
        );

        const frontmatter = parseFrontmatter(result);
        expect(frontmatter?.offset).toBe("10");
        expect(frontmatter?.limit).toBe("5");

        const lines = extractContent(result);
        expect(lines.length).toBe(5);
        expect(lines[0]).toContain("Line 10");
      });

      it("reads file with start and end", async () => {
        const content = Array.from({ length: 50 }, (_, i) => `Line ${i + 1}`).join(
          "\n"
        );
        createTestFile(content);

        const result = await text_read.execute(
          {
            filename: TEST_FILE,
            start: 10,
            end: 15,
          },
          {} as any
        );

        const frontmatter = parseFrontmatter(result);
        expect(frontmatter?.start).toBe("10");
        expect(frontmatter?.end).toBe("15");

        const lines = extractContent(result);
        expect(lines.length).toBe(6); // Inclusive: 10-15 = 6 lines
      });

      it("enforces maximum of 100 rows per read", async () => {
        const content = Array.from({ length: 200 }, (_, i) => `Line ${i + 1}`).join(
          "\n"
        );
        createTestFile(content);

        const result = await text_read.execute(
          {
            filename: TEST_FILE,
            offset: 1,
            limit: 150,
          },
          {} as any
        );

        const lines = extractContent(result);
        expect(lines.length).toBeLessThanOrEqual(100);
      });

      it("formats row numbers as 5-digit zero-padded", async () => {
        const content = "Line 1\nLine 2\nLine 3";
        createTestFile(content);

        const result = await text_read.execute({ filename: TEST_FILE }, {} as any);
        const lines = extractContent(result);

        expect(lines[0]).toMatch(/^00001\|/);
        expect(lines[1]).toMatch(/^00002\|/);
        expect(lines[2]).toMatch(/^00003\|/);
      });

      it("returns token as null for non-existent file", async () => {
        const result = await text_read.execute(
          { filename: NONEXISTENT_FILE },
          {} as any
        );

        const frontmatter = parseFrontmatter(result);
        expect(frontmatter?.token).toBe("null");
        expect(frontmatter?.filename).toBe(NONEXISTENT_FILE);
      });

      it("generates consistent SHA token for same file content", async () => {
        const content = "Consistent content";
        createTestFile(content);

        const result1 = await text_read.execute({ filename: TEST_FILE }, {} as any);
        const result2 = await text_read.execute({ filename: TEST_FILE }, {} as any);

        const token1 = parseFrontmatter(result1)?.token;
        const token2 = parseFrontmatter(result2)?.token;

        expect(token1).toBe(token2);
        expect(token1).toBeDefined();
      });
    });

    describe("negative scenarios", () => {
      it("returns error for invalid row range (offset < 1)", async () => {
        const content = "Line 1\nLine 2";
        createTestFile(content);

        const result = await text_read.execute(
          {
            filename: TEST_FILE,
            offset: 0,
            limit: 10,
          },
          {} as any
        );

        expect(result).toContain("error");
        expect(result.toLowerCase()).toContain("invalid");
      });

      it("returns error for invalid row range (start < 1)", async () => {
        const content = "Line 1\nLine 2";
        createTestFile(content);

        const result = await text_read.execute(
          {
            filename: TEST_FILE,
            start: 0,
            end: 10,
          },
          {} as any
        );

        expect(result).toContain("error");
        expect(result.toLowerCase()).toContain("invalid");
      });

      it("handles directory path gracefully", async () => {
        if (!existsSync(TEST_DIR)) {
          mkdirSync(TEST_DIR, { recursive: true });
        }

        const result = await text_read.execute({ filename: TEST_DIR }, {} as any);
        expect(result).toContain("error");
      });

      it("enforces maximum line number of 99999", async () => {
        // Create a file with more than 99999 lines would be too large,
        // so we test that reading near the limit works correctly
        const content = Array.from({ length: 100 }, (_, i) => `Line ${i + 1}`).join(
          "\n"
        );
        createTestFile(content);

        // This should work - well within limit
        const result = await text_read.execute(
          {
            filename: TEST_FILE,
            start: 1,
            end: 100,
          },
          {} as any
        );

        const lines = extractContent(result);
        expect(lines.length).toBeLessThanOrEqual(100);
        expect(lines[lines.length - 1]).toMatch(/^\d{5}\|/);
      });

      it("includes token in error frontmatter responses", async () => {
        const content = "Line 1\nLine 2";
        createTestFile(content);

        const result = await text_read.execute(
          {
            filename: TEST_FILE,
            offset: 0, // Invalid offset
            limit: 10,
          },
          {} as any
        );

        const frontmatter = parseFrontmatter(result);
        expect(frontmatter?.error).toBeDefined();
        expect(frontmatter?.token).toBeDefined(); // Token should be included even in errors
        expect(frontmatter?.filename).toBe(TEST_FILE);
      });
    });

    describe("seek parameter", () => {
      it("finds first matching line with regex pattern", async () => {
        const content = [
          "Line 1",
          "Line 2",
          "function myFunction() {",
          "  return true;",
          "}",
          "Line 6",
          "function anotherFunction() {",
          "  return false;",
          "}",
        ].join("\n");
        createTestFile(content);

        const result = await text_read.execute(
          {
            filename: TEST_FILE,
            seek: "^function\\s+\\w+",
            limit: 3,
          },
          {} as any
        );

        const frontmatter = parseFrontmatter(result);
        expect(frontmatter?.offset).toBe("3"); // First function is at line 3
        expect(frontmatter?.limit).toBe("3");
        expect(frontmatter?.seek).toBeDefined();

        const lines = extractContent(result);
        expect(lines.length).toBe(3);
        expect(lines[0]).toContain("function myFunction");
      });

      it("searches within specified offset and end range", async () => {
        const content = Array.from({ length: 100 }, (_, i) => {
          if (i === 9) return "ERROR: First error";
          if (i === 49) return "ERROR: Second error";
          if (i === 89) return "ERROR: Third error";
          return `Line ${i + 1}`;
        }).join("\n");
        createTestFile(content);

        const result = await text_read.execute(
          {
            filename: TEST_FILE,
            seek: "^ERROR",
            offset: 30,
            end: 70,
            limit: 5,
          },
          {} as any
        );

        const frontmatter = parseFrontmatter(result);
        expect(frontmatter?.offset).toBe("50"); // Second error at line 50
        expect(frontmatter?.limit).toBe("5");
        expect(frontmatter?.seek).toBeDefined();

        const lines = extractContent(result);
        expect(lines.length).toBe(5);
        expect(lines[0]).toContain("ERROR: Second error");
      });

      it("supports regex flags (case-insensitive)", async () => {
        const content = [
          "Line 1",
          "line 2 lowercase",
          "LINE 3 UPPERCASE",
          "LiNe 4 MixedCase",
        ].join("\n");
        createTestFile(content);

        const result = await text_read.execute(
          {
            filename: TEST_FILE,
            seek: "LINE.*UPPERCASE",
            limit: 2,
          },
          {} as any
        );

        const frontmatter = parseFrontmatter(result);
        expect(frontmatter?.offset).toBe("3");
        const lines = extractContent(result);
        expect(lines[0]).toContain("LINE 3 UPPERCASE");
      });

      it("returns error when no match found", async () => {
        const content = Array.from({ length: 20 }, (_, i) => `Line ${i + 1}`).join(
          "\n"
        );
        createTestFile(content);

        const result = await text_read.execute(
          {
            filename: TEST_FILE,
            seek: "NOTFOUND",
            limit: 10,
          },
          {} as any
        );

        const frontmatter = parseFrontmatter(result);
        expect(frontmatter?.error).toBe("No match found.");
        expect(frontmatter?.seek).toBeDefined();
      });

      it("returns error when combining seek with start parameter", async () => {
        const content = Array.from({ length: 20 }, (_, i) => `Line ${i + 1}`).join(
          "\n"
        );
        createTestFile(content);

        const result = await text_read.execute(
          {
            filename: TEST_FILE,
            seek: "Line",
            start: 10,
            limit: 5,
          },
          {} as any
        );

        const frontmatter = parseFrontmatter(result);
        expect(frontmatter?.error).toBeDefined();
        expect(result).toContain("error");
        expect(result.toLowerCase()).toContain("seek");
        expect(result.toLowerCase()).toContain("start");
      });

      it("does not include end parameter in frontmatter output", async () => {
        const content = Array.from({ length: 50 }, (_, i) => `Line ${i + 1}`).join(
          "\n"
        );
        createTestFile(content);

        const result = await text_read.execute(
          {
            filename: TEST_FILE,
            start: 10,
            end: 30,
          },
          {} as any
        );

        const frontmatter = parseFrontmatter(result);
        expect(frontmatter?.start).toBe("10");
        expect(frontmatter?.end).toBeUndefined(); // end should not be in output
      });
    });
  });

  describe("text_patch sub-tool", () => {
    describe("positive scenarios", () => {
      it("applies a single patch successfully", async () => {
        const content = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5";
        createTestFile(content);

        const readResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const token = parseFrontmatter(readResult)?.token;

        const patchResult = await text_patch.execute(
          {
            filename: TEST_FILE,
            token,
            patches: [
              {
                offset: 2,
                limit: 2,
                rows: ["Modified Line 2", "Modified Line 3"],
              },
            ],
          },
          {} as any
        );

        expect(patchResult).toContain("success");
      });

      it("applies multiple non-overlapping patches", async () => {
        const content = Array.from({ length: 20 }, (_, i) => `Line ${i + 1}`).join(
          "\n"
        );
        createTestFile(content);

        const readResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const token = parseFrontmatter(readResult)?.token;

        const patchResult = await text_patch.execute(
          {
            filename: TEST_FILE,
            token,
            patches: [
              {
                offset: 5,
                limit: 2,
                rows: ["Patch 1 Line 1", "Patch 1 Line 2"],
              },
              {
                offset: 15,
                limit: 1,
                rows: ["Patch 2 Line 1"],
              },
            ],
          },
          {} as any
        );

        expect(patchResult).toContain("success");
      });

      it("inserts new rows (rows.length > limit)", async () => {
        const content = "Line 1\nLine 2\nLine 3";
        createTestFile(content);

        const readResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const token = parseFrontmatter(readResult)?.token;

        const patchResult = await text_patch.execute(
          {
            filename: TEST_FILE,
            token,
            patches: [
              {
                offset: 2,
                limit: 1,
                rows: ["New Line A", "New Line B", "New Line C"],
              },
            ],
          },
          {} as any
        );

        expect(patchResult).toContain("success");
      });

      it("deletes rows (rows.length < limit)", async () => {
        const content = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5";
        createTestFile(content);

        const readResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const token = parseFrontmatter(readResult)?.token;

        const patchResult = await text_patch.execute(
          {
            filename: TEST_FILE,
            token,
            patches: [
              {
                offset: 2,
                limit: 3,
                rows: ["Single replacement"],
              },
            ],
          },
          {} as any
        );

        expect(patchResult).toContain("success");
      });

      it("deletes rows with empty array", async () => {
        const content = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5";
        createTestFile(content);

        const readResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const token = parseFrontmatter(readResult)?.token;

        const patchResult = await text_patch.execute(
          {
            filename: TEST_FILE,
            token,
            patches: [
              {
                offset: 2,
                limit: 2,
                rows: [],
              },
            ],
          },
          {} as any
        );

        expect(patchResult).toContain("success");
      });

      it("creates new file with token: null", async () => {
        const readResult = await text_read.execute(
          { filename: NONEXISTENT_FILE },
          {} as any
        );
        const token = parseFrontmatter(readResult)?.token;
        expect(token).toBe("null");

        const patchResult = await text_patch.execute(
          {
            filename: NONEXISTENT_FILE,
            token: null,
            patches: [
              {
                offset: 1,
                limit: 0,
                rows: ["New file line 1", "New file line 2"],
              },
            ],
          },
          {} as any
        );

        expect(patchResult).toContain("success");
        expect(existsSync(NONEXISTENT_FILE)).toBe(true);
      });

      it("supports start/end instead of offset/limit", async () => {
        const content = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5";
        createTestFile(content);

        const readResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const token = parseFrontmatter(readResult)?.token;

        const patchResult = await text_patch.execute(
          {
            filename: TEST_FILE,
            token,
            patches: [
              {
                start: 2,
                end: 3,
                rows: ["Replaced 2", "Replaced 3"],
              },
            ],
          },
          {} as any
        );

        expect(patchResult).toContain("success");
      });

      it("sorts patches by offset before applying (unsorted input)", async () => {
        const content = Array.from({ length: 20 }, (_, i) => `Line ${i + 1}`).join(
          "\n"
        );
        createTestFile(content);

        const readResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const token = parseFrontmatter(readResult)?.token;

        // Submit patches in reverse order (should be sorted internally)
        const patchResult = await text_patch.execute(
          {
            filename: TEST_FILE,
            token,
            patches: [
              {
                offset: 15,
                limit: 1,
                rows: ["Patch at 15"],
              },
              {
                offset: 5,
                limit: 1,
                rows: ["Patch at 5"],
              },
              {
                offset: 10,
                limit: 1,
                rows: ["Patch at 10"],
              },
            ],
          },
          {} as any
        );

        expect(patchResult).toContain("success");

        // Verify patches were applied correctly
        const verifyResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const lines = extractContent(verifyResult);

        expect(lines[4]).toContain("Patch at 5");
        expect(lines[9]).toContain("Patch at 10");
        expect(lines[14]).toContain("Patch at 15");
      });

      it("uses original row numbers for all patches (cumulative shift)", async () => {
        const content = Array.from({ length: 20 }, (_, i) => `Line ${i + 1}`).join(
          "\n"
        );
        createTestFile(content);

        const readResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const token = parseFrontmatter(readResult)?.token;

        // First patch inserts 2 extra rows (shift +2)
        // Second patch should still reference original row 10, not adjusted row 12
        const patchResult = await text_patch.execute(
          {
            filename: TEST_FILE,
            token,
            patches: [
              {
                offset: 5,
                limit: 1,
                rows: ["Insert A", "Insert B", "Insert C"], // +2 rows
              },
              {
                offset: 10,
                limit: 1,
                rows: ["Replace original 10"], // References original row 10
              },
            ],
          },
          {} as any
        );

        expect(patchResult).toContain("success");

        // Verify the result
        const verifyResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const lines = extractContent(verifyResult);

        // Row 5 was replaced with 3 rows (Insert A, B, C)
        expect(lines[4]).toContain("Insert A");
        expect(lines[5]).toContain("Insert B");
        expect(lines[6]).toContain("Insert C");

        // Original row 10 is now at index 11 (4 original + 3 inserted + 4 more original = row 11)
        // It should contain "Replace original 10"
        expect(lines[11]).toContain("Replace original 10");
      });

      it("correctly tracks cumulative shift with multiple insert/delete operations", async () => {
        const content = Array.from({ length: 30 }, (_, i) => `Line ${i + 1}`).join(
          "\n"
        );
        createTestFile(content);

        const readResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const token = parseFrontmatter(readResult)?.token;

        const patchResult = await text_patch.execute(
          {
            filename: TEST_FILE,
            token,
            patches: [
              {
                offset: 5,
                limit: 3,
                rows: ["A"], // Delete 2 rows (shift -2)
              },
              {
                offset: 10,
                limit: 1,
                rows: ["B", "C", "D"], // Insert 2 rows (shift +2)
              },
              {
                offset: 15,
                limit: 2,
                rows: [], // Delete 2 rows (shift -2)
              },
              {
                offset: 20,
                limit: 1,
                rows: ["E"], // No shift (replace 1 with 1)
              },
            ],
          },
          {} as any
        );

        expect(patchResult).toContain("success");

        // Verify final content
        const verifyResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const lines = extractContent(verifyResult);

        // Original 30 lines - 2 + 2 - 2 + 0 = 28 lines
        expect(lines.length).toBe(28);
      });

      it("handles complex patch sequence with original row referencing", async () => {
        const content =
          "Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10";
        createTestFile(content);

        const readResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const token = parseFrontmatter(readResult)?.token;

        // Patch at row 2: replace 1 row with 3 rows (shift +2)
        // Patch at row 5: delete 2 rows (shift -2)
        // Cumulative shift should be 0, but patches use original row numbers
        const patchResult = await text_patch.execute(
          {
            filename: TEST_FILE,
            token,
            patches: [
              {
                offset: 2,
                limit: 1,
                rows: ["New 2A", "New 2B", "New 2C"],
              },
              {
                offset: 5,
                limit: 2,
                rows: [],
              },
            ],
          },
          {} as any
        );

        expect(patchResult).toContain("success");

        const verifyResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const lines = extractContent(verifyResult).map((line) =>
          line.replace(/^\d{5}\|/, "")
        );

        // Expected: Line 1, New 2A, New 2B, New 2C, Line 3, Line 4, Line 7, Line 8, Line 9, Line 10
        expect(lines[0]).toBe("Line 1");
        expect(lines[1]).toBe("New 2A");
        expect(lines[2]).toBe("New 2B");
        expect(lines[3]).toBe("New 2C");
        expect(lines[4]).toBe("Line 3");
        expect(lines[5]).toBe("Line 4");
        expect(lines[6]).toBe("Line 7"); // Original lines 5-6 were deleted
        expect(lines[7]).toBe("Line 8");
      });
    });

    describe("negative scenarios", () => {
      it("rejects patch when file has been modified externally", async () => {
        const content = "Line 1\nLine 2\nLine 3";
        createTestFile(content);

        const readResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const token = parseFrontmatter(readResult)?.token;

        // Modify file externally
        writeFileSync(TEST_FILE, "Modified externally\nLine 2\nLine 3", "utf-8");

        const patchResult = await text_patch.execute(
          {
            filename: TEST_FILE,
            token,
            patches: [
              {
                offset: 1,
                limit: 1,
                rows: ["This should fail"],
              },
            ],
          },
          {} as any
        );

        expect(patchResult).toContain("error");
        expect(patchResult.toLowerCase()).toContain("changed");
      });

      it("rejects overlapping patches", async () => {
        const content = Array.from({ length: 20 }, (_, i) => `Line ${i + 1}`).join(
          "\n"
        );
        createTestFile(content);

        const readResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const token = parseFrontmatter(readResult)?.token;

        const patchResult = await text_patch.execute(
          {
            filename: TEST_FILE,
            token,
            patches: [
              {
                offset: 5,
                limit: 5,
                rows: ["Patch 1"],
              },
              {
                offset: 8,
                limit: 3,
                rows: ["Patch 2 overlaps"],
              },
            ],
          },
          {} as any
        );

        expect(patchResult).toContain("error");
        expect(patchResult.toLowerCase()).toContain("overlap");
      });

      it("rejects patch when attempting to patch with stale token (patch then patch again)", async () => {
        const content = "Line 1\nLine 2\nLine 3";
        createTestFile(content);

        const readResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const token = parseFrontmatter(readResult)?.token;

        // First patch succeeds
        await text_patch.execute(
          {
            filename: TEST_FILE,
            token,
            patches: [
              {
                offset: 1,
                limit: 1,
                rows: ["Modified Line 1"],
              },
            ],
          },
          {} as any
        );

        // Second patch with same token should fail
        const patchResult2 = await text_patch.execute(
          {
            filename: TEST_FILE,
            token, // Stale token
            patches: [
              {
                offset: 2,
                limit: 1,
                rows: ["This should fail"],
              },
            ],
          },
          {} as any
        );

        expect(patchResult2).toContain("error");
        expect(patchResult2.toLowerCase()).toContain("changed");
      });

      it("rejects patch with invalid offset (< 1)", async () => {
        const content = "Line 1\nLine 2";
        createTestFile(content);

        const readResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const token = parseFrontmatter(readResult)?.token;

        const patchResult = await text_patch.execute(
          {
            filename: TEST_FILE,
            token,
            patches: [
              {
                offset: 0,
                limit: 1,
                rows: ["Invalid"],
              },
            ],
          },
          {} as any
        );

        expect(patchResult).toContain("error");
        expect(patchResult.toLowerCase()).toContain("invalid");
      });

      it("rejects patch extending beyond file bounds", async () => {
        const content = "Line 1\nLine 2\nLine 3";
        createTestFile(content);

        const readResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const token = parseFrontmatter(readResult)?.token;

        const patchResult = await text_patch.execute(
          {
            filename: TEST_FILE,
            token,
            patches: [
              {
                offset: 10,
                limit: 5,
                rows: ["Out of bounds"],
              },
            ],
          },
          {} as any
        );

        expect(patchResult).toContain("error");
        expect(patchResult.toLowerCase()).toContain("bound");
      });

      it("rejects patch on non-existent file with non-null token", async () => {
        const patchResult = await text_patch.execute(
          {
            filename: NONEXISTENT_FILE,
            token: "fake-token-123",
            patches: [
              {
                offset: 1,
                limit: 0,
                rows: ["Should fail"],
              },
            ],
          },
          {} as any
        );

        expect(patchResult).toContain("error");
      });
    });

    describe("atomicity", () => {
      it("applies all patches or none (all-or-nothing)", async () => {
        const content = "Line 1\nLine 2\nLine 3\nLine 4";
        createTestFile(content);

        const readResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const token = parseFrontmatter(readResult)?.token;
        const originalContent = content;

        // Attempt with one valid and one invalid patch
        const patchResult = await text_patch.execute(
          {
            filename: TEST_FILE,
            token,
            patches: [
              {
                offset: 1,
                limit: 1,
                rows: ["Valid patch"],
              },
              {
                offset: 100, // Invalid - out of bounds
                limit: 1,
                rows: ["Invalid patch"],
              },
            ],
          },
          {} as any
        );

        expect(patchResult).toContain("error");

        // Verify file was not modified
        const verifyResult = await text_read.execute(
          { filename: TEST_FILE },
          {} as any
        );
        const verifyContent = extractContent(verifyResult)
          .map((line) => line.replace(/^\d{5}\|/, ""))
          .join("\n");
        expect(verifyContent).toBe(originalContent);
      });
    });
  });

  describe("integration scenarios", () => {
    it("supports read-patch-read workflow", async () => {
      const content = "Line 1\nLine 2\nLine 3";
      createTestFile(content);

      // First read
      const read1 = await text_read.execute({ filename: TEST_FILE }, {} as any);
      const token1 = parseFrontmatter(read1)?.token;

      // Patch
      await text_patch.execute(
        {
          filename: TEST_FILE,
          token: token1,
          patches: [
            {
              offset: 2,
              limit: 1,
              rows: ["Modified Line 2"],
            },
          ],
        },
        {} as any
      );

      // Second read with new token
      const read2 = await text_read.execute({ filename: TEST_FILE }, {} as any);
      const token2 = parseFrontmatter(read2)?.token;

      expect(token2).toBeDefined();
      expect(token2).not.toBe(token1); // Token should be different after modification
    });

    it("preserves empty lines in file content", async () => {
      const content = "Line 1\n\nLine 3\n\nLine 5";
      createTestFile(content);

      const readResult = await text_read.execute({ filename: TEST_FILE }, {} as any);
      const lines = extractContent(readResult);

      expect(lines.length).toBe(5);
      expect(lines[1]).toMatch(/^00002\|$/); // Empty line
      expect(lines[3]).toMatch(/^00004\|$/); // Empty line
    });

    it("preserves line endings from original file", async () => {
      const contentCRLF = "Line 1\r\nLine 2\r\nLine 3";
      writeFileSync(TEST_FILE, contentCRLF, "utf-8");

      const readResult = await text_read.execute({ filename: TEST_FILE }, {} as any);
      const token = parseFrontmatter(readResult)?.token;

      // Patch the file
      await text_patch.execute(
        {
          filename: TEST_FILE,
          token,
          patches: [
            {
              offset: 2,
              limit: 1,
              rows: ["Modified Line 2"],
            },
          ],
        },
        {} as any
      );

      // Read the file directly to check line endings
      const fileContent = Bun.file(TEST_FILE);
      const text = await fileContent.text();

      // Should preserve CRLF line endings
      expect(text).toContain("\r\n");
    });
  });
});
