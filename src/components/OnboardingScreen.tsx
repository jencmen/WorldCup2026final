import React, { useState } from "react";
import { useFirebase } from "./FirebaseProvider";
import { Users, AlertCircle, LogOut } from "lucide-react";

export const OnboardingScreen: React.FC = () => {
  const { couples, registerUser, currentUser, logout } = useFirebase();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [coupleId, setCoupleId] = useState("");
  const [customNewCoupleName, setCustomNewCoupleName] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!displayName.trim()) {
      setErrorMsg("חובה להזין את השם המוצג שלך");
      return;
    }

    if (!coupleId) {
      setErrorMsg("עליך לבחור זוג קיים או להקים זוג חדש כדי להמשיך להשתתף בטורניר");
      return;
    }

    if (coupleId === "new_couple" && !customNewCoupleName.trim()) {
      setErrorMsg("אנא הזן את השם המשותף לזוג החדש שאתה מייסד");
      return;
    }

    try {
      setSaving(true);
      await registerUser(displayName, coupleId, customNewCoupleName);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "נכשלה ההרשמה למערכת. נסה שוב");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="onboarding-screen-root" className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-right">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-gray-150 p-8 space-y-6">
        
        {/* Brand visual header */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-emerald-50 rounded-2xl text-emerald-600 mb-3.5">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">כמעט שם! הגדרת חשבון משתתף</h2>
          <p className="mt-1.5 text-xs text-gray-400">
            שלום {currentUser?.displayName}, כדי להתחיל בניחושים עלינו לשייך אותך לזוג המשתתף בטורניר.
          </p>
        </div>

        {/* Input onboarding form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          
          {/* Display Name Spelles */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block text-right">שמך הפרטי / המוצג במערכת:</label>
            <input
              id="onboard-input-displayname"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="למשל: שלמי כהן"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-250 focus:border-emerald-500 focus:bg-white rounded-xl outline-none font-medium"
              required
            />
          </div>

          {/* Couple choosing mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block text-right">בחר את זוג החברים שאתה משתייך אליו:</label>
            <select
              id="onboard-select-couple"
              value={coupleId}
              onChange={(e) => setCoupleId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-250 focus:border-emerald-500 focus:bg-white rounded-xl outline-none font-medium cursor-pointer"
              required
            >
              <option value="">-- בחר אפשרות --</option>
              {couples.map((cp) => (
                <option key={cp.couple_id} value={cp.couple_id}>
                  שיוך לזוג קיים: {cp.couple_name}
                </option>
              ))}
              <option value="new_couple" className="text-emerald-700 font-bold">➕ הקם זוג חברים חדש איתי!</option>
            </select>
            <span className="text-xxs text-gray-400 leading-normal block font-medium">אם השותף שלך כבר נרשם, בחר בשמו מהרשימה לשיוך מהיר.</span>
          </div>

          {/* Conditional custom couple name input */}
          {coupleId === "new_couple" && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <label className="text-xs font-bold text-gray-700 block text-right">שם הזוג החדש שאתה מייסד במערכת:</label>
              <input
                id="onboard-input-customcouple"
                type="text"
                placeholder="לדוגמה: משפחת כהן / צמד השרדים"
                value={customNewCoupleName}
                onChange={(e) => setCustomNewCoupleName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-250 focus:border-emerald-500 focus:bg-white rounded-xl outline-none font-medium border-emerald-50"
                required
              />
            </div>
          )}

          {/* Error outputs */}
          {errorMsg && (
            <div className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4.5 h-4.5" />
              {errorMsg}
            </div>
          )}

          {/* Submits */}
          <button
            id="onboard-submit-button"
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            שלח וסיים הרשמה ⚽
          </button>
        </form>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 pt-4 flex items-center justify-center">
          <button
            onClick={logout}
            className="text-xs font-semibold text-gray-500 hover:text-red-500 flex items-center gap-1 cursor-pointer bg-transparent border-none"
          >
            <LogOut className="w-4 h-4" /> התנתק וחזור קודם
          </button>
        </div>

      </div>
    </div>
  );
};
