import { Notification, BrowserWindow } from 'electron';
import { StoreManager } from './store';
import { DailySessionRecord } from './types';

export class BackgroundScheduler {
  private storeManager: StoreManager;
  private intervalTimer: NodeJS.Timeout | null = null;
  private sentNotificationKeys: Set<string> = new Set();
  private getMainWindow: () => BrowserWindow | null;
  private isPaused: boolean = false;

  constructor(storeManager: StoreManager, getMainWindow: () => BrowserWindow | null) {
    this.storeManager = storeManager;
    this.getMainWindow = getMainWindow;
  }

  public start(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }
    // Check every 10 seconds for precise notification triggers
    this.intervalTimer = setInterval(() => {
      this.checkSchedule();
    }, 10000);

    // Initial check right after start
    setTimeout(() => this.checkSchedule(), 2000);
  }

  public stop(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  public pauseReminders(): void {
    this.isPaused = true;
  }

  public resumeReminders(): void {
    this.isPaused = false;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public sendTestNotification(): boolean {
    return this.triggerNotification(
      'STUDY COMMAND – Test Notification',
      'System reminder alert operational! Notifications are active in the background.',
      true
    );
  }

  public triggerNotification(title: string, body: string, playSound: boolean = true): boolean {
    if (!Notification.isSupported()) {
      console.warn('Electron Notifications are not supported on this platform/session.');
      return false;
    }

    try {
      const notification = new Notification({
        title,
        body,
        silent: !playSound,
        urgency: 'critical',
        timeoutType: 'never',
      });

      notification.on('click', () => {
        const win = this.getMainWindow();
        if (win) {
          if (win.isMinimized()) win.restore();
          if (!win.isVisible()) win.show();
          win.focus();
          win.webContents.send('notification-clicked');
        }
      });

      notification.show();
      return true;
    } catch (err) {
      console.error('Failed to trigger notification:', err);
      return false;
    }
  }

  private isQuietHour(timeStr: string, quietStart: string, quietEnd: string): boolean {
    // quietStart e.g. "00:30", quietEnd e.g. "10:00"
    const [h, m] = timeStr.split(':').map(Number);
    const [startH, startM] = quietStart.split(':').map(Number);
    const [endH, endM] = quietEnd.split(':').map(Number);

    const timeMin = h * 60 + m;
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    if (startMin < endMin) {
      return timeMin >= startMin && timeMin < endMin;
    } else {
      // Overnight quiet hours, e.g. 00:30 to 10:00 or 23:00 to 07:00
      return timeMin >= startMin || timeMin < endMin;
    }
  }

  private checkSchedule(): void {
    if (this.isPaused) return;

    const data = this.storeManager.getData();
    if (!data.settings.notificationsEnabled) return;

    const now = new Date();
    const today = this.storeManager.getTodayDateString();
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const currentTimeStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
    const currentTotalMin = currentH * 60 + currentM;

    // Check Quiet Hours
    if (data.settings.quietHoursEnabled) {
      if (this.isQuietHour(currentTimeStr, data.settings.quietHoursStart, data.settings.quietHoursEnd)) {
        return;
      }
    }

    const records: DailySessionRecord[] = data.dailyRecords[today] || [];
    const leadTime = data.settings.leadTimeMinutes || 0;

    let updatedRecords = false;

    for (const record of records) {
      // 1. Evaluate missed sessions
      const [endH, endM] = record.endTime.split(':').map(Number);
      const endTotalMin = endH * 60 + endM;

      if (record.status === 'PENDING' && currentTotalMin > endTotalMin) {
        record.status = 'MISSED';
        updatedRecords = true;
      }

      // 2. Notification trigger check
      if (record.status === 'SKIPPED' || record.status === 'COMPLETED') {
        continue;
      }

      // Determine target notification time considering lead time
      const [startH, startM] = record.startTime.split(':').map(Number);
      const startTotalMin = startH * 60 + startM;
      const notifyTriggerMin = startTotalMin - leadTime;

      // Check if current time matches notifyTriggerMin (within 1 min margin)
      if (currentTotalMin >= notifyTriggerMin && currentTotalMin < notifyTriggerMin + 2) {
        const notifKey = `${today}-${record.id}-start-${notifyTriggerMin}`;
        if (!this.sentNotificationKeys.has(notifKey)) {
          this.sentNotificationKeys.add(notifKey);

          // Find subject details
          const subject = data.subjects.find(s => s.id === record.subjectId);
          const subjName = subject ? subject.name : 'Study Session';
          const topicName = record.topicTitle || 'Scheduled Topic';

          let title = `Time to study! ${subjName}`;
          let body = `Session: ${record.label}. Topic: ${topicName}. Your 30-minute session starts now.`;

          if (leadTime > 0) {
            title = `Upcoming Study Session: ${subjName}`;
            body = `${record.label} starts in ${leadTime} minute${leadTime > 1 ? 's' : ''}! Get ready.`;
          }

          this.triggerNotification(title, body, data.settings.notificationSoundEnabled);
        }
      }

      // Check for break completion notification if previous was break
      // Check timetable slots for break transitions
    }

    // Also check non-study timetable slots (like breaks ending)
    const timetable = data.timetable;
    for (const slot of timetable) {
      if (slot.type === 'BREAK' || slot.type === 'LUNCH') {
        const [endH, endM] = slot.endTime.split(':').map(Number);
        const endTotalMin = endH * 60 + endM;

        if (currentTotalMin >= endTotalMin && currentTotalMin < endTotalMin + 2) {
          const breakEndKey = `${today}-${slot.id}-breakend`;
          if (!this.sentNotificationKeys.has(breakEndKey)) {
            this.sentNotificationKeys.add(breakEndKey);
            this.triggerNotification(
              `${slot.label} is over!`,
              `Get ready for your next study session. Stay sharp!`,
              data.settings.notificationSoundEnabled
            );
          }
        }
      }
    }

    if (updatedRecords) {
      this.storeManager.saveData();
      const win = this.getMainWindow();
      if (win && !win.isDestroyed()) {
        win.webContents.send('store-updated', this.storeManager.getData());
      }
    }
  }
}
