# Free Tools

Small, free, ad-free tools that run entirely in your browser. Nothing you paste is uploaded. The site is funded by tips, not ads.

The first tool is an AI text cleaner: paste a reply from ChatGPT, Claude or Gemini and get clean text for WhatsApp, LinkedIn, X, email or plain text.

Status: early development, not yet live.

## Run it locally

Needs Node 22.12 or later.

```bash
npm ci
npx playwright install chromium   # once, for the e2e tests
npm run dev                        # http://localhost:4321
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Static build into `dist/` |
| `npm run check` | Astro and TypeScript type check |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run e2e` | Browser tests (Playwright) against the built site |

## Stack

Astro (static output) with React islands for tool widgets, TypeScript strict. Cleaning logic is framework-free TypeScript in `src/lib/cleaner/`. Hosted on Cloudflare.

## Privacy

Tools run client-side. Pasted text stays in your browser tab and is never sent anywhere. Analytics are cookieless and record only anonymous event counts.

## Licence

MIT. See [LICENSE](LICENSE).
