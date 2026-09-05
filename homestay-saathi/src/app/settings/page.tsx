"use client";

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { Settings } from '../../components/sections/Settings';
import { ModelDownloadModal } from '../../components/ModelDownloadModal';
import { OnboardingModal } from '../../components/OnboardingModal';
import { getModelAvailability } from '../../lib/ai/availability';
import { SupportedLanguage } from '../../lib/types';

export default function SettingsPage() {
  const syncMeta = useLiveQuery(() => db.syncMeta.get('singleton'), []);
  const currentLang = syncMeta?.preferredLanguage || 'en';

  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const modelState = getModelAvailability();

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    await db.syncMeta.update('singleton', { preferredLanguage: lang });
  };

  return (
    <>
      <Settings
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        onOpenModelModal={() => setIsModelModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      <ModelDownloadModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        modelState={modelState}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => setIsOnboardingOpen(false)}
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
      />
    </>
  );
}
