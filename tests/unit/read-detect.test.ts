// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { detectFormat, readPaste } from "../../src/lib/cleaner";
import { all } from "../fixtures/tree";

describe("detectFormat", () => {
  it("reads markdown when there is no HTML", () => {
    expect(detectFormat({ text: "**bold**" })).toBe("markdown");
    expect(detectFormat({ text: "**bold**", html: "   " })).toBe("markdown");
  });

  it("reads HTML when it carries formatting", () => {
    expect(detectFormat({ text: "bold", html: "<p><strong>bold</strong></p>" })).toBe("html");
    expect(detectFormat({ text: "Title", html: "<h3>Title</h3>" })).toBe("html");
    expect(detectFormat({ text: "a", html: "<ul><li>a</li></ul>" })).toBe("html");
  });

  it("reads markdown when the HTML is only a wrapper, as from a code editor", () => {
    const editor = `<div style="color: #ccc"><span>**bold** and</span><br><span>## heading</span></div>`;
    expect(detectFormat({ text: "**bold** and\n## heading", html: editor })).toBe("markdown");
  });

  it("does not mistake look-alike tags for formatting", () => {
    expect(detectFormat({ text: "x", html: "<span>x</span><br><img alt=''><abbr>x</abbr>" })).toBe("markdown");
  });

  it("reads HTML when the plain text is empty", () => {
    expect(detectFormat({ text: "", html: "<span>x</span>" })).toBe("html");
  });
});

describe("readPaste", () => {
  it("uses the HTML reader for formatted HTML", () => {
    const tree = readPaste({ text: "**not parsed**", html: "<p><em>parsed</em></p>" });
    expect(all(tree, "emphasis")).toHaveLength(1);
    expect(all(tree, "strong")).toHaveLength(0);
  });

  it("uses the markdown reader otherwise", () => {
    expect(all(readPaste({ text: "**parsed**" }), "strong")).toHaveLength(1);
  });
});
