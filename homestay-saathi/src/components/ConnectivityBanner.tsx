// Dynamic Connectivity Banner with Airplane Mode Simulation Toggle
import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ConnectivityStatus, setSimulatedConnectivity } from '../lib/sync/connectivity';
import { SyncEngineStatus, drainSyncQueue } from '../lib/sync/syncEngine';
import { formatRelativeTime } from '../lib/utils';
import { SupportedLanguage } from '../lib/types';
import { translations } from '../lib/i18n/translations';

interface ConnectivityBannerProps {
  connectivity: ConnectivityStatus;
  syncState: SyncEngineStatus;
  currentLang: SupportedLanguage;
  onOpenConflictModal?: () => void;
}

export const ConnectivityBanner: React.FC<ConnectivityBannerProps> = ({
  connectivity,
  syncState,
  currentLang,
  onOpenConflictModal,
}) => {
  const t = translations[currentLang];
  const isOffline = connectivity === 'offline';
  const hasChanges = syncState.pendingCount > 0;
  const hasFailed = syncState.failedCount > 0;

  const handleToggleAirplaneMode = () => {
    const next = isOffline ? 'online' : 'offline';
    setSimulatedConnectivity(next);
  };

  const handleManualSync = (e: React.MouseEvent) => {
    e.stopPropagation();
    drainSyncQueue();
  };

  const getBgColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-700 text-emerald-50';
      case 'offline':
        return 'bg-amber-600 text-amber-50';
      case 'syncing':
        return 'bg-blue-600 text-blue-50';
      case 'failed':
        return 'bg-red-600 text-red-50';
      default:
        return 'bg-gray-600 text-gray-50';
    }
  };

  return (
    <div className={`w-full sticky top-0 z-40 transition-colors duration-200 ${getBgColor(connectivity)}`}>
      {hasFailed ? (
        <div
          onClick={onOpenConflictModal}
          className="max-w-5xl mx-auto text-white px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between shadow-sm cursor-pointer hover:bg-red-700 transition"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-200 animate-pulse" />
            <span>
              🔴 <strong>{t.syncIssueBadge}:</strong> {syncState.failedCount} item(s) could not sync. Tap to review.
            </span>
          </div>
          <button
            type="button"
            onClick={handleManualSync}
            className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : isOffline ? (
        <div className="max-w-5xl mx-auto text-amber-50 px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-200 shrink-0" />
            <span>
              <strong>🟠 {t.offlineBadge}</strong> ·{' '}
              {hasChanges ? `${syncState.pendingCount} ${t.changesWaiting}` : 'All features work 100% offline'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleAirplaneMode}
              title="Simulate network recovery (Turn Online)"
              className="bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 active:scale-95 transition cursor-pointer"
            >
              <Wifi className="w-3 h-3" />
              <span>Go Online</span>
            </button>
          </div>
        </div>
      ) : syncState.isSyncing ? (
        <div className="max-w-5xl mx-auto text-blue-50 px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-200 animate-spin" />
            <span>
              <strong>🔵 {t.syncingBadge}</strong> ({syncState.pendingCount} left to sync)
            </span>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto text-emerald-50 px-4 py-1.5 text-xs md:text-sm font-medium flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>
              <strong>🟢 {t.onlineBadge}</strong> ·{' '}
              {syncState.lastSyncedAt
                ? `Synced ${formatRelativeTime(syncState.lastSyncedAt)}`
                : t.syncedJustNow}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleAirplaneMode}
              title="Test Offline Mode (Simulate Airplane Mode)"
              className="bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 px-2.5 py-1 rounded text-xs flex items-center gap-1 active:scale-95 transition cursor-pointer"
            >
              <WifiOff className="w-3 h-3 text-emerald-300" />
              <span>Test Offline</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
