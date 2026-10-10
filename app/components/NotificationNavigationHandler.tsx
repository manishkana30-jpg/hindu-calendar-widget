"use client";

import { useNotificationNavigation } from '@/src/hooks/useNotificationNavigation';

/**
 * Client component that connects Notification deep-linking and Service Worker
 * warm-tab routing to the interactive Vedic Panchang & Muhurat modals.
 * Must be rendered within a React Suspense boundary.
 */
export function NotificationNavigationHandler() {
  useNotificationNavigation();
  return null;
}
