import type { Nodes } from "mdast";

/** Shared test helpers for walking mdast trees. */

export function all(tree: Nodes, type: string): Nodes[] {
  const found: Nodes[] = [];
  const walk = (node: Nodes): void => {
    if (node.type === type) found.push(node);
    if ("children" in node) for (const child of node.children) walk(child);
  };
  walk(tree);
  return found;
}

/** Every text, inline code and code value, joined. */
export function textOf(tree: Nodes): string {
  if ("value" in tree && (tree.type === "text" || tree.type === "inlineCode" || tree.type === "code")) {
    return tree.value;
  }
  if ("children" in tree) return tree.children.map((child) => textOf(child)).join("");
  return "";
}

/** The parts of a tree a writer cares about, so trees from both readers can be compared. */
export function shape(node: Nodes): unknown {
  const out: Record<string, unknown> = { type: node.type };
  if ("value" in node) out["value"] = node.value;
  if (node.type === "link") out["url"] = node.url;
  if (node.type === "heading") out["depth"] = node.depth;
  if (node.type === "list") out["ordered"] = node.ordered;
  if (node.type === "code") out["lang"] = node.lang;
  if ("children" in node) out["children"] = node.children.map((child) => shape(child));
  return out;
}

/** Special characters, built from code points so no source file holds an invisible one. */
export const CHAR = {
  emDash: String.fromCodePoint(0x2014),
  zeroWidthSpace: String.fromCodePoint(0x200b),
  zeroWidthJoiner: String.fromCodePoint(0x200d),
  byteOrderMark: String.fromCodePoint(0xfeff),
  softHyphen: String.fromCodePoint(0x00ad),
  nbsp: String.fromCodePoint(0x00a0),
  narrowNbsp: String.fromCodePoint(0x202f),
  rightToLeftOverride: String.fromCodePoint(0x202e),
  tagA: String.fromCodePoint(0xe0041),
  leftSingle: String.fromCodePoint(0x2018),
  rightSingle: String.fromCodePoint(0x2019),
  leftDouble: String.fromCodePoint(0x201c),
  rightDouble: String.fromCodePoint(0x201d),
  rocket: String.fromCodePoint(0x1f680),
  check: String.fromCodePoint(0x2705),
  heartWithSelector: String.fromCodePoint(0x2764, 0xfe0f),
  thumbsUpDarkSkin: String.fromCodePoint(0x1f44d, 0x1f3ff),
  family: String.fromCodePoint(0x1f468, 0x200d, 0x1f469, 0x200d, 0x1f467),
  englandFlag: String.fromCodePoint(0x1f3f4, 0xe0067, 0xe0062, 0xe0065, 0xe006e, 0xe0067, 0xe007f),
  keycapOne: String.fromCodePoint(0x31, 0xfe0f, 0x20e3),
  copyright: String.fromCodePoint(0x00a9),
};
