# STUDY COMMAND – Release v2.0.0

## What's New in Version 2.0.0

STUDY COMMAND v2.0.0 marks a major upgrade from initial prototype to a full-featured, exam-oriented desktop command center.

### 🎯 1. Complete KTU University Syllabus Integration
- **6 Full Courses Configured**:
  - `PCCST501`: Formal Languages and Automata Theory
  - `PCCST502`: Computer Networks
  - `PCCST503`: Database Management Systems
  - `PBCST504`: Professional Ethics
  - `PECST525`: Web Programming
  - `GAMAT301`: Graph Theory and Linear Algebra
- **24 Comprehensive Modules & 83 Verified Discrete Topics**:
  - Structured modules with real course objectives, outcomes, and KTU marks weightings.
  - Granular topic definitions with subtopics, formulas, and verified reference textbooks.

### ⚡ 2. Topic-Aware Focus Mode with Local AI Study Prompts
- **Preparation Screen**: Review subject, module, and topic details before the focus timer starts.
- **Local AI Study Prompt Generator**:
  - 6 Exam Goals: Short Notes, Detailed Explanation, Important Q&A, Numerical Problems, Last-Minute Revision, and Viva Prep.
  - 3 Length Options: Short, Medium, Detailed.
  - Customizable inclusions: Examples, Mathematical Formulas, and High-Yield Exam Questions.
  - 1-Click Launchers for ChatGPT, Claude, and Gemini with auto-copied prompts.
- **Post-Session Accountability Dialog**: Record topic progress with statuses (`COMPLETED`, `NEEDS_REVISION`, `IN_PROGRESS`).

### ⌨️ 3. Universal Command Palette (`Ctrl+K`)
- Instant fuzzy-filtered search across all 83 syllabus topics and navigation tabs.
- Quick navigation and direct launch into Focus Mode with prepopulated prompts.

### ⏱️ 4. Focus Session Keyboard Shortcuts
- `Space`: Pause / Resume timer.
- `R`: Reset session timer.
- `S`: Skip / Finish session early.

### 🎨 5. High-Contrast Light Theme Overhaul
- Custom dual-palette CSS token architecture (`--app-bg`, `--app-surface`, `--app-line`, `--app-ink`, `--app-muted`, `--app-accent`).
- Clear, visible circular progress tracks in both light and dark modes.

### 🧪 6. Automated Testing & Production Build Pipeline
- 18 Vitest unit tests covering syllabus integrity, time utilities, prompt generation, and recommendations.
- Clean production builds: dev controls like test notifications hidden in production.
- Automated installer artifact naming: `Study-Command-v2.0.0-Setup.exe`.

---

**Installer Download:**
- Windows Setup Installer: `Study-Command-v2.0.0-Setup.exe` (NSIS 64-bit)
