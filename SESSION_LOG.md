# Session Log

Appended after every session. Never deleted.

## Session 0: discovery and building pack (2026-10-17 to 2026-10-20)

**What was done**

- Idea bank and strategy written (private, `../`): tip model evidence, the four tests, distribution plan, portfolio decisions D1–D10, idea files.
- Buy Me a Coffee payout confirmed working by Isaac (2026-10-19).
- Phase 0 grill, 12 questions, all answered by Isaac. Results in DISCOVERY.md.
- Search demand check (Google autocomplete plus page-one look). Demand confirmed. Competition is stronger than first recorded; the private idea file was corrected. Intent landing pages added as a result (D26).
- Building pack written: CLAUDE.md, DISCOVERY.md, DECISIONS.md (D11–D29), BATCH_PLAN.md (B0–B6), this log, CHANGELOG.md.

**Verification:** documents only. No code yet.

**Flags for Isaac**

- D20 default: plain CSS, no Tailwind. Confidence high, cost if wrong low (one install). Say if you want Tailwind.
- D25 default: only `site/` is the public repo; strategy and ideas stay private and are not backed up by git. Confidence high, cost if wrong low. Say if you want a private backup repo for the strategy.
- B0 needs your yes before the public GitHub repo is created.
- B1 needs 5 minutes from you: copy real replies from ChatGPT, Claude and Gemini into the capture page.
- Before launch: brand name, domain, Google Ads account for Keyword Planner, Umami account.

**Parked:** nothing.

**Next:** B0, scaffold and gates, in a fresh session.

## Session 1: B0 scaffold and gates (2026-10-20)

**What was done**

- B0.5 (local half first, so every later task got its own commit): `git init` in `site/`, building pack committed.
- B0.1 Astro 7.3.8 static site, React integration, `astro/tsconfigs/strictest`. Every D19 package pinned exactly. Pinning rule and the actual versions recorded as D30; TypeScript held at 6.0.3 (D31); supporting dev packages recorded as D32.
- B0.2 Scripts `check`, `lint`, `test`, `e2e`. ESLint flat config (recommended, typescript-eslint strict, astro recommended). Vitest on `tests/unit/`. Playwright on `tests/e2e/` against the built site (`build` then `preview`), desktop and Pixel 7 projects.
- B0.3 `src/config/site.ts` with placeholders.
- B0.4 Public README, MIT LICENSE (copyright Isaac Wamiri Olorode), .gitignore.
- B0.5 Public repo created at https://github.com/Wammiri/free-tools and pushed, on Isaac's confirmation in the session prompt.

**Verification:** rung 1, all on the untouched scaffold. `npm run build` clean (1 page). `npm run check` 0 errors, 0 warnings, 0 hints. `npm run lint` clean, and proved to bite: a probe `.ts` and a probe `.astro` file with an unused `any` each raised 2 errors (probes deleted). `npm test` 1 passed. `npm run e2e` 2 passed (desktop, phone). A clean `rm -rf node_modules && npm ci` with npm 10 succeeds from the lockfile. Diff scanned for secrets before push: none (the repo needs none).

**Problems hit**

- npm 10.9.7 crashes (`Cannot read properties of null (reading 'edgesOut')`) when adding vitest 5, in its optional peer set. Installed with `npx npm@11`; `npm ci` with npm 10 is fine. Recorded as D33.
- `astro check` flagged `process` in playwright.config.ts (no Node types). Removed the speculative CI branches instead of adding @types/node; there is no CI.
- Playwright's Chromium download took about 30 minutes on this connection. One-time per machine.

**Flags for Isaac**

- **Tailwind (D20) and private strategy backup (D25):** the session prompt left both as unfilled placeholders, so the recorded defaults stand: plain CSS, and no backup repo for the private strategy. Both are cheap to change later. Say if you want either.
- **Repo name:** `Wammiri/free-tools`, because the brand is not chosen yet (D22). Renaming later is one click; GitHub redirects the old URL. Confidence high, cost if wrong low.
- **LICENSE copyright line** uses your full name from git config, Isaac Wamiri Olorode. Say if you want a different name there.
- **B0.6 (yours):** in the Cloudflare dashboard, connect the GitHub repo (Workers or Pages, build command `npm run build`, output `dist/`, Node 22.12 or later). Share the preview URL so it can be logged here.
- **B1 needs your 5 minutes** with the capture page (see BATCH_PLAN B1).

**Parked:** B0.6 pending Isaac. It does not block B1.

**Next:** B1, readers and cleanups, in a fresh session.

## Session 2: B1 readers and cleanups, partial (2026-10-21)

**What was done**

- B1.6 dependency step first: jsdom 30.1.2, @types/mdast 4.0.4, @types/hast 3.0.5 as exact dev pins (D34). jsdom runs per test file through `// @vitest-environment jsdom`, so `vitest.config.ts` was not touched.
- B1.1 `tests/fixtures/capture.html`: pick app and copy method, paste, Save downloads `<app>-<method>.json` holding both clipboard flavours. Displays the paste with `textContent` only. Plus `tests/fixtures/README.md`.
- B1.2 `read-markdown.ts`: markdown with GFM to mdast, and the shared `normalizeTree` both readers use: C2 link allowlist (`isSafeUrl`, strips control characters before reading the scheme), reference links resolved, images to alt text, footnotes to bracketed labels, raw HTML to inert text (inline `<script>` content dropped), positions removed. `types.ts` holds the paste, options and defaults (DISCOVERY Q3) and documents the CleanTree guarantee writers can rely on.
- B1.3 `read-html.ts`: DOMParser into an inert document, script, style, embed and similar elements removed, every `on*` attribute removed, then hast-util-from-dom and hast-util-to-mdast, then `normalizeTree`. The live page is never touched.
- B1.4 `detect.ts`: HTML only when it holds a formatting tag, else markdown (D38).
- B1.5 `cleanups.ts`: pure text functions (`replaceEmDashes`, `removeHiddenCharacters`, `straightenQuotes`, `removeEmojis`, `tidyWhitespace`) plus `applyCleanups`, which works on a copy of the tree with block context (start, end, followed by a list, inside a heading or bullet). Code keeps its dashes and quotes; only hidden characters are stripped from it. `index.ts` exposes `readPaste` and `cleanPaste`.
- B1.6 (adversarial half): 100 unit tests across readers, detection and cleanups.

**Verification:** rung 2. `npm test` 100 passed. C1: 13 hostile HTML pastes (script, img onerror, style, inline handlers, svg onload, iframe, object and embed, template, noscript, body onload, meta refresh, base, form action) checked under jsdom: no payload ran, the live document was unchanged, no forbidden string reached the tree, and the harmless text around each attack survived. C2: 11 dangerous URLs rejected and 4 safe ones kept, through `isSafeUrl`, 9 markdown forms and 5 HTML forms. Proved to bite: making `isSafeUrl` return true failed 23 tests, restored after. The same content read as HTML and as markdown gives an identical tree shape. Capture page checked once in headless Chromium with a scratch script (not committed): a hostile paste did not run or render, and Save produced the expected JSON. `npm run build`, `check` (0 errors, 0 warnings, 0 hints), `lint` and `e2e` (2 passed) all clean. Diff scanned for secrets before push: none.

**Problems hit**

- The file-writing tool turned `\uXXXX` escapes in regex literals into the literal invisible characters. ESLint's `no-irregular-whitespace` caught it. Every non-ASCII character in `cleanups.ts` was converted back to an escape by script, and all `src/` and `tests/` files were confirmed ASCII-only. Tests build special characters with `String.fromCodePoint` (`tests/fixtures/tree.ts`) so this cannot hide in test sources either.

**Flags for Isaac**

- **Your 5 minutes, which now block finishing B1 and starting B2:** open `tests/fixtures/capture.html` (double-click), and for ChatGPT, Claude and Gemini save one copy-button capture and one mouse-selected capture using the prompt on the page. Put the six JSON files in `tests/fixtures/real/`. The repo is public, so use the harmless prompt given.
- **Cloudflare Node version (B0.6):** set it to 22.22.2 or later (or 24). jsdom needs it. With an older Node, `npm ci` only warns, so builds still pass, but match it anyway.
- **Defaults to confirm, all low cost if wrong:** D34 jsdom over happy-dom; D35 relative links become plain text; D36 em dash edge rules (dropped at line start or end, hyphen between digits, capital after "period"); D37 hidden-character scope, notably removing LRM and RLM marks, which could affect right-to-left text; D38 detection heuristic, confidence medium until real captures confirm it.
- **Still open from before:** D20 (Tailwind), D25 (private strategy backup), LICENSE name.

**Parked:** golden tests from real captures (the rest of B1.6), pending the captures. Written up as "Remaining after session 2" under B1 in BATCH_PLAN.

**Next:** finish B1 (real-capture golden tests) in a fresh session once the six captures are in `tests/fixtures/real/`. Then B2.
