/**
 * Types representing the database schema for World Cup Predictions 2026 (מונדיאל החברים 2026)
 */

export interface User {
  user_id: string; // Google UID
  email: string;
  display_name: string;
  couple_id: string; // Foreign key referencing Couples
  role: "Admin" | "Participant";
  active: boolean;
  created_at: any; // Firestore Timestamp
}

export interface Couple {
  couple_id: string;
  couple_name: string;
  avatar?: string;
  active: boolean;
  created_at: any; // Firestore Timestamp
}

export interface Match {
  match_id: string;
  match_date: string; // textual DD/MM/YYYY
  match_time?: string; // textual HH:MM
  group_name: string; // Group A, Quarter-finals, etc.
  team_a: string;
  team_b: string;
  city?: string;
  broadcast_channel?: string;
  prediction_lock_time: any; // Firestore Timestamp (usually kickoff minus 5 mins)
  actual_team_a_goals?: number | null;
  actual_team_b_goals?: number | null;
  match_status: "scheduled" | "finished";
  api_match_id?: number | string | null;
  result_updated_at?: any;
  result_updated_by?: string;
  admin_unlocked?: boolean;
}

export interface Prediction {
  prediction_id: string; // couple_id + '_' + match_id
  match_id: string;
  couple_id: string;
  home_goals: number;
  away_goals: number;
  comment?: string;
  points: number; // calculated rating points
  score_reason?: string; // string explanation
  updated_by: string; // User UID
  updated_at: any; // Firestore Timestamp
  calculated_at?: any; // Firestore Timestamp
}

export interface BonusPrediction {
  bonus_prediction_id: string; // couple_id
  couple_id: string;
  world_cup_winner: string; // predicted winner team name
  runner_up: string; // predicted runner up team name
  top_scorer: string; // predicted top scorer player
  surprise_team: string; // predicted surprise team
  bonus_points: number;
  bonus_reason?: string;
  locked: boolean;
  submitted_at: any; // Firestore Timestamp
  calculated_at?: any; // Firestore Timestamp
}

export interface TournamentResults {
  tournament_result_id: string; // standard e.g. "results"
  actual_world_cup_winner?: string;
  actual_runner_up?: string;
  actual_top_scorer?: string;
  actual_surprise_team?: string;
  updated_by?: string;
  updated_at?: any;
}

export interface Setting {
  setting_id: string; // standard e.g. "default"
  correct_winner_points: number; // default: 3
  correct_goal_diff_points: number; // default: 2
  exact_score_points: number; // default: 7
  world_cup_winner_points: number; // default: 15
  runner_up_points: number; // default: 10
  top_scorer_points: number; // default: 10
  surprise_team_points: number; // default: 5
  updated_at?: any;
  updated_by?: string;
}

export interface CoupleScore {
  couple_id: string;
  couple_name: string;
  predictionsPoints: number;
  bonusPoints: number;
  totalPoints: number;
  exactHitsCount: number;
  ranking: number;
}

/**
 * Robust date parser for firestore Timestamps, serializable strings or Dates
 */
export function parseFirestoreDate(field: any): Date {
  if (!field) return new Date();
  if (typeof field.toDate === "function") {
    try {
      return field.toDate();
    } catch (e) {
      // Fallback
    }
  }
  if (field.seconds !== undefined) {
    return new Date(Number(field.seconds) * 1000);
  }
  if (field instanceof Date) {
    return isNaN(field.getTime()) ? new Date() : field;
  }
  if (typeof field === "object" && field !== null) {
    // Check if it looks like a timestamp object e.g. { seconds: ..., nanoseconds: ... }
    const sec = field.seconds ?? field._seconds;
    if (sec !== undefined) {
      return new Date(Number(sec) * 1000);
    }
  }
  const parsed = new Date(field);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Returns a robust Date object for a match's kickoff based directly on human-readable match_date and match_time
 */
export function getMatchKickoffDate(match: any): Date {
  if (!match) return new Date();
  if (!match.match_date) {
    return parseFirestoreDate(match.prediction_lock_time);
  }
  
  try {
    const parts = match.match_date.split(/[/.-]/).map((p: string) => p.trim());
    if (parts.length >= 2) {
      let day = 11;
      let month = 6;
      let year = 2026;

      if (parts[0] && parts[0].length === 4) {
        year = Number(parts[0]);
        month = Number(parts[1]);
        day = Number(parts[2]);
      } else if (parts[2] && parts[2].length === 4) {
        day = Number(parts[0]);
        month = Number(parts[1]);
        year = Number(parts[2]);
      } else {
        day = Number(parts[0] || 11);
        month = Number(parts[1] || 6);
        year = Number(parts[2] || 2026);
      }

      const [hourStr, minuteStr] = (match.match_time || "20:00").split(":");
      const hour = Number(hourStr || 20);
      const minute = Number(minuteStr || 0);

      const d = new Date(year, month - 1, day, hour, minute);
      if (!isNaN(d.getTime())) {
        return d;
      }
    }
  } catch (e) {
    // Fall back to prediction_lock_time
  }

  return parseFirestoreDate(match.prediction_lock_time);
}


