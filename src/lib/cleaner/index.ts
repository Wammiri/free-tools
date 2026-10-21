import { applyCleanups } from "./cleanups";
import { detectFormat } from "./detect";
import { readHtml } from "./read-html";
import { readMarkdown } from "./read-markdown";
import { DEFAULT_CLEANUPS, type CleanTree, type CleanupOptions, type Paste } from "./types";

/** Any paste, HTML or markdown, to one clean tree. */
export function readPaste(paste: Paste): CleanTree {
  if (detectFormat(paste) === "html" && paste.html !== undefined) return readHtml(paste.html);
  return readMarkdown(paste.text);
}

/** Read the paste, then apply the enabled cleanups. */
export function cleanPaste(paste: Paste, options: CleanupOptions = DEFAULT_CLEANUPS): CleanTree {
  return applyCleanups(readPaste(paste), options);
}

export {
  applyCleanups,
  removeEmojis,
  removeHiddenCharacters,
  replaceEmDashes,
  straightenQuotes,
  tidyWhitespace,
} from "./cleanups";
export { detectFormat } from "./detect";
export { readHtml } from "./read-html";
export { isSafeUrl, readMarkdown } from "./read-markdown";
export * from "./types";
