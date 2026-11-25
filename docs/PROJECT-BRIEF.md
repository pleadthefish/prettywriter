# PrettyWriter — Project Brief

*For an assistant without access to the code. Last updated 2026-11-24.*

You're helping Drew Parrish, who designs, builds and uses PrettyWriter. This brief
covers what the app is, how it's built, how it works, and where it's headed. You
can't see the code; when you need to, ask Drew to paste the relevant part
(everything is in one file, `index.html`, so ask for a named function).

---

## 1. What PrettyWriter is

PrettyWriter is a minimalist writing app inspired by analog typewriters. The goal
is to bring back what a typewriter gives a writer: a dedicated, distraction-free
tool that makes you want to write. *"Just you, the machine, and the page."*

Principles that shape every decision:

- **Keyboard-first.** "You're not writing if you're mousing about." Nearly every
  feature has a shortcut; mouse-only features are rare exceptions.
- **Minimal formatting, on purpose.** No toolbar, no menus, no formatting buttons.
  Writing is plain text with Markdown, rendered live. Rich-text features need
  Drew's sign-off.
- **First drafts.** It's built for getting words down, not for layout or publishing.
- **Atmosphere.** Full-screen backgrounds are Drew's own 35mm film photographs,
  plus typewriter fonts and optional synthesized typing sounds.
- **Personal tool first.** Drew is the main user. Distribution, multi-user
  features and app-store polish are not priorities yet.

Live site: `pleadthefish.github.io/prettywriter`. Drew writes in it daily as a
Safari "Add to Dock" web app.

---

## 2. How it's built

| Aspect | Choice |
|---|---|
| Code | One file, `index.html` (~4,200 lines): all CSS, markup and JavaScript |
| Language | Vanilla JS and CSS. No framework, no bundler, no npm, no build step |
| Editor | CodeMirror 6, loaded at runtime from esm.sh (exact pinned versions) — the only external dependency |
| Storage | The browser's `localStorage`. No backend, no accounts, no sync |
| Hosting | GitHub Pages, served from the root of the `main` branch |
| Sound | Synthesized with the Web Audio API (no audio files) |
| Tests | None in the repo; changes are checked by driving the app in a headless browser |
| License | Code MIT. Photographs © Drew Parrish, all rights reserved (not MIT) |

Repo layout:

```
index.html               The entire app
User Manual/manual.txt   Manual text, loaded into a pinned "User Manual" document
images/photo1-13.jpg     Background photos (© Drew Parrish)
typefaces/               Traveling Typewriter + Drafting Mono (.ttf)
README.md, CHANGELOG.md  Public overview; user-facing change history
CLAUDE.md                Developer guide for coding agents
docs/superpowers/        Design specs and implementation plans
```

Code conventions: 4-space indent, `function` declarations, `// === SECTION ===`
banners, DOM references held in top-level constants. If a shortcut changes, four
places must change together: the keyboard handler, the on-screen shortcut hint
bar, README.md and the User Manual.

---

## 3. How it works

### Screen

A centered 800px writing column over a full-screen photo with a dark overlay. The
document title is top-left (click to rename). The bottom-left shows the sound state,
font, text size and word count; the bottom bar lists the shortcuts; the photo credit
sits bottom-right. Everything else lives in slide-out panels.

### Features and shortcuts

| Shortcut | Action |
|---|---|
| ⌘S | Save (autosave also runs as you type) |
| ⌘K | Ideas panel: notes attached to the current document |
| ⌃ ⌃ (double-tap Control) | Projects panel: tree of documents and folders |
| ⌘\ | History panel: recently opened documents |
| ⌘E | Export as .txt, .md or .html |
| ⌘F | Find and replace across the whole document (⌘G / ⌘⇧G next / previous) |
| ⌃⌘F | Fullscreen |
| ⌘B | Next background photo |
| ⌘P | Random writing prompt |
| ⌘/ | Typing sounds on/off |
| ⌘] / ⌘[ | Next / previous font (Georgia, Traveling Typewriter, Drafting Mono, Times New Roman, Courier New) |
| ⌘. / ⌘, | Larger / smaller text (small, medium, large) |
| ⌘-click | Open a link |
| ⌘Z / ⌘⇧Z | Undo / redo |
| ⌘⇧6 | Add an endnote at the cursor |
| ⌘J | Jump between an endnote number and its note |

- **Projects panel:** documents and folders; keyboard navigation (arrows, Enter,
  N for new), drag-and-drop to reorganize.
- **Ideas panel:** short notes attached to each document, with #hashtags you can
  filter on across all documents. Meant for rhizomatic, non-linear thinking.
- **User Manual:** a pinned, read-only document. It's overwritten from
  `manual.txt` on every load, so edits to it aren't kept.
- **Per-document settings:** each document remembers its own background, font and
  text size.
- **Print shop (in progress):** hover the photo credit → "Order Print" → gallery →
  size (8×10 $25, 11×14 $40, 16×20 $65). Ordering isn't wired up yet.

### The editor: live Markdown (shipped 2026-11-24)

The writing surface is CodeMirror 6 with an Obsidian-style live preview. The
document is always plain Markdown; the preview only changes how it looks, never
the text itself.

- **Inline formatting** (`**bold**`, `*italic*`, `~~strike~~`, `` `code` ``,
  `[links](url)`) renders as soon as you type past the closing mark. Its symbols
  reappear while the cursor touches it, so you can edit them.
- **Line formatting** (`#` headings, `>` quotes, bullet lists, `---` rules,
  ``` code fences) hides its markers once the cursor leaves the line.
- **Images** (`![alt](url)`) render inline, scaled to the column.
- **Long bare URLs** shorten to `domain…` when the cursor isn't on them.
- **Indented lines are prose, not code blocks** (on purpose: the manual and many
  drafts use Tab-indented paragraphs). Fences are the only way to make code.
- **Tables** stay plain text.
- **Endnotes** use standard Markdown footnote syntax: `text.[^1]` and a note line
  `[^1]: citation and comments` in a notes area at the end. References render as
  superscript numbers and note lines get a number with a hanging indent. Numbers
  follow the order of the references, whatever the labels are. ⌘⇧6 adds a note in
  its proper place in the list; ⌘J or a single click jumps between a number and
  its note. The raw syntax shows while the cursor is on it.
- **The keymap is deliberately minimal** so the editor never intercepts
  PrettyWriter's shortcuts. Tab and Enter insert literal characters.
- **Fallback:** if CodeMirror can't load within 8 seconds (for example, offline on
  first load), the app uses a plain textarea without live preview.
- All other code reaches the editor through small helpers (`getEditorText`,
  `setEditorText`, `focusEditor`, and so on), so the editor can be swapped
  without touching the rest of the app.

### Data model

`localStorage` keys: `projects` (the JSON tree), `currentProjectId`,
`projectHistory`, `textSize`, `soundEnabled`, `hasVisited`.

```js
// Project (a document)
{ id, name, type: 'project', text, ideas: [], backgroundIndex, textSize, font, created, pinned? }
// Folder
{ id, name, type: 'folder', expanded, children: [], created }
// Idea
{ id, text, timestamp }
```

IDs are `Date.now()` timestamps. **ID 1 is reserved for the User Manual.**

Because everything lives in one browser's storage, clearing site data erases all
writing; export (⌘E) is the only backup today. That fragility is the main reason
for v2.

---

## 4. Roadmap and plans

### Shipped

- **v1.0** (tagged): the localStorage web app with projects, ideas, history,
  backgrounds, fonts, sounds, prompts and export.
- **Live Markdown editor** (2026-11-24): the CodeMirror editor described above.
  It replaced an older Ctrl+M preview toggle that used the `marked` library.
- **Endnotes, drafting side** (2026-11-24): see the editor section. Drew writes
  long essays with endnotes holding citations and his own comments.

### Next up

1. **Publishing essays, endnotes included.** Finished essays go to Substack, Drew's
   website, or both, and must look clean there, endnotes included. Copy or export as
   formatted text (Substack, Medium, Word) was already the next planned project. How
   essays currently get to Substack and the website (paste or file; what the website
   is built on) is still an open question, and it decides what this produces.
2. **Paste conversion.** Turn rich HTML pasted from the web into Markdown.
3. **Print shop checkout.** Open decisions:
   - Where the Printful API key lives. It must never ship in client-side code, so
     probably a serverless function.
   - Checkout: Stripe + Printful directly, or a link to a Printful-connected
     storefront.
   - Print-resolution source files, kept separate from the web backgrounds.

### v2: a real Mac desktop app (branch `v2-tauri`, partly built)

**Why:** `localStorage` is fragile, Safari can't access folders, and Drew wants
real files on disk, possibly inside an Obsidian vault. He'd rather have a real
app than a web app pretending to be one.

**What:** a Tauri app (Mac WebKit engine) that saves each document as a plain
`.md` file in a folder the user chooses. The web version keeps working on
localStorage.

- **Storage adapter.** The app talks to storage only through one interface
  (`loadAll`, `saveProject`, `createItem`, `rename`, `move`, `remove`,
  `saveSettings`, `saveHistory`). At startup it picks the DiskAdapter inside Tauri,
  otherwise the LocalStorageAdapter.
- **On-disk format.** Folders are directories; each document is `Name.md` with
  YAML frontmatter (`pw_id`, `font`, `textSize`, `background`, `created`,
  `ideas`) followed by the text byte-for-byte. Unknown frontmatter keys (Obsidian
  `tags`, `aliases`) are kept and written back. App settings and history live in
  `.prettywriter/config.json`. The User Manual is never written to disk.
- **Progress:**
  - Done: web files moved into `app/`; the Markdown + frontmatter codec
    (`pw-format.js`, with tests); all persistence routed through the adapter.
  - Not done: the Tauri shell (needs Rust installed first); the DiskAdapter;
    polish and build.
- **Constraints:**
  - The live-Markdown editor work on `main` still has to be merged into
    `v2-tauri`.
  - v2 should bundle CodeMirror locally instead of loading it from esm.sh.
  - Obsidian-only syntax (`[[wikilinks]]`, embeds, callouts) waits for v2, since
    it needs a vault.
  - `v2-tauri` can't merge to `main` until GitHub Pages is reconfigured, because
    v2 moves the files into `app/` and that would break the live site.

### Ruled out (unless Drew changes his mind)

- Toolbars, menus or formatting buttons.
- Formatting shortcuts like ⌘B for bold (⌘B is "next background").
- Accounts, cloud sync or a backend for the writing itself.

---

## 5. Known issues

- A first-time visitor should see the User Manual but gets an empty "Untitled"
  document instead.
- HTML export doesn't escape the user's text.
- Writing prompts are picked with plain `Math.random()`, so they can repeat.
- All 13 background photos (3–5 MB each) are preloaded at startup.
- ⌘⇧P also toggles the Projects panel and logs debug messages.
- Images in documents load from their URLs while writing (remote requests).

---

## 6. How to help Drew well

- Keep suggestions in the spirit of the app: keyboard-first, minimal, plain-text
  Markdown, one file, no build step, no frameworks.
- New features should come with a keyboard shortcut that doesn't clash with the
  existing ones.
- Anything merged to `main` goes straight to the live app Drew writes in, so
  changes there should be safe and tested.
- Never suggest redistributing or reusing the photographs.
- Actual code changes happen in Claude Code, which has the repo and a more
  detailed developer guide (CLAUDE.md). Planning, design thinking, copy and the
  User Manual are good things to work on here.
