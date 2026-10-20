# Decisions

Build decisions for the free-tools site. Portfolio decisions D1–D10 (tips first, daily-use tools only, client-side first, one domain with a path per tool, one codebase with staggered launches, parked ideas, AI text cleaner first, Buy Me a Coffee) live in the private `../DECISIONS.md`. Numbering continues from there.

| # | Decision | Why | Trade-off | Status | Revisit if |
|---|---|---|---|---|---|
| D11 | Five destinations in v1: Plain, WhatsApp, LinkedIn, X, Email or Docs | Clearly better than single-purpose competitors; X and rich text are cheap once the parser exists | More writers to test | Decided 2026-10-19 | Never for v1 |
| D12 | Accept markdown and rich HTML paste, detected automatically | Mouse-selected AI text arrives as HTML; markdown-only would silently fail those users | HTML reader must handle each AI app's markup | Decided 2026-10-19 | Never |
| D13 | Every cleanup is a toggle; em dashes, hidden characters, blank lines on by default; curly quotes and emojis off | Users differ; defaults cover the common case | More UI | Decided 2026-10-19 | Usage shows a default is often switched off |
| D14 | No rewording in v1 | Cannot be done reliably without AI; tool stays deterministic, private and free to run | Misses "Certainly!"-style tells | Decided 2026-10-19 | Users ask for it repeatedly |
| D15 | Tables become row blocks outside rich text | Space-aligned columns break on phones | Less compact | Decided 2026-10-19 | Never |
| D16 | Pasted text in session storage only; settings in local storage | Privacy on shared computers, and survives a refresh | Text lost when tab closes | Decided 2026-10-19 | Users ask for history (would be opt-in) |
| D17 | Astro with React islands | Best long-run fit for many content-plus-widget pages; static output | New framework for Isaac | Decided 2026-10-20 | Astro stagnates or Cloudflare closes it up |
| D18 | Cleaning logic is framework-free TypeScript in `src/lib/cleaner/` | Testable, portable to an extension and to the post previewer | None real | Decided 2026-10-20 | Never |
| D19 | Dependencies: astro, @astrojs/react, react, react-dom, typescript, mdast-util-from-markdown, mdast-util-gfm, micromark-extension-gfm, hast-util-from-dom, hast-util-to-mdast; dev: vitest, @playwright/test, eslint and its TypeScript and Astro plugins | Correct markdown and HTML parsing is a trap to hand-write; all are actively maintained. Exact versions pinned in B0 and listed in package.json | Supply-chain surface | Decided 2026-10-20 (versions pinned in B0) | A package goes unmaintained |
| D20 | Plain CSS with design tokens, no Tailwind | Small site; default answer to a dependency is no | Isaac usually uses Tailwind | Default, flagged for Isaac | Isaac prefers Tailwind (one install, no logic change) |
| D21 | Cloudflare free plan, deployed from GitHub | Unlimited static traffic; commercial use allowed; fits Astro | New dashboard | Decided 2026-10-20 | Cloudflare changes free terms |
| D22 | New umbrella brand, name in `src/config/site.ts` | Aperio serves a different audience | Building a brand from zero | Decided 2026-10-20; name pending | Never |
| D23 | Cloudflare Web Analytics plus Umami (three events, no page views) | Need reuse and tip-click numbers, cookieless | Two tools | Decided 2026-10-20 | Umami exceeds free plan (upgrade or sample) |
| D24 | Public repo, MIT licence | Trust, Show HN, GitHub and AlternativeTo discovery; code ships to browsers anyway | Easier cloning | Decided 2026-10-20 | Never |
| D25 | Repo is `free-tools/site/` only; the idea bank and strategy stay private one folder up, outside git | Strategy and future ideas should not be public | Strategy docs are not backed up by the repo | Default, flagged for Isaac | Isaac wants the strategy backed up (make the parent a private repo that ignores `site/`) |
| D26 | Intent landing pages, one per search family, all using the same widget preset | Search families are distinct; one generic page cannot rank for all; competitors are single-purpose | More copy to write | Decided 2026-10-20 | A page gets no impressions after 3 months (merge it) |
| D27 | Success judged at 3 months on traffic and reuse; tips judged at 6–12 months; AdSense is the fallback | Tips lag traffic and loyalty | AdSense needs a consent tool and can reject thin pages | Decided 2026-10-20 | See DISCOVERY Q12 |
| D28 | AI-native learning principle not applicable | No AI model in the product | None | Decided 2026-10-20 | A rewording or AI feature is added |
| D29 | No "undetectable by AI detectors" claims anywhere | Unprovable; some competitors make it; trust matters more | Loses a hook some searchers want | Decided 2026-10-20 | Never |
