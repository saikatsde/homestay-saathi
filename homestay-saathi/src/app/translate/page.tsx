"use client";

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { Translator } from '../../components/sections/Translator';
import { ModelDownloadModal } from '../../components/ModelDownloadModal';
import { getModelAvailability } from '../../lib/ai/availability';

export default function TranslatePage() {
  const syncMeta = useLiveQuery(() => db.syncMeta.get('singleton'), []);
  const currentLang = syncMeta?.preferredLanguage || 'en';
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const modelState = getModelAvailability();

  return (
    <>
      <Translator
        currentLang={currentLang}
        onOpenModelModal={() => setIsModelModalOpen(true)}
      />
      <ModelDownloadModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        modelState={modelState}
      />
    </>
  );
}
