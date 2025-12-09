import { describe, it, expect } from "bun:test";
import { search } from "../tool/demongrep";

describe("demongrep.search", () => {
  it("returns stub output including pattern and path", async () => {
    const pattern = "TODO";
    const path = "src/";
    const result = await search.execute({ pattern, path });
    expect(result).toContain(pattern);
    expect(result).toContain(path);
    expect(result).toMatch(/not yet implemented/);
  });

  it("defaults to project root if path is not provided", async () => {
    const pattern = "FIXME";
    const result = await search.execute({ pattern });
    expect(result).toContain(pattern);
    expect(result).toContain("project root");
    expect(result).toMatch(/not yet implemented/);
  });
});
