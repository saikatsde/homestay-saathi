"use client";

import React, { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, getOrCreateSyncMeta } from "../lib/db";
import { initializeCleanDatabase } from "../lib/sync/seedData";
import { 
  SupportedLanguage, 
  HostProfile, 
  ModelAvailabilityState 
} from "../lib/types";
import { 
  subscribeConnectivity, 
  ConnectivityStatus 
} from "../lib/sync/connectivity";
import { 
  subscribeSyncStatus, 
  SyncEngineStatus, 
  drainSyncQueue 
} from "../lib/sync/syncEngine";
import { getModelAvailability } from "../lib/ai/availability";
import { initAuthListener } from "../lib/firebase/auth";

// Global Layout Components
import { Header } from "./Header";
import { ConnectivityBanner } from "./ConnectivityBanner";
import { Navigation } from "./Navigation";
import { OnboardingModal } from "./OnboardingModal";
import { ModelDownloadModal } from "./ModelDownloadModal";
import { ConflictModal } from "./ConflictModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  // Modals state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  // Connectivity & Sync State
  const [connectivity, setConnectivity] = useState<ConnectivityStatus>("online");
  const [syncState, setSyncState] = useState<SyncEngineStatus>({
    isSyncing: false,
    pendingCount: 0,
    failedCount: 0,
    lastSyncedAt: null,
    lastError: null,
    cloudSynced: false,
  });

  // Model Availability State
  const [modelState, setModelState] = useState<ModelAvailabilityState>(() =>
    getModelAvailability()
  );

  // Dexie DB Live Query for SyncMeta
  const syncMeta = useLiveQuery(() => db.syncMeta.get("singleton"), []);

  // 1. Initial Database Setup & Service Worker Registration
  useEffect(() => {
    async function init() {
      try {
        await initializeCleanDatabase();
        const meta = await getOrCreateSyncMeta();
        if (meta) {
          if (meta.preferredLanguage) {
            setCurrentLang(meta.preferredLanguage);
          }
          if (!meta.profileCompleted) {
            setIsOnboardingOpen(true);
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsInitialized(true);
      }
    }

    init();

    // Register Service Worker for offline PWA precaching
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Homestay Saathi Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("Service Worker registration skipped:", err);
        });
    }
  }, []);

  // 2. Subscribe to Network Reachability and Sync Engine changes
  useEffect(() => {
    const unsubConn = subscribeConnectivity((status) => {
      setConnectivity(status);
      if (status === "online") {
        drainSyncQueue();
      }
    });

    const unsubSync = subscribeSyncStatus((state) => {
      setSyncState(state);
    });

    const unsubAuth = initAuthListener();

    return () => {
      unsubConn();
      unsubSync();
      unsubAuth();
    };
  }, []);

  // 3. Keep Model Status in sync
  useEffect(() => {
    setModelState(getModelAvailability());
  }, [isModelModalOpen]);

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    setCurrentLang(lang);
    await db.syncMeta.update("singleton", { preferredLanguage: lang });
  };

  const handleCompleteOnboarding = (profile: HostProfile) => {
    setIsOnboardingOpen(false);
    setCurrentLang(profile.preferredLanguage);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#153224] flex flex-col items-center justify-center p-4 text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 text-3xl animate-pulse">
          🍵
        </div>
        <h2 className="text-xl font-bold font-outfit tracking-tight">Homestay Saathi</h2>
        <p className="text-sm text-[#CBE2D4] mt-1">Starting offline homestay copilot...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F4] text-[#111C16]">
      {/* Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        modelState={modelState}
        syncMeta={syncMeta}
        onOpenModelModal={() => setIsModelModalOpen(true)}
        onOpenProfileModal={() => setIsOnboardingOpen(true)}
      />

      {/* Navigation Sub-bar */}
      <Navigation currentLang={currentLang} />

      {/* Connectivity & Sync Status Banner */}
      <ConnectivityBanner
        connectivity={connectivity}
        syncState={syncState}
        currentLang={currentLang}
        onOpenConflictModal={() => setIsConflictModalOpen(true)}
      />

      {/* Page Content Viewport */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-8">
        {children}
      </main>

      {/* 4-Step Host Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
      />

      {/* On-Device AI Model Manager Modal */}
      <ModelDownloadModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        modelState={modelState}
      />

      {/* Sync Conflict & Mutation Queue Review Modal */}
      <ConflictModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        syncState={syncState}
      />
    </div>
  );
}
