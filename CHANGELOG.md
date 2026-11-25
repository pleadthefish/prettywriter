# Changelog

## 2026-11-25 — Find (⌘F), and fullscreen moves to ⌃⌘F

- **⌘F opens Find** at the top of the editor, the way it does everywhere else. It
  searches the whole document (the browser's own find only saw the part on screen),
  with match case, regular expressions, whole words, and Replace / Replace all.
  ⌘G and ⌘⇧G go to the next and previous match; ⌘F again or Esc closes it.
- **Fullscreen is now ⌃⌘F,** the macOS standard, so ⌘F can be Find.

## 2026-11-25 — Notes section that keeps itself

- **Typing a reference by hand now adds its note,** just like ⌘⇧6. Type `[^1]` and
  the note line appears in the notes section while your cursor stays in the sentence.
- **The notes section creates itself** at the end of the document with the first
  note, under a thin "Notes" divider. The divider is drawn by the editor only, so the
  file stays standard Markdown.
- **Notes stay in order.** Note lines are sorted by the order of their references, so
  moving a sentence moves its note too.
- **Deleting a reference** removes its note if the note was still empty. A note with
  writing in it is kept (faded, at the end), so a citation is never lost silently.
- Each automatic change is part of the same undo step as your edit.
- **Endnotes in the Ideas panel.** The lower list of the Ideas & Notes panel (⌘K) now
  switches between **Recent Ideas** and **Endnotes**, the current document's notes in
  order. Click a note to jump to it. The panel's layout is unchanged, and it remembers
  which list you last chose.

## 2026-11-25 — Projects panel moves to ⌃⌃

- **Double-tap Control (⌃⌃) now opens and closes the Projects panel**, in place of
  Esc Esc. In fullscreen the browser takes the first Esc to leave fullscreen, so Esc
  Esc never reached the app there. (⌥⌥ was tried first, but the Claude desktop app
  claims it system-wide.)
- Only a clean tap counts: Control pressed and released on its own. Shortcuts like
  ⌃A or ⌃E don't trigger it.
- A single Esc still closes whatever panel is open.

## 2026-11-24 — Endnotes

For long essays: endnotes written in standard Markdown footnote syntax
(`text.[^1]` and a note line `[^1]: citation`) now render cleanly as you write.

- **Superscript references.** `[^1]` shows as a small raised number. When your
  cursor touches it, the raw Markdown shows so you can edit it.
- **Numbered notes.** A note line shows its number in place of `[^1]:`, and the
  citation and comments wrap under it with a hanging indent, slightly smaller
  than body text.
- **Numbered by order.** Numbers follow the order of the references in the essay,
  whatever the labels are (word labels like `[^smith]` work too).
- **⌘⇧6 adds a note.** It puts the reference at the cursor, opens the note line in
  the notes area and moves you there. A note added between two others goes into
  the list at its place, so the notes stay in order.
- **Jump between them.** ⌘J goes from a number to its note and back. A single
  click on a superscript or on a note's number does the same.
- **Mismatches show faded:** a reference without a note, or a note nothing refers
  to.
- **Not yet:** endnotes in the HTML export or in copy-out for Substack and the
  website. That's a separate piece of work.

Design: `docs/superpowers/specs/2026-11-24-endnotes-design.md`

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
