// App Header with 1-Tap Language Switcher and AI Status Badge
import React from 'react';
import Link from 'next/link';
import { Bot, Sparkles, Settings as SettingsIcon, Zap, Cloud } from 'lucide-react';
import { SupportedLanguage, ModelAvailabilityState, SyncMeta } from '../lib/types';
import { translations } from '../lib/i18n/translations';

interface HeaderProps {
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  modelState: ModelAvailabilityState;
  syncMeta?: SyncMeta;
  onOpenModelModal: () => void;
  onOpenProfileModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  modelState,
  syncMeta,
  onOpenModelModal,
  onOpenProfileModal,
}) => {
  const t = translations[currentLang];

  const languages: Array<{ code: SupportedLanguage; label: string }> = [
    { code: 'en', label: 'English' },
    { code: 'ne', label: 'नेपाली' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'hi', label: 'हिन्दी' },
  ];

  return (
    <header className="bg-[#153224] text-white px-4 py-3 shadow-md border-b border-[#214935]">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Branding & Subtitle */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#244f39] border border-[#376e52] flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
            <span className="text-xl">🍵</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg md:text-xl tracking-tight text-white font-outfit">
                {t.appName}
              </span>
              <span className="bg-[#244f39] text-[#D5EADF] border border-[#376e52] text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded">
                Offline PWA
              </span>
            </div>
            <p className="text-[11px] md:text-xs text-[#CBE2D4] line-clamp-1">
              {syncMeta?.homestayName || t.appSubtitle}
            </p>
          </div>
        </Link>

        {/* Right: Cloud Sync Status + AI Status + Multilingual Toggle + Settings */}
        <div className="flex items-center gap-2">
          {/* Cloud Status Badge */}
          {syncMeta?.uid && (
            <Link
              href="/settings"
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold bg-[#1d4431] hover:bg-[#25553e] border border-[#2e684a] text-emerald-200 transition-colors"
              title={`Cloud Firestore Connected (UID: ${syncMeta.uid})`}
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cloud</span>
            </Link>
          )}

          {/* AI Badge Button */}
          <button
            type="button"
            onClick={onOpenModelModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#244f39] hover:bg-[#2d5f45] border border-[#376e52] text-[#E4F2E9] transition-colors cursor-pointer"
            title="On-device AI Status & Manager"
          >
            <Zap className={`w-3.5 h-3.5 ${modelState.status === 'available' ? 'text-amber-400' : 'text-emerald-300'}`} />
            <span className="hidden sm:inline">
              {modelState.status === 'available' ? 'On-Device AI' : 'Template AI'}
            </span>
          </button>

          {/* 1-Tap Language Toggle Switcher */}
          <div className="flex items-center bg-[#0d2218] rounded-xl p-0.5 border border-[#27533c]">
            {languages.map((lang) => {
              const isActive = currentLang === lang.code;
              return (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#D97706] text-white shadow-xs font-bold'
                      : 'text-[#CBE2D4] hover:text-white hover:bg-[#1a3d2c]'
                  }`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>

          {/* Settings Link */}
          <Link
            href="/settings"
            className="p-2 rounded-xl text-[#CBE2D4] hover:text-white hover:bg-[#244f39] border border-transparent hover:border-[#376e52] transition-colors cursor-pointer"
            title={t.nav.settings}
          >
            <SettingsIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
