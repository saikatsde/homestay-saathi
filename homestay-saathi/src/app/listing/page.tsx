"use client";

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { ListingAssistant } from '../../components/sections/ListingAssistant';
import { ModelDownloadModal } from '../../components/ModelDownloadModal';
import { getModelAvailability } from '../../lib/ai/availability';

export default function ListingPage() {
  const syncMeta = useLiveQuery(() => db.syncMeta.get('singleton'), []);
  const currentLang = syncMeta?.preferredLanguage || 'en';
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const modelState = getModelAvailability();

  return (
    <>
      <ListingAssistant
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
