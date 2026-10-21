import type { InputFormat, Paste } from "./types";

/**
 * Tags that carry formatting the plain-text flavour cannot. HTML with none
 * of them (a code editor's spans, a bare `<div>` wrapper) adds nothing, so
 * the plain text is read as markdown instead. Add a tag here to change that.
 */
const FORMATTING_TAG =
  /<(?:strong|b|em|i|u|s|del|strike|h[1-6]|ul|ol|li|table|tr|td|th|a|code|pre|blockquote|hr)\b/i;

/** HTML when the clipboard has formatted HTML, otherwise markdown (DISCOVERY Q2). */
export function detectFormat(paste: Paste): InputFormat {
  const html = paste.html?.trim() ?? "";
  if (html === "") return "markdown";
  if (paste.text.trim() === "") return "html";
  return FORMATTING_TAG.test(html) ? "html" : "markdown";
}
