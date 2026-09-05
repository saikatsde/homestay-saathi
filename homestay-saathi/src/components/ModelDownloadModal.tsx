// Modal for On-Device AI Model Weights Management
import React, { useState } from 'react';
import { Bot, CheckCircle2, Download, RefreshCw, X, Sparkles } from 'lucide-react';
import { ModelAvailabilityState } from '../lib/types';
import { downloadAIModel, removeAIModelCache } from '../lib/ai/availability';

interface ModelDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelState: ModelAvailabilityState;
}

export const ModelDownloadModal: React.FC<ModelDownloadModalProps> = ({
  isOpen,
  onClose,
  modelState,
}) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleStartDownload = async () => {
    setDownloading(true);
    await downloadAIModel();
    setDownloading(false);
  };

  const handleClearCache = () => {
    removeAIModelCache();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-elevated border border-saathi-warm-200 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-saathi-tea-100 border border-saathi-tea-300 flex items-center justify-center text-saathi-tea-800">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-saathi-tea-900">
              On-Device AI Engine
            </h3>
            <p className="text-xs text-saathi-mist-700">
              Zero-Cloud Privacy · Runs 100% Offline
            </p>
          </div>
        </div>

        <div className="bg-saathi-warm-100 border border-saathi-warm-200 rounded-xl p-4 mb-4 text-xs space-y-2 text-saathi-mist-800">
          <div className="flex justify-between items-center pb-2 border-b border-saathi-warm-200">
            <span className="font-medium text-gray-600">Current Status:</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
              modelState.status === 'available'
                ? 'bg-emerald-100 text-emerald-800'
                : modelState.status === 'downloading'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {modelState.status === 'available'
                ? 'Active & Ready'
                : modelState.status === 'downloading'
                ? `Downloading (${modelState.downloadProgress || 0}%)`
                : 'Deterministic Template Mode'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Model Name:</span>
            <span className="font-medium truncate max-w-[200px]">{modelState.modelName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Storage Footprint:</span>
            <span className="font-medium">~120 MB (OPFS / Cache)</span>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-5 flex items-start gap-2.5 text-xs text-emerald-900">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            <strong>Offline Guarantee:</strong> Even if model weights are not downloaded, Homestay Saathi never crashes or shows a blank screen. It automatically uses verified hill-homestay deterministic templates!
          </p>
        </div>

        {modelState.status !== 'available' ? (
          <button
            type="button"
            onClick={handleStartDownload}
            disabled={downloading || modelState.status === 'downloading'}
            className="w-full btn-primary py-3 font-semibold text-sm flex items-center justify-center gap-2"
          >
            {downloading || modelState.status === 'downloading' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Downloading Cache ({modelState.downloadProgress || 0}%)...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Offline AI Weights (120MB)</span>
              </>
            )}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-emerald-700 text-xs font-semibold py-2 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>On-device model cached & ready offline</span>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              className="w-full text-xs text-red-600 hover:text-red-800 py-1 font-medium transition text-center cursor-pointer"
            >
              Clear AI Model from Cache (Test Template Fallback)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
