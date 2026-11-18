# Live Markdown editing (Obsidian-style) — design

Date: 2026-11-18 · Branch: `writing-polish` (off `main`) · Status: approved by Drew in conversation

## Intent

PrettyWriter is where Drew goes to focus when distracted. Today the writing
surface is a plain `<textarea>`, so Markdown shows as raw syntax: long image
URLs (`![](https://substackcdn.com/…)`) sprawl over several lines, links break
up paragraphs, and `**bold**` / `# headings` don't look like anything until the
Ctrl+M preview. That noise works against flow.

Goal: the Obsidian "live preview" writing experience inside PrettyWriter. You type
Markdown; it renders in place as you go. Symbols are visible only where you are
editing. This shifts PW from "raw rough draft only" toward a place for fuller
composition, consistent with v2's Obsidian-compatible `.md` storage.

## Goals

- Markdown renders inline while writing: headings, **bold**, *italic*,
  ~~strikethrough~~, `inline code`, links, images, block quotes, bulleted and
  numbered lists, horizontal rules, fenced code blocks.
- Syntax markers are hidden except on the line(s) the cursor or selection touches;
  there the raw Markdown shows so it can be edited.
- Links show their text (underlined), URL hidden; ⌘-click opens in a new tab.
  Bare URLs longer than a threshold display as `domain…` when the cursor is away.
- Images render inline, scaled to the column width; cursor on the line reveals the
  `![](…)` source above the image.
- Headings: same typeface as the body, larger sizes.
- The typewriter feel stays: fonts (⌘[ / ⌘] cycle), text size, typing sounds,
  photo backgrounds, overlay, word count, centred 800px column, hidden scrollbar.
- Ctrl+M preview is removed (redundant).

## Non-goals (this project)

- Copy-out / export as rich text for Substack, Medium, Word (next project).
- Converting rich HTML pasted from the web into Markdown (later).
- Obsidian-only syntax: `[[wikilinks]]`, `![[embeds]]`, callouts (v2, needs a vault).
- Tables (stay plain text).
- Toolbars, menus, or formatting buttons. Keyboard only.
- Formatting shortcuts like ⌘B for bold (⌘B is already "background").

## Anti-goals (failure even if it "works")

- The stored text is ever different from what was typed (no normalising `*`→`_`,
  no reflowed lists, no trailing-whitespace changes). Files must stay safe for an
  Obsidian vault.
- Cursor jumps, lost undo, flicker, or input lag that break flow.
- Any existing PW shortcut stops working because the editor swallowed it.

## Success states (agreed)

1. `writing-polish-test` (Drew's Substack piece, 49 lines, 2 images, 8 links)
   reads as a clean document: images visible, links as text, no syntax off-cursor.
2. Ctrl+M removed from all four places: `setupKeyboardShortcuts()`, the
   `.shortcuts-hint` bar, `README.md`, `User Manual/manual.txt`.
3. Text round-trips byte-for-byte: open a project, change nothing (or type and undo),
   and `project.text` is identical.
4. No regressions: typing sounds, Tab, word count, font cycle, text size, backgrounds,
   autosave on input, ⌘S, project switching, history, ideas panel (incl. editor
   shifting left), exports, Escape / Esc-Esc, focus on load, title rename.
5. No typing lag on a 10,000+ word document.
6. Undo/redo, browser spell check, and autocorrect behave normally.
7. Works in Safari (Drew's Dock app). Final Safari check is Drew's; Chrome is tested here.

## Constraints

- Front end stays a single `index.html`: vanilla JS + CSS, no bundler, no npm in the
  repo. CodeMirror loads from a CDN like `marked` does today, with **exact pinned
  versions** (no ranges). The live site (GitHub Pages, `main` root) needs a
  connection anyway; the v2 desktop app will vendor a copy later.
- Only one copy of `@codemirror/state` may load (duplicate instances break CM).
- `main` layout (files at repo root) must not change — this ships to the live site.
- Match house style: 4-space indent, `function` declarations, `// === SECTION ===`
  banners, top-level DOM refs.
- Existing app shortcuts must keep priority over CodeMirror's defaults. Use a
  minimal keymap (history + standard editing/navigation), not `defaultKeymap`
  wholesale — e.g. CM's ⌘/ (toggle comment), ⌘F (search), ⌘I, ⌘[ ⌘] must not
  shadow PW behaviour (⌘[ ⌘] cycle fonts, ⌘, ⌘. change text size).
- `localStorage` data model unchanged; `project.text` remains the raw Markdown string.
- This work later merges into `v2-tauri` (git follows `index.html` → `app/index.html`),
  where persistence goes through the storage adapter. Keep editor access behind small
  helpers so the merge is mechanical.

## Approaches considered

1. **CodeMirror 6 + custom live-preview decorations** — *chosen by Drew.* Same
   foundation as Obsidian. Text is the source of truth; styling is decoration over it,
   so byte-for-byte storage is natural. Handles undo, IME, spell check, large docs.
   Cost: second external dependency; editor wiring (sounds, Tab, fonts, word count)
   must be reconnected.
2. **Hand-rolled contenteditable** — no dependency, but caret/undo/paste/IME bugs are
   hard to eliminate and each one breaks flow. Rejected.
3. Ruled out: textarea + styled mirror overlay (can't hide syntax, size headings, or
   show images); WYSIWYG editors (Tiptap, Milkdown, Lexical) rewrite Markdown on save.

## Design

- **Editor**: replace `<textarea id="editor">` with a CodeMirror 6 `EditorView` mounted
  in `.editor-container`, sized like the textarea today (100% width, max 800px,
  70vh, transparent, white text, line-height 1.8, hidden scrollbar). Line wrapping on.
  Spellcheck/autocorrect attributes on the content element. Placeholder
  "Begin writing...".
- **Parsing**: `@codemirror/lang-markdown` (GFM) syntax tree drives everything.
- **Live preview**: a ViewPlugin builds decorations for visible ranges only (for
  speed). Lines touched by any selection range are "active" and get no hiding.
  Elsewhere: mark decorations style content (heading sizes, bold, italic, strike,
  code, quote, link); replace decorations hide markers (`#`, `**`, `_`, `` ` ``,
  `>`, link brackets + URL); widgets render images, horizontal rules, list bullets.
  Fenced code blocks: monospace, subtle background; fences hidden off-cursor.
- **Links**: ⌘-click (Ctrl-click elsewhere) opens `href` in a new tab with
  `noopener`. Plain click places the cursor as normal.
- **Images**: widget `<img>` (max-width 100%, lazy). A broken image shows its alt text
  or a small muted "image unavailable" label rather than an empty gap.
- **Editor access helpers** replace the 31 direct `editor.value` / selection uses:
  get text, set text (resets undo history — switching projects must not undo into
  another project), focus, and apply font family / font size.
- **Autosave / word count**: an update listener on doc changes calls the existing
  `saveCurrentProject()` and `updateWordCount()`.
- **Sounds**: keep the existing keydown-based sound handler on the editor's DOM.
- **Tab**: inserts a literal `\t` (current behaviour).
- **Load order**: CodeMirror is an ES module; the editor must exist before `init()`
  loads the current project into it.
- **Removed**: Ctrl+M handler, `togglePreview()`, `renderMarkdown()`, the preview
  container + `#markdownPreview` CSS, the mode indicator if nothing else uses it, and
  the `marked` script tag (its only consumer is the preview). The copy-out project can
  bring a renderer back if needed.

## Decisions from the builder check (Claude's calls — Drew to review)

- **Indented lines are prose, not code.** The GFM "indented code block" rule is
  disabled in the parser. Tab-indented paragraphs and the User Manual's 4-space
  shortcut tables (57 lines) render as normal text with their indentation kept.
  Fenced code blocks still work. (Obsidian keeps the rule; PW's Tab-indent habit and
  the manual make it a poor fit here.)
- **CDN failure falls back to the plain textarea.** The `<textarea>` stays in the
  markup; if CodeMirror fails to load (error or ~8s timeout), the app runs exactly as it
  does today on the textarea. The editor helpers have two backends; `init()` waits for
  whichever editor is ready.
- **Test fixture:** a copy of `writing-polish-test` was extracted from the local app's
  storage to the session scratchpad (never committed).
- Ctrl+M appears only in `setupKeyboardShortcuts()` and the `.shortcuts-hint` bar;
  README and manual already omit it.
- **Panel keyboard navigation:** while the Projects or History panel is open, the
  editor must not also act on arrow/Enter keys (the panel handlers run at document
  level after CodeMirror's own keymap).

## Left to the builder

Exact CDN (esm.sh vs jsDelivr) and import strategy, provided versions are pinned and
`@codemirror/state` loads once; decoration implementation details; the long-URL
threshold; heading size scale (start from the existing preview CSS: h1 2em, h2 1.5em,
h3 ~1.25em); how load order is sequenced; test harness for automated checks (kept
outside the repo).
