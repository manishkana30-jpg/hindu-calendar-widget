'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * ContentProtection Component
 * 
 * Safeguards Daily Tithi from unauthorized data harvesting, clipboard copying,
 * devtools source extraction shortcuts, and context menu inspection, while maintaining
 * accessibility and full functionality for form inputs (city search, modals, toggles).
 * 
 * Features:
 * 1. Blocks right-click context menu with a branded security notification.
 * 2. Blocks unauthorized copy/cut events and appends copyright attribution.
 * 3. Blocks View Source (Ctrl+U / Cmd+U) and Save Page (Ctrl+S / Cmd+S).
 * 4. Disables image/table dragging.
 * 5. Full support for input/textarea/select so users can search and interact seamlessly.
 */
export function ContentProtection() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showSecurityNotice = (message: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToastMessage(message);
    timeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Helper: Is the user actively interacting with an editable input field?
    const isInputElement = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      return (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        target.isContentEditable ||
        Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
      );
    };

    // 1. Right Click / Context Menu Guard
    const handleContextMenu = (e: MouseEvent) => {
      if (isInputElement(e.target)) return; // Allow right click inside search/inputs
      e.preventDefault();
      showSecurityNotice('🛡️ Content Protected © Daily Tithi • Intellectual Property & DMCA Reserved.');
    };

    // 2. Clipboard Copy & Cut Guard
    const handleCopy = (e: ClipboardEvent) => {
      if (isInputElement(e.target)) return; // Allow copying own input in search boxes

      e.preventDefault();
      showSecurityNotice('⚠️ Content is Protected • Data extraction and unauthorized copying are prohibited.');

      // If clipboardData is available, optionally provide a legal copyright notice
      if (e.clipboardData) {
        e.clipboardData.setData(
          'text/plain',
          '© 2026 Daily Tithi (https://dailytithi.com). All Rights Reserved. Proprietary Vedic astrometry and ephemeris calculations are protected under international copyright laws.'
        );
      }
    };

    const handleCut = (e: ClipboardEvent) => {
      if (isInputElement(e.target)) return;
      e.preventDefault();
    };

    // 3. Keyboard Shortcut Guard (View Source, Save Page, DevTools shortcuts)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputElement(e.target)) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + U (View Source)
      if (cmdOrCtrl && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        showSecurityNotice('🔒 Source Code Protected • Direct source inspection is restricted.');
        return;
      }

      // Ctrl/Cmd + S (Save Page)
      if (cmdOrCtrl && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        showSecurityNotice('🔒 Page Saving Restricted • Protected by Daily Tithi.');
        return;
      }

      // F12 or Ctrl+Shift+I / Ctrl+Shift+J (DevTools Inspector)
      if (
        e.key === 'F12' ||
        (cmdOrCtrl && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j'))
      ) {
        e.preventDefault();
        showSecurityNotice('🛡️ Developer Inspection Disabled in Production.');
        return;
      }

      // Ctrl/Cmd + C (Copy when text is selected outside inputs)
      if (cmdOrCtrl && (e.key === 'c' || e.key === 'C')) {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
          e.preventDefault();
          showSecurityNotice('⚠️ Data Copying Restricted • © Daily Tithi.');
          return;
        }
      }
    };

    // 4. Drag & Drop Protection (prevents dragging images and data tables)
    const handleDragStart = (e: DragEvent) => {
      if (isInputElement(e.target)) return;
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  if (!toastMessage) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-full bg-[#0a0f1d]/95 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-medium shadow-2xl backdrop-blur-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200 select-none pointer-events-none"
    >
      <span>{toastMessage}</span>
    </div>
  );
}

export default ContentProtection;
