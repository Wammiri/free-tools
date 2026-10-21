import type { Root } from "mdast";

/**
 * What the clipboard gave us. `html` is the `text/html` flavour when present,
 * `text` is always the `text/plain` flavour.
 */
export interface Paste {
  html?: string;
  text: string;
}

export type InputFormat = "html" | "markdown";

/** What an em dash becomes. "hyphen" means a spaced hyphen: "a - b". */
export type EmDashReplacement = "comma" | "period" | "colon" | "hyphen";

/** Every cleanup is a toggle (D13). */
export interface CleanupOptions {
  emDashes: boolean;
  emDashReplacement: EmDashReplacement;
  hiddenCharacters: boolean;
  blankLines: boolean;
  curlyQuotes: boolean;
  emojis: boolean;
}

/** Defaults from DISCOVERY Q3. One line each to change. */
export const DEFAULT_CLEANUPS: CleanupOptions = {
  emDashes: true,
  emDashReplacement: "comma",
  hiddenCharacters: true,
  blankLines: true,
  curlyQuotes: false,
  emojis: false,
};

/**
 * The tree both readers produce. It is plain mdast, with a guarantee the
 * readers enforce: no `html`, `image`, `imageReference`, `linkReference`,
 * `definition`, `footnoteReference` or `footnoteDefinition` nodes, and every
 * `link` url is http, https or mailto (C2). Writers can rely on that.
 */
export type CleanTree = Root;
