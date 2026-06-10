import { useState } from "react";

/**
 * Utility to map country names in Hebrew and English to their flag emojis.
 */

const FLAG_MAP: Record<string, string> = {
  // --- Hebrew ---
  "ארגנטינה": "🇦🇷",
  "ברזיל": "🇧🇷",
  "צרפת": "🇫🇷",
  "אנגליה": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "גרמניה": "🇩🇪",
  "ספרד": "🇪🇸",
  "פורטוגל": "🇵🇹",
  "איטליה": "🇮🇹",
  "הולנד": "🇳🇱",
  "בלגיה": "🇧🇪",
  "קרואטיה": "🇭🇷",
  "אורוגוואי": "🇺🇾",
  "ארה\"ב": "🇺🇸",
  "ארהב": "🇺🇸",
  "ארצות הברית": "🇺🇸",
  "מקסיקו": "🇲🇽",
  "קנדה": "🇨🇦",
  "מרוקו": "🇲🇦",
  "יפן": "🇯🇵",
  "דרום קוריאה": "🇰🇷",
  "קוריאה": "🇰🇷",
  "סנגל": "🇸🇳",
  "קמרון": "🇨🇲",
  "גאנה": "🇬🇭",
  "תוניסיה": "🇹🇳",
  "אקוודור": "🇪🇨",
  "קטר": "🇶🇦",
  "קטאר": "🇶🇦",
  "ערב הסעודית": "🇸🇦",
  "סעודיה": "🇸🇦",
  "איראן": "🇮🇷",
  "אוסטרליה": "🇦🇺",
  "דנמרק": "🇩🇰",
  "שווייץ": "🇨🇭",
  "שוויץ": "🇨🇭",
  "פולין": "🇵🇱",
  "סרביה": "🇷🇸",
  "ויילס": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  "קוסטה ריקה": "🇨🇷",
  "קוסטה-ריקה": "🇨🇷",
  "קולומביה": "🇨🇴",
  "פרו": "🇵🇪",
  "צ'ילה": "🇨🇱",
  "שבדיה": "🇸🇪",
  "שוודיה": "🇸🇪",
  "אוקראינה": "🇺🇦",
  "טורקיה": "🇹🇷",
  "מצרים": "🇪🇬",
  "אלג'יריה": "🇩🇿",
  "ניגריה": "🇳🇬",
  "חוף השנהב": "🇨🇮",
  "רומניה": "🇷🇴",
  "סלובקיה": "🇸🇰",
  "סלובניה": "🇸🇮",
  "צ'כיה": "🇨🇿",
  "צכיה": "🇨🇿",
  "הרפובליקה הצ'כית": "🇨🇿",
  "הרפובליקה הצכית": "🇨🇿",
  "הונגריה": "🇭🇺",
  "אוסטריה": "🇦🇹",
  "סקוטלנד": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "יוון": "🇬🇷",
  "פינלנד": "🇫🇮",
  "נורבגיה": "🇳🇴",
  "נורווגיה": "🇳🇴",
  "האיטי": "🇭🇹",
  "קונגו": "🇨🇩",
  "קונגו הדמוקרטית": "🇨🇩",
  "הרפובליקה הדמוקרטית של קונגו": "🇨🇩",
  "אירלנד": "🇮🇪",
  "רוסיה": "🇷🇺",
  "ישראל": "🇮🇱",
  "ג'ורג'יה": "🇬🇪",
  "גיאורגיה": "🇬🇪",
  "אלבניה": "🇦🇱",
  "ניו זילנד": "🇳🇿",
  "ניו-זילנד": "🇳🇿",
  "דרום אפריקה": "🇿🇦",
  "ג'מייקה": "🇯🇲",
  "בולגריה": "🇧🇬",
  "ונצואלה": "🇻🇪",
  "פרגוואי": "🇵🇾",
  "בוליביה": "🇧🇴",
  "פנמה": "🇵🇦",
  "הונדורס": "🇭🇳",
  "אל סלוודור": "🇸🇻",
  "עיראק": "🇮🇶",
  "סוריה": "🇸🇾",
  "ירדן": "🇯🇴",
  "לבנון": "🇱🇧",
  "איחוד האמירויות": "🇦🇪",
  "עומאן": "🇴🇲",
  "בחריין": "🇧🇭",
  "כווית": "🇰🇼",
  "תימן": "🇾🇪",
  "סין": "🇨🇳",
  "הודו": "🇮🇳",

  // --- English ---
  "argentina": "🇦🇷",
  "brazil": "🇧🇷",
  "france": "🇫🇷",
  "england": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "germany": "🇩🇪",
  "spain": "🇪🇸",
  "portugal": "🇵🇹",
  "italy": "🇮🇹",
  "netherlands": "🇳🇱",
  "belgium": "🇧🇪",
  "croatia": "🇭🇷",
  "uruguay": "🇺🇾",
  "usa": "🇺🇸",
  "united states": "🇺🇸",
  "mexico": "🇲🇽",
  "canada": "🇨🇦",
  "morocco": "🇲🇦",
  "japan": "🇯🇵",
  "south korea": "🇰🇷",
  "senegal": "🇸🇳",
  "cameroon": "🇨🇲",
  "ghana": "🇬🇭",
  "tunisia": "🇹🇳",
  "ecuador": "🇪🇨",
  "qatar": "🇶🇦",
  "saudi arabia": "🇸🇦",
  "iran": "🇮🇷",
  "australia": "🇦🇺",
  "denmark": "🇩🇰",
  "switzerland": "🇨🇭",
  "poland": "🇵🇱",
  "serbia": "🇷🇸",
  "wales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  "costa rica": "🇨🇷",
  "colombia": "🇨🇴",
  "peru": "🇵🇪",
  "chile": "🇨🇱",
  "sweden": "🇸🇪",
  "ukraine": "🇺🇦",
  "turkey": "🇹🇷",
  "egypt": "🇪🇬",
  "algeria": "🇩🇿",
  "nigeria": "🇳🇬",
  "ivory coast": "🇨🇮",
  "romania": "🇷🇴",
  "slovakia": "🇸🇰",
  "slovenia": "🇸🇮",
  "czechia": "🇨🇿",
  "czech republic": "🇨🇿",
  "hungary": "🇭🇺",
  "austria": "🇦🇹",
  "scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "greece": "🇬🇷",
  "finland": "🇫🇮",
  "norway": "🇳🇴",
  "haiti": "🇭🇹",
  "congo": "🇨🇩",
  "dr congo": "🇨🇩",
  "democratic republic of congo": "🇨🇩",
  "ireland": "🇮🇪",
  "russia": "🇷🇺",
  "israel": "🇮🇱",
  "georgia": "🇬🇪",
  "albania": "🇦🇱",
  "new zealand": "🇳🇿",
  "south africa": "🇿🇦",
  "jamaica": "🇯🇲",
  "bulgaria": "🇧🇬",
  "venezuela": "🇻🇪",
  "paraguay": "🇵🇾",
  "bolivia": "🇧🇴",
  "panama": "🇵🇦",
  "honduras": "🇭🇳",
  "el salvador": "🇸🇻",
};

/**
 * Returns a flag image URL (using flagcdn.com) based on the country/team name.
 * Extracts the 2-letter ISO code from the flag emoji under the hood.
 */
export function getTeamFlagUrl(teamName: string | undefined | null): string | null {
  if (!teamName) return null;
  const flagEmoji = getTeamFlag(teamName);
  if (!flagEmoji || flagEmoji === "⚽" || flagEmoji === "🅰️" || flagEmoji === "🅱️") {
    return null;
  }

  // Handle UK subdivisions specifically (England, Wales, Scotland)
  if (flagEmoji === "🏴󠁧󠁢󠁥󠁮󠁧󠁿") return "https://flagcdn.com/w160/gb-eng.png";
  if (flagEmoji === "🏴󠁧󠁢󠁷󠁬󠁳󠁿") return "https://flagcdn.com/w160/gb-wls.png";
  if (flagEmoji === "🏴󠁧󠁢󠁳󠁣󠁴󠁿") return "https://flagcdn.com/w160/gb-sct.png";

  // Decode Regional Indicator Symbols to standard ISO letters
  // Regional indicators are in range U+1F1E6 (127462) to U+1F1FF (127487)
  const codePoints = Array.from(flagEmoji).map(char => char.codePointAt(0));
  if (codePoints.length >= 2) {
    const cp0 = codePoints[0] || 0;
    const cp1 = codePoints[1] || 0;
    const isRegionalA = cp0 >= 127462 && cp0 <= 127487;
    const isRegionalB = cp1 >= 127462 && cp1 <= 127487;
    if (isRegionalA && isRegionalB) {
      const charA = String.fromCharCode(cp0 - 127397);
      const charB = String.fromCharCode(cp1 - 127397);
      const isoCode = (charA + charB).toLowerCase();
      return `https://flagcdn.com/w160/${isoCode}.png`;
    }
  }

  return null;
}

/**
 * Normalizes a country or team name for robust matching.
 * Cleans spaces, dashes, various quotes, and Hebrew punctuation markers.
 */
function normalizeCountryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/["'״׳′`\-\.]/g, "") // Remove single/double quotes, Hebrew geresh, backticks, dashes, dots
    .replace(/\s+/g, "");        // Strip all whitespace for uniform comparison
}

/**
 * Returns a flag emoji for a given team/country name.
 * Performs a smart case-insensitive substring search.
 */
export function getTeamFlag(teamName: string | undefined | null): string {
  if (!teamName) return "⚽";

  const searchClean = normalizeCountryName(teamName);

  // 1. Try an exact normalized match
  for (const [key, flag] of Object.entries(FLAG_MAP)) {
    if (normalizeCountryName(key) === searchClean) {
      return flag;
    }
  }

  // 2. Try substring matching with normalized terms
  for (const [key, flag] of Object.entries(FLAG_MAP)) {
    const keyClean = normalizeCountryName(key);
    if (searchClean.includes(keyClean) || keyClean.includes(searchClean)) {
      return flag;
    }
  }

  // 3. Fallbacks based on typical group names or generic text
  const lower = teamName.toLowerCase();
  if (lower.includes("קבוצה א") || lower.includes("team a")) return "🅰️";
  if (lower.includes("קבוצה ב") || lower.includes("team b")) return "🅱️";

  // Default soccer ball fallback
  return "⚽";
}

/**
 * Component to present a real country flag image with fallback to emoji.
 */
export function TeamFlag({ 
  teamName, 
  className = "w-10 h-6" 
}: { 
  teamName: string | undefined | null; 
  className?: string;
}) {
  const [error, setError] = useState(false);
  const url = getTeamFlagUrl(teamName);
  const flagEmoji = getTeamFlag(teamName);

  if (url && !error) {
    return (
      <img
        src={url}
        alt={teamName || "Flag"}
        referrerPolicy="no-referrer"
        className={`${className} object-cover rounded shadow-xxs border border-gray-200 select-none inline-block`}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <span className="text-2xl select-none" role="img" aria-label={teamName || "Flag"}>
      {flagEmoji}
    </span>
  );
}


