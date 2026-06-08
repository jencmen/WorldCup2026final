import React from "react";
import { useFirebase } from "./FirebaseProvider";
import { Award, ShieldCheck, Sparkles, HelpCircle, AlertTriangle, ExternalLink, X } from "lucide-react";

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, loading, authError, clearAuthError } = useFirebase();
  const currentHostname = typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <div id="login-screen-root" className="min-h-screen bg-gray-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 text-right font-sans">
      
      {/* Outer Spacer */}
      <div />

      {/* Login Center Card */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-150 p-8 space-y-8 mx-auto">
        
        {/* Brand visual header */}
        <div className="text-center">
          <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-4 shadow-xxs">
            <span className="text-4xl">⚽</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">מונדיאל החברים 2026</h2>
          <p className="mt-2 text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
            משחק הניחושים הידידותי והמשפחתי לטורניר אליפות העולם בקנדה, ארה"ב ומקסיקו.
          </p>
        </div>

        {/* Informative Value Proposition Icons */}
        <div className="space-y-4 text-xs font-semibold text-gray-700 max-w-xs mx-auto">
          <div className="flex items-start gap-3">
            <div className="text-emerald-500 mt-0.5">
              <Award className="w-4.5 h-4.5" />
            </div>
            <p className="leading-normal">
              <strong>ניחוש תוצאות משחקים:</strong> נחש את התוצאות המדויקות של משחקי המונדיאל וצבור נקודות ככל שהתוצאה קרובה יותר.
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="text-emerald-500 mt-0.5">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <p className="leading-normal">
              <strong>תחרות זוגית ספורטיבית:</strong> הזמן חברים והתמודדו כצמדים על הדירוג הגבוה ביותר בטבלה השבועית והכללית.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-emerald-500 mt-0.5">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <p className="leading-normal">
              <strong>ניחוש ארוך טווח:</strong> נסו לחזות מי תהיה אלופת העולם הגדולה, סגניתה, מלך השערים והפתעת הטורניר.
            </p>
          </div>
        </div>

        {authError && (
          <div className="bg-rose-50 text-rose-950 p-5 rounded-2xl border border-rose-200 text-xs space-y-3.5 relative shadow-sm">
            <button 
              onClick={clearAuthError}
              type="button"
              className="absolute top-3 left-3 text-rose-400 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
              title="סגור"
            >
              <X className="w-4 h-4" />
            </button>
            
            {authError === "auth/unauthorized-domain" ? (
              <div className="space-y-3 font-sans leading-relaxed text-right">
                <div className="flex items-center gap-2 font-extrabold text-rose-750">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 animate-pulse" />
                  <span className="text-sm">עדכון הגדרות החיבור (Firebase Auth)</span>
                </div>
                
                <p className="text-xxs text-gray-700">
                  נראה שהאפליקציה פועלת בדומיין ציבורי/משותף חדש אשר דורש אישור מול Firebase.
                </p>
                
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-2.5">
                  <p className="font-extrabold text-xs text-emerald-900">✨ פתרנו את זה עבורכם אוטומטית!</p>
                  <p className="text-xxs text-gray-650 leading-relaxed">
                    הרצנו כעת את הגדרת החיבור מול שרתי Firebase על מנת לאשר את הכתובת הציבורית החדשה שלכם:
                    <strong className="block font-mono bg-white px-2 py-1 rounded border border-emerald-150 text-emerald-950 mt-1 word-break select-all text-center">
                      {currentHostname || "ais-pre-4b5ffhf7q5iaobes6e3zqb-822338483822.europe-west2.run.app"}
                    </strong>
                  </p>
                  <div className="pt-1.5 flex justify-end">
                    <button
                      onClick={() => window.location.reload()}
                      type="button"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-4xs rounded-lg cursor-pointer transition-colors shadow-xxs"
                    >
                      רענן עמוד ונסה שוב ↻
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 pr-0.5 text-right">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold text-rose-900">שגיאה בתהליך ההתחברות:</p>
                  <p className="text-xxs text-gray-700 font-medium leading-relaxed">{authError}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action interactive layout */}
        <div className="pt-2">
          <button
            id="login-google-button"
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 text-white font-extrabold text-sm rounded-2xl shadow-md cursor-pointer transition-transform transform active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.24.61 4.45 1.64l2.42-2.42C17.3 1.7 14.93 1 12.24 1 6.16 1 1.24 5.92 1.24 12s4.92 11 11 11c6.33 0 10.51-4.45 10.51-10.71 0-.74-.08-1.3-.18-2H12.24z" />
                </svg>
                <span>התחבר באמצעות Google Sign-In</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Footer warning */}
      <p className="text-center text-xxs text-gray-400 mt-8 max-w-sm mx-auto leading-relaxed">
        על ידי התחברות למערכת אתם מאשרים כי השירות הינו חברתי בלבד ואין כאן שימוש בשום צורה של הימורי כסף, פרסים כספיים או משחקי מזל אסורים.
      </p>

    </div>
  );
};
