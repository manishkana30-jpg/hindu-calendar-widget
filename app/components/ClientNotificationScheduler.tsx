"use client";

import { useEffect } from 'react';
import { initAutomaticDailyNotifications } from '@/src/lib/notifications/client-trigger';

export function ClientNotificationScheduler() {
  useEffect(() => {
    // Register Service Worker for offline PWA & schedule automatic daily notifications
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').then(() => {
        initAutomaticDailyNotifications();
      }).catch((err) => {
        console.log('SW registration error:', err);
      });
    } else {
      initAutomaticDailyNotifications();
    }
  }, []);

  return null;
}
