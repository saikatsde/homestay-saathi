// Shared TypeScript interfaces for Homestay Saathi Next.js App

export type PaymentStatus = 'pending' | 'partial' | 'settled';
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';
export type SupportedLanguage = 'en' | 'ne' | 'bn' | 'hi';

export interface HostProfile {
  hostName: string;
  homestayName: string;
  location: string;
  rooms: number;
  defaultPrice: number;
  phone?: string;
  preferredLanguage: SupportedLanguage;
  profileCompleted: boolean;
}

export interface Booking {
  id: string;              // uuid
  guestName: string;
  guestPhone?: string;     // optional per privacy specs
  checkIn: string;         // ISO date (YYYY-MM-DD)
  checkOut: string;        // ISO date (YYYY-MM-DD)
  guests: number;
  amount: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;       // ISO-8601
  updatedAt: string;       // ISO-8601
  serverUpdatedAt?: string;
  syncStatus: SyncStatus;
  conflictHistory?: Array<{ field: string; previousValue: unknown; resolvedAt: string; sourceDevice?: string }>;
}

export interface LedgerEntry {
  id: string;
  type: 'income' | 'expense' | 'adjustment';
  sourceBookingId?: string;   // links income entries to a booking
  amount: number;
  description: string;
  status: 'pending' | 'settled';
  createdAt: string;
  syncStatus: SyncStatus;
}

export interface Listing {
  id: string;
  homestayName: string;
  location: string;
  rooms: number;
  amenities: string[];
  food: string;
  attractions: string[];
  houseRules: string[];
  price: number;
  headline?: string;
  shortListing?: string;
  detailedListing?: string;
  amenitiesSummary?: string;
  localExperienceText?: string;
  generatedBy: 'ai' | 'template';
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

export interface ChecklistItem {
  id: string;               // e.g. "before-room-prepared"
  stage: 'before' | 'during' | 'after';
  labelKey: string;         // key for i18n
  defaultLabel: string;
  done: boolean;
  updatedAt: string;
  syncStatus: SyncStatus;
}

export interface MutationQueueItem {
  operationId: string;
  entity: 'booking' | 'ledgerEntry' | 'listing' | 'checklistItem';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  clientTimestamp: string;
  syncStatus: SyncStatus;
  retryCount: number;
  lastAttemptAt: string | null;
  deviceId: string;
  errorMessage?: string;
}

export interface SyncMeta {
  id: 'singleton';
  deviceId: string;
  lastSyncedAt: string | null;
  authState: 'anonymous' | 'authenticated';
  hostName: string;
  homestayName: string;
  location: string;
  rooms: number;
  defaultPrice: number;
  phone?: string;
  preferredLanguage: SupportedLanguage;
  profileCompleted: boolean;
}

export type ModelStatus = 'checking' | 'available' | 'downloading' | 'unavailable';

export interface ModelAvailabilityState {
  status: ModelStatus;
  downloadProgress?: number; // 0-100
  modelName: string;
  lastChecked: string;
  isNativeSupported: boolean; // Chrome Prompt API
  error?: string;
}

export interface ScenarioDefinition {
  id: string;
  icon: string;
  nameKey: string;
  defaultName: string;
  descriptionKey: string;
  replies: Record<SupportedLanguage, (context: { homestayName: string; price: number; location: string; hostName: string }) => string>;
  phrases: Record<SupportedLanguage, string>;
}
