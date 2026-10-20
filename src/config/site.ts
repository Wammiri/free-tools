// The only place brand, author, tip and analytics values live (see CLAUDE.md).
// Placeholders until launch: brand name and base URL are set in B6, the Umami ID in B5.
// Every value here is public by design. Never put a secret in this file.

export const site = {
  brandName: "Free Tools",
  tagline: "Small, free, ad-free tools that run in your browser.",
  author: "Isaac",
  tipUrl: "https://buymeacoffee.com/REPLACE_ME",
  umamiWebsiteId: "",
  baseUrl: "https://example.com",
} as const;

export type SiteConfig = typeof site;
