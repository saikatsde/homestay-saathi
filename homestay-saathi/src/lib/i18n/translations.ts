// Multilingual translations for English, Nepali, Bengali, and Hindi with Onboarding support
import { SupportedLanguage } from '../types';

export interface TranslationDict {
  appName: string;
  appSubtitle: string;
  offlineBadge: string;
  onlineBadge: string;
  syncingBadge: string;
  syncIssueBadge: string;
  syncedJustNow: string;
  changesWaiting: string;
  syncNow: string;
  onboarding: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    step1Title: string;
    step2Title: string;
    step3Title: string;
    hostName: string;
    hostNamePlaceholder: string;
    homestayName: string;
    homestayNamePlaceholder: string;
    location: string;
    locationPlaceholder: string;
    roomsCount: string;
    defaultPrice: string;
    phoneOptional: string;
    phonePlaceholder: string;
    finishButton: string;
    readyTitle: string;
    readyNotice: string;
    letsStart: string;
  };
  nav: {
    dashboard: string;
    bookings: string;
    ledger: string;
    listing: string;
    translate: string;
    checklist: string;
    settings: string;
  };
  dashboard: {
    welcome: string;
    homestayLabel: string;
    todayTitle: string;
    noCheckinsToday: string;
    noBookingsYetTitle: string;
    noBookingsYetSub: string;
    checkingIn: string;
    checkingOut: string;
    staying: string;
    pendingPayment: string;
    quickActions: string;
    newBooking: string;
    translateMessage: string;
    cashLedger: string;
    hostingChecklist: string;
    listingAssistant: string;
    pricingHelp: string;
    monthSummary: string;
    totalEarnings: string;
    occupancy: string;
    savedOfflineNotice: string;
  };
  bookings: {
    title: string;
    newBooking: string;
    guestName: string;
    guestPhone: string;
    guestPhoneOptional: string;
    checkIn: string;
    checkOut: string;
    guests: string;
    amount: string;
    notes: string;
    notesPlaceholder: string;
    paymentStatus: string;
    pending: string;
    partial: string;
    settled: string;
    saveBooking: string;
    editBooking: string;
    deleteBooking: string;
    confirmDelete: string;
    savedOfflineConfirm: string;
    allBookings: string;
    upcoming: string;
    completed: string;
    noBookings: string;
    noBookingsSub: string;
    nights: string;
    markSettled: string;
  };
  ledger: {
    title: string;
    income: string;
    expense: string;
    balance: string;
    addExpense: string;
    expenseDescription: string;
    expenseAmount: string;
    saveExpense: string;
    settledStatus: string;
    pendingStatus: string;
    noEntries: string;
    noEntriesSub: string;
    sourceBooking: string;
    manualExpense: string;
    adjustment: string;
    toggleSettled: string;
  };
  listing: {
    title: string;
    modelAvailable: string;
    modelOffline: string;
    modelOfflineNotice: string;
    homestayName: string;
    location: string;
    locationHint: string;
    rooms: string;
    amenities: string;
    food: string;
    attractions: string;
    houseRules: string;
    pricePerNight: string;
    generateButton: string;
    generating: string;
    headline: string;
    shortListing: string;
    detailedListing: string;
    amenitiesSummary: string;
    localExperience: string;
    saveListing: string;
    savedListings: string;
    noSavedListings: string;
    generatedByAI: string;
    generatedByTemplate: string;
    shareWhatsApp: string;
    shareGeneral: string;
    copied: string;
  };
  translate: {
    title: string;
    modelReady: string;
    modelOffline: string;
    inputPlaceholder: string;
    detectedLanguage: string;
    translatedResult: string;
    suggestedReply: string;
    pickScenario: string;
    copyReply: string;
    copiedNotice: string;
    scenarioPricing: string;
    scenarioDirections: string;
    scenarioCheckin: string;
    scenarioFood: string;
    scenarioTeaGarden: string;
    scenarioRules: string;
    scenarioWeather: string;
    scenarioUPI: string;
    offlinePhrasebookUsed: string;
  };
  checklist: {
    title: string;
    subtitle: string;
    beforeStage: string;
    duringStage: string;
    afterStage: string;
    allDoneStage: string;
    progress: string;
    resetChecklist: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    baseEstimate: string;
    recommendedRange: string;
    factors: string;
    season: string;
    peakSeason: string;
    offSeason: string;
    monsoon: string;
    organicFoodFactor: string;
    teaTourFactor: string;
    disclaimer: string;
  };
  settings: {
    title: string;
    deviceId: string;
    cloudSync: string;
    offlineAIModel: string;
    modelStatus: string;
    downloadModel: string;
    downloading: string;
    exportBackup: string;
    appVersion: string;
    madeForHills: string;
  };
}

export const translations: Record<SupportedLanguage, TranslationDict> = {
  en: {
    appName: "Homestay Saathi",
    appSubtitle: "Himalayan Homestay Copilot (Offline-first)",
    offlineBadge: "Offline",
    onlineBadge: "Online",
    syncingBadge: "Syncing...",
    syncIssueBadge: "Sync issue",
    syncedJustNow: "Synced just now",
    changesWaiting: "changes waiting on phone",
    syncNow: "Sync Now",
    onboarding: {
      welcomeTitle: "Welcome to Homestay Saathi",
      welcomeSubtitle: "Your offline copilot for tea-garden homestay hosting. Let's set up your home profile in 1 minute.",
      step1Title: "1. Choose Preferred Language",
      step2Title: "2. Host & Homestay Details",
      step3Title: "3. Rooms & Standard Tariff",
      hostName: "Your Full Name",
      hostNamePlaceholder: "e.g. Host Full Name",
      homestayName: "Homestay Name",
      homestayNamePlaceholder: "e.g. Kanchenjunga View Homestay",
      location: "Village / Location",
      locationPlaceholder: "e.g. Takdah Cantonment, Darjeeling",
      roomsCount: "Number of Guest Rooms",
      defaultPrice: "Default Room Tariff (₹ / Night)",
      phoneOptional: "Contact Phone (Optional)",
      phonePlaceholder: "e.g. +91 98765 43210",
      finishButton: "Complete Setup & Start Hosting",
      readyTitle: "You're All Set! 🎉",
      readyNotice: "All records are securely stored on this phone and work 100% without internet from now on.",
      letsStart: "Open Homestay Dashboard",
    },
    nav: {
      dashboard: "Dashboard",
      bookings: "Bookings",
      ledger: "Ledger",
      listing: "Listing",
      translate: "Translate",
      checklist: "Checklist",
      settings: "Settings",
    },
    dashboard: {
      welcome: "Namaste",
      homestayLabel: "Tea Garden Homestay",
      todayTitle: "Today's Guests & Activity",
      noCheckinsToday: "No guest check-ins scheduled for today",
      noBookingsYetTitle: "Ready for your first guest?",
      noBookingsYetSub: "Tap '+ New Booking' to record a guest stay or draft your listing text.",
      checkingIn: "Checking In",
      checkingOut: "Checking Out",
      staying: "Currently Staying",
      pendingPayment: "Pending Payment",
      quickActions: "Quick Actions",
      newBooking: "+ New Booking",
      translateMessage: "Translate Message",
      cashLedger: "Cash Ledger",
      hostingChecklist: "Hosting Checklist",
      listingAssistant: "Listing Assistant",
      pricingHelp: "Pricing Helper",
      monthSummary: "This Month Summary",
      totalEarnings: "Net Balance",
      occupancy: "Booked Nights",
      savedOfflineNotice: "All records are securely stored on this phone and work 100% without internet.",
    },
    bookings: {
      title: "Bookings Management",
      newBooking: "Create New Booking",
      guestName: "Guest Name",
      guestPhone: "Phone Number",
      guestPhoneOptional: "Optional — only if guest provided",
      checkIn: "Check-in Date",
      checkOut: "Check-out Date",
      guests: "Number of Guests",
      amount: "Total Amount (₹)",
      notes: "Notes / Special Requests",
      notesPlaceholder: "e.g. Vegetarian food, needs pickup at village jeep stand",
      paymentStatus: "Payment Status",
      pending: "Pending",
      partial: "Partial",
      settled: "Settled / Paid",
      saveBooking: "Save Booking Offline",
      editBooking: "Edit Booking",
      deleteBooking: "Delete",
      confirmDelete: "Are you sure you want to delete this booking?",
      savedOfflineConfirm: "Saved on this phone · Will sync when online",
      allBookings: "All Bookings",
      upcoming: "Upcoming",
      completed: "Past / Completed",
      noBookings: "No bookings recorded yet.",
      noBookingsSub: "Tap '+ New Booking' above to record your first guest stay.",
      nights: "nights",
      markSettled: "Mark as Settled",
    },
    ledger: {
      title: "Cash & Expense Ledger",
      income: "Total Income",
      expense: "Total Expenses",
      balance: "Net Balance",
      addExpense: "+ Add Expense",
      expenseDescription: "Expense Description",
      expenseAmount: "Amount (₹)",
      saveExpense: "Record Expense",
      settledStatus: "Settled",
      pendingStatus: "Pending",
      noEntries: "No transactions recorded yet.",
      noEntriesSub: "Record a village grocery purchase or add a booking to update your ledger balance.",
      sourceBooking: "Booking Income",
      manualExpense: "Village Expense",
      adjustment: "Adjustment",
      toggleSettled: "Toggle Paid / Settled",
    },
    listing: {
      title: "Listing Assistant",
      modelAvailable: "🤖 On-device AI Ready",
      modelOffline: "⚠️ AI Offline (Deterministic Mode)",
      modelOfflineNotice: "Builds a clean, appealing listing from hill-tested templates without internet.",
      homestayName: "Homestay Name",
      location: "Location / Village",
      locationHint: "e.g. Takdah, Tinchuley, Mirik, Lamahatta, Rimbick",
      rooms: "Guest Rooms Available",
      amenities: "Amenities (comma separated)",
      food: "Food & Meals Included",
      attractions: "Local Attractions & Views",
      houseRules: "House Rules & Traditions",
      pricePerNight: "Price per Night (₹)",
      generateButton: "Draft Listing (Instant)",
      generating: "Generating on phone...",
      headline: "Catchy Headline",
      shortListing: "Short Blurb (WhatsApp / SMS)",
      detailedListing: "Full Detailed Listing (Airbnb / Booking)",
      amenitiesSummary: "Amenities Highlight",
      localExperience: "Tea Garden & Hill Experience",
      saveListing: "Save to My Listings",
      savedListings: "Saved Listings",
      noSavedListings: "No saved listings yet. Generate one above and save it.",
      generatedByAI: "Generated by On-Device AI",
      generatedByTemplate: "Crafted with Hill-Homestay Template",
      shareWhatsApp: "Share to WhatsApp",
      shareGeneral: "Copy / Share",
      copied: "Copied to clipboard!",
    },
    translate: {
      title: "Guest Message Translator",
      modelReady: "🤖 Ready (On-device)",
      modelOffline: "⚠️ Offline Phrasebook Active",
      inputPlaceholder: "Paste or type guest inquiry (English, Hindi, Bengali, or Nepali)...",
      detectedLanguage: "Detected Language",
      translatedResult: "Translation in Your Language",
      suggestedReply: "Suggested Polite Host Reply (in Guest's Language)",
      pickScenario: "Pick Hosting Scenario:",
      copyReply: "Copy Reply for Guest",
      copiedNotice: "Copied reply to clipboard! Paste it into WhatsApp or SMS.",
      scenarioPricing: "Room Pricing & Rates",
      scenarioDirections: "How to Reach / Directions",
      scenarioCheckin: "Check-in / Check-out Times",
      scenarioFood: "Home-cooked Food & Chai",
      scenarioTeaGarden: "Tea Plucking & Village Walk",
      scenarioRules: "House Rules & Quiet Hours",
      scenarioWeather: "Hill Weather & Hot Water",
      scenarioUPI: "Cash & UPI Payment Info",
      offlinePhrasebookUsed: "Generated using your homestay details and hill phrasebook.",
    },
    checklist: {
      title: "Hosting Preparation Checklist",
      subtitle: "Step-by-step guidance for first-time tea-garden homestay hosts",
      beforeStage: "1. Before Guest Arrival",
      duringStage: "2. During Stay & Welcoming",
      afterStage: "3. Check-out & Clean Up",
      allDoneStage: "All tasks completed! Great hosting! 🎉",
      progress: "completed",
      resetChecklist: "Reset for Next Guest",
    },
    pricing: {
      title: "Hill Pricing Calculator",
      subtitle: "Deterministic local estimation based on Darjeeling tea-garden norms",
      baseEstimate: "Estimated Fair Base Price",
      recommendedRange: "Recommended Price Range",
      factors: "Price Breakdown Factors",
      season: "Season & Demand",
      peakSeason: "Peak Season (Oct–Dec, Mar–May)",
      offSeason: "Standard Season",
      monsoon: "Monsoon Season (Jul–Aug)",
      organicFoodFactor: "Organic Village Meals Included",
      teaTourFactor: "Tea Garden Plucking Experience",
      disclaimer: "Rule-based local estimate, not live fluctuating market rate. Clear and honest.",
    },
    settings: {
      title: "App Settings & Storage",
      deviceId: "Device ID (Offline identifier)",
      cloudSync: "Cloud Sync (Firestore)",
      offlineAIModel: "On-Device AI Model Weights",
      modelStatus: "Model Status",
      downloadModel: "Download AI Model Cache (120MB)",
      downloading: "Downloading model assets...",
      exportBackup: "Export Local Backup JSON",
      appVersion: "Version 1.0.0 (Offline Next.js PWA)",
      madeForHills: "Crafted for Himalayan tea-garden communities",
    },
  },

  ne: {
    appName: "होमस्टे साथी",
    appSubtitle: "दार्जिलिङ चियाबारी होमस्टे सहायक (अफलाइन)",
    offlineBadge: "अफलाइन",
    onlineBadge: "अनलाइन",
    syncingBadge: "सिङ्क हुँदैछ...",
    syncIssueBadge: "सिङ्क समस्या",
    syncedJustNow: "अहिले सिङ्क भयो",
    changesWaiting: "परिवर्तन फोनमा सुरक्षित छन्",
    syncNow: "अहिले सिङ्क गर्नुहोस्",
    onboarding: {
      welcomeTitle: "होमस्टे साथीमा स्वागत छ",
      welcomeSubtitle: "चियाबारी होमस्टे सञ्चालकहरूको लागि अफलाइन सहायक। १ मिनेटमा आफ्नो होमस्टे प्रोफाइल बनाउनुहोस्।",
      step1Title: "१. मनपर्ने भाषा छान्नुहोस्",
      step2Title: "२. सञ्चालक र होमस्टेको विवरण",
      step3Title: "३. कोठा र सामान्य शुल्क",
      hostName: "तपाईंको पूरा नाम",
      hostNamePlaceholder: "जस्तै: सुनिता राई",
      homestayName: "होमस्टेको नाम",
      homestayNamePlaceholder: "जस्तै: कञ्चनजङ्घा भ्यू होमस्टे",
      location: "गाउँ / ठाउँको नाम",
      locationPlaceholder: "जस्तै: ताकदह, दार्जिलिङ",
      roomsCount: "पाहुना कोठा संख्या",
      defaultPrice: "सामान्य प्रति रात दर (₹)",
      phoneOptional: "सम्पर्क फोन (ऐच्छिक)",
      phonePlaceholder: "जस्तै: +91 98765 43210",
      finishButton: "सेटअप पूरा गर्नुहोस् र सुरु गर्नुहोस्",
      readyTitle: "तपाईं तयार हुनुभयो! 🎉",
      readyNotice: "सबै विवरण यसै फोनमा सुरक्षित छन् र अबदेखि इन्टरनेट बिना १००% चल्छन्।",
      letsStart: "ड्यासबोर्ड खोल्नुहोस्",
    },
    nav: {
      dashboard: "ड्यासबोर्ड",
      bookings: "बुकिङहरू",
      ledger: "लेखाखाता",
      listing: "विवरण तयार",
      translate: "अनुवाद",
      checklist: "जाँचसूची",
      settings: "सेटिङ्स",
    },
    dashboard: {
      welcome: "नमस्ते",
      homestayLabel: "चियाबारी होमस्टे",
      todayTitle: "आजका पाहुना र गतिविधि",
      noCheckinsToday: "आज कुनै पाहुनाको आगमन तालिका छैन",
      noBookingsYetTitle: "पहिलो पाहुनाको स्वागत गर्न तयार?",
      noBookingsYetSub: "पाहुनाको बसाइ दर्ता गर्न '+ नयाँ बुकिङ' थिच्नुहोस्।",
      checkingIn: "आगमन (Check-in)",
      checkingOut: "प्रस्थान (Check-out)",
      staying: "बसिरहेका पाहुना",
      pendingPayment: "बाँकी रकम",
      quickActions: "द्रुत कार्यहरू",
      newBooking: "+ नयाँ बुकिङ",
      translateMessage: "सन्देश अनुवाद",
      cashLedger: "नगद खाता",
      hostingChecklist: "तयारी जाँचसूची",
      listingAssistant: "होमस्टे विवरण",
      pricingHelp: "मूल्य निर्धारण",
      monthSummary: "यस महिनाको हिसाब",
      totalEarnings: "कुल बचत",
      occupancy: "बुकिङ रातहरू",
      savedOfflineNotice: "सबै विवरण यसै फोनमा सुरक्षित छन् र इन्टरनेट बिना चल्छन्।",
    },
    bookings: {
      title: "बुकिङ व्यवस्थापन",
      newBooking: "नयाँ बुकिङ थप्नुहोस्",
      guestName: "पाहुनाको नाम",
      guestPhone: "फोन नम्बर",
      guestPhoneOptional: "ऐच्छिक — पाहुनाले दिएमा मात्र",
      checkIn: "आउने मिति (Check-in)",
      checkOut: "जाने मिति (Check-out)",
      guests: "पाहुना संख्या",
      amount: "कुल रकम (₹)",
      notes: "विशेष टिपोट / अनुरोध",
      notesPlaceholder: "जस्तै: शाकाहारी खाना, घुम स्टेसनबाट ट्याक्सी चाहिन्छ",
      paymentStatus: "भुक्तानी अवस्था",
      pending: "बाँकी",
      partial: "आंशिक",
      settled: "चुक्ता भयो",
      saveBooking: "फोनमा सुरक्षित गर्नुहोस्",
      editBooking: "बुकिङ सम्पादन",
      deleteBooking: "हटाउनुहोस्",
      confirmDelete: "के तपाईं यो बुकिङ साँच्चै हटाउन चाहनुहुन्छ?",
      savedOfflineConfirm: "फोनमा सुरक्षित भयो · अनलाइन भएपछि सिङ्क हुनेछ",
      allBookings: "सबै बुकिङहरू",
      upcoming: "आगामी",
      completed: "सकिएको",
      noBookings: "हालसम्म कुनै बुकिङ छैन।",
      noBookingsSub: "नयाँ बुकिङ थप्न माथिको बटन थिच्नुहोस्।",
      nights: "रात",
      markSettled: "चुक्ता भएको चिन्ह लगाउनुहोस्",
    },
    ledger: {
      title: "नगद तथा खर्च खाता",
      income: "कुल आम्दानी",
      expense: "कुल खर्च",
      balance: "खुद बचत",
      addExpense: "+ खर्च थप्नुहोस्",
      expenseDescription: "खर्चको विवरण",
      expenseAmount: "रकम (₹)",
      saveExpense: "खर्च सुरक्षित गर्नुहोस्",
      settledStatus: "चुक्ता",
      pendingStatus: "बाँकी",
      noEntries: "कुनै कारोबार भेटिएन।",
      noEntriesSub: "गाउँले किनमेल खर्च लेख्नुहोस् वा बुकिङ थप्नुहोस्।",
      sourceBooking: "बुकिङ आम्दानी",
      manualExpense: "गाउँले खर्च",
      adjustment: "समायोजन",
      toggleSettled: "अवस्था बदल्नुहोस्",
    },
    listing: {
      title: "होमस्टे विवरण सहायक",
      modelAvailable: "🤖 यन्त्रमै AI तयार छ",
      modelOffline: "⚠️ टेम्पलेट मोड सक्रिय छ",
      modelOfflineNotice: "इन्टरनेट बिना नै प्रमाणित पहाडी ढाँचा प्रयोग गरी विवरण बनाइनेछ।",
      homestayName: "होमस्टेको नाम",
      location: "गाउँ / ठाउँको नाम",
      locationHint: "जस्तै: ताकदह, तिनचुले, मिरिक, लामाहाट्टा",
      rooms: "कोठा संख्या",
      amenities: "सुविधाहरू (कमा दिएर लेख्नुहोस्)",
      food: "खाना र चिया सुविधा",
      attractions: "वरपरका दृश्य र घुम्ने ठाउँ",
      houseRules: "घरका नियम र परम्परा",
      pricePerNight: "प्रति रात दर (₹)",
      generateButton: "विवरण तयार गर्नुहोस्",
      generating: "फोनमै तयार हुँदैछ...",
      headline: "आकर्षक शीर्षक",
      shortListing: "छोटो विवरण (WhatsApp/SMS)",
      detailedListing: "विस्तृत विवरण (पोर्टलको लागि)",
      amenitiesSummary: "मुख्य सुविधाहरू",
      localExperience: "चियाबारी र गाउँको अनुभव",
      saveListing: "विवरण सुरक्षित गर्नुहोस्",
      savedListings: "सुरक्षित विवरणहरू",
      noSavedListings: "कुनै विवरण सुरक्षित गरिएको छैन।",
      generatedByAI: "अन-डिभाइस AI द्वारा निर्मित",
      generatedByTemplate: "पहाडी ढाँचाबाट निर्मित",
      shareWhatsApp: "WhatsApp मा पठाउनुहोस्",
      shareGeneral: "कपी / सेयर गर्नुहोस्",
      copied: "कपी गरियो!",
    },
    translate: {
      title: "पाहुनाको सन्देश अनुवादक",
      modelReady: "🤖 तयार छ (अन-डिभाइस)",
      modelOffline: "⚠️ अफलाइन वाक्यांश सक्रिय",
      inputPlaceholder: "पाहुनाको सन्देश यहाँ टाँस्नुहोस् (अंग्रेजी, हिन्दी, बंगाली)...",
      detectedLanguage: "पहिचान भएको भाषा",
      translatedResult: "तपाईंको भाषामा अनुवाद",
      suggestedReply: "सुझाव गरिएको विनम्र जवाफ (पाहुनाको भाषामा)",
      pickScenario: "विषय छान्नुहोस्:",
      copyReply: "जवाफ कपी गर्नुहोस्",
      copiedNotice: "जवाफ कपी भयो! अब WhatsApp वा SMS मा टाँस्न सक्नुहुन्छ।",
      scenarioPricing: "कोठाको मूल्य र दर",
      scenarioDirections: "आइपुग्ने बाटो र दिशा",
      scenarioCheckin: "आउने-जाने समय",
      scenarioFood: "घरेलु खाना र ताजा चिया",
      scenarioTeaGarden: "चिया टिप्ने र गाउँ भ्रमण",
      scenarioRules: "घरका नियम र शान्ति",
      scenarioWeather: "मौसम र तातो पानी",
      scenarioUPI: "नगद र भुक्तानी जानकारी",
      offlinePhrasebookUsed: "तपाईंको वास्तविक होमस्टे दर अनुसार तयार पारिएको।",
    },
    checklist: {
      title: "पाहुना सत्कार जाँचसूची",
      subtitle: "पहिलो पटक होमस्टे चलाउनेहरूको लागि सहज चरणबद्ध मार्गदर्शन",
      beforeStage: "१. पाहुना आउनु अघि",
      duringStage: "२. बसाइको दौरान र स्वागत",
      afterStage: "३. बिदाइ र सरसफाइ",
      allDoneStage: "सबै काम सम्पन्न भयो! बधाई छ! 🎉",
      progress: "सम्पन्न",
      resetChecklist: "अर्को पाहुनाको लागि रिसेट गर्नुहोस्",
    },
    pricing: {
      title: "पहाडी मूल्य क्याल्कुलेटर",
      subtitle: "दार्जिलिङ चियाबारी स्थानीय दर अनुसारको हिसाब",
      baseEstimate: "अनुमानित उचित आधार मूल्य",
      recommendedRange: "सुझावित मूल्य दायरा",
      factors: "मूल्य आधारहरू",
      season: "ऋतु र माग",
      peakSeason: "मुख्य मौसम (असोज-मंसिर, चैत-जेठ)",
      offSeason: "सामान्य मौसम",
      monsoon: "वर्षायाम (असार-साउन)",
      organicFoodFactor: "अर्गानिक गाउँले खाना समावेश",
      teaTourFactor: "चियाबारी घुम्ने र टिप्ने अनुभव",
      disclaimer: "यो स्थानीय नियममा आधारित इमानदार अनुमान हो।",
    },
    settings: {
      title: "सेटिङ्स तथा भण्डारण",
      deviceId: "फोन पहिचान (Device ID)",
      cloudSync: "क्लाउड सिङ्क (Firestore)",
      offlineAIModel: "अन-डिभाइस AI मोडल",
      modelStatus: "मोडल अवस्था",
      downloadModel: "AI मोडल डाउनलोड गर्नुहोस् (120MB)",
      downloading: "डाउनलोड हुँदैछ...",
      exportBackup: "डाटा ब्याकअप फाइल निकाल्नुहोस्",
      appVersion: "संस्करण १.०.० (अफलाइन Next.js PWA)",
      madeForHills: "हिमाली चियाबारी समुदायका लागि निर्मित",
    },
  },

  bn: {
    appName: "হোমস্টে সাথী",
    appSubtitle: "দার্জিলিং চা-বাগান হোমস্টে সহচর (অফলাইন)",
    offlineBadge: "অফলাইন",
    onlineBadge: "অনলাইন",
    syncingBadge: "সিঙ্ক হচ্ছে...",
    syncIssueBadge: "সিঙ্ক সমস্যা",
    syncedJustNow: "এইমাত্র সিঙ্ক সম্পন্ন",
    changesWaiting: "টি পরিবর্তন জমা আছে",
    syncNow: "এখনই সিঙ্ক করুন",
    onboarding: {
      welcomeTitle: "হোমস্টে সাথীতে স্বাগতম",
      welcomeSubtitle: "চা-বাগান হোমস্টে পরিচালকদের অফলাইন সহচর। মাত্র ১ মিনিটে আপনার প্রোফাইল তৈরি করুন।",
      step1Title: "১. পছন্দের ভাষা নির্বাচন",
      step2Title: "২. পরিচালক ও হোমস্টে-র বিবরণ",
      step3Title: "৩. রুম সংখ্যা ও সাধারণ ভাড়া",
      hostName: "আপনার পুরো নাম",
      hostNamePlaceholder: "যেমন: অনীতা ছেত্রী",
      homestayName: "হোমস্টে-র নাম",
      homestayNamePlaceholder: "যেমন: কাঞ্চনজঙ্ঘা ভিউ হোমস্টে",
      location: "গ্রাম বা জায়গার নাম",
      locationPlaceholder: "যেমন: তিনচুলে, দার্জিলিং",
      roomsCount: "অতিথি কক্ষ সংখ্যা",
      defaultPrice: "প্রতি রাতের সাধারণ ভাড়া (₹)",
      phoneOptional: "যোগাযোগ ফোন (ঐচ্ছিক)",
      phonePlaceholder: "যেমন: +91 98765 43210",
      finishButton: "সেটআপ সম্পন্ন করুন",
      readyTitle: "আপনি প্রস্তুত! 🎉",
      readyNotice: "সমস্ত তথ্য এই ফোনে সংরক্ষিত এবং ইন্টারনেট ছাড়াই কাজ করবে।",
      letsStart: "ড্যাশবোর্ড খুলুন",
    },
    nav: {
      dashboard: "ড্যাশবোর্ড",
      bookings: "বুকিংস",
      ledger: "হিসাবখাতা",
      listing: "লিস্টিং তৈরি",
      translate: "অনুবাদ",
      checklist: "চেকলিস্ট",
      settings: "সেটিংস",
    },
    dashboard: {
      welcome: "নমস্কার",
      homestayLabel: "চা-বাগান হোমস্টে",
      todayTitle: "আজকের অতিথি ও কাজকর্ম",
      noCheckinsToday: "আজকে কোনো অতিথি আগমনের সূচি নেই",
      noBookingsYetTitle: "প্রথম অতিথির জন্য প্রস্তুত?",
      noBookingsYetSub: "অতিথির বুকিং রেকর্ড করতে '+ নতুন বুকিং' বোতাম টিপুন।",
      checkingIn: "চেক-ইন",
      checkingOut: "চেক-আউট",
      staying: "বর্তমানে অবস্থানরত",
      pendingPayment: "বকেয়া টাকা",
      quickActions: "দ্রুত সেবা",
      newBooking: "+ নতুন বুকিং",
      translateMessage: "বার্তা অনুবাদ",
      cashLedger: "নগদ খাতা",
      hostingChecklist: "হোস্টিং চেকলিস্ট",
      listingAssistant: "লিস্টিং সহায়ক",
      pricingHelp: "ভাড়া সহায়ক",
      monthSummary: "চলতি মাসের হিসাব",
      totalEarnings: "মোট সঞ্চয়",
      occupancy: "বুকিং রাত",
      savedOfflineNotice: "সমস্ত তথ্য নিরাপদে এই ফোনে সংরক্ষিত এবং ইন্টারনেট ছাড়াই কাজ করে।",
    },
    bookings: {
      title: "বুকিং পরিচালনা",
      newBooking: "নতুন বুকিং যোগ করুন",
      guestName: "অতিথির নাম",
      guestPhone: "ফোন নম্বর",
      guestPhoneOptional: "ঐচ্ছিক — অতিথি দিলে তবেই",
      checkIn: "আসার তারিখ (Check-in)",
      checkOut: "যাওয়ার তারিখ (Check-out)",
      guests: "অতিথির সংখ্যা",
      amount: "মোট ভাড়া (₹)",
      notes: "বিশেষ অনুরোধ বা নোট",
      notesPlaceholder: "যেমন: নিরামিষ খাবার, ঘুম স্টেশন থেকে গাড়ি প্রয়োজন",
      paymentStatus: "পেমেন্ট অবস্থা",
      pending: "বকেয়া",
      partial: "আংশিক",
      settled: "পরিশোধিত",
      saveBooking: "ফোনে সেভ করুন",
      editBooking: "বুকিং সম্পাদনা",
      deleteBooking: "মুছে ফেলুন",
      confirmDelete: "আপনি কি নিশ্চিতভাবে এই বুকিং মুছে ফেলতে চান?",
      savedOfflineConfirm: "ফোনে সংরক্ষিত হয়েছে · অনলাইন হলে সিঙ্ক হবে",
      allBookings: "সব বুকিং",
      upcoming: "আসন্ন",
      completed: "সম্পন্ন",
      noBookings: "এখনো কোনো বুকিং নেই।",
      noBookingsSub: "প্রথম বুকিং যোগ করতে উপরের বোতাম টিপুন।",
      nights: "রাত",
      markSettled: "পরিশোধিত হিসেবে চিহ্নিত করুন",
    },
    ledger: {
      title: "নগদ ও খরচ খাতা",
      income: "মোট আয়",
      expense: "মোট ব্যয়",
      balance: "অবশিষ্ট সঞ্চয়",
      addExpense: "+ খরচ লিখুন",
      expenseDescription: "খরচের বিবরণ",
      expenseAmount: "টাকা (₹)",
      saveExpense: "খরচ সেভ করুন",
      settledStatus: "পরিশোধিত",
      pendingStatus: "বকেয়া",
      noEntries: "কোনো লেনদেন পাওয়া যায়নি।",
      noEntriesSub: "বাজার খরচের হিসাব লিখুন বা বুকিং যোগ করুন।",
      sourceBooking: "বুকিং আয়",
      manualExpense: "গ্রাম্য খরচ",
      adjustment: "সমন্বয়",
      toggleSettled: "অবস্থা পরিবর্তন",
    },
    listing: {
      title: "লিস্টিং সহায়ক",
      modelAvailable: "🤖 অন-ডিভাইস AI সক্রিয়",
      modelOffline: "⚠️ টেমপ্লেট মোড সক্রিয়",
      modelOfflineNotice: "ইন্টারনেট ছাড়াই সুন্দর লিস্টিং তৈরি হবে।",
      homestayName: "হোমস্টে-র নাম",
      location: "গ্রাম বা জায়গার নাম",
      locationHint: "যেমন: তিনচুলে, তাকদাহ, মিরিক, লামাহাট্টা",
      rooms: "অতিথি কক্ষ সংখ্যা",
      amenities: "সুযোগ-সুবিধা (কমা দিয়ে লিখুন)",
      food: "খাবার ও চায়ের সুবিধা",
      attractions: "আশেপাশের দর্শনীয় স্থান",
      houseRules: "গৃহস্থালি নিয়মকানুন",
      pricePerNight: "প্রতি রাতের ভাড়া (₹)",
      generateButton: "লিস্টিং প্রস্তুত করুন",
      generating: "ফোনেই তৈরি হচ্ছে...",
      headline: "আকর্ষণীয় শিরোনাম",
      shortListing: "সংক্ষিপ্ত বিবরণ (WhatsApp/SMS)",
      detailedListing: "পূর্ণাঙ্গ বিবরণ (অনলাইন লিস্টিং)",
      amenitiesSummary: "প্রধান সুবিধাসমূহ",
      localExperience: "চা-বাগান ও পাহাড়ী অভিজ্ঞতা",
      saveListing: "লিস্টিং সেভ করুন",
      savedListings: "সংরক্ষিত লিস্টিং",
      noSavedListings: "কোনো লিস্টিং সংরক্ষিত নেই।",
      generatedByAI: "অন-ডিভাইস AI দ্বারা প্রস্তুত",
      generatedByTemplate: "পাহাড়ী টেমপ্লেট দ্বারা প্রস্তুত",
      shareWhatsApp: "হোয়াটসঅ্যাপে শেয়ার করুন",
      shareGeneral: "কপি / শেয়ার",
      copied: "কপি করা হয়েছে!",
    },
    translate: {
      title: "অতিথির বার্তা অনুবাদক",
      modelReady: "🤖 প্রস্তুত (অন-ডিভাইস)",
      modelOffline: "⚠️ অফলাইন বাক্যাংশ সক্রিয়",
      inputPlaceholder: "অতিথির বার্তা পেস্ট করুন (ইংরেজি, হিন্দি বা অন্য ভাষা)...",
      detectedLanguage: "শনাক্ত ভাষা",
      translatedResult: "আপনার ভাষায় অনুবাদ",
      suggestedReply: "প্রস্তাবিত বিনম্র উত্তর (অতিথির ভাষায়)",
      pickScenario: "বিষয় নির্বাচন করুন:",
      copyReply: "উত্তর কপি করুন",
      copiedNotice: "উত্তর কপি হয়েছে! এবার WhatsApp বা SMS এ পাঠান।",
      scenarioPricing: "রুমের ভাড়া ও দর",
      scenarioDirections: "আসার রাস্তা ও দিকনির্দেশ",
      scenarioCheckin: "আসা-যাওয়ার সময়",
      scenarioFood: "ঘরের তৈরি খাবার ও তাজা চা",
      scenarioTeaGarden: "চা-বাগান পরিদর্শন ও পাতা তোলা",
      scenarioRules: "বাড়ির নিয়মকানুন ও শান্তি",
      scenarioWeather: "পাহাড়ের আবহাওয়া ও গরম জল",
      scenarioUPI: "নগদ ও UPI পেমেন্ট তথ্য",
      offlinePhrasebookUsed: "আপনার হোমস্টে-র আসল তথ্য দিয়ে প্রস্তুত।",
    },
    checklist: {
      title: "অতিথি আপ্যায়ন চেকলিস্ট",
      subtitle: "প্রথমবার হোমস্টে পরিচালকদের জন্য সহজ গাইড",
      beforeStage: "১. অতিথি আসার পূর্বে",
      duringStage: "২. অবস্থানকালীন ও অভ্যর্থনা",
      afterStage: "৩. বিদায় ও পরিচ্ছন্নতা",
      allDoneStage: "সমস্ত কাজ সম্পন্ন হয়েছে! অভিনন্দন! 🎉",
      progress: "সম্পন্ন",
      resetChecklist: "পরবর্তী অতিথির জন্য প্রস্তুত করুন",
    },
    pricing: {
      title: "পাহাড়ী ভাড়া ক্যালকুলেটর",
      subtitle: "দার্জিলিং চা-বাগান অঞ্চলের বাস্তবসম্মত হিসাব",
      baseEstimate: "ন্যায্য আনুমানিক ভিত্তি মূল্য",
      recommendedRange: "প্রস্তাবিত ভাড়ার পরিসর",
      factors: "মূল্য নির্ধারণের ভিত্তি",
      season: "ঋতু ও পর্যটন চাহিদা",
      peakSeason: "প্রধান পর্যটন মরশুম",
      offSeason: "সাধারণ সময়",
      monsoon: "বর্ষাকাল",
      organicFoodFactor: "অর্গানিক খাবার অন্তর্ভুক্ত",
      teaTourFactor: "চা-বাগান ভ্রমণ অভিজ্ঞতা",
      disclaimer: "এটি স্থানীয় নিয়ম ভিত্তিক নির্ভরযোগ্য অনুমান।",
    },
    settings: {
      title: "সেটিংস ও স্টোরেজ",
      deviceId: "ডিভাইস আইডি (অফলাইন শনাক্তকারী)",
      cloudSync: "ক্লাউড সিঙ্ক (Firestore)",
      offlineAIModel: "অন-ডিভাইস AI মডেল ফাইল",
      modelStatus: "মডেলের অবস্থা",
      downloadModel: "AI মডেল ডাউনলোড করুন (120MB)",
      downloading: "ডাউনলোড হচ্ছে...",
      exportBackup: "ডেটা ব্যাকআপ ফাইল এক্সপোর্ট করুন",
      appVersion: "সংস্করণ ১.০.০ (অফলাইন Next.js PWA)",
      madeForHills: "হিমালয়ের চা-বাগান পরিবারের জন্য নির্মিত",
    },
  },

  hi: {
    appName: "होमस्टे साथी",
    appSubtitle: "दार्जिलिंग चाय बागान होमस्टे साथी (ऑफलाइन)",
    offlineBadge: "ऑफलाइन",
    onlineBadge: "ऑनलाइन",
    syncingBadge: "सिंक हो रहा है...",
    syncIssueBadge: "सिंक समस्या",
    syncedJustNow: "अभी सिंक हुआ",
    changesWaiting: "बदलाव फोन में सुरक्षित हैं",
    syncNow: "अभी सिंक करें",
    onboarding: {
      welcomeTitle: "होमस्टे साथी में स्वागत है",
      welcomeSubtitle: "चाय बागान होमस्टे स्वामियों के लिए ऑफलाइन साथी। 1 मिनट में अपना होमस्टे प्रोफाइल बनाएं।",
      step1Title: "1. पसंदीदा भाषा चुनें",
      step2Title: "2. स्वामी व होमस्टे विवरण",
      step3Title: "3. कमरे और सामान्य किराया",
      hostName: "आपका पूरा नाम",
      hostNamePlaceholder: "जैसे: सुनिता राई",
      homestayName: "होमस्टे का नाम",
      homestayNamePlaceholder: "जैसे: कंचनजंगा व्यू होमस्टे",
      location: "गाँव / स्थान का नाम",
      locationPlaceholder: "जैसे: ताकदह, दार्जिलिंग",
      roomsCount: "अतिथि कमरों की संख्या",
      defaultPrice: "सामान्य प्रति रात किराया (₹)",
      phoneOptional: "संपर्क फोन (वैकल्पिक)",
      phonePlaceholder: "जैसे: +91 98765 43210",
      finishButton: "सेटअप पूरा करें",
      readyTitle: "आप तैयार हैं! 🎉",
      readyNotice: "सभी रिकॉर्ड फोन पर सुरक्षित हैं और अब बिना इंटरनेट के 100% काम करेंगे।",
      letsStart: "डैशबोर्ड खोलें",
    },
    nav: {
      dashboard: "डैशबोर्ड",
      bookings: "बुकिंग्स",
      ledger: "लेखा-जोखा",
      listing: "लिस्टिंग बनाएं",
      translate: "अनुवाद",
      checklist: "चेकलिस्ट",
      settings: "सेटिंग्स",
    },
    dashboard: {
      welcome: "नमस्ते",
      homestayLabel: "चाय बागान होमस्टे",
      todayTitle: "आज के मेहमान और गतिविधियां",
      noCheckinsToday: "आज किसी मेहमान के आने का समय नहीं है",
      noBookingsYetTitle: "पहले मेहमान के स्वागत के लिए तैयार?",
      noBookingsYetSub: "मेहमान की बुकिंग दर्ज करने के लिए '+ नई बुकिंग' दबाएं।",
      checkingIn: "आगमन (Check-in)",
      checkingOut: "प्रस्थान (Check-out)",
      staying: "ठहरे हुए मेहमान",
      pendingPayment: "बकाया राशि",
      quickActions: "त्वरित कार्य",
      newBooking: "+ नई बुकिंग",
      translateMessage: "संदेश अनुवाद",
      cashLedger: "नकद खाता",
      hostingChecklist: "मेजबानी चेकलिस्ट",
      listingAssistant: "होमस्टे लिस्टिंग",
      pricingHelp: "किराया सहायक",
      monthSummary: "इस महीने का हिसाब",
      totalEarnings: "कुल बचत",
      occupancy: "बुकिंग रातें",
      savedOfflineNotice: "सभी रिकॉर्ड फोन पर सुरक्षित हैं और बिना इंटरनेट के काम करते हैं।",
    },
    bookings: {
      title: "बुकिंग प्रबंधन",
      newBooking: "नई बुकिंग जोड़ें",
      guestName: "मेहमान का नाम",
      guestPhone: "फोन नंबर",
      guestPhoneOptional: "वैकल्पिक — यदि मेहमान ने दिया हो",
      checkIn: "आने की तारीख (Check-in)",
      checkOut: "जाने की तारीख (Check-out)",
      guests: "मेहमानों की संख्या",
      amount: "कुल किराया (₹)",
      notes: "विशेष अनुरोध / टिप्पणी",
      notesPlaceholder: "जैसे: शाकाहारी भोजन, स्टेशन से टैक्सी चाहिए",
      paymentStatus: "भुगतान स्थिति",
      pending: "बकाया",
      partial: "आंशिक",
      settled: "पूर्ण चुकता",
      saveBooking: "फोन में सुरक्षित करें",
      editBooking: "बुकिंग संपादित करें",
      deleteBooking: "हटाएं",
      confirmDelete: "क्या आप वाकई यह बुकिंग हटाना चाहते हैं?",
      savedOfflineConfirm: "फोन में सुरक्षित · ऑनलाइन होने पर सिंक होगा",
      allBookings: "सभी बुकिंग्स",
      upcoming: "आगामी",
      completed: "पूर्ण",
      noBookings: "अभी कोई बुकिंग नहीं है।",
      noBookingsSub: "नई बुकिंग जोड़ने के लिए ऊपर का बटन दबाएं।",
      nights: "रातें",
      markSettled: "चुकता के रूप में चिह्नित करें",
    },
    ledger: {
      title: "नकद व खर्च खाता",
      income: "कुल आय",
      expense: "कुल खर्च",
      balance: "शुद्ध बचत",
      addExpense: "+ खर्च जोड़ें",
      expenseDescription: "खर्च का विवरण",
      expenseAmount: "राशि (₹)",
      saveExpense: "खर्च दर्ज करें",
      settledStatus: "चुकता",
      pendingStatus: "बकाया",
      noEntries: "कोई लेन-देन नहीं मिला।",
      noEntriesSub: "घरेलू बाजार खर्च दर्ज करें या बुकिंग जोड़ें।",
      sourceBooking: "बुकिंग आय",
      manualExpense: "घरेलू/गाँव खर्च",
      adjustment: "समायोजन",
      toggleSettled: "स्थिति बदलें",
    },
    listing: {
      title: "लिस्टिंग सहायक",
      modelAvailable: "🤖 ऑन-डिवाइस AI तैयार है",
      modelOffline: "⚠️ टेम्पलेट मोड सक्रिय है",
      modelOfflineNotice: "बिना इंटरनेट के सुंदर विवरण तैयार होगा।",
      homestayName: "होमस्टे का नाम",
      location: "गाँव / स्थान का नाम",
      locationHint: "जैसे: ताकदह, तिनचुले, मिरिक, लामाहाट्टा",
      rooms: "कमरों की संख्या",
      amenities: "सुविधाएं (अल्पविराम से अलग करें)",
      food: "भोजन व चाय सुविधा",
      attractions: "आसपास के दर्शनीय स्थल",
      houseRules: "घर के नियम व परंपराएं",
      pricePerNight: "प्रति रात किराया (₹)",
      generateButton: "लिस्टिंग तैयार करें",
      generating: "फोन पर तैयार हो रहा है...",
      headline: "आकर्षक शीर्षक",
      shortListing: "संक्षिप्त विवरण (WhatsApp/SMS)",
      detailedListing: "विस्तृत विवरण (पोर्टल के लिए)",
      amenitiesSummary: "मुख्य सुविधाएं",
      localExperience: "चाय बागान और पहाड़ी अनुभव",
      saveListing: "लिस्टिंग सुरक्षित करें",
      savedListings: "सुरक्षित लिस्टिंग",
      noSavedListings: "कोई लिस्टिंग सुरक्षित नहीं है।",
      generatedByAI: "ऑन-डिवाइस AI द्वारा निर्मित",
      generatedByTemplate: "पहाड़ी टेम्पलेट द्वारा निर्मित",
      shareWhatsApp: "WhatsApp पर साझा करें",
      shareGeneral: "कॉपी / शेयर करें",
      copied: "कॉपी हो गया!",
    },
    translate: {
      title: "मेहमान संदेश अनुवादक",
      modelReady: "🤖 तैयार है (ऑन-डिवाइस)",
      modelOffline: "⚠️ ऑफलाइन वाक्यांश सक्रिय",
      inputPlaceholder: "मेहमान का संदेश यहां पेस्ट करें (अंग्रेजी, बंगाली, नेपाली)...",
      detectedLanguage: "पहचानी गई भाषा",
      translatedResult: "आपकी भाषा में अनुवाद",
      suggestedReply: "सुझाया गया विनम्र जवाब (मेहमान की भाषा में)",
      pickScenario: "विषय चुनें:",
      copyReply: "जवाब कॉपी करें",
      copiedNotice: "जवाब कॉपी हो गया! अब WhatsApp या SMS में भेजें।",
      scenarioPricing: "कमरे का किराया व दर",
      scenarioDirections: "पहुंचने का रास्ता व दिशा",
      scenarioCheckin: "आने-जाने का समय",
      scenarioFood: "घर का ताजा भोजन और चाय",
      scenarioTeaGarden: "चाय बागान भ्रमण व पत्तियां चुनना",
      scenarioRules: "घर के नियम व शांति",
      scenarioWeather: "मौसम व गर्म पानी",
      scenarioUPI: "नकद व UPI भुगतान जानकारी",
      offlinePhrasebookUsed: "आपके वास्तविक होमस्टे विवरण से निर्मित।",
    },
    checklist: {
      title: "मेजबानी तैयारी चेकलिस्ट",
      subtitle: "पहली बार होमस्टे चलाने वालों के लिए आसान मार्गदर्शन",
      beforeStage: "१. मेहमान के आने से पहले",
      duringStage: "२. ठहरने के दौरान व स्वागत",
      afterStage: "३. विदाई व सफाई",
      allDoneStage: "सभी कार्य पूरे हुए! बधाई हो! 🎉",
      progress: "पूरा हुआ",
      resetChecklist: "अगले मेहमान के लिए रीसेट करें",
    },
    pricing: {
      title: "पहाड़ी किराया कैलकुलेटर",
      subtitle: "दार्जिलिंग चाय बागान स्थानीय मानकों पर आधारित",
      baseEstimate: "अनुमानित उचित आधार दर",
      recommendedRange: "सुझावित किराया दायरा",
      factors: "मूल्य निर्धारण कारक",
      season: "मौसम व मांग",
      peakSeason: "मुख्य पर्यटन मौसम",
      offSeason: "सामान्य मौसम",
      monsoon: "मानसून का मौसम",
      organicFoodFactor: "ऑर्गेनिक भोजन शामिल",
      teaTourFactor: "चाय बागान भ्रमण अनुभव",
      disclaimer: "यह स्थानीय मानकों पर आधारित ईमानदार अनुमान है।",
    },
    settings: {
      title: "सेटिंग्स व स्टोरेज",
      deviceId: "डिवाइस आईडी (ऑफलाइन पहचान)",
      cloudSync: "क्लाउड सिंक (Firestore)",
      offlineAIModel: "ऑन-डिवाइस AI मॉडल फाइल्स",
      modelStatus: "मॉडल स्थिति",
      downloadModel: "AI मॉडल डाउनलोड करें (120MB)",
      downloading: "डाउनलोड हो रहा है...",
      exportBackup: "बैकअप फाइल एक्सपोर्ट करें",
      appVersion: "संस्करण १.०.० (ऑफलाइन Next.js PWA)",
      madeForHills: "हिमालयी चाय बागान परिवारों के लिए निर्मित",
    },
  },
};
