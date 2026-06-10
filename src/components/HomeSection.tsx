import React, { useState, useEffect } from "react";
import { useFirebase } from "./FirebaseProvider";
import { Match, Prediction, Couple, getMatchKickoffDate, parseFirestoreDate } from "../types";
import { Calendar, Clock, Trophy, ChevronRight, CheckCircle, HelpCircle } from "lucide-react";
import { getTeamFlag, TeamFlag } from "./flags";
import { SystemLogo } from "./SystemLogo";

interface HomeSectionProps {
  onNavigate: (tabId: string) => void;
  onOpenPredictModal: (match: Match) => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({ onNavigate, onOpenPredictModal }) => {
  const { matches, predictions, leaderboard, userProfile, couples } = useFirebase();
  const [upcomingMatch, setUpcomingMatch] = useState<Match | null>(null);
  const [openMatches, setOpenMatches] = useState<Match[]>([]);
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    const nowLog = new Date();
    
    // Find open matches sorted by lock time desc
    const open = matches.filter(m => {
      const lockDt = parseFirestoreDate(m.prediction_lock_time);
      return m.match_status === "scheduled" && (lockDt > nowLog || m.admin_unlocked);
    });

    setOpenMatches(open);

    // Always show the absolute next scheduled match in the tournament as the showcased upcoming match
    const sched = matches.filter(m => m.match_status === "scheduled");
    if (sched.length > 0) {
      setUpcomingMatch(sched[0]);
    } else {
      setUpcomingMatch(null);
    }
  }, [matches]);

  // Real-time Countdown timer for upcoming match prediction lock time
  useEffect(() => {
    if (!upcomingMatch) {
      setCountdown("");
      return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      const lockDate = parseFirestoreDate(upcomingMatch.prediction_lock_time);

      const diff = lockDate.getTime() - now.getTime();

      if (diff <= 0) {
        if (upcomingMatch.admin_unlocked) {
          setCountdown("פתוח מחדש ע״י מנהל המערכת! 🔓");
        } else {
          setCountdown("ההרשמה למשחק ננעלה ⏰");
          clearInterval(timer);
        }
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let str = "";
        if (days > 0) str += `${days} ימים, `;
        str += `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        setCountdown(str);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [upcomingMatch]);

  const userCoupleId = userProfile?.couple_id;

  // Helper to check if a match prediction is locked for normal users
  const isLocked = (match: Match) => {
    const now = new Date();
    const lockDt = parseFirestoreDate(match.prediction_lock_time);
    return now >= lockDt && !match.admin_unlocked;
  };

  // Helper to check if current couple predicted a match
  const hasPredicted = (matchId: string) => {
    if (!userCoupleId) return false;
    return predictions.some(p => p.match_id === matchId && p.couple_id === userCoupleId);
  };

  const getMyPredictionString = (matchId: string) => {
    const pred = predictions.find(p => p.match_id === matchId && p.couple_id === userCoupleId);
    return pred ? `${pred.home_goals} - ${pred.away_goals}` : "טרם ניחשת";
  };

  // Prevent duplication of the main featured match in the smaller pending tasks list below
  const openMatchesForQuickList = openMatches.filter(om => om.match_id !== upcomingMatch?.match_id);

  return (
    <div className="space-y-8 pb-20">
      {/* Intro Hero Area */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -bottom-10 -left-10 sm:-left-6 w-52 h-52 opacity-15 pointer-events-none select-none">
          <SystemLogo />
        </div>
        <div className="relative z-10 max-w-xl">
          <span className="bg-emerald-500/30 text-emerald-100 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/20">
            מונדיאל 2026 בקנדה, ארה"ב ומקסיקו
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-4 tracking-tight leading-tight">
            היי {userProfile?.display_name || "אורח"}, ברוך הבא לליגת הניחושים של החברים!
          </h2>
          <p className="mt-2 text-emerald-100 text-sm leading-relaxed">
            שלב הצגת הניחושים של כולם מתחיל בדיוק 5 דקות לפני שריקת הפתיחה של כל משחק. בואו נראה מי הזוג שייקח את המקום הראשון הטורניר!
          </p>
        </div>
      </div>

      {/* Grid of Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Widget 1: Next Match Showcase */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            המשחק הבא בטורניר
          </h3>

          {upcomingMatch ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 relative overflow-hidden">
              {isLocked(upcomingMatch) && userProfile?.role !== "Admin" ? (
                <div className="absolute top-4 right-4 bg-rose-50 text-rose-700 text-xs px-3 py-1 rounded-full font-mono flex items-center gap-1.5 border border-rose-100 font-sans font-bold">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                  סטטוס: נעול לניחושים 🔒
                </div>
              ) : (
                <div className="absolute top-4 right-4 bg-amber-50 text-amber-700 text-xs px-3 py-1 rounded-full font-mono flex items-center gap-1.5 border border-amber-100">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                  נעילה בעוד: {countdown || "בחישוב..."}
                </div>
              )}

              <div className="mt-4 text-center text-xs text-gray-400 font-medium">
                {upcomingMatch.group_name} {upcomingMatch.city ? `• ${upcomingMatch.city}` : ""}
              </div>

              {/* Scorecard visual */}
              <div className="grid grid-cols-3 items-center my-6">
                {/* Team A */}
                <div className="flex flex-col items-center justify-center text-center">
                  <TeamFlag teamName={upcomingMatch.team_a} className="w-14 h-9 shadow-sm rounded-md mb-2" />
                  <span className="text-sm font-bold text-gray-900">{upcomingMatch.team_a}</span>
                </div>

                {/* VS Indicator */}
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xxs font-mono font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    נגד
                  </span>
                  <span className="text-xs text-gray-400 mt-2 font-mono">
                    {upcomingMatch.match_date} - {upcomingMatch.match_time}
                  </span>
                </div>

                {/* Team B */}
                <div className="flex flex-col items-center justify-center text-center">
                  <TeamFlag teamName={upcomingMatch.team_b} className="w-14 h-9 shadow-sm rounded-md mb-2" />
                  <span className="text-sm font-bold text-gray-900">{upcomingMatch.team_b}</span>
                </div>
              </div>

              {/* User/Couple Prediction Area */}
              <div className="mt-6 border-t border-gray-50 pt-5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block font-medium">הניחוש שלכם</span>
                  <span className={`text-sm font-bold ${hasPredicted(upcomingMatch.match_id) ? "text-emerald-600" : "text-gray-400"}`}>
                    {getMyPredictionString(upcomingMatch.match_id)}
                  </span>
                </div>

                <button
                  id={`predict-btn-home-${upcomingMatch.match_id}`}
                  onClick={() => onOpenPredictModal(upcomingMatch)}
                  className={`px-5 py-2.5 font-bold text-sm rounded-xl cursor-pointer shadow-xs transition-all transform active:scale-95 flex items-center gap-2 ${
                    isLocked(upcomingMatch) && userProfile?.role !== "Admin"
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-250"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  {isLocked(upcomingMatch) && userProfile?.role !== "Admin" ? (
                    hasPredicted(upcomingMatch.match_id) ? "צפה בניחוש שלך 👁️" : "הניחושים ננעלו 🔒"
                  ) : (
                    hasPredicted(upcomingMatch.match_id) ? "עדכן ניחוש" : "נחש עכשיו"
                  )}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 shadow-sm">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              אין משחקים פתוחים כרגע. בדוק את לוח המשחקים באשף המלא!
            </div>
          )}

          {/* Quick List of open predictions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h4 className="text-sm font-bold text-gray-700 flex items-center gap-1.5 border-b border-gray-50 pb-3">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
              משימות ממתינות: משחקים פתוחים לניחוש
            </h4>

            {openMatchesForQuickList.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {openMatchesForQuickList.slice(0, 3).map(om => (
                  <div key={om.match_id} className="py-3 flex items-center justify-between text-sm last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400">{om.match_time}</span>
                      <span className="font-semibold text-gray-700 flex items-center gap-2">
                        <TeamFlag teamName={om.team_a} className="w-6 h-4 rounded-sm border border-gray-100" />
                        <span>{om.team_a}</span>
                        <span className="text-gray-400 text-xs font-normal">נגד</span>
                        <span>{om.team_b}</span>
                        <TeamFlag teamName={om.team_b} className="w-6 h-4 rounded-sm border border-gray-100" />
                      </span>
                      <span className="text-xxs px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 font-sans">{om.group_name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xxs font-medium ${hasPredicted(om.match_id) ? "text-emerald-600" : "text-amber-500"}`}>
                        {hasPredicted(om.match_id) ? "ניחשת! ✓" : "ממתין לניחוש ⚠"}
                      </span>
                      <button
                        id={`predict-btn-list-${om.match_id}`}
                        onClick={() => onOpenPredictModal(om)}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                      >
                        שלח
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center">אין משחקים פתוחים נוספים להזרמה מהירה</p>
            )}
          </div>
        </div>

        {/* Widget 2: Leaderboard Overview */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            טבלת הדירוג הכללית
          </h3>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 space-y-4">
            {leaderboard.length > 0 ? (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {leaderboard.map((score, index) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const isMyCouple = score.couple_id === userCoupleId;
                  return (
                    <div
                      key={score.couple_id}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        isMyCouple
                          ? "bg-emerald-50/40 border-emerald-200"
                          : index === 0
                            ? "bg-amber-50/50 border-amber-100"
                            : "bg-gray-50/50 border-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-mono font-black text-gray-500 w-6 text-center select-none flex items-center justify-center">
                          {medals[index] || `#${index + 1}`}
                        </span>
                        <div>
                          <span className="font-extrabold text-gray-900 block text-xs sm:text-sm">
                            {score.couple_name}
                            {isMyCouple && (
                              <span className="inline-block mr-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                אתם
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                            בדירוג: {score.exactHitsCount} פגיעות מדויקות
                          </span>
                        </div>
                      </div>

                      <div className="text-left font-mono">
                        <span className="text-base font-black text-emerald-600 block">{score.totalPoints}</span>
                        <span className="text-[9px] text-gray-450 block font-sans">נקודות</span>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => onNavigate("leaderboard")}
                  className="w-full text-center py-2.5 justify-center flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer border border-dashed border-emerald-200 mt-2"
                >
                  לפירוט הניקוד המלא באשף הדירוג
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-400 text-xs py-8">
                <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                הטבלה הכללית תתעדכן ברגע שייקבעו תוצאות משחקי המונדיאל
              </div>
            )}
          </div>

          {/* Quick guide points details */}
          <div className="bg-emerald-50/40 rounded-2xl border border-emerald-100/30 p-5 text-emerald-800 text-xs space-y-3.5">
            <h4 className="font-bold">תזכורת חוקי נקודות:</h4>
            <ul className="space-y-1.5 list-disc list-inside text-emerald-700/90 leading-tight">
              <li>תוצאה מדויקת לחלוטין: <strong>7 נק'</strong></li>
              <li>מנצחת או תיקו שלם נכון: <strong>3 נק'</strong></li>
              <li>בונוס על הפרש שערים נכון: <strong>+2 נק'</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
