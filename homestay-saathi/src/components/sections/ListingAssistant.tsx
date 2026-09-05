// Listing Assistant Section (On-Device AI & Deterministic Homestay Template Generator)
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateUUID } from '../../lib/db';
import { queueMutation } from '../../lib/sync/syncEngine';
import { Listing, SupportedLanguage } from '../../lib/types';
import { translations } from '../../lib/i18n/translations';
import { generateListingWithAI, ListingInput, GeneratedListingOutput } from '../../lib/ai/listingGenerator';
import { getModelAvailability } from '../../lib/ai/availability';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Bookmark, 
  Trash2, 
  Cpu, 
  FileText, 
  MessageSquare, 
  Home, 
  Coffee, 
  Mountain, 
  ShieldCheck, 
  Zap, 
  ExternalLink 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ListingAssistantProps {
  currentLang: SupportedLanguage;
  onOpenModelModal?: () => void;
}

export const ListingAssistant: React.FC<ListingAssistantProps> = ({ currentLang, onOpenModelModal }) => {
  const t = translations[currentLang];
  const syncMeta = useLiveQuery(() => db.syncMeta.get('singleton'), []);
  const savedListings = useLiveQuery(() => db.listings.reverse().sortBy('createdAt'), []) || [];

  // Form inputs pre-filled from host profile
  const [homestayName, setHomestayName] = useState('');
  const [location, setLocation] = useState('');
  const [rooms, setRooms] = useState<number>(2);
  const [price, setPrice] = useState<number>(1800);
  const [food, setFood] = useState('Fresh organic Himalayan meals with local garden vegetables & morning tea');
  
  // Tag selections
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Kanchenjunga Mountain View',
    'Running Hot Water / Geyser',
    'Organic Kitchen Garden Meals',
  ]);
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>([
    'Tea Estate Garden Walk & Plucking',
    'Pine Forest Trails & Sunrise Point',
  ]);
  const [selectedRules, setSelectedRules] = useState<string[]>([
    'Quiet hours after 9:30 PM',
    'Shoes off inside guest rooms',
    'Conserve mountain spring water',
  ]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedListingOutput | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'short' | 'detailed' | 'highlights'>('short');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Sync with host profile when loaded
  useEffect(() => {
    if (syncMeta) {
      if (syncMeta.homestayName) setHomestayName(syncMeta.homestayName);
      if (syncMeta.location) setLocation(syncMeta.location);
      if (syncMeta.rooms) setRooms(syncMeta.rooms);
      if (syncMeta.defaultPrice) setPrice(syncMeta.defaultPrice);
    }
  }, [syncMeta]);

  // Model availability check
  const modelInfo = getModelAvailability();

  // Preset amenities for Darjeeling/Sikkim homestays
  const amenityOptions = [
    'Kanchenjunga Mountain View',
    'Running Hot Water / Geyser',
    'Organic Kitchen Garden Meals',
    'Traditional Bonfire & BBQ',
    'High-Speed Wi-Fi & Hill 4G',
    'Western Attached Bathroom',
    'Private Balcony / Terrace',
    'Cozy Room Heater / Electric Blanket',
    'Tea Estate Plucking Experience',
    'Homemade Rhododendron Wine Tasting',
  ];

  const attractionOptions = [
    'Tea Estate Garden Walk & Plucking',
    'Pine Forest Trails & Sunrise Point',
    'Takdah Heritage Club & Orchid Center',
    'Lamahatta Eco Park & Sacred Lake',
    'Tinchuley Gumbadanda Viewpoint',
    'Peshok Viewpoint & Teesta Confluence',
    'Village Organic Farm & Milking Tour',
    'Birdwatching in Mountain Forest',
  ];

  const ruleOptions = [
    'Quiet hours after 9:30 PM',
    'Shoes off inside guest rooms',
    'Conserve mountain spring water',
    'Smoking allowed outdoors only',
    'Family-friendly environment',
    'Pets allowed upon prior notice',
  ];

  const toggleTag = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homestayName.trim() || !location.trim()) return;

    setIsGenerating(true);
    setIsSaved(false);

    const input: ListingInput = {
      homestayName: homestayName.trim(),
      location: location.trim(),
      rooms: Number(rooms),
      price: Number(price),
      food: food.trim(),
      amenities: selectedAmenities,
      attractions: selectedAttractions,
      houseRules: selectedRules,
    };

    try {
      const res = await generateListingWithAI(input);
      setGeneratedResult(res);
      try {
        confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
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

  const handleSaveListing = async () => {
    if (!generatedResult) return;

    const newId = generateUUID();
    const newListing: Listing = {
      id: newId,
      homestayName: homestayName.trim(),
      location: location.trim(),
      rooms: Number(rooms),
      amenities: selectedAmenities,
      food: food.trim(),
      attractions: selectedAttractions,
      houseRules: selectedRules,
      price: Number(price),
      headline: generatedResult.headline,
      shortListing: generatedResult.shortListing,
      detailedListing: generatedResult.detailedListing,
      amenitiesSummary: generatedResult.amenitiesSummary,
      localExperienceText: generatedResult.localExperienceText,
      generatedBy: generatedResult.generatedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    };

    await db.listings.add(newListing);
    await queueMutation({
      operationId: generateUUID(),
      entity: 'listing',
      entityId: newId,
      operation: 'create',
      payload: newListing as unknown as Record<string, unknown>,
    });

    setIsSaved(true);
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!window.confirm(t.bookings.confirmDelete || 'Delete this saved listing?')) return;
    await db.listings.delete(listingId);
    await queueMutation({
      operationId: generateUUID(),
      entity: 'listing',
      entityId: listingId,
      operation: 'delete',
      payload: { id: listingId },
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3826] font-outfit flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-[#D97706]" />
            {t.listing.title}
          </h1>
          <p className="text-sm text-stone-600 mt-0.5">
            {currentLang === 'ne' ? 'आफ्नो होमस्टेको लागि सुन्दर सूची र व्हाट्सएप विवरण तयार गर्नुहोस्' :
             currentLang === 'bn' ? 'হোমস্টে সুন্দর বিবরণী এবং হোয়াটসঅ্যাপ টেক্সট তৈরি করুন' :
             currentLang === 'hi' ? 'अपने होमस्टे के लिए आकर्षक विवरण और व्हाट्सएप टेक्स्ट बनाएं' :
             'Craft compelling homestay listings & WhatsApp blurbs with on-device AI'}
          </p>
        </div>

        {/* AI Model Status Badge */}
        <div 
          onClick={onOpenModelModal}
          className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-all text-xs"
        >
          <div className={`w-2.5 h-2.5 rounded-full ${modelInfo.status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="font-medium text-stone-700">
            {modelInfo.status === 'available' ? t.listing.modelAvailable : t.listing.modelOffline}
          </span>
          <Zap className="w-3.5 h-3.5 text-amber-600" />
        </div>
      </div>

      {/* Main Grid: Form Left, Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Column */}
        <div className="lg:col-span-6 space-y-5">
          <form onSubmit={handleGenerate} className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
              <Home className="w-5 h-5 text-[#2E5339]" />
              Homestay Configuration
            </h2>

            {/* Homestay Name & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  {t.listing.homestayName} *
                </label>
                <input
                  type="text"
                  required
                  value={homestayName}
                  onChange={(e) => setHomestayName(e.target.value)}
                  placeholder="e.g. Cloud Valley Homestay"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#2E5339] text-stone-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  {t.listing.location} *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Takdah Cantonment, Darjeeling"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#2E5339] text-stone-900 text-sm"
                />
              </div>
            </div>

            {/* Rooms & Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  {t.listing.rooms}
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={rooms}
                  onChange={(e) => setRooms(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#2E5339] text-stone-900 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  {t.listing.pricePerNight} (₹)
                </label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#2E5339] text-stone-900 text-sm font-semibold"
                />
              </div>
            </div>

            {/* Amenities Tag Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5 text-[#2E5339]" />
                {t.listing.amenities}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {amenityOptions.map((opt) => {
                  const active = selectedAmenities.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleTag(selectedAmenities, setSelectedAmenities, opt)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        active
                          ? 'bg-[#2E5339] text-white border-[#2E5339] font-medium shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {active ? '✓ ' : '+ '} {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Food & Meals */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-[#2E5339]" />
                {t.listing.food}
              </label>
              <input
                type="text"
                value={food}
                onChange={(e) => setFood(e.target.value)}
                placeholder="e.g. Traditional Nepali thali, gundruk, fresh local chicken & milk tea"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#2E5339] text-stone-900 text-sm"
              />
            </div>

            {/* Attractions */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5 text-[#2E5339]" />
                {t.listing.attractions}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {attractionOptions.map((opt) => {
                  const active = selectedAttractions.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleTag(selectedAttractions, setSelectedAttractions, opt)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        active
                          ? 'bg-amber-700 text-white border-amber-700 font-medium shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {active ? '✓ ' : '+ '} {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* House Rules */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E5339]" />
                {t.listing.houseRules}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ruleOptions.map((opt) => {
                  const active = selectedRules.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleTag(selectedRules, setSelectedRules, opt)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        active
                          ? 'bg-stone-800 text-white border-stone-800 font-medium shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {active ? '✓ ' : '+ '} {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Action */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 px-4 rounded-xl bg-[#2E5339] hover:bg-[#24422e] text-white font-semibold shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-75"
            >
              <Sparkles className={`w-5 h-5 ${isGenerating ? 'animate-spin' : 'text-amber-300'}`} />
              <span>{isGenerating ? t.listing.generating : t.listing.generateButton}</span>
            </button>
          </form>
        </div>

        {/* Results & Saved Listings Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Active Generation Result */}
          {generatedResult ? (
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {generatedResult.generatedBy === 'ai' ? t.listing.generatedByAI : t.listing.generatedByTemplate}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveListing}
                    disabled={isSaved}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all min-h-[36px] ${
                      isSaved
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    <span>{isSaved ? 'Saved to Phone' : t.listing.saveListing}</span>
                  </button>
                </div>
              </div>

              {/* Headline */}
              <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/70">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    {t.listing.headline}
                  </span>
                  <button
                    onClick={() => handleCopy(generatedResult.headline, 'headline')}
                    className="text-xs text-stone-500 hover:text-[#2E5339] flex items-center gap-1"
                  >
                    {copiedKey === 'headline' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'headline' ? t.listing.copied : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-sm font-semibold text-stone-900">{generatedResult.headline}</p>
              </div>

              {/* Output Tabs Switcher */}
              <div className="flex items-center gap-1 border-b border-stone-200 pb-1">
                <button
                  type="button"
                  onClick={() => setActiveResultTab('short')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeResultTab === 'short'
                      ? 'bg-[#2E5339]/10 text-[#2E5339]'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t.listing.shortListing}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveResultTab('detailed')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeResultTab === 'detailed'
                      ? 'bg-[#2E5339]/10 text-[#2E5339]'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t.listing.detailedListing}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveResultTab('highlights')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    activeResultTab === 'highlights'
                      ? 'bg-[#2E5339]/10 text-[#2E5339]'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Mountain className="w-3.5 h-3.5" />
                  <span>{t.listing.localExperience}</span>
                </button>
              </div>

              {/* Tab Content Display */}
              <div className="relative bg-stone-50/60 rounded-xl p-4 border border-stone-200/80 min-h-[160px]">
                {activeResultTab === 'short' && (
                  <div className="space-y-3">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-stone-800 leading-relaxed">
                      {generatedResult.shortListing}
                    </pre>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleCopy(generatedResult.shortListing, 'short')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-stone-200 px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-50"
                      >
                        {copiedKey === 'short' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'short' ? t.listing.copied : 'Copy Text'}</span>
                      </button>

                      <button
                        onClick={() => handleShareWhatsApp(generatedResult.shortListing)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 text-white px-3.5 py-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{t.listing.shareWhatsApp}</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeResultTab === 'detailed' && (
                  <div className="space-y-3">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-stone-800 leading-relaxed">
                      {generatedResult.detailedListing}
                    </pre>
                    <button
                      onClick={() => handleCopy(generatedResult.detailedListing, 'detailed')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-stone-200 px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-50"
                    >
                      {copiedKey === 'detailed' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'detailed' ? t.listing.copied : 'Copy Full Description'}</span>
                    </button>
                  </div>
                )}

                {activeResultTab === 'highlights' && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        {t.listing.amenitiesSummary}
                      </h4>
                      <pre className="whitespace-pre-wrap font-sans text-xs text-stone-700 bg-white p-3 rounded-xl border border-stone-200">
                        {generatedResult.amenitiesSummary}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        {t.listing.localExperience}
                      </h4>
                      <p className="text-xs text-stone-700 bg-white p-3 rounded-xl border border-stone-200 leading-relaxed">
                        {generatedResult.localExperienceText}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-stone-50/80 rounded-2xl border border-dashed border-stone-300 p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-800 text-base mb-1">Listing Preview will appear here</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Customize your homestay features on the left and tap &quot;Generate Listing &amp; WhatsApp Text&quot; to generate with on-device AI.
              </p>
            </div>
          )}

          {/* Saved Listings History */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-stone-900 font-outfit flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#2E5339]" />
              {t.listing.savedListings} ({savedListings.length})
            </h3>

            {savedListings.length === 0 ? (
              <p className="text-xs text-stone-400 py-3 text-center">
                {t.listing.noSavedListings}
              </p>
            ) : (
              <div className="space-y-3">
                {savedListings.map((l) => (
                  <div
                    key={l.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {l.headline || `${l.homestayName} - ${l.location}`}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(l.shortListing || l.detailedListing || '', `saved-${l.id}`)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-[#2E5339] hover:bg-white"
                          title="Copy listing text"
                        >
                          {copiedKey === `saved-${l.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteListing(l.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-white"
                          title="Delete saved listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2">
                      {l.shortListing || l.detailedListing}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-stone-400">
                      <span>₹{l.price} / night · {l.rooms} rooms</span>
                      <button
                        onClick={() => handleShareWhatsApp(l.shortListing || l.detailedListing || '')}
                        className="text-emerald-700 font-medium hover:underline flex items-center gap-1"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Share on WhatsApp</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
