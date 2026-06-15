import { Request, Response } from "express";

// Comprehensive mapping between English team names/TLA codes of football-data.org API and Hebrew names in the app database
export const TEAM_NAMES_MAP: Record<string, string> = {
  // World Cup 2026 Host Nations
  "Canada": "קנדה",
  "CAN": "קנדה",
  "United States": "ארצות הברית",
  "USA": "ארה\"ב",
  "US": "ארה\"ב",
  "United States of America": "ארצות הברית",
  "Mexico": "מקסיקו",
  "MEX": "מקסיקו",

  // South America (CONMEBOL)
  "Argentina": "ארגנטינה",
  "ARG": "ארגנטינה",
  "Brazil": "ברזיל",
  "BRA": "ברזיל",
  "Uruguay": "אורוגוואי",
  "URU": "אורוגוואי",
  "Colombia": "קולומביה",
  "COL": "קולומביה",
  "Ecuador": "אקוודור",
  "ECU": "אקוודור",
  "Paraguay": "פרגוואי",
  "PAR": "פרגוואי",
  "Chile": "צ'ילה",
  "CHI": "צ'ילה",
  "Peru": "פרו",
  "PER": "פרו",
  "Venezuela": "ונצואלה",
  "VEN": "ונצואלה",
  "Bolivia": "בוליביה",
  "BOL": "בוליביה",

  // Europe (UEFA)
  "France": "צרפת",
  "FRA": "צרפת",
  "England": "אנגליה",
  "ENG": "אנגליה",
  "Germany": "גרמניה",
  "GER": "גרמניה",
  "Spain": "ספרד",
  "ESP": "ספרד",
  "Portugal": "פורטוגל",
  "POR": "פורטוגל",
  "Netherlands": "הולנד",
  "NED": "הולנד",
  "Italy": "איטליה",
  "ITA": "איטליה",
  "Belgium": "בלגיה",
  "BEL": "בלגיה",
  "Croatia": "קרואטיה",
  "CRO": "קרואטיה",
  "Switzerland": "שוויץ",
  "SUI": "שוויץ",
  "Denmark": "דנמרק",
  "DEN": "דנמרק",
  "Sweden": "שוודיה",
  "SWE": "שוודיה",
  "Ukraine": "אוקראינה",
  "UKR": "אוקראינה",
  "Poland": "פולין",
  "POL": "פולין",
  "Austria": "אוסטריה",
  "AUT": "אוסטריה",
  "Turkey": "טורקיה",
  "Türkiye": "טורקיה",
  "TUR": "טורקיה",
  "Scotland": "סקוטלנד",
  "SCO": "סקוטלנד",
  "Wales": "ויילס",
  "WAL": "ויילס",
  "Czechia": "צ'כיה",
  "Czech Republic": "צ'כיה",
  "CZE": "צ'כיה",
  "Slovakia": "סלובקיה",
  "SVK": "סלובקיה",
  "Slovenia": "סלובניה",
  "SVN": "סלובניה",
  "Romania": "רומניה",
  "ROU": "רומניה",
  "Hungary": "הונגריה",
  "HUN": "הונגריה",
  "Serbia": "סרביה",
  "SRB": "סרביה",
  "Georgia": "גאורגיה",
  "GEO": "גאורגיה",
  "Greece": "יוון",
  "GRE": "יוון",
  "Albania": "אלבניה",
  "ALB": "אלבניה",
  "Ireland": "אירלנד",
  "Republic of Ireland": "אירלנד",
  "IRL": "אירלנד",
  "Bosnia and Herzegovina": "בוסניה והרצגובינה",
  "BIH": "בוסניה והרצגובינה",

  // Africa (CAF)
  "Morocco": "מרוקו",
  "MAR": "מרוקו",
  "Senegal": "סנגל",
  "SEN": "סנגל",
  "Egypt": "מצרים",
  "EGY": "מצרים",
  "Nigeria": "ניגריה",
  "NGA": "ניגריה",
  "Cameroon": "קמרון",
  "CMR": "קמרון",
  "Ghana": "גאנה",
  "GHA": "גאנה",
  "Tunisia": "טוניס",
  "TUN": "טוניס",
  "Algeria": "אלג'יריה",
  "ALG": "אלג'יריה",
  "South Africa": "דרום אפריקה",
  "RSA": "דרום אפריקה",
  "Ivory Coast": "חוף השנהב",
  "Côte d'Ivoire": "חוף השנהב",
  "CIV": "חוף השנהב",
  "Mali": "מאלי",
  "MLI": "מאלי",
  "DR Congo": "הרפובליקה הדמוקרטית של קונגו",
  "COD": "הרפובליקה הדמוקרטית של קונגו",
  "Angola": "אנגולה",
  "ANG": "אנגולה",

  // Asia (AFC)
  "Japan": "יפן",
  "JPN": "יפן",
  "South Korea": "קוריאה הדרומית",
  "Korea Republic": "קוריאה הדרומית",
  "KOR": "קוריאה הדרומית",
  "North Korea": "קוריאה הצפונית",
  "Korea DPR": "קוריאה הצפונית",
  "PRK": "קוריאה הצפונית",
  "Saudi Arabia": "סעודיה",
  "KSA": "סעודיה",
  "Australia": "אוסטרליה",
  "AUS": "אוסטרליה",
  "Iran": "איראן",
  "IR Iran": "איראן",
  "IRN": "איראן",
  "Iraq": "עיראק",
  "IRQ": "עיראק",
  "Qatar": "קטר",
  "QAT": "קטר",
  "United Arab Emirates": "איחוד האמירויות",
  "UAE": "איחוד האמירויות",
  "Uzbekistan": "אוזבקיסטן",
  "UZB": "אוזבקיסטן",
  "Jordan": "ירדן",
  "JOR": "ירדן",

  // North America (CONCACAF)
  "Costa Rica": "קוסטה ריקה",
  "CRC": "קוסטה ריקה",
  "Panama": "פנמה",
  "PAN": "פנמה",
  "Honduras": "הונדורס",
  "HON": "הונדורס",
  "Jamaica": "ג'מייקה",
  "JAM": "ג'מייקה",
  "El Salvador": "אל סלבדור",
  "SLV": "אל סלבדור",
  "Canada_Home": "קנדה",
  "USA_Home": "ארצות הברית",

  // Oceania (OFC)
  "New Zealand": "ניו זילנד",
  "NZL": "ניו זילנד"
};

/**
 * Normalizes English names for fallback mapping matching
 */
export function translateTeamName(name: string): string {
  if (!name) return "";
  const trimmed = name.trim();
  
  // 1. Exact match in our exhaustive mapping
  if (TEAM_NAMES_MAP[trimmed]) {
    return TEAM_NAMES_MAP[trimmed];
  }
  
  // 2. TLA representation match
  const up = trimmed.toUpperCase();
  if (TEAM_NAMES_MAP[up]) {
    return TEAM_NAMES_MAP[up];
  }

  // 3. Fallback translations for generic spelling variations
  if (trimmed === "Republic of Korea" || trimmed === "Korea") return "קוריאה הדרומית";
  if (trimmed === "China PR") return "סין";
  if (trimmed === "Côte d'Ivoire") return "חוף השנהב";
  if (trimmed === "DR Congo" || trimmed === "Congo DR") return "הרפובליקה הדמוקרטית של קונגו";
  if (trimmed === "Czechia") return "צ'כיה";
  
  return trimmed; // If no translation, return original
}

/**
 * Handles security API proxy calls from client to football-data.org
 */
export async function handleFootballScores(req: Request, res: Response) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      success: false,
      configured: false,
      message: "מפתח ה-API של Football-Data.org לא מוגדר בשרת. אנא הגדר את המשתנה FOOTBALL_DATA_API_KEY במיכל.",
      matches: []
    });
  }

  // Competition WC is the default for World Cup
  const competition = req.query.competition || "WC";

  try {
    const apiUrl = `https://api.football-data.org/v4/competitions/${competition}/matches`;
    
    console.log(`Forwarding request to football-data.org API: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        "X-Auth-Token": apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`football-data.org returned error status ${response.status}:`, errorText);
      return res.status(200).json({
        success: false,
        configured: true,
        message: `שגיאה מול שרתי ה-API החיצוניים (${response.status})`,
        matches: []
      });
    }

    const data = await response.json() as any;
    
    if (!data || !data.matches) {
      return res.status(200).json({
        success: true,
        configured: true,
        matches: []
      });
    }

    // Process and normalize the response for our client application
    const mappedMatches = data.matches.map((apiMatch: any) => {
      const homeTeamOriginal = apiMatch.homeTeam?.name || "";
      const awayTeamOriginal = apiMatch.awayTeam?.name || "";
      const homeTla = apiMatch.homeTeam?.tla || "";
      const awayTla = apiMatch.awayTeam?.tla || "";

      // Translate home and away teams
      const homeTranslated = translateTeamName(homeTeamOriginal) || translateTeamName(homeTla);
      const awayTranslated = translateTeamName(awayTeamOriginal) || translateTeamName(awayTla);

      // Extract results
      const homeScore = apiMatch.score?.fullTime?.home;
      const awayScore = apiMatch.score?.fullTime?.away;

      return {
        id: apiMatch.id,
        status: apiMatch.status, // "FINISHED", "IN_PLAY", "PAUSED", "SCHEDULED", etc.
        utcDate: apiMatch.utcDate,
        stage: apiMatch.stage, // "GROUP_STAGE", etc.
        group: apiMatch.group,
        homeTeam: {
          id: apiMatch.homeTeam?.id,
          name: homeTeamOriginal,
          translatedName: homeTranslated,
          tla: homeTla,
        },
        awayTeam: {
          id: apiMatch.awayTeam?.id,
          name: awayTeamOriginal,
          translatedName: awayTranslated,
          tla: awayTla,
        },
        scores: {
          home: homeScore !== undefined ? homeScore : null,
          away: awayScore !== undefined ? awayScore : null,
        },
      };
    });

    return res.status(200).json({
      success: true,
      configured: true,
      matches: mappedMatches
    });
    
  } catch (error: any) {
    console.error("Failed to proxy football-scores API:", error);
    return res.status(200).json({
      success: false,
      configured: true,
      message: `סנכרון נכשלה בפעולת השרת: ${error.message || error}`,
      matches: []
    });
  }
}
