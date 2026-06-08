import React, { useState } from "react";
import { useFirebase } from "./FirebaseProvider";
import { Match, Couple, Setting, User, TournamentResults } from "../types";
import { doc, setDoc, deleteDoc, updateDoc, collection, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { 
  Users, Calendar, Save, Trash2, Award, Settings, 
  Upload, HelpCircle, AlertCircle, CheckCircle, RefreshCw, Plus,
  Pencil, ArrowUpDown, X
} from "lucide-react";

export const AdminSection: React.FC = () => {
  const { 
    currentUser, userProfile, couples, matches, 
    predictions, bonusPredictions, tournamentResults, 
    settings, recalculatePoints 
  } = useFirebase();

  const [activeSubTab, setActiveSubTab] = useState<"users" | "matches" | "import" | "scores" | "bonus" | "settings">("users");

  // Admin matches options
  const [adminSortBy, setAdminSortBy] = useState<"date-asc" | "date-desc">("date-asc");
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  // State feedback
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; type: "match" | "couple"; name: string } | null>(null);

  // Sub-Tab 1: Couples Form states
  const [newCoupleName, setNewCoupleName] = useState("");
  const [coupleIdInput, setCoupleIdInput] = useState("");

  // Sub-Tab 2: Individual Match Form states
  const [matchId, setMatchId] = useState("");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("");
  const [groupName, setGroupName] = useState("");
  const [city, setCity] = useState("");
  const [broadcast, setBroadcast] = useState("");
  const [lockTimeInMins, setLockTimeInMins] = useState(5); // Default lock prediction 5 minutes before kickoff

  // Sub-Tab 3: Spreadsheet Copy-Paste Match Bulk Import states
  const [pasteData, setPasteData] = useState("");
  const [delimiter, setDelimiter] = useState<"\t" | "," | "|">("\t");
  const [hasHeader, setHasHeader] = useState(true);
  const [previewMatches, setPreviewMatches] = useState<Partial<Match>[]>([]);
  // Row Mapping states (Column positions, 0-indexed)
  // Customized to match standard Israeli broadcast spreadsheets (e.g. Kan 11)
  const [colTeamA, setColTeamA] = useState(7);       // נבחרת בית (Home Team) - e.g. Row 7
  const [colTeamB, setColTeamB] = useState(6);       // נבחרת חוץ (Away Team) - e.g. Row 6
  const [colDate, setColDate] = useState(10);        // תאריך בישראל - e.g. Row 10
  const [colTime, setColTime] = useState(9);         // שעה בישראל - e.g. Row 9
  const [colGroupName, setColGroupName] = useState(11); // בית (Group) - e.g. Row 11
  const [colCity, setColCity] = useState(3);         // עיר/אצטדיון (Venue/City) - e.g. Row 3
  const [colStage, setColStage] = useState(12);       // שלב (Stage) - e.g. Row 12
  const [colMatchId, setColMatchId] = useState(14);   // match_id - e.g. Row 14
  const [colBroadcast, setColBroadcast] = useState(5); // ערוץ שידור מרכזי - e.g. Row 5

  // Sub-Tab 4: Single score input targets
  const [editingScores, setEditingScores] = useState<{ [matchId: string]: { home: string; away: string } }>({});

  // Sub-Tab 5: Long-term outcomes results states
  const [wcWinner, setWcWinner] = useState(tournamentResults?.actual_world_cup_winner || "");
  const [wcRunnerUp, setWcRunnerUp] = useState(tournamentResults?.actual_runner_up || "");
  const [topScorerVal, setTopScorerVal] = useState(tournamentResults?.actual_top_scorer || "");
  const [surpriseVal, setSurpriseVal] = useState(tournamentResults?.actual_surprise_team || "");

  // Sub-Tab 6: Config points settings states
  const [exactScorePoints, setExactScorePoints] = useState(settings.exact_score_points);
  const [correctWinnerPoints, setCorrectWinnerPoints] = useState(settings.correct_winner_points);
  const [correctGoalDiffPoints, setCorrectGoalDiffPoints] = useState(settings.correct_goal_diff_points);
  const [winnerPoints, setWinnerPoints] = useState(settings.world_cup_winner_points);
  const [runnerPoints, setRunnerPoints] = useState(settings.runner_up_points);
  const [scorerPoints, setScorerPoints] = useState(settings.top_scorer_points);
  const [surprisePoints, setSurprisePoints] = useState(settings.surprise_team_points);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 5000);
  };

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(""), 6000);
  };

  // Add Couple Action
  const handleAddCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupleName.trim()) return;

    setLoading(true);
    const id = coupleIdInput.trim() || `couple_${Date.now()}`;
    const couplePayload: Couple = {
      couple_id: id,
      couple_name: newCoupleName,
      active: true,
      created_at: new Date()
    };

    try {
      await setDoc(doc(db, "couples", id), couplePayload);
      showSuccess(`זוג חדש נוצר בהצלחה: ${newCoupleName}`);
      setNewCoupleName("");
      setCoupleIdInput("");
    } catch (err: any) {
      showError(err.message || "שגיאה ביצירת הזוג");
    } finally {
      setLoading(false);
    }
  };

  // Delete Couple Action
  const handleDeleteCouple = (id: string, name: string) => {
    setDeleteConfirmTarget({ id, type: "couple", name });
  };

  // Change User Couple Reference
  const handleAssignCouple = async (userId: string, targetCoupleId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { couple_id: targetCoupleId });
      showSuccess("שיוך המשתמש התעדכן בהצלחה!");
    } catch (err) {
      showError("נכשל עדכון מזהה הזוג למשתמש");
    }
  };

  // Toggle user administrative permissions
  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === "Admin" ? "Participant" : "Admin";
    try {
      await updateDoc(doc(db, "users", userId), { role: nextRole });
      showSuccess("תפקיד המשתמש השתנה בהצלחה!");
    } catch (err) {
      showError("נכשל ביצוע עדכון התפקיד");
    }
  };

  // Add or Edit Match Action
  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA.trim() || !teamB.trim() || !matchDate.trim() || !groupName.trim()) {
      showError("אנא מלא את כל שדות החובה של המשחק");
      return;
    }

    setLoading(true);
    const mId = matchId.trim() || `m_${Date.now()}`;
    
    // Parse Date and Time to create localized lock time
    const parts = matchDate.split(/[/.-]/).map(p => p.trim());
    const day = Number(parts[0] || 11);
    const month = Number(parts[1] || 6);
    const year = Number(parts[2] || 2026);
    
    const [hourStr, minuteStr] = (matchTime || "20:00").split(":");
    const hour = Number(hourStr || 20);
    const minute = Number(minuteStr || 0);
    
    // Build actual Kickoff Date JS construct
    const parsedKickoff = new Date(year, month - 1, day, hour, minute);

    // Compute Lock time (usually kickoff minus X minutes)
    let calculatedLock = new Date();
    if (parsedKickoff && !isNaN(parsedKickoff.getTime())) {
      calculatedLock = new Date(parsedKickoff.getTime() - (lockTimeInMins * 60 * 1000));
    } else {
      const fallbackDate = new Date(2026, 5, 11, 20, 0);
      calculatedLock = new Date(fallbackDate.getTime() - (lockTimeInMins * 60 * 1000));
    }

    const matchPayload: Match = {
      match_id: mId,
      team_a: teamA,
      team_b: teamB,
      match_date: matchDate,
      match_time: matchTime,
      group_name: groupName,
      city: city || "",
      broadcast_channel: broadcast || "",
      prediction_lock_time: calculatedLock,
      match_status: editingMatch ? editingMatch.match_status : "scheduled",
      actual_team_a_goals: editingMatch ? editingMatch.actual_team_a_goals : null,
      actual_team_b_goals: editingMatch ? editingMatch.actual_team_b_goals : null
    };

    try {
      await setDoc(doc(db, "matches", mId), matchPayload);
      if (editingMatch) {
        showSuccess(`המשחק עודכן בהצלחה! (${teamA} vs ${teamB})`);
        setEditingMatch(null);
      } else {
        showSuccess(`משחק חדש נוצר בהצלחה בגלידת הנתונים! (${teamA} vs ${teamB})`);
      }
      // Reset match values
      setMatchId("");
      setTeamA("");
      setTeamB("");
      setMatchDate("");
      setMatchTime("");
      setGroupName("");
      setCity("");
      setBroadcast("");
      setLockTimeInMins(5);
    } catch (err: any) {
      showError(err.message || "נכשלה יצירת/עדכון המשחק");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (m: Match) => {
    setEditingMatch(m);
    setMatchId(m.match_id);
    setGroupName(m.group_name);
    setTeamA(m.team_a);
    setTeamB(m.team_b);
    setMatchDate(m.match_date);
    setMatchTime(m.match_time || "20:00");
    setCity(m.city || "");
    setBroadcast(m.broadcast_channel || "");
    // To estimate lockTimeInMins
    try {
      const parts = m.match_date.split(/[/.-]/).map(p => p.trim());
      const day = Number(parts[0] || 11);
      const month = Number(parts[1] || 6);
      const year = Number(parts[2] || 2026);
      const [hour, minute] = (m.match_time || "20:00").split(":").map(Number);
      const kickoff = new Date(year, month - 1, day, hour, minute);
      
      const lockDate = m.prediction_lock_time?.seconds 
        ? new Date(m.prediction_lock_time.seconds * 1000) 
        : new Date(m.prediction_lock_time);
      
      const diffMs = kickoff.getTime() - lockDate.getTime();
      const diffMins = Math.round(diffMs / 60000);
      setLockTimeInMins(diffMins >= 0 ? diffMins : 5);
    } catch (e) {
      setLockTimeInMins(5);
    }
  };

  const handleCancelEdit = () => {
    setEditingMatch(null);
    setMatchId("");
    setGroupName("");
    setTeamA("");
    setTeamB("");
    setMatchDate("");
    setMatchTime("");
    setCity("");
    setBroadcast("");
    setLockTimeInMins(5);
  };

  const handleDeleteMatch = (id: string, teams: string) => {
    setDeleteConfirmTarget({ id, type: "match", name: teams });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    const { id, type, name } = deleteConfirmTarget;
    setLoading(true);
    try {
      if (type === "couple") {
        await deleteDoc(doc(db, "couples", id));
        showSuccess(`הזוג ${name} נמחק בהצלחה`);
      } else {
        await deleteDoc(doc(db, "matches", id));
        showSuccess(`המשחק ${name} נמחק בהצלחה`);
      }
    } catch (err: any) {
      console.error(err);
      showError(`שגיאה במחיקת ה${type === "couple" ? "זוג" : "משחק"}`);
    } finally {
      setLoading(false);
      setDeleteConfirmTarget(null);
    }
  };

  // Spreadsheet copy-paste analyzer
  const handleParseSpreadsheet = () => {
    if (!pasteData.trim()) return;

    let activeDelimiter = delimiter;
    const rows = pasteData.split(/\r?\n/).filter(r => r.trim().length > 0);
    
    // Robust date and time cleaner helper
    const cleanDateAndTime = (rawDate: string, rawTime: string) => {
      let dStr = rawDate ? rawDate.trim() : "";
      let tStr = rawTime ? rawTime.trim() : "";

      // Extract date part (DD/MM/YYYY or YYYY-MM-DD)
      const dateMatch = dStr.match(/\b\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}\b/);
      const datePart = dateMatch ? dateMatch[0] : dStr.split(/\s+/)[0] || "";

      // Extract time part (HH:MM or HH:MM:SS)
      const timeMatch = tStr.match(/\b\d{1,2}:\d{2}(:\d{2})?\b/) || dStr.match(/\b\d{1,2}:\d{2}(:\d{2})?\b/);
      let timePart = timeMatch ? timeMatch[0] : tStr.split(/\s+/).find(tk => tk.includes(":")) || "20:00";

      // Just HH:MM
      if (timePart.split(":").length > 2) {
        timePart = timePart.split(":").slice(0, 2).join(":");
      }

      return { datePart, timePart };
    };
    
    // Auto-detect delimiter if not set or just as friendly assistant
    const firstLine = rows[0] || "";
    if (firstLine.includes("\t")) {
      activeDelimiter = "\t";
      setDelimiter("\t");
    } else if (firstLine.includes(",")) {
      activeDelimiter = ",";
      setDelimiter(",");
    } else if (firstLine.includes("|")) {
      activeDelimiter = "|";
      setDelimiter("|");
    }

    const parsedList: Partial<Match>[] = [];

    let activeColTeamA = colTeamA;
    let activeColTeamB = colTeamB;
    let activeColDate = colDate;
    let activeColTime = colTime;
    let activeColGroupName = colGroupName;
    let activeColCity = colCity;
    let activeColStage = colStage;
    let activeColMatchId = colMatchId;
    let activeColBroadcast = colBroadcast;

    let autoDetected = false;
    let autoDetectMessage = "";

    // Auto-detect columns if we have a header row
    if (hasHeader && rows.length > 0) {
      const headerRow = rows[0];
      const cols = headerRow.split(activeDelimiter).map(c => c.trim().toLowerCase());
      
      let foundTeamA = -1;
      let foundTeamB = -1;
      let foundDate = -1;
      let foundTime = -1;
      let foundGroup = -1;
      let foundStage = -1;
      let foundMatchId = -1;
      let foundCity = -1;
      let foundBroadcast = -1;

      cols.forEach((col, idx) => {
        // Team A (Home Team)
        if (col.includes("home_team") || col.includes("team_a") || col.includes("נבחרת בית") || col.includes("קבוצת בית") || col.includes("קבוצה א") || col === "מארחת" || col.includes("מארחת")) {
          foundTeamA = idx;
        }
        // Team B (Away Team)
        else if (col.includes("away_team") || col.includes("team_b") || col.includes("נבחרת חוץ") || col.includes("קבוצת חוץ") || col.includes("קבוצה ב") || col === "חוץ" || col === "אורחת" || col.includes("אורחת")) {
          foundTeamB = idx;
        }
        // Date
        else if (col.includes("date") || col.includes("תאריך") || col.includes("תאריך בישראל") || col === "יום") {
          foundDate = idx;
        }
        // Time
        else if (col.includes("time") || col.includes("שעה") || col.includes("שעת") || col.includes("שעה בישראל")) {
          foundTime = idx;
        }
        // Group
        else if (col === "group" || col === "בית" || col.includes("בית (")) {
          foundGroup = idx;
        }
        // Stage
        else if (col === "stage" || col === "שלב" || col.includes("שלב הטורניר")) {
          foundStage = idx;
        }
        // Match ID
        else if (col === "match_id" || col === "match id" || col === "id" || col === "מזהה" || col === "קוד משחק" || col === "קוד") {
          foundMatchId = idx;
        }
        // City / Venue
        else if (col === "city" || col === "venue" || col === "עיר" || col === "אצטדיון" || col === "מגרש") {
          foundCity = idx;
        }
        // Broadcast
        else if (col === "broadcast" || col === "channel" || col === "שידור" || col === "ערוץ" || col.includes("ערוץ")) {
          foundBroadcast = idx;
        }
      });

      const detections: string[] = [];
      if (foundTeamA !== -1) { activeColTeamA = foundTeamA; setColTeamA(foundTeamA); detections.push(`קבוצה א' [עמודה ${foundTeamA}]`); }
      if (foundTeamB !== -1) { activeColTeamB = foundTeamB; setColTeamB(foundTeamB); detections.push(`קבוצה ב' [עמודה ${foundTeamB}]`); }
      if (foundDate !== -1) { activeColDate = foundDate; setColDate(foundDate); detections.push(`תאריך [עמודה ${foundDate}]`); }
      if (foundTime !== -1) { activeColTime = foundTime; setColTime(foundTime); detections.push(`שעה [עמודה ${foundTime}]`); }
      if (foundGroup !== -1) { activeColGroupName = foundGroup; setColGroupName(foundGroup); detections.push(`בית [עמודה ${foundGroup}]`); }
      if (foundStage !== -1) { activeColStage = foundStage; setColStage(foundStage); detections.push(`שלב [עמודה ${foundStage}]`); }
      if (foundMatchId !== -1) { activeColMatchId = foundMatchId; setColMatchId(foundMatchId); detections.push(`מזהה [עמודה ${foundMatchId}]`); }
      if (foundCity !== -1) { activeColCity = foundCity; setColCity(foundCity); detections.push(`עיר [עמודה ${foundCity}]`); }
      if (foundBroadcast !== -1) { activeColBroadcast = foundBroadcast; setColBroadcast(foundBroadcast); detections.push(`שידור [עמודה ${foundBroadcast}]`); }

      if (detections.length > 0) {
        autoDetected = true;
        autoDetectMessage = `זוהה מבנה עמודות אוטומטי בהתאם לשורת הכותרת: ${detections.join(", ")} ✨`;
      }
    }

    const startIndex = hasHeader ? 1 : 0;

    for (let i = startIndex; i < rows.length; i++) {
      const rowText = rows[i];
      const cols = rowText.split(activeDelimiter).map(c => c.trim());

      const teamAVal = cols[activeColTeamA] || "";
      const teamBVal = cols[activeColTeamB] || "";
      const dateVal = cols[activeColDate] || "";
      const timeVal = cols[activeColTime] || "20:00";
      
      const stageVal = activeColStage >= 0 && cols[activeColStage] ? cols[activeColStage] : "";
      const groupVal = cols[activeColGroupName] || "";
      let groupNameCombined = "שלב הבתים";
      if (stageVal && groupVal) {
        if (groupVal.length <= 2) {
          groupNameCombined = `${stageVal} - בית ${groupVal}`;
        } else {
          groupNameCombined = `${stageVal} - ${groupVal}`;
        }
      } else if (stageVal) {
        groupNameCombined = stageVal;
      } else if (groupVal) {
        groupNameCombined = groupVal.length <= 2 ? `בית ${groupVal}` : groupVal;
      }

      const cityVal = cols[activeColCity] || "";
      const broadcastVal = activeColBroadcast >= 0 && cols[activeColBroadcast] ? cols[activeColBroadcast] : "";
      
      let customMatchId = `m_imported_${i}_${Date.now().toString().slice(-4)}`;
      if (activeColMatchId >= 0 && cols[activeColMatchId]) {
        customMatchId = cols[activeColMatchId].trim();
      }

      if (teamAVal && teamBVal && dateVal) {
        const { datePart, timePart } = cleanDateAndTime(dateVal, timeVal);
        const parts = datePart.split(/[/.-]/).map(p => p.trim());
        let day = 1;
        let month = 6;
        let year = 2026;

        if (parts[0] && parts[0].length === 4) {
          year = Number(parts[0]);
          month = Number(parts[1]);
          day = Number(parts[2]);
        } else if (parts[2] && parts[2].length === 4) {
          day = Number(parts[0]);
          month = Number(parts[1]);
          year = Number(parts[2]);
        } else {
          day = Number(parts[0] || 1);
          month = Number(parts[1] || 6);
          year = Number(parts[2] || 2026);
        }

        const [hour, minute] = timePart.split(":");
        const kDate = new Date(
          year,
          month - 1,
          day,
          Number(hour || 20),
          Number(minute || 0)
        );

        let lock = new Date();
        if (kDate && !isNaN(kDate.getTime())) {
          lock = new Date(kDate.getTime() - (5 * 60 * 1000));
        } else {
          const fallbackDate = new Date(2026, 5, 11, 20, 0);
          lock = new Date(fallbackDate.getTime() - (5 * 60 * 1000));
        }

        const formattedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

        parsedList.push({
          match_id: customMatchId,
          team_a: teamAVal,
          team_b: teamBVal,
          match_date: formattedDate,
          match_time: timePart,
          group_name: groupNameCombined,
          city: cityVal,
          broadcast_channel: broadcastVal,
          prediction_lock_time: lock,
          match_status: "scheduled",
          actual_team_a_goals: null,
          actual_team_b_goals: null
        });
      }
    }

    // Heuristic fallback if 0 matches were parsed
    if (parsedList.length === 0 && rows[startIndex]) {
      const firstRow = rows[startIndex];
      const cols = firstRow.split(activeDelimiter).map(c => c.trim());
      
      let discoveredTeamA = -1;
      let discoveredTeamB = -1;
      let discoveredDate = -1;
      let discoveredTime = -1;
      
      // Look for Date and Time
      cols.forEach((col, idx) => {
        if (col.includes("/") || col.includes("-")) {
          const parts = col.split(/[/.-]/);
          if (parts.length >= 2 && !isNaN(Number(parts[0]))) {
            discoveredDate = idx;
          }
        } else if (col.includes(":") && col.split(":").length === 2 && !isNaN(Number(col.replace(":", "")))) {
          discoveredTime = idx;
        }
      });

      // Find potential Team A and Team B columns (text columns that are not Date/Time)
      const potentialTeams: number[] = [];
      cols.forEach((col, idx) => {
        if (idx !== discoveredDate && idx !== discoveredTime && col.length > 1) {
          if (/[\p{L}]/u.test(col)) {
            potentialTeams.push(idx);
          }
        }
      });

      if (potentialTeams.length >= 2) {
        discoveredTeamA = potentialTeams[0];
        discoveredTeamB = potentialTeams[1];
      } else if (cols.length >= 2) {
        discoveredTeamA = 0;
        discoveredTeamB = 1;
      }

      if (discoveredTeamA !== -1 && discoveredTeamB !== -1) {
        // Map detected values
        activeColTeamA = discoveredTeamA; setColTeamA(discoveredTeamA);
        activeColTeamB = discoveredTeamB; setColTeamB(discoveredTeamB);
        if (discoveredDate !== -1) {
          activeColDate = discoveredDate; setColDate(discoveredDate);
        }
        if (discoveredTime !== -1) {
          activeColTime = discoveredTime; setColTime(discoveredTime);
        }

        // Try to parse parsedList again using new smart mapping
        for (let i = startIndex; i < rows.length; i++) {
          const rowText = rows[i];
          const rowCols = rowText.split(activeDelimiter).map(c => c.trim());

          const teamAVal = rowCols[activeColTeamA] || "";
          const teamBVal = rowCols[activeColTeamB] || "";
          const dateVal = rowCols[activeColDate] || "";
          const timeVal = rowCols[activeColTime] || "20:00";
          
          const stageVal = activeColStage >= 0 && rowCols[activeColStage] ? rowCols[activeColStage] : "";
          const groupVal = rowCols[activeColGroupName] || "";
          let groupNameCombined = "שלב הבתים";
          if (stageVal && groupVal) {
            if (groupVal.length <= 2) {
              groupNameCombined = `${stageVal} - בית ${groupVal}`;
            } else {
              groupNameCombined = `${stageVal} - ${groupVal}`;
            }
          } else if (stageVal) {
            groupNameCombined = stageVal;
          } else if (groupVal) {
            groupNameCombined = groupVal.length <= 2 ? `בית ${groupVal}` : groupVal;
          }

          const cityVal = rowCols[activeColCity] || "";
          const broadcastVal = activeColBroadcast >= 0 && rowCols[activeColBroadcast] ? rowCols[activeColBroadcast] : "";
          
          let customMatchId = `m_imported_${i}_${Date.now().toString().slice(-4)}`;
          if (activeColMatchId >= 0 && rowCols[activeColMatchId]) {
            customMatchId = rowCols[activeColMatchId].trim();
          }

          if (teamAVal && teamBVal) {
            const { datePart, timePart } = cleanDateAndTime(dateVal, timeVal);
            const parts = datePart ? datePart.split(/[/.-]/).map(p => p.trim()) : [];
            let day = 11;
            let month = 6;
            let year = 2026;

            if (parts[0] && parts[0].length === 4) {
              year = Number(parts[0]);
              month = Number(parts[1]);
              day = Number(parts[2]);
            } else if (parts[2] && parts[2].length === 4) {
              day = Number(parts[0]);
              month = Number(parts[1]);
              year = Number(parts[2]);
            } else if (parts.length >= 2) {
              day = Number(parts[0] || 11);
              month = Number(parts[1] || 6);
              year = Number(parts[2] || 2026);
            }

            const [hour, minute] = timePart.split(":");
            const kDate = new Date(
              year,
              month - 1,
              day,
              Number(hour || 20),
              Number(minute || 0)
            );

            let lock = new Date();
            if (kDate && !isNaN(kDate.getTime())) {
              lock = new Date(kDate.getTime() - (5 * 60 * 1000));
            } else {
              const fallbackDate = new Date(2026, 5, 11, 20, 0);
              lock = new Date(fallbackDate.getTime() - (5 * 60 * 1000));
            }

            const formattedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

            parsedList.push({
              match_id: customMatchId,
              team_a: teamAVal,
              team_b: teamBVal,
              match_date: formattedDate,
              match_time: timePart,
              group_name: groupNameCombined,
              city: cityVal,
              broadcast_channel: broadcastVal,
              prediction_lock_time: lock,
              match_status: "scheduled",
              actual_team_a_goals: null,
              actual_team_b_goals: null
            });
          }
        }
        autoDetected = true;
        autoDetectMessage = `זוהה מבנה עמודות פשוט בהתאם לשורה הראשונה: קבוצה א' [עמודה ${activeColTeamA}], קבוצה ב' [עמודה ${activeColTeamB}]${discoveredDate !== -1 ? `, תאריך [עמודה ${activeColDate}]` : ""}${discoveredTime !== -1 ? `, שעה [עמודה ${activeColTime}]` : ""} ✨`;
      }
    }

    setPreviewMatches(parsedList);

    if (parsedList.length === 0) {
      showError(`שגיאה בפענוח: לא נמצאו קווים תקינים. שים לב! מפות העמודות שלך מצביעות על עמודות כמו ${colTeamA}, ${colTeamB}, ${colDate} - אך המידע שהדבקת מכיל רק ${firstLine.split(activeDelimiter).length} עמודות. אנא וודא שהמפריד (טאב או פסיק) תואם לטקסט, או עדכן את מספרי העמודות בצד ימין בהתאם למיקום שלהם בטקסט שהדבקת.`);
    } else if (autoDetected) {
      showSuccess(`${autoDetectMessage} (נותחו בהצלחה ${parsedList.length} משחקים!)`);
    } else {
      showSuccess(`נותחו בהצלחה ${parsedList.length} משחקים מתוך הגליון בהתאם להגדרות הידניות!`);
    }
  };

  // Ingest Bulk Parsed Matches to Database
  const handleImportMatches = async () => {
    if (previewMatches.length === 0) return;
    setLoading(true);
    let successCount = 0;

    try {
      for (const m of previewMatches) {
        if (m.match_id) {
          await setDoc(doc(db, "matches", m.match_id), m);
          successCount++;
        }
      }
      showSuccess(`יוצא מן הכלל! ${successCount} משחקים יובאו בהצלחה לגליון המשחקים!`);
      setPreviewMatches([]);
      setPasteData("");
    } catch (err: any) {
      showError(err.message || "נכשל יבוא הנתונים");
    } finally {
      setLoading(false);
    }
  };

  // Submit Match Real Score and Run scoring recalculation trigger
  const handleSaveMatchScore = async (match: Match) => {
    const edits = editingScores[match.match_id];
    if (!edits || edits.home === "" || edits.away === "") {
      showError("נא להזין ערך שערים תקין לשתי הקבוצות");
      return;
    }

    setLoading(true);
    const matchRef = doc(db, "matches", match.match_id);

    try {
      // 1. Update Match Score and status to finished
      await updateDoc(matchRef, {
        actual_team_a_goals: Number(edits.home),
        actual_team_b_goals: Number(edits.away),
        match_status: "finished",
        result_updated_at: new Date(),
        result_updated_by: currentUser?.uid || "admin"
      });

      // 2. Clear current in-memory edits state
      setEditingScores(prev => {
        const copy = { ...prev };
        delete copy[match.match_id];
        return copy;
      });

      // 3. Automatically run global scoring re-calculator
      await recalculatePoints();
      showSuccess(`התוצאה של המשחק ${match.team_a} - ${match.team_b} נשמרה והניקוד חושב מחדש! ✓`);
    } catch (err: any) {
      showError(err.message || "נכשלה שמירת התוצאה");
    } finally {
      setLoading(false);
    }
  };

  // Save long term bonus actual outcomes and compute points
  const handleSaveBonusOutcomes = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const outcomesPayload: TournamentResults = {
      tournament_result_id: "official",
      actual_world_cup_winner: wcWinner,
      actual_runner_up: wcRunnerUp,
      actual_top_scorer: topScorerVal,
      actual_surprise_team: surpriseVal,
      updated_by: currentUser?.uid || "admin",
      updated_at: new Date()
    };

    try {
      await setDoc(doc(db, "tournamentResults", "official"), outcomesPayload);
      await recalculatePoints(); // Recompute all couple bonus points
      showSuccess("תוצאות הבונוס נשמרו בהצלחה והניקוד הכללי חושב מחדש! 🎉");
    } catch (err: any) {
      showError(err.message || "שגיאה בעדכון התאריכים");
    } finally {
      setLoading(false);
    }
  };

  // Save game rule settings configurations
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: Setting = {
      setting_id: "default",
      correct_winner_points: Number(correctWinnerPoints),
      correct_goal_diff_points: Number(correctGoalDiffPoints),
      exact_score_points: Number(exactScorePoints),
      world_cup_winner_points: Number(winnerPoints),
      runner_up_points: Number(runnerPoints),
      top_scorer_points: Number(scorerPoints),
      surprise_team_points: Number(surprisePoints),
      updated_at: new Date(),
      updated_by: currentUser?.uid || "admin"
    };

    try {
      await setDoc(doc(db, "settings", "default"), payload);
      await recalculatePoints(); // re-evaluates leaderboard with active formulas
      showSuccess("חוקי הניקוד המעודכנים נשמרו והדירוג חושב מחדש בהתאם! 🛠️");
    } catch (err: any) {
      showError(err.message || "שגיאה בשמירת חוקי הניקוד");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-dashboard-root" className="space-y-6 pb-20">
      <div className="border-b border-gray-100 pb-4 flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">מרכז ניהול - Admin Panel</h2>
          <p className="text-xs text-gray-500">רק מנהלים מורשים לצפות ולבצע שינויים בדף זה.</p>
        </div>

        {/* Global Point Recalculator Trigger */}
        <button
          onClick={async () => {
            try {
              setLoading(true);
              await recalculatePoints();
              showSuccess("הניקוד הכללי של כל המשחקים והבונוסים חושב מחדש בהצלחה!");
            } catch (e: any) {
              showError("נכשל חישוב הניקוד המחודש");
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          חישוב ניקוד מחדש לכולם
        </button>
      </div>

      {/* Sub-tab navigation */}
      <div id="admin-subtabs" className="flex flex-wrap border-b border-gray-150 gap-1.5 pb-0.5">
        {[
          { id: "users", label: "משתתפים וזוגות", icon: Users },
          { id: "matches", label: "לוח משחקים", icon: Calendar },
          { id: "import", label: "Excel יבוא נתונים", icon: Upload },
          { id: "scores", label: "תוצאות משחקי אמת", icon: Award },
          { id: "bonus", label: "תוצאות בונוס", icon: Award },
          { id: "settings", label: "חוקים והגדרות", icon: Settings }
        ].map(sub => {
          const Icon = sub.icon;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id as any)}
              className={`px-3 py-2 text-xs font-bold transition-all rounded-t-xl flex items-center gap-1.5 ${
                activeSubTab === sub.id 
                  ? "bg-white text-emerald-700 border-t border-r border-l border-gray-150 font-black relative top-[1px]" 
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {sub.label}
            </button>
          );
        })}
      </div>

      {/* Status Indicators */}
      {success && (
        <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-xl font-bold flex items-center gap-2">
          <CheckCircle className="w-4.5 h-4.5" /> {success}
        </div>
      )}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl font-bold flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5" /> {error}
        </div>
      )}

      {/* SUB-TAB CONTENTS */}

      {/* 1. USERS & COUPLES MANAGEMENT */}
      {activeSubTab === "users" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Add couple */}
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-500" /> הוספת זוג חדש
            </h3>

            <form onSubmit={handleAddCouple} className="space-y-3 text-xs leading-relaxed">
              <div>
                <label className="text-xxs font-bold text-gray-500 block text-right mb-1">שם הזוג (Couple Name)</label>
                <input
                  type="text"
                  placeholder="לדוגמה: משפחת כהן / נוי וגל"
                  value={newCoupleName}
                  onChange={(e) => setNewCoupleName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 text-gray-800 border border-gray-250 focus:border-emerald-500 focus:bg-white rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="text-xxs font-bold text-gray-500 block text-right mb-1">מזהה ייחודי (couple_id) - אופציונלי</label>
                <input
                  type="text"
                  placeholder="למשל: c001 (או ייווצר אוטומטית)"
                  value={coupleIdInput}
                  onChange={(e) => setCoupleIdInput(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 text-gray-800 border border-gray-250 focus:border-emerald-500 focus:bg-white rounded-lg outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                שמור את הזוג
              </button>
            </form>

            {/* Couple List */}
            <div className="border-t border-gray-100 pt-3.5 space-y-2">
              <span className="text-xxs font-bold text-gray-400 block">• זוגות חברים המשתתפים ({couples.length})</span>
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1 divide-y divide-gray-50">
                {couples.map(cp => (
                  <div key={cp.couple_id} className="pt-2 flex items-center justify-between text-xxs font-semibold">
                    <span className="text-gray-800">{cp.couple_name} <span className="font-mono text-gray-400">({cp.couple_id})</span></span>
                    <button
                      onClick={() => handleDeleteCouple(cp.couple_id, cp.couple_name)}
                      className="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Profile matching */}
          <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-gray-800">שיוך וזיהוי משתמשים לזוגות</h3>
            <p className="text-xxs text-gray-400">מספר משתמשים יכולים להירשם תחת ה-couple_id של אותו זוג.</p>

            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-right text-xxs divide-y divide-gray-150">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 font-bold text-gray-500">שם משתמש</th>
                    <th className="px-3 py-3 font-bold text-gray-500">כתובת אימייל</th>
                    <th className="px-3 py-3 font-bold text-gray-500">שיוך לזוג</th>
                    <th className="px-3 py-3 font-bold text-gray-500">הרשאה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {/* Dynamic mock user profiles fetch via inline state listener of provider users */}
                  {/* Since users snapshot loaded dynamically inside FirebaseProvider */}
                  {/* Simply listening and presenting all available users */}
                  {/* Wait! How to display users in provider if not in current state? Let's subscribe inside user profile collection */}
                  {/* Oh: Since we don't have user profiles full list (security rules), wait - we added users allow list: if isSignedIn(), so we have permission indeed! Let's handle loading full list of users. */}
                  {/* Let's write the table listening dynamically! */}
                  {/* We can listen to users directly from collection in Admin state */}
                  <UsersList couples={couples} onAssign={handleAssignCouple} onToggleAdmin={handleToggleAdmin} />
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 2. MATCH INDIVIDUAL EDITOR */}
      {activeSubTab === "matches" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Match Form */}
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
              <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-1.5">
                {editingMatch ? (
                  <>
                    <Pencil className="w-3.5 h-3.5 text-amber-500" />
                    <span>עריכת משחק</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-emerald-500" />
                    <span>הוספת משחק בודד</span>
                  </>
                )}
              </h3>
              {editingMatch && (
                <button
                  type="button"
                  id="cancel-match-edit-btn"
                  onClick={handleCancelEdit}
                  className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-lg text-4xs font-black flex items-center gap-1 cursor-pointer transition-colors border border-gray-100"
                >
                  <X className="w-3 h-3" />
                  <span>ביטול</span>
                </button>
              )}
            </div>

            {editingMatch && (
              <div className="bg-amber-50 text-amber-800 p-2.5 rounded-xl text-xxs font-medium border border-amber-100 leading-normal mb-2">
                אתם עורכים כעת את משחק <span className="font-extrabold">{editingMatch.team_a} vs {editingMatch.team_b}</span>. 
                מזהה המשחק {editingMatch.match_id} נעול לעדכון עצמו.
              </div>
            )}

            <form onSubmit={handleAddMatch} className="space-y-3.5 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs font-bold text-gray-500 block text-right mb-1">מזהה (E.g. m1)</label>
                  <input
                    type="text"
                    placeholder="m001"
                    value={matchId}
                    onChange={(e) => setMatchId(e.target.value)}
                    disabled={!!editingMatch}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-250 focus:border-emerald-500 focus:bg-white rounded-lg outline-none font-mono disabled:opacity-55"
                  />
                </div>
                <div>
                  <label className="text-xxs font-bold text-gray-500 block text-right mb-1">שלב / בית</label>
                  <input
                    type="text"
                    placeholder="בית א'"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-250 focus:border-emerald-500 focus:bg-white rounded-lg outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs font-bold text-gray-500 block text-right mb-1">קבוצה א'</label>
                  <input
                    type="text"
                    placeholder="ארצות הברית"
                    value={teamA}
                    onChange={(e) => setTeamA(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-250 focus:border-emerald-500 focus:bg-white rounded-lg outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xxs font-bold text-gray-500 block text-right mb-1">קבוצה ב'</label>
                  <input
                    type="text"
                    placeholder="מקסיקו"
                    value={teamB}
                    onChange={(e) => setTeamB(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-250 focus:border-emerald-500 focus:bg-white rounded-lg outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs font-bold text-gray-500 block text-right mb-1">תאריך (DD/MM/YYYY)</label>
                  <input
                    type="text"
                    placeholder="11/06/2026"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-250 focus:border-emerald-500 focus:bg-white rounded-lg outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xxs font-bold text-gray-500 block text-right mb-1">שעה (HH:MM)</label>
                  <input
                    type="text"
                    placeholder="22:30"
                    value={matchTime}
                    onChange={(e) => setMatchTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-250 focus:border-emerald-500 focus:bg-white rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs font-bold text-gray-500 block text-right mb-1">עיר מארחת</label>
                  <input
                    type="text"
                    placeholder="לוס אנג'לס"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-250 focus:border-emerald-500 focus:bg-white rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-xxs font-bold text-gray-500 block text-right mb-1">ערוץ שידור</label>
                  <input
                    type="text"
                    placeholder="כאן 11"
                    value={broadcast}
                    onChange={(e) => setBroadcast(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-250 focus:border-emerald-500 focus:bg-white rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xxs font-bold text-gray-500 block text-right mb-1">זמן נעילת ניחוש (דקות לפני בעיטה)</label>
                <input
                  type="number"
                  placeholder="5"
                  value={lockTimeInMins}
                  onChange={(e) => setLockTimeInMins(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-250 focus:border-emerald-500 focus:bg-white rounded-lg outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  editingMatch 
                    ? "bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400" 
                    : "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400"
                }`}
              >
                {editingMatch ? "עדכן משחק בלוח" : "שמור משחק בלוח"}
              </button>
            </form>
          </div>

          {/* Table display */}
          <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-50 pb-3">
              <h3 className="font-extrabold text-sm text-gray-800">רשימת משחקי מונדיאל הנוכחיים ({matches.length})</h3>
              
              {/* Date Sorting Controls */}
              <div className="flex items-center gap-2">
                <span className="text-xxs font-bold text-gray-400 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-emerald-500" />
                  <span>מיון לפי תאריך:</span>
                </span>
                <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setAdminSortBy("date-asc")}
                    className={`px-2.5 py-1 text-4xs font-black rounded-md cursor-pointer transition-colors ${
                      adminSortBy === "date-asc"
                        ? "bg-emerald-650 text-white shadow-xxs"
                        : "text-gray-500 hover:text-gray-800 bg-transparent"
                    }`}
                  >
                    ישן לחדש
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminSortBy("date-desc")}
                    className={`px-2.5 py-1 text-4xs font-black rounded-md cursor-pointer transition-colors ${
                      adminSortBy === "date-desc"
                        ? "bg-emerald-650 text-white shadow-xxs"
                        : "text-gray-500 hover:text-gray-800 bg-transparent"
                    }`}
                  >
                    חדש לישן
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-120 overflow-y-auto border border-gray-100 rounded-xl">
              <table className="w-full text-right text-xxs divide-y divide-gray-150">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3">קוד</th>
                    <th className="px-3 py-3">משלב / בית</th>
                    <th className="px-3 py-3">מפגש</th>
                    <th className="px-3 py-3">תאריך ושעה</th>
                    <th className="px-3 py-3 text-left">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 text-gray-700 font-sans">
                  {[...matches]
                    .sort((a, b) => {
                      const parseDateTime = (d: string, t: string) => {
                        try {
                          const pts = d.split(/[/.-]/).map(p => p.trim());
                          const day = Number(pts[0] || 1);
                          const month = Number(pts[1] || 6);
                          const year = Number(pts[2] || 2026);
                          const [hour, minute] = (t || "20:00").split(":").map(Number);
                          return new Date(year, month - 1, day, hour, minute).getTime();
                        } catch (e) {
                          return 0;
                        }
                      };
                      const timeA = parseDateTime(a.match_date, a.match_time);
                      const timeB = parseDateTime(b.match_date, b.match_time);
                      return adminSortBy === "date-asc" ? timeA - timeB : timeB - timeA;
                    })
                    .map(m => {
                      const isCurrentlyEditing = editingMatch?.match_id === m.match_id;
                      return (
                        <tr 
                          key={m.match_id}
                          className={`transition-colors ${isCurrentlyEditing ? "bg-amber-50/50" : "hover:bg-gray-50/40"}`}
                        >
                          <td className="px-3 py-3.5 font-mono text-gray-400">{m.match_id}</td>
                          <td className="px-3 py-3.5"><span className="px-2 py-0.5 bg-gray-100 rounded-full font-bold">{m.group_name}</span></td>
                          <td className="px-3 py-3.5 font-bold">
                            <span className="text-gray-800">{m.team_a}</span>
                            <span className="text-gray-450 font-normal px-1">vs</span>
                            <span className="text-gray-800">{m.team_b}</span>
                          </td>
                          <td className="px-3 py-3.5 font-mono text-gray-600">{m.match_date} - {m.match_time}</td>
                          <td className="px-3 py-3.5 text-left">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditClick(m)}
                                className={`p-1.5 rounded cursor-pointer transition-colors ${
                                  isCurrentlyEditing
                                    ? "text-amber-700 bg-amber-100 hover:bg-amber-200"
                                    : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 bg-transparent border-none"
                                }`}
                                title="עדכן את נתוני המשחק"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMatch(m.match_id, `${m.team_a} vs ${m.team_b}`)}
                                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded bg-transparent border-none cursor-pointer"
                                title="מחק משחק"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 3. SPREADSHEET BULK DATA IMPORT SECTION */}
      {activeSubTab === "import" && (
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-1.5">
              <Upload className="w-5 h-5 text-emerald-500" />
              ממשק יבוא נתונים ישירות מגליון Excel / Google Sheets
            </h3>
            <p className="text-xxs text-gray-400 leading-normal mt-1">
              פעולה זו מאפשרת להזין את כל לוח המשחקים בכמה שניות ללא צורך בהקשה ידנית!
              העתק את השורות ישירות מהגליון (עם העמודות הנדרשות) והדבק אותן ממש כאן למטה, כוון את תקינות מיקומי העמודות ובצע ניתוח מקדים.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form settings */}
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <h4 className="font-bold">הגדרת מיקומי עמודות (0 = עמודה ראשונה)</h4>
                <button
                  type="button"
                  onClick={() => {
                    setColTeamA(7);
                    setColTeamB(6);
                    setColDate(10);
                    setColTime(9);
                    setColGroupName(11);
                    setColCity(3);
                    setColStage(12);
                    setColMatchId(14);
                    setColBroadcast(5);
                    showSuccess("שוחזרו הגדרות ברירת המחדל של טבלת כאן 11!");
                  }}
                  className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded hover:bg-emerald-100 transition-colors"
                >
                  איפוס למבנה כאן 11 📺
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xxs text-gray-500 block mb-1">קבוצה א' (נבחרת בית)</label>
                  <input type="number" value={colTeamA} onChange={e => setColTeamA(Number(e.target.value))} className="w-full p-2 bg-gray-50 rounded border border-gray-250 font-mono text-center" />
                </div>
                <div>
                  <label className="text-xxs text-gray-500 block mb-1">קבוצה ב' (נבחרת חוץ)</label>
                  <input type="number" value={colTeamB} onChange={e => setColTeamB(Number(e.target.value))} className="w-full p-2 bg-gray-50 rounded border border-gray-250 font-mono text-center" />
                </div>
                <div>
                  <label className="text-xxs text-gray-500 block mb-1">עמודת תאריך</label>
                  <input type="number" value={colDate} onChange={e => setColDate(Number(e.target.value))} className="w-full p-2 bg-gray-50 rounded border border-gray-250 font-mono text-center" />
                </div>
                <div>
                  <label className="text-xxs text-gray-500 block mb-1">עמודת שעה</label>
                  <input type="number" value={colTime} onChange={e => setColTime(Number(e.target.value))} className="w-full p-2 bg-gray-50 rounded border border-gray-250 font-mono text-center" />
                </div>
                <div>
                  <label className="text-xxs text-gray-500 block mb-1">עמודת בית (A, B...)</label>
                  <input type="number" value={colGroupName} onChange={e => setColGroupName(Number(e.target.value))} className="w-full p-2 bg-gray-50 rounded border border-gray-250 font-mono text-center" />
                </div>
                <div>
                  <label className="text-xxs text-gray-500 block mb-1">עמודת שלב</label>
                  <input type="number" value={colStage} onChange={e => setColStage(Number(e.target.value))} className="w-full p-2 bg-gray-50 rounded border border-gray-250 font-mono text-center" />
                </div>
                <div>
                  <label className="text-xxs text-gray-500 block mb-1">עמודת מזהה (match_id)</label>
                  <input type="number" value={colMatchId} onChange={e => setColMatchId(Number(e.target.value))} className="w-full p-2 bg-gray-50 rounded border border-gray-250 font-mono text-center" />
                </div>
                <div>
                  <label className="text-xxs text-gray-500 block mb-1">עמודת ערוץ שידור</label>
                  <input type="number" value={colBroadcast} onChange={e => setColBroadcast(Number(e.target.value))} className="w-full p-2 bg-gray-50 rounded border border-gray-250 font-mono text-center" />
                </div>
                <div className="col-span-2">
                  <label className="text-xxs text-gray-500 block mb-1">עמודת עיר/אצטדיון</label>
                  <input type="number" value={colCity} onChange={e => setColCity(Number(e.target.value))} className="w-full p-2 bg-gray-50 rounded border border-gray-250 font-mono text-center" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked={hasHeader} onChange={e => setHasHeader(e.target.checked)} className="cursor-pointer" />
                  שורת כותרת ראשונה
                </label>

                <select value={delimiter} onChange={e => setDelimiter(e.target.value as any)} className="p-1 px-2 border rounded cursor-pointer">
                  <option value="\t">טאב (Tab - Excel Default)</option>
                  <option value=",">פסיק (CSV)</option>
                  <option value="|">קו אנכי (|)</option>
                </select>
              </div>

              <button
                onClick={handleParseSpreadsheet}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                בצע ניתוח מקדים
              </button>
            </div>

            {/* Input payload box */}
            <div className="lg:col-span-2 space-y-3">
              <label className="text-xs font-bold text-gray-600 block text-right">הדבק כאן את תוכן הגליון</label>
              <textarea
                placeholder="Team A	Team B	Date	Time	Group	City&#10;USA	Mexico	11/06/2026	22:30	Group A	Los Angeles&#10;Canada	France	12/06/2026	18:00	Group B	Toronto"
                value={pasteData}
                onChange={e => setPasteData(e.target.value)}
                className="w-full h-48 p-3 bg-gray-50 rounded-xl outline-none font-mono text-xxs border border-gray-250 tracking-wide leading-normal"
                dir="ltr"
              />
            </div>

          </div>

          {/* parsed preview list */}
          {previewMatches.length > 0 && (
            <div className="border-t border-gray-100 pt-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-gray-700">תצוגה מקדימה ליבוא: נמצאו {previewMatches.length} משחקים תקינים 🔍</span>
                <button
                  onClick={handleImportMatches}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  בצע יבוא עכשווי לגבי כולם
                </button>
              </div>

              <div className="overflow-x-auto border border-gray-100 rounded-xl max-h-72 shadow-xxs">
                <table className="w-full text-right text-xxs divide-y divide-gray-100">
                  <thead className="bg-gray-50 text-gray-600 text-[10px]">
                    <tr>
                      <th className="px-3 py-2.5 font-bold">קוד משחק</th>
                      <th className="px-3 py-2.5 font-bold">בית / שלב</th>
                      <th className="px-3 py-2.5 font-bold">קבוצה א' (בית)</th>
                      <th className="px-3 py-2.5 font-bold">קבוצה ב' (חוץ)</th>
                      <th className="px-3 py-2.5 font-bold">תאריך ושעה</th>
                      <th className="px-3 py-2.5 font-bold">ערוץ שידור</th>
                      <th className="px-3 py-2.5 font-bold">עיר / אצטדיון</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {previewMatches.map((m, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-3 py-2 font-mono font-bold text-gray-400">{m.match_id}</td>
                        <td className="px-3 py-2 text-gray-500 font-semibold">{m.group_name}</td>
                        <td className="px-3 py-2 font-bold text-emerald-800">{m.team_a}</td>
                        <td className="px-3 py-2 font-bold text-indigo-800">{m.team_b}</td>
                        <td className="px-3 py-2 font-mono text-gray-600">{m.match_date} - {m.match_time}</td>
                        <td className="px-3 py-2 font-bold text-pink-600">{m.broadcast_channel || "—"}</td>
                        <td className="px-3 py-2 text-gray-400">{m.city || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. ACTUAL SCORE UPDATER */}
      {activeSubTab === "scores" && (
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-sm text-gray-800">עדכון תוצאות אמת של משחקים ששוחקו</h3>
            <p className="text-xxs text-gray-400 mt-1">חישוב הניקוד מתבצע אוטומטית לכל הניחושים ברגע הפעולה!</p>
          </div>

          <div className="space-y-4 divide-y divide-gray-100 max-h-120 overflow-y-auto pr-1">
            {matches.map(m => {
              const currentEdit = editingScores[m.match_id] || { home: "", away: "" };
              const resolved = m.match_status === "finished";

              return (
                <div key={m.match_id} className="pt-4 first:pt-0 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-gray-150 text-gray-600 font-bold text-xxs block sm:inline-block sm:ml-2">{m.group_name}</span>
                    <strong className="text-gray-900 text-sm">{m.team_a} vs {m.team_b}</strong>
                    <span className="text-xxs text-gray-400 font-mono block mt-1">{m.match_date} {m.match_time ? `• ${m.match_time}` : ""}</span>
                  </div>

                  {/* input actions */}
                  <div className="flex items-center gap-3">
                    {resolved ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 block font-bold">תוצאה חתומה:</span>
                        <div className="font-mono font-black text-sm bg-gray-900 text-white px-3 py-1 rounded-lg">
                          {m.actual_team_a_goals} : {m.actual_team_b_goals}
                        </div>
                        <button
                          onClick={() => {
                            setEditingScores(prev => ({
                              ...prev,
                              [m.match_id]: { 
                                home: String(m.actual_team_a_goals || 0), 
                                away: String(m.actual_team_b_goals || 0) 
                              }
                            }));
                          }}
                          className="px-2 py-1 text-emerald-600 hover:bg-emerald-50 text-xxs font-bold border rounded cursor-pointer"
                        >
                          תיקון תוצאה
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-mono">
                        <input
                          id={`score-home-${m.match_id}`}
                          type="number"
                          placeholder="0"
                          min={0}
                          value={currentEdit.home}
                          onChange={e => setEditingScores({
                            ...editingScores,
                            [m.match_id]: { ...currentEdit, home: e.target.value }
                          })}
                          className="w-12 p-1.5 border rounded-lg text-center font-bold"
                        />
                        <span className="text-gray-400">:</span>
                        <input
                          id={`score-away-${m.match_id}`}
                          type="number"
                          placeholder="0"
                          min={0}
                          value={currentEdit.away}
                          onChange={e => setEditingScores({
                            ...editingScores,
                            [m.match_id]: { ...currentEdit, away: e.target.value }
                          })}
                          className="w-12 p-1.5 border rounded-lg text-center font-bold"
                        />

                        <button
                          id={`save-score-btn-${m.match_id}`}
                          onClick={() => handleSaveMatchScore(m)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xxs font-bold cursor-pointer transition-transform active:scale-95 flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" /> שמור
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. BONUS OUTCOMES WINNERS */}
      {activeSubTab === "bonus" && (
        <form onSubmit={handleSaveBonusOutcomes} className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-6 max-w-2xl">
          <div>
            <h3 className="font-extrabold text-sm text-gray-800">הזנת תוצאות הבונוס הרשמיות של הטורניר</h3>
            <p className="text-xxs text-gray-400 mt-1">
              בהתאם לתוצאות שתזין כאן, המנוע יחשב את נקודות המענק לכלל המשתמשים ויוסיף לחשבון הסופי.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-gray-500 block text-right">האלופה בפועל (מחזיקת הגביע)</label>
              <input
                type="text"
                value={wcWinner}
                onChange={e => setWcWinner(e.target.value)}
                placeholder="למשל: ארגנטינה"
                className="w-full p-2.5 bg-gray-50 border rounded-lg font-medium outline-none"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-gray-500 block text-right">סגנית האלופה בפועל</label>
              <input
                type="text"
                value={wcRunnerUp}
                onChange={e => setWcRunnerUp(e.target.value)}
                placeholder="למשל: צרפת"
                className="w-full p-2.5 bg-gray-50 border rounded-lg font-medium outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-gray-500 block text-right">מלך השערים בפועל</label>
              <input
                type="text"
                value={topScorerVal}
                onChange={e => setTopScorerVal(e.target.value)}
                placeholder="למשל: אמבפה"
                className="w-full p-2.5 bg-gray-50 border rounded-lg font-medium outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-gray-500 block text-right">הפתעת הטורניר בפועל</label>
              <input
                type="text"
                value={surpriseVal}
                onChange={e => setSurpriseVal(e.target.value)}
                placeholder="למשל: קרואטיה"
                className="w-full p-2.5 bg-gray-50 border rounded-lg font-medium outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer"
          >
            שמור תוצאות בונוסים וחשב נקודות
          </button>
        </form>
      )}

      {/* 6. SETTINGS POINTS CONFIG */}
      {activeSubTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-6 max-w-2xl">
          <div>
            <h3 className="font-extrabold text-sm text-gray-800">הגדרת מדד חוקי הניקוד (Point System Settings)</h3>
            <p className="text-xxs text-gray-400 mt-1">התאמת משקל הנקודות המוענקות לפי סוגי הניחוש התואמים.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-right">
            
            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-gray-500 block">תוצאה מדויקת (עבור ניחוש מדויק)</label>
              <input type="number" value={exactScorePoints} onChange={e => setExactScorePoints(Number(e.target.value))} className="w-full p-2 bg-gray-50 rounded border text-center font-bold" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-gray-500 block">מנצחת או תיקו שלם נכון (נקודות בסיס)</label>
              <input type="number" value={correctWinnerPoints} onChange={e => setCorrectWinnerPoints(Number(e.target.value))} className="w-full p-2 bg-gray-50 rounded border text-center font-bold" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-gray-500 block">מענק בונוס על הפרש שערים נכון</label>
              <input type="number" value={correctGoalDiffPoints} onChange={e => setCorrectGoalDiffPoints(Number(e.target.value))} className="w-full p-2 bg-gray-50 rounded border text-center font-bold" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-gray-500 block">בונוס אלופה (15 כברירת מחדל)</label>
              <input type="number" value={winnerPoints} onChange={e => setWinnerPoints(Number(e.target.value))} className="w-full p-2 bg-gray-50 rounded border text-center font-bold" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-gray-500 block">בונוס סגנית (10 כברירת מחדל)</label>
              <input type="number" value={runnerPoints} onChange={e => setRunnerPoints(Number(e.target.value))} className="w-full p-2 bg-gray-50 rounded border text-center font-bold" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-gray-500 block">בונוס מלך שערים (10 כברירת מחדל)</label>
              <input type="number" value={scorerPoints} onChange={e => setScorerPoints(Number(e.target.value))} className="w-full p-2 bg-gray-50 rounded border text-center font-bold" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-gray-500 block">בונוס הפתעת הטורניר (5 כברירת מחדל)</label>
              <input type="number" value={surprisePoints} onChange={e => setSurprisePoints(Number(e.target.value))} className="w-full p-2 bg-gray-50 rounded border text-center font-bold" />
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer"
          >
            שמור והחל על הדירוג הקיים
          </button>
        </form>
      )}

      {/* Custom Confirmation Modal */}
      {deleteConfirmTarget && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          style={{ direction: "rtl" }}
        >
          <div className="bg-white rounded-2xl border border-gray-150 shadow-2xl max-w-md w-full p-6 text-right space-y-5 animate-scale-up">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1 overflow-hidden">
                <h4 className="font-extrabold text-gray-900 text-sm">אישור מחיקה</h4>
                <p className="text-xxs text-gray-500 leading-relaxed">
                  האם אתם בטוחים שברצונכם למחוק את {deleteConfirmTarget.type === "couple" ? "הזוג" : "המשחק"}:
                </p>
                <div className="bg-rose-50/40 text-rose-950 px-3 py-2 rounded-lg font-bold text-xxs border border-rose-100/40 mt-1 max-w-full truncate">
                  {deleteConfirmTarget.name}
                </div>
              </div>
            </div>

            <p className="text-4xs text-gray-400 font-medium">* שימו לב: פעולה זו היא בלתי הפיכה ותמחק לצמיתות את המידע ממאגר הנתונים.</p>

            <div className="flex gap-2.5 pt-1.5">
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={loading}
                className="flex-1 py-1.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xxs font-bold rounded-xl cursor-pointer disabled:bg-gray-300 transition-colors"
              >
                {loading ? "מוחק..." : "כן, למחוק"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                disabled={loading}
                className="flex-1 py-1.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-650 hover:text-gray-800 text-xxs font-bold border border-gray-200 rounded-xl cursor-pointer transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

/**
 * Inner component to handle asynchronous loading and real-time listening of registered users profile collections
 */
const UsersList: React.FC<{
  couples: Couple[];
  onAssign: (uid: string, cid: string) => Promise<void>;
  onToggleAdmin: (uid: string, currentRole: string) => Promise<void>;
}> = ({ couples, onAssign, onToggleAdmin }) => {
  const [users, setUsers] = useState<User[]>([]);

  React.useEffect(() => {
    // Read user collections securely
    const q = collection(db, "users");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: User[] = [];
      snapshot.forEach(doc => {
        items.push(doc.data() as User);
      });
      setUsers(items);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      {users.map(u => (
        <tr key={u.user_id} className="hover:bg-gray-50/50">
          <td className="px-3 py-3 border-b text-gray-950 font-bold">{u.display_name}</td>
          <td className="px-3 py-3 border-b text-gray-500 font-mono">{u.email}</td>
          <td className="px-3 py-3 border-b">
            <select
              value={u.couple_id || ""}
              onChange={(e) => onAssign(u.user_id, e.target.value)}
              className="p-1.5 border border-gray-200 rounded text-xxs font-sans"
            >
              <option value="">-- בחר שיוך לזוג --</option>
              {couples.map(cp => (
                <option key={cp.couple_id} value={cp.couple_id}>
                  {cp.couple_name}
                </option>
              ))}
            </select>
          </td>
          <td className="px-3 py-3 border-b">
            <button
              onClick={() => onToggleAdmin(u.user_id, u.role)}
              className={`px-2 py-1 rounded text-xxxxs font-bold uppercase transition-all ${
                u.role === "Admin" 
                  ? "bg-rose-50 text-rose-700 border border-rose-100" 
                  : "bg-gray-50 text-gray-600 border"
              }`}
            >
              {u.role === "Admin" ? "מנהל מערכת" : "משתתף רגיל"}
            </button>
          </td>
        </tr>
      ))}
    </>
  );
};
