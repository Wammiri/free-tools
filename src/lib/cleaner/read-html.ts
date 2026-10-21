import type { Element, Root as HastRoot } from "hast";
import { fromDom } from "hast-util-from-dom";
import { toMdast } from "hast-util-to-mdast";
import type { Root } from "mdast";
import { normalizeTree } from "./read-markdown";
import type { CleanTree } from "./types";

/**
 * Removed before conversion. hast-util-to-mdast already ignores most of
 * these; removing them here as well means C1 does not rest on one library.
 */
const DROPPED_ELEMENTS =
  "script, style, template, noscript, iframe, frame, frameset, object, embed, link, meta, base, svg, math";

/**
 * Rich text (selected with the mouse) to a clean tree.
 *
 * C1: the paste is parsed with DOMParser into an inert document (no scripts
 * run, nothing loads) and only ever read, never inserted into the page.
 * Scripts, styles and event attributes are dropped; unknown elements become
 * their text. C2 link handling happens in normalizeTree.
 */
export function readHtml(html: string): CleanTree {
  const doc = new DOMParser().parseFromString(html, "text/html");
  for (const element of Array.from(doc.querySelectorAll(DROPPED_ELEMENTS))) element.remove();
  for (const element of Array.from(doc.body.querySelectorAll("*"))) {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.toLowerCase().startsWith("on")) element.removeAttribute(attribute.name);
    }
  }

  const body = fromDom(doc.body) as Element;
  const hast: HastRoot = { type: "root", children: [body] };
  const mdast = toMdast(hast);
  const root: Root = mdast.type === "root" ? mdast : { type: "root", children: [] };
  return normalizeTree(root);
}
