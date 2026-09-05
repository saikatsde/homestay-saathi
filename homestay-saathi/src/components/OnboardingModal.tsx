// First-Launch Host Profile Setup Wizard per Journey A
import React, { useState } from 'react';
import { db, getOrCreateSyncMeta } from '../lib/db';
import { SupportedLanguage, HostProfile } from '../lib/types';
import { translations } from '../lib/i18n/translations';
import { 
  Home, 
  User, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Phone,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: HostProfile) => void;
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  currentLang,
  onLanguageChange,
}) => {
  const t = translations[currentLang];
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [hostName, setHostName] = useState('');
  const [homestayName, setHomestayName] = useState('');
  const [location, setLocation] = useState('Takdah Cantonment, Darjeeling');
  const [rooms, setRooms] = useState(2);
  const [defaultPrice, setDefaultPrice] = useState(1800);
  const [phone, setPhone] = useState('');

  const locationPresets = [
    'Takdah Cantonment',
    'Tinchuley Village',
    'Mirik Lake Valley',
    'Lamahatta Pine Forest',
    'Rimbick Offbeat',
    'Sukhiapokhri Tea Estate',
  ];

  if (!isOpen) return null;

  const handleFinishOnboarding = async () => {
    const meta = await getOrCreateSyncMeta();
    const finalHostName = hostName.trim() || 'Tea Garden Host';
    const finalHomestayName = homestayName.trim() || `${finalHostName}'s Homestay`;

    const updatedProfile: HostProfile = {
      hostName: finalHostName,
      homestayName: finalHomestayName,
      location: location.trim() || 'Darjeeling Hills',
      rooms: Number(rooms) || 2,
      defaultPrice: Number(defaultPrice) || 1800,
      phone: phone.trim() || undefined,
      preferredLanguage: currentLang,
      profileCompleted: true,
    };

    await db.syncMeta.update('singleton', {
      ...meta,
      ...updatedProfile,
    });

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });

    onComplete(updatedProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-elevated border border-saathi-warm-200 relative overflow-hidden">
        {/* Top visual accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-saathi-tea-700 via-saathi-tea-500 to-saathi-warm-400" />

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍵</span>
            <div>
              <h2 className="font-extrabold text-base md:text-lg text-saathi-tea-950 font-sans">
                {t.onboarding.welcomeTitle}
              </h2>
              <p className="text-[11px] text-saathi-mist-700">
                Step {step} of 4 · First-time host setup
              </p>
            </div>
          </div>

          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === s
                    ? 'w-6 bg-saathi-tea-700'
                    : step > s
                    ? 'w-2 bg-emerald-500'
                    : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Choose Language */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="font-bold text-sm md:text-base text-saathi-tea-950">
                {t.onboarding.step1Title}
              </h3>
              <p className="text-xs text-saathi-mist-700 mt-0.5">
                {t.onboarding.welcomeSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {[
                { code: 'en', label: 'English', desc: 'Default language' },
                { code: 'ne', label: 'नेपाली', desc: 'दार्जिलिङ चियाबारी भाषा' },
                { code: 'bn', label: 'বাংলা', desc: 'অতিথি ও স্থানীয় ভাষা' },
                { code: 'hi', label: 'हिन्दी', desc: 'सुलभ अनुवाद' },
              ].map((lang) => (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code as SupportedLanguage)}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    currentLang === lang.code
                      ? 'bg-saathi-tea-50 border-saathi-tea-700 ring-2 ring-saathi-tea-600 shadow-sm'
                      : 'bg-white border-saathi-warm-200 hover:border-saathi-tea-300'
                  }`}
                >
                  <div className="font-extrabold text-sm md:text-base text-saathi-tea-950">
                    {lang.label}
                  </div>
                  <div className="text-[11px] text-saathi-mist-700 mt-0.5">
                    {lang.desc}
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Host Name & Homestay Name */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="font-bold text-sm md:text-base text-saathi-tea-950">
                {t.onboarding.step2Title}
              </h3>
              <p className="text-xs text-saathi-mist-700 mt-0.5">
                These details will appear in your generated listings and guest translations.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-saathi-tea-950 block mb-1">
                  {t.onboarding.hostName} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-saathi-tea-600 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={t.onboarding.hostNamePlaceholder}
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-saathi-warm-300 text-xs md:text-sm focus:ring-2 focus:ring-saathi-tea-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-saathi-tea-950 block mb-1">
                  {t.onboarding.homestayName} *
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 text-saathi-tea-600 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={t.onboarding.homestayNamePlaceholder}
                    value={homestayName}
                    onChange={(e) => setHomestayName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-saathi-warm-300 text-xs md:text-sm focus:ring-2 focus:ring-saathi-tea-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-saathi-tea-950 block mb-1">
                  {t.onboarding.location} *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-saathi-tea-600 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={t.onboarding.locationPlaceholder}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-saathi-warm-300 text-xs md:text-sm focus:ring-2 focus:ring-saathi-tea-500 focus:outline-none mb-1.5"
                  />
                </div>
                {/* Location chips */}
                <div className="flex flex-wrap gap-1">
                  {locationPresets.map((loc) => (
                    <button
                      type="button"
                      key={loc}
                      onClick={() => setLocation(loc)}
                      className="text-[10px] bg-saathi-warm-100 hover:bg-saathi-warm-200 border border-saathi-warm-300 text-saathi-tea-900 px-2 py-0.5 rounded-md transition"
                    >
                      + {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary py-2.5 px-4 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={!hostName.trim() || !homestayName.trim()}
                onClick={() => setStep(3)}
                className="flex-1 btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Capacity, Default Price, and Phone */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="font-bold text-sm md:text-base text-saathi-tea-950">
                {t.onboarding.step3Title}
              </h3>
              <p className="text-xs text-saathi-mist-700 mt-0.5">
                Set standard room capacity and base nightly tariff. You can adjust this anytime.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-saathi-tea-950 block mb-1">
                    {t.onboarding.roomsCount}
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setRooms(Math.max(1, rooms - 1))}
                      className="w-10 h-10 rounded-l-xl bg-saathi-warm-200 font-bold text-base hover:bg-saathi-warm-300 transition"
                    >
                      –
                    </button>
                    <div className="w-12 h-10 border-y border-saathi-warm-300 flex items-center justify-center font-bold text-sm">
                      {rooms}
                    </div>
                    <button
                      type="button"
                      onClick={() => setRooms(rooms + 1)}
                      className="w-10 h-10 rounded-r-xl bg-saathi-warm-200 font-bold text-base hover:bg-saathi-warm-300 transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-saathi-tea-950 block mb-1">
                    {t.onboarding.defaultPrice}
                  </label>
                  <input
                    type="number"
                    min={400}
                    step={100}
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-saathi-warm-300 font-bold text-saathi-tea-800 focus:ring-2 focus:ring-saathi-tea-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-saathi-tea-950 block mb-0.5">
                  {t.onboarding.phoneOptional}
                </label>
                <span className="text-[10px] text-gray-500 block mb-1">
                  Optional — only if you wish to show it on shared listings
                </span>
                <div className="relative">
                  <Phone className="w-4 h-4 text-saathi-tea-600 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    placeholder={t.onboarding.phonePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-saathi-warm-300 text-xs md:text-sm focus:ring-2 focus:ring-saathi-tea-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-secondary py-2.5 px-4 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <span>Review & Finish</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Ready Reassurance & Launch */}
        {step === 4 && (
          <div className="space-y-4 text-center animate-fadeIn py-2">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-extrabold text-xl text-saathi-tea-950">
                {t.onboarding.readyTitle}
              </h3>
              <p className="text-xs text-saathi-mist-700 mt-1 max-w-sm mx-auto">
                {t.onboarding.readyNotice}
              </p>
            </div>

            {/* Profile summary card */}
            <div className="bg-saathi-warm-50 border border-saathi-warm-200 rounded-2xl p-4 text-left text-xs space-y-1.5 text-saathi-mist-900">
              <div className="flex justify-between">
                <span className="text-gray-500">Homestay:</span>
                <span className="font-bold text-saathi-tea-950">{homestayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Host:</span>
                <span className="font-semibold">{hostName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location:</span>
                <span className="font-semibold">{location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rooms & Tariff:</span>
                <span className="font-bold text-saathi-tea-800">
                  {rooms} Rooms · ₹{defaultPrice}/night
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinishOnboarding}
              className="w-full btn-primary py-3.5 text-sm font-bold shadow-elevated"
            >
              {t.onboarding.letsStart}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
