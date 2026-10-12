"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Lock,
  BatteryCharging,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Sparkles,
  Info,
  ShieldCheck,
  Zap,
  Sliders,
  Check
} from 'lucide-react';

export interface PhoneSetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission?: NotificationPermission | 'unsupported';
  onRequestPermission?: () => Promise<unknown>;
  onSendTestAlert?: () => Promise<unknown>;
}

type PhoneBrand = 'vivo' | 'xiaomi' | 'samsung' | 'oneplus' | 'pixel' | 'ios';

export function PhoneSetupWizardModal({
  isOpen,
  onClose,
  permission = 'default',
  onRequestPermission,
  onSendTestAlert
}: PhoneSetupWizardModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedBrand, setSelectedBrand] = useState<PhoneBrand>('vivo');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [testSent, setTestSent] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [testFeedback, setTestFeedback] = useState<'worked' | 'failed' | null>(null);

  // Auto-detect user device brand from user-agent on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setSelectedBrand('ios');
    } else if (/vivo|iqoo|origin/i.test(ua)) {
      setSelectedBrand('vivo');
    } else if (/redmi|miui|poco|xiaomi/i.test(ua)) {
      setSelectedBrand('xiaomi');
    } else if (/samsung|sm-[a-z0-9]+/i.test(ua)) {
      setSelectedBrand('samsung');
    } else if (/oneplus|oppo|realme/i.test(ua)) {
      setSelectedBrand('oneplus');
    } else if (/pixel/i.test(ua)) {
      setSelectedBrand('pixel');
    } else {
      setSelectedBrand('vivo');
    }
  }, []);

  // Handle 5-second countdown for test alert
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (countdown === 0) {
      // Countdown hit 0 -> dispatch alert!
      setCountdown(null);
      triggerTestPush();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const triggerTestPush = async () => {
    setIsSending(true);
    setTestSent(false);
    setTestFeedback(null);
    try {
      if (onSendTestAlert) {
        await onSendTestAlert();
      } else {
        // Fallback test via API with active device push subscription
        let sub: PushSubscription | null = null;
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
          try {
            const reg = await navigator.serviceWorker.ready;
            sub = await reg.pushManager.getSubscription();
          } catch {}
        }

        if (sub) {
          await fetch('/api/push/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription: sub,
              title: '🌅 Vedic Panchang Lock-Screen Test',
              body: 'Shukla Dashami • Sunrise 06:20 AM\nAlert successfully woke your lock screen with vibration!',
              tag: 'test-lockscreen'
            })
          });
        }
      }
      setTestSent(true);
    } catch (err) {
      console.warn('Test alert dispatch failed:', err);
    } finally {
      setIsSending(false);
    }
  };

  const startCountdownTest = () => {
    setCountdown(5);
    setTestSent(false);
    setTestFeedback(null);
  };

  const steps = [
    { id: 1, title: 'Permission', icon: Bell },
    { id: 2, title: 'Lock Screen', icon: Lock },
    { id: 3, title: 'Battery Optimization', icon: BatteryCharging },
    { id: 4, title: 'Brand Guide', icon: Smartphone },
    { id: 5, title: 'Test Alert', icon: Send }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-2xl my-auto bg-[#0a101f] border border-amber-500/30 rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-modal-title"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-[#0d172e] to-[#121c38] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
              <Smartphone size={22} />
            </div>
            <div>
              <h2 id="wizard-modal-title" className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Phone Setup & Lock Screen Delivery Guide</span>
                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold">
                  Recommended
                </span>
              </h2>
              <p className="text-xs text-neutral-300 mt-0.5">
                Configure your phone settings once so sunrise and Tithi alerts wake your lock screen.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close Setup Guide"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Step Progress Indicator ─────────────────────────────────────── */}
        <div className="px-4 sm:px-6 py-3 bg-[#080d1a] border-b border-white/5 flex items-center justify-between gap-1 overflow-x-auto">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500 text-black font-bold shadow-md'
                    : isCompleted
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isCompleted ? (
                  <Check size={13} className="text-emerald-400 stroke-[3]" />
                ) : (
                  <Icon size={13} className={isCurrent ? 'text-black' : 'text-neutral-400'} />
                )}
                <span>
                  {idx + 1}. {s.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Step Content Body ───────────────────────────────────────────── */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {/* ════ STEP 1: BROWSER PERMISSION ════ */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-neutral-200">
                <Bell size={24} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-base">Step 1: Browser Notification Permission</h3>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    The web browser must be granted native permission to send notifications to your device.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e1628] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-300">Current Permission Status:</span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                      permission === 'granted'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : permission === 'denied'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : permission === 'unsupported'
                        ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {permission === 'granted' ? '✓ Granted' : permission === 'denied' ? '✗ Denied' : permission === 'unsupported' ? 'Unsupported' : 'Pending'}
                  </span>
                </div>

                {permission === 'granted' ? (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>Browser permission is already granted! Proceed to Step 2 for lock-screen setup.</span>
                  </div>
                ) : permission === 'denied' ? (
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertTriangle size={16} className="shrink-0" />
                      <span>Notifications are blocked in your browser.</span>
                    </div>
                    <p className="text-[11px] text-neutral-300">
                      Tap the <strong>Lock / Settings</strong> icon on the left side of your browser address bar (URL), select <strong>Site Settings</strong> or <strong>Permissions</strong>, and switch Notifications to <strong>Allow</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs text-neutral-300">
                      Click below to prompt your browser to allow notifications:
                    </p>
                    <button
                      onClick={onRequestPermission}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Bell size={14} />
                      <span>Request Browser Permission</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#091122] border border-white/5 text-[11px] text-neutral-400 flex items-start gap-2">
                <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <span>
                  After granting browser permission, Android still requires Lock Screen and Battery permissions to ring when the screen is locked.
                </span>
              </div>
            </div>
          )}

          {/* ════ STEP 2: LOCK SCREEN NOTIFICATIONS ════ */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-neutral-200">
                <Lock size={24} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-base">Step 2: Allow Lock Screen Notifications</h3>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    By default, some phones hide notifications when the screen is locked to protect privacy. Turn this on so the Panchang appears on your lock screen.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#0e1628] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[11px]">1</span>
                    <span>Open Phone Settings → Apps</span>
                  </div>
                  <p className="text-xs text-neutral-300 pl-7 leading-relaxed">
                    Go to your phone&apos;s native <strong>Settings ⚙️</strong> app, find <strong>Apps</strong> (or <strong>App Management</strong>), and tap <strong>Chrome</strong> (or <strong>Daily Tithi</strong> if installed on your home screen).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0e1628] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[11px]">2</span>
                    <span>Tap Notifications → Lock Screen</span>
                  </div>
                  <p className="text-xs text-neutral-300 pl-7 leading-relaxed">
                    Tap <strong>Notifications</strong>. Ensure <strong>Allow notifications</strong> is ON. Then check <strong>Lock screen</strong> and select <strong>&quot;Show content&quot;</strong> (or &quot;Sound and pop on screen&quot;).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0e1628] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[11px]">3</span>
                    <span>Enable Banners & Sound</span>
                  </div>
                  <p className="text-xs text-neutral-300 pl-7 leading-relaxed">
                    Make sure <strong>Pop-up / Banners</strong> are permitted and alert style is set to <strong>Sound & Vibration</strong> rather than Silent.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ════ STEP 3: BATTERY OPTIMIZATION & DOZE MODE ════ */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-neutral-200">
                <BatteryCharging size={24} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-base">Step 3: Disable Battery Optimization (Doze Mode)</h3>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Android &apos;Doze Mode&apos; suspends background processes when your phone is stationary and locked. Setting Chrome to <strong>Unrestricted</strong> prevents morning alert delays!
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Zap size={16} />
                  <span>Why this is crucial for Sunrise Alerts:</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  If your phone is left overnight on a table, Android puts Chrome into Deep Sleep. Without this setting, the sunrise alert will sit queued and only pop up the moment you pick up and unlock your phone in the morning!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e1628] border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-white">How to set Unrestricted Battery:</h4>
                <ol className="text-xs text-neutral-300 space-y-2 pl-4 list-decimal leading-relaxed">
                  <li>
                    Open <strong>Settings ⚙️</strong> → <strong>Apps</strong> → tap <strong>Chrome</strong> (or <strong>Daily Tithi</strong>).
                  </li>
                  <li>
                    Tap <strong>Battery</strong> (or <strong>App battery usage</strong>).
                  </li>
                  <li>
                    Change setting from <strong className="text-amber-300">&apos;Optimized&apos;</strong> to <strong className="text-emerald-300">&apos;Unrestricted&apos;</strong> (or &apos;Don&apos;t optimize&apos;).
                  </li>
                  <li>
                    Allow <strong>Background data</strong> and <strong>Unrestricted data usage</strong>.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* ════ STEP 4: BRAND-SPECIFIC PHONE GUIDE ════ */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-neutral-200">
                <div className="flex items-start gap-2.5">
                  <Smartphone size={22} className="text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-white text-sm">Step 4: Phone Brand Specific Optimizations</h3>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      Phone manufacturers use custom battery killers (MIUI, One UI, ColorOS). Select your device below:
                    </p>
                  </div>
                </div>
              </div>

              {/* Brand Selector Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { id: 'vivo', label: 'Vivo / iQOO' },
                  { id: 'xiaomi', label: 'Xiaomi / Poco' },
                  { id: 'samsung', label: 'Samsung' },
                  { id: 'oneplus', label: 'OnePlus / Oppo' },
                  { id: 'pixel', label: 'Pixel / Moto' },
                  { id: 'ios', label: 'iPhone / iOS' }
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrand(b.id as PhoneBrand)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                      selectedBrand === b.id
                        ? 'bg-amber-500 text-black shadow-lg scale-102'
                        : 'bg-[#0e1628] hover:bg-[#152038] text-neutral-300 border border-white/10'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Brand Details Card */}
              <div className="p-4 rounded-2xl bg-[#0e1628] border border-white/10 text-xs space-y-3">
                {selectedBrand === 'vivo' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <Smartphone size={16} />
                      <span>Vivo / iQOO (OriginOS & Funtouch OS) Settings:</span>
                    </div>
                    <ul className="space-y-2 text-neutral-300 pl-4 list-disc leading-relaxed">
                      <li>
                        <strong>High Background Power (Crucial)</strong>: Settings → Battery → Background power consumption management → Select Chrome / Daily Tithi → Change from Smart Control to <strong className="text-emerald-300">High background power consumption</strong>. <em>(OriginOS otherwise freezes background network sockets when the screen is locked).</em>
                      </li>
                      <li>
                        <strong>Lock Screen Display</strong>: Settings → Notifications & status bar → App notification management → Chrome / Daily Tithi → Ensure <strong className="text-emerald-300">Show on Lock screen</strong> is ON and set style to <strong className="text-emerald-300">Show content</strong>.
                      </li>
                      <li>
                        <strong>Wake Screen for Notifications</strong>: Settings → Notifications & status bar → Turn ON <strong className="text-emerald-300">Wake screen for notifications</strong> so alerts light up your screen.
                      </li>
                      <li>
                        <strong>Autostart via iManager</strong>: Open pre-installed <strong>iManager</strong> app → App Manager → Auto Start Management → Enable <strong className="text-emerald-300">Chrome / Daily Tithi</strong>.
                      </li>
                    </ul>
                  </div>
                )}

                {selectedBrand === 'samsung' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <Smartphone size={16} />
                      <span>Samsung Galaxy (One UI) Settings:</span>
                    </div>
                    <ul className="space-y-2 text-neutral-300 pl-4 list-disc leading-relaxed">
                      <li>
                        <strong>Never Sleeping Apps</strong>: Settings → Battery and device care → Battery → Background usage limits → <strong>Never sleeping apps</strong> → Tap <strong>+</strong> and add Chrome / Daily Tithi.
                      </li>
                      <li>
                        <strong>Battery</strong>: Settings → Apps → Chrome → Battery → Select <strong>Unrestricted</strong>.
                      </li>
                      <li>
                        <strong>Notification Categories</strong>: Settings → Apps → Chrome → Notifications → Notification categories → Ensure all toggles are turned ON with <strong>Alert</strong> (not Silent).
                      </li>
                    </ul>
                  </div>
                )}

                {selectedBrand === 'xiaomi' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <Smartphone size={16} />
                      <span>Xiaomi / Redmi / POCO (HyperOS & MIUI) Settings:</span>
                    </div>
                    <ul className="space-y-2 text-neutral-300 pl-4 list-disc leading-relaxed">
                      <li>
                        <strong>Autostart</strong>: Settings → Apps → Manage Apps → Chrome / Daily Tithi → Enable <strong className="text-emerald-300">Autostart</strong>.
                      </li>
                      <li>
                        <strong>Battery Saver</strong>: In the same menu, scroll to <strong>Battery saver</strong> and select <strong className="text-emerald-300">No restrictions</strong>. (HyperOS will otherwise terminate background listeners).
                      </li>
                      <li>
                        <strong>Lock screen notifications</strong>: Settings → Notifications & status bar → Lock screen → Allow Chrome / Daily Tithi notifications and set to <strong className="text-emerald-300">Show all notifications and their contents</strong>.
                      </li>
                    </ul>
                  </div>
                )}

                {selectedBrand === 'oneplus' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <Smartphone size={16} />
                      <span>OnePlus / OPPO / Realme (OxygenOS / ColorOS) Settings:</span>
                    </div>
                    <ul className="space-y-2 text-neutral-300 pl-4 list-disc leading-relaxed">
                      <li>
                        <strong>Allow Auto-launch</strong>: Settings → Apps → App management → Chrome → Battery usage → Turn ON <strong>Allow background activity</strong> and <strong>Allow auto-launch</strong>.
                      </li>
                      <li>
                        <strong>Lock Screen Display</strong>: Settings → Notification & status bar → Lock screen → Ensure <strong>Display title and body</strong> is checked.
                      </li>
                      <li>
                        <strong>Sleep Standby</strong>: In Battery settings → Advanced settings → Turn OFF <strong>Sleep standby optimization</strong>.
                      </li>
                    </ul>
                  </div>
                )}

                {selectedBrand === 'pixel' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <Smartphone size={16} />
                      <span>Google Pixel / Motorola / Stock Android Settings:</span>
                    </div>
                    <ul className="space-y-2 text-neutral-300 pl-4 list-disc leading-relaxed">
                      <li>
                        <strong>App Battery Usage</strong>: Settings → Apps → Chrome → App battery usage → Select <strong>Unrestricted</strong>.
                      </li>
                      <li>
                        <strong>Lock Screen Privacy</strong>: Settings → Display → Lock screen → Privacy → Set to <strong>Show all notification content</strong>.
                      </li>
                    </ul>
                  </div>
                )}

                {selectedBrand === 'ios' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <Smartphone size={16} />
                      <span>Apple iPhone / iPad (iOS 16.4+ Safari PWA):</span>
                    </div>
                    <ul className="space-y-2 text-neutral-300 pl-4 list-disc leading-relaxed">
                      <li>
                        <strong>Add to Home Screen Required</strong>: Safari restricts push notifications to installed web apps. In Safari, tap the <strong>Share button (⎋)</strong>, scroll down, and tap <strong>Add to Home Screen (⊞)</strong>.
                      </li>
                      <li>
                        <strong>Launch from Home Screen</strong>: Open Daily Tithi from your home screen and tap &quot;Enable Lock-Screen Alerts&quot;.
                      </li>
                      <li>
                        <strong>iOS Settings</strong>: Settings → Notifications → Daily Tithi → Check <strong>Lock Screen</strong>, <strong>Notification Centre</strong>, and <strong>Banners (Persistent)</strong>.
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════ STEP 5: INTERACTIVE 5-SECOND LOCK SCREEN TEST ════ */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-neutral-200">
                <Send size={24} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-base">Step 5: Test on Your Locked Screen!</h3>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Verify that your phone settings work! We provide a 5-second countdown so you have time to lock your phone before the alert arrives.
                  </p>
                </div>
              </div>

              {/* Countdown or Test Trigger Box */}
              <div className="p-5 rounded-2xl bg-[#0e1628] border border-white/10 text-center space-y-4">
                {countdown !== null ? (
                  <div className="py-4 space-y-3 animate-pulse">
                    <div className="text-4xl sm:text-5xl font-black text-amber-400 tracking-wider font-mono">
                      {countdown}s
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 font-bold text-sm max-w-sm mx-auto">
                      📱 Press your phone&apos;s power button now to lock your screen!
                    </div>
                    <p className="text-xs text-neutral-400">
                      Dispatched with high urgency, vibration, and lock-screen wake flag.
                    </p>
                  </div>
                ) : isSending ? (
                  <div className="py-6 flex flex-col items-center gap-2">
                    <Loader2 size={32} className="text-amber-400 animate-spin" />
                    <p className="text-xs text-neutral-300">Dispatching high-urgency push alert to Google FCM...</p>
                  </div>
                ) : testSent ? (
                  <div className="space-y-3 py-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                      <CheckCircle2 size={28} />
                    </div>
                    <h4 className="text-sm font-bold text-white">Alert Sent to Device!</h4>
                    <p className="text-xs text-neutral-300">
                      Check your lock screen or pull down your notification tray.
                    </p>

                    {/* Feedback inquiry */}
                    <div className="pt-2 border-t border-white/10 space-y-2">
                      <p className="text-xs font-semibold text-neutral-300">Did the notification appear on your lock screen?</p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setTestFeedback('worked')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            testFeedback === 'worked'
                              ? 'bg-emerald-500 text-black'
                              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          ✓ Yes, it popped up!
                        </button>
                        <button
                          onClick={() => setTestFeedback('failed')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            testFeedback === 'failed'
                              ? 'bg-amber-500 text-black'
                              : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                          }`}
                        >
                          ✗ Still not waking screen
                        </button>
                      </div>

                      {testFeedback === 'worked' && (
                        <p className="text-xs text-emerald-300 pt-2 font-semibold">
                          🎉 Fantastic! Your phone is fully optimized for daily Brahma Muhurta and Tithi alerts!
                        </p>
                      )}

                      {testFeedback === 'failed' && (
                        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs text-left space-y-1">
                          <p className="font-bold">Recommendation:</p>
                          <p>
                            Revisit <strong>Step 3 (Battery Optimization)</strong> and ensure Chrome is set to <strong>Unrestricted</strong>. Some manufacturers (Xiaomi / Samsung) also require enabling <strong>&apos;Lock screen notifications&apos;</strong> in app settings.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={startCountdownTest}
                        className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
                      >
                        Try 5-second countdown test again
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-neutral-300 leading-relaxed max-w-md mx-auto">
                      Click the button below, then immediately lock your screen with the power button. Your phone should vibrate and show the Vedic Panchang alert within 5 seconds.
                    </p>
                    <button
                      onClick={startCountdownTest}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm transition-all shadow-xl active:scale-95 cursor-pointer inline-flex items-center gap-2"
                    >
                      <Send size={16} />
                      <span>Start 5-Second Lock-Screen Test 🚀</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer Navigation Controls ──────────────────────────────────── */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#080d1a] flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ChevronLeft size={15} />
            <span>Previous</span>
          </button>

          <span className="text-xs text-neutral-400 font-mono">
            Step {currentStep} of {steps.length}
          </span>

          {currentStep < steps.length ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
            >
              <span>Next Step</span>
              <ChevronRight size={15} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Check size={15} />
              <span>Finish Setup</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
