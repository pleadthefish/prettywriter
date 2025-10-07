const MANUAL_TEXT = `═══════════════════════════════════════════════════════════════════════════════
                           P R E T T Y W R I T E R
                              U S E R   M A N U A L
═══════════════════════════════════════════════════════════════════════════════

Welcome to PrettyWriter, a distraction-free writing environment inspired by composing on analog typewriters and removing barriers between your creative ideas being written down.

With a typewriter it's just you, the machine, and the page. With its array of keyboard shortcuts, PrettyWriter is designed to keep your fingers on the keys and the words flowing. You'll notice that the Projects panel and the Ideas & Notes panel can only be opened with keyboard shortcuts. You're not writing if you're mousing about!

Like a typewriter, there is minimal text formatting available. Don't worry about it, just start writing. The first draft is NEVER the best draft, but the most important one. You can't go anywhere without a first draft.

───────────────────────────────────────────────────────────────────────────────
KEYBOARD SHORTCUTS
───────────────────────────────────────────────────────────────────────────────

ESSENTIAL COMMANDS
    ⌘S          Save current project
    ⌘K          Toggle Ideas panel
    Esc Esc     Toggle Projects panel (double-tap Escape)
    ⌘\          Toggle History panel
    ⌘E          Export menu
    ⌘F          Fullscreen (browser shortcut)

WRITING ENVIRONMENT
    ⌘B          Change background image
    ⌘P          Show random writing prompt
    ⌘F          Toggle fullscreen
    ⌘/          Toggle typing sound effects (FX)

TEXT CONTROLS
    ⌘]          Next font
    ⌘[          Previous font
    ⌘.          Increase text size
    ⌘,          Decrease text size


───────────────────────────────────────────────────────────────────────────────
PROJECTS PANEL (Esc Esc)
───────────────────────────────────────────────────────────────────────────────

The Projects panel is a basic file and document saving structure to organize all your writing into separate projects and folders. Each project saves its own text, ideas and notes, background, and font settings.

BASIC USAGE
    N           Create new project
    F           Create new folder
    Enter       Open selected project
    R           Rename project/folder
    Delete      Delete project/folder
    Up/Down Arrows  Navigate list
    Left/Right Arrows Collapse/open folder
    0           Jump to root level

HOW SAVING WORKS
    • Your text saves automatically as you type
    • ⌘S (panel closed): First time creates a new project with a name
    • ⌘S (panel open): Immediately saves to current project
    • Each project remembers: text, ideas & notes, background, font, and text size

HISTORY PANEL
─────────────────────────────
Functions like a browser history, time stamping your project history and saving it in order. Use it to quickly return to previous projects, if you find the workflow useful.
    • ⌘\         Open History panel


───────────────────────────────────────────────────────────────────────────────
IDEAS & NOTES PANEL (⌘K)
───────────────────────────────────────────────────────────────────────────────

A scratchpad for capturing thoughts, notes, and ideas as you write with minimal disruption to your flow. PrettyWriter promotes networked thinking to tap creativity.

BASIC USAGE
    • Type an idea in the input box
    • Enter: Save idea
    • Shift+Enter: Line break within input box (multi-line ideas)
    • Click any idea to edit it
    • Ideas save to the current project automatically

HASHTAGS
    • Use #hashtags anywhere in your ideas (e.g., "research scene #chapter3")
    • All hashtags appear as clickable pills above the input
    • Click a hashtag to filter ideas

TWO LISTS
    1. CURRENT PROJECT — Ideas for the project you're working on
    2. RECENT IDEAS — Ideas from other projects (click to jump to that project)


───────────────────────────────────────────────────────────────────────────────
EXPORT (⌘E)
───────────────────────────────────────────────────────────────────────────────

Save your writing to your computer in different formats:
    1  Plain text (.txt)
    2  Markdown (.md)
    3  HTML document (.html)

Files download with today's date automatically.

Note: As of right now, PrettyWriter utilizes local browser storage, not cloud storage. If you clear your browser cache you'll lose your work. Exporting is an important backup measure.
───────────────────────────────────────────────────────────────────────────────
FOR TESTERS
───────────────────────────────────────────────────────────────────────────────
Let me know what you liked, what you didn't like! This is a fluid development. An idea coming to life in real time.

YOUR DATA
    • Everything saves to your browser's local storage
    • Data persists between sessions on this device/browser only
    • NOT synced between devices or browsers
    • Clearing browser data will erase all projects

KNOWN LIMITATIONS (EARLY VERSION)
    • No cloud sync or backup yet
    • No undo/redo (use ⌘Z for browser undo)
    • Custom fonts may not load if font files are missing
    • Background images need to be in the ./images/ folder
    • Bugs, surely. Bear with me.

REPORTING ISSUES
When something breaks, please note:
    • What you were doing when it happened
    • Which keyboard shortcut or button you pressed
    • Whether the browser console shows errors (F12 → Console tab)

───────────────────────────────────────────────────────────────────────────────
TIPS FOR FOCUSED WRITING
───────────────────────────────────────────────────────────────────────────────

    1. Start with a prompt (⌘P) if you're stuck
    2. Toggle fullscreen (⌘F) to eliminate distractions
    3. Use Ideas panel (⌘K) to capture tangential thoughts without losing focus
    4. Create project folders by theme (Journal, Fiction, Work, etc.)
    5. Typing sounds (⌘/) can help establish rhythm (or turn them off)


═══════════════════════════════════════════════════════════════════════════════
You're all set. Double-tap Esc to open the Projects Panel and Press N to open your first project.
═══════════════════════════════════════════════════════════════════════════════
`;