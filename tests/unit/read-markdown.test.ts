import type { Link } from "mdast";
import { describe, expect, it } from "vitest";
import { isSafeUrl, readMarkdown } from "../../src/lib/cleaner";
import { DANGEROUS_URLS, MARKDOWN_LINK_ATTACKS, SAFE_URLS } from "../fixtures/adversarial";
import { all, textOf } from "../fixtures/tree";

const SAMPLE = `## Plan

Here is **bold**, *italic* and ~~old~~ text with a [link](https://example.com) and \`code\`.

1. First
2. Second

- Apple
- Pear

| Name | Role |
|---|---|
| Ada | Engineer |

\`\`\`js
const a = 1;
\`\`\`
`;

describe("readMarkdown", () => {
  it("reads every element the writers need", () => {
    const tree = readMarkdown(SAMPLE);
    expect(all(tree, "heading")).toMatchObject([{ depth: 2 }]);
    expect(all(tree, "strong")).toHaveLength(1);
    expect(all(tree, "emphasis")).toHaveLength(1);
    expect(all(tree, "delete")).toHaveLength(1);
    expect(all(tree, "link")).toMatchObject([{ url: "https://example.com" }]);
    expect(all(tree, "inlineCode")).toMatchObject([{ value: "code" }]);
    expect(all(tree, "list")).toMatchObject([{ ordered: true }, { ordered: false }]);
    expect(all(tree, "tableRow")).toHaveLength(2);
    expect(all(tree, "code")).toMatchObject([{ lang: "js", value: "const a = 1;" }]);
  });

  it("drops source positions", () => {
    expect(JSON.stringify(readMarkdown(SAMPLE))).not.toContain('"position"');
  });

  it("resolves reference links to plain links", () => {
    const tree = readMarkdown("See [the docs][d].\n\n[d]: https://example.com/docs");
    expect(all(tree, "linkReference")).toHaveLength(0);
    expect(all(tree, "definition")).toHaveLength(0);
    expect(all(tree, "link")).toMatchObject([{ url: "https://example.com/docs" }]);
  });

  it("turns images into their alt text", () => {
    const tree = readMarkdown("A ![small cat](https://example.com/cat.png) here");
    expect(all(tree, "image")).toHaveLength(0);
    expect(textOf(tree)).toBe("A small cat here");
  });

  it("turns footnotes into bracketed labels", () => {
    const tree = readMarkdown("Claim.[^1]\n\n[^1]: Source.");
    expect(all(tree, "footnoteReference")).toHaveLength(0);
    expect(all(tree, "footnoteDefinition")).toHaveLength(0);
    expect(textOf(tree)).toBe("Claim.[1][1] Source.");
  });

  it("keeps a raw <br> as a line break and drops other raw tags", () => {
    const tree = readMarkdown("One<br>two <b>three</b>");
    expect(all(tree, "html")).toHaveLength(0);
    expect(all(tree, "break")).toHaveLength(1);
    expect(textOf(tree)).toBe("Onetwo three");
  });
});

describe("C2: markdown links", () => {
  it.each(Object.entries(MARKDOWN_LINK_ATTACKS))("%s becomes plain text", (_name, markdown) => {
    const tree = readMarkdown(markdown);
    for (const link of all(tree, "link") as Link[]) expect(isSafeUrl(link.url)).toBe(true);
    expect(all(tree, "html")).toHaveLength(0);
    expect(all(tree, "image")).toHaveLength(0);
    expect(JSON.stringify(tree)).not.toMatch(/"url":"(?:javascript|data|vbscript):/i);
  });

  it("drops inline script content entirely", () => {
    const tree = readMarkdown(MARKDOWN_LINK_ATTACKS["rawHtml"] ?? "");
    expect(textOf(tree)).toBe("Before  afterBlock");
  });

  it("keeps the link text when the link is dropped", () => {
    expect(textOf(readMarkdown(MARKDOWN_LINK_ATTACKS["inline"] ?? ""))).toBe("click");
  });

  it.each(SAFE_URLS)("keeps %s", (url) => {
    expect(all(readMarkdown(`[ok](${url})`), "link")).toMatchObject([{ url }]);
  });
});

describe("isSafeUrl", () => {
  it.each(DANGEROUS_URLS)("rejects %j", (url) => expect(isSafeUrl(url)).toBe(false));
  it.each(SAFE_URLS)("accepts %j", (url) => expect(isSafeUrl(url)).toBe(true));
});
