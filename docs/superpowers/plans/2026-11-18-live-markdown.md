# Live Markdown Editing Implementation Plan

> **Status: complete.** All four tasks done on `writing-polish` and merged to `main`
> on 2026-11-24, with a follow-up change: inline syntax now reveals per span, not per
> line (see the spec). The checkboxes below weren't ticked during the work.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `<textarea>` writing surface with a CodeMirror 6 editor that renders Markdown in place, Obsidian-style, without ever changing the stored text.

**Architecture:** A `<script type="module">` in `index.html` imports CodeMirror from esm.sh (pinned), builds the `EditorView`, and resolves a promise the classic app script awaits before `init()`. All app code reaches the editor through a small set of helper functions with two backends (CodeMirror, or the original textarea if the CDN fails). Live preview is one ViewPlugin that walks the Markdown syntax tree for visible ranges and emits mark/replace/widget decorations, skipping lines touched by the selection.

**Tech Stack:** Vanilla JS/CSS in one file; CodeMirror 6 via esm.sh; puppeteer-core + installed Chrome for automated checks (harness lives in the session scratchpad, not the repo).

**Spec:** `docs/superpowers/specs/2026-11-18-live-markdown-design.md`

## Global Constraints

- Single `index.html`; no bundler, no npm in the repo; 4-space indent, `function` declarations, `// === SECTION ===` banners.
- Exact pinned versions: `@codemirror/state@6.7.6`, `@codemirror/view@6.43.15`, `@codemirror/language@6.13.1`, `@codemirror/lang-markdown@6.5.2`, `@codemirror/commands@6.11.1`; every non-state import passes `?deps=` pinning state/view/language so `state.mjs` loads once.
- `project.text` is always the exact document string — no normalisation anywhere.
- No `defaultKeymap`: use `historyKeymap` + `standardKeymap` only. PW shortcuts (⌘K ⌘\ ⌘P ⌘B ⌘E ⌘/ ⌘S ⌘F ⌘[ ⌘] ⌘, ⌘. Esc Esc) must keep working with the editor focused.
- GFM with `IndentedCode` removed from the parser.
- Fallback: if the editor module fails or hasn't resolved in 8000 ms, use the textarea exactly as today.
- Files stay at repo root (this is `main`'s layout).

## Review Focus

1. Switching projects then pressing ⌘Z — must not undo into the previous project's text (Task 1 test `undoDoesNotCrossProjects`).
2. Projects/History panel open with editor focused — arrow keys move the panel selection only, not the caret (Task 1 test `panelArrowsDontMoveCaret`).
3. A broken image URL — shows a muted label, not an empty gap (Task 3 test `brokenImageShowsLabel`).
4. Pasting the whole fixture into an empty project — saved text equals the pasted string exactly (Task 1 test `pasteRoundTrip`).
5. Empty project — placeholder "Begin writing..." visible, word count "0 words" (Task 1 test `emptyProjectPlaceholder`).

---

### Task 1: CodeMirror editor behind helpers, with textarea fallback

Deliverable: app behaves exactly as before, but the writing surface is CodeMirror (raw Markdown, no decorations yet).

**Files:**
- Modify: `index.html` — markup (`.editor-container`), CSS (editor rules near `textarea {`), new module script before the classic `<script>`, every `editor.value` / `editor.selection*` / `editor.style` / `editor.focus` / `editor.addEventListener` call site (31 references), `init()` trigger.
- Test: `<scratchpad>/harness/test-editor.js`

**Interfaces:**
- Produces (classic-script globals):
  - `getEditorText(): string`
  - `setEditorText(text: string): void` — replaces doc, resets undo history, cursor to end, does **not** trigger autosave
  - `focusEditor(): void`
  - `setEditorFont(family: string): void`, `setEditorFontSize(px: number): void`
  - `editorDom(): HTMLElement` — element that receives keydown (for sounds)
  - `window.pwEditorReady: Promise<{ kind: 'cm' | 'textarea' }>`
- Produces (module → classic): `window.pwCM = { view, buildState(text) }` when CodeMirror loads; `window.pwCMExtensions: Extension[]` array later tasks push into before the view is created.

- [ ] **Step 1: Write the failing tests** in `test-editor.js` (uses `open()` from `shot.js`):
  - `usesCodeMirror`: `document.querySelector('.cm-editor')` exists, `#editor` textarea hidden.
  - `roundTrip`: after load, `getCurrentProject().text === fixture`; type `x` then ⌘Z → text `=== fixture`.
  - `typingSaves`: focus, type `hello` at end → `JSON.parse(localStorage.projects)[0].text.endsWith('hello')`, word count increments by 1.
  - `pasteRoundTrip`: new empty project, dispatch paste of fixture → saved text `=== fixture`.
  - `undoDoesNotCrossProjects`: two projects A/B; load B, ⌘Z → text still B's.
  - `shortcutsStillWork`: with editor focused, ⌘B changes `#bgImage` style; ⌘] changes `#fontDisplay`; ⌘. changes `.cm-content` computed font-size; ⌘/ toggles `#soundIndicator` text.
  - `tabInsertsTab`: Tab at line start → text contains `\t` at that offset.
  - `panelArrowsDontMoveCaret`: Esc Esc opens projects; ArrowDown; caret `head` unchanged.
  - `emptyProjectPlaceholder`: empty project shows `.cm-placeholder` with "Begin writing...", `#wordCount` = "0 words".
  - `fallbackTextarea`: block requests to `esm.sh` (`page.setRequestInterception`) → after ≤9 s, textarea visible, typing saves.
- [ ] **Step 2: Run** `node test-editor.js` — Expected: `usesCodeMirror` FAIL (others may pass on textarea).
- [ ] **Step 3: Implement.** Module script imports the five packages, creates the view in `.editor-container` with: `markdown({ base: markdownLanguage, extensions: [{ remove: ['IndentedCode'] }] })`, `history()`, `keymap.of([...historyKeymap, ...standardKeymap])`, a Tab binding inserting `\t`, `EditorView.lineWrapping`, `placeholder('Begin writing...')`, `contentAttributes` `{ spellcheck: 'true', autocorrect: 'on', autocapitalize: 'sentences' }`, an update listener calling `window.pwOnEditorChange()` when `docChanged` and not flagged as a programmatic load (use a `pwLoad` annotation), and a highest-precedence `EditorView.domEventHandlers({ keydown })` that returns `true` when `#projectsPanel` or `#historyPanel` has class `open` and the key is an arrow/Enter (so CM's keymap skips it but the document handler still runs). Classic script: replace `DOMContentLoaded → init()` with `pwEditorReady.then(init)`; textarea path keeps current behaviour. CSS: `.cm-editor` gets the old textarea box (width 100%, max-width 800px, height 70vh, transparent, white, line-height 1.8, hidden scrollbars, no focus outline); caret white.
- [ ] **Step 4: Run** `node test-editor.js` — Expected: all PASS, no page errors except favicon 404.
- [ ] **Step 5: Commit** `index.html` — "Swap textarea for CodeMirror 6 editor behind helpers, with fallback".

### Task 2: Live preview decorations (text formatting)

**Files:**
- Modify: `index.html` — module script (new `// === LIVE PREVIEW ===` section), CSS (`.cm-md-*` classes, styles moved from `#markdownPreview *`).
- Test: `<scratchpad>/harness/test-preview.js`

**Interfaces:**
- Consumes: `window.pwCMExtensions`, CodeMirror view from Task 1.
- Produces: `livePreview` ViewPlugin; CSS classes `cm-md-h1..h6`, `cm-md-strong`, `cm-md-em`, `cm-md-strike`, `cm-md-code`, `cm-md-quote` (line), `cm-md-link`, `cm-md-url-short`, `cm-md-codeblock` (line), `cm-md-hr`, `cm-md-bullet`.

Rules (per syntax node, outside active lines; active = any line overlapping any selection range):
- `HeaderMark` (+ following space) hidden; heading line gets `cm-md-hN` (h1 2em, h2 1.5em, h3 1.25em, h4–h6 1.1em, bold, line-height 1.3).
- `EmphasisMark`, `StrikethroughMark`, `CodeMark` hidden; content marked `strong`/`em`/`strike`/`code`.
- `QuoteMark` (+ space) hidden; line class `cm-md-quote` (left border, italic-free, muted).
- `Link`: hide `[`, `](url)` / `LinkMark`/`URL`; text gets `cm-md-link` (underline). Inside active lines keep the class but no hiding.
- Bare `URL` (autolink, not inside `Link`/`Image`) longer than 40 chars: replace with widget showing `hostname…` (class `cm-md-url-short`).
- `ListMark` `-`/`*`/`+` → bullet widget `•`; ordered marks stay as text.
- `HorizontalRule` → widget `<hr>`-styled line.
- `FencedCode`: lines get `cm-md-codeblock` (monospace, subtle background); `CodeMark` fence lines collapsed off-cursor; `CodeInfo` hidden.
- Recompute on `docChanged`, `viewportChanged`, `selectionSet`, or syntax tree change.

- [ ] **Step 1: Write failing tests** with a sample doc (`# Title`, `**bold** and _em_`, `~~s~~`, `` `c` ``, `> quote`, `- item`, `---`, fenced block, `[text](https://example.com/very/long)`, bare 60-char URL, `\tTabbed paragraph with **bold**`), cursor placed on the last line:
  - `markersHiddenOffCursor`: visible text of the line `**bold** and _em_` (`innerText` of its `.cm-line`) is `bold and em`; `strong` text has computed `font-weight` ≥ 600.
  - `markersShownOnCursor`: move cursor to that line → `innerText` contains `**bold**`.
  - `headingSized`: `# Title` line computed font-size = 2 × body.
  - `linkShowsText`: link line `innerText` === `text`, has `.cm-md-link`.
  - `bareUrlShortened`: line shows `example.com…`.
  - `tabbedIsProse`: tabbed line has no `cm-md-codeblock` and its `bold` is bold.
  - `fixtureClean`: load fixture with cursor at end; across all non-active `.cm-line`s, no `**`, `_x_`-style markers, `](` or `![` in `innerText`.
  - `docUntouched`: after all the above, `getEditorText() === sample`.
- [ ] **Step 2: Run** `node test-preview.js` — Expected: FAIL on `markersHiddenOffCursor`.
- [ ] **Step 3: Implement** the plugin per the rules above.
- [ ] **Step 4: Run** `node test-preview.js` and `node test-editor.js` — Expected: all PASS.
- [ ] **Step 5: Screenshot** fixture + sample (`node shot.js`), inspect visually.
- [ ] **Step 6: Commit** — "Render Markdown inline, Obsidian-style, hiding syntax off the cursor line".

### Task 3: Images and ⌘-click links

**Files:**
- Modify: `index.html` — LIVE PREVIEW section, CSS `.cm-md-image`, `.cm-md-image-missing`.
- Test: `<scratchpad>/harness/test-images.js`

**Interfaces:**
- Consumes: `livePreview` from Task 2.
- Produces: `ImageWidget(src: string, alt: string)` with `eq()` on src+alt (so images don't reload while typing).

Rules: an `Image` node off-cursor is replaced by a block-level widget `<img loading="lazy">` (max-width 100%, centred, small vertical margin); on the active line, the source stays visible **and** the image widget renders below it (side: 1). On `error`, swap to `<span class="cm-md-image-missing">` showing `alt` or "image unavailable". Links: `mousedown` with `metaKey` (mac) or `ctrlKey` on a `.cm-md-link` or `.cm-md-url-short` opens the link's URL via `window.open(url, '_blank', 'noopener')` and prevents caret move.

- [ ] **Step 1: Write failing tests:**
  - `fixtureImagesRender`: fixture loaded, cursor at end → 2 `img.cm-md-image` with `naturalWidth > 0` after load (requires network) and `offsetWidth <= 800`.
  - `imageSourceOnCursor`: cursor on image line → that line `innerText` starts with `![`, and an `img` still renders.
  - `brokenImageShowsLabel`: `![alt text](https://invalid.example/x.png)` → `.cm-md-image-missing` with text `alt text`.
  - `cmdClickOpensLink`: stub `window.open`, meta+click on link text → stub called with `https://example.com/very/long`, selection unchanged; plain click → stub not called.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** all three test files — Expected: PASS.
- [ ] **Step 5: Commit** — "Show images inline and open links with ⌘-click".

### Task 4: Remove the Ctrl+M preview; performance check; docs

**Files:**
- Modify: `index.html` — delete Ctrl+M branch in `setupKeyboardShortcuts()`, `togglePreview()`, `renderMarkdown()`, `isPreviewMode`, `.preview-container` markup + CSS, `#markdownPreview` CSS (after Task 2 moved what it needs), `.mode-indicator` markup + CSS, `marked` script tag and `marked.setOptions` in `init()`; remove "· Ctrl+M Markdown Preview" from `.shortcuts-hint`.
- Modify: `CLAUDE.md` — map/features: editor is CodeMirror (module script, helpers, fallback), preview removed, `marked` gone; add gotcha "CodeMirror loads from esm.sh; textarea is the fallback".
- Modify: `README.md` — features list: live Markdown rendering (only if README describes the preview).
- Test: `<scratchpad>/harness/test-perf.js`

- [ ] **Step 1: Write tests:**
  - `noPreview`: `grep -c "togglePreview\|markdownPreview\|marked\|Ctrl+M" index.html` → 0.
  - `perf10k`: doc = fixture repeated to ≥10,000 words; cursor mid-doc; type 50 chars via `page.keyboard.type` with 0 delay; measure per-keystroke time from `keydown` to next `requestAnimationFrame` → p95 < 16 ms; and `getEditorText()` correct.
- [ ] **Step 2: Run** — Expected: `noPreview` FAIL.
- [ ] **Step 3: Delete the code; update docs.**
- [ ] **Step 4: Run** all four test files — Expected: PASS; no page errors.
- [ ] **Step 5: Commit** — "Remove Ctrl+M preview and marked; document the new editor".
