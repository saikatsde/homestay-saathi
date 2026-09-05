// Settings, Host Profile & Cloud Sync Manager Section
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
  HelpCircle,
  Cloud,
  CloudOff,
  LogIn,
  LogOut,
  Key,
  Copy,
  ArrowDownToLine,
  ArrowUpFromLine,
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  isFirebaseConfigured, 
  getFirebaseConfig, 
  saveCustomFirebaseConfig, 
  clearCustomFirebaseConfig,
  FirebaseClientConfig 
} from '../../lib/firebase/config';
import { 
  signInAnonymousUser, 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  signOutUser 
} from '../../lib/firebase/auth';
import { drainSyncQueue, pullLatestFromCloud } from '../../lib/sync/syncEngine';
import { syncHostProfileToFirestore } from '../../lib/firebase/firestoreSync';

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

  // Cloud Auth State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [pullMsg, setPullMsg] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);

  // Firebase Config State
  const [showConfigEditor, setShowConfigEditor] = useState(false);
  const [configForm, setConfigForm] = useState<FirebaseClientConfig>(() => {
    return getFirebaseConfig() || {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
    };
  });

  const firebaseConfigured = isFirebaseConfigured();

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

    const profileData = {
      hostName: hostName.trim(),
      homestayName: homestayName.trim(),
      location: location.trim(),
      rooms: Number(rooms),
      defaultPrice: Number(defaultPrice),
      phone: phone.trim() || undefined,
      preferredLanguage: preferredLang,
      profileCompleted: true,
    };

    await db.syncMeta.update('singleton', profileData);

    // If user has a Firebase UID, sync to Firestore
    if (syncMeta?.uid) {
      try {
        await syncHostProfileToFirestore(syncMeta.uid, profileData);
      } catch (err) {
        console.warn('Profile cloud sync skipped:', err);
      }
    }

    onLanguageChange(preferredLang);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    try {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    } catch {}
  };

  const handleAnonymousSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const session = await signInAnonymousUser();
      setAuthSuccessMsg(`Connected as Anonymous Host (${session.uid.substring(0, 8)}...)`);
      setTimeout(() => setAuthSuccessMsg(null), 4000);
      await drainSyncQueue();
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Failed to initialize anonymous session.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;

    setAuthLoading(true);
    setAuthError(null);
    try {
      if (authMode === 'signup') {
        await signUpWithEmail(authEmail, authPassword);
        setAuthSuccessMsg('Account created & logged in!');
      } else {
        await signInWithEmail(authEmail, authPassword);
        setAuthSuccessMsg('Signed in successfully!');
      }
      setTimeout(() => setAuthSuccessMsg(null), 4000);
      setAuthEmail('');
      setAuthPassword('');
      await drainSyncQueue();
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Authentication error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
      setAuthSuccessMsg('Signed in with Google!');
      setTimeout(() => setAuthSuccessMsg(null), 4000);
      await drainSyncQueue();
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Google Sign-In failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!window.confirm('Sign out from Firebase? Note: All your local bookings, ledger, and profile remain 100% safe on this phone!')) return;
    setAuthLoading(true);
    try {
      await signOutUser();
      setAuthSuccessMsg('Signed out. Local data preserved.');
      setTimeout(() => setAuthSuccessMsg(null), 3000);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Sign out failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePushQueue = async () => {
    setSyncLoading(true);
    setPullMsg(null);
    try {
      const res = await drainSyncQueue();
      setPullMsg(`Pushed ${res.synced} items to Cloud. Failed: ${res.failed}.`);
      setTimeout(() => setPullMsg(null), 4000);
    } catch (err: unknown) {
      setPullMsg(`Sync error: ${err instanceof Error ? err.message : 'Unknown sync error'}`);
    } finally {
      setSyncLoading(false);
    }
  };

  const handlePullCloud = async () => {
    setSyncLoading(true);
    setPullMsg(null);
    try {
      const res = await pullLatestFromCloud();
      if (res.error) {
        setPullMsg(`⚠️ ${res.error}`);
      } else {
        setPullMsg(`✅ Pulled & merged ${res.totalPulled} records from Cloud Firestore.`);
      }
      setTimeout(() => setPullMsg(null), 5000);
    } catch (err: unknown) {
      setPullMsg(`Pull error: ${err instanceof Error ? err.message : 'Unknown pull error'}`);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSaveCustomConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configForm.apiKey || !configForm.projectId) {
      alert('API Key and Project ID are required.');
      return;
    }
    saveCustomFirebaseConfig(configForm);
  };

  const handleCopyUid = () => {
    if (syncMeta?.uid) {
      navigator.clipboard.writeText(syncMeta.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
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
          {currentLang === 'ne' ? 'आफ्नो होमस्टे विवरण, क्लाउड सिङ्क र एआई मोडल व्यवस्थापन' :
           currentLang === 'bn' ? 'হোমস্টে প্রোফাইল, ক্লাউড সিঙ্ক এবং এআই মডেল সেটিংস' :
           currentLang === 'hi' ? 'होमस्टे प्रोफाइल, क्लाउड सिंक और एआई मॉडल सेटिंग्स' :
           'Manage your homestay profile, Firebase Cloud Sync & offline data safety'}
        </p>
      </div>

      {/* 1. Firebase Cloud Sync & User Session Section */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${syncMeta?.uid ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-outfit flex items-center gap-2">
                Firebase Cloud Sync & Account
              </h2>
              <p className="text-xs text-stone-500">
                Idempotent Firestore synchronization with per-user data isolation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {syncMeta?.uid ? (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cloud Connected</span>
              </span>
            ) : (
              <span className="text-xs font-bold text-stone-600 bg-stone-100 border border-stone-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <CloudOff className="w-3.5 h-3.5 text-stone-500" />
                <span>Local Offline Only</span>
              </span>
            )}
          </div>
        </div>

        {/* Feedback messages */}
        {authError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}
        {authSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{authSuccessMsg}</span>
          </div>
        )}
        {pullMsg && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-center gap-2 font-medium">
            <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
            <span>{pullMsg}</span>
          </div>
        )}

        {/* User Session Info or Login Actions */}
        {syncMeta?.uid ? (
          <div className="space-y-4">
            <div className="bg-stone-50 border border-stone-200/70 rounded-xl p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                <span className="text-stone-500">Host Cloud UID:</span>
                <div className="flex items-center gap-1 font-mono font-bold text-stone-800 bg-white px-2 py-1 rounded border border-stone-200">
                  <span>{syncMeta.uid}</span>
                  <button
                    type="button"
                    onClick={handleCopyUid}
                    className="text-stone-400 hover:text-stone-700 ml-1 p-0.5 cursor-pointer"
                    title="Copy UID"
                  >
                    {copiedUid ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-stone-500">Account Type:</span>
                <span className="font-semibold text-stone-800 capitalize">
                  {syncMeta.authProvider === 'anonymous' ? '⚡ Anonymous Host (No password required)' : syncMeta.userEmail || syncMeta.authProvider || 'Registered User'}
                </span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-stone-500">Last Synced to Firestore:</span>
                <span className="font-medium text-stone-700">
                  {syncMeta.lastSyncedAt ? new Date(syncMeta.lastSyncedAt).toLocaleString() : 'Never synced yet'}
                </span>
              </div>
            </div>

            {/* Sync Action Buttons */}
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handlePushQueue}
                disabled={syncLoading}
                className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl bg-[#2E5339] hover:bg-[#24422e] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <ArrowUpFromLine className={`w-3.5 h-3.5 ${syncLoading ? 'animate-bounce' : ''}`} />
                <span>Push Queue to Cloud ({pendingMutations})</span>
              </button>

              <button
                type="button"
                onClick={handlePullCloud}
                disabled={syncLoading}
                className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 text-blue-600" />
                <span>Pull from Cloud (Merge)</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={authLoading}
                className="py-2.5 px-4 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-50 text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Disconnect Firebase session (keeps local data safe)"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-stone-600 leading-relaxed">
              Your homestay data is currently working 100% offline on this device. Connect to Firebase Cloud to sync automatically with Firestore, back up bookings, and restore on another phone.
            </p>

            {/* 1-Tap Anonymous Activation Button */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-amber-900">
                  ⚡ 1-Tap Quick Connect (Anonymous Host)
                </h4>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Instant cloud sync without entering emails or remembering passwords. Designed for Himalayan hosts.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAnonymousSignIn}
                disabled={authLoading}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>{authLoading ? 'Connecting...' : 'Activate Sync Now'}</span>
              </button>
            </div>

            {/* Email / Password Form & Google Sign In */}
            <div className="border border-stone-200 rounded-xl p-4 space-y-3 bg-stone-50/50">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-200">
                <span className="font-semibold text-stone-800">
                  {authMode === 'signin' ? 'Sign in with Email' : 'Create Host Account'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                    setAuthError(null);
                  }}
                  className="text-[#2E5339] hover:underline font-bold text-xs cursor-pointer"
                >
                  {authMode === 'signin' ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="host@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#2E5339]"
                  />
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Password (min 6 chars)"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#2E5339]"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="py-2 px-4 rounded-xl bg-[#2E5339] hover:bg-[#24422e] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="py-2 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>Google Sign-In</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Optional Firebase Configuration Accordion */}
        <div className="pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={() => setShowConfigEditor(!showConfigEditor)}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-stone-400" />
            <span>
              {firebaseConfigured ? '⚙️ Firebase Configured (Tap to view/edit custom credentials)' : '⚠️ Setup Firebase Credentials'}
            </span>
          </button>

          {showConfigEditor && (
            <form onSubmit={handleSaveCustomConfig} className="mt-3 p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 text-xs">
              <p className="text-stone-600 text-[11px]">
                Enter Firebase Web App credentials or set them in <code>.env.local</code>. Custom credentials saved here are stored in browser localStorage.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">API Key</label>
                  <input
                    type="text"
                    required
                    value={configForm.apiKey || ''}
                    onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-stone-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Project ID</label>
                  <input
                    type="text"
                    required
                    value={configForm.projectId || ''}
                    onChange={(e) => setConfigForm({ ...configForm, projectId: e.target.value })}
                    placeholder="homestay-saathi"
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-stone-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Auth Domain</label>
                  <input
                    type="text"
                    value={configForm.authDomain || ''}
                    onChange={(e) => setConfigForm({ ...configForm, authDomain: e.target.value })}
                    placeholder="homestay-saathi.firebaseapp.com"
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-stone-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">App ID</label>
                  <input
                    type="text"
                    value={configForm.appId || ''}
                    onChange={(e) => setConfigForm({ ...configForm, appId: e.target.value })}
                    placeholder="1:123456789:web:abcdef"
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-stone-200 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#2E5339] text-white rounded-lg font-semibold cursor-pointer"
                >
                  Save & Reload
                </button>
                <button
                  type="button"
                  onClick={clearCustomFirebaseConfig}
                  className="px-3.5 py-1.5 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
                >
                  Reset to .env Defaults
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 2. Host Profile Form Card */}
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
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center min-h-[44px] cursor-pointer ${
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
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2E5339] hover:bg-[#24422e] text-white font-semibold shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>

      {/* 3. Device, On-Device AI & Backup Cards */}
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
            className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
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
              Device & Local Database
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
