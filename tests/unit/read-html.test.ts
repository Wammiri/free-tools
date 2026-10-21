// @vitest-environment jsdom
import type { Link } from "mdast";
import { afterEach, describe, expect, it } from "vitest";
import { isSafeUrl, readHtml, readMarkdown } from "../../src/lib/cleaner";
import { FORBIDDEN_IN_OUTPUT, HTML_ATTACKS, HTML_LINK_ATTACKS, SAFE_URLS } from "../fixtures/adversarial";
import { all, shape, textOf } from "../fixtures/tree";

const pwned = globalThis as { __pwned?: unknown };

const SAMPLE_HTML = `<h2>Plan</h2>
<p>Here is <strong>bold</strong>, <em>italic</em> and <del>old</del> text with a <a href="https://example.com">link</a> and <code>code</code>.</p>
<ol><li>First</li><li>Second</li></ol>
<ul><li>Apple</li><li>Pear</li></ul>
<table><thead><tr><th>Name</th><th>Role</th></tr></thead><tbody><tr><td>Ada</td><td>Engineer</td></tr></tbody></table>
<pre><code class="language-js">const a = 1;</code></pre>`;

const SAME_AS_MARKDOWN = `## Plan

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

describe("readHtml", () => {
  it("reads every element the writers need", () => {
    const tree = readHtml(SAMPLE_HTML);
    expect(all(tree, "heading")).toMatchObject([{ depth: 2 }]);
    expect(all(tree, "strong")).toHaveLength(1);
    expect(all(tree, "emphasis")).toHaveLength(1);
    expect(all(tree, "delete")).toHaveLength(1);
    expect(all(tree, "link")).toMatchObject([{ url: "https://example.com" }]);
    expect(all(tree, "list")).toMatchObject([{ ordered: true }, { ordered: false }]);
    expect(all(tree, "tableRow")).toHaveLength(2);
    expect(all(tree, "code")).toMatchObject([{ lang: "js", value: "const a = 1;" }]);
  });

  it("gives the same tree as the markdown of the same content", () => {
    expect(shape(readHtml(SAMPLE_HTML))).toEqual(shape(readMarkdown(SAME_AS_MARKDOWN)));
  });

  it("ignores clipboard wrappers and fragment comments", () => {
    const wrapped = `<html><head><meta charset="utf-8"><title>Copied</title></head><body><!--StartFragment--><p>Only this</p><!--EndFragment--></body></html>`;
    const tree = readHtml(wrapped);
    expect(textOf(tree)).toBe("Only this");
    expect(all(tree, "html")).toHaveLength(0);
  });
});

describe("C1: hostile HTML", () => {
  afterEach(() => {
    delete pwned.__pwned;
  });

  it.each(Object.entries(HTML_ATTACKS))("%s: nothing runs and nothing hostile reaches the tree", async (_name, html) => {
    const before = document.body.innerHTML;
    const tree = readHtml(html);
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(pwned.__pwned).toBeUndefined();
    expect(document.body.innerHTML).toBe(before);
    const serialised = JSON.stringify(tree);
    for (const forbidden of FORBIDDEN_IN_OUTPUT) expect(serialised).not.toContain(forbidden);
    for (const link of all(tree, "link") as Link[]) expect(isSafeUrl(link.url)).toBe(true);
    expect(all(tree, "html")).toHaveLength(0);
    expect(all(tree, "image")).toHaveLength(0);
  });

  it("keeps the harmless text around the attack", () => {
    expect(textOf(readHtml(HTML_ATTACKS["script"] ?? ""))).toBe("Hello");
    expect(textOf(readHtml(HTML_ATTACKS["inlineHandlers"] ?? ""))).toBe("Click me");
  });

  it("turns unknown elements into their text", () => {
    expect(textOf(readHtml("<p><custom-thing>Kept</custom-thing> <marquee>words</marquee></p>"))).toBe("Kept words");
  });
});

describe("C2: HTML links", () => {
  it.each(Object.entries(HTML_LINK_ATTACKS))("%s becomes plain text", (_name, html) => {
    const tree = readHtml(html);
    expect(all(tree, "link")).toHaveLength(0);
    expect(textOf(tree)).toBe("click");
  });

  it.each(SAFE_URLS)("keeps %s", (url) => {
    expect(all(readHtml(`<p><a href="${url}">ok</a></p>`), "link")).toMatchObject([{ url }]);
  });
});
