import { describe, it, expect } from "bun:test";
import { website_to_file, get_webpage, get_website, getWebsiteMarkdown } from "../tool/markdown";
import * as fs from "fs";

const TEST_FILE = "./test-output.md";
const PUBLIC_URL = "https://example.com/";

function cleanup() {
  if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);
}

describe("website_to_file", () => {
  it("converts a public HTML page to Markdown and writes to file", async () => {
    await website_to_file.execute({ url: PUBLIC_URL, filename: TEST_FILE });
    const md = fs.readFileSync(TEST_FILE, "utf8");
    expect(md).toMatch(/Example Domain/); // h1 or fallback
    expect(md).toContain("This domain is for use in documentation examples without needing permission");
    expect(md).not.toContain("<script");
    expect(md).not.toContain("<style");
    cleanup();
  });

  it("throws on network error (bad URL)", async () => {
    await expect(website_to_file.execute({ url: "http://localhost:9999/404", filename: TEST_FILE })).rejects.toThrow(/Failed to fetch/);
    cleanup();
  });

  it("throws on file write error (bad path)", async () => {
    await expect(website_to_file.execute({ url: PUBLIC_URL, filename: "/no/such/dir/output.md" })).rejects.toThrow(/Failed to write/);
    cleanup();
  });

  it("produces valid Markdown for headings and paragraphs", async () => {
    await website_to_file.execute({ url: PUBLIC_URL, filename: TEST_FILE });
    const md = fs.readFileSync(TEST_FILE, "utf8");
    expect(md).toMatch(/Example Domain/);
    expect(md).toMatch(/This domain is for use in documentation examples without needing permission/);
    cleanup();
  });
});

describe("get_webpage", () => {
  it("returns Markdown for a public HTML page", async () => {
    const md = await get_webpage.execute({ url: PUBLIC_URL });
    expect(typeof md).toBe("string");
    expect(md).toMatch(/Example Domain/);
    expect(md).toMatch(/This domain is for use in documentation examples without needing permission/);
    expect(md).not.toContain("<script");
    expect(md).not.toContain("<style");
  });

  it("throws on network error (bad URL)", async () => {
    await expect(get_webpage.execute({ url: "http://localhost:9999/404" })).rejects.toThrow(/Failed to fetch/);
  });
});

describe("get_website", () => {
  it("returns Markdown for a public HTML page", async () => {
    const md = await get_website.execute({ url: PUBLIC_URL });
    expect(typeof md).toBe("string");
    expect(md).toMatch(/Example Domain/);
    expect(md).toMatch(/This domain is for use in documentation examples without needing permission/);
    expect(md).not.toContain("<script");
    expect(md).not.toContain("<style");
  });

  it("throws on network error (bad URL)", async () => {
    await expect(get_website.execute({ url: "http://localhost:9999/404" })).rejects.toThrow(/Failed to fetch/);
  });
});
