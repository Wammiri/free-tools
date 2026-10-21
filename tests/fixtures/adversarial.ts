/**
 * Hostile pastes for C1 (pasted HTML is never executed or kept as HTML) and
 * C2 (links keep only http, https and mailto). Every payload writes to
 * `window.__pwned` so a test can prove nothing ran.
 */

export const HTML_ATTACKS: Record<string, string> = {
  script: `<p>Hello</p><script>window.__pwned = "script"</script>`,
  imgOnerror: `<p>Hi <img src="x" onerror="window.__pwned = 'img'"></p>`,
  style: `<style>body { display: none }</style><p>Styled</p>`,
  inlineHandlers: `<p onclick="window.__pwned = 'click'" onmouseover="window.__pwned = 'hover'">Click me</p>`,
  svgOnload: `<svg onload="window.__pwned = 'svg'"><script>window.__pwned = 'svg script'</script></svg><p>After</p>`,
  iframe: `<iframe src="javascript:window.__pwned = 'iframe'"></iframe><p>Frame</p>`,
  objectEmbed: `<object data="javascript:window.__pwned = 'object'"></object><embed src="javascript:window.__pwned = 'embed'"><p>Plugins</p>`,
  template: `<template><img src="x" onerror="window.__pwned = 'template'"></template><p>Template</p>`,
  noscript: `<noscript><img src="x" onerror="window.__pwned = 'noscript'"></noscript><p>Noscript</p>`,
  bodyOnload: `<body onload="window.__pwned = 'body'"><p>Body</p></body>`,
  metaRefresh: `<meta http-equiv="refresh" content="0;url=javascript:window.__pwned = 'meta'"><p>Meta</p>`,
  base: `<base href="javascript:window.__pwned = 'base'//"><p><a href="page">Relative</a></p>`,
  formAction: `<form action="javascript:window.__pwned = 'form'"><button>Go</button></form><p>Form</p>`,
};

/** Strings that must not appear anywhere in a tree read from HTML_ATTACKS. */
export const FORBIDDEN_IN_OUTPUT = ["__pwned", "<script", "onerror", "onclick", "onload", "javascript", "display: none"];

/** Link targets that must become plain text. */
export const DANGEROUS_URLS = [
  "javascript:window.__pwned = 1",
  "JaVaScRiPt:window.__pwned = 1",
  "  javascript:window.__pwned = 1",
  "java\tscript:window.__pwned = 1",
  "java\nscript:window.__pwned = 1",
  "data:text/html;base64,PHNjcmlwdD53aW5kb3cuX19wd25lZD0xPC9zY3JpcHQ+",
  "vbscript:msgbox(1)",
  "file:///etc/passwd",
  "//evil.example/path",
  "/relative/path",
  "#anchor",
];

/** Link targets that must survive unchanged. */
export const SAFE_URLS = ["https://example.com/a?b=c#d", "http://example.com", "mailto:someone@example.com", "HTTPS://EXAMPLE.COM"];

/** Dangerous links written the ways markdown allows. */
export const MARKDOWN_LINK_ATTACKS: Record<string, string> = {
  inline: "[click](javascript:window.__pwned=1)",
  mixedCase: "[click](JaVaScRiPt:window.__pwned=1)",
  entity: "[click](javascript&#58;window.__pwned=1)",
  data: "[click](data:text/html;base64,PHNjcmlwdD4=)",
  vbscript: "[click](vbscript:msgbox)",
  autolink: "<javascript:window.__pwned=1>",
  reference: "[click][r]\n\n[r]: javascript:window.__pwned=1",
  image: "![alt text](javascript:window.__pwned=1)",
  rawHtml: "Before <script>window.__pwned=1</script> after\n\n<div onclick=\"window.__pwned=1\">Block</div>",
};

/** Dangerous links written as HTML. */
export const HTML_LINK_ATTACKS: Record<string, string> = {
  javascript: `<a href="javascript:window.__pwned=1">click</a>`,
  encodedTab: `<a href="java&#x09;script:window.__pwned=1">click</a>`,
  entityColon: `<a href="javascript&colon;window.__pwned=1">click</a>`,
  data: `<a href="data:text/html;base64,PHNjcmlwdD4=">click</a>`,
  vbscript: `<a href="vbscript:msgbox(1)">click</a>`,
};
