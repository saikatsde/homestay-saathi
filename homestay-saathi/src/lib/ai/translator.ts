// On-Device Translation Pipeline & Scenario Reply Generator
import { SupportedLanguage } from '../types';
import { detectLanguage, DetectionResult } from '../i18n/detector';
import { scenarios } from '../i18n/scenarios';
import { getModelAvailability } from './availability';

export interface TranslationResult {
  sourceText: string;
  detectedLanguage: DetectionResult;
  targetLanguage: SupportedLanguage;
  translatedText: string;
  matchedScenarioId?: string;
  suggestedReply?: string;
  isAI: boolean;
}

export interface TranslationContext {
  homestayName: string;
  price: number;
  location: string;
  hostName: string;
}

const commonHillPhrases: Record<string, Record<SupportedLanguage, string>> = {
  price: {
    en: "What is your room rate per night and what meals are included?",
    ne: "प्रति रात कोठाको दर कति हो र कुन-कुन खाना समावेश छ?",
    bn: "প্রতি রাতের রুমের ভাড়া কত এবং কী কী খাবার পাওয়া যাবে?",
    hi: "प्रति रात कमरे का किराया कितना है और कौन सा खाना शामिल है?",
  },
  reach: {
    en: "How do we reach your village homestay from NJP railway station?",
    ne: "एनजेपी रेल स्टेसनबाट तपाईंको गाउँको होमस्टे कसरी पुग्ने?",
    bn: "NJP রেল স্টেশন থেকে আপনাদের গ্রামের হোমস্টে কীভাবে যাব?",
    hi: "NJP रेलवे स्टेशन से आपके गाँव के होमस्टे कैसे पहुंचे?",
  },
  checkin: {
    en: "Can we check in early in the morning around 8 AM?",
    ne: "के हामी बिहान ८ बजेतिर सबेरै चेक-इन गर्न सक्छौं?",
    bn: "আমরা কি সকাল ৮টার দিকে তাড়াতাড়ি চেক-ইন করতে পারি?",
    hi: "क्या हम सुबह 8 बजे जल्दी चेक-इन कर सकते हैं?",
  },
  food: {
    en: "Do you provide vegetarian meals and warm Darjeeling tea?",
    ne: "के यहाँ शाकाहारी खाना र तातो दार्जिलिङ चिया पाइन्छ?",
    bn: "এখানে কি নিরামিষ খাবার ও খাঁটি দার্জিলিং চা পাওয়া যাবে?",
    hi: "क्या यहाँ शाकाहारी भोजन और गर्म दार्जिलिंग चाय मिलती है?",
  },
  kanchenjunga: {
    en: "Is Mount Kanchenjunga visible from your homestay rooms?",
    ne: "के तपाईंको कोठाबाट कञ्चनजङ्घा हिमाल देखिन्छ?",
    bn: "আপনাদের রুম থেকে কি কাঞ্চনজঙ্ঘা পর্বত দেখা যায়?",
    hi: "क्या आपके कमरे से कंचनजंगा पर्वत दिखाई देता है?",
  },
  cold: {
    en: "How cold is it in the evening? Is hot bathing water available?",
    ne: "साँझ कत्तिको चिसो हुन्छ? के नुहाउन तातो पानी उपलब्ध छ?",
    bn: "সন্ধ্যায় কতটা ঠান্ডা পড়ে? স্নানের জন্য গরম জল আছে কি?",
    hi: "शाम को कितनी ठंड होती है? क्या नहाने के लिए गर्म पानी है?",
  },
};

export function findMatchingScenario(text: string): string {
  const lower = text.toLowerCase();
  
  if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('tariff') || lower.includes('रुपैया') || lower.includes('भाड़ा') || lower.includes('किराया') || lower.includes('कति')) {
    return 'pricing';
  }
  if (lower.includes('reach') || lower.includes('way') || lower.includes('direction') || lower.includes('road') || lower.includes('jeep') || lower.includes('बाटो') || lower.includes('रास्ता') || lower.includes('রাস্তা')) {
    return 'directions';
  }
  if (lower.includes('time') || lower.includes('checkin') || lower.includes('check in') || lower.includes('checkout') || lower.includes('early') || lower.includes('समय') || lower.includes('সময়')) {
    return 'checkin';
  }
  if (lower.includes('food') || lower.includes('meal') || lower.includes('tea') || lower.includes('chai') || lower.includes('veg') || lower.includes('dinner') || lower.includes('खाना') || lower.includes('चिया') || lower.includes('খাবার')) {
    return 'food';
  }
  if (lower.includes('garden') || lower.includes('tour') || lower.includes('walk') || lower.includes('view') || lower.includes('sight') || lower.includes('चियाबारी') || lower.includes('বাগান') || lower.includes('बागान')) {
    return 'teagarden';
  }
  if (lower.includes('rule') || lower.includes('smoke') || lower.includes('drink') || lower.includes('music') || lower.includes('नियम') || lower.includes('নিয়ম')) {
    return 'rules';
  }
  if (lower.includes('weather') || lower.includes('cold') || lower.includes('hot water') || lower.includes('water') || lower.includes('jacket') || lower.includes('चिसो') || lower.includes('पानी') || lower.includes('ঠান্ডা') || lower.includes('ठंड')) {
    return 'weather';
  }
  if (lower.includes('pay') || lower.includes('upi') || lower.includes('gpay') || lower.includes('cash') || lower.includes('phonepe') || lower.includes('पेमेन्ट') || lower.includes('भुक्तानी') || lower.includes('টাকা')) {
    return 'upi';
  }

  return 'pricing';
}

export async function translateGuestMessage(
  guestMessage: string,
  hostDisplayLanguage: SupportedLanguage,
  context: TranslationContext
): Promise<TranslationResult> {
  const detected = detectLanguage(guestMessage);
  const matchedScenarioId = findMatchingScenario(guestMessage);
  const scenario = scenarios.find(s => s.id === matchedScenarioId) || scenarios[0];
  const availability = getModelAvailability();

  const guestLang = detected.language;
  const suggestedReply = scenario.replies[guestLang](context);

  let translatedText = '';

  if (detected.language === hostDisplayLanguage) {
    translatedText = guestMessage;
  } else {
    let foundMatch = false;
    for (const [, translations] of Object.entries(commonHillPhrases)) {
      const sourcePhrase = translations[detected.language];
      if (sourcePhrase && guestMessage.toLowerCase().includes(sourcePhrase.substring(0, 15).toLowerCase())) {
        translatedText = translations[hostDisplayLanguage];
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      const localizedScenarioPhrase = scenario.phrases[hostDisplayLanguage];
      translatedText = `[${scenario.defaultName}]: "${guestMessage}"\n→ ${localizedScenarioPhrase}`;
    }
  }

  return {
    sourceText: guestMessage,
    detectedLanguage: detected,
    targetLanguage: hostDisplayLanguage,
    translatedText,
    matchedScenarioId,
    suggestedReply,
    isAI: availability.status === 'available',
  };
}
