// Settings & Host Profile Editor Section
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { SupportedLanguage } from '../../lib/types';
import { translations } from '../../lib/i18n/translations';
import { getModelAvailability } from '../../lib/ai/availability';
import { 
  Settings as SettingsIcon, 
  User, 
  Home, 
  MapPin, 
  Phone, 
  Languages, 
  Save, 
  Download, 
  Smartphone, 
  Cpu, 
  RefreshCw, 
  Check, 
  Heart, 
  Sparkles, 
  HelpCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SettingsProps {
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onOpenModelModal: () => void;
  onOpenOnboarding: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  currentLang,
  onLanguageChange,
  onOpenModelModal,
  onOpenOnboarding,
}) => {
  const t = translations[currentLang];
  const syncMeta = useLiveQuery(() => db.syncMeta.get('singleton'), []);
  const pendingMutations = useLiveQuery(() => db.mutationQueue.count(), []) || 0;
  const bookingsCount = useLiveQuery(() => db.bookings.count(), []) || 0;
  const ledgerCount = useLiveQuery(() => db.ledgerEntries.count(), []) || 0;
  const listingsCount = useLiveQuery(() => db.listings.count(), []) || 0;

  // Form State
  const [hostName, setHostName] = useState('');
  const [homestayName, setHomestayName] = useState('');
  const [location, setLocation] = useState('');
  const [rooms, setRooms] = useState<number>(2);
  const [defaultPrice, setDefaultPrice] = useState<number>(1800);
  const [phone, setPhone] = useState('');
  const [preferredLang, setPreferredLang] = useState<SupportedLanguage>(currentLang);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (syncMeta) {
      setHostName(syncMeta.hostName || '');
      setHomestayName(syncMeta.homestayName || '');
      setLocation(syncMeta.location || '');
      setRooms(syncMeta.rooms || 2);
      setDefaultPrice(syncMeta.defaultPrice || 1800);
      setPhone(syncMeta.phone || '');
      setPreferredLang(syncMeta.preferredLanguage || currentLang);
    }
  }, [syncMeta, currentLang]);

  const modelInfo = getModelAvailability();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName.trim() || !homestayName.trim() || !location.trim()) return;

    await db.syncMeta.update('singleton', {
      hostName: hostName.trim(),
      homestayName: homestayName.trim(),
      location: location.trim(),
      rooms: Number(rooms),
      defaultPrice: Number(defaultPrice),
      phone: phone.trim() || undefined,
      preferredLanguage: preferredLang,
      profileCompleted: true,
    });

    onLanguageChange(preferredLang);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    try {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    } catch {}
  };

  const handleExportBackup = async () => {
    const allBookings = await db.bookings.toArray();
    const allLedger = await db.ledgerEntries.toArray();
    const allListings = await db.listings.toArray();
    const allChecklist = await db.checklistItems.toArray();
    const meta = await db.syncMeta.get('singleton');

    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      meta,
      bookings: allBookings,
      ledger: allLedger,
      listings: allListings,
      checklist: allChecklist,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `homestay-saathi-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1e3826] font-outfit flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-[#2E5339]" />
          {t.settings.title}
        </h1>
        <p className="text-sm text-stone-600 mt-0.5">
          {currentLang === 'ne' ? 'आफ्नो होमस्टे विवरण, अफलाइन ब्याकअप र एआई मोडल व्यवस्थापन' :
           currentLang === 'bn' ? 'হোমস্টে প্রোফাইল, অফলাইন ব্যাকআপ এবং এআই মডেল সেটিংস' :
           currentLang === 'hi' ? 'होमस्टे प्रोफाइल, ऑफलाइन बैकअप और एआई मॉडल सेटिंग्स' :
           'Manage your homestay profile, on-device AI settings & offline JSON backups'}
        </p>
      </div>

      {/* Host Profile Form Card */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h2 className="text-base font-bold text-stone-900 font-outfit flex items-center gap-2">
            <User className="w-5 h-5 text-[#2E5339]" />
            Homestay & Host Profile
          </h2>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Profile Updated!</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Host Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
              {t.onboarding.hostName} *
            </label>
            <input
              type="text"
              required
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="e.g. Host Full Name"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#2E5339] text-stone-900 text-sm font-medium"
            />
          </div>

          {/* Homestay Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
              {t.onboarding.homestayName} *
            </label>
            <input
              type="text"
              required
              value={homestayName}
              onChange={(e) => setHomestayName(e.target.value)}
              placeholder="e.g. Kanchenjunga View Homestay"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#2E5339] text-stone-900 text-sm font-medium"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
              {t.onboarding.location} *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Takdah Cantonment, Darjeeling"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#2E5339] text-stone-900 text-sm font-medium"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
              {t.onboarding.phoneOptional}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#2E5339] text-stone-900 text-sm font-medium"
            />
          </div>

          {/* Rooms */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
              {t.onboarding.roomsCount}
            </label>
            <input
              type="number"
              min="1"
              max="30"
              required
              value={rooms}
              onChange={(e) => setRooms(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#2E5339] text-stone-900 text-sm font-bold"
            />
          </div>

          {/* Default Price */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
              {t.onboarding.defaultPrice}
            </label>
            <input
              type="number"
              min="200"
              step="50"
              required
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#2E5339] text-stone-900 text-sm font-bold font-outfit"
            />
          </div>
        </div>

        {/* Preferred Language */}
        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
            App Display Language
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { code: 'en' as SupportedLanguage, label: 'English' },
              { code: 'ne' as SupportedLanguage, label: 'नेपाली (Nepali)' },
              { code: 'bn' as SupportedLanguage, label: 'বাংলা (Bengali)' },
              { code: 'hi' as SupportedLanguage, label: 'हिंदी (Hindi)' },
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setPreferredLang(l.code)}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center min-h-[44px] ${
                  preferredLang === l.code
                    ? 'bg-[#2E5339] text-white border-[#2E5339] shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2E5339] hover:bg-[#24422e] text-white font-semibold shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>

      {/* Device, On-Device AI & Backup Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* On-Device AI Engine Status */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-sm font-bold text-stone-900 font-outfit flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#2E5339]" />
              {t.settings.offlineAIModel}
            </h3>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                modelInfo.status === 'available'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {modelInfo.status === 'available' ? 'Active & Ready' : 'Deterministic Mode'}
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            {modelInfo.status === 'available'
              ? 'On-device neural model is active and running 100% locally without sending prompts to external cloud servers.'
              : 'App uses instant Himalayan offline heuristic templates. You can check for on-device browser model support anytime.'}
          </p>

          <button
            type="button"
            onClick={onOpenModelModal}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.settings.downloadModel} / Status Details</span>
          </button>
        </div>

        {/* Device Sync & Local Database */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-sm font-bold text-stone-900 font-outfit flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#2E5339]" />
              Device & Database
            </h3>
            <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
              v1.0.0
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between py-1 border-b border-stone-50">
              <span className="text-stone-400">Device ID:</span>
              <span className="font-mono text-stone-800 truncate max-w-[150px]">
                {syncMeta?.deviceId || 'device-local'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-50">
              <span className="text-stone-400">Local Records:</span>
              <span className="font-medium text-stone-800">
                {bookingsCount} bookings, {ledgerCount} ledger, {listingsCount} listings
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-50">
              <span className="text-stone-400">Sync Queue:</span>
              <span className="font-semibold text-[#2E5339]">
                {pendingMutations} pending mutations
              </span>
            </div>
          </div>

          {/* Export JSON Backup & Reset Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#153224]/10 hover:bg-[#153224]/20 text-[#153224] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.settings.exportBackup}</span>
            </button>

            <button
              type="button"
              onClick={onOpenOnboarding}
              className="py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1 min-h-[44px] cursor-pointer"
              title="Re-open Onboarding Setup Wizard"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Wizard</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                if (!window.confirm('Clear all test bookings and ledger records to start with a fresh clean slate? Your host profile will be kept.')) return;
                await db.bookings.clear();
                await db.ledgerEntries.clear();
                await db.listings.clear();
                await db.mutationQueue.clear();
                alert('Database cleared! You now have a clean slate.');
              }}
              className="w-full py-2 px-3 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🧹 Reset to Clean Slate (Remove Test Bookings & Ledger)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="bg-gradient-to-r from-[#2E5339]/10 via-[#FDF6EC] to-[#D97706]/10 rounded-2xl p-4 border border-[#2E5339]/20 text-center space-y-1">
        <p className="text-xs font-bold text-[#1e3826] flex items-center justify-center gap-1.5">
          <span>🏔️ Homestay Saathi</span>
          <span>·</span>
          <span>{t.settings.madeForHills || 'Built for Darjeeling & Himalayan Tea Villages'}</span>
        </p>
        <p className="text-[11px] text-stone-500">
          Takdah · Tinchuley · Lamahatta · Peshok · Sittong · Mirik · Kurseong · Kalimpong · Rimbick
        </p>
      </div>
    </div>
  );
};
