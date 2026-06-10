import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User as FirebaseUser, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection, 
  onSnapshot, 
  query,
  getDocFromServer
} from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { 
  User, 
  Couple, 
  Match, 
  Prediction, 
  BonusPrediction, 
  TournamentResults, 
  Setting,
  CoupleScore,
  parseFirestoreDate,
  getMatchKickoffDate
} from "../types";
import { calculateMatchPredictionPoints, calculateBonusPoints } from "./ScoreCalculation";

interface FirebaseContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  couples: Couple[];
  matches: Match[];
  predictions: Prediction[];
  bonusPredictions: BonusPrediction[];
  tournamentResults: TournamentResults | null;
  settings: Setting;
  loading: boolean;
  leaderboard: CoupleScore[];
  authError: string | null;
  clearAuthError: () => void;
  
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  savePrediction: (matchId: string, homeGoals: number, awayGoals: number, comment?: string) => Promise<void>;
  saveBonusPrediction: (worldCupWinner: string, runnerUp: string, topScorer: string, surpriseTeam: string) => Promise<void>;
  registerUser: (displayName: string, coupleId: string, customNewCoupleName?: string) => Promise<void>;
  recalculatePoints: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Setting = {
  setting_id: "default",
  correct_winner_points: 3,
  correct_goal_diff_points: 2,
  exact_score_points: 7,
  world_cup_winner_points: 15,
  runner_up_points: 10,
  top_scorer_points: 10,
  surprise_team_points: 5,
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  
  const [couples, setCouples] = useState<Couple[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [bonusPredictions, setBonusPredictions] = useState<BonusPrediction[]>([]);
  const [tournamentResults, setTournamentResults] = useState<TournamentResults | null>(null);
  const [settings, setSettings] = useState<Setting>(DEFAULT_SETTINGS);
  
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<CoupleScore[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const clearAuthError = () => setAuthError(null);

  // 1. Listen to Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentUser(fbUser);
      if (fbUser) {
        try {
          // Subscribe to User profile
          const userDocRef = doc(db, "users", fbUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data() as User;
            // Auto-update Admin role to ensure synchronization
            if (fbUser.email === "shelly.jencmen@gmail.com" && data.role !== "Admin") {
              await updateDoc(userDocRef, { role: "Admin" });
              data.role = "Admin";
            }
            setUserProfile(data);
          } else {
            setUserProfile(null); // Onboard screen will catch this
          }
        } catch (err) {
          console.error("Error reading user profile:", err);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    // Test Firestore connection on boot as requested by Firebase Integration Skill
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error: any) {
        if (error instanceof Error && error.message.includes("offline")) {
          console.warn("Firebase client is currently offline.");
        }
      }
    };
    testConnection();

    return () => unsubscribe();
  }, []);

  // 2. Real-time subscriptions when signed in
  useEffect(() => {
    if (!currentUser) {
      setCouples([]);
      setMatches([]);
      setPredictions([]);
      setBonusPredictions([]);
      setTournamentResults(null);
      setSettings(DEFAULT_SETTINGS);
      return;
    }

    // Subscribe to couples
    const unsubscribeCouples = onSnapshot(collection(db, "couples"), (snapshot) => {
      const items: Couple[] = [];
      snapshot.forEach(doc => {
        items.push(doc.data() as Couple);
      });
      setCouples(items);
    }, (error) => handleFirestoreError(error, OperationType.GET, "couples"));

    // Subscribe to matches
    const unsubscribeMatches = onSnapshot(collection(db, "matches"), (snapshot) => {
      const items: Match[] = [];
      snapshot.forEach(doc => {
        items.push(doc.data() as Match);
      });
      // Sort matches robustly by human-readable kickoff date and time
      items.sort((a, b) => {
        const timeA = getMatchKickoffDate(a).getTime();
        const timeB = getMatchKickoffDate(b).getTime();
        return timeA - timeB;
      });
      setMatches(items);
    }, (error) => handleFirestoreError(error, OperationType.GET, "matches"));

    // Subscribe to predictions
    const unsubscribePredictions = onSnapshot(collection(db, "predictions"), (snapshot) => {
      const items: Prediction[] = [];
      snapshot.forEach(doc => {
        items.push(doc.data() as Prediction);
      });
      setPredictions(items);
    }, (error) => handleFirestoreError(error, OperationType.GET, "predictions"));

    // Subscribe to bonus predictions
    const unsubscribeBonus = onSnapshot(collection(db, "bonusPredictions"), (snapshot) => {
      const items: BonusPrediction[] = [];
      snapshot.forEach(doc => {
        items.push(doc.data() as BonusPrediction);
      });
      setBonusPredictions(items);
    }, (error) => handleFirestoreError(error, OperationType.GET, "bonusPredictions"));

    // Subscribe to tournament results
    const unsubscribeResults = onSnapshot(collection(db, "tournamentResults"), (snapshot) => {
      let res: TournamentResults | null = null;
      snapshot.forEach(doc => {
        res = doc.data() as TournamentResults;
      });
      setTournamentResults(res);
    }, (error) => handleFirestoreError(error, OperationType.GET, "tournamentResults"));

    // Subscribe to settings
    const unsubscribeSettings = onSnapshot(collection(db, "settings"), (snapshot) => {
      let setVal = DEFAULT_SETTINGS;
      snapshot.forEach(doc => {
        if (doc.id === "default") {
          setVal = doc.data() as Setting;
        }
      });
      setSettings(setVal);
    }, (error) => handleFirestoreError(error, OperationType.GET, "settings"));

    // Sync active profile edits
    const unsubscribeUserProfile = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as User);
      }
    });

    return () => {
      unsubscribeCouples();
      unsubscribeMatches();
      unsubscribePredictions();
      unsubscribeBonus();
      unsubscribeResults();
      unsubscribeSettings();
      unsubscribeUserProfile();
    };
  }, [currentUser]);

  // 3. Dynamic Live Leaderboard Calculation
  // Computes rankings based on loaded predictions and bonus points
  useEffect(() => {
    if (couples.length === 0) {
      setLeaderboard([]);
      return;
    }

    const ratings: CoupleScore[] = couples.map(cp => {
      const couplePreds = predictions.filter(pr => pr.couple_id === cp.couple_id);
      
      // Calculate match predictions point sum
      const predictionsPoints = couplePreds.reduce((sum, pr) => sum + (pr.points || 0), 0);
      
      // Calculate exact hits count (points equivalent to exact_score_points)
      const exactHitsCount = couplePreds.filter(pr => pr.points === settings.exact_score_points).length;

      // Calculate bonus points
      let bonusPoints = 0;
      const cBonus = bonusPredictions.find(b => b.couple_id === cp.couple_id);
      if (cBonus && tournamentResults) {
        const check = calculateBonusPoints(cBonus, tournamentResults, settings);
        bonusPoints = check.points;
      } else if (cBonus) {
        bonusPoints = cBonus.bonus_points || 0;
      }

      const totalPoints = predictionsPoints + bonusPoints;

      return {
        couple_id: cp.couple_id,
        couple_name: cp.couple_name,
        predictionsPoints,
        bonusPoints,
        totalPoints,
        exactHitsCount,
        ranking: 1
      };
    });

    // Sort by criteria: totalPoints desc, exactHitsCount desc, couple_name asc
    ratings.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (b.exactHitsCount !== a.exactHitsCount) {
        return b.exactHitsCount - a.exactHitsCount;
      }
      return a.couple_name.localeCompare(b.couple_name, 'he');
    });

    // Assign ranking, accounting for duplicate ties
    let curRank = 1;
    for (let i = 0; i < ratings.length; i++) {
      if (i > 0) {
        const prev = ratings[i - 1];
        const curr = ratings[i];
        if (curr.totalPoints !== prev.totalPoints || curr.exactHitsCount !== prev.exactHitsCount) {
          curRank = i + 1;
        }
      }
      ratings[i].ranking = curRank;
    }

    setLeaderboard(ratings);
  }, [couples, predictions, bonusPredictions, tournamentResults, settings]);

  // Google Sign-In using popup (preferred in preview container)
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      setLoading(true);
      setAuthError(null);
      const result = await signInWithPopup(auth, provider);
      
      // Verify if profile already exists
      const userDocRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as User);
      } else {
        // Force onboard flow
        setUserProfile(null);
      }
    } catch (err: any) {
      console.error("Google login failure:", err);
      let errMsg = "אירעה שגיאה בתהליך ההתחברות. אנא נסו שוב.";
      if (err?.code === "auth/unauthorized-domain") {
        errMsg = "auth/unauthorized-domain";
      } else if (err?.code === "auth/popup-blocked") {
        errMsg = "הדפדפן שלכם חסם את חלון ההתחברות (Popup Blocked). אנא אשרו חלונות קופצים בדפדפן עבור אתר זה ונסו שנית.";
      } else if (err?.code === "auth/popup-closed-by-user") {
        errMsg = "חלון ההתחברות נסגר לפני השלמת התהליך. נסו ללחוץ שוב ולהשלים את ההתחברות.";
      } else if (err?.code === "auth/network-request-failed") {
        errMsg = "שגיאת רשת. אנא ודאו שיש לכם חיבור אינטרנט תקין ונסו שוב.";
      } else if (err?.message) {
        errMsg = `שגיאת חיבור (${err.code || "unknown"}): ${err.message}`;
      }
      setAuthError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error("Logout failure:", err);
    } finally {
      setLoading(false);
    }
  };

  // Participant prediction saving
  const savePrediction = async (matchId: string, homeGoals: number, awayGoals: number, comment?: string) => {
    if (!currentUser || !userProfile) throw new Error("חובה להתחבר למערכת");
    const coupleId = userProfile.couple_id;
    if (!coupleId) throw new Error("משתמש אינו משויך לזוג עדיין");

    const matchRef = doc(db, "matches", matchId);
    const matchSnap = await getDoc(matchRef);
    if (!matchSnap.exists()) throw new Error("המשחק לא נמצא");
    
    const mData = matchSnap.data() as Match;
    const nowTime = new Date();
    const lockTime = parseFirestoreDate(mData.prediction_lock_time);
    
    // Check if locked, bypassed by admin_unlocked field
    const isLockedState = nowTime.getTime() >= lockTime.getTime() && !mData.admin_unlocked;
    
    if (isLockedState && userProfile.role !== "Admin") {
      throw new Error("הזמן ננעל! לא ניתן להזין או לערוך ניחוש למשחק זה");
    }

    const predictionId = `${coupleId}_${matchId}`;
    const predictionRef = doc(db, "predictions", predictionId);

    // Schema matching layout
    const predPayload: Prediction = {
      prediction_id: predictionId,
      match_id: matchId,
      couple_id: coupleId,
      home_goals: Number(homeGoals),
      away_goals: Number(awayGoals),
      comment: comment || "",
      points: 0,
      score_reason: "",
      updated_by: currentUser.uid,
      updated_at: new Date()
    };

    try {
      await setDoc(predictionRef, predPayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `predictions/${predictionId}`);
    }
  };

  // Participant long-term bonus predictions
  const saveBonusPrediction = async (
    worldCupWinner: string,
    runnerUp: string,
    topScorer: string,
    surpriseTeam: string
  ) => {
    if (!currentUser || !userProfile) throw new Error("חובה להתחבר למערכת");
    const coupleId = userProfile.couple_id;
    if (!coupleId) throw new Error("משתמש אינו משויך לזוג");

    const bonusId = coupleId;
    const bonusRef = doc(db, "bonusPredictions", bonusId);
    const bonusSnap = await getDoc(bonusRef);
    
    if (bonusSnap.exists()) {
      const ex = bonusSnap.data() as BonusPrediction;
      if (ex.locked) {
        throw new Error("ניחושי הבונוס נעולים כבר על ידי הטורניר או על ידי המערכת");
      }
    }

    const bonusPayload: BonusPrediction = {
      bonus_prediction_id: bonusId,
      couple_id: coupleId,
      world_cup_winner: worldCupWinner,
      runner_up: runnerUp,
      top_scorer: topScorer,
      surprise_team: surpriseTeam,
      bonus_points: 0,
      locked: false,
      submitted_at: new Date()
    };

    try {
      await setDoc(bonusRef, bonusPayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `bonusPredictions/${bonusId}`);
    }
  };

  // Onboard new user (bind user to a couple or create a new couple)
  const registerUser = async (displayName: string, coupleId: string, customNewCoupleName?: string) => {
    if (!currentUser) throw new Error("אין משתמש מחובר");

    let actualCoupleId = coupleId;
    const nowStamp = new Date();

    // If new couple registration is chosen
    if (actualCoupleId === "new_couple" && customNewCoupleName) {
      // Deterministic ID generation based on epoch
      actualCoupleId = "couple_" + Date.now();
      
      const newCoupleRef = doc(db, "couples", actualCoupleId);
      const couplePayload: Couple = {
        couple_id: actualCoupleId,
        couple_name: customNewCoupleName,
        active: true,
        created_at: nowStamp
      };

      try {
        await setDoc(newCoupleRef, couplePayload);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `couples/${actualCoupleId}`);
      }
    }

    if (!actualCoupleId || actualCoupleId === "new_couple") {
      throw new Error("עליך לבחור או להקים זוג חברים להשתתפות");
    }

    // Assign Admin role to bootstrapped email, otherwise Participant
    const assignedRole = currentUser.email === "shelly.jencmen@gmail.com" ? "Admin" : "Participant";

    const userPayload: User = {
      user_id: currentUser.uid,
      email: currentUser.email || "",
      display_name: displayName,
      couple_id: actualCoupleId,
      role: assignedRole,
      active: true,
      created_at: nowStamp
    };

    const userDocRef = doc(db, "users", currentUser.uid);
    try {
      await setDoc(userDocRef, userPayload);
      setUserProfile(userPayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
    }
  };

  // Admin recalculation invoke triggers score computations
  const recalculatePoints = async () => {
    if (!userProfile || userProfile.role !== "Admin") throw new Error("רק מנהל מערכת מורשה להריץ חישובים");
    
    // Evaluate match-by-match scores
    for (const match of matches) {
      if (match.match_status === "finished" && 
          match.actual_team_a_goals !== null && 
          match.actual_team_a_goals !== undefined && 
          match.actual_team_b_goals !== null && 
          match.actual_team_b_goals !== undefined) {
        
        // Find all predictions for this match
        const matchPreds = predictions.filter(pr => pr.match_id === match.match_id);
        
        for (const pred of matchPreds) {
          const calc = calculateMatchPredictionPoints(
            pred.home_goals,
            pred.away_goals,
            match.actual_team_a_goals,
            match.actual_team_b_goals,
            settings
          );

          if (pred.points !== calc.points || pred.score_reason !== calc.reason) {
            const predRef = doc(db, "predictions", pred.prediction_id);
            await updateDoc(predRef, {
              points: calc.points,
              score_reason: calc.reason,
              calculated_at: new Date()
            });
          }
        }
      }
    }

    // Evaluate Bonus predictions score if long-term results exist
    if (tournamentResults) {
      for (const bp of bonusPredictions) {
        const check = calculateBonusPoints(bp, tournamentResults, settings);
        if (bp.bonus_points !== check.points) {
          const bpRef = doc(db, "bonusPredictions", bp.bonus_prediction_id);
          await updateDoc(bpRef, {
            bonus_points: check.points,
            bonus_reason: check.explanation.join(", "),
            calculated_at: new Date()
          });
        }
      }
    }
  };

  return (
    <FirebaseContext.Provider value={{
      currentUser,
      userProfile,
      couples,
      matches,
      predictions,
      bonusPredictions,
      tournamentResults,
      settings,
      loading,
      leaderboard,
      authError,
      clearAuthError,
      
      signInWithGoogle,
      logout,
      savePrediction,
      saveBonusPrediction,
      registerUser,
      recalculatePoints
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};
