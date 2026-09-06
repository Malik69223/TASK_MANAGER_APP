import { useState, useEffect, useCallback } from 'react';

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

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

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        new Notification('🔔 Notifications Enabled!', {
          body: 'TaskManager will alert you to complete your tasks and maintain your streak 🔥',
          icon: '/favicon.svg',
        });
      }
      return permission;
    }
    return 'denied';
  };

  const sendPushNotification = (title, body) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.svg',
      });
    }
  };

  const checkAndSendTaskNotifications = useCallback((taskList) => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      Notification.permission !== 'granted' ||
      !Array.isArray(taskList)
    ) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let notified = {};
    try {
      notified = JSON.parse(localStorage.getItem('taskmanager_notified_tasks') || '{}');
    } catch (e) {}

    let updated = false;

    taskList.forEach((task) => {
      if (task.status !== 'Pending' || !task.dueDate) return;

      const due = new Date(task.dueDate);
      due.setHours(0, 0, 0, 0);

      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      // 1 day before notification rule
      if (diffDays === 1 && !notified[`1day_${task._id}`]) {
        new Notification(`⏰ 1-Day Task Reminder`, {
          body: `"${task.title}" is due tomorrow! Stay on track to finish it.`,
          icon: '/favicon.svg',
          tag: `1day_${task._id}`,
        });
        notified[`1day_${task._id}`] = true;
        updated = true;
      } else if (diffDays === 0 && !notified[`today_${task._id}`]) {
        new Notification(`🔔 Task Due Today!`, {
          body: `"${task.title}" is due today! Don't forget to complete it.`,
          icon: '/favicon.svg',
          tag: `today_${task._id}`,
        });
        notified[`today_${task._id}`] = true;
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem('taskmanager_notified_tasks', JSON.stringify(notified));
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installPWA,
    notificationPermission,
    requestNotificationPermission,
    sendPushNotification,
    checkAndSendTaskNotifications,
  };
};
