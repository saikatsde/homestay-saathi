// Multilingual Guest Message Translator & 8 Hosting Scenarios
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { SupportedLanguage } from '../../lib/types';
import { translations } from '../../lib/i18n/translations';
import { scenarios } from '../../lib/i18n/scenarios';
import { detectLanguage } from '../../lib/i18n/detector';
import { translateGuestMessage, TranslationResult, TranslationContext } from '../../lib/ai/translator';
import { getModelAvailability } from '../../lib/ai/availability';
import { 
  Languages, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  MessageSquare, 
  Tag, 
  MapPin, 
  Clock, 
  Utensils, 
  Mountain, 
  ShieldCheck, 
  CloudSun, 
  CreditCard, 
  Send, 
  Zap, 
  RotateCcw 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TranslatorProps {
  currentLang: SupportedLanguage;
  onOpenModelModal?: () => void;
}

const scenarioIcons: Record<string, React.ReactNode> = {
  pricing: <Tag className="w-4 h-4 text-emerald-600" />,
  directions: <MapPin className="w-4 h-4 text-blue-600" />,
  checkin: <Clock className="w-4 h-4 text-amber-600" />,
  food: <Utensils className="w-4 h-4 text-rose-600" />,
  teagarden: <Mountain className="w-4 h-4 text-emerald-700" />,
  rules: <ShieldCheck className="w-4 h-4 text-stone-700" />,
  weather: <CloudSun className="w-4 h-4 text-cyan-600" />,
  upi: <CreditCard className="w-4 h-4 text-purple-600" />,
};

export const Translator: React.FC<TranslatorProps> = ({ currentLang, onOpenModelModal }) => {
  const t = translations[currentLang];
  const syncMeta = useLiveQuery(() => db.syncMeta.get('singleton'), []);
  const modelInfo = getModelAvailability();

  const [inputMessage, setInputMessage] = useState('');
  const [targetReplyLang, setTargetReplyLang] = useState<SupportedLanguage>('en');
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Quick prompt sample chips
  const samplePrompts = [
    { label: '💰 Room price inquiry', text: 'Hello, what is your room rate for 2 guests with breakfast?' },
    { label: '🚂 How to reach from NJP', text: 'NJP railway station theke apnader homestay kivabe jabo? Shared taxi ache?' },
    { label: '🏔️ Weather & Kanchenjunga', text: 'कञ्चनजङ्घा हिमाल देखिन्छ कि नाइँ? साँझ कत्तिको चिसो हुन्छ?' },
    { label: '🍛 Food & Meals', text: 'Kya homestay me dinner aur vegetarian food milega?' },
    { label: '📲 UPI Payment', text: 'Can we pay advance booking via GPay or PhonePe?' },
  ];

  const hostContext: TranslationContext = {
    homestayName: syncMeta?.homestayName || 'Kanchenjunga View Homestay',
    location: syncMeta?.location || 'Takdah Cantonment, Darjeeling',
    price: syncMeta?.defaultPrice || 1800,
    hostName: syncMeta?.hostName || 'Homestay Host',
  };

  const handleTranslate = async (textToProcess?: string) => {
    const text = (textToProcess !== undefined ? textToProcess : inputMessage).trim();
    if (!text) return;

    setIsTranslating(true);
    try {
      const res = await translateGuestMessage(text, currentLang, hostContext);
      setTranslationResult(res);
      if (res.detectedLanguage && res.detectedLanguage.language) {
        setTargetReplyLang(res.detectedLanguage.language);
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSelectScenario = (scenarioId: string) => {
    const matched = scenarios.find(s => s.id === scenarioId);
    if (!matched) return;

    const sampleText = matched.phrases[targetReplyLang] || matched.phrases.en;
    setInputMessage(sampleText);
    handleTranslate(sampleText);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleShareWhatsApp = (text: string) => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3826] font-outfit flex items-center gap-2">
            <Languages className="w-7 h-7 text-[#2E5339]" />
            {t.translate.title}
          </h1>
          <p className="text-sm text-stone-600 mt-0.5">
            {currentLang === 'ne' ? 'पाहुनाको सन्देश बुझ्नुहोस् र १-ट्यापमा स्थानीय नेपाली, बंगाली वा हिन्दीमा जवाफ दिनुहोस्' :
             currentLang === 'bn' ? 'অতিথির বার্তা বুঝে ১-ট্যাপে বাংলা, ইংরেজি, নেপালি বা হিন্দিতে উত্তর পাঠান' :
             currentLang === 'hi' ? 'अतिथि के संदेश को समझें और 1-टैप में त्वरित उत्तर तैयार करें' :
             'Understand guest messages & generate 1-tap local replies in English, Nepali, Bengali, and Hindi'}
          </p>
        </div>

        {/* Model Status */}
        <div
          onClick={onOpenModelModal}
          className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-all text-xs"
        >
          <div className={`w-2.5 h-2.5 rounded-full ${modelInfo.status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="font-medium text-stone-700">
            {modelInfo.status === 'available' ? t.translate.modelReady : t.translate.modelOffline}
          </span>
          <Zap className="w-3.5 h-3.5 text-amber-600" />
        </div>
      </div>

      {/* Main Grid: Input & Translator Left, 8 Scenarios Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Message & Translation Output */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#2E5339]" />
                Guest Message Received (WhatsApp / SMS)
              </label>

              {inputMessage && (
                <button
                  onClick={() => {
                    setInputMessage('');
                    setTranslationResult(null);
                  }}
                  className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Input Box */}
            <div className="relative">
              <textarea
                rows={3}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t.translate.inputPlaceholder}
                className="w-full p-3.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#2E5339] text-stone-900 text-sm leading-relaxed resize-none"
              />
            </div>

            {/* Quick Sample Chips */}
            <div>
              <p className="text-[11px] text-stone-400 font-medium mb-1.5">Test with common inquiries:</p>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setInputMessage(p.text);
                      handleTranslate(p.text);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 hover:bg-[#2E5339]/10 hover:border-[#2E5339]/30 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Translate Action Button */}
            <button
              onClick={() => handleTranslate()}
              disabled={isTranslating || !inputMessage.trim()}
              className="w-full py-3 px-4 rounded-xl bg-[#2E5339] hover:bg-[#24422e] text-white font-semibold shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[46px] disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isTranslating ? 'animate-spin' : 'text-amber-300'}`} />
              <span>{isTranslating ? 'Analyzing...' : 'Translate & Suggest Instant Reply'}</span>
            </button>
          </div>

          {/* Translation Result Card */}
          {translationResult && (
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm space-y-4 animate-fade-in">
              {/* Detected Language & Script Info */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-500">
                    {t.translate.detectedLanguage}:
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
                    {translationResult.detectedLanguage.languageName} ({translationResult.detectedLanguage.script} script)
                  </span>
                </div>

                <span className="text-[11px] text-stone-400">
                  {translationResult.isAI ? 'On-Device AI' : t.translate.offlinePhrasebookUsed}
                </span>
              </div>

              {/* What the Guest is Asking (Translated into Host Language) */}
              <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/70">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  {t.translate.translatedResult} (Your Language: {currentLang.toUpperCase()}):
                </span>
                <p className="text-sm font-semibold text-stone-900 leading-relaxed">
                  {translationResult.translatedText}
                </p>
              </div>

              {/* Suggested Contextual Reply */}
              <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200/70 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-emerald-700" />
                    {t.translate.suggestedReply}
                  </span>

                  {/* Target Language Toggle for Reply */}
                  <div className="flex items-center gap-1">
                    {(['en', 'ne', 'bn', 'hi'] as SupportedLanguage[]).map((lang) => {
                      const labels: Record<SupportedLanguage, string> = {
                        en: 'EN',
                        ne: 'नेपा',
                        bn: 'বাংলা',
                        hi: 'हिंदी',
                      };
                      const active = targetReplyLang === lang;
                      return (
                        <button
                          key={lang}
                          onClick={() => setTargetReplyLang(lang)}
                          className={`text-xs px-2 py-0.5 rounded-md font-medium transition-all ${
                            active
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {labels[lang]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reply Text Preview */}
                {(() => {
                  const scenario = scenarios.find(s => s.id === translationResult.matchedScenarioId) || scenarios[0];
                  const replyText = scenario.replies[targetReplyLang](hostContext);

                  return (
                    <div className="space-y-3">
                      <p className="text-sm text-stone-800 bg-white p-3 rounded-xl border border-emerald-200 leading-relaxed font-medium">
                        {replyText}
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleCopy(replyText, 'reply')}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-stone-200 px-3.5 py-2 rounded-xl text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          {copiedKey === 'reply' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'reply' ? t.translate.copiedNotice : t.translate.copyReply}</span>
                        </button>

                        <button
                          onClick={() => handleShareWhatsApp(replyText)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 text-white px-3.5 py-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Reply via WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 8 Himalayan Scenario Quick Reply Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-stone-900 font-outfit flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              {t.translate.pickScenario} (8 Hill Homestay Scenarios)
            </h2>
            <p className="text-xs text-stone-500">
              Tap any scenario to instantly generate an authentic host response pre-filled with your homestay name, rate, and village directions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 pt-1">
              {scenarios.map((sc) => {
                const isSelected = translationResult?.matchedScenarioId === sc.id;

                return (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 min-h-[56px] ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                        : 'bg-stone-50/60 border-stone-200/80 hover:bg-stone-100/80 hover:border-stone-300'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-white border border-stone-200 shadow-2xs flex-shrink-0 mt-0.5">
                      {scenarioIcons[sc.id] || <Tag className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {t.translate[sc.nameKey as keyof typeof t.translate] || sc.defaultName}
                        </h4>
                        {isSelected && <span className="text-[10px] text-emerald-700 font-bold">Active</span>}
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                        {sc.descriptionKey}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
