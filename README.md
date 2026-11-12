# STUDY COMMAND – Personal Exam Preparation & Study Accountability Command Center

**STUDY COMMAND** is a high-performance Windows desktop application built with Electron, React, TypeScript, Vite, and Tailwind CSS. It is engineered specifically for personal exam preparation, structured daily study routines, and reliable background accountability.

---

## ⚡ Key Features

### 1. Futuristic Productivity Command Dashboard
- **Live Local Telemetry**: Displays the current time, greeting based on time of day, and comprehensive daily metrics.
- **Daily Progress Tracking**: Real-time percentage progress bar, completed vs remaining sessions counter.
- **Active & Upcoming Session Telemetry**: Highlights the currently active or next scheduled study block with a one-click **START STUDY SESSION** action.
- **Exam Countdown Watch**: Displays a live, ticking countdown (days, hours, minutes, seconds) to the nearest upcoming exam.
- **Full 16-Slot Daily Timetable**: Visual timeline from 10:30 AM to 9:30 PM+ showing sessions, breaks, meals, and free time.

### 2. Tailored Personal Daily Routine (10:30 AM to 12:30 AM)
Configured around a 30-minute maximum concentration threshold with dedicated rest intervals:
- **10:30–11:00 AM**: Study Session 1 (CN)
- **11:00–11:15 AM**: Morning Break
- **11:15–11:45 AM**: Study Session 2 (S3 Mathematics)
- **11:45 AM–12:00 PM**: Mid-Morning Break
- **12:00–12:30 PM**: Study Session 3 (DAA)
- **12:30–2:00 PM**: Lunch & Rest
- **2:00–2:30 PM**: Study Session 4 (ML)
- **2:30–2:45 PM**: Afternoon Break
- **2:45–3:15 PM**: Study Session 5 (MC)
- **3:15–5:00 PM**: Free Time
- **5:00–5:30 PM**: Study Session 6 (DM)
- **5:30–7:30 PM**: Free Time & Dinner
- **7:30–8:00 PM**: Study Session 7 (CN / Revision)
- **8:00–9:00 PM**: Free Time
- **9:00–9:30 PM**: Study Session 8 (S3 Mathematics / Problem Solving)
- **After 9:30 PM**: Free Time & Wind Down (Bedtime: 12:30 AM)
*(All timings and labels are editable in the Settings page).*

### 3. Exam Schedule & Live Countdown Tickers
Preconfigured with all semester examinations:
- **November 23, 2026**: Computer Networks (CN)
- **November 24, 2026**: S3 Mathematics
- **November 27, 2026**: Design & Analysis of Algorithms (DAA)
- **December 1, 2026**: Machine Learning (ML)
- **December 3, 2026**: Mobile Computing (MC)
- **December 7, 2026**: Data Mining (DM)
- Features dedicated subject accent colors and syllabus coverage readiness indicators.

### 4. Smart Windows Reminder System (Background Main Process)
- **Reliable Background Execution**: Powered by a dedicated background scheduler in the Electron main process that runs continuously—even when the window is minimized or hidden in the system tray.
- **Native Windows Notifications**: Sends notifications at scheduled study session starts and break transitions.
- **Tray & Notification Interaction**: Clicking a desktop notification immediately restores and focuses the window and initiates focus mode.
- **Duplicate Prevention & Skip Respect**: Automatically tracks sent notification IDs for the day and suppresses notifications for sessions marked as skipped or completed.
- **Sleep & Rest Protection (Quiet Hours)**: Notifications are muted during the 12:30 AM – 10:00 AM rest period.
- **Test Notification Button**: Instantly verifies that Windows notifications and sound chimes are functioning.

### 5. Pomodoro Focus Mode
- **Configurable Intervals**: Default 30-min focus, 15-min short break, 30-min long break (after 4 cycles).
- **Drift-Free Precision**: Calculates remaining time against absolute timestamps (`Date.now()`), remaining completely accurate even if Chromium throttles background tabs.
- **Sleek Glowing Circular Ring**: Visual progress feedback with custom subject theme colors.
- **Offline Web Audio Synthesis**: Harmonic chime on focus start, dual-tone alert on break over, and celebration fanfare on completion.
- **Session Linking**: Automatically logs completed sessions to Session History and marks the corresponding scheduled daily block as completed.

### 6. Missed Session Management
- Automatically flags sessions as missed if their scheduled time has passed without completion.
- Displays high-priority warning cards on the Dashboard.
- Offers instant actions: **Reschedule**, **Done**, or **Skip**.
- Manual rescheduling dialog validates against sleep hours (12:30 AM – 10:00 AM) to protect sleep routine.

### 7. Windows Startup & System Tray Integration
- **Windows Autostart**: Uses `app.setLoginItemSettings` to automatically boot into the background on Windows startup (enabled by default).
- **Single Instance Lock**: Prevents duplicate instances; launching a second instance brings the existing window to focus.
- **Minimize to Tray on Close**: Closing the application window minimizes to the Windows system tray rather than quitting, ensuring background reminders continue uninterrupted.
- **Custom System Tray Menu**:
  - Open Dashboard
  - Start Study Session
  - Pause / Resume Reminders
  - Send Test Notification
  - Quit Application

### 8. Local Secure Persistence
- Zero cloud dependency, zero external trackers, zero accounts.
- Atomic file writes (`.tmp` write and rename) prevent file corruption on unexpected shutdowns.
- JSON backup export and import functionality built directly into Settings.

---

## 🛠️ Architecture

```
study-command/
├── build/
│   ├── icon.ico            # Windows application icon
│   └── icon.png            # 256x256 high-resolution icon
├── electron/
│   ├── main.ts             # Electron main process (tray, single-instance, startup, IPC)
│   ├── preload.ts          # Secure context bridge
│   ├── scheduler.ts        # Reliable background reminder & missed session manager
│   ├── store.ts            # Atomic local JSON database & defaults
│   └── types.ts            # Shared TypeScript contracts
├── src/
│   ├── components/
│   │   ├── Header.tsx      # Draggable titlebar & window controls
│   │   ├── Sidebar.tsx     # Navigation & live clock widget
│   │   ├── CircularProgress.tsx # SVG glow timer progress ring
│   │   └── RescheduleModal.tsx  # Reschedule session modal
│   ├── pages/
│   │   ├── Dashboard.tsx   # Command center dashboard
│   │   ├── StudyPlanner.tsx# Syllabus & curriculum manager
│   │   ├── ExamCountdown.tsx# Multi-exam countdown trackers
│   │   ├── FocusMode.tsx   # Pomodoro focus screen
│   │   ├── SessionHistory.tsx# Audit logs & analytics
│   │   └── Settings.tsx    # Configuration & timetable editor
│   ├── context/
│   │   └── AppContext.tsx  # State manager synchronized with Electron
│   ├── utils/
│   │   ├── audio.ts        # Offline Web Audio synthesizer
│   │   └── time.ts         # Formatting & countdown calculation
│   ├── App.tsx             # Root application shell
│   ├── main.tsx            # React entry
│   └── index.css           # Tailwind & futuristic theme CSS
├── release/                # Generated Windows installer (.exe) & unpacked binaries
├── package.json
└── vite.config.ts
```

---

## 🚀 Development & Build Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs Vite dev server and launches Electron with hot-reloading |
| `npm run build` | Compiles Vite React renderer and Electron TypeScript main/preload scripts |
| `npm run dist` | Builds production artifacts and generates the Windows NSIS installer `.exe` |
| `npm run dist:dir` | Generates the unpacked Windows executable inside `release/win-unpacked/` |

## Acknowledgements

Built with assistance from **[ChatGPT](https://chatgpt.com/)** and **[Google Antigravity](https://antigravity.google/)**.
**Made with curiosity, code, and AI.**
