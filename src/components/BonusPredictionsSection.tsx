import React, { useState, useEffect } from "react";
import { useFirebase } from "./FirebaseProvider";
import { Award, Lock, Save, Sparkles, CheckCircle, HelpCircle } from "lucide-react";

export const BonusPredictionsSection: React.FC = () => {
  const { bonusPredictions, userProfile, saveBonusPrediction } = useFirebase();

  const [worldCupWinner, setWorldCupWinner] = useState("");
  const [runnerUp, setRunnerUp] = useState("");
  const [topScorer, setTopScorer] = useState("");
  const [surpriseTeam, setSurpriseTeam] = useState("");
  
  const [isLocked, setIsLocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // Find existing bonus prediction
  const userBonus = bonusPredictions.find((b) => b.couple_id === userProfile?.couple_id);

  useEffect(() => {
    if (userBonus) {
      setWorldCupWinner(userBonus.world_cup_winner || "");
      setRunnerUp(userBonus.runner_up || "");
      setTopScorer(userBonus.top_scorer || "");
      setSurpriseTeam(userBonus.surprise_team || "");
      setIsLocked(userBonus.locked || false);
    }
  }, [userBonus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!worldCupWinner.trim() || !runnerUp.trim() || !topScorer.trim() || !surpriseTeam.trim()) {
      setErrorMsg("חובה למלא את כל שדות הניחוש הבונוס כדי לשמור");
      return;
    }

    try {
      setSaving(true);
      await saveBonusPrediction(worldCupWinner, runnerUp, topScorer, surpriseTeam);
      setSuccessMsg("ניחוש הבונוס ארוך הטווח נשמר בהצלחה! ✓");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "נכשלה שמירת הניחושים");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="bonus-predictions-section-root" className="space-y-6 pb-20">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-emerald-500" />
          ניחושי בונוס ארוכי טווח
        </h2>
        <p className="text-sm text-gray-500">
          מלא את ניחושייך לגבי תוצאות סיום הטורניר. הניחושים הללו ינעלו לחלוטין עם תחילת המשחקים!
        </p>
      </div>

      {isLocked ? (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 text-rose-800 text-sm flex gap-3 items-start leading-relaxed">
          <Lock className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block text-rose-950 font-bold mb-1">ניחושים אלו נעולים כעת!</strong>
            מנהל הטורניר נעל את האפשרות לערוך ניחושים ארוכי טווח עקב תחילת המשחקים או הכניסה לשלבים המתקדמים. אין אפשרות לעשות שינויים.
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-amber-800 text-sm flex gap-3 items-start leading-relaxed">
          <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 animate-bounce" />
          <div>
            <strong className="block text-amber-950 font-bold mb-1">טיפ זהב לניחוש</strong>
            כל זוג חברים ממלא יחד גליון בונוס אחד המקנה נקודות יקרות ערך (עד ל-50 נקודות בונוס נפרדות!). בחרו את הניחוש שלכם בשיקול דעת משותף.
          </div>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-150 shadow-md p-6 max-w-2xl space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Champion Target */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block text-right">🏆 אלופת העולם החזויה</label>
            <input
              id="input-winner"
              type="text"
              placeholder="לדוגמה: ארגנטינה / ברזיל"
              value={worldCupWinner}
              onChange={(e) => setWorldCupWinner(e.target.value)}
              disabled={isLocked}
              className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-250 focus:border-emerald-500 focus:bg-white text-gray-800 font-medium rounded-xl outline-none transition-colors"
            />
            <span className="text-xxs text-gray-400 font-medium block">מזכה ב-15 נקודות בונוס</span>
          </div>

          {/* Runner Up Target */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block text-right">🥈 סגנית האלופה החזויה</label>
            <input
              id="input-runnerup"
              type="text"
              placeholder="לדוגמה: צרפת / אנגליה"
              value={runnerUp}
              onChange={(e) => setRunnerUp(e.target.value)}
              disabled={isLocked}
              className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-250 focus:border-emerald-500 focus:bg-white text-gray-800 font-medium rounded-xl outline-none transition-colors"
            />
            <span className="text-xxs text-gray-400 font-medium block">מזכה ב-10 נקודות בונוס</span>
          </div>

          {/* Top Scorer Target */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block text-right">⚽ מלך השערים (Golden Boot)</label>
            <input
              id="input-topscorer"
              type="text"
              placeholder="לדוגמה: אמבפה / ויניסיוס / הולאנד"
              value={topScorer}
              onChange={(e) => setTopScorer(e.target.value)}
              disabled={isLocked}
              className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-250 focus:border-emerald-500 focus:bg-white text-gray-800 font-medium rounded-xl outline-none transition-colors"
            />
            <span className="text-xxs text-gray-400 font-medium block">מזכה ב-10 נקודות בונוס</span>
          </div>

          {/* Surprise Team Target */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block text-right">✨ הפתעת הטורניר (דארק הורס)</label>
            <input
              id="input-surprise"
              type="text"
              placeholder="לדוגמה: ארצות הברית / קרואטיה / יפן"
              value={surpriseTeam}
              onChange={(e) => setSurpriseTeam(e.target.value)}
              disabled={isLocked}
              className="w-full text-sm px-4 py-3 bg-gray-50 border border-gray-250 focus:border-emerald-500 focus:bg-white text-gray-800 font-medium rounded-xl outline-none transition-colors"
            />
            <span className="text-xxs text-gray-400 font-medium block">מזכה ב-5 נקודות בונוס</span>
          </div>

        </div>

        {/* Action responses */}
        {errorMsg && (
          <div className="text-xs text-red-600 bg-red-50 p-3.5 rounded-xl border border-red-100 flex items-center gap-1.5 font-bold">
            <HelpCircle className="w-4.5 h-4.5" /> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="text-xs text-emerald-700 bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 flex items-center gap-1.5 font-bold animate-pulse">
            <CheckCircle className="w-4.5 h-4.5" /> {successMsg}
          </div>
        )}

        {/* Action Submit */}
        {!isLocked && (
          <button
            id="save-bonus-button"
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-xs transition-transform transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Save className="w-4.5 h-4.5" />
            {saving ? "שומר..." : "שמור ניחושי בונוס"}
          </button>
        )}
      </form>
    </div>
  );
};
