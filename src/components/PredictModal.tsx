import React, { useState, useEffect } from "react";
import { Match, Prediction, parseFirestoreDate } from "../types";
import { useFirebase } from "./FirebaseProvider";
import { X, Save, MessageSquare, AlertCircle } from "lucide-react";
import { getTeamFlag, TeamFlag } from "./flags";

interface PredictModalProps {
  match: Match | null;
  onClose: () => void;
}

export const PredictModal: React.FC<PredictModalProps> = ({ match, onClose }) => {
  const { savePrediction, predictions, userProfile } = useFirebase();

  const [homeGoals, setHomeGoals] = useState<string>("");
  const [awayGoals, setAwayGoals] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (match && userProfile?.couple_id) {
      // Find existing prediction
      const existing = predictions.find(
        (p) => p.match_id === match.match_id && p.couple_id === userProfile.couple_id
      );

      if (existing) {
        setHomeGoals(String(existing.home_goals));
        setAwayGoals(String(existing.away_goals));
        setComment(existing.comment || "");
      } else {
        setHomeGoals("");
        setAwayGoals("");
        setComment("");
      }
      setErrorMsg("");
    }
  }, [match, predictions, userProfile]);

  if (!match) return null;

  const lockDt = parseFirestoreDate(match.prediction_lock_time);
  const isLocked = new Date() >= lockDt && !match.admin_unlocked && userProfile?.role !== "Admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setErrorMsg("");

    const homeNum = Number(homeGoals);
    const awayNum = Number(awayGoals);

    if (homeGoals.trim() === "" || awayGoals.trim() === "" || isNaN(homeNum) || isNaN(awayNum)) {
      setErrorMsg("חובה להזין מספר שערים תקין לשני הצדדים");
      return;
    }

    if (homeNum < 0 || awayNum < 0 || homeNum > 30 || awayNum > 30) {
      setErrorMsg("מספר השערים חייב להיות בין 0 ל-30");
      return;
    }

    try {
      setSaving(true);
      await savePrediction(match.match_id, homeNum, awayNum, comment);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "נכשלה שמירת הניחוש במערכת");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="predict-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md border border-gray-100 overflow-hidden transform transition-transform animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-emerald-600 text-white flex justify-between items-center text-right">
          <div>
            <span className="text-xxs uppercase tracking-wider font-mono text-emerald-100 block">
              {isLocked ? "צפייה בניחוש משחק (נעול)" : "הזנת ניחוש משחק"}
            </span>
            <h3 className="text-base font-extrabold tracking-tight flex items-center justify-end gap-2">
              <TeamFlag teamName={match.team_a} className="w-6 h-4 rounded-xs border border-emerald-400" />
              <span>{match.team_a}</span>
              <span className="text-emerald-200 text-xs font-normal px-0.5">נגד</span>
              <span>{match.team_b}</span>
              <TeamFlag teamName={match.team_b} className="w-6 h-4 rounded-xs border border-emerald-400" />
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-1.5 hover:bg-emerald-700/50 rounded-lg text-emerald-100 hover:text-white transition-colors cursor-pointer"
            aria-label="סגור חלונית"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="text-center text-xxs text-gray-400 font-sans">
            {match.group_name} {match.city ? `• ${match.city}` : ""} • {match.match_date}
          </div>

          {/* Goals Input Field Grid */}
          <div className="grid grid-cols-3 items-center justify-items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
            {/* Team A goals */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex flex-col items-center">
                <TeamFlag teamName={match.team_a} className="w-10 h-6 shadow-xxs rounded-xs mb-1" />
                <span className="text-xs font-bold text-gray-700">{match.team_a}</span>
              </div>
              <input
                id="modal-input-home"
                type="number"
                placeholder="0"
                min={0}
                max={30}
                value={homeGoals}
                onChange={(e) => setHomeGoals(e.target.value)}
                disabled={isLocked}
                className="w-16 h-16 text-center text-2xl font-black bg-white disabled:bg-gray-100 disabled:text-gray-400 border border-gray-200 focus:border-emerald-500 rounded-xl outline-none font-mono"
                required
              />
            </div>

            {/* Colons */}
            <span className="text-gray-400 font-black text-2xl">:</span>

            {/* Team B goals */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex flex-col items-center">
                <TeamFlag teamName={match.team_b} className="w-10 h-6 shadow-xxs rounded-xs mb-1" />
                <span className="text-xs font-bold text-gray-700">{match.team_b}</span>
              </div>
              <input
                id="modal-input-away"
                type="number"
                placeholder="0"
                min={0}
                max={30}
                value={awayGoals}
                onChange={(e) => setAwayGoals(e.target.value)}
                disabled={isLocked}
                className="w-16 h-16 text-center text-2xl font-black bg-white disabled:bg-gray-100 disabled:text-gray-400 border border-gray-200 focus:border-emerald-500 rounded-xl outline-none font-mono"
                required
              />
            </div>
          </div>

          {/* Social Comment/trash-talk */}
          <div className="space-y-1.5 text-right font-sans">
            <label className="text-xxs font-extrabold text-gray-500 block flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
              עקיצה או תגובה לחברים (אופציונלי):
            </label>
            <input
              id="modal-input-comment"
              type="text"
              placeholder={isLocked ? "אין הודעה" : "למשל: הפעם זה פגיעה בול! 😉"}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isLocked}
              className="w-full text-xs px-3.5 py-3.5 bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 border border-gray-200 focus:border-emerald-500 focus:bg-white text-gray-800 font-medium rounded-xl outline-none transition-colors"
            />
          </div>

          {/* Error messages feedback */}
          {errorMsg && (
            <div className="text-xxs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4.5 h-4.5" />
              {errorMsg}
            </div>
          )}

          {/* Actions CTA buttons */}
          {isLocked ? (
            <button
              id="modal-close-locked-button"
              type="button"
              onClick={onClose}
              className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-750 font-extrabold text-sm rounded-xl cursor-pointer shadow-sm flex items-center justify-center gap-2 border border-gray-250 transition-colors"
            >
              הניחושים למשחק זה ננעלו - סגור חלונית 🔒
            </button>
          ) : (
            <button
              id="modal-save-button"
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "שומר בעיצוב..." : "שמור ניחוש משחק"}
            </button>
          )}

        </form>
      </div>
    </div>
  );
};
