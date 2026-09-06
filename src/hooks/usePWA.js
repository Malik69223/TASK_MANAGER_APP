import { useState, useEffect, useCallback, useRef } from 'react';

// Notification messages bank — beautiful, motivating reminders
const REMINDER_MESSAGES = [
  { title: '🌸 Habit Reminder!', body: "Don't forget your habits today! Small steps = big results 💪" },
  { title: '🔥 Streak Alert!', body: "You're on a roll! Complete today's habits to keep your streak alive 🚀" },
  { title: '⏰ Daily Check-In', body: "It's habit time! Open Habit Tracker and crush your goals today ✨" },
  { title: '💪 Stay Consistent!', body: "Consistency is the key. Your habits are waiting for you today!" },
  { title: '🎯 Focus Time!', body: "Block everything else — your daily habits need your attention now 🌟" },
  { title: '🌟 You\'ve Got This!', body: "Every completed habit brings you closer to the best version of yourself 💎" },
  { title: '📈 Progress Awaits!', body: "Your habit graph is waiting to go up! Complete your habits now 📊" },
  { title: '🏆 Champion Mindset!', body: "Champions show up every day. Check your habits and make it count!" },
];

// Get a deterministic reminder message based on time
const getReminder = () => {
  const idx = Math.floor(Date.now() / (1000 * 60 * 60)) % REMINDER_MESSAGES.length;
  return REMINDER_MESSAGES[idx];
};

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );
  const [reminderTime, setReminderTime] = useState(() => {
    return localStorage.getItem('habittracker_reminder_time') || '09:00';
  });
  const [reminderEnabled, setReminderEnabled] = useState(() => {
    return localStorage.getItem('habittracker_reminder_enabled') !== 'false';
  });

  const reminderIntervalRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ─── Scheduled Daily Reminder Engine ───────────────────────────────────────
  useEffect(() => {
    if (reminderIntervalRef.current) clearInterval(reminderIntervalRef.current);

    if (!reminderEnabled) return;

    const checkAndFire = () => {
      if (
        typeof window === 'undefined' ||
        !('Notification' in window) ||
        Notification.permission !== 'granted'
      ) return;

      const now = new Date();
      const [hh, mm] = reminderTime.split(':').map(Number);
      const todayKey = now.toISOString().split('T')[0];
      const firedKey = `habittracker_daily_reminder_${todayKey}`;

      // Fire if current time matches reminder time (within 1-minute window)
      if (now.getHours() === hh && now.getMinutes() === mm) {
        if (!localStorage.getItem(firedKey)) {
          const { title, body } = getReminder();
          try {
            new Notification(title, {
              body,
              icon: '/favicon.svg',
              badge: '/favicon.svg',
              tag: `daily-reminder-${todayKey}`,
              requireInteraction: true,
            });
            localStorage.setItem(firedKey, '1');
          } catch (e) {}
        }
      }
    };

    // Check every 30 seconds so we catch the 1-minute window reliably
    reminderIntervalRef.current = setInterval(checkAndFire, 30_000);
    checkAndFire(); // also fire immediately on mount

    return () => {
      if (reminderIntervalRef.current) clearInterval(reminderIntervalRef.current);
    };
  }, [reminderEnabled, reminderTime]);

  // ─── PWA Install ────────────────────────────────────────────────────────────
  const installPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  // ─── Request Browser Notification Permission ─────────────────────────────────
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        new Notification('🌸 Habit Tracker Notifications Active!', {
          body: "You'll now receive daily habit reminders even when the app is closed 🔥",
          icon: '/favicon.svg',
          tag: 'welcome-notification',
        });
      }
      return permission;
    }
    return 'denied';
  };

  // ─── Manual Push Notification ────────────────────────────────────────────────
  const sendPushNotification = (title, body, options = {}) => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        ...options,
      });
    }
  };

  // ─── Save Reminder Settings ─────────────────────────────────────────────────
  const updateReminderTime = (time) => {
    setReminderTime(time);
    localStorage.setItem('habittracker_reminder_time', time);
  };

  const updateReminderEnabled = (enabled) => {
    setReminderEnabled(enabled);
    localStorage.setItem('habittracker_reminder_enabled', String(enabled));
  };

  // ─── Send Test Reminder ──────────────────────────────────────────────────────
  const sendTestReminder = () => {
    const { title, body } = REMINDER_MESSAGES[0];
    sendPushNotification(title, body, { requireInteraction: false, tag: 'test-reminder' });
  };

  // ─── Task Due-Date Notifications ─────────────────────────────────────────────
  const checkAndSendTaskNotifications = useCallback((taskList) => {
    // Due dates have been removed, so this is left intentionally empty
    // to satisfy TaskContext calling it, while keeping daily reminders active.
  }, []);

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installPWA,
    notificationPermission,
    requestNotificationPermission,
    sendPushNotification,
    sendTestReminder,
    checkAndSendTaskNotifications,
    reminderTime,
    reminderEnabled,
    updateReminderTime,
    updateReminderEnabled,
  };
};
