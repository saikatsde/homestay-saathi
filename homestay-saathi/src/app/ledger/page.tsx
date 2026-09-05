"use client";

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { Ledger } from '../../components/sections/Ledger';

export default function LedgerPage() {
  const syncMeta = useLiveQuery(() => db.syncMeta.get('singleton'), []);
  const currentLang = syncMeta?.preferredLanguage || 'en';

  return <Ledger currentLang={currentLang} />;
}
