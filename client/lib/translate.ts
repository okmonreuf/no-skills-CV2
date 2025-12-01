// Simple translation service for French <-> German
// Uses a basic dictionary approach for common phrases and Google Translate API as fallback

const translations: Record<string, Record<string, string>> = {
  "fr-de": {
    "Bonjour": "Guten Tag",
    "Bonsoir": "Guten Abend",
    "Merci": "Danke",
    "S'il vous plaît": "Bitte",
    "Oui": "Ja",
    "Non": "Nein",
    "Comment allez-vous?": "Wie geht es dir?",
    "Ça va?": "Wie geht's?",
    "Excusez-moi": "Entschuldigung",
    "Au revoir": "Auf Wiedersehen",
    "À bientôt": "Bis bald",
    "Bienvenue": "Willkommen",
    "De rien": "Gerne geschehen",
    "S'il te plaît": "Bitte schön",
    "Je suis désolé": "Es tut mir leid",
    "Parlez plus lentement": "Sprechen Sie langsamer",
    "Je ne comprends pas": "Ich verstehe nicht",
    "Pouvez-vous m'aider?": "Können Sie mir helfen?",
  },
  "de-fr": {
    "Guten Tag": "Bonjour",
    "Guten Abend": "Bonsoir",
    "Danke": "Merci",
    "Bitte": "S'il vous plaît",
    "Ja": "Oui",
    "Nein": "Non",
    "Wie geht es dir?": "Comment allez-vous?",
    "Wie geht's?": "Ça va?",
    "Entschuldigung": "Excusez-moi",
    "Auf Wiedersehen": "Au revoir",
    "Bis bald": "À bientôt",
    "Willkommen": "Bienvenue",
    "Gerne geschehen": "De rien",
    "Bitte schön": "S'il te plaît",
    "Es tut mir leid": "Je suis désolé",
    "Sprechen Sie langsamer": "Parlez plus lentement",
    "Ich verstehe nicht": "Je ne comprends pas",
    "Können Sie mir helfen?": "Pouvez-vous m'aider?",
  },
};

export async function translateMessage(
  text: string,
  fromLang: "fr" | "de",
  toLang: "fr" | "de"
): Promise<string> {
  if (fromLang === toLang) return text;

  // Try to find in dictionary first
  const key = `${fromLang}-${toLang}` as const;
  const dictKey = text.trim();

  if (translations[key] && translations[key][dictKey]) {
    return translations[key][dictKey];
  }

  // For longer messages, try a simple API-based approach
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`
    );
    const data = (await response.json()) as {
      responseData?: { translatedText?: string };
      responseStatus?: number;
    };

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
  } catch {
    console.warn("Translation API failed, returning original text");
  }

  // Fallback to original text if translation fails
  return text;
}

export function shouldTranslate(userLang: "fr" | "de", messageLang?: "fr" | "de"): boolean {
  if (!messageLang) return false;
  return userLang !== messageLang;
}
