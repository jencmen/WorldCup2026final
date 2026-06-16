import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where 
} from "firebase/firestore";
import { db } from "./firebase";
import { calculateMatchPredictionPoints } from "./components/ScoreCalculation";
import { Match, Prediction, Setting } from "./types";

interface SyncReport {
  success: boolean;
  timestamp: string;
  message: string;
  matchesChecked: number;
  matchesUpdated: number;
  predictionsRecalculated: number;
  details: string[];
}

/**
 * Automatically fetches the latest finished match scores from the football-data.org API,
 * updates matching matches in Firestore, and recalculates corresponding user predictions.
 */
export async function runSyncAgent(forceRecalculateAll = false): Promise<SyncReport> {
  const timestamp = new Date().toISOString();
  const report: SyncReport = {
    success: false,
    timestamp,
    message: "",
    matchesChecked: 0,
    matchesUpdated: 0,
    predictionsRecalculated: 0,
    details: [],
  };

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    report.message = "כרטיס ה-API של Football-Data.org לא מוגדר בשרת (FOOTBALL_DATA_API_KEY).";
    console.warn(`[Sync Agent] ${report.message}`);
    return report;
  }

  try {
    // 1. Fetch competition matches from API (default "WC" for World Cup 2026, or CLI / Environment config)
    const competition = process.env.FOOTBALL_COMPETITION_CODE || "WC";
    const apiUrl = `https://api.football-data.org/v4/competitions/${competition}/matches`;
    
    console.log(`[Sync Agent] Fetching matches from API: ${apiUrl}`);
    const apiResponse = await fetch(apiUrl, {
      headers: { "X-Auth-Token": apiKey },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(` football-data.org API returned status ${apiResponse.status}: ${errorText}`);
    }

    const apiData = await apiResponse.json() as { matches?: any[] };
    if (!apiData || !apiData.matches || apiData.matches.length === 0) {
      report.success = true;
      report.message = "סנכרון הושלם. לא התקבלו משחקים מה-API החיצוני.";
      return report;
    }

    const apiMatches = apiData.matches;
    console.log(`[Sync Agent] Loaded ${apiMatches.length} matches from football-data.org`);

    // 2. Fetch all matches from Firestore
    const matchesCol = collection(db, "matches");
    const matchesSnapshot = await getDocs(matchesCol);
    const dbMatches: Match[] = [];
    matchesSnapshot.forEach((docSnap) => {
      dbMatches.push(docSnap.data() as Match);
    });

    // 3. Fetch default settings (points config)
    const settingsCol = collection(db, "settings");
    const settingsSnapshot = await getDocs(settingsCol);
    let settings: Setting = {
      setting_id: "default",
      correct_winner_points: 3,
      correct_goal_diff_points: 2,
      exact_score_points: 7,
      world_cup_winner_points: 15,
      runner_up_points: 10,
      top_scorer_points: 10,
      surprise_team_points: 5,
    };
    settingsSnapshot.forEach((docSnap) => {
      if (docSnap.id === "default") {
        settings = docSnap.data() as Setting;
      }
    });

    // 4. Fetch all predictions to be ready for recalculation
    const predsCol = collection(db, "predictions");
    const predsSnapshot = await getDocs(predsCol);
    const allPredictions: Prediction[] = [];
    predsSnapshot.forEach((docSnap) => {
      allPredictions.push(docSnap.data() as Prediction);
    });

    console.log(`[Sync Agent] Loaded ${dbMatches.length} app matches and ${allPredictions.length} predictions from DB`);

    // Loop through each app match that has an api_match_id
    for (const dbMatch of dbMatches) {
      if (!dbMatch.api_match_id) {
        continue;
      }

      report.matchesChecked++;

      // Find counterpart in API matches
      // Note api_match_id might be stored as string or number in Firestore, normalize comparison
      const apiMatch = apiMatches.find(
        (m: any) => String(m.id) === String(dbMatch.api_match_id)
      );

      if (!apiMatch) {
        continue;
      }

      // We only care about updating scores for matches that are finished (FINISHED)
      // or we can sync live ones if they are in progress, but points are only finalized forFINISHED.
      const isApiFinished = apiMatch.status === "FINISHED";
      const apiHomeGoals = apiMatch.score?.fullTime?.home;
      const apiAwayGoals = apiMatch.score?.fullTime?.away;

      const scoreExistsInApi = apiHomeGoals !== undefined && apiHomeGoals !== null &&
                               apiAwayGoals !== undefined && apiAwayGoals !== null;

      if (isApiFinished && scoreExistsInApi) {
        // If there's a difference in score or status
        const isDbStatusFinished = dbMatch.match_status === "finished";
        const isDbGoalsEqual = dbMatch.actual_team_a_goals === apiHomeGoals &&
                              dbMatch.actual_team_b_goals === apiAwayGoals;

        if (!isDbStatusFinished || !isDbGoalsEqual || forceRecalculateAll) {
          console.log(`[Sync Agent] Updating match ${dbMatch.match_id} (${dbMatch.team_a} vs ${dbMatch.team_b})`);
          
          // A. Update match in Firestore
          const matchRef = doc(db, "matches", dbMatch.match_id);
          await updateDoc(matchRef, {
            actual_team_a_goals: apiHomeGoals,
            actual_team_b_goals: apiAwayGoals,
            match_status: "finished",
            result_updated_at: new Date(),
            result_updated_by: "System Score Sync Agent"
          });

          dbMatch.actual_team_a_goals = apiHomeGoals;
          dbMatch.actual_team_b_goals = apiAwayGoals;
          dbMatch.match_status = "finished";

          report.matchesUpdated++;
          report.details.push(
            `עודכן משחק ${dbMatch.match_id}: ${dbMatch.team_a} vs ${dbMatch.team_b} -> תוצאה ${apiHomeGoals}-${apiAwayGoals}`
          );

          // B. Recalculate predictions for this match
          const matchPredictions = allPredictions.filter(p => p.match_id === dbMatch.match_id);
          for (const pred of matchPredictions) {
            const calc = calculateMatchPredictionPoints(
              pred.home_goals,
              pred.away_goals,
              apiHomeGoals,
              apiAwayGoals,
              settings
            );

            if (pred.points !== calc.points || pred.score_reason !== calc.reason || forceRecalculateAll) {
              const predRef = doc(db, "predictions", pred.prediction_id);
              await updateDoc(predRef, {
                points: calc.points,
                score_reason: calc.reason,
                calculated_at: new Date()
              });
              report.predictionsRecalculated++;
            }
          }
        }
      }
    }

    report.success = true;
    report.message = `הסנכרון האוטומטי הושלם בהצלחה. נבדקו ${report.matchesChecked} משחקים ממופים, עודכנו ${report.matchesUpdated} תוצאות, חושבו מחדש ${report.predictionsRecalculated} ניחושים.`;
    console.log(`[Sync Agent] ${report.message}`);
    
  } catch (error: any) {
    report.success = false;
    report.message = `שגיאה בתהליך הסנכרון: ${error.message || error}`;
    report.details.push(`Error payload: ${JSON.stringify(error)}`);
    console.error(`[Sync Agent] Fatal Failure:`, error);
  }

  return report;
}
