# PrettyWriter

A distraction-free writing environment inspired by the simplicity of analog typewriters. Keep your fingers on the keys and let the words flow.

## ⚠️ Important: Local Storage Only

**Your data is stored locally in your browser.**
Always use the same browser/device to access your projects.

- No cloud sync or backup
- Clearing browser data will erase all projects
- Use the Export feature (⌘E) regularly to back up your work

## Features

- **Keyboard-first workflow** - Navigate primarily with shortcuts
- **Live Markdown** - Markdown renders as you write, Obsidian-style: bold, italics, code and links take effect the moment you type past the closing mark, and the symbols reappear when your cursor touches them. Headings, quotes and lists render once you leave the line. Images show inline. Your text is saved exactly as typed
- **Endnotes** - Add a note with `⌘⇧6` or type `[^1]`; the notes section at the end of the document creates itself and stays in reference order. References show as superscript numbers, and a click (or `⌘J`) jumps between a number and its note. Standard Markdown footnote syntax, so notes carry over to other tools
- **Projects & folders** - Simple organization to your writing
- **Ideas & notes panel** - Capture thoughts without losing focus. Promotes Rhizomatic thinking. 
- **Hashtag system** - Tag and filter ideas across projects
- **Endnotes at a glance** - In the Ideas panel, switch Recent Ideas to Endnotes to see the document's notes in order; click one to jump to it
- **Multiple fonts** - Georgia, Traveling Typewriter, Drafting Mono, Times New Roman, Courier New
- **Background images** - Immerse in the writing environment with original film photography backgrounds
- **Typing sound effects** - Optional typewriter sounds
- **Export** - Save as .txt, .md, or .html
- **Writing prompts** - Get inspired with random prompts
- **Project history** - Quickly return to recent work

## Keyboard Shortcuts

### Essential Commands
- `⌘S` - Save current project
- `⌘K` - Toggle Ideas panel
- `⌃ ⌃` - Toggle Projects panel (double-tap Control)
- `⌘\` - Toggle History panel
- `⌘E` - Export menu
- `⌘F` - Find (and replace) in the whole document, ⌘F again to close; `⌘G` / `⌘⇧G` next / previous
- `⌃⌘F` - Fullscreen

### Writing Environment
- `⌘B` - Change background image
- `⌘P` - Show random writing prompt
- `⌘/` - Toggle typing sound effects (FX)

### Text Controls
- `⌘]` - Next font
- `⌘[` - Previous font
- `⌘.` - Increase text size
- `⌘,` - Decrease text size
- `⌘`-click - Open a link

### Endnotes
- `⌘⇧6` - Add an endnote at the cursor (`⌘^`)
- `⌘J` - Jump between an endnote number and its note

## Getting Started

1. Open `index.html` in your browser
2. Read the User Manual (automatically opens on first visit)
3. Double-tap `⌃` (Control) to open the Projects panel
4. Press `N` to create your first project
5. Start writing!

## Philosophy

Like a typewriter, PrettyWriter keeps things simple:
- Just you, the machine, and the page
- Minimal formatting - focus on the first draft
- Keyboard shortcuts keep you in the flow
- No mousing about while you're writing
- Notes & Ideas panel for networked, non-linear thought capture

The first draft is never the best draft, but it's the most important one. You can't go anywhere without a first draft.

## License

MIT License - See [LICENSE](LICENSE) for details
## 📜 Licensing

### Software Code
The source code is licensed under the [MIT License](LICENSE) - feel free to 
learn from, modify, and build upon this project.

### Photography & Media
**All photographs and audio files are © 2025 [Your Name], All Rights Reserved.**

These are my original creative works and are **not** covered by the MIT license. 
They are provided for viewing within this application only. Please do not 
extract, redistribute, or reuse these images without permission.

See [CONTENT-LICENSE.txt](CONTENT-LICENSE.txt) for full terms.

### Want to Use This Project?
- Fork the code and add your own photos/music
- Learn from and improve the code
- Share and contribute improvements
- Please don't redistribute my original photography

## Development Status

This is an early version under active development. Feedback welcome!

### Known Limitations
- No cloud sync or backup
- The editor (CodeMirror) loads from the web the first time; offline it falls back to a plain text box without live Markdown
- Images in your documents load from their URLs while you write
- Custom fonts require font files in `/typefaces/` folder
- Background images require files in `/images/` folder

## Credits

Built by Drew Parrish ([@pleadthefish](https://github.com/pleadthefish))
