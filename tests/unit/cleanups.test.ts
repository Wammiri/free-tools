import type { Root } from "mdast";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_CLEANUPS,
  applyCleanups,
  readMarkdown,
  removeEmojis,
  removeHiddenCharacters,
  replaceEmDashes,
  straightenQuotes,
  tidyWhitespace,
  type CleanupOptions,
} from "../../src/lib/cleaner";
import { CHAR } from "../fixtures/tree";
import { all, textOf } from "../fixtures/tree";

const D = CHAR.emDash;
const ALL_OFF: CleanupOptions = {
  ...DEFAULT_CLEANUPS,
  emDashes: false,
  hiddenCharacters: false,
  blankLines: false,
  curlyQuotes: false,
  emojis: false,
};

describe("defaults match DISCOVERY Q3", () => {
  it("has em dashes, hidden characters and blank lines on; quotes and emojis off; comma replacement", () => {
    expect(DEFAULT_CLEANUPS).toEqual({
      emDashes: true,
      emDashReplacement: "comma",
      hiddenCharacters: true,
      blankLines: true,
      curlyQuotes: false,
      emojis: false,
    });
  });
});

describe("replaceEmDashes", () => {
  it.each([
    ["comma", `fast ${D} and cheap`, "fast, and cheap"],
    ["comma", `fast${D}and cheap`, "fast, and cheap"],
    ["colon", `one thing ${D} focus`, "one thing: focus"],
    ["hyphen", `one thing ${D} focus`, "one thing - focus"],
    ["period", `it worked ${D} mostly`, "it worked. Mostly"],
  ] as const)("%s: %j", (replacement, input, expected) => {
    expect(replaceEmDashes(input, replacement)).toBe(expected);
  });

  it("handles several dashes and a doubled dash", () => {
    expect(replaceEmDashes(`a ${D} b ${D}${D} c`, "comma")).toBe("a, b, c");
  });

  it("drops a dash at the start or end of a block", () => {
    expect(replaceEmDashes(`${D} Isaac`, "comma")).toBe("Isaac");
    expect(replaceEmDashes(`and so ${D}`, "comma")).toBe("and so");
  });

  it("makes a dash before a list a colon", () => {
    expect(replaceEmDashes(`You need three things ${D}`, "comma", undefined, true)).toBe("You need three things:");
  });

  it("drops a dash that follows punctuation", () => {
    expect(replaceEmDashes(`Wait! ${D} no`, "comma")).toBe("Wait! no");
  });

  it("makes an unspaced dash between digits a hyphen", () => {
    expect(replaceEmDashes(`2020${D}2024`, "comma")).toBe("2020-2024");
  });

  it("keeps a dash mid-sentence when the text continues in another node", () => {
    expect(replaceEmDashes(`Note ${D} `, "comma", { blockStart: true, blockEnd: false })).toBe("Note, ");
  });

  it("leaves text without dashes alone", () => {
    expect(replaceEmDashes("plain - text", "comma")).toBe("plain - text");
  });
});

describe("removeHiddenCharacters", () => {
  it("removes zero-width and invisible characters", () => {
    const dirty = `wa${CHAR.zeroWidthSpace}ter${CHAR.byteOrderMark}mark${CHAR.softHyphen}ed${CHAR.rightToLeftOverride}`;
    expect(removeHiddenCharacters(dirty)).toBe("watermarked");
  });

  it("removes stray zero-width joiners and tag characters", () => {
    expect(removeHiddenCharacters(`a${CHAR.zeroWidthJoiner}b${CHAR.tagA}c`)).toBe("abc");
  });

  it("turns odd spaces into ordinary spaces", () => {
    expect(removeHiddenCharacters(`10${CHAR.nbsp}km at 5${CHAR.narrowNbsp}pm`)).toBe("10 km at 5 pm");
  });

  it("keeps emoji sequences that need joiners and tags", () => {
    for (const emoji of [CHAR.family, CHAR.englandFlag, CHAR.thumbsUpDarkSkin, CHAR.heartWithSelector]) {
      expect(removeHiddenCharacters(`hi ${emoji}`)).toBe(`hi ${emoji}`);
    }
  });
});

describe("straightenQuotes", () => {
  it("straightens single and double curly quotes", () => {
    const curly = `${CHAR.leftDouble}It${CHAR.rightSingle}s ${CHAR.leftSingle}fine${CHAR.rightSingle}${CHAR.rightDouble}`;
    expect(straightenQuotes(curly)).toBe(`"It's 'fine'"`);
  });
});

describe("removeEmojis", () => {
  it("removes leading, trailing and mid-text emoji with their spaces", () => {
    expect(removeEmojis(`${CHAR.rocket} Launch`)).toBe("Launch");
    expect(removeEmojis(`Done ${CHAR.check}`)).toBe("Done");
    expect(removeEmojis(`Go ${CHAR.rocket} now`)).toBe("Go now");
    expect(removeEmojis(`Done ${CHAR.check}.`)).toBe("Done.");
  });

  it("removes whole sequences, not parts", () => {
    for (const emoji of [CHAR.family, CHAR.englandFlag, CHAR.thumbsUpDarkSkin, CHAR.heartWithSelector, CHAR.keycapOne]) {
      expect(removeEmojis(`${emoji} Item`)).toBe("Item");
    }
  });

  it("keeps text-style symbols", () => {
    expect(removeEmojis(`${CHAR.copyright} 2026 Isaac`)).toBe(`${CHAR.copyright} 2026 Isaac`);
  });
});

describe("tidyWhitespace", () => {
  it("removes trailing spaces before newlines and extra blank lines", () => {
    expect(tidyWhitespace("  one  \n\n\n\ntwo   ")).toBe("one\n\ntwo");
  });
});

describe("applyCleanups", () => {
  it("does not change the tree it was given", () => {
    const tree = readMarkdown(`a ${D} b`);
    const before = JSON.stringify(tree);
    applyCleanups(tree, DEFAULT_CLEANUPS);
    expect(JSON.stringify(tree)).toBe(before);
  });

  it("changes nothing with every toggle off", () => {
    const markdown = `# ${CHAR.rocket} Title ${D} sub\n\n${CHAR.leftDouble}quote${CHAR.rightDouble} wa${CHAR.zeroWidthSpace}ter`;
    const tree = readMarkdown(markdown);
    expect(applyCleanups(tree, ALL_OFF)).toEqual(tree);
  });

  it("applies the em dash list rule across blocks", () => {
    const tree = applyCleanups(readMarkdown(`You need ${D}\n\n- one\n- two`), DEFAULT_CLEANUPS);
    expect(textOf(tree)).toBe("You need:onetwo");
  });

  it("replaces dashes split across inline formatting", () => {
    const tree = applyCleanups(readMarkdown(`**Speed** ${D} it is fast`), DEFAULT_CLEANUPS);
    expect(textOf(tree)).toBe("Speed, it is fast");
  });

  it("removes emojis only in headings and bullets", () => {
    const markdown = `## ${CHAR.rocket} Launch\n\n- ${CHAR.check} Ship it\n\nBody ${CHAR.rocket} stays`;
    const tree = applyCleanups(readMarkdown(markdown), { ...DEFAULT_CLEANUPS, emojis: true });
    expect(textOf(all(tree, "heading")[0] as Root)).toBe("Launch");
    expect(textOf(all(tree, "list")[0] as Root)).toBe("Ship it");
    expect(textOf(all(tree, "paragraph")[1] as Root)).toBe(`Body ${CHAR.rocket} stays`);
  });

  it("strips hidden characters from code but leaves its dashes and quotes", () => {
    const markdown = `\`a${CHAR.zeroWidthSpace}${D}\`\n\n\`\`\`\nx = ${CHAR.leftDouble}y${CHAR.rightDouble}${CHAR.zeroWidthSpace}\n\`\`\``;
    const tree = applyCleanups(readMarkdown(markdown), { ...DEFAULT_CLEANUPS, curlyQuotes: true });
    expect(all(tree, "inlineCode")).toMatchObject([{ value: `a${D}` }]);
    expect(all(tree, "code")).toMatchObject([{ value: `x = ${CHAR.leftDouble}y${CHAR.rightDouble}` }]);
  });

  it("removes empty paragraphs and extra line breaks", () => {
    const tree: Root = {
      type: "root",
      children: [
        { type: "paragraph", children: [{ type: "text", value: "  " }, { type: "break" }] },
        {
          type: "paragraph",
          children: [
            { type: "break" },
            { type: "text", value: "one  " },
            { type: "break" },
            { type: "break" },
            { type: "break" },
            { type: "text", value: "two" },
            { type: "break" },
          ],
        },
        { type: "paragraph", children: [{ type: "text", value: CHAR.zeroWidthSpace }] },
      ],
    };
    const cleaned = applyCleanups(tree, DEFAULT_CLEANUPS);
    expect(cleaned.children).toEqual([
      {
        type: "paragraph",
        children: [{ type: "text", value: "one" }, { type: "break" }, { type: "break" }, { type: "text", value: "two" }],
      },
    ]);
  });
});
