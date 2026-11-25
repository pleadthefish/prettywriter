# CLAUDE.md

Guidance for Claude Code (and any developer) working in this repo.

## What this is

PrettyWriter is a minimalist, typewriter-inspired writing app that runs entirely
in the browser. Keyboard-first, no formatting toolbar, original 35mm film
photography as backgrounds. No backend, no build step, no accounts — all data
lives in the browser's `localStorage`.

## Running it

Serve the folder over HTTP — do **not** open `index.html` via `file://`:

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

The User Manual is loaded with `fetch('./User Manual/manual.txt')`, which
browsers block under `file://` (you'll see the fallback "could not be loaded" text).

There are no tests, linters, or package dependencies.

## Repo layout

```
index.html               The entire app: CSS, markup, and JS in one file
User Manual/manual.txt   Manual text, loaded into the pinned "User Manual" project
images/photo1-13.jpg     Background photos (© Drew Parrish, NOT MIT — see CONTENT-LICENSE.txt)
typefaces/               Traveling Typewriter + Drafting Mono (.ttf)
README.md                Public-facing overview and shortcut list
CHANGELOG.md             User-facing changes, newest first — add an entry when shipping to main
docs/superpowers/        Design specs and implementation plans
LICENSE                  MIT (code)
CONTENT-LICENSE.txt      All rights reserved (photography)
```

`PrettyWriter.zip` in the working dir is an old (Oct 2025) git-ignored snapshot.

## Map of index.html

Line numbers are approximate — grep for the function name.

| Section | ~Lines |
|---|---|
| `<style>` (incl. `.cm-editor` / `.cm-md-*` live-preview styles) | 7–1309 |
| HTML markup (editor, panels, modals, print shop) | 1311–1518 |
| `<script>` — app logic | 1519–4185 |

Key areas in the script, by feature:

- **Data / config:** `backgrounds` array, `prompts` array, `textSizes`, `fonts`
- **Startup:** `pwEditorReady.then(init)` — `init()` waits for the editor, then
  `loadProjects()` → `ensureManualProject()`, then setup calls
- **Editor:** `// === EDITOR ===` — CodeMirror 6 loaded by `loadCodeMirror()` (dynamic
  `import()` from esm.sh, exact pinned versions in `CM_URLS`). If it fails or takes
  over 8s, the original `<textarea id="editor">` is used instead. **All code reaches
  the editor through the helpers:** `getEditorText()`, `setEditorText()` (resets undo),
  `focusEditor()`, `setEditorFont()`, `setEditorFontSize()`, `editorDom()`. Keymap is
  deliberately minimal (history + standard editing, Tab/Enter insert literal `\t`/`\n`)
  so CodeMirror never shadows PW shortcuts. Find is `@codemirror/search` (top panel,
  ⌘F / ⌘G / ⌘⇧G / Esc only — not the full `searchKeymap`), restyled under
  `/* FIND */` in the CSS; the global handler also opens it for ⌘F outside the editor.
  Fullscreen is ⌃⌘F.
- **Live preview:** `buildLivePreview()` — one ViewPlugin over the Markdown syntax tree
  (GFM, indented-code rule removed). Inline syntax (emphasis, code, links, images,
  URLs) hides unless the selection touches that span (`touches()`); block markers
  (`#`, `>`, bullets, rules, fences) hide off the cursor line(s). Styles
  headings/emphasis/quotes/code, renders images and bullets, ⌘-click opens links.
  Decorations only — it never changes the text.
- **Endnotes:** `// === ENDNOTES ===` — `scanFootnotes()` finds `[^label]` refs and
  `[^label]:` note lines (skipping fences); the result lives in `footnoteField` (a
  StateField) and drives numbering (order of first reference). Refs render as `<sup>`
  numbers, note lines get a hanging indent; single click on either jumps.
  `insertFootnote()` (⌘⇧6) places the new note in order; `jumpFootnote()` (⌘J).
  `syncFootnotesFilter()` (a transactionFilter, so it shares the edit's undo step) adds
  a note line for any reference without one, keeps the notes section
  (`findNotesSection()`: last run of note lines) sorted by reference order, and drops
  empty notes nothing refers to. The "Notes" divider is a CSS `::before` on that
  section's first line (`.cm-md-fn-first`).
  CodeMirror only — the textarea fallback has no endnote support.
- **Keyboard:** `setupKeyboardShortcuts()` — the single global keydown handler
- **Sound:** `initAudio()`, `playTypeSound()` — synthesized with Web Audio (no audio files)
- **Fonts / size:** `cycleFont()`, `applyFont()`, `increaseTextSize()`, `applyTextSize()`
- **Projects tree:** `loadProjects()`, `saveProjects()`, `createNewProject()`,
  `createNewFolder()`, `renderProjects()`, `handleProjectsKeyboard()`, drag-and-drop handlers
- **Title editing:** `setupProjectTitleEditing()` — click title to rename inline
- **History:** `addToHistory()`, `renderHistory()`, `handleHistoryKeyboard()`
- **Saving:** `manualSave()` (⌘S), `saveCurrentProject()` (autosave on input)
- **Backgrounds:** `changeBackground()`
- **Print shop:** `openPrintShop()`, `selectPhoto()`, `selectSize()`, lightbox functions
- **Export:** `exportAs()`, `exportTXT()`, `exportMarkdown()`, `exportHTML()`, `downloadBlob()`
- **Ideas panel:** `addIdea()`, `renderIdeas()`, hashtag functions, `renderGlobalIdeas()`.
  `// === ENDNOTES PANEL ===`: the lower list toggles Recent Ideas / Endnotes
  (`setIdeasListMode()`, `renderEndnotesPanel()`, localStorage key `ideasListMode`)

## Data model

`localStorage` keys:

| Key | Contents |
|---|---|
| `projects` | JSON tree of projects and folders |
| `currentProjectId` | id of the open project |
| `projectHistory` | JSON array of `{projectId, timestamp, projectName}` |
| `textSize` | `small` / `medium` / `large` |
| `soundEnabled` | `true` / `false` |
| `hasVisited` | first-visit flag (opens the manual) |
| `ideasListMode` | `recent` / `endnotes` (Ideas panel lower list) |

Project:
```js
{ id, name, type: 'project', text, ideas: [], backgroundIndex, textSize, font, created, pinned? }
```
Folder:
```js
{ id, name, type: 'folder', expanded, children: [], created }
```
Idea:
```js
{ id, text, timestamp }
```

IDs are `Date.now()`. **id `1` is reserved for the User Manual project** — it is
pinned, can't be renamed, and its text is **overwritten from `manual.txt` on every
page load** (so edits users make to it are not kept).

## Conventions

- **Keep it one file.** No build step, no framework, no npm. Vanilla JS + CSS.
  CodeMirror 6 (from esm.sh, exact versions) is the only external dependency.
- **Keyboard-first.** New features should have a shortcut; mouse-only features are
  the exception (print shop, title rename).
- **Minimal formatting is intentional.** Don't add rich-text features without asking.
- **Match existing style:** 4-space indent, `function` declarations, `// === SECTION ===`
  banners, DOM refs held in top-level consts.
- **Changing shortcuts?** Update all four places together: `setupKeyboardShortcuts()`,
  the `.shortcuts-hint` bar in the markup, `README.md`, and `User Manual/manual.txt`.
- **Adding a photo:** drop it in `images/` and add an entry to the `backgrounds` array.
- **Photos are not MIT.** Never suggest redistributing them; forks should bring their own.

## Known gotchas

- `handleProjectClick` is defined twice; the later definition (with `event`) wins.
- Title editing: removing the input may fire `blur`, so Escape/Enter can trigger
  `saveAndRestore()` unexpectedly — verify behavior when touching it.
- `exportHTML()` does not HTML-escape user text.
- `showPrompt()` uses plain `Math.random()`; the "no repeats until full cycle"
  behavior described in commit 2dc1089 is not present in the current code.
- ⌘⇧P also toggles Projects and still has debug `console.log`s.
- All 13 backgrounds (~3–5 MB each) are preloaded at startup.
- The editor needs esm.sh on first load; offline it falls back to the plain textarea
  (no live preview). The v2 desktop app should vendor CodeMirror instead.
- Indented lines (Tab or 4 spaces) are prose, not code blocks — on purpose (the manual's
  shortcut tables and Tab-indented paragraphs). Use ``` fences for code.
- Images in documents load from their URLs while writing (remote requests).

## Current work in progress

**Print shop (Printful integration).** UI is complete: hover the photo credit →
"Order Print" → gallery → size selection (8×10 $25, 11×14 $40, 16×20 $65) →
lightbox. `selectSize()` is a stub that logs and alerts "coming soon"; a
commented-out `fetch('/api/printful/create-order')` marks the intended hook.

Open decisions:
- Backend for the Printful API key (serverless function — key must never ship client-side)
- Checkout: own Stripe + Printful vs. linking to a Printful-connected storefront
- Print-resolution source files (separate from the web backgrounds)

## Git

- Work on `main` is fine for small changes; commit messages are descriptive,
  feature-level summaries.
