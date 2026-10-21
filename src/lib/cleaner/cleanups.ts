import type { Nodes, Parent, Root } from "mdast";
import type { CleanTree, CleanupOptions, EmDashReplacement } from "./types";

/**
 * Where a piece of text sits in its block (paragraph, heading, table cell).
 * A dash or emoji at the very start or end of a block is dropped rather than
 * replaced. Standalone strings count as a whole block.
 */
export interface Edges {
  blockStart: boolean;
  blockEnd: boolean;
}

const WHOLE_BLOCK: Edges = { blockStart: true, blockEnd: true };

// Hidden characters ------------------------------------------------------

/** Zero-width, invisible and bidi control characters. ZWJ is handled separately so emoji sequences survive. */
const INVISIBLE = /[\u200B\u200C\u200E\u200F\u2060-\u2064\uFEFF\u00AD\u180E\u202A-\u202E\u2066-\u2069]/g;

/** A ZWJ is kept only between two emoji (it joins family and profession emoji). */
const STRAY_ZWJ = /(?<!\p{Extended_Pictographic}(?:\p{Emoji_Modifier}|\uFE0F)?)\u200D|\u200D(?!\p{Extended_Pictographic})/gu;

/** Unicode tag characters hide text from readers. Kept only inside a flag sequence (England, Scotland, Wales). */
const TAG_CHARACTERS = /(\u{1F3F4}[\u{E0020}-\u{E007E}]+\u{E007F})|[\u{E0000}-\u{E007F}]/gu;

/** Non-breaking and odd-width spaces become ordinary spaces. */
const ODD_SPACES = /[\u00A0\u2002-\u2007\u2009\u200A\u202F\u205F]/g;

export function removeHiddenCharacters(text: string): string {
  return text
    .replace(TAG_CHARACTERS, (_match: string, flag: string | undefined) => flag ?? "")
    .replace(STRAY_ZWJ, "")
    .replace(INVISIBLE, "")
    .replace(ODD_SPACES, " ");
}

// Curly quotes -----------------------------------------------------------

export function straightenQuotes(text: string): string {
  return text.replace(/[\u2018\u2019\u201A\u201B]/g, "'").replace(/[\u201C\u201D\u201E\u201F]/g, '"');
}

// Emojis -----------------------------------------------------------------

const EMOJI_SOURCE =
  "(?:\\p{Emoji_Presentation}|\\p{Extended_Pictographic}\\uFE0F|[0-9#*]\\uFE0F?\\u20E3|\\p{Regional_Indicator})" +
  "(?:\\p{Emoji_Modifier}|\\uFE0F|[\\u{E0020}-\\u{E007F}]|\\u200D\\p{Extended_Pictographic}\\uFE0F?)*";

/** One or more emoji with the spaces around them. Text-style symbols such as the copyright sign are left alone. */
const EMOJI_RUN = new RegExp(`[ \\t]*(?:${EMOJI_SOURCE})+[ \\t]*`, "gu");

export function removeEmojis(text: string, edges: Edges = WHOLE_BLOCK): string {
  return text.replace(EMOJI_RUN, (match: string, offset: number) => {
    const before = text.slice(0, offset);
    const after = text.slice(offset + match.length);
    if (before === "" && edges.blockStart) return "";
    if (after === "" && edges.blockEnd) return "";
    if (/^[.,;:!?)]/.test(after)) return "";
    return " ";
  });
}

// Em dashes --------------------------------------------------------------

const EM_DASH_RUN = /[ \t\u00A0]*\u2014+[ \t\u00A0]*/g;

const JOINERS: Record<EmDashReplacement, string> = {
  comma: ", ",
  period: ". ",
  colon: ": ",
  hyphen: " - ",
};

/**
 * Replaces em dashes with the chosen joiner (DISCOVERY Q3). A dash that ends
 * a block followed by a list becomes a colon. A dash at the start or end of
 * a block is dropped, one after punctuation is dropped, and one between two
 * digits becomes a hyphen. "period" capitalises the next letter.
 */
export function replaceEmDashes(
  text: string,
  replacement: EmDashReplacement,
  edges: Edges = WHOLE_BLOCK,
  beforeList = false,
): string {
  let result = "";
  let last = 0;
  let capitalise = false;
  for (const match of text.matchAll(EM_DASH_RUN)) {
    const segment = text.slice(last, match.index);
    result += capitalise ? capitaliseFirst(segment) : segment;
    capitalise = false;
    last = match.index + match[0].length;

    const before = text.slice(0, match.index);
    const after = text.slice(last);
    if (after === "" && edges.blockEnd) {
      result += beforeList ? ":" : "";
    } else if (before === "" && edges.blockStart) {
      // Dropped: a leading dash joins nothing.
    } else if (/[.,;:!?]$/.test(before)) {
      result += after === "" ? "" : " ";
    } else if (match[0] === "\u2014" && /\d$/.test(before) && /^\d/.test(after)) {
      result += "-";
    } else {
      result += JOINERS[replacement];
      capitalise = replacement === "period";
    }
  }
  const rest = text.slice(last);
  return result + (capitalise ? capitaliseFirst(rest) : rest);
}

function capitaliseFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Blank lines and trailing spaces ------------------------------------------

/** Trailing spaces before a newline, and runs of three or more newlines. */
export function tidyWhitespace(text: string, edges: Edges = WHOLE_BLOCK): string {
  let tidied = text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  if (edges.blockStart) tidied = tidied.replace(/^\s+/, "");
  if (edges.blockEnd) tidied = tidied.replace(/\s+$/, "");
  return tidied;
}

// The tree pass -------------------------------------------------------------

type PhrasingBlock = Extract<Nodes, { type: "paragraph" | "heading" | "tableCell" }>;

interface Leaf {
  node: Nodes;
  parent: Parent;
}

interface BlockContext {
  /** Inside a heading or a list item, where emoji removal applies. */
  decorative: boolean;
  /** The block is immediately followed by a list. */
  beforeList: boolean;
}

/** Applies the enabled cleanups to a copy of the tree. Code keeps its characters except hidden ones. */
export function applyCleanups(tree: CleanTree, options: CleanupOptions): CleanTree {
  const copy = structuredClone(tree);
  cleanChildren(copy, options, false);
  return copy;
}

function cleanChildren(parent: Root | Parent, options: CleanupOptions, decorative: boolean): void {
  const children = parent.children as Nodes[];
  children.forEach((child, index) => {
    if (isPhrasingBlock(child)) {
      cleanBlock(child, options, {
        decorative: decorative || child.type === "heading",
        beforeList: children[index + 1]?.type === "list",
      });
    } else if (child.type === "code") {
      if (options.hiddenCharacters) child.value = removeHiddenCharacters(child.value);
    } else if ("children" in child) {
      cleanChildren(child, options, decorative || child.type === "listItem");
    }
  });
  if (options.blankLines) {
    parent.children = children.filter((child) => !isEmptyBlock(child)) as Parent["children"];
  }
}

function cleanBlock(block: PhrasingBlock, options: CleanupOptions, context: BlockContext): void {
  let leaves = collectLeaves(block);
  leaves.forEach(({ node }, index) => {
    const edges: Edges = { blockStart: index === 0, blockEnd: index === leaves.length - 1 };
    if (node.type === "inlineCode") {
      if (options.hiddenCharacters) node.value = removeHiddenCharacters(node.value);
      return;
    }
    if (node.type !== "text") return;
    let value = node.value;
    if (options.hiddenCharacters) value = removeHiddenCharacters(value);
    if (options.emojis && context.decorative) value = removeEmojis(value, edges);
    if (options.curlyQuotes) value = straightenQuotes(value);
    if (options.emDashes) value = replaceEmDashes(value, options.emDashReplacement, edges, context.beforeList);
    node.value = value;
  });

  if (!options.blankLines) return;
  leaves = trimEdgeBreaks(leaves);
  leaves.forEach(({ node }, index) => {
    if (node.type !== "text") return;
    const previous = leaves[index - 1]?.node.type;
    const next = leaves[index + 1]?.node.type;
    node.value = tidyWhitespace(node.value, {
      blockStart: index === 0 || previous === "break",
      blockEnd: index === leaves.length - 1 || next === "break",
    });
  });
  for (const { node, parent } of leaves) {
    if (node.type === "text" && node.value === "") remove(node, parent);
  }
}

/** Drops line breaks at the start and end of a block, and keeps at most two in a row (one blank line). */
function trimEdgeBreaks(leaves: Leaf[]): Leaf[] {
  const kept: Leaf[] = [];
  let run = 0;
  for (const leaf of leaves) {
    const isBreak = leaf.node.type === "break";
    const blankText = leaf.node.type === "text" && leaf.node.value.trim() === "";
    run = isBreak ? run + 1 : blankText ? run : 0;
    if ((kept.length === 0 && (isBreak || blankText)) || (isBreak && run > 2)) {
      remove(leaf.node, leaf.parent);
      continue;
    }
    kept.push(leaf);
  }
  while (kept.length > 0 && isBlankLeaf(kept[kept.length - 1] as Leaf)) {
    const leaf = kept.pop() as Leaf;
    remove(leaf.node, leaf.parent);
  }
  return kept;
}

function isBlankLeaf({ node }: Leaf): boolean {
  return node.type === "break" || (node.type === "text" && node.value.trim() === "");
}

function collectLeaves(parent: Parent, out: Leaf[] = []): Leaf[] {
  for (const child of parent.children as Nodes[]) {
    if ("children" in child) collectLeaves(child, out);
    else out.push({ node: child, parent });
  }
  return out;
}

function remove(node: Nodes, parent: Parent): void {
  const index = (parent.children as Nodes[]).indexOf(node);
  if (index !== -1) parent.children.splice(index, 1);
}

function isPhrasingBlock(node: Nodes): node is PhrasingBlock {
  return node.type === "paragraph" || node.type === "heading" || node.type === "tableCell";
}

/** A paragraph or heading holding nothing but whitespace and line breaks. */
function isEmptyBlock(node: Nodes): boolean {
  if (node.type !== "paragraph" && node.type !== "heading") return false;
  return collectLeaves(node).every(
    ({ node: leaf }) => leaf.type === "break" || (leaf.type === "text" && leaf.value.trim() === ""),
  );
}
