import React, { useState } from "react";
import { useFirebase } from "./FirebaseProvider";
import { Match, Prediction, Couple } from "../types";
import { Calendar, Filter, Users, Lock, Unlock, MessageSquare, Award, AlertCircle, ArrowUpDown, LayoutGrid, List } from "lucide-react";
import { getTeamFlag, TeamFlag } from "./flags";

interface MatchesSectionProps {
  onOpenPredictModal: (match: Match) => void;
}

export const MatchesSection: React.FC<MatchesSectionProps> = ({ onOpenPredictModal }) => {
  const { matches, predictions, couples, userProfile } = useFirebase();

  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date-asc" | "date-desc" | "open-first" | "unpredicted-first">("date-asc");
  const [activeMatchDetailId, setActiveMatchDetailId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    try {
      return (localStorage.getItem("matches-view-mode") as "grid" | "list") || "grid";
    } catch (e) {
      return "grid";
    }
  });

  // Derive unique groups and dates for filters
  const uniqueGroups = Array.from(new Set(matches.map((m) => m.group_name)));
  const uniqueDates = Array.from(new Set(matches.map((m) => m.match_date)));

  // Filter matches
  const filteredMatches = matches.filter((m) => {
    const groupMatch = selectedGroup === "all" || m.group_name === selectedGroup;
    const dateMatch = selectedDate === "all" || m.match_date === selectedDate;
    return groupMatch && dateMatch;
  });

  const getMyPrediction = (matchId: string) => {
    if (!userProfile?.couple_id) return null;
    return predictions.find((p) => p.match_id === matchId && p.couple_id === userProfile.couple_id);
  };

  const isLocked = (match: Match) => {
    const now = new Date();
    const lockDt = match.prediction_lock_time?.seconds
      ? new Date(match.prediction_lock_time.seconds * 1000)
      : new Date(match.prediction_lock_time);
    return now >= lockDt;
  };

  // Sort matches based on selected option
  const sortedAndFilteredMatches = [...filteredMatches].sort((a, b) => {
    const timeA = a.prediction_lock_time?.seconds
      ? a.prediction_lock_time.seconds * 1000
      : new Date(a.prediction_lock_time).getTime();
    const timeB = b.prediction_lock_time?.seconds
      ? b.prediction_lock_time.seconds * 1000
      : new Date(b.prediction_lock_time).getTime();

    if (sortBy === "date-asc") {
      return timeA - timeB;
    }
    if (sortBy === "date-desc") {
      return timeB - timeA;
    }
    if (sortBy === "open-first") {
      const lockedA = isLocked(a) ? 1 : 0;
      const lockedB = isLocked(b) ? 1 : 0;
      if (lockedA !== lockedB) {
        return lockedA - lockedB; // Unlock (0) first, locked (1) next
      }
      return timeA - timeB;
    }
    if (sortBy === "unpredicted-first") {
      const myPredA = getMyPrediction(a.match_id) ? 1 : 0;
      const myPredB = getMyPrediction(b.match_id) ? 1 : 0;
      if (myPredA !== myPredB) {
        return myPredA - myPredB; // No prediction (0) first, predicted (1) next
      }
      return timeA - timeB;
    }
    return 0;
  });

  // Find predictions of other couples for a specific match (accessible only if locked)
  const getOtherCouplesPredictions = (matchId: string) => {
    return predictions.filter((p) => p.match_id === matchId && p.couple_id !== userProfile?.couple_id);
  };

  return (
    <div id="matches-section-root" className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">לוח משחקים וניחושים</h2>
          <p className="text-sm text-gray-500">
            השלם ניחושים בזמן. ניחוש ננעל לחלוטין 5 דקות לפני תחילת המשחק.
          </p>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200 shadow-xxs">
            <button
              id="view-mode-grid-btn"
              onClick={() => {
                setViewMode("grid");
                try { localStorage.setItem("matches-view-mode", "grid"); } catch (e) {}
              }}
              className={`p-1 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === "grid"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900 bg-transparent"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>גריד</span>
            </button>
            <button
              id="view-mode-list-btn"
              onClick={() => {
                setViewMode("list");
                try { localStorage.setItem("matches-view-mode", "list"); } catch (e) {}
              }}
              className={`p-1 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === "list"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900 bg-transparent"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>רשימה</span>
            </button>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-gray-100 shadow-xxs">
            <ArrowUpDown className="w-4 h-4 text-emerald-500" />
            <select
              id="sort-matches"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-transparent border-none outline-none font-medium text-gray-700 cursor-pointer"
            >
              <option value="date-asc">מיון: כרונולוגי עולה 📅</option>
              <option value="date-desc">מיון: כרונולוגי יורד 📆</option>
              <option value="open-first">מיון: פתוח לניחוש תחילה 🔓</option>
              <option value="unpredicted-first">מיון: טרם ניחשתי תחילה ⚽</option>
            </select>
          </div>

          {/* Filter Group */}
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-gray-100 shadow-xxs">
            <Filter className="w-4 h-4 text-emerald-500" />
            <select
              id="filter-group"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="text-xs bg-transparent border-none outline-none font-medium text-gray-700 cursor-pointer"
            >
              <option value="all">כל השלבים/בתים</option>
              {uniqueGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Date */}
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-gray-100 shadow-xxs">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <select
              id="filter-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs bg-transparent border-none outline-none font-medium text-gray-700 cursor-pointer"
            >
              <option value="all">כל התאריכים</option>
              {uniqueDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {sortedAndFilteredMatches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          לא נמצאו משחקים העונים לסינון שנבחר
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedAndFilteredMatches.map((match) => {
            const myPred = getMyPrediction(match.match_id);
            const lockedState = isLocked(match);
            const othersPreds = getOtherCouplesPredictions(match.match_id);
            const hasStartedOrFinished = match.match_status === "finished";

            return (
              <div
                key={match.match_id}
                id={`match-card-${match.match_id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition-shadow relative overflow-hidden"
              >
                {/* Header Match Indicator */}
                <div className="flex justify-between items-center text-xxs font-mono text-gray-400 border-b border-gray-50 pb-3 mb-4">
                  <span className="font-sans px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full font-medium">
                    {match.group_name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {lockedState ? (
                      <span className="text-rose-500 font-bold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" /> נעול
                      </span>
                    ) : (
                      <span className="text-emerald-500 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Unlock className="w-3 h-3" /> פתוח
                      </span>
                    )}
                    <span>
                      {match.match_date} • {match.match_time}
                    </span>
                  </div>
                </div>

                {/* Scorecard Visual */}
                <div className="grid grid-cols-3 items-center justify-items-center my-2">
                  {/* Team A */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <TeamFlag teamName={match.team_a} className="w-12 h-8 mb-1" />
                    <span className="text-sm font-bold text-gray-800">{match.team_a}</span>
                  </div>

                  {/* Mid Results Indicator */}
                  <div className="text-center font-sans">
                    {hasStartedOrFinished ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xl font-black bg-gray-900 text-white font-mono px-3 py-1 rounded-lg">
                          {match.actual_team_a_goals}
                        </span>
                        <span className="text-gray-400 font-mono text-sm">:</span>
                        <span className="text-xl font-black bg-gray-900 text-white font-mono px-3 py-1 rounded-lg">
                          {match.actual_team_b_goals}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 font-mono text-xxs block border border-gray-100 px-2.5 py-1 rounded-full uppercase tracking-wider bg-gray-50">
                        טרם התחיל
                      </span>
                    )}

                    {match.city && <span className="text-xxs text-gray-400 block mt-1">{match.city}</span>}
                  </div>

                  {/* Team B */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <TeamFlag teamName={match.team_b} className="w-12 h-8 mb-1" />
                    <span className="text-sm font-bold text-gray-800">{match.team_b}</span>
                  </div>
                </div>

                {/* My Forecast Block */}
                <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                      <Award className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-xxs text-gray-400 block font-semibold">הניחוש שלכם</span>
                      <span className="text-sm font-extrabold text-gray-800">
                        {myPred ? `${myPred.home_goals} - ${myPred.away_goals}` : "טרם ניחשת"}
                      </span>
                    </div>
                  </div>

                  {/* Points display block */}
                  {hasStartedOrFinished && myPred && (
                    <div className="text-left">
                      <span className="text-xxs text-gray-400 block">נקודות שנתקבלו</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-14">
                        +{myPred.points}
                      </span>
                    </div>
                  )}

                  {!lockedState && (
                    <button
                      id={`predict-btn-page-${match.match_id}`}
                      onClick={() => onOpenPredictModal(match)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-transform transform active:scale-95"
                    >
                      {myPred ? "ערוך" : "נחש תוצאה"}
                    </button>
                  )}
                </div>

                {/* Comments box */}
                {myPred?.comment && (
                  <div className="mt-3 bg-gray-50 rounded-xl p-2.5 flex items-start gap-2 text-xxs text-gray-500 leading-normal border border-gray-100">
                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-gray-400 flex-shrink-0" />
                    <p className="italic">"{myPred.comment}"</p>
                  </div>
                )}

                {/* locked predictions toggle list (המערכת מציגה לכולם את הניחושים של כולם) */}
                {lockedState ? (
                  <div className="mt-4 pt-3 border-t border-gray-50">
                    <button
                      id={`toggle-others-${match.match_id}`}
                      onClick={() =>
                        setActiveMatchDetailId(
                          activeMatchDetailId === match.match_id ? null : match.match_id
                        )
                      }
                      className="w-full flex items-center justify-between text-xxs font-extrabold text-emerald-700 hover:text-emerald-800 cursor-pointer bg-emerald-50/50 hover:bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100/30"
                    >
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> ראה את כל ניחושי החברים למשחק זה
                      </span>
                      <span>{activeMatchDetailId === match.match_id ? "▲ סגור" : "▼ פתח"}</span>
                    </button>

                    {/* Expandable Box */}
                    {activeMatchDetailId === match.match_id && (
                      <div className="mt-3 space-y-2 max-h-48 overflow-y-auto divide-y divide-gray-50 pr-1">
                        {othersPreds.length > 0 ? (
                          othersPreds.map((oPr) => {
                            const partner = couples.find((c) => c.couple_id === oPr.couple_id);
                            return (
                              <div
                                key={oPr.prediction_id}
                                className="flex items-center justify-between py-2 text-xxs first:pt-0"
                              >
                                <span className="font-bold text-gray-700">
                                  {partner ? partner.couple_name : "זוג חברים לקבוצה"}
                                </span>
                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-black text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-15">
                                    {oPr.home_goals} - {oPr.away_goals}
                                  </span>
                                  {hasStartedOrFinished && (
                                    <span className="bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded">
                                      +{oPr.points} נק'
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center text-gray-400 font-sans py-4">
                            אף זוג אחר לא הזין ניחוש למשחק זה
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 text-center text-xxs text-amber-600 bg-amber-50 rounded-xl py-2 font-medium border border-amber-100">
                    הניחושים של שאר הזוגות יחשפו כאן 5 דקות לפני שריקת הפתיחה!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAndFilteredMatches.map((match) => {
            const myPred = getMyPrediction(match.match_id);
            const lockedState = isLocked(match);
            const othersPreds = getOtherCouplesPredictions(match.match_id);
            const hasStartedOrFinished = match.match_status === "finished";

            return (
              <div
                key={match.match_id}
                id={`match-row-${match.match_id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-xxs p-4 flex flex-col gap-3 hover:shadow-xs transition-shadow relative overflow-hidden"
              >
                {/* Horizontal row for large screens, flex-col on mobile */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Part 1: Info & Date */}
                  <div className="flex items-center justify-between lg:justify-start gap-4 lg:min-w-[200px]">
                    <div className="flex flex-wrap lg:flex-col items-start gap-1">
                      <span className="text-xxs font-sans px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium w-fit">
                        {match.group_name}
                      </span>
                      <span className="text-xxs font-mono text-gray-500 min-w-max mt-0.5">
                        {match.match_date} • {match.match_time}
                      </span>
                    </div>
                    <div>
                      {lockedState ? (
                        <span className="text-rose-500 font-bold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px]">
                          <Lock className="w-3 h-3" /> נעול
                        </span>
                      ) : (
                        <span className="text-emerald-500 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px]">
                          <Unlock className="w-3 h-3" /> פתוח
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Part 2: Teams & Result */}
                  <div className="flex-1 flex items-center justify-center gap-4 py-2 border-y border-gray-50 lg:border-none lg:py-0">
                    <div className="flex flex-col items-center justify-center w-1/3 text-center">
                      <TeamFlag teamName={match.team_a} className="w-10 h-6 mb-1" />
                      <span className="text-xs font-bold text-gray-800">{match.team_a}</span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center min-w-[100px]">
                      {hasStartedOrFinished ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-base font-black bg-gray-900 text-white font-mono px-2.5 py-0.5 rounded-md">
                            {match.actual_team_a_goals}
                          </span>
                          <span className="text-gray-400 font-mono text-xs">:</span>
                          <span className="text-base font-black bg-gray-900 text-white font-mono px-2.5 py-0.5 rounded-md">
                            {match.actual_team_b_goals}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-mono text-[10px] border border-gray-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-gray-50">
                          טרם התחיל
                        </span>
                      )}
                      {match.city && <span className="text-[10px] text-gray-400 block mt-0.5 text-center">{match.city}</span>}
                    </div>

                    <div className="flex flex-col items-center justify-center w-1/3 text-center">
                      <TeamFlag teamName={match.team_b} className="w-10 h-6 mb-1" />
                      <span className="text-xs font-bold text-gray-800">{match.team_b}</span>
                    </div>
                  </div>

                  {/* Part 3: My Forecast Block & Action Button */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 lg:min-w-[300px]">
                    <div className="flex items-center gap-2">
                      <div className="p-1 px-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold leading-none mb-0.5">הניחוש שלכם</span>
                        <span className="text-xs font-extrabold text-gray-850">
                          {myPred ? `${myPred.home_goals} - ${myPred.away_goals}` : "טרם ניחשת"}
                        </span>
                      </div>
                    </div>

                    {hasStartedOrFinished && myPred && (
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block leading-none mb-0.5">נקודות</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xxs font-black bg-amber-50 text-amber-700 border border-amber-100">
                          +{myPred.points}
                        </span>
                      </div>
                    )}

                    {!lockedState && (
                      <button
                        id={`predict-btn-row-${match.match_id}`}
                        onClick={() => onOpenPredictModal(match)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-transform transform active:scale-95"
                      >
                        {myPred ? "ערוך" : "נחש תוצאה"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Part 4: Comment if exists */}
                {myPred?.comment && (
                  <div className="bg-gray-50 rounded-xl p-2 flex items-start gap-2 text-xxs text-gray-500 leading-normal border border-gray-100">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <p className="italic">"{myPred.comment}"</p>
                  </div>
                )}

                {/* Part 5: Locked predictions toggle list */}
                {lockedState ? (
                  <div className="border-t border-gray-50 pt-2">
                    <button
                      id={`toggle-row-others-${match.match_id}`}
                      onClick={() =>
                        setActiveMatchDetailId(
                          activeMatchDetailId === match.match_id ? null : match.match_id
                        )
                      }
                      className="w-full flex items-center justify-between text-xxs font-extrabold text-emerald-700 hover:text-emerald-800 cursor-pointer bg-emerald-50/50 hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100/30"
                    >
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> ראה את כל ניחושי החברים למשחק זה
                      </span>
                      <span>{activeMatchDetailId === match.match_id ? "▲ סגור" : "▼ פתח"}</span>
                    </button>

                    {/* Expandable Box */}
                    {activeMatchDetailId === match.match_id && (
                      <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto divide-y divide-gray-50 pr-1">
                        {othersPreds.length > 0 ? (
                          othersPreds.map((oPr) => {
                            const partner = couples.find((c) => c.couple_id === oPr.couple_id);
                            return (
                              <div
                                key={oPr.prediction_id}
                                className="flex items-center justify-between py-1.5 text-xxs first:pt-0"
                              >
                                <span className="font-bold text-gray-700">
                                  {partner ? partner.couple_name : "זוג חברים לקבוצה"}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-black text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-15">
                                    {oPr.home_goals} - {oPr.away_goals}
                                  </span>
                                  {hasStartedOrFinished && (
                                    <span className="bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded text-3xs">
                                      +{oPr.points} נק'
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center text-gray-450 font-sans py-2 text-xxs">
                            אף זוג אחר לא הזין ניחוש למשחק זה
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-xxs text-amber-600 bg-amber-50 rounded-xl py-1.5 border border-amber-100 font-medium">
                    הניחושים של שאר הזוגות יחשפו כאן 5 דקות לפני שריקת הפתיחה!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
