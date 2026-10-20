import { describe, expect, it } from "vitest";
import { fromMarkdown } from "mdast-util-from-markdown";

// Proves the runner works and a pinned parsing dependency resolves. Real tests start in B1.
describe("smoke", () => {
  it("parses markdown into an mdast tree", () => {
    const tree = fromMarkdown("# Hello");
    expect(tree.children[0]?.type).toBe("heading");
  });
});
