# Endnotes — Automatic Notes Section and Endnotes Panel (Design)

*2026-11-25. Small change, two parts. Builds on `2026-11-24-endnotes-design.md`.*

## Why

Drew typed `[^1]` by hand and got a superscript, but no note line appeared, so there was
nowhere to write the citation. Only ⌘⇧6 created the note. He wants the notes section to
take care of itself: created with the first reference, updated as references are added,
always in reference order. He also wants to see the current document's endnotes in the
Ideas & Notes panel, next to Recent Ideas.

## Part 1: automatic notes section (editor)

- **Typing a reference by hand matches ⌘⇧6.** When a complete `[^label]` is typed (or
  pasted) outside the notes and has no note line yet, its `[^label]: ` line is added
  to the notes section. The cursor stays where you're writing (⌘⇧6 still moves the
  cursor into the new note, as before).
- **Created with the first reference.** If the document has no notes yet, the section
  starts at the end of the document after a blank line.
- **Always ordered.** Note lines are kept sorted by order of first reference. Moving a
  sentence that holds a reference moves its note into place. Labels on disk are not
  renamed (numbering is display-only, as before).
- **Deleting a reference keeps its note** if the note has text (it shows faded, as now),
  so a citation is never lost silently. A note line that's still empty is removed with
  its reference.
- **Option C divider.** The editor draws a thin rule and a small "Notes" label above the
  first note line. Decoration only; the file stays standard Markdown. Export adds
  whatever heading each destination needs, later.
- CodeMirror only (the textarea fallback has no endnote support).

## Part 2: Endnotes view in the Ideas & Notes panel

- The **Recent Ideas** section header gets a toggle: **Recent Ideas | Endnotes**.
  Recent Ideas is unchanged and stays the default.
- **Endnotes** lists the current document's notes in display order: number, then the
  note text (Markdown shown as plain text). Empty notes show a faded placeholder;
  a reference with no note shows faded.
- Clicking a note jumps to it in the editor (same as ⌘J / clicking a superscript).
- Updates live while the panel is open.
- **Same proportions:** the list occupies exactly the space Recent Ideas does now.
- The toggle choice is remembered per browser (`localStorage`, wrapped in try/catch).

## Approaches considered (Part 1)

1. **Transaction filter / follow-up transaction on doc change (chosen).** After each
   user edit, compare refs and notes; if a note is missing or out of order, dispatch one
   follow-up change. Simple, uses the existing `scanFootnotes()`.
2. Rewrite the notes section from a model on every keystroke: heavier, fights undo.
3. Only fix order on save/export: doesn't meet "automatically, as you write".

## Left to the builder

Exact divider styling (match `.cm-md-hr` / `.cm-md-fndef`), how the panel toggle looks
(match `.ideas-section-label`), undo grouping of the automatic edits.
