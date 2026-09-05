// Zero Dummy Data Initialization - Clean Slate for Real Homestay Hosts
import { db, getOrCreateSyncMeta } from '../db';
import { ChecklistItem } from '../types';

export const initialFreshChecklist: Array<Omit<ChecklistItem, 'updatedAt' | 'syncStatus'>> = [
  // Before Guest Arrival
  { id: 'before-clean-room', stage: 'before', labelKey: 'chk_clean_room', defaultLabel: 'Sun-air and dust guest room & change fresh cotton bedsheets', done: false },
  { id: 'before-check-hotwater', stage: 'before', labelKey: 'chk_hotwater', defaultLabel: 'Check hot water geyser & keep warm bathing bucket ready', done: false },
  { id: 'before-kitchen-groceries', stage: 'before', labelKey: 'chk_groceries', defaultLabel: 'Procure fresh organic vegetables, milk & Darjeeling orthodox tea', done: false },
  { id: 'before-charge-lights', stage: 'before', labelKey: 'chk_lights', defaultLabel: 'Charge emergency LED lamps in case of village power cuts', done: false },
  
  // During Stay & Welcoming
  { id: 'during-welcome-tea', stage: 'during', labelKey: 'chk_welcome_tea', defaultLabel: 'Welcome guests with warm homemade ginger cardamom tea & traditional Khada scarf', done: false },
  { id: 'during-explain-amenities', stage: 'during', labelKey: 'chk_explain', defaultLabel: 'Explain dining timings, hot water operation & village quiet hours (9:30 PM)', done: false },
  { id: 'during-tea-garden-walk', stage: 'during', labelKey: 'chk_teawalk', defaultLabel: 'Offer morning guided walk to the sunrise viewpoint & tea garden bushes', done: false },
  
  // After Check-out
  { id: 'after-settle-payment', stage: 'after', labelKey: 'chk_payment', defaultLabel: 'Settle final payment (Cash or UPI) & record in cash ledger', done: false },
  { id: 'after-check-belongings', stage: 'after', labelKey: 'chk_belongings', defaultLabel: 'Check room for any forgotten guest belongings & keys', done: false },
  { id: 'after-clean-air', stage: 'after', labelKey: 'chk_clean_post', defaultLabel: 'Thoroughly wash linens and ventilate room for next arrival', done: false },
];

export async function initializeCleanDatabase(): Promise<void> {
  await getOrCreateSyncMeta();

  // Populate fresh uncompleted checklist if empty
  const checklistCount = await db.checklistItems.count();
  if (checklistCount === 0) {
    const checklistData: ChecklistItem[] = initialFreshChecklist.map(item => ({
      ...item,
      updatedAt: new Date().toISOString(),
      syncStatus: 'synced',
    }));
    await db.checklistItems.bulkPut(checklistData);
  }
}
