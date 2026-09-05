// Hosting Checklist Section (3 Stages: Before Arrival, During Stay, After Departure)
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateUUID } from '../../lib/db';
import { queueMutation } from '../../lib/sync/syncEngine';
import { ChecklistItem, SupportedLanguage } from '../../lib/types';
import { translations } from '../../lib/i18n/translations';
import { 
  CheckSquare, 
  Square, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Coffee, 
  LogOut, 
  Flame 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChecklistProps {
  currentLang: SupportedLanguage;
}

// Localized labels for checklist items
const localizedChecklistLabels: Record<string, Record<SupportedLanguage, string>> = {
  'before-clean-room': {
    en: 'Sun-air and dust guest room & change fresh cotton bedsheets',
    ne: 'पाहुना कोठा घाममा सुकाउने, सफा गर्ने र ताजा तन्ना फेर्ने',
    bn: 'গেস্ট রুম পরিষ্কার করা ও রোদে শুকানো পরিষ্কার চাদর বিছানো',
    hi: 'अतिथि कक्ष को धूप दिखाना, झाड़ना और साफ चादरें बिछाना',
  },
  'before-check-hotwater': {
    en: 'Check hot water geyser & keep warm bathing bucket ready',
    ne: 'गिजर / सोलार चेक गर्ने र नुहाउन तातो पानीको बाल्टी तयारी राख्ने',
    bn: 'গিজার পরীক্ষা করা এবং স্নানের গরম জলের ব্যবস্থা রাখা',
    hi: 'गीज़र चेक करना और नहाने के लिए गर्म पानी की व्यवस्था रखना',
  },
  'before-kitchen-groceries': {
    en: 'Procure fresh organic vegetables, milk & Darjeeling orthodox tea',
    ne: 'बारीको ताजा तरकारी, दूध र दार्जिलिङ अर्गानिक चियापत्ती जुटाउने',
    bn: 'তাজা শাকসবজি, দুধ ও খাঁটি দার্জিলিং চা পাতার ব্যবস্থা করা',
    hi: 'ताज़ी जैविक सब्जियां, दूध और दार्जिलिंग चाय की व्यवस्था करना',
  },
  'before-charge-lights': {
    en: 'Charge emergency LED lamps in case of village power cuts',
    ne: 'गाउँमा लाइन गएको बेलाको लागि आपतकालीन इमर्जेन्सी लाइट चार्ज राख्ने',
    bn: 'গ্রামে বিদ্যুৎ বিভ্রাটের জন্য ইমার্জেন্সি লাইট চার্জ করে রাখা',
    hi: 'बिजली जाने की स्थिति के लिए इमरजेंसी लाइट चार्ज रखना',
  },
  'during-welcome-tea': {
    en: 'Welcome guests with warm homemade ginger cardamom tea & traditional Khada scarf',
    ne: 'पाहुनालाई परम्परागत खादा र न्यानो अदुवा-सुकमेल चियाले स्वागत गर्ने',
    bn: 'ঐতিহ্যবাহী খাতা পরিয়ে ও গরম আদা-এলাচ চা দিয়ে অতিথিকে অভ্যর্থনা জানানো',
    hi: 'अतिथियों को पारंपरिक खादा और गर्म अदरक-इलायची चाय से स्वागत करना',
  },
  'during-explain-amenities': {
    en: 'Explain dining timings, hot water operation & village quiet hours (9:30 PM)',
    ne: 'खाना खाने समय, तातो पानी चलाउने तरिका र रातिको शान्त नियम (९:३० बजे) सम्झाउने',
    bn: 'খাবারের সময়, গরম জলের ব্যবস্থা ও রাতের নিস্তব্ধতার নিয়ম (৯:৩০টা) বুঝিয়ে বলা',
    hi: 'भोजन का समय, गर्म पानी की व्यवस्था और रात्रि शांत नियम (9:30 बजे) बताना',
  },
  'during-tea-garden-walk': {
    en: 'Offer morning guided walk to the sunrise viewpoint & tea garden bushes',
    ne: 'बिहानको सूर्योदय दृश्य र चियाबारीमा हिँडडुल गराउने योजना मिलाउने',
    bn: 'সকালে সূর্যোদয় পয়েন্ট ও চা-বাগানে ঘুরে দেখানোর প্রস্তাব দেওয়া',
    hi: 'सुबह सूर्योदय स्थल और चाय बागान में भ्रमण की योजना बनाना',
  },
  'after-settle-payment': {
    en: 'Settle final payment (Cash or UPI) & record in cash ledger',
    ne: 'अन्तिम हिसाब (नगद वा UPI) चुक्ता गर्ने र क्यास लेजरमा चढाउने',
    bn: 'চূড়ান্ত হিসাব (নগদ বা UPI) নিষ্পত্তি করা এবং খেরচের খাতায় এন্ট্রি করা',
    hi: 'अंतिम भुगतान (नकद या UPI) निपटाना और कैश लेजर में दर्ज करना',
  },
  'after-check-belongings': {
    en: 'Check room for any forgotten guest belongings & keys',
    ne: 'पाहुनाका छुटेका सामान, चार्जर वा साँचो कोठामा हेर्ने',
    bn: 'গেস্ট রুমে ফেলে যাওয়া কোনো জিনিসপত্র বা চাবি আছে কিনা পরীক্ষা করা',
    hi: 'कमरे में छूटे हुए सामान, चार्जर या चाबियों की जांच करना',
  },
  'after-clean-air': {
    en: 'Thoroughly wash linens and ventilate room for next arrival',
    ne: 'अर्को पाहुनाको लागि कपडा धुन हाल्ने र कोठामा हावा लाग्न झ्याल खुला राख्ने',
    bn: 'পরবর্তী অতিথির জন্য বিছানার চাদর ধোয়া ও ঘর ভালোভাবে উন্মুক্ত করা',
    hi: 'अगले अतिथि के लिए चादरें धोना और कमरे को हवादार बनाना',
  },
};

export const Checklist: React.FC<ChecklistProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const items = useLiveQuery(() => db.checklistItems.toArray(), []) || [];

  const beforeItems = items.filter((i) => i.stage === 'before');
  const duringItems = items.filter((i) => i.stage === 'during');
  const afterItems = items.filter((i) => i.stage === 'after');

  const totalCount = items.length;
  const completedCount = items.filter((i) => i.done).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggleItem = async (item: ChecklistItem) => {
    const updatedDone = !item.done;
    const nowISO = new Date().toISOString();

    await db.checklistItems.update(item.id, {
      done: updatedDone,
      updatedAt: nowISO,
      syncStatus: 'pending',
    });

    await queueMutation({
      operationId: generateUUID(),
      entity: 'checklistItem',
      entityId: item.id,
      operation: 'update',
      payload: { id: item.id, done: updatedDone },
    });

    // Check if everything is done or this stage just completed
    if (updatedDone && completedCount + 1 === totalCount) {
      try {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const handleResetChecklist = async () => {
    if (!window.confirm('Reset all checklist items for a new guest arrival?')) return;

    const nowISO = new Date().toISOString();
    for (const item of items) {
      await db.checklistItems.update(item.id, {
        done: false,
        updatedAt: nowISO,
        syncStatus: 'pending',
      });
      await queueMutation({
        operationId: generateUUID(),
        entity: 'checklistItem',
        entityId: item.id,
        operation: 'update',
        payload: { id: item.id, done: false },
      });
    }
  };

  const renderStageGroup = (
    title: string,
    icon: React.ReactNode,
    stageItems: ChecklistItem[],
    accentColor: string
  ) => {
    const doneStageCount = stageItems.filter((i) => i.done).length;

    return (
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${accentColor} text-white shadow-2xs`}>
              {icon}
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-outfit">{title}</h2>
              <span className="text-xs text-stone-500">
                {doneStageCount} / {stageItems.length} {currentLang === 'ne' ? 'सकियो' : 'completed'}
              </span>
            </div>
          </div>

          {doneStageCount === stageItems.length && stageItems.length > 0 && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready</span>
            </span>
          )}
        </div>

        <div className="space-y-2 pt-1">
          {stageItems.map((item) => {
            const localizedText =
              localizedChecklistLabels[item.id]?.[currentLang] ||
              item.defaultLabel;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggleItem(item)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 min-h-[52px] ${
                  item.done
                    ? 'bg-emerald-50/40 border-emerald-200 text-stone-500'
                    : 'bg-stone-50/60 border-stone-200/80 hover:bg-stone-100/80 hover:border-stone-300 text-stone-900'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {item.done ? (
                    <div className="w-5 h-5 rounded-md bg-[#2E5339] text-white flex items-center justify-center">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-md border-2 border-stone-400 bg-white hover:border-[#2E5339]" />
                  )}
                </div>

                <span
                  className={`text-sm leading-relaxed ${
                    item.done ? 'line-through text-stone-400' : 'font-medium text-stone-800'
                  }`}
                >
                  {localizedText}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header & Reset Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3826] font-outfit flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-[#2E5339]" />
            {t.checklist.title}
          </h1>
          <p className="text-sm text-stone-600 mt-0.5">
            {t.checklist.subtitle || '3-Stage Himalayan Hosting Preparation & Turnover Checklist'}
          </p>
        </div>

        <button
          onClick={handleResetChecklist}
          className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-xs min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4 text-stone-500" />
          <span>{t.checklist.resetChecklist}</span>
        </button>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-bold text-stone-800 font-outfit">
              {t.checklist.progress}: {completedCount} of {totalCount} tasks completed
            </span>
          </div>
          <span className="text-base font-bold text-[#2E5339] font-outfit">
            {progressPercent}%
          </span>
        </div>

        {/* Bar */}
        <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden p-0.5 border border-stone-200">
          <div
            className="bg-gradient-to-r from-[#2E5339] to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {progressPercent === 100 && (
          <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {t.checklist.allDoneStage || 'All hosting tasks completed! Ready to provide unforgettable mountain hospitality.'}
          </p>
        )}
      </div>

      {/* 3 Stage Groups */}
      <div className="space-y-5">
        {/* Stage 1: Before Arrival */}
        {renderStageGroup(
          t.checklist.beforeStage,
          <Clock className="w-5 h-5" />,
          beforeItems,
          'bg-blue-600'
        )}

        {/* Stage 2: During Stay */}
        {renderStageGroup(
          t.checklist.duringStage,
          <Coffee className="w-5 h-5" />,
          duringItems,
          'bg-emerald-700'
        )}

        {/* Stage 3: After Departure */}
        {renderStageGroup(
          t.checklist.afterStage,
          <LogOut className="w-5 h-5" />,
          afterItems,
          'bg-amber-700'
        )}
      </div>
    </div>
  );
};
