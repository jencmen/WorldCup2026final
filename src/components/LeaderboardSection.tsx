import React, { useState } from "react";
import { useFirebase } from "./FirebaseProvider";
import { Award, Trophy, ChevronDown, ChevronUp, Users, ShieldAlert, Sparkles } from "lucide-react";

export const LeaderboardSection: React.FC = () => {
  const { leaderboard, predictions, matches, bonusPredictions, settings, userProfile } = useFirebase();
  const [expandedCoupleId, setExpandedCoupleId] = useState<string | null>(null);

  const getMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const getCoupleMatchDetails = (coupleId: string) => {
    const couplePreds = predictions.filter((p) => p.couple_id === coupleId);
    return couplePreds.map((p) => {
      const game = matches.find((m) => m.match_id === p.match_id);
      return {
        prediction: p,
        match: game,
      };
    });
  };

  const getCoupleBonusDetail = (coupleId: string) => {
    return bonusPredictions.find((b) => b.couple_id === coupleId);
  };

  return (
    <div id="leaderboard-section-root" className="space-y-6 pb-20">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xl font-extrabold text-gray-900">טבלת הדירוג הכללית</h2>
        <p className="text-sm text-gray-500">
          הטבלה מתעדכנת בזמן אמת עם השלמת תוצאות המשחקים על ידי מנהל הטורניר.
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <ShieldAlert className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          אין זוגות משתתפים רשומים בטורניר עדיין.
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Main Table Container */}
          <div className="bg-white rounded-2xl border border-gray-150 shadow-md overflow-hidden">
            
            {/* Header row */}
            <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-bold text-gray-500 text-center border-b border-gray-100">
              <div className="col-span-2 sm:col-span-1 text-right">מקום</div>
              <div className="col-span-5 sm:col-span-4 text-right">זוג חברים</div>
              <div className="col-span-2 text-center">פגיעות מדויקות</div>
              <div className="hidden sm:block col-span-2 text-center">ניקוד משחקים</div>
              <div className="hidden sm:block col-span-2 text-center">ניקוד בונוסים</div>
              <div className="col-span-3 sm:col-span-1 text-left">סה״כ</div>
            </div>

            {/* Content rows */}
            <div className="divide-y divide-gray-100">
              {leaderboard.map((score, idx) => {
                const isExpanded = expandedCoupleId === score.couple_id;
                const isMyCouple = score.couple_id === userProfile?.couple_id;
                const coupleBonus = getCoupleBonusDetail(score.couple_id);
                const coupleMatches = getCoupleMatchDetails(score.couple_id);

                return (
                  <div 
                    key={score.couple_id}
                    id={`leaderboard-row-${score.couple_id}`}
                    className={`transition-colors ${isMyCouple ? "bg-emerald-50/20" : ""}`}
                  >
                    {/* Primary clicking area */}
                    <div
                      onClick={() => setExpandedCoupleId(isExpanded ? null : score.couple_id)}
                      className="grid grid-cols-12 px-4 py-4 text-sm items-center text-center cursor-pointer hover:bg-gray-50/70"
                    >
                      {/* position columns */}
                      <div className="col-span-2 sm:col-span-1 text-right font-mono font-bold flex items-center gap-1.5">
                        {getMedal(score.ranking) ? (
                          <span className="text-base">{getMedal(score.ranking)}</span>
                        ) : (
                          <span className="text-gray-400">{score.ranking}</span>
                        )}
                      </div>

                      {/* Name card column */}
                      <div className="col-span-5 sm:col-span-4 text-right flex items-center gap-2">
                        <div>
                          <span className="font-extrabold text-gray-900 block leading-tight">
                            {score.couple_name}
                            {isMyCouple && (
                              <span className="inline-block mr-1.5 px-1.5 py-0.5 rounded-full text-xxs font-semibold bg-emerald-100 text-emerald-800">
                                אתם
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Perfect Hits count column */}
                      <div className="col-span-2 text-center font-mono">
                        <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-bold border border-yellow-100">
                          🎯 {score.exactHitsCount}
                        </span>
                      </div>

                      {/* match prediction points */}
                      <div className="hidden sm:block col-span-2 text-center font-mono text-gray-500">
                        {score.predictionsPoints}
                      </div>

                      {/* bonus predictions points */}
                      <div className="hidden sm:block col-span-2 text-center font-mono text-gray-500">
                        {score.bonusPoints}
                      </div>

                      {/* Total sum positioning */}
                      <div className="col-span-3 sm:col-span-1 flex items-center justify-between text-left">
                        <span className="font-sans font-black text-emerald-600 text-base">
                          {score.totalPoints}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expandable Breakdown Drawer (המערכת מציגה לכולם את הניחושים של כולם) */}
                    {isExpanded && (
                      <div className="bg-gray-50/70 p-5 border-t border-b border-gray-100 space-y-5">
                        
                        {/* Title detail indicator */}
                        <h4 className="text-xs font-black text-gray-600 uppercase tracking-widest flex items-center gap-1 border-b border-gray-200 pb-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          פירוט ניחושי הטורניר של {score.couple_name}
                        </h4>

                        {/* Split detailed blocks */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Matches Breakdown */}
                          <div className="space-y-2">
                            <h5 className="text-xxs font-bold text-gray-400 flex items-center gap-1">
                              • ניחושי משחקים שננעלו
                            </h5>
                            
                            {coupleMatches.length > 0 ? (
                              <div className="space-y-2 max-h-56 overflow-y-auto bg-white p-3 rounded-xl border border-gray-150">
                                {coupleMatches.map(({ prediction, match }) => {
                                  if (!match) return null;
                                  
                                  // Verify if prediction is locked (prevent revealing currently active unlocked predictions)
                                  const now = new Date();
                                  const lock = match.prediction_lock_time?.seconds 
                                    ? new Date(match.prediction_lock_time.seconds * 1000) 
                                    : new Date(match.prediction_lock_time);
                                  
                                  const isSecuredLock = now >= lock;
                                  const finished = match.match_status === "finished";

                                  return (
                                    <div key={prediction.prediction_id} className="text-xxs flex items-center justify-between py-1.5 border-b border-gray-50 last:border-b-0">
                                      <div className="text-gray-600">
                                        <span className="font-bold block text-gray-800">{match.team_a} vs {match.team_b}</span>
                                        {finished ? (
                                          <span className="text-gray-400 block font-mono">תוצאת אמת: {match.actual_team_a_goals}-{match.actual_team_b_goals}</span>
                                        ) : (
                                          <span className="text-gray-400 block">טרם שוחק</span>
                                        )}
                                      </div>

                                      <div className="text-left">
                                        {isSecuredLock ? (
                                          <span className="font-mono bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-black">
                                            ניחש {prediction.home_goals} - {prediction.away_goals}
                                          </span>
                                        ) : (
                                          <span className="text-gray-400 italic">חסוי עד לנעילה</span>
                                        )}
                                        {finished && isSecuredLock && (
                                          <span className="block text-emerald-600 font-bold mt-0.5">
                                            +{prediction.points} נק' {prediction.points === settings.exact_score_points ? "🎯" : ""}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xxs text-gray-400 italic bg-white p-4 rounded-xl border border-gray-150 text-center">טרם הוזנו ניחושי משחקים קודמים</p>
                            )}
                          </div>

                          {/* Long term Bonus Breakdown */}
                          <div className="space-y-2">
                            <h5 className="text-xxs font-bold text-gray-400 flex items-center gap-1">
                              • ניחושים ארוכי טווח
                            </h5>

                            {coupleBonus ? (
                              <div className="bg-white p-4 rounded-xl border border-gray-150 space-y-3.5 text-xxs leading-relaxed">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-gray-400 block">אלופת עולם</span>
                                    <strong className="text-gray-800 text-xs block">{coupleBonus.world_cup_winner}</strong>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block">סגנית האלופה</span>
                                    <strong className="text-gray-800 text-xs block">{coupleBonus.runner_up}</strong>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block">מלך השערים</span>
                                    <strong className="text-gray-800 text-xs block">{coupleBonus.top_scorer}</strong>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block">הפתעת הטורניר</span>
                                    <strong className="text-gray-800 text-xs block">{coupleBonus.surprise_team}</strong>
                                  </div>
                                </div>

                                {coupleBonus.bonus_points > 0 && (
                                  <div className="mt-2 text-left border-t border-gray-50 pt-3">
                                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold">
                                      נקודות בונוס שהתקבלו: +{coupleBonus.bonus_points} נק'
                                    </span>
                                    {coupleBonus.bonus_reason && (
                                      <p className="text-xxs text-gray-400 italic mt-1.5 leading-normal">({coupleBonus.bonus_reason})</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-xxs text-gray-400 italic bg-white p-4 rounded-xl border border-gray-150 text-center">הזוג טרם מילא את ניחושיו ארוכי הטווח</p>
                            )}
                          </div>

                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
