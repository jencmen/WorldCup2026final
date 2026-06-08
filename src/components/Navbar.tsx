import React from "react";
import { useFirebase } from "./FirebaseProvider";
import { LogOut, User, Award, Shield, Calendar, Settings, Compass } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { userProfile, couples, logout } = useFirebase();

  const userCouple = couples.find((c) => c.couple_id === userProfile?.couple_id);

  const navItems = [
    { id: "home", label: "בית", icon: Compass },
    { id: "matches", label: "משחקים", icon: Calendar },
    { id: "bonus", label: "בונוסים", icon: Award },
    { id: "leaderboard", label: "דירוג", icon: Settings },
  ];

  if (userProfile?.role === "Admin") {
    navItems.push({ id: "admin", label: "ניהול מנהל", icon: Shield });
  }

  return (
    <header id="app-header" className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-lg shadow-sm">
              <span className="text-xl font-bold font-sans">⚽</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">מונדיאל החברים 2026</h1>
              <p className="text-xxs text-gray-400 font-mono">משחק ניחושים חברתי</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-reverse space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Status Block */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-left items-end">
              <div className="flex items-center gap-1.5">
                {userProfile?.role === "Admin" && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xxs font-semibold bg-rose-50 text-rose-700">
                    מנהל
                  </span>
                )}
                <span className="text-sm font-semibold text-gray-800">{userProfile?.display_name}</span>
              </div>
              <span className="text-xs text-gray-500 font-sans">
                {userCouple ? `זוג: ${userCouple.couple_name}` : "ללא זוג"}
              </span>
            </div>

            <button
              id="logout-button"
              onClick={logout}
              className="p-2.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              title="התנתק מהמערכת"
              aria-label="התנתק מהמערכת"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Always accessible for touch targets > 44px) */}
      <div className="md:hidden border-t border-gray-100 bg-white fixed bottom-0 left-0 right-0 z-50">
        <div className="grid grid-cols-5 h-16 justify-items-center items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full text-xxs gap-1 transition-all ${
                  activeTab === item.id
                    ? "text-emerald-600 font-bold"
                    : "text-gray-400"
                }`}
                style={{ minHeight: "44px" }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
