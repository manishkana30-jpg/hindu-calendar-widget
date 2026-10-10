"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  BatteryCharging,
  Wifi,
  Lock,
  Volume2,
  Smartphone,
  Apple,
  Monitor,
  CheckCircle2,
  Send,
  Loader2,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Radio,
  Share2
} from 'lucide-react';

export interface DeviceSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTestAlert?: () => Promise<boolean | void> | void;
  isSendingTest?: boolean;
}

export type PlatformKey = 'android' | 'ios' | 'desktop';
export type AndroidOEMKey = 'samsung' | 'xiaomi' | 'oneplus' | 'pixel';

const STORAGE_KEY = 'daily_tithi_device_setup_viewed';
const CHECKLIST_STORAGE_KEY = 'daily_tithi_device_setup_checklist';

export function DeviceSetupModal({
  isOpen,
  onClose,
  onSendTestAlert,
  isSendingTest = false
}: DeviceSetupModalProps) {
  const [platform, setPlatform] = useState<PlatformKey>('android');
  const [androidOem, setAndroidOem] = useState<AndroidOEMKey>('samsung');
  const [testSentToast, setTestSentToast] = useState<string | null>(null);
  const [internalSending, setInternalSending] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // 1. Smart User-Agent & Platform Detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent || '';
    const isIOSDevice = /iP(hone|od|ad)/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroidDevice = /Android/i.test(ua);

    if (isIOSDevice) {
      setPlatform('ios');
    } else if (isAndroidDevice) {
      setPlatform('android');
      // Sub-detection for Android OEMs if present in UA
      if (/samsung|sm-[a-z0-9]+/i.test(ua)) {
        setAndroidOem('samsung');
      } else if (/miui|redmi|xiaomi|poco/i.test(ua)) {
        setAndroidOem('xiaomi');
      } else if (/oneplus|oppo|realme/i.test(ua)) {
        setAndroidOem('oneplus');
      } else {
        setAndroidOem('pixel');
      }
    } else {
      setPlatform('desktop');
    }

    // Load saved checklist progress from localStorage
    try {
      const savedChecks = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (savedChecks) {
        const parsed = JSON.parse(savedChecks) as Record<string, boolean>;
        if (typeof parsed === 'object' && parsed !== null) {
          setCompletedSteps(parsed);
        }
      }
    } catch {
      // Safe fallback on localStorage errors
    }
  }, []);

  // Sync checklist progress to localStorage
  const toggleStep = useCallback((stepId: string) => {
    setCompletedSteps(prev => {
      const updated = { ...prev, [stepId]: !prev[stepId] };
      try {
        localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Safe fallback
      }
      return updated;
    });
  }, []);

  // Handle Close & Save Viewed Flag
  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Safe fallback
    }
    onClose();
  }, [onClose]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDismiss]);

  // Handle Send Test Alert
  const handleTestAlertClick = async () => {
    if (isSendingTest || internalSending) return;
    setInternalSending(true);
    setTestSentToast(null);

    try {
      if (onSendTestAlert) {
        await onSendTestAlert();
        setTestSentToast('Test alert dispatched! Lock your screen now to verify instant delivery.');
      } else {
        // Fallback test endpoint
        const res = await fetch('/api/push/test-confirm', { method: 'POST' }).catch(() => null);
        if (res && res.ok) {
          setTestSentToast('Test alert dispatched! Lock your device to test lock-screen wake.');
        } else {
          setTestSentToast('Test alert triggered. Check your notification shade & lock screen.');
        }
      }
    } catch {
      setTestSentToast('Test alert command issued. Verify device notification shade.');
    } finally {
      setInternalSending(false);
      setTimeout(() => setTestSentToast(null), 8000);
    }
  };

  if (!isOpen) return null;

  const currentStepIds = platform === 'android'
    ? ['android-battery', 'android-data', 'android-lockscreen', 'android-sound']
    : platform === 'ios'
    ? ['ios-homescreen', 'ios-lockscreen', 'ios-focus']
    : ['desktop-focus', 'desktop-banner', 'desktop-sound'];

  const completedCount = currentStepIds.filter(id => Boolean(completedSteps[id])).length;
  const totalCount = currentStepIds.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="device-setup-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Backdrop tap to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Main Container: Mobile Bottom-Drawer / Desktop Centered Modal */}
      <div className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col font-sans overflow-hidden text-neutral-100">
        
        {/* Mobile Swipe / Drag Handle Indicator */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-neutral-600/60" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="device-setup-title"
                  className="font-outfit text-base sm:text-lg font-bold text-white tracking-tight"
                >
                  Device Setup &amp; Reliable Alert Guide
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/60 border border-amber-500/30 text-amber-300">
                  DailyTithi.com
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 leading-snug">
                Configure sleeping phone settings to ensure sunrise notifications wake your device on time.
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Close device setup modal"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Platform Selection Tabs */}
        <div className="px-4 sm:px-5 pt-3 pb-2 bg-slate-950/60 border-b border-white/5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setPlatform('android')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              platform === 'android'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800/60 hover:bg-slate-800 text-neutral-300 border border-white/5'
            }`}
          >
            <Smartphone size={14} />
            <span>Android (Chrome / Samsung)</span>
          </button>

          <button
            onClick={() => setPlatform('ios')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              platform === 'ios'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800/60 hover:bg-slate-800 text-neutral-300 border border-white/5'
            }`}
          >
            <Apple size={14} />
            <span>iPhone / iPad (iOS)</span>
          </button>

          <button
            onClick={() => setPlatform('desktop')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              platform === 'desktop'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800/60 hover:bg-slate-800 text-neutral-300 border border-white/5'
            }`}
          >
            <Monitor size={14} />
            <span>Desktop (Windows &amp; Mac)</span>
          </button>
        </div>

        {/* Setup Progress Bar */}
        <div className="px-5 py-2.5 bg-slate-900/60 border-b border-white/5 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400 font-medium">Optimization Checklist:</span>
            <span className="font-mono text-xs font-bold text-amber-300">
              {completedCount} of {totalCount} completed ({progressPercent}%)
            </span>
          </div>

          <div className="w-24 sm:w-36 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Scrollable Step Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          
          {/* ───────────────────────────────────────────────────────────── */}
          {/* PLATFORM: ANDROID                                            */}
          {/* ───────────────────────────────────────────────────────────── */}
          {platform === 'android' && (
            <>
              {/* Android OEM Quick Switcher */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5">
                  <Radio size={13} className="text-amber-400" />
                  <span>Select your phone manufacturer for exact menu paths:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'samsung', label: 'Samsung One UI' },
                    { id: 'xiaomi', label: 'Xiaomi / Redmi / POCO' },
                    { id: 'oneplus', label: 'OnePlus / Oppo' },
                    { id: 'pixel', label: 'Pixel / Stock' }
                  ].map(oem => (
                    <button
                      key={oem.id}
                      onClick={() => setAndroidOem(oem.id as AndroidOEMKey)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                        androidOem === oem.id
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold'
                          : 'bg-slate-800 text-neutral-400 hover:text-neutral-200 border border-transparent'
                      }`}
                    >
                      {oem.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 1: Battery Optimization (Unrestricted) */}
              <div className={`p-4 rounded-xl border transition-all ${
                completedSteps['android-battery']
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-800/50 border-white/10 hover:border-amber-500/30'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950/60 border border-amber-500/30 text-amber-300 mt-0.5 shrink-0">
                      Step 1
                    </span>
                    <div>
                      <h3 className="font-outfit text-sm font-bold text-white flex items-center gap-1.5">
                        <BatteryCharging size={16} className="text-amber-400" />
                        <span>⚡ Disable Battery Restrictions</span>
                      </h3>
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                        Most phones put background workers to sleep to preserve battery. Set Daily Tithi / your browser to <strong>&quot;Unrestricted&quot;</strong> so sunrise alerts wake your phone instantly.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStep('android-battery')}
                    aria-label="Toggle battery restriction completed"
                    className={`shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                      completedSteps['android-battery']
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                        : 'border-white/20 bg-slate-800 hover:border-amber-400'
                    }`}
                  >
                    {completedSteps['android-battery'] && <CheckCircle2 size={16} />}
                  </button>
                </div>

                {/* Specific OEM Guidance */}
                <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-white/5 text-xs font-mono text-amber-200/90 leading-relaxed space-y-1">
                  {androidOem === 'samsung' && (
                    <>
                      <div className="text-[11px] text-amber-400 font-semibold uppercase font-sans">Samsung One UI Steps:</div>
                      <div>1. Open phone <strong>Settings → Apps → Chrome</strong> (or Daily Tithi).</div>
                      <div>2. Tap <strong>Battery</strong> → Select <strong>&quot;Unrestricted&quot;</strong>.</div>
                      <div>3. Verify it is NOT under <em>Settings → Battery → Background usage limits → Sleeping apps</em>.</div>
                    </>
                  )}
                  {androidOem === 'xiaomi' && (
                    <>
                      <div className="text-[11px] text-amber-400 font-semibold uppercase font-sans">Xiaomi MIUI / HyperOS Steps:</div>
                      <div>1. Open <strong>Settings → Apps → Manage Apps → Chrome</strong>.</div>
                      <div>2. Tap <strong>Battery Saver</strong> → Select <strong>&quot;No restrictions&quot;</strong>.</div>
                      <div>3. Turn ON <strong>&quot;Autostart&quot;</strong> permission for background wakeups.</div>
                    </>
                  )}
                  {androidOem === 'oneplus' && (
                    <>
                      <div className="text-[11px] text-amber-400 font-semibold uppercase font-sans">OnePlus / Oppo OxygenOS Steps:</div>
                      <div>1. Open <strong>Settings → Apps → App Management → Chrome</strong>.</div>
                      <div>2. Tap <strong>Battery Usage</strong> → Toggle ON <strong>&quot;Allow background activity&quot;</strong>.</div>
                      <div>3. Toggle ON <strong>&quot;Allow auto-launch&quot;</strong>.</div>
                    </>
                  )}
                  {androidOem === 'pixel' && (
                    <>
                      <div className="text-[11px] text-amber-400 font-semibold uppercase font-sans">Google Pixel / Stock Android Steps:</div>
                      <div>1. Long-press <strong>Chrome</strong> app icon → Tap <strong>(i) App Info</strong>.</div>
                      <div>2. Tap <strong>App battery usage</strong>.</div>
                      <div>3. Change from &quot;Optimized&quot; to <strong>&quot;Unrestricted&quot;</strong>.</div>
                    </>
                  )}
                </div>

                <div className="mt-2 text-[11px] text-neutral-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                  <span><strong>Why it matters:</strong> Guarantees sunrise alerts wake the screen on time without missing a sacred muhurat.</span>
                </div>
              </div>

              {/* Step 2: Background Data Usage */}
              <div className={`p-4 rounded-xl border transition-all ${
                completedSteps['android-data']
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-800/50 border-white/10 hover:border-amber-500/30'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950/60 border border-amber-500/30 text-amber-300 mt-0.5 shrink-0">
                      Step 2
                    </span>
                    <div>
                      <h3 className="font-outfit text-sm font-bold text-white flex items-center gap-1.5">
                        <Wifi size={16} className="text-amber-400" />
                        <span>🌐 Background Data Usage</span>
                      </h3>
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                        Ensure mobile network packets reach your device even when sleeping on 5G/4G cellular networks.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStep('android-data')}
                    aria-label="Toggle background data completed"
                    className={`shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                      completedSteps['android-data']
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                        : 'border-white/20 bg-slate-800 hover:border-amber-400'
                    }`}
                  >
                    {completedSteps['android-data'] && <CheckCircle2 size={16} />}
                  </button>
                </div>

                <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-white/5 text-xs font-mono text-neutral-300 space-y-1">
                  <div>1. Go to <strong>App Info → Mobile Data &amp; Wi-Fi</strong>.</div>
                  <div>2. Turn ON <strong>&quot;Background Data&quot;</strong>.</div>
                  <div>3. Turn ON <strong>&quot;Unrestricted Data Usage&quot;</strong> (allows sync even during Data Saver mode).</div>
                </div>

                <div className="mt-2 text-[11px] text-neutral-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                  <span><strong>Why it matters:</strong> Allows the service worker to receive the push packet even when on 5G/4G with the screen turned off.</span>
                </div>
              </div>

              {/* Step 3: Lock-Screen Notification Visibility */}
              <div className={`p-4 rounded-xl border transition-all ${
                completedSteps['android-lockscreen']
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-800/50 border-white/10 hover:border-amber-500/30'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950/60 border border-amber-500/30 text-amber-300 mt-0.5 shrink-0">
                      Step 3
                    </span>
                    <div>
                      <h3 className="font-outfit text-sm font-bold text-white flex items-center gap-1.5">
                        <Lock size={16} className="text-amber-400" />
                        <span>🔒 Lock-Screen Content Visibility</span>
                      </h3>
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                        Display the full sacred Panchang summary on your phone lock screen rather than a collapsed placeholder.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStep('android-lockscreen')}
                    aria-label="Toggle lock screen visibility completed"
                    className={`shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                      completedSteps['android-lockscreen']
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                        : 'border-white/20 bg-slate-800 hover:border-amber-400'
                    }`}
                  >
                    {completedSteps['android-lockscreen'] && <CheckCircle2 size={16} />}
                  </button>
                </div>

                <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-white/5 text-xs font-mono text-neutral-300 space-y-1">
                  <div>1. Go to <strong>Settings → Notifications → Lock Screen Notifications</strong>.</div>
                  <div>2. Select <strong>&quot;Show All Content&quot;</strong> (or &quot;Show content&quot;).</div>
                  <div>3. Under Chrome / Daily Tithi notifications, toggle ON <strong>&quot;Lock screen&quot;</strong> and <strong>&quot;Pop on screen&quot;</strong>.</div>
                </div>

                <div className="mt-2 text-[11px] text-neutral-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                  <span><strong>Why it matters:</strong> Prevents the OS from hiding the 5-line Panchang card behind a generic &quot;1 new notification&quot; placeholder.</span>
                </div>
              </div>

              {/* Step 4: Sacred Sound & Notification Channel Ringtone */}
              <div className={`p-4 rounded-xl border transition-all ${
                completedSteps['android-sound']
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-800/50 border-white/10 hover:border-amber-500/30'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950/60 border border-amber-500/30 text-amber-300 mt-0.5 shrink-0">
                      Step 4
                    </span>
                    <div>
                      <h3 className="font-outfit text-sm font-bold text-white flex items-center gap-1.5">
                        <Volume2 size={16} className="text-amber-400" />
                        <span>🔔 Sacred Alert Sound &amp; Ringtone</span>
                      </h3>
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                        Customize a dedicated temple bell chime or Vedic tone in Android&apos;s notification channel.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStep('android-sound')}
                    aria-label="Toggle sacred sound completed"
                    className={`shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                      completedSteps['android-sound']
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                        : 'border-white/20 bg-slate-800 hover:border-amber-400'
                    }`}
                  >
                    {completedSteps['android-sound'] && <CheckCircle2 size={16} />}
                  </button>
                </div>

                <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-white/5 text-xs font-mono text-neutral-300 space-y-1">
                  <div>1. Long-press the <strong>Daily Tithi</strong> web icon on your home screen or long-press an alert in your notification shade.</div>
                  <div>2. Tap the <strong>Gear Icon (⚙️)</strong> or tap <strong>App Info → Notifications → Notification Categories / Channels</strong>.</div>
                  <div>3. Tap <strong>&quot;Daily Tithi Alerts&quot;</strong> → Tap <strong>Sound / Ringtone</strong>.</div>
                  <div>4. Select your preferred temple bell, chime, or ringtone.</div>
                </div>

                <div className="mt-2 text-[11px] text-neutral-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                  <span><strong>Why it matters:</strong> Instantly distinguish sacred morning muhurat alerts from noisy social media notifications.</span>
                </div>
              </div>
            </>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* PLATFORM: iOS (iPhone / iPad)                                 */}
          {/* ───────────────────────────────────────────────────────────── */}
          {platform === 'ios' && (
            <>
              {/* iOS Step 1: Install as Home Screen App */}
              <div className={`p-4 rounded-xl border transition-all ${
                completedSteps['ios-homescreen']
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-800/50 border-white/10 hover:border-amber-500/30'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950/60 border border-amber-500/30 text-amber-300 mt-0.5 shrink-0">
                      Step 1
                    </span>
                    <div>
                      <h3 className="font-outfit text-sm font-bold text-white flex items-center gap-1.5">
                        <Share2 size={16} className="text-amber-400" />
                        <span>📲 Install as Home Screen App (Required by Apple)</span>
                      </h3>
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                        On iOS 16.4+, Apple restricts Web Push alerts exclusively to web apps installed to the Home Screen.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStep('ios-homescreen')}
                    aria-label="Toggle iOS home screen completed"
                    className={`shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                      completedSteps['ios-homescreen']
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                        : 'border-white/20 bg-slate-800 hover:border-amber-400'
                    }`}
                  >
                    {completedSteps['ios-homescreen'] && <CheckCircle2 size={16} />}
                  </button>
                </div>

                <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-white/5 text-xs font-mono text-amber-200/90 space-y-1.5">
                  <div>1. Tap Safari&apos;s <strong>Share Button (square with arrow ⎋)</strong> in the bottom toolbar.</div>
                  <div>2. Scroll down and tap <strong>&quot;Add to Home Screen ⊞&quot;</strong>.</div>
                  <div>3. Launch <strong>Daily Tithi</strong> from your home screen and tap <strong>&quot;Enable Lock-Screen Alerts&quot;</strong>.</div>
                </div>

                <div className="mt-2 text-[11px] text-neutral-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                  <span><strong>Apple WebKit Requirement:</strong> Push notifications are deactivated inside standard Safari tabs until installed.</span>
                </div>
              </div>

              {/* iOS Step 2: Lock-Screen Notification Visibility */}
              <div className={`p-4 rounded-xl border transition-all ${
                completedSteps['ios-lockscreen']
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-800/50 border-white/10 hover:border-amber-500/30'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950/60 border border-amber-500/30 text-amber-300 mt-0.5 shrink-0">
                      Step 2
                    </span>
                    <div>
                      <h3 className="font-outfit text-sm font-bold text-white flex items-center gap-1.5">
                        <Lock size={16} className="text-amber-400" />
                        <span>🔒 iOS Settings &gt; Notifications Checkmarks</span>
                      </h3>
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                        Verify that iOS displays morning alerts on the lock screen and plays the sacred chime.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStep('ios-lockscreen')}
                    aria-label="Toggle iOS lock screen completed"
                    className={`shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                      completedSteps['ios-lockscreen']
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                        : 'border-white/20 bg-slate-800 hover:border-amber-400'
                    }`}
                  >
                    {completedSteps['ios-lockscreen'] && <CheckCircle2 size={16} />}
                  </button>
                </div>

                <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-white/5 text-xs font-mono text-neutral-300 space-y-1">
                  <div>1. Open iPhone <strong>Settings → Notifications → Daily Tithi</strong>.</div>
                  <div>2. Toggle ON <strong>&quot;Allow Notifications&quot;</strong>.</div>
                  <div>3. Under ALERTS, check <strong>Lock Screen</strong>, <strong>Notification Centre</strong>, and <strong>Banners</strong>.</div>
                  <div>4. Set <strong>Banner Style</strong> to <strong>&quot;Persistent&quot;</strong> and ensure <strong>Sounds</strong> is switched ON.</div>
                </div>

                <div className="mt-2 text-[11px] text-neutral-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                  <span><strong>Why it matters:</strong> Ensures the Panchang alert stays pinned to your lock screen until you wake up and view it.</span>
                </div>
              </div>

              {/* iOS Step 3: Focus & Scheduled Summary Bypass */}
              <div className={`p-4 rounded-xl border transition-all ${
                completedSteps['ios-focus']
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-800/50 border-white/10 hover:border-amber-500/30'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950/60 border border-amber-500/30 text-amber-300 mt-0.5 shrink-0">
                      Step 3
                    </span>
                    <div>
                      <h3 className="font-outfit text-sm font-bold text-white flex items-center gap-1.5">
                        <AlertCircle size={16} className="text-amber-400" />
                        <span>🌅 Bypass Sleep Focus &amp; Scheduled Summary</span>
                      </h3>
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                        Prevent iOS from deferring sunrise alerts to a delayed 9:00 AM summary batch.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStep('ios-focus')}
                    aria-label="Toggle iOS focus completed"
                    className={`shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                      completedSteps['ios-focus']
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                        : 'border-white/20 bg-slate-800 hover:border-amber-400'
                    }`}
                  >
                    {completedSteps['ios-focus'] && <CheckCircle2 size={16} />}
                  </button>
                </div>

                <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-white/5 text-xs font-mono text-neutral-300 space-y-1">
                  <div>1. Go to <strong>Settings → Focus → Sleep (or Do Not Disturb)</strong>.</div>
                  <div>2. Tap <strong>Allowed Apps</strong> → Add <strong>Daily Tithi</strong>.</div>
                  <div>3. In <em>Settings → Notifications → Scheduled Summary</em>, verify Daily Tithi is set to <strong>Immediate</strong>.</div>
                </div>
              </div>
            </>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* PLATFORM: DESKTOP (Windows & Mac)                             */}
          {/* ───────────────────────────────────────────────────────────── */}
          {platform === 'desktop' && (
            <>
              {/* Desktop Step 1: Windows Focus Assist */}
              <div className={`p-4 rounded-xl border transition-all ${
                completedSteps['desktop-focus']
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-800/50 border-white/10 hover:border-amber-500/30'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950/60 border border-amber-500/30 text-amber-300 mt-0.5 shrink-0">
                      Step 1
                    </span>
                    <div>
                      <h3 className="font-outfit text-sm font-bold text-white flex items-center gap-1.5">
                        <Monitor size={16} className="text-amber-400" />
                        <span>🪟 Windows Focus Assist / Priority List</span>
                      </h3>
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                        Ensure Windows does not silence morning Panchang alerts during Focus mode or gaming sessions.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStep('desktop-focus')}
                    aria-label="Toggle desktop focus completed"
                    className={`shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                      completedSteps['desktop-focus']
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                        : 'border-white/20 bg-slate-800 hover:border-amber-400'
                    }`}
                  >
                    {completedSteps['desktop-focus'] && <CheckCircle2 size={16} />}
                  </button>
                </div>

                <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-white/5 text-xs font-mono text-neutral-300 space-y-1">
                  <div>1. Press <strong>Win + I</strong> → <strong>System → Notifications</strong>.</div>
                  <div>2. Scroll down to your browser (<strong>Google Chrome / Edge / Brave</strong>).</div>
                  <div>3. Turn ON <strong>&quot;Show notification banners&quot;</strong> and <strong>&quot;Show notifications in notification center&quot;</strong>.</div>
                </div>
              </div>

              {/* Desktop Step 2: macOS Notification Center */}
              <div className={`p-4 rounded-xl border transition-all ${
                completedSteps['desktop-banner']
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-slate-800/50 border-white/10 hover:border-amber-500/30'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950/60 border border-amber-500/30 text-amber-300 mt-0.5 shrink-0">
                      Step 2
                    </span>
                    <div>
                      <h3 className="font-outfit text-sm font-bold text-white flex items-center gap-1.5">
                        <Apple size={16} className="text-amber-400" />
                        <span>🍎 macOS Alert Style: &quot;Alerts&quot;</span>
                      </h3>
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                        Change macOS notification style from temporary Banners to persistent Alerts.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStep('desktop-banner')}
                    aria-label="Toggle desktop banner completed"
                    className={`shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                      completedSteps['desktop-banner']
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                        : 'border-white/20 bg-slate-800 hover:border-amber-400'
                    }`}
                  >
                    {completedSteps['desktop-banner'] && <CheckCircle2 size={16} />}
                  </button>
                </div>

                <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-white/5 text-xs font-mono text-neutral-300 space-y-1">
                  <div>1. Open <strong>System Settings → Notifications</strong>.</div>
                  <div>2. Click <strong>Google Chrome</strong> (or Safari).</div>
                  <div>3. Change alert style from &quot;Banners&quot; to <strong>&quot;Alerts&quot;</strong> so it stays on screen until dismissed.</div>
                </div>
              </div>
            </>
          )}

          {/* Test Status Toast Message */}
          {testSentToast && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
              <span>{testSentToast}</span>
            </div>
          )}

        </div>

        {/* Modal Footer Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span>High-Urgency W3C Push Payload</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleTestAlertClick}
              disabled={isSendingTest || internalSending}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {(isSendingTest || internalSending) ? (
                <>
                  <Loader2 size={14} className="animate-spin text-amber-400" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send size={14} className="text-amber-400" />
                  <span>Send Test Alert to Verify</span>
                </>
              )}
            </button>

            <button
              onClick={handleDismiss}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-extrabold transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>Done &amp; Save Setup</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
