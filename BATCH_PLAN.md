# Batch Plan

One batch per fresh session. Read DECISIONS.md, SESSION_LOG.md, then this file. Consult DISCOVERY.md for intent and its Controls table before touching anything a control covers.

Order is by dependency: setup, then logic, then the page, then the site around it, then analytics, then launch.

## Status

| Batch | Name | Status | Depends on | Blocked by |
|---|---|---|---|---|
| B0 | Scaffold and gates | Not started | None | Isaac confirms creating the public GitHub repo |
| B1 | Readers and cleanups | Not started | B0 | Isaac captures real AI copies (5 minutes, see B1) |
| B2 | Five writers | Not started | B1 | None |
| B3 | Cleaner widget and page | Not started | B2 | None |
| B4 | Site shell, intent pages and SEO | Not started | B3 | None (final copy waits for Keyword Planner in B6) |
| B5 | Analytics | Not started | B3 | Isaac: Umami account and website ID; enable Cloudflare Web Analytics |
| B6 | Launch | Not started | B4, B5 | Isaac: brand name, domain purchase, Keyword Planner volumes |

## B0. Scaffold and gates

Goal: an empty Astro site where every gate runs clean before real work starts.

Tasks:

- B0.1 Scaffold Astro with TypeScript (strict) and the React integration. Pin exact versions of every D19 package.
- B0.2 Scripts: `build`, `check` (astro check), `lint`, `test` (Vitest), `e2e` (Playwright). One smoke unit test and one smoke e2e test on a placeholder page.
- B0.3 `src/config/site.ts` with placeholders: brand name, tagline, author "Isaac", Buy Me a Coffee URL, Umami website ID (empty), base URL.
- B0.4 README.md (public), LICENSE (MIT), .gitignore, CLAUDE.md already present.
- B0.5 git init, first commit with the building pack. After Isaac confirms: create the public GitHub repo and push.
- B0.6 Human gate: Isaac connects the repo to Cloudflare (Workers or Pages, static build `npm run build`, output `dist/`) and shares the preview URL. Record it in SESSION_LOG.

Files: `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `eslint.config.js`, `vitest.config.ts`, `playwright.config.ts`, `src/config/site.ts`, `src/pages/index.astro` (placeholder), `tests/unit/smoke.test.ts`, `tests/e2e/smoke.spec.ts`, `README.md`, `LICENSE`, `.gitignore`, pack files.

Verification: rung 1. Every script runs clean on the untouched scaffold.

## B1. Readers and cleanups

Goal: any pasted AI text, markdown or HTML, becomes one clean mdast tree.

Human step first: Isaac opens `tests/fixtures/capture.html` locally (built in this batch), and for each of ChatGPT, Claude and Gemini pastes one reply copied with the copy button and one selected with the mouse. The page saves the raw clipboard (HTML and plain) as fixture files. Ask for replies that include a heading, bold, a list, a link, a table and an em dash.

Tasks:

- B1.1 `capture.html` fixture tool.
- B1.2 `read-markdown.ts`: markdown to mdast with GFM (tables, strikethrough).
- B1.3 `read-html.ts`: DOMParser to hast to mdast. Drops scripts, styles, event attributes (C1). Link scheme allowlist (C2).
- B1.4 `detect.ts`: choose HTML or markdown from the paste.
- B1.5 `cleanups.ts`: em dash rule with replacement choice, hidden characters, blank lines and trailing spaces, curly quotes, emojis. Each is a pure function with an on or off option.
- B1.6 Golden tests from the real fixtures, plus adversarial fixtures for C1 and C2.

Files: `src/lib/cleaner/types.ts`, `read-markdown.ts`, `read-html.ts`, `detect.ts`, `cleanups.ts`, `index.ts`, `tests/fixtures/*`, `tests/unit/read-*.test.ts`, `tests/unit/cleanups.test.ts`.

Verification: rung 2. Golden and adversarial tests pass. The HTML reader runs under Vitest with a DOM environment (happy-dom or jsdom; this is a dev dependency decision to record).

## B2. Five writers

Goal: one mdast tree renders correctly for every destination.

Tasks:

- B2.1 `write-plain.ts`.
- B2.2 `write-whatsapp.ts`: `*bold*`, `_italic_`, `~strike~`, triple-backtick code, headings as bold lines.
- B2.3 `write-social.ts`: LinkedIn and X, Unicode bold and italic mapping in `unicode.ts`, bullets as •, X character count.
- B2.4 `write-rich.ts`: HTML for Email and Docs, all text escaped (C1).
- B2.5 `tables.ts`: row blocks per DISCOVERY Q4.
- B2.6 Golden tests: every fixture through every writer, snapshots reviewed by eye once, then locked.

Files: `src/lib/cleaner/write-*.ts`, `unicode.ts`, `tables.ts`, `index.ts`, `tests/unit/write-*.test.ts`, snapshot files.

Verification: rung 2.

## B3. Cleaner widget and page

Goal: the tool works in a browser, on a laptop and a phone.

Tasks:

- B3.1 React island `CleanerApp.tsx`: paste handling (reads `text/html` then `text/plain`), live output, destination tabs, toggles, em dash choice, Copy button (plain text, plus `text/html` for Email and Docs).
- B3.2 Storage: input in session storage, settings in local storage (C4).
- B3.3 Page `/ai-text-cleaner` with base layout, privacy line, screen reader note for Unicode outputs.
- B3.4 The small things: favicon (SVG), title and description, theme colour, visible focus styles, refresh starts at top with anchor links still working.
- B3.5 Playwright: paste HTML and markdown, switch tabs, toggle, copy, refresh, phone viewport, keyboard-only use, C1, C3 and C4 tests.

Files: `src/components/CleanerApp.tsx`, `src/components/cleaner/*`, `src/layouts/BaseLayout.astro`, `src/pages/ai-text-cleaner.astro`, `src/styles/global.css`, `public/favicon.svg`, `tests/e2e/cleaner.spec.ts`.

Verification: rung 3.

## B4. Site shell, intent pages and SEO

Goal: a site people can find and want to tip.

Tasks:

- B4.1 Home page listing tools (one for now), header, footer with "Made by Isaac", open source link.
- B4.2 Tip link component with the message "Free and ad-free, built by one person. If it helps you, buy me a coffee."
- B4.3 Intent pages from `src/content/intents.ts`: /chatgpt-to-whatsapp, /remove-em-dashes, /chatgpt-to-google-docs, /linkedin-bold-text, /remove-hidden-characters. Each presets the widget and has its own title, description, how-to and FAQ, written from the DISCOVERY Q11 phrases. Draft copy now; final wording after Keyword Planner in B6.
- B4.4 Sitemap, robots.txt, canonical URLs, Open Graph tags, JSON-LD (WebApplication and FAQPage).
- B4.5 `public/_headers`: CSP (C3), security headers.
- B4.6 Build-output scan for em dashes (C5).

Files: `src/pages/index.astro`, `src/pages/[intent].astro`, `src/content/intents.ts`, `src/components/TipLink.astro`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `public/robots.txt`, `public/_headers`, `astro.config.mjs` (sitemap), `tests/unit/build-scan.test.ts`, `tests/e2e/site.spec.ts`.

Verification: rung 3, plus the build scan.

## B5. Analytics

Goal: we can see visitors, reuse and tip clicks, and nothing private is sent.

Human steps: Isaac enables Cloudflare Web Analytics for the site in the Cloudflare dashboard, creates an Umami Cloud account and website, and gives the website ID (public, goes in `site.ts`).

Tasks:

- B5.1 `src/lib/analytics/events.ts`: returning-visitor bucket (once per day), copy clicked (once per session), tip clicked. Umami automatic page views off.
- B5.2 Wire events into the widget and tip link.
- B5.3 CSP update for Umami.
- B5.4 Tests: bucket logic (unit); Playwright intercepts and asserts payloads hold only event name and bucket (C3).

Files: `src/lib/analytics/events.ts`, `src/config/site.ts`, `src/layouts/BaseLayout.astro`, `src/components/CleanerApp.tsx`, `src/components/TipLink.astro`, `public/_headers`, `tests/unit/events.test.ts`, `tests/e2e/analytics.spec.ts`.

Verification: rung 3, then rung 4 by Isaac (events visible in Umami from the preview URL).

## B6. Launch

Blocked until Isaac has: the brand name, the domain bought on Cloudflare, Keyword Planner volumes for the DISCOVERY Q11 phrases.

Tasks:

- B6.1 Brand name and base URL in `site.ts`; custom domain connected (Isaac in the dashboard).
- B6.2 Final page titles, descriptions and FAQ wording using the highest-volume phrases.
- B6.3 Full pass of the per-launch checklist in the private DISTRIBUTION.md.
- B6.4 Drafts for Isaac to post: Reddit posts for 2–3 subreddits (after reading their rules), Product Hunt, Show HN, AlternativeTo listing text.

Files: `src/config/site.ts`, `src/content/intents.ts`, `src/pages/*.astro` copy only, `launch/` drafts folder.

Verification: rung 3 on the live domain, rung 4 for analytics.

## Session prompt template

```
Read the onboarding files first: DECISIONS.md, SESSION_LOG.md, BATCH_PLAN.md.
Consult DISCOVERY.md for product intent and its Controls table if this batch touches them.

[Any decisions or status that are not yet in the files, stated explicitly.]

Batch: [ID]
Tasks: [IDs]
Files to touch, only these: [paths]. Call sites of any renamed shared function included.

Follow the protocol: bounded file list, the verification ladder (state which rung),
build and lint before commit, one commit per task as type(scope): ID description,
push at the end, update SESSION_LOG, CHANGELOG and BATCH_PLAN status.

Stop before anything outward-facing (creating repos, publishing) and flag me.
Flag any new env var or account step for me. Label any legal or policy text DRAFT.
For any ambiguity, pick a sensible default, isolate it as a one-line switch, and flag it.

One batch only. Stop and report when done or paused.
```
