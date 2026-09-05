// Conflict & Sync Review Modal per docs/06-offline-ux-wireframes.md
import React, { useState } from 'react';
import { RefreshCw, X, ShieldAlert, Clock, Cloud, ArrowDownToLine } from 'lucide-react';
import { SyncEngineStatus, drainSyncQueue, pullLatestFromCloud } from '../lib/sync/syncEngine';

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SyncEngineStatus;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  isOpen,
  onClose,
  syncState,
}) => {
  const [pullMsg, setPullMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRetrySync = () => {
    drainSyncQueue();
  };

  const handlePull = async () => {
    setPullMsg('Pulling from Firestore...');
    const res = await pullLatestFromCloud();
    if (res.error) {
      setPullMsg(`⚠️ ${res.error}`);
    } else {
      setPullMsg(`✅ Pulled ${res.totalPulled} cloud records.`);
    }
    setTimeout(() => setPullMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-elevated border border-saathi-warm-200 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-saathi-tea-900">
                Sync & Conflict Status
              </h3>
              {syncState.cloudSynced && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  <span>Cloud Active</span>
                </span>
              )}
            </div>
            <p className="text-xs text-saathi-mist-700">
              Idempotent Offline Queue & Field-Level Merge Log
            </p>
          </div>
        </div>

        {pullMsg && (
          <div className="mb-3 p-2.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl font-medium">
            {pullMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-saathi-warm-50 border border-saathi-warm-200 rounded-xl p-3 text-center">
            <span className="text-xs text-gray-500 font-medium">Pending Mutations</span>
            <div className="text-xl font-bold text-saathi-tea-800">{syncState.pendingCount}</div>
          </div>
          <div className="bg-saathi-warm-50 border border-saathi-warm-200 rounded-xl p-3 text-center">
            <span className="text-xs text-gray-500 font-medium">Failed Attempts</span>
            <div className={`text-xl font-bold ${syncState.failedCount > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
              {syncState.failedCount}
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-5 text-xs text-saathi-mist-800">
          <div className="font-semibold text-saathi-tea-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-saathi-tea-600" />
            <span>Conflict Resolution Protocol</span>
          </div>

          <div className="border border-saathi-warm-200 rounded-xl p-3.5 bg-saathi-warm-50/60 space-y-2">
            <div className="flex items-center justify-between font-semibold text-saathi-tea-900">
              <span>Booking Field-Level Merge</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">LWW Active</span>
            </div>
            <p className="text-saathi-mist-700">
              When the same booking is edited across devices, non-overlapping fields are merged automatically. In overlapping conflicts, the newer timestamp wins and older records are logged.
            </p>
          </div>

          <div className="border border-saathi-warm-200 rounded-xl p-3.5 bg-saathi-warm-50/60 space-y-2">
            <div className="flex items-center justify-between font-semibold text-saathi-tea-900">
              <span>Cash Ledger Adjustments</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Append-Only</span>
            </div>
            <p className="text-saathi-mist-700">
              Ledger entries are immutable append-only records with client-generated operation IDs for idempotency.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleRetrySync}
            disabled={syncState.isSyncing}
            className="flex-1 py-2.5 px-3 bg-[#2E5339] hover:bg-[#24422e] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
            <span>{syncState.isSyncing ? 'Syncing Queue...' : 'Sync Queue Now'}</span>
          </button>
          <button
            type="button"
            onClick={handlePull}
            disabled={syncState.isSyncing}
            className="py-2.5 px-3 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-stone-50 cursor-pointer disabled:opacity-50"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-blue-600" />
            <span>Pull Cloud</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3 border border-stone-200 text-stone-600 rounded-xl text-xs font-semibold hover:bg-stone-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
