"use client";

import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Sparkles,
  Zap,
  Info,
  Calendar,
  Flame,
  ShieldAlert,
  Loader2,
  MapPin,
  Clock,
  Wifi,
  RefreshCw,
  Sun,
  Volume2,
  Moon
} from 'lucide-react';
import {
  checkNotificationCapabilities,
  enableNotificationAlerts,
  disableNotificationAlerts,
  triggerImmediateNotificationTest,
  syncPreferencesToBackend,
  NotificationCapabilities
} from '@/src/lib/notifications/subscription-manager';
import {
  getNotificationSettings,
  saveNotificationSettings,
  NotificationSettings
} from '@/src/lib/notifications/idb-storage';
import {
  requestGpsLocation,
  getSavedLocationState,
  persistLocationState,
  UserLocationState
} from '@/src/lib/location-service';
import { LocationCoordinates, PRESET_LOCATIONS } from '@/src/lib/vedic-astronomy';
import { computeDailyMorningNotification, DailyMorningPushPayload } from '@/src/lib/notifications/morning-push';
import { extractDailyPanchangData, buildDailyFloatingPayload } from '@/src/lib/push/dailySummaryPayload';
import { DeviceSetupModal } from '@/src/components/DeviceSetupModal';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation?: LocationCoordinates;
  onLocationChange?: (newLoc: LocationCoordinates) => void;
  currentTithiName?: string;
  panchakStatus?: {
    isActive: boolean;
    isInauspicious?: boolean;
    type?: string;
    statusText?: string;
  };
  festivalOrVratName?: string | null;
}

export function NotificationSettingsModal({
  isOpen,
  onClose,
  currentLocation,
  onLocationChange,
  currentTithiName = 'Shukla Dashami',
  panchakStatus = {
    isActive: true,
    isInauspicious: true,
    type: 'Mrityu Panchak',
    statusText: 'Mrityu Panchak (Inauspicious)'
  },
  festivalOrVratName = 'Vijayadashami'
}: NotificationSettingsModalProps) {
  const [capabilities, setCapabilities] = useState<NotificationCapabilities | null>(null);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [locationState, setLocationState] = useState<UserLocationState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [previewPayload, setPreviewPayload] = useState<DailyMorningPushPayload | null>(null);
  const [floatingPreview, setFloatingPreview] = useState<{ title: string; body: string } | null>(null);
  const [isDeviceGuideOpen, setIsDeviceGuideOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      checkNotificationCapabilities().then(setCapabilities);
      getNotificationSettings().then(setSettings);
      const loc = getSavedLocationState();
      setLocationState(loc);

      // Compute live 5-line floating morning notification preview for active location
      const activeLoc = currentLocation || loc.location;
      const preview = computeDailyMorningNotification(new Date(), activeLoc);
      setPreviewPayload(preview);

      const dailyData = extractDailyPanchangData(new Date(), activeLoc);
      const floating = buildDailyFloatingPayload(dailyData);
      setFloatingPreview({ title: floating.title, body: floating.options.body });
    }
  }, [isOpen, currentLocation]);

  if (!isOpen) return null;

  const handleMasterToggle = async () => {
    setIsLoading(true);
    try {
      if (capabilities?.isEnabled) {
        await disableNotificationAlerts();
      } else {
        await enableNotificationAlerts();
      }
      const updatedCap = await checkNotificationCapabilities();
      const updatedSet = await getNotificationSettings();
      setCapabilities(updatedCap);
      setSettings(updatedSet);
    } catch (err) {
      console.error('Toggle notification failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettingField = async <K extends keyof NotificationSettings>(
    field: K,
    value: NotificationSettings[K]
  ) => {
    if (!settings) return;
    const updated = await saveNotificationSettings({ [field]: value });
    setSettings(updated);

    // Sync to backend push subscription
    syncPreferencesToBackend({ [field]: value }, currentLocation || locationState?.location).catch(() => {});
  };

  const handleGpsRequest = async () => {
    setIsGpsLoading(true);
    setGpsMessage(null);
    try {
      const res = await requestGpsLocation();
      if (res.success && res.location) {
        setGpsMessage(`GPS acquired: ${res.location.name}`);
        const newLocState = getSavedLocationState();
        setLocationState(newLocState);
        if (onLocationChange) {
          onLocationChange(res.location);
        }
        // Update live preview
        const newPreview = computeDailyMorningNotification(new Date(), res.location);
        setPreviewPayload(newPreview);

        const dailyData = extractDailyPanchangData(new Date(), res.location);
        const floating = buildDailyFloatingPayload(dailyData);
        setFloatingPreview({ title: floating.title, body: floating.options.body });

        // Sync to backend
        syncPreferencesToBackend(settings || {}, res.location).catch(() => {});
      } else {
        setGpsMessage(res.error || 'GPS access was not granted. Using dropdown location.');
      }
    } catch (err) {
      setGpsMessage('Unable to acquire GPS coordinates.');
    } finally {
      setIsGpsLoading(false);
      setTimeout(() => setGpsMessage(null), 6000);
    }
  };

  const handleTestAlert = async () => {
    setTestStatus('sending');
    try {
      const res = await triggerImmediateNotificationTest();
      if (res.success) {
        setTestStatus('sent');
        setTestMessage(res.message);
        setTimeout(() => setTestStatus('idle'), 4000);
      } else {
        setTestStatus('error');
        setTestMessage(res.message);
        setTimeout(() => setTestStatus('idle'), 5000);
      }
    } catch {
      setTestStatus('error');
      setTestMessage('Failed to trigger test notification');
      setTimeout(() => setTestStatus('idle'), 5000);
    }
  };

  const isEnabled = Boolean(capabilities?.isEnabled);
  const activeLocation = currentLocation || locationState?.location || PRESET_LOCATIONS[0];
  const isGpsSource = locationState?.source === 'gps';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-xl bg-[#0a101f] border border-[#233554] shadow-[0_25px_60px_rgba(0,0,0,0.9)] rounded-3xl p-5 sm:p-6 text-neutral-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Notification Settings"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#131d33] hover:bg-[#1d2b4b] border border-[#2b3e66] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-inner">
            <Bell size={24} className="animate-pulse" />
          </div>
          <div>
            <h2 id="notification-settings-title" className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Panchang Notifications & Auto-Updates
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Daily morning pushes, real-time Tithi change alerts & background updates
            </p>
          </div>
        </div>

        {/* ── Section 1: Main Master Notification Toggle ── */}
        <div className="p-4 rounded-2xl bg-[#0f182c] border border-[#202f4d] flex items-center justify-between gap-4 mb-5 shadow-sm">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Push Notifications</span>
              {isEnabled ? (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-neutral-700/50 text-neutral-400 border border-neutral-600/30">
                  Off
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {isEnabled
                ? 'Web Push registered on backend. Works even when the app is completely closed.'
                : 'Turn on to receive morning panchang updates and astronomical transition alerts.'}
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={handleMasterToggle}
            disabled={isLoading}
            role="switch"
            aria-checked={isEnabled}
            aria-label="Toggle push notifications"
            className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-[#0a101f] ${
              isEnabled ? 'bg-amber-500' : 'bg-neutral-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isEnabled ? 'translate-x-7' : 'translate-x-0'
              }`}
            >
              {isLoading && (
                <Loader2 size={14} className="animate-spin text-neutral-600 m-1" />
              )}
            </span>
          </button>
        </div>

        {/* ── Section 2: Location & GPS Acquisition ── */}
        <div className="p-4 rounded-2xl bg-[#0c1424] border border-[#1b2742] mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
              <MapPin size={13} />
              <span>Location in Use</span>
            </span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
              isGpsSource
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {isGpsSource ? 'GPS Location' : 'Dropdown City (Fallback)'}
            </span>
          </div>

          <div className="text-xs text-neutral-300 font-medium mb-3">
            <strong>Active Coordinates:</strong> {activeLocation.name} ({activeLocation.latitude.toFixed(2)}°N, {activeLocation.longitude.toFixed(2)}°E • {activeLocation.ianaTimezone || 'Asia/Kolkata'})
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGpsRequest}
              disabled={isGpsLoading}
              className="px-3.5 py-1.5 rounded-xl bg-[#141e33] hover:bg-[#1d2b4a] border border-[#233555] text-amber-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGpsLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Requesting GPS...</span>
                </>
              ) : (
                <>
                  <MapPin size={13} />
                  <span>Use My GPS Location</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-neutral-400">
              Only requested upon tap. Used for exact local sunrise and Tithi timing.
            </span>
          </div>

          {gpsMessage && (
            <div className="mt-2 text-[11px] text-emerald-400 font-medium">
              {gpsMessage}
            </div>
          )}
        </div>

        {/* ── Section 3: User Preferences & Push Controls ── */}
        <div className="space-y-3 mb-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
            <Sparkles size={13} />
            <span>Notification & Auto-Update Controls</span>
          </h3>

          <div className="grid grid-cols-1 gap-2.5 text-xs">
            {/* Control 1: Daily Morning Push */}
            <div className="p-3 rounded-xl bg-[#0c1424] border border-[#1b2742] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <Sun size={14} className="text-amber-400" />
                  <span>Daily Morning Notification</span>
                </div>
                <p className="text-neutral-400 mt-0.5 text-[11px] leading-snug">
                  One push per day containing the complete sunrise-to-sunrise picture (Tithi, Panchak & Festival).
                </p>
              </div>

              <input
                type="checkbox"
                checked={settings?.dailyNotification !== false}
                onChange={(e) => updateSettingField('dailyNotification', e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-neutral-600 bg-neutral-800 cursor-pointer"
              />
            </div>

            {/* Control 2: Notification Time (Sunrise vs Custom) */}
            <div className="p-3 rounded-xl bg-[#0c1424] border border-[#1b2742] flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <Clock size={14} className="text-indigo-400" />
                  <span>Morning Notification Time</span>
                </div>
                <p className="text-neutral-400 mt-0.5 text-[11px]">
                  Default: Local sunrise calculated from GPS ({previewPayload?.sunriseTimeFormatted || '06:00 AM'}).
                </p>
              </div>

              <select
                value={settings?.notificationTime || 'sunrise'}
                onChange={(e) => updateSettingField('notificationTime', e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-[#11192e] border border-[#233152] text-xs font-semibold text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="sunrise">Local Sunrise (Recommended)</option>
                <option value="05:00">05:00 AM</option>
                <option value="06:00">06:00 AM (Standard)</option>
                <option value="07:00">07:00 AM</option>
                <option value="08:00">08:00 AM</option>
              </select>
            </div>

            {/* Control 3: Tithi Change Alert (Default OFF) */}
            <div className="p-3 rounded-xl bg-[#0c1424] border border-[#1b2742] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <Calendar size={14} className="text-orange-400" />
                  <span>Also alert me at each Tithi change</span>
                </div>
                <p className="text-neutral-400 mt-0.5 text-[11px] leading-snug">
                  Server push at the exact moment of transition: &quot;Tithi changed: &lt;New Tithi&gt; (from HH:MM)&quot;.
                </p>
              </div>

              <input
                type="checkbox"
                checked={Boolean(settings?.alertOnTithiChange)}
                onChange={(e) => updateSettingField('alertOnTithiChange', e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-neutral-600 bg-neutral-800 cursor-pointer"
              />
            </div>

            {/* Control 4: Auto Updates */}
            <div className="p-3 rounded-xl bg-[#0c1424] border border-[#1b2742] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <RefreshCw size={14} className="text-emerald-400" />
                  <span>Automatic Background Version Updates</span>
                </div>
                <p className="text-neutral-400 mt-0.5 text-[11px] leading-snug">
                  Silently downloads newer app releases and prompts to refresh without disrupting active usage.
                </p>
              </div>

              <input
                type="checkbox"
                checked={settings?.autoUpdate !== false}
                onChange={(e) => updateSettingField('autoUpdate', e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-neutral-600 bg-neutral-800 cursor-pointer"
              />
            </div>

            {/* Control 5: Wi-Fi Only */}
            <div className="p-3 rounded-xl bg-[#0c1424] border border-[#1b2742] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <Wifi size={14} className="text-cyan-400" />
                  <span>Wi-Fi Only Data Sync</span>
                </div>
                <p className="text-neutral-400 mt-0.5 text-[11px] leading-snug">
                  Restricts non-essential background ephemeris prefetching to Wi-Fi to conserve mobile data.
                </p>
              </div>

              <input
                type="checkbox"
                checked={Boolean(settings?.wifiOnly)}
                onChange={(e) => {
                  updateSettingField('wifiOnly', e.target.checked);
                  localStorage.setItem('panchang_setting_wifi_only', e.target.checked ? 'true' : 'false');
                }}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-neutral-600 bg-neutral-800 cursor-pointer"
              />
            </div>

            {/* Control 6: Sound & Vibration */}
            <div className="p-3 rounded-xl bg-[#0c1424] border border-[#1b2742] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <Volume2 size={14} className="text-violet-400" />
                  <span>Notification Sound & Vibration</span>
                </div>
                <p className="text-neutral-400 mt-0.5 text-[11px] leading-snug">
                  Plays audio chime and triggers haptic vibration pattern upon receiving morning alerts.
                </p>
              </div>

              <input
                type="checkbox"
                checked={settings?.sound !== false}
                onChange={(e) => {
                  updateSettingField('sound', e.target.checked);
                  updateSettingField('vibration', e.target.checked);
                }}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-neutral-600 bg-neutral-800 cursor-pointer"
              />
            </div>

            {/* Control 7: Quiet Hours */}
            <div className="p-3 rounded-xl bg-[#0c1424] border border-[#1b2742] space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <Moon size={14} className="text-indigo-400" />
                    <span>Quiet Hours (Mute Non-Urgent Pushes)</span>
                  </div>
                  <p className="text-neutral-400 mt-0.5 text-[11px] leading-snug">
                    Silences transition alerts during your designated rest hours.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={Boolean(settings?.quietHoursEnabled)}
                  onChange={(e) => updateSettingField('quietHoursEnabled', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-neutral-600 bg-neutral-800 cursor-pointer"
                />
              </div>

              {settings?.quietHoursEnabled && (
                <div className="pt-2 border-t border-[#19253d] flex items-center gap-3 text-xs text-neutral-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-neutral-400">From:</span>
                    <input
                      type="time"
                      value={settings?.quietHoursStart || '22:00'}
                      onChange={(e) => updateSettingField('quietHoursStart', e.target.value)}
                      className="bg-[#131d33] border border-[#233554] rounded-lg px-2 py-1 text-white text-xs font-mono outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-neutral-400">To:</span>
                    <input
                      type="time"
                      value={settings?.quietHoursEnd || '06:00'}
                      onChange={(e) => updateSettingField('quietHoursEnd', e.target.value)}
                      className="bg-[#131d33] border border-[#233554] rounded-lg px-2 py-1 text-white text-xs font-mono outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 4: Live All-in-One Floating Lock-Screen Notification Preview ── */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Live Lock-Screen Floating Format (All-in-One 5-Line Card)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#131e33] text-amber-400 border border-[#203154]">
              5 Lines + Actions
            </span>
          </div>

          {/* System Notification Frame */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#131c31] to-[#0c1324] border border-[#25375d] shadow-md font-sans">
            <div className="flex items-center justify-between border-b border-[#1f2d4d] pb-2 mb-2 text-[11px] text-neutral-400">
              <div className="flex items-center gap-1.5 font-medium">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center text-[8px] font-bold text-black">
                  ॐ
                </div>
                <span className="text-white font-bold">{floatingPreview?.title || '🌅 Daily Tithi'}</span>
              </div>
              <span className="text-[10px] text-neutral-400">Sunrise {previewPayload?.sunriseTimeFormatted || '06:00'}</span>
            </div>

            {/* Notification Body Simulation (Preformatted 5-line text) */}
            <div className="text-xs sm:text-[13px] font-mono leading-relaxed text-neutral-200 whitespace-pre-line break-words">
              {floatingPreview?.body || (
                `🪔 ${currentTithiName} (${festivalOrVratName || 'Daily Panchang'})\n⏳ Tithi ends today at 09:20 PM\n\n🟢 Auspicious (Abhijit): 11:45 AM – 12:33 PM\n🔴 Inauspicious (Rahu): 09:15 AM – 10:45 AM\n🛡️ Panchak: Free • ☀️ Sun: 06:19 AM – 05:57 PM`
              )}
            </div>

            {/* Action Buttons Simulation */}
            <div className="mt-3 pt-2.5 border-t border-[#1f2d4d] flex items-center gap-2">
              <div className="flex-1 py-1 px-2 rounded-lg bg-[#1a2642] text-center text-[10px] font-semibold text-amber-300 border border-[#2d4170]/60">
                📖 Open Full Panchang
              </div>
              <div className="flex-1 py-1 px-2 rounded-lg bg-[#1a2642] text-center text-[10px] font-semibold text-neutral-300 border border-[#2d4170]/60">
                ⏱️ Muhurat Timings
              </div>
            </div>
          </div>

          <div className="mt-2.5 p-2.5 rounded-xl bg-[#0d1629] border border-[#1b2947] flex items-start gap-2 text-[11px] text-neutral-400 leading-relaxed">
            <Info size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-300">All-in-One Lock-Screen Floating Card:</strong>
              {' '}Delivered once per day at local sunrise. Compact 5-line summary features current Tithi, exact End Time, Auspicious Muhurats (Abhijit), Rahu Kaal, Panchak status, and Sunrise/Sunset with direct action buttons. Persistent and peaceful lock-screen docking.
            </div>
          </div>
        </div>

        {/* ── Section 5: Device Reliability & Battery Settings Banner ── */}
        <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-[#0d1629] to-[#111c33] border border-amber-500/30 flex items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-amber-400 font-bold text-base shrink-0">⚙️</span>
            <div>
              <span className="text-white font-semibold text-xs block">
                Device Reliability &amp; Battery Optimization Guide
              </span>
              <span className="text-neutral-400 text-[11px] block leading-snug">
                Configure Unrestricted Battery &amp; Lock-Screen Visibility for sleeping phones
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsDeviceGuideOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1"
          >
            <span>Guide ⚙️</span>
          </button>
        </div>

        {/* ── Test Notification & Close Action Buttons ── */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-[#1a2744]">
          <button
            onClick={handleTestAlert}
            disabled={testStatus === 'sending'}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 disabled:opacity-50"
          >
            {testStatus === 'sending' ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Dispatching Test Push...</span>
              </>
            ) : testStatus === 'sent' ? (
              <>
                <CheckCircle2 size={15} className="text-black" />
                <span>Test Alert Sent to Screen! 🔔</span>
              </>
            ) : (
              <>
                <Bell size={15} />
                <span>Send Test Alert to Screen</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-[#141e33] hover:bg-[#1c2a47] border border-[#25375c] text-neutral-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {testMessage && (
          <p className={`text-[11px] text-center mt-2.5 font-medium ${testStatus === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>
            {testMessage}
          </p>
        )}

        {/* Mounted Device Setup Guide Modal */}
        <DeviceSetupModal
          isOpen={isDeviceGuideOpen}
          onClose={() => setIsDeviceGuideOpen(false)}
          onSendTestAlert={handleTestAlert}
          isSendingTest={testStatus === 'sending'}
        />
      </div>
    </div>
  );
}
