# Status: PrettyWriter

*Updated 2026-11-25 · Branch: `main` · Tag: `v1.0` · uncommitted changes (endnotes, project brief) · not pushed (`main` is 11 commits ahead of `origin/main`)*

## Pick up here
Run `/pickup [goal]`. To run the project: `python3 -m http.server 8000`, then open http://localhost:8000.
Full background for a fresh assistant: `docs/PROJECT-BRIEF.md`.

## Where we are
The live-Markdown editor is merged into `main` locally. The drafting side of endnotes
is built and tested but not committed. Nothing from this work is on the live site
(GitHub Pages serves `origin/main`).

## Latest work
1. **Endnotes, drafting side** (2026-11-24, uncommitted). Standard Markdown footnotes
   (`[^1]` and `[^1]: note`) render as superscript numbers and numbered notes with a
   hanging indent, numbered by order of first reference. ⌘⇧6 adds a note in its place in
   the list; ⌘J or a single click jumps between a number and its note. Code in
   `// === ENDNOTES ===` and `buildLivePreview()`. Design:
   `docs/superpowers/specs/2026-11-24-endnotes-design.md`. User Manual, README,
   CHANGELOG and CLAUDE.md updated; the manual's ⌘\ History line was fixed.
2. **Project brief for Claude Desktop** (2026-11-24, uncommitted).
   `docs/PROJECT-BRIEF.md`: what the app is, how it's built and works, roadmap, known
   issues. Written for an assistant without repo access.
3. **Live-Markdown editor merged to `main`** (2026-11-24, `71b51da`, not pushed).
   `writing-polish` merged with `--no-ff`. Added `CHANGELOG.md`; README and the plan's
   status updated.
4. **Inline syntax reveals per span** (2026-11-24, `7ee6c3e`). Bold, italic, code,
   links, images and URLs render as soon as you type past the closing mark (Obsidian
   behaviour), instead of when the cursor leaves the line. Block markers stay line-based.
5. **CodeMirror 6 live-Markdown editor** (2026-11-18, `dceb4f8`…`7341b23`). Replaced the
   textarea (with a fallback to it) and removed the Ctrl+M preview.

## Next steps
1. **Drew tries endnotes in Safari**, especially ⌘⇧6 (macOS takes it on Touch Bar Macs).
2. **Commit** the endnotes work and `docs/PROJECT-BRIEF.md` to `main` (ask first).
3. **Push `main`** to update the live site (ask first; it changes the app Drew writes in).
4. **Publishing essays, with endnotes:** clean output for Substack and the website.
   Blocked on the open question below. Overlaps the planned rich-text copy-out project.
5. **Bring `main`'s editor work into `v2-tauri`** when v2 resumes (Tauri shell needs Rust;
   DiskAdapter and build still to do).
6. CLAUDE.md's "Current work in progress" covers only the print shop. Add publishing
   and endnote export there, and mention `.claude/STATUS.md` and `docs/PROJECT-BRIEF.md`.
7. Optional cleanup: delete the merged `writing-polish` branch; remove the stray
   untracked `app/` folder (only `typefaces/.DS_Store`, left over from a v2 checkout).

## Open questions
- **How do essays get to Substack and the website today** (paste, file upload, other),
  and what is the website built on? Decides what endnote export produces. Asked twice;
  Drew chose to build the drafting side first.
- Is ⌘⇧6 a usable shortcut on Drew's Mac (Touch Bar)? [?]
- Print shop: where the Printful key lives, the checkout route, print-resolution files.

## Decisions
- **Inline syntax reveal (2026-11-24):** per span, not per line, to match Obsidian. Drew
  wanted formatting to show as soon as the space bar follows the closing mark.
- **Endnote syntax (2026-11-24):** standard Markdown footnotes, so files stay portable
  to Obsidian and other publishing tools.
- **Endnote numbering (2026-11-24):** by order of first reference, labels untouched on
  disk; new notes are inserted in order in the notes list.
- **Endnote navigation (2026-11-24):** single click (Drew's preference over ⌘-click);
  links stay ⌘-click.
- **Endnote shortcuts (2026-11-24, Claude's call):** ⌘⇧6 insert, ⌘J jump. Not added to
  the on-screen shortcut bar, which already leaves out the font and size keys.
- **Endnote detection (2026-11-24):** a whole-document scan in a StateField, not a parser
  extension (numbering needs the whole document; the parser is lazy).
- **Build order (2026-11-24):** endnotes drafting first, publishing/export later.
