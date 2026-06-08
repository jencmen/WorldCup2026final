import React, { useState } from "react";
import { FirebaseProvider, useFirebase } from "./components/FirebaseProvider";
import { Navbar } from "./components/Navbar";
import { HomeSection } from "./components/HomeSection";
import { MatchesSection } from "./components/MatchesSection";
import { BonusPredictionsSection } from "./components/BonusPredictionsSection";
import { LeaderboardSection } from "./components/LeaderboardSection";
import { AdminSection } from "./components/AdminSection";
import { PredictModal } from "./components/PredictModal";
import { LoginScreen } from "./components/LoginScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { Match } from "./types";

function MainAppContent() {
  const { currentUser, userProfile, loading } = useFirebase();
  const [activeTab, setActiveTab] = useState<string>("home");
  const [predictModalMatch, setPredictModalMatch] = useState<Match | null>(null);

  // Authenticating state loader
  if (loading) {
    return (
      <div id="app-loading-state" className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-500">טוען את מונדיאל החברים...</p>
        </div>
      </div>
    );
  }

  // Route 1: Not Google Signed-In
  if (!currentUser) {
    return <LoginScreen />;
  }

  // Route 2: Signed-In, but first-time user profile registration missing
  if (currentUser && !userProfile) {
    return <OnboardingScreen />;
  }

  // Route 3: Profile complete (Active participant)
  return (
    <div id="app-inner-layout" className="min-h-screen bg-[#fbfcfa] font-sans text-right pb-10" dir="rtl">
      
      {/* Dynamic Header Navbar tabs */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main id="app-content-area" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {activeTab === "home" && (
          <HomeSection 
            onNavigate={setActiveTab} 
            onOpenPredictModal={setPredictModalMatch} 
          />
        )}

        {activeTab === "matches" && (
          <MatchesSection 
            onOpenPredictModal={setPredictModalMatch} 
          />
        )}

        {activeTab === "bonus" && (
          <BonusPredictionsSection />
        )}

        {activeTab === "leaderboard" && (
          <LeaderboardSection />
        )}

        {activeTab === "admin" && userProfile?.role === "Admin" && (
          <AdminSection />
        )}
      </main>

      {/* Prediction dialog Drawer model popup */}
      {predictModalMatch && (
        <PredictModal 
          match={predictModalMatch} 
          onClose={() => setPredictModalMatch(null)} 
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <MainAppContent />
    </FirebaseProvider>
  );
}
