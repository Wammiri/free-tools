# Changelog

All notable changes to this project are documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Building pack: CLAUDE.md, DISCOVERY.md, DECISIONS.md, BATCH_PLAN.md, SESSION_LOG.md, this changelog.
- B0: Astro static site with React integration and strict TypeScript, all dependencies pinned to exact versions.
- B0: quality gates as scripts: `build`, `check`, `lint`, `test` (Vitest), `e2e` (Playwright, desktop and phone), each with a smoke test.
- B0: `src/config/site.ts` holding brand, author, tip URL, analytics ID and base URL (placeholders until launch).
- B0: public README, MIT licence, .gitignore.
- B1: cleaner core in `src/lib/cleaner/`. Markdown reader (GFM tables, strikethrough, footnotes) and rich HTML reader both produce one clean mdast tree; the paste's format is detected automatically.
- B1: cleanups, each a toggle: em dashes (comma, period, colon or spaced hyphen; colon before a list), hidden characters (emoji sequences kept), blank lines and trailing spaces, curly quotes, emojis in headings and bullets.
- B1: security controls C1 (pasted HTML parsed inert; scripts, styles, event handlers and embedded content dropped) and C2 (only http, https and mailto links survive), each with adversarial tests.
- B1: `tests/fixtures/capture.html`, a local page that saves an AI app's raw clipboard as a test fixture.
