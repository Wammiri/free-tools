# Test fixtures

- `capture.html`: open it locally in a browser (double-click). It saves the raw clipboard from an AI app, both `text/html` and `text/plain`, as one JSON file per capture. It never renders the pasted HTML.
- `real/`: the captures, named `<app>-<method>.json` (for example `chatgpt-copy-button.json`). Six expected: ChatGPT, Claude and Gemini, each copied with the copy button and selected with the mouse. Golden tests read these.
- `adversarial.ts`: hostile pastes for controls C1 and C2.
- `tree.ts`: helpers for walking mdast trees in tests, and special characters built from code points so no source file holds an invisible character.

Captures are real AI replies to a harmless prompt. Do not capture anything private: this repo is public.
