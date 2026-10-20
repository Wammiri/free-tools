# Discovery

Phase 0 for the free-tools site: the AI text cleaner (first tool) and the shared platform every later tool reuses. Grill held 2026-10-19 to 2026-10-20 with Isaac. Portfolio strategy and the idea bank live one folder up (private, not in this repo).

## Weight class

Light. No accounts, no roles, no money handled, no user data stored on a server, no AI in the product. One real security surface: untrusted pasted HTML. A small control matrix covers it (below).

## Why this tool

Free, tip-funded (Buy Me a Coffee), ad-free tools that people reuse daily or weekly. Evidence and the four tests (reopened often, zero cost to serve, no account, a real gap) are in the private STRATEGY.md. Payout through Buy Me a Coffee confirmed working 2026-10-19.

The pain: people paste ChatGPT, Claude and Gemini output into WhatsApp, LinkedIn, X, email and Google Docs. It arrives full of `**asterisks**`, `###` headings, em dashes and hidden characters, and looks AI-written.

## The AI text cleaner

### Q1. Destinations in version 1

All five:

| Destination | Output |
|---|---|
| Plain text | All symbols stripped, clean paragraphs and lists |
| WhatsApp | `*bold*`, `_italic_`, `~strike~`, plain bullets |
| LinkedIn | Unicode bold and italic, bullets as • |
| X | Same as LinkedIn, plus a character count |
| Email or Google Docs | Real rich text via clipboard HTML |

### Q2. Input

Accept both, detected automatically on paste:

- Rich text (HTML), from selecting AI output with the mouse. Used when the clipboard has it.
- Markdown, from an AI app's copy button. Used otherwise.

Architecture: two readers in (HTML, markdown) produce one mdast tree (headings, paragraphs, lists, bold, italic, links, code, tables). Five writers render from it. Tested against real copies from ChatGPT, Claude and Gemini.

### Q3. Cleanups

Every cleanup is a toggle. Toggle choices are remembered in the browser.

| Cleanup | Default |
|---|---|
| Em dashes replaced (comma, period, colon, or spaced hyphen; default comma) | On |
| Hidden characters (zero-width spaces, narrow and odd non-breaking spaces) | On |
| Extra blank lines and trailing spaces | On |
| Curly quotes to straight quotes | Off |
| Emojis in headings and bullets | Off |

Em dash rule: a dash followed by a list becomes a colon; everything else becomes the chosen default. Not perfect, so the preview shows the result before copying.

Out of version 1: rewording ("Certainly!", "I hope this helps", "delve"). The tool is deterministic: it cleans formatting and characters and never changes words. Revisit if users ask, as a separate opt-in feature.

### Q4. Rendering elements a platform does not support

| Element | WhatsApp | LinkedIn and X | Plain | Email or Docs |
|---|---|---|---|---|
| Heading | `*HEADING*` on its own line | Unicode bold on its own line | Heading on its own line | Real heading |
| Link | text: url | text: url | text: url | Real link |
| Code block | Triple-backtick monospace | Plain text, indented | Plain text | Real code block |
| Numbered list | Numbers kept | Numbers kept | Numbers kept | Real list |
| Table | Row blocks | Row blocks | Row blocks | Real table |

Row blocks: each table row becomes a small block. The first column is bold (in the destination's own bold) and the remaining cells become "Header: value" lines. Chosen over space-aligned columns, which break on phones.

Unicode bold and italic read badly in screen readers. The LinkedIn and X outputs show a short note saying so.

### Q5. Saving pasted text

Text survives a refresh only (session storage) and is gone when the tab closes. Settings (destination, toggles, em dash choice) are remembered across visits (local storage). The page says: "Your text never leaves your browser and is gone when you close the tab." Chosen over full autosave because people paste private text on shared and work computers.

Layout: input left and output right on a laptop, stacked on a phone. Destination tabs above the output. One large Copy button. Output appears on paste, with no Convert button.

### Intent landing pages (added after the search check)

The same tool appears on several pages, each preset for one search family, with its own title, how-to and FAQ: for example /chatgpt-to-whatsapp, /remove-em-dashes, /chatgpt-to-google-docs, /linkedin-bold-text, /remove-hidden-characters. The main page is /ai-text-cleaner. Generated from one data file, so adding a page is adding an entry.

## The shared platform

### Q6. Stack

Astro, with React for the interactive tool widgets (islands). Chosen for the long run over Next.js static export (familiar, but heavier, changes often, and static export is a side mode) and Vite plus React (single-page app, weaker for search).

- Pages are plain HTML by default; only the widget loads JavaScript.
- Astro is open source (MIT), acquired by Cloudflare in January 2026, so its development is funded. Output is static files, so no host lock-in.
- The cleaning logic is plain TypeScript in `src/lib/cleaner/` with no framework code. Reusable for a later browser extension and for the post previewer.
- Parsing: unified/mdast family. `mdast-util-from-markdown` plus GFM extensions for markdown; the browser's DOMParser plus `hast-util-from-dom` and `hast-util-to-mdast` for pasted HTML.
- Styling: plain CSS with design tokens (custom properties) and Astro's scoped styles. No Tailwind: the site is small and the default answer to a dependency is no.
- Testing: Vitest for the logic, Playwright for the page.

### Q7. Hosting

Cloudflare, free plan, deployed automatically from GitHub on every push. Unlimited traffic for static sites, so a viral day costs nothing and never takes the site down. Commercial use, including future sponsorships, is allowed.

Vercel Hobby was the alternative. Its fair use guidelines (checked 2026-10-20) say donations are not commercial use. Rejected because the 100 GB monthly limit pauses the site with no pay-as-you-go on the free plan, and sponsorships count as advertising, forcing the $20+ a month Pro plan.

### Q8. Brand

A new umbrella brand, separate from Aperio (different audience). Short, friendly, brandable, no "AI" in the name, ideally a .com bought at cost through Cloudflare. Footer says "Made by Isaac". Name not yet chosen: needed before launch, not before building. The code reads it from one config value (`src/config/site.ts`).

### Q9. Analytics

Two cookieless tools, so no cookie banner.

- **Cloudflare Web Analytics** counts every visit and its source, unlimited, free, enabled from the Cloudflare dashboard.
- **Umami Cloud** (free Hobby plan: 100K events a month, 6 months of history, checked 2026-10-20) receives three events only. Automatic page views are off to save quota.

| Event | When it fires | What it proves |
|---|---|---|
| Returning visitor | Once per day per browser, with a bucket: day 1, days 2–7, week 2+, month 2+. Built from a first-visit date and visit count in local storage, nothing personal | Whether people come back: the core assumption of the strategy |
| Copy clicked | Once per session | The tool was actually used |
| Tip link clicked | Every click | Interest in tipping, compared with Buy Me a Coffee's actual supporters |

Events never carry any pasted text.

### Q10. Open source

Public GitHub repo, MIT licence. The tool runs in the browser, so its code ships to every visitor anyway. The brand, rankings and personal replies to tippers cannot be copied. AGPL rejected: it deters honest contributors more than copycats. No secrets ever go in the code; none are needed.

### Q11. Search demand check

Done by Claude on 2026-10-20 with Google autocomplete and a page-one look. Isaac runs Google Keyword Planner on the phrase list before launch (needs a Google Ads account, to be created then). If volumes are near zero across every phrase, stop and revisit before launch.

Autocomplete confirmed these search families exist:

| Family | Example suggestions |
|---|---|
| Clean AI text | clean chatgpt text, clean chatgpt text free / online, clean chatgpt hidden text, clean chatgpt text watermark, chatgpt cleaner text |
| Em dashes | remove em dashes, remove em dashes from text, remove em dashes chatgpt / claude / online / ai |
| Remove formatting | chatgpt formatting remover, remove chatgpt formatting from text / online, remove markdown from text, remove markdown from chatgpt |
| WhatsApp | chatgpt to whatsapp format |
| Docs and Word | paste chatgpt into google docs, paste chatgpt into word, paste chatgpt table into word |
| LinkedIn | linkedin bold text generator, linkedin bold text formatter, linkedin bold text in post |
| Plain text | chatgpt text to normal text, chatgpt text to human text |

Notable: "watermark" and "hidden text" searches. People believe AI text carries hidden marker characters; the hidden-character cleanup answers that directly, and gets its own landing page. We do not claim to make text "undetectable" by AI detectors; that claim is unprovable and some competitors make it.

Competition found (corrects the 2026-10-17 idea file, which said none handled em dashes or platform formatting):

- ConvertCase Em Dash Remover: a large, established site. Strongest search competitor.
- TOOLJUNCTION AI Text Cleaner: browser-only, separate toggles. Closest to our pitch.
- gptcleanup.com em dash replacer; Undash (Chrome extension); several "ChatGPT watermark remover" tools and extensions.
- mdtochat and markdown-to-whatsapp: ChatGPT and Claude markdown to WhatsApp formatting.
- Unmarkdown, Surmado, CleanTextTools: markdown stripping.

Our edge: one tool for all five destinations, rich-text paste accepted, tables handled, ad-free, open source, and intent pages for each search family. Demand is proven; the gap is narrower than first thought. Decision: proceed.

### Q12. Success criteria

Judged 3 months after launch. Thresholds are informed guesses, not benchmarks; adjust once real numbers exist.

| Result | Meaning | Action |
|---|---|---|
| Green: 5,000+ visitors a month and 15%+ of active users returning in week 2 or later | Traffic plus reuse; strategy confirmed | Keep investing; launch the next tool on schedule |
| Yellow: good traffic, under 15% returning | A one-off tool after all | Find out why (survey, test a history or snippet feature) before building more |
| Red: under 1,000 visitors a month despite Reddit and search work | Not found or not wanted | Stop adding features; fix distribution or revisit the tool choice before tool 2 |

Tips are not a pass/fail number at 3 months: they lag traffic and loyalty. Tips judge at 6–12 months. If traffic is healthy then but tips stay low, switch to AdSense. Known costs of that switch: a certified cookie consent tool for Europe and UK visitors, and possible AdSense rejection of thin tool-only pages (the how-to and FAQ text mitigates this).

## AI-native principle

Not applicable: the product contains no AI model. It is deterministic text processing. Revisit if a rewording feature is ever added.

## Controls

Small, but these are the ones that matter. Each must have its test before its batch is done.

| ID | Control | Risk prevented | Enforced where | Failure behaviour | Test |
|---|---|---|---|---|---|
| C1 | Pasted HTML is never executed or rendered as-is. It is parsed with DOMParser into an inert document, converted to mdast, and all output is generated by our writers with text escaped | Script injection from a malicious clipboard (XSS) | `src/lib/cleaner/read-html.ts`, `write-rich.ts`; no `innerHTML` of pasted content anywhere | Unknown elements become their text; scripts, styles and event attributes are dropped | Fixture with `<script>`, `<img onerror>`, `<style>`, inline handlers: no execution in Playwright, none of it in any output |
| C2 | Links keep only http, https and mailto schemes | `javascript:` and `data:` links smuggled into rich output | `read-html.ts` and `read-markdown.ts` link handling | Other schemes become plain text | Unit tests with `javascript:`, `data:`, `vbscript:` links |
| C3 | Pasted text never leaves the browser | Breaking the privacy promise shown on the page | No network code in the cleaner; analytics payloads carry event name and bucket only; CSP `connect-src` limited to Umami and Cloudflare Insights in `public/_headers` | A request with pasted text is a bug that fails the build's test suite | Playwright intercepts every request during paste, toggle and copy, and asserts no request contains the pasted text |
| C4 | Pasted text is stored only in session storage | Private text lingering on shared computers | Storage module in the widget | Settings only in local storage | Playwright: after paste, local storage holds no input text; a new context has no text |
| C5 | No em dashes in our own product copy | House style breach | Build-output scan | Build test fails | Test scans `dist/` HTML for U+2014 outside the tool's demo examples |
