// Fast zero-network heuristic character-script & language detection
import { SupportedLanguage } from '../types';

export interface DetectionResult {
  language: SupportedLanguage;
  languageName: string;
  confidence: number;
  script: 'Latin' | 'Devanagari' | 'Bengali' | 'Unknown';
}

export function detectLanguage(text: string): DetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      language: 'en',
      languageName: 'English',
      confidence: 1.0,
      script: 'Latin',
    };
  }

  let devanagariCount = 0;
  let bengaliCount = 0;
  let latinCount = 0;
  let totalChars = 0;

  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0x0900 && code <= 0x097F) {
      devanagariCount++;
      totalChars++;
    } else if (code >= 0x0980 && code <= 0x09FF) {
      bengaliCount++;
      totalChars++;
    } else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      latinCount++;
      totalChars++;
    }
  }

  if (totalChars === 0) {
    return {
      language: 'en',
      languageName: 'English',
      confidence: 0.5,
      script: 'Latin',
    };
  }

  if (bengaliCount > devanagariCount && bengaliCount > latinCount) {
    return {
      language: 'bn',
      languageName: 'বাংলা (Bengali)',
      confidence: Math.round((bengaliCount / totalChars) * 100) / 100,
      script: 'Bengali',
    };
  }

  if (devanagariCount > latinCount && devanagariCount > bengaliCount) {
    const nepaliMarkers = ['छ', 'हुनुहुन्छ', 'गर्नु', 'हाम्रो', 'कति', 'होला', 'भयो', 'सुविधा', 'चाहिन्छ'];
    const lower = text.toLowerCase();
    const isNepali = nepaliMarkers.some(m => lower.includes(m));

    if (isNepali) {
      return {
        language: 'ne',
        languageName: 'नेपाली (Nepali)',
        confidence: Math.round((devanagariCount / totalChars) * 100) / 100,
        script: 'Devanagari',
      };
    }

    return {
      language: 'hi',
      languageName: 'हिन्दी (Hindi)',
      confidence: Math.round((devanagariCount / totalChars) * 100) / 100,
      script: 'Devanagari',
    };
  }

  return {
    language: 'en',
    languageName: 'English',
    confidence: Math.round((latinCount / totalChars) * 100) / 100,
    script: 'Latin',
  };
}
