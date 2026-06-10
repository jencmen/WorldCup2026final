import { Match, Prediction, BonusPrediction, TournamentResults, Setting } from "../types";

/**
 * Calculate the points earned for a single match prediction
 */
export function calculateMatchPredictionPoints(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number,
  settings: Setting
): { points: number; reason: string } {
  // 1. Exact Match Score
  if (predHome === actualHome && predAway === actualAway) {
    return {
      points: settings.exact_score_points,
      reason: "תוצאה מדויקת! (7 נק')"
    };
  }

  // 2. Check Outcome (Winner / Draw)
  const predDiff = predHome - predAway;
  const actualDiff = actualHome - actualAway;

  const predOutcome = Math.sign(predDiff); // 1 = Home win, -1 = Away win, 0 = Draw
  const actualOutcome = Math.sign(actualDiff);

  if (predOutcome === actualOutcome) {
    // Correct Winner / Correct Draw
    const isDraw = predOutcome === 0;
    let pts = settings.correct_winner_points; // 3 pts
    let reasons = isDraw ? "תיקו נכון (3 נק')" : "מנצחת נכונה (3 נק')";

    // Check Goal Difference
    if (predDiff === actualDiff) {
      pts += settings.correct_goal_diff_points; // +2 pts = 5 pts total
      reasons = isDraw ? "תיקו נכון (5 נק')" : "תוצאה נכונה והפרש שערים נכון (5 נק')";
    }

    return {
      points: pts,
      reason: reasons
    };
  }

  // 3. No score matched
  return {
    points: 0,
    reason: "אין ניקוד"
  };
}

/**
 * Calculate points for long-term bonus predictions
 */
export function calculateBonusPoints(
  bonus: BonusPrediction,
  results: TournamentResults,
  settings: Setting
): { points: number; explanation: string[] } {
  let pts = 0;
  const explanation: string[] = [];

  // World Cup Winner
  if (results.actual_world_cup_winner && 
      results.actual_world_cup_winner.trim().toLowerCase() === bonus.world_cup_winner.trim().toLowerCase()) {
    pts += settings.world_cup_winner_points;
    explanation.push(`אלופה נכונה: ${bonus.world_cup_winner} (+${settings.world_cup_winner_points} נק')`);
  }

  // Runner up
  if (results.actual_runner_up && 
      results.actual_runner_up.trim().toLowerCase() === bonus.runner_up.trim().toLowerCase()) {
    pts += settings.runner_up_points;
    explanation.push(`סגנית נכונה: ${bonus.runner_up} (+${settings.runner_up_points} נק')`);
  }

  // Top scorer
  if (results.actual_top_scorer && 
      results.actual_top_scorer.trim().toLowerCase() === bonus.top_scorer.trim().toLowerCase()) {
    pts += settings.top_scorer_points;
    explanation.push(`מלך שערים נכון: ${bonus.top_scorer} (+${settings.top_scorer_points} נק')`);
  }

  // Surprise team
  if (results.actual_surprise_team && 
      results.actual_surprise_team.trim().toLowerCase() === bonus.surprise_team.trim().toLowerCase()) {
    pts += settings.surprise_team_points;
    explanation.push(`הפתעת הטורניר נכונה: ${bonus.surprise_team} (+${settings.surprise_team_points} נק')`);
  }

  return {
    points: pts,
    explanation
  };
}
