"use client";

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { Checklist } from '../../components/sections/Checklist';

export default function ChecklistPage() {
  const syncMeta = useLiveQuery(() => db.syncMeta.get('singleton'), []);
  const currentLang = syncMeta?.preferredLanguage || 'en';

  return <Checklist currentLang={currentLang} />;
}
