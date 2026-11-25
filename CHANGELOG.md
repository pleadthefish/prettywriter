# Changelog

## 2026-11-24 — Live Markdown editor

The writing surface is now a CodeMirror 6 editor that renders Markdown as you
type, in the style of Obsidian. Documents are still saved as plain text, exactly
as typed.

- **Inline formatting renders immediately.** `**bold**`, `*italic*`,
  `~~strike~~`, `` `code` `` and `[links](…)` take effect as soon as you type past
  the closing mark. Their symbols come back while the cursor touches them, so you
  can edit them.
- **Line formatting renders off the cursor line.** `#` headings, `>` quotes,
  bullet lists, `---` rules and code fences hide their markers once you leave the
  line.
- **Images show inline** (`![alt](url)`), scaled to the column. With the cursor on
  one, the source shows so you can edit it.
- **⌘-click opens a link** in a new tab. A plain click just places the cursor. Long
  bare URLs are shortened to `domain…` when the cursor isn't on them.
- **Real undo/redo** (⌘Z / ⌘⇧Z) inside the editor.
- **Indented lines stay prose.** Tab or four spaces doesn't make a code block; use
  ``` fences for code.
- **Removed:** the Ctrl+M Markdown preview and the `marked` library. The editor
  replaces them.
- **Fallback:** CodeMirror loads from esm.sh (exact pinned versions). If it can't
  load within 8 seconds (for example, offline), the original plain textarea is
  used, without live Markdown.

Design: `docs/superpowers/specs/2026-11-18-live-markdown-design.md`
Plan: `docs/superpowers/plans/2026-11-18-live-markdown.md`

## v1.0

The localStorage web app: projects and folders, ideas panel with hashtags,
history, film-photo backgrounds, fonts, typing sounds, prompts, and export to
.txt, .md and .html.
