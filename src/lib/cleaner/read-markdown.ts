import type { Nodes, Paragraph, Parent, Root, Text } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import type { CleanTree } from "./types";

/** Markdown (an AI app's copy button) to a clean tree, with GFM tables and strikethrough. */
export function readMarkdown(markdown: string): CleanTree {
  const tree = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  return normalizeTree(tree);
}

const SAFE_SCHEMES = new Set(["http", "https", "mailto"]);

/**
 * C2: only http, https and mailto links survive. Relative and
 * protocol-relative urls have no scheme, so they are dropped too: pasted
 * from an AI app, they would point at that app's own site.
 */
export function isSafeUrl(url: string): boolean {
  // Browsers ignore control characters and spaces inside a scheme ("java\tscript:"), so read it without them.
  let compact = "";
  for (const char of url) {
    const code = char.charCodeAt(0);
    if (code > 0x20 && code !== 0x7f) compact += char;
  }
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(compact)?.[1];
  return scheme !== undefined && SAFE_SCHEMES.has(scheme.toLowerCase());
}

/** Parents whose children are inline (phrasing) content. */
const PHRASING_PARENTS = new Set(["paragraph", "heading", "tableCell", "emphasis", "strong", "delete", "link"]);

/**
 * Brings a tree from either reader to the CleanTree guarantee (see types.ts):
 * unsafe links become their text, references are resolved, images become
 * their alt text, raw HTML becomes inert text, and positions are dropped so
 * trees from both readers compare equal.
 */
export function normalizeTree(tree: Root): CleanTree {
  const definitions = new Map<string, string>();
  collectDefinitions(tree, definitions);
  delete tree.position;
  normalizeChildren(tree, definitions);
  return tree;
}

function collectDefinitions(node: Nodes, out: Map<string, string>): void {
  if (node.type === "definition") out.set(node.identifier, node.url);
  if ("children" in node) for (const child of node.children) collectDefinitions(child, out);
}

const OPENING_SCRIPT_TAG = /^<(?:script|style)\b[^>]*>$/i;
const CLOSING_SCRIPT_TAG = /^<\/(?:script|style)\s*>$/i;

function normalizeChildren(parent: Parent, definitions: Map<string, string>): void {
  const inPhrasing = PHRASING_PARENTS.has(parent.type);
  const children: Nodes[] = [];
  // Inline `<script>` arrives as an opening tag, text, then a closing tag. Drop all three.
  let insideScript = false;
  for (const child of parent.children as Nodes[]) {
    if (child.type === "html" && OPENING_SCRIPT_TAG.test(child.value.trim())) insideScript = true;
    if (insideScript) {
      if (child.type === "html" && CLOSING_SCRIPT_TAG.test(child.value.trim())) insideScript = false;
      continue;
    }
    children.push(...normalizeNode(child, definitions, inPhrasing));
  }
  parent.children = children as Parent["children"];
}

function normalizeNode(node: Nodes, definitions: Map<string, string>, inPhrasing: boolean): Nodes[] {
  delete node.position;
  switch (node.type) {
    case "definition":
      return [];
    case "link":
      if (!isSafeUrl(node.url)) return unwrap(node, definitions);
      break;
    case "linkReference": {
      const url = definitions.get(node.identifier);
      if (url === undefined || !isSafeUrl(url)) return unwrap(node, definitions);
      return normalizeNode({ type: "link", url, children: node.children }, definitions, inPhrasing);
    }
    case "image":
    case "imageReference":
      return node.alt ? [text(node.alt)] : [];
    case "footnoteReference":
      return [text(`[${node.label ?? node.identifier}]`)];
    case "footnoteDefinition": {
      normalizeChildren(node, definitions);
      const label = text(`[${node.label ?? node.identifier}] `);
      const first = node.children[0];
      if (first?.type === "paragraph") first.children.unshift(label);
      else node.children.unshift({ type: "paragraph", children: [label] });
      return node.children;
    }
    case "html":
      return htmlToNodes(node.value, inPhrasing);
  }
  if ("children" in node) normalizeChildren(node, definitions);
  return [node];
}

function unwrap(node: Parent, definitions: Map<string, string>): Nodes[] {
  return (node.children as Nodes[]).flatMap((child) => normalizeNode(child, definitions, true));
}

const BREAK_TAG = /^<br\s*\/?>$/i;

/** Raw HTML inside markdown is never kept as HTML (C1). A `<br>` stays a line break; anything else keeps only its text. */
function htmlToNodes(value: string, inPhrasing: boolean): Nodes[] {
  if (BREAK_TAG.test(value.trim())) return inPhrasing ? [{ type: "break" }] : [];
  const content = value.replace(/<(script|style)\b[\s\S]*?<\/\1\s*>/gi, "").replace(/<[^>]*>/g, "");
  if (content.trim() === "") return [];
  if (inPhrasing) return [text(content)];
  const paragraph: Paragraph = { type: "paragraph", children: [text(content.trim())] };
  return [paragraph];
}

function text(value: string): Text {
  return { type: "text", value };
}
