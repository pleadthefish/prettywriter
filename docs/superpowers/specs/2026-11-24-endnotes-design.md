# Endnotes — Drafting Side (Design)

*2026-11-24. Small change. Publishing/export of endnotes is a separate, later piece.*

## Intent

Drew writes long essays with endnotes: a reference mark in the text, then the
citation and his own comments in a notes area at the end. Finished essays go to
Substack and/or his website, so the notes must look clean. Today the editor
treats `[^1]` as a broken link: brackets visible, `^1` underlined, no numbering,
no navigation.

## Decisions (agreed with Drew)

- **Syntax:** standard Markdown footnotes, so files stay portable:
  `text.[^1]` and a note line `[^1]: citation and comments`.
- **References** render as superscript numbers. While the cursor touches one, it
  shows raw `[^1]` for editing (same rule as bold and italics).
- **Note lines** render with a plain number in place of `[^1]:`, the note text
  wrapping under it (hanging indent). The marker shows raw while the cursor is on
  that line (same rule as `#` and `>`).
- **Numbers follow the order of first reference** in the essay, whatever the
  labels say. Inserting a note between 2 and 3 renumbers everything after it on
  screen; the source labels are untouched.
- **Single click** on a superscript jumps to its note; single click on a note's
  number jumps back to the reference. (Links stay ⌘-click.)
- **Keyboard:** one shortcut inserts the next note (reference at the cursor, note
  line created at the bottom, cursor moved there); another jumps between a
  reference and its note.

## Calls made while building (not discussed)

- **Shortcuts:** ⌘⇧6 (⌘^, after the `^` in the syntax) inserts a note. ⌘J jumps
  reference ↔ note. Neither was in use.
- **New note placement:** after the last existing note line; if there are none,
  at the end of the document after a blank line.
- **New labels** are the next free number (`max numeric label + 1`).
- **Jump targets:** to a note, the cursor goes to the end of its text; back to the
  text, it goes just after the first reference to that note.
- **Detection:** a whole-document scan (regex per line, skipping ``` / ~~~
  fences) kept in a CodeMirror StateField, recomputed on each edit. Inline code is
  excluded when drawing. No parser extension needed. The Markdown parser's `Link`
  nodes starting with `[^` are skipped so they don't render as links.
- **Problems are shown, not fixed:** a reference with no note, or a note nobody
  references, is drawn dimmed.
- **Note lines** are set slightly smaller (0.9em), as endnotes usually are.
- **Plain-textarea fallback:** no rendering, and the shortcuts do nothing.
- **Approaches considered:** (1) a Lezer inline-parser extension for `[^label]`
  plus block handling for definitions; (2) a document scan in a StateField. Chose
  (2): numbering needs the whole document anyway, the parser only parses lazily
  near the viewport, and note lines aren't standard blocks to the GFM parser.

## Non-goals (for now)

- Export / copy-out of endnotes for Substack and the website. That waits until
  we know how essays get there.
- Multi-paragraph notes (indented continuation lines).
- Auto-rewriting labels to match the display order.
