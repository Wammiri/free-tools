# Free tools site

Free, ad-free, tip-funded browser tools on one domain. First tool: the AI text cleaner. Owner: Isaac. Follows the global building methodology.

## Onboarding read order

1. DECISIONS.md
2. SESSION_LOG.md
3. BATCH_PLAN.md
4. DISCOVERY.md when the batch touches product intent, and always its Controls table before touching anything a control covers (pasted HTML, links, network, storage, product copy).

Private strategy and the idea bank live one folder up (`../`), outside this public repo. Never copy them into the repo.

## Stack

- Astro (static output) with React islands for tool widgets. TypeScript strict.
- Cleaning logic: framework-free TypeScript in `src/lib/cleaner/`. Never import React or Astro there.
- Parsing: unified/mdast (`mdast-util-from-markdown` with GFM, `hast-util-from-dom`, `hast-util-to-mdast`).
- Styling: plain CSS with tokens in `src/styles/global.css` and Astro scoped styles.
- Tests: Vitest (`tests/unit/`), Playwright (`tests/e2e/`).
- Hosting: Cloudflare, auto-deploy from GitHub. Analytics: Cloudflare Web Analytics plus Umami (three events only).

## Rules

- **This repo is public.** No secrets, ever. Nothing needs one: analytics IDs are public by design. Scan the diff before every push.
- **Pasted text never leaves the browser.** No network code in the cleaner. Analytics payloads carry an event name and a bucket only.
- **Never render pasted HTML.** Parse it inert, convert to mdast, generate all output from our writers with text escaped.
- **No em dashes in product copy.** Enforced by the build-output scan.
- **No "undetectable by AI detectors" claims.**
- **Brand name, author, tip URL and analytics IDs come from `src/config/site.ts` only.** Never hard-code them elsewhere.
- **Dependencies are decisions.** Record any new package in DECISIONS.md with why, and pin the exact version.

## Protocol

One batch per fresh session. Bounded file list from BATCH_PLAN.md. State the verification rung. One commit per task: `type(scope): ID description`. Push at the end. Update SESSION_LOG.md, CHANGELOG.md and BATCH_PLAN.md status, then stop.

Stop and flag Isaac for: creating or publishing anything outward-facing, Cloudflare or Umami dashboard steps, domain purchase, brand name, and any product decision.
