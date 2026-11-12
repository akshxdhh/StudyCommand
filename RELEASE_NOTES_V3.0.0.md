# STUDY COMMAND – Release v3.0.0

## What's New in Version 3.0.0

STUDY COMMAND v3.0.0 delivers a major evolutionary leap, transforming the platform into a multi-user, multi-lingual, intelligent exam command center equipped with local PDF parsing, offline AI voice assistance, customized study rhythms, and advanced focus capabilities.

---

### 👤 1. Multi-User Personalization & Profile Switcher
- **Independent Profiles**: Create and manage multiple user profiles with custom avatars, degree/courses, target exam dates, and daily study targets.
- **Top Bar Profile Switcher**: Fast one-click profile switching from the header.
- **Scoped Study Progress**: User-specific dashboard greetings, target exam countdowns, and study rhythms.

---

### 📄 2. Intelligent PDF Syllabus & Exam Timetable Importer
- **Automated Text Extraction**: Built-in `pdf-parse` engine parses university syllabus and timetable PDFs directly on your machine.
- **Entity Identification**:
  - Automatically extracts Course Codes and Course Titles.
  - Detects Modules (Module 1..n or Unit 1..n) and breaks down discrete topics and subtopics.
  - Detects Exam Schedule dates, Forenoon/Afternoon sessions, and course codes.
- **Interactive Review & Correction Modal**: Inspect extracted modules, edit titles, exclude unwanted items, and merge cleanly into your syllabus planner and timetable with zero risk to existing courses.

---

### ⏱️ 3. One-Click Study & Break Session Presets
- **6 Built-In Study Rhythms**:
  - **Pomodoro (25/5)**: 25m Focus, 5m Rest
  - **Sprint (30/5)**: 30m Focus, 5m Rest
  - **Lecture Block (45/10)**: 45m Focus, 10m Rest
  - **Extended Focus (50/10)**: 50m Focus, 10m Rest
  - **Deep Work (60/15)**: 60m Focus, 15m Rest
  - **Custom Preset**: User-configured focus and break intervals
- **Instant Switching**: Available in Focus Mode top bar and Settings.

---

### 🌐 4. Full Internationalization (i18n) & First-Launch Onboarding
- **4 Languages Supported**:
  - English (`en`)
  - Spanish (`es`)
  - Malayalam (`ml`) – vernacular support for KTU students
  - Hindi (`hi`)
- **First-Launch Onboarding Wizard**: 3-step interactive setup for call sign, study major, target exam date, study rhythm preset, and visual theme.

---

### 🛡️ 5. Focus Mode V3 Enhancements
- **Full Screen Focus Mode**: Distraction-free full screen with shortcut `F` and dedicated header button.
- **Safe Distraction Shield**: Non-destructive monitoring that alerts you if your focus drifts without terminating user applications or risking work loss.
- **Local Ambient Soundscapes**: 100% offline Web Audio synthesizer with **Silent**, **Rainfall**, **White Noise**, and **Binaural Focus 40Hz (Gamma)**.
- **Engagement Monitor (Beta)**: Local client-side camera presence detection using WebRTC canvas analysis (zero cloud, zero recording).
- **Multi-Monitor Display Selection**: Move windows across connected displays via Electron `desktop:getDisplays`.

---

### 🎙️ 6. Offline AI Voice Assistant
- Powered by standard Chromium Web Speech API (STT & TTS).
- **Voice Commands**:
  - *"Start focus session"*
  - *"Pause timer"* / *"Resume timer"*
  - *"How much time left?"*
  - *"Read prompt"* (speaks your AI study notes aloud)
  - *"Open dashboard"*, *"Open planner"*, *"Open timetable"*, *"Open analytics"*, *"Open settings"*
- Real-time animated wave visualizer and command cheat-sheet.

---

### 📑 7. Collapsible Sidebar & Refined Visuals
- **Collapsible Rail**: Toggle sidebar with icon-only state and floating tooltips.
- **Comfortable Off-White Light Theme**: High-contrast slate typography on crisp white surfaces.
- **Reduced-Motion Compliant**: Smooth macOS-inspired spring animations honoring user accessibility preferences.

---

### ℹ️ 8. Configurable About Section
- Dedicated About page and modal.
- MIT License viewer.
- Direct links to GitHub repository (`https://github.com/akshxdhh/StudyCommand.git`) and Buy Me a Coffee.

---

### 🧪 9. Rigorous Automated Test Suite
- **30 Passing Vitest Unit Tests** across 7 test suites:
  - `i18n.test.ts`
  - `presets.test.ts`
  - `pdfExtractor.test.ts`
  - `promptGenerator.test.ts`
  - `syllabusIntegrity.test.ts`
  - `time.test.ts`
  - `recommendations.test.ts`

---

**Installer Download:**
- Windows Setup Installer: `Study-Command-v3.0.0-Setup.exe` (NSIS 64-bit)
