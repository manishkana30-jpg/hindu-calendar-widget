"use client";

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Send,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Smartphone,
  Monitor,
  Apple,
  Globe,
  Lock,
  ArrowRight,
  Clock,
  Info
} from 'lucide-react';

interface PlatformMetrics {
  sent: number;
  received: number;
  opened: number;
}

interface TestBroadcastReport {
  testId: string;
  createdAt: number;
  isDryRun: boolean;
  totalSubscriptions: number;
  eligibleCount: number;
  optedOutCount: number;
  sentCount: number;
  failedCount: number;
  expiredRemovedCount: number;
  receivedCount: number;
  openedCount: number;
  receivedPercentage: number;
  openedPercentage: number;
  platformBreakdown: Record<string, PlatformMetrics>;
  browserBreakdown: Record<string, PlatformMetrics>;
  unconfirmedSubIds: {
    subId: string;
    sentAt: number;
    elapsedMinutes: number;
    platform?: string;
    browser?: string;
    diagnostic: string;
  }[];
}

export default function AdminPushTestPage() {
  const [adminKey, setAdminKey] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [report, setReport] = useState<TestBroadcastReport | null>(null);
  const [recentTestIds, setRecentTestIds] = useState<string[]>([]);
  const [lookupTestId, setLookupTestId] = useState<string>('');

  useEffect(() => {
    const saved = sessionStorage.getItem('panchang_admin_key');
    if (saved) setAdminKey(saved);
    fetchRecentTests();
  }, []);

  const fetchRecentTests = async () => {
    try {
      const res = await fetch(`/api/admin/push-test?adminKey=${encodeURIComponent(adminKey)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.testIds) setRecentTestIds(data.testIds);
      }
    } catch {}
  };

  const handleDryRun = async () => {
    setIsLoading(true);
    setError(null);
    try {
      sessionStorage.setItem('panchang_admin_key', adminKey);
      const res = await fetch('/api/admin/push-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify({ dryRun: true })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Dry run request failed');
      }

      setReport(data.report);
      fetchRecentTests();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to execute dry run');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealBroadcast = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);
    setError(null);
    try {
      sessionStorage.setItem('panchang_admin_key', adminKey);
      const res = await fetch('/api/admin/push-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify({ confirmBroadcast: true })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Broadcast request failed');
      }

      setReport(data.report);
      fetchRecentTests();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to dispatch broadcast');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLookupReport = async (testIdToLoad: string) => {
    if (!testIdToLoad.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/push-test?testId=${encodeURIComponent(testIdToLoad.trim())}&adminKey=${encodeURIComponent(adminKey)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch report');
      }
      setReport(data.report);
    } catch (err: unknown) {
      setError((err as Error).message || 'Report not found');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-neutral-200 p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b263b] pb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
                ॐ
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Push Notification Admin & Test Broadcast
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400">
              Verify real-world internet connectivity and Web Push delivery to installed webapps across all user devices.
            </p>
          </div>

          {/* Admin Auth Key Input */}
          <div className="flex items-center gap-2 bg-[#0d1629] p-2 rounded-2xl border border-[#203154]">
            <Lock size={15} className="text-amber-400 ml-1.5 flex-shrink-0" />
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter Admin Key"
              className="bg-transparent text-xs text-white border-none outline-none w-48 sm:w-56 px-1 font-mono"
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-300 text-xs sm:text-sm flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. Dry Run */}
          <div className="p-5 rounded-2xl bg-[#0d1526] border border-[#1d2d4d] space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 mb-1">
                <Eye size={16} className="text-blue-400" />
                <span>1. Dry Run Preview</span>
              </div>
              <p className="text-xs text-neutral-400">
                Calculates eligible, opted-out, and total stored subscribers safely without dispatching any push messages.
              </p>
            </div>
            <button
              onClick={handleDryRun}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Eye size={14} />}
              <span>Execute Dry Run</span>
            </button>
          </div>

          {/* 2. Real Broadcast */}
          <div className="p-5 rounded-2xl bg-[#0d1526] border border-[#1d2d4d] space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 mb-1">
                <Send size={16} className="text-amber-400" />
                <span>2. Real Test Broadcast</span>
              </div>
              <p className="text-xs text-neutral-400">
                Dispatches a single test push to all eligible devices via VAPID with batched processing and 30s cooldown.
              </p>
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg disabled:opacity-50"
            >
              <Send size={14} />
              <span>Broadcast Test Push</span>
            </button>
          </div>

          {/* 3. Re-open Past Report */}
          <div className="p-5 rounded-2xl bg-[#0d1526] border border-[#1d2d4d] space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 mb-1">
                <RefreshCw size={16} className="text-emerald-400" />
                <span>3. Re-open Report by ID</span>
              </div>
              <p className="text-xs text-neutral-400">
                Inspect delivery confirmations, opened rates, and unconfirmed offline devices.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={lookupTestId}
                onChange={(e) => setLookupTestId(e.target.value)}
                placeholder="test_172..."
                className="flex-1 bg-[#131d33] border border-[#233554] rounded-xl px-2.5 py-1.5 text-xs text-white font-mono outline-none"
              />
              <button
                onClick={() => handleLookupReport(lookupTestId)}
                disabled={isLoading || !lookupTestId}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                View
              </button>
            </div>
          </div>
        </div>

        {/* Recent Test IDs Pills */}
        {recentTestIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <span className="font-semibold text-neutral-400">Recent Tests:</span>
            {recentTestIds.slice(-5).reverse().map((id) => (
              <button
                key={id}
                onClick={() => {
                  setLookupTestId(id);
                  handleLookupReport(id);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#111c33] border border-[#233554] hover:border-amber-400 text-neutral-300 font-mono text-[11px] cursor-pointer"
              >
                {id}
              </button>
            ))}
          </div>
        )}

        {/* Report Card */}
        {report && (
          <div className="p-6 rounded-3xl bg-[#0a1122] border border-[#1f2f50] space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b2a47] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white font-mono">{report.testId}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    report.isDryRun ? 'bg-blue-900/60 text-blue-300 border border-blue-700' : 'bg-amber-900/60 text-amber-300 border border-amber-700'
                  }`}>
                    {report.isDryRun ? 'Dry Run' : 'Real Broadcast'}
                  </span>
                </div>
                <span className="text-xs text-neutral-400">
                  Triggered {new Date(report.createdAt).toLocaleString()}
                </span>
              </div>

              {!report.isDryRun && (
                <button
                  onClick={() => handleLookupReport(report.testId)}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-[#142038] hover:bg-[#1a2c4e] border border-[#263c66] text-xs text-neutral-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>Refresh Delivery Data</span>
                </button>
              )}
            </div>

            {/* Metric Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-[#0e172c] border border-[#1e2f52]">
                <div className="text-[11px] font-semibold uppercase text-neutral-400 mb-1">Total Registered</div>
                <div className="text-2xl font-bold text-white">{report.totalSubscriptions}</div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  {report.eligibleCount} eligible • {report.optedOutCount} opted out
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e172c] border border-[#1e2f52]">
                <div className="text-[11px] font-semibold uppercase text-neutral-400 mb-1">Dispatched (Sent)</div>
                <div className="text-2xl font-bold text-amber-400">{report.sentCount}</div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  {report.failedCount} failed • {report.expiredRemovedCount} expired pruned
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e172c] border border-[#1e2f52]">
                <div className="text-[11px] font-semibold uppercase text-neutral-400 mb-1">Device Received</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {report.receivedCount} <span className="text-sm font-normal text-emerald-300">({report.receivedPercentage}%)</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">Confirmed by Service Worker</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e172c] border border-[#1e2f52]">
                <div className="text-[11px] font-semibold uppercase text-neutral-400 mb-1">Opened (Tapped)</div>
                <div className="text-2xl font-bold text-cyan-400">
                  {report.openedCount} <span className="text-sm font-normal text-cyan-300">({report.openedPercentage}%)</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">Confirmed user click</div>
              </div>
            </div>

            {/* Breakdown by Platform & Browser */}
            {!report.isDryRun && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Platform Breakdown */}
                <div className="p-4 rounded-2xl bg-[#0e172c] border border-[#1e2f52] space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <Smartphone size={14} className="text-amber-400" />
                    <span>Platform Breakdown</span>
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(report.platformBreakdown).map(([platform, stats]) => (
                      <div key={platform} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#14203a]">
                        <span className="font-medium text-white">{platform}</span>
                        <div className="flex items-center gap-3 text-neutral-400">
                          <span>Sent: <strong className="text-neutral-200">{stats.sent}</strong></span>
                          <span>Received: <strong className="text-emerald-400">{stats.received}</strong></span>
                          <span>Opened: <strong className="text-cyan-400">{stats.opened}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Browser Breakdown */}
                <div className="p-4 rounded-2xl bg-[#0e172c] border border-[#1e2f52] space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <Globe size={14} className="text-blue-400" />
                    <span>Browser Breakdown</span>
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(report.browserBreakdown).map(([browser, stats]) => (
                      <div key={browser} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#14203a]">
                        <span className="font-medium text-white">{browser}</span>
                        <div className="flex items-center gap-3 text-neutral-400">
                          <span>Sent: <strong className="text-neutral-200">{stats.sent}</strong></span>
                          <span>Received: <strong className="text-emerald-400">{stats.received}</strong></span>
                          <span>Opened: <strong className="text-cyan-400">{stats.opened}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Unconfirmed Devices Section */}
            {!report.isDryRun && report.unconfirmedSubIds && report.unconfirmedSubIds.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Unconfirmed Devices ({report.unconfirmedSubIds.length})
                  </h3>
                </div>
                <p className="text-xs text-neutral-400">
                  These subscriptions were accepted by the push service but have not yet reported receipt to the server:
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {report.unconfirmedSubIds.map((item) => (
                    <div key={item.subId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded-xl bg-[#0f172a] text-xs">
                      <div className="font-mono text-amber-200 font-semibold">{item.subId}</div>
                      <div className="text-neutral-400 text-[11px]">{item.diagnostic}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Safety Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-[#0a1122] border border-[#2a3f6a] rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Real Test Broadcast</h3>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                  Are you sure you want to dispatch a real Web Push notification to all eligible registered user devices?
                  This will appear on users’ lock screens / desktop notification trays.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#111c33] border border-[#1f2f50] text-[11px] font-mono text-neutral-300">
                Title: Panchang Test Notification<br />
                Body: If you see this, daily Panchang alerts are working on your device. Tap to confirm.
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2 px-4 rounded-xl bg-[#131d33] hover:bg-[#1a2847] border border-[#24375b] text-neutral-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRealBroadcast}
                  className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-bold shadow-lg cursor-pointer"
                >
                  Yes, Broadcast Now
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
