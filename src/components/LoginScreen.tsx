import React from "react";
import { useFirebase } from "./FirebaseProvider";
import { Award, ShieldCheck, Sparkles, HelpCircle, AlertTriangle, ExternalLink, X } from "lucide-react";
import { SystemLogo } from "./SystemLogo";

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, loading, authError, clearAuthError } = useFirebase();
  const currentHostname = typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <div id="login-screen-root" className="min-h-screen bg-gray-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 text-right font-sans">
      
      {/* Outer Spacer */}
      <div />

      {/* Login Center Card */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-150 p-8 space-y-6 mx-auto">
        
        {/* Brand visual header */}
        <div className="text-center">
          <div className="inline-flex mb-2 justify-center">
            <SystemLogo className="w-32 h-32 drop-shadow-md rounded-full bg-slate-950 border-2 border-slate-800" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">מונדיאל החברים 2026</h2>
          <p className="mt-1.5 text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
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
              <div className="space-y-4 font-sans leading-relaxed text-right">
                <div className="flex items-center gap-2 font-extrabold text-rose-850">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 animate-pulse" />
                  <span className="text-sm font-black animate-pulse">שגיאת התחברות בדומיין עצמאי</span>
                </div>
                
                <p className="text-xxs text-gray-700 font-semibold leading-normal">
                  האפליקציה פועלת כעת בכתובת עצמאית: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border text-rose-950 select-all">{currentHostname}</strong>.
                  <br className="mb-1" />
                  מטעמי אבטחה של Google/Firebase, לא ניתן לבצע Google Sign-In בדומיינים חיצוניים ללא הגדרת בעלות.
                </p>

                <div className="space-y-3 pt-1">
                  {/* Option 1 */}
                  <div className="bg-emerald-50 text-emerald-950 p-3.5 rounded-xl border border-emerald-250">
                    <p className="font-extrabold text-xxs text-emerald-900 mb-1">אפשרות 1: שימוש בכתובת השיתוף הרשמית (מומלץ ומהיר! 🚀)</p>
                    <p className="text-4xs text-gray-650 mb-2 leading-relaxed">
                      הכתובת המובנית של Google AI Studio מאושרת לחלוטין, עובדת באופן מיידי ללא הגדרות נוספות, ושומרת את כל נתוני החברים בבטחה בענן. שלחו לחבריכם קישור זה בלבד:
                    </p>
                    <a 
                      href="https://ais-pre-4b5ffhf7q5iaobes6e3zqb-822338483822.europe-west2.run.app"
                      target="_self"
                      className="block text-center font-mono bg-white hover:bg-emerald-100/50 text-emerald-800 px-2 py-2 rounded-lg border border-emerald-300 font-bold transition-all text-xxs truncate"
                    >
                      מעבר לאפליקציה בכתובת המקורית המאושרת ⚡
                    </a>
                  </div>

                  {/* Option 2 */}
                  <div className="bg-gray-50 text-gray-800 p-3.5 rounded-xl border border-gray-200/80 space-y-2">
                    <p className="font-extrabold text-xxs text-gray-900 mb-0.5">אפשרות 2: חיבור פרויקט Firebase פרטי משלכם</p>
                    <p className="text-4xs text-gray-650 leading-relaxed">
                      מכיוון שלפרויקט ברירת המחדל של AI Studio אין הרשאות מנהל להוספת דומיינים חיצוניים באופן חופשי, אם ברצונכם להציג את האפליקציה בכתובת Vercel עליכם לקשר אותה לפרויקט Firebase אישי:
                    </p>
                    <ol className="list-decimal list-inside text-4xs text-gray-600 space-y-1.5 pr-1 font-medium">
                      <li>פתחו פרויקט בחינם ב- <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold underline">Firebase Console</a></li>
                      <li>הפעילו <strong>Firestore Database</strong> וכן <strong>Authentication</strong> (אפשרו Google Provider)</li>
                      <li>הוסיפו את הכתובת <strong>{currentHostname}</strong> לרשימת הדומיינים המורשים (Authorized Domains) בהגדרות החיבור ב-Firebase</li>
                      <li>החליפו את המפתח וההגדרות בקובץ הקוד <strong>firebase-applet-config.json</strong> שלכם והעלו מחדש!</li>
                    </ol>
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
