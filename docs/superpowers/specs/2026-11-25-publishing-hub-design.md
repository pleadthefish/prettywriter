# Publishing Hub — Substack Sync + POSSE (Design)

*Planned with Drew in Claude Desktop on 2026-11-24; filed in the repo 2026-11-25.
Status: design approved in principle. Nothing built yet. The principle changes in §2
still need Drew's sign-off.*

## 0. Rules for whoever builds this

1. **Merge, don't duplicate.** Phase 0 overlaps the existing v2 work (branch `v2-tauri`).
   That plan is authoritative; this spec only adds the amendments in §5, Phase 0. If
   anything here contradicts it, stop and ask Drew rather than picking one.
2. **Principle changes need Drew's sign-off** (§2). Don't edit README.md, the User Manual
   or the principles in `docs/PROJECT-BRIEF.md` until he approves the wording.
3. **`main` is the live app** Drew writes in daily, so Phase A changes there must be safe
   and tested. Every new shortcut updates all four places: `setupKeyboardShortcuts()`,
   the `.shortcuts-hint` bar, README.md and `User Manual/manual.txt`.
4. **Hard rule:** PrettyWriter **never publishes to Substack through the API.** It only
   creates and updates drafts. Drew publishes on Substack by hand.

## Reconciliation with the repo (added when filing)

The handoff was written without the repo open. These points correct or sharpen it.

- **There is no v2 plan file.** The original plan
  (`~/.claude/plans/right-now-its-all-optimized-ocean.md`) is gone. What survives is the
  "v2" section of `CLAUDE.md` on `v2-tauri` and §4 of `docs/PROJECT-BRIEF.md`. So the
  Phase 0 amendments are recorded here, in §5. Where the v2 cross-reference should live
  is an open question for Drew (§9).
- **Endnotes exist now.** They shipped on `main` on 2026-11-24, after the planning
  session. The handoff's "Footnotes: not supported, defer" is out of date, and **endnotes
  are in scope for Phase A** (the conversion layer and its fixtures) and for Substack
  push and pull (§5). Two things to know:
  - The editor finds endnotes with its own scan (`scanFootnotes()` → `footnoteField`),
    not with the Lezer parser, which has no footnote syntax. `markdownToHtml` has to
    combine the parse tree with that scan, and number notes by order of first reference,
    the same way the editor does.
  - Substack has native footnotes. Whether pasted HTML footnotes become native ones, or
    whether only the draft API can create them, is unknown. Test this early in Phase A.
- **The website question is answered.** The site is static HTML on Cloudflare Pages
  (§5, Phase 3), and essays reach Substack through copy-out now and draft sync later.
  This settles the open question in `.claude/STATUS.md`.
- **`created` in the codec is a full ISO timestamp** (`2026-10-13T12:00:00.000Z`), not a
  date. The schema in §6 follows the codec.
- **Shortcut check against `setupKeyboardShortcuts()`:**
  - ⌘⇧C, ⌘⇧D and ⌘⇧↵ are free.
  - ⌘⌥⇧V has to match on `e.code === 'KeyV'`, because ⌥ changes `e.key` on a Mac.
    It's also macOS's own "Paste and Match Style", which Safari and WebKit may handle
    natively by delivering plain text only. If so, plain paste may need no custom code.
  - Check that Safari doesn't claim ⌘⇧C or ⌘⇧D in the Dock web app.
- **The textarea fallback** has no parser, because CodeMirror and Lezer come from the same
  esm.sh imports. In fallback mode, ⌘⇧C copies plain text and says so, and paste
  conversion is off. ⌘E HTML export needs either the same behavior or a small
  parser-free path. Decide that while building.
- **⌘E HTML export today** (`exportHTML()`) splits on blank lines, wraps each paragraph in
  `<p>`, doesn't escape anything and renders no Markdown. Routing it through
  `markdownToHtml` fixes both problems.

## 1. Goal

PrettyWriter becomes Drew's **writing composition hub**:

- Write in PrettyWriter. Selected documents stay in **two-way sync with Substack drafts**.
- **POSSE** (Publish on your Own Site, Syndicate Elsewhere): the Publish action puts a
  piece live on **drew-parrish.com first**. Drew then publishes the Substack copy himself.
- Documents are plain `.md` files on disk (v2). They can live **inside the Obsidian
  vault**, so they join his notes system without a sync step.
- The web version (GitHub Pages, localStorage) keeps working. Substack sync and
  publishing are **Tauri-only**. The copy-out conversion (Phase A) works in both.

## 2. Principle changes (need Drew's sign-off before any docs change)

| Current principle (project brief) | Proposed update |
|---|---|
| "First drafts. Built for getting words down, not for layout or publishing." | Composing stays the focus. PrettyWriter also **sends** finished work to Drew's site and to Substack drafts, without becoming a layout tool. |
| Ruled out: "Accounts, cloud sync or a backend for the writing itself." | Still true. The source of truth is always the local `.md` file. Substack and the site are **places the writing is sent to**, not storage. |

`CLAUDE.md` says "No backend, no accounts" and that CodeMirror is the only external
dependency. Phase A keeps both true. The Tauri-only phases add network destinations, but
still no backend for the writing.

## 3. Decisions

| Topic | Decision | Why |
|---|---|---|
| App platform | Tauri desktop app (existing v2 work) | Real files on disk. Rust-side HTTP avoids browser CORS limits, so no separate bridge process is needed |
| Source of truth | The local `.md` file | Substack and the site are send destinations |
| Substack mirroring | **Off by default**; Drew turns it on per document | His choice, piece by piece |
| Substack sync | Two-way: push local edits, pull edits made in Substack's editor | Drew wants to edit in either place |
| Conflicts | Three-way merge against the last-synced version. Non-overlapping changes merge automatically; overlapping ones go to Drew | Like a git merge; nothing is lost silently |
| Site rendering | **The site renders Markdown.** PrettyWriter commits only `.md` files; the site's build makes the HTML | Keeps the site's design out of PrettyWriter; fits the Bureau build work |
| Canonical URL | `https://drew-parrish.com/writing/<slug>` | Proposed; Drew to confirm |
| Build order | Phase A (conversion) → v2 Tauri → ledger → Substack → site | Riskiest unknowns first; the site redesign isn't stable yet |
| Secrets | macOS Keychain only | `.prettywriter/config.json` may sit inside the vault |

## 4. Architecture

```
                 ┌─────────────────── PrettyWriter (Tauri) ───────────────────┐
                 │                                                            │
 Editor (CM6) ──►│ Conversion layer (Phase A)                                 │
                 │   md → HTML   (copy-out, push, HTML export)                │
                 │   HTML → md   (paste, pull)                                │
                 │                                                            │
                 │ StorageAdapter (existing)    PublishAdapter (new, Tauri-only)
                 │   DiskAdapter → .md files      SubstackAdapter (drafts only)
                 │   LocalStorageAdapter (web)    SiteAdapter (Phase 3)       │
                 │                                                            │
                 │ Ledger (Phase 1): last-synced copies + git history         │
                 │ Rust side: HTTP (no CORS), Keychain, git                   │
                 └────────────────────────────────────────────────────────────┘
                        │                        │                    │
                 Obsidian vault folder     Substack drafts      portfolio-site repo
                 (plain .md files)         (unofficial API)     → Cloudflare Pages
```

**Interface first:** the frontmatter schema (§6) is the agreement between PrettyWriter,
Substack sync and the site. Lock it in before building either the Substack side or the
site side.

## 5. Phases

### Phase A: conversion layer, copy-out and paste conversion (on `main`, web and Tauri)

This is items 1 and 2 of the brief's "Next up", and the foundation for Substack sync.

**Scope**
- `markdownToHtml(md)` produces clean HTML that Substack accepts.
  - **Investigate first:** the Lezer Markdown parse tree is already loaded. Generating
    HTML from it means *what the editor shows is what converts*, with no new dependency.
    Fall back to a pinned library from esm.sh only if that proves impractical.
  - It has to match the editor:
    - Tab-indented lines are prose, not code.
    - Only fences make code.
    - Tables stay plain text. Substack has no tables, so output them as preformatted
      text and flag it.
  - **Endnotes:** references become superscript links and notes become an ordered list,
    numbered by order of first reference (see Reconciliation).
  - Escape the user's text. Route ⌘E HTML export through this function, which also fixes
    the known issue that HTML export doesn't escape text.
- `htmlToMarkdown(html)` handles pasted web content now and Substack pulls later. Use a
  DOM walker or a pinned library, preferring no new dependency. HTML footnotes map back
  to `[^n]` / `[^n]:`.
- **⌘⇧C copies as rich text.** Write `text/html` and `text/plain` to the clipboard
  together (`navigator.clipboard.write` with a `ClipboardItem`). Test in Safari and in
  Tauri's WebKit view. The keyboard shortcut counts as the user gesture Safari requires.
- **Paste conversion:** when a paste contains `text/html`, convert it to Markdown.
  Proposed: offer a plain-text paste as well (the Mac convention is ⌘⌥⇧V). **Confirm the
  default and the shortcut with Drew.**

**Acceptance and tests**
- A **fixture set** of sample documents covering headings, bold, italic, strike, inline
  code, links, images, quotes, bullet lists, rules, fences, Tab-indented prose, a table,
  long bare URLs and **endnotes** (including word labels and out-of-order labels).
- Round trip: `htmlToMarkdown(markdownToHtml(doc))` equals `doc` (normalized) for every
  supported element. Write down what's lossy.
- Manual check: paste ⌘⇧C output into a real Substack draft, and the formatting
  (endnotes included) survives.
- No regressions in the live editor, and the textarea fallback still works.

### Phase 0: v2 Tauri — amendments to the existing v2 work

**Don't create a new plan.** The existing v2 work already covers the Tauri shell,
DiskAdapter, the Markdown + frontmatter codec (`pw-format.js`), merging the live editor
into `v2-tauri`, bundling CodeMirror locally, and reconfiguring GitHub Pages before
merging to `main`.

**Amendments**, added only where they aren't already covered:
1. **Rust-side HTTP** the front end can call, so Substack requests avoid CORS limits.
2. **Keychain access** for the Substack session cookie and the GitHub token.
3. **Running git**, either by shelling out to system git or through a Rust library.
   Decide, and note any requirement (for example, Xcode Command Line Tools).
4. **A `PublishAdapter` seam** next to `StorageAdapter`. Its features stay hidden
   outside Tauri.
5. **Docs folder setup:** allow choosing a folder inside the Obsidian vault. Make sure
   `.prettywriter/` and unknown frontmatter keys behave well in Obsidian (the codec
   already keeps unknown keys).
6. **Codec:** the §6 schema round-trips through `pw-format.js`, with tests.

### Phase 1: ledger

- **The last-synced copy** of each linked document lives at
  `.prettywriter/sync/<pw_id>.md`. It is the base for three-way merges.
- **Git history** for the docs folder. Commit on meaningful events (push, pull, merge,
  publish), **not on every autosave**.
- **Merging:** either `git merge-file`, which works on three plain files without a repo,
  or a JS diff3 library. Pick one.
- **Open question:** is Drew's vault already a git repo? If it is, choose between a
  nested repo and a separate one. Don't create a nested repo without asking.

### Phase 2a: Substack push (drafts only)

- **API discovery:** Substack has no official API for drafts. Work out the request shapes
  from MIT-licensed sources: `python-substack` (ma2za) and `substack-mcp`
  (conorbronsdon). **Verify** whether the draft body must be Substack's JSON document
  format or whether HTML is accepted, and how native footnotes are represented.
- **Login:** the Substack session cookie, stored in Keychain. Start with the simplest
  version (Drew pastes the cookie); a login window inside Tauri can come later. Handle
  expiry clearly with a status and a re-login prompt. Never fail silently.
- **Link a document:** from the Substack drafts panel (proposed **⌘⇧D**), link the
  current document. This creates a draft and writes `substack_draft_id` to the
  frontmatter. New documents can start as Substack drafts the same way.
- **Push triggers**, for linked documents only: about 20 seconds after typing stops,
  and immediately on ⌘S. Back off on errors and respect rate limits.
- **Status** in the bottom-left status area: synced, syncing, offline or login needed.
  Keep it minimal.
- **Fallback:** when sync fails, ⌘⇧C copy-out still works.

### Phase 2b: Substack pull

- **When to check:** on opening a linked document, on window focus, and about every
  5 minutes while one is open.
- **Rule:** if Substack's version is newer than `substack_synced_at` *and* the local file
  hasn't changed since the last sync, pull it in quietly (Substack JSON/HTML →
  `htmlToMarkdown`).
- **The drafts panel** also lists Substack drafts that aren't linked yet. Importing one
  creates a local document.
- **Substack-only elements** (buttons, subscribe widgets, embeds, the paywall marker) are
  kept as opaque tokens, such as `<!-- substack:button {...} -->`. The live preview shows
  them as a small chip, and pushes write them back unchanged.

### Phase 2c: three-way merge and conflicts

- When both sides have changed, run a three-way merge against the last-synced copy.
- Overlapping changes, **simple first version:** keep the local document as it is, save
  Substack's version as `Name (Substack conflict).md`, and tell Drew. A keyboard-driven
  diff view can come later.
- No change is ever lost, and every merge or conflict gets a ledger commit.

### Phase 3: site publish (placeholder — build after the Bureau redesign ships)

**Site facts:** plain static HTML/CSS/JS in the private repo `pleadthefish/portfolio-site`,
hosted on Cloudflare Pages. Every push to `main` runs `build.js` and deploys in about
30 seconds. The Bureau multi-page redesign is in progress on the `redesign` branch; its
build step still needs extending to handle multiple pages.

**What the Bureau build has to support:**
- PrettyWriter commits `writing/<slug>.md` (with frontmatter) to the site repo.
- `build.js` renders `writing/*.md` into `/writing/<slug>/` pages from a template,
  endnotes included. The existing checks (`check-page.js`, the guard against copy
  starting with `[`) still apply.

**Publish flow (proposed shortcut: ⌘⇧↵, then Enter to confirm):**
1. Commit the `.md` to the site repo and push to `main`. The confirmation is Drew's
   go-ahead.
2. Write `canonical_url` to the frontmatter.
3. If `mirror: substack`, add an "Originally published at drew-parrish.com" footer to the
   Substack draft and open it in Substack's editor for Drew to publish.
4. Later, read the publication's public RSS feed to find the live Substack URL and write
   `substack_url`. The site page can then show an "Also on Substack" link (IndieWeb
   *u-syndication*).

**Until Phase 3 ships (Drew to choose):** *hold* (keep the piece as a Substack draft and
don't publish there yet) or *backfill* (publish on Substack now, then add the piece to the
site later with its original date and a canonical footer).

## 6. Frontmatter schema (proposed; follows `pw-format.js`)

```yaml
pw_id: 1732512345678          # existing
font: Traveling Typewriter    # existing
textSize: medium              # existing
background: 4                 # existing
created: 2026-11-24T23:00:00.000Z  # existing (ISO timestamp)
ideas: [...]                  # existing

mirror: substack              # new. Absent = not mirrored (the default)
slug: on-digital-orality      # new. Set once at first link or publish, never changed
substack_draft_id: 148213977  # new. Set when the Substack draft is linked or created
substack_synced_at: 2026-11-24T23:10:00Z  # new. Time of the last successful sync
canonical_url: https://drew-parrish.com/writing/on-digital-orality  # new. Phase 3
substack_url: https://...substack.com/p/...  # new. From RSS after Drew publishes
```

Keep keys **flat** so they show up cleanly in Obsidian Properties. Unknown keys are still
kept (existing codec behavior).

## 7. Proposed shortcuts

Checked against `setupKeyboardShortcuts()` on 2026-11-25 (see Reconciliation).
Separately, ⌘⇧P currently also toggles Projects (a known bug).

| Shortcut | Action | Phase |
|---|---|---|
| ⌘⇧C | Copy as rich text | A |
| ⌘⌥⇧V (proposed) | Paste as plain text, skipping conversion | A |
| ⌘⇧D | Substack drafts panel (link, import, new) | 2a |
| ⌘S | Save, and push now if the document is linked | 2a |
| ⌘⇧↵ then Enter | Publish to site (confirmation required) | 3 |

## 8. Risks and unknowns

| Risk | Mitigation |
|---|---|
| **Substack's terms** prohibit reverse engineering and automated access, so action against the account is possible | Personal use only, drafts only, a low request rate, and clear disclosure if it's ever distributed. Drew accepts this risk knowingly |
| Unofficial API changes break sync | Keep all Substack-specific code in `SubstackAdapter`; copy-out still works; clear error states |
| Converting between Markdown and Substack's format loses things | Fixture tests, opaque tokens for Substack-only elements, documented losses |
| Clipboard behavior in Safari and Tauri WebKit | Test early in Phase A |
| Images | Remote images pass through unchanged. **Local images in v2 have to be uploaded to Substack:** check the upload endpoint in 2a, or defer |
| Endnotes in Substack | Native Substack footnotes may not come from pasted HTML. Test in Phase A; the draft API may be the only way to get native footnotes |
| Secrets leaking into the vault or git | Keychain only; add a pre-commit check for secrets in `.prettywriter/` |

## 9. Open questions for Drew

1. Approve the principle wording in §2?
2. Confirm the URL pattern `drew-parrish.com/writing/<slug>`.
3. Paste conversion: on by default? Which plain-paste shortcut?
4. Until Phase 3: hold or backfill?
5. Docs folder: where in the vault? Is the vault already a git repo?
6. *(Added when filing)* There's no v2 plan file to cross-reference. Should the pointer
   go in the v2 section of `CLAUDE.md` on `v2-tauri`, or should the v2 plan be rebuilt as
   a file in `docs/superpowers/plans/`?

## 10. Out of scope

Publishing through the Substack API; Substack Notes; scheduling; analytics; cross-posting
to Medium and others (the adapter design allows it later); print shop checkout (a
separate roadmap item).
