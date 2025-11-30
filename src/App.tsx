import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "./components/Header";
import { SummaryCard } from "./components/SummaryCard";
import { FloatingComposer } from "./components/FloatingComposer";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { TargetsScreen } from "./components/TargetsScreen";
import { MenuScreen } from "./components/MenuScreen";
import { OptionsScreen } from "./components/OptionsScreen";
import { LogScreen } from "./components/LogScreen";
import { SignupScreen } from "./components/SignupScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { Users, Target, UtensilsCrossed, Lightbulb, BookOpen, LogOut } from "lucide-react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { db } from "./lib/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

interface UserData {
  age: string;
  gender: string;
  height: string;
  weight: string;
  activityLevel: string;
  goal: string;
}

interface MenuItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: string;
}

interface LogEntry {
  item: MenuItem;
  timestamp: string;
}

interface Targets {
  bmi: number;
  bmr: number;
  tdee: number;
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

type Screen = "signup" | "onboarding" | "targets" | "menu" | "options" | "log" | "settings";

function AppContent() {
  const { user, loading: authLoading, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>("signup");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [targets, setTargets] = useState<Targets | null>(null);
  const [selectedItems, setSelectedItems] = useState<MenuItem[]>([]);
  const [loggedItems, setLoggedItems] = useState<LogEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Load user data from Firestore on login
  useEffect(() => {
    console.log("[APP] Auth state changed:", { user: user?.email, authLoading });

    if (authLoading) return; // Wait for auth to initialize

    if (user) {
      const loadUserData = async () => {
        setDataLoading(true);
        const loadStartTime = performance.now();
        try {
          console.log("[APP] Loading user data for:", user.uid);
          const userDocRef = doc(db, "users", user.uid);

          const firestoreStartTime = performance.now();

          // Add timeout to Firestore call (5 seconds max)
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Firestore timeout after 5s")), 5000)
          );

          const userDoc = await Promise.race([
            getDoc(userDocRef),
            timeoutPromise
          ]).catch((error) => {
            console.error("[APP] Firestore fetch failed:", error);
            // Return null to indicate failure
            return null;
          });

          const firestoreEndTime = performance.now();
          console.log(`[APP] Firestore fetch took ${(firestoreEndTime - firestoreStartTime).toFixed(0)}ms`);

          if (userDoc && userDoc.exists()) {
            const data = userDoc.data();
            console.log("[APP] User document exists:", data);
            if (data.profile) {
              setUserData(data.profile as UserData);
              if (data.targets) {
                setTargets(data.targets as Targets);
              } else {
                // Fallback: Recalculate targets based on loaded profile
                const calculatedTargets = calculateTargets(data.profile as UserData);
                if (calculatedTargets) {
                  setTargets(calculatedTargets);
                }
              }
              setCurrentScreen("targets"); // Go to targets if profile exists
            } else {
              console.log("[APP] No profile found, going to onboarding");
              setCurrentScreen("onboarding"); // Go to onboarding if no profile
            }

            if (data.logs) {
              setLoggedItems(data.logs as LogEntry[]);
            }
          } else {
            // New user or timeout
            console.log("[APP] New user or Firestore timeout, going to onboarding");
            setCurrentScreen("onboarding");
          }
        } catch (error) {
          console.error("[APP] Error loading user data:", error);
          // Still go to onboarding even if there's an error
          setCurrentScreen("onboarding");
        } finally {
          const loadEndTime = performance.now();
          console.log(`[APP] Total data loading took ${(loadEndTime - loadStartTime).toFixed(0)}ms`);
          setDataLoading(false);
        }
      };
      loadUserData();
    } else {
      console.log("[APP] No user, showing signup");
      setCurrentScreen("signup");
      setUserData(null);
      setTargets(null);
      setLoggedItems([]);
    }
  }, [user, authLoading]);

  // Save user profile and targets to Firestore
  const saveUserProfile = async (data: UserData) => {
    if (!user) return;
    try {
      const calculatedTargets = calculateTargets(data);
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        profile: data,
        targets: calculatedTargets
      }, { merge: true });
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  // Save logs to Firestore
  const saveLogEntry = async (entry: LogEntry) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        logs: arrayUnion(entry)
      });
    } catch (error) {
      console.error("Error saving log:", error);
    }
  };

  const removeLogEntry = async (entry: LogEntry) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        logs: arrayRemove(entry)
      });
    } catch (error) {
      console.error("Error removing log:", error);
    }
  };

  // Calculate BMI, BMR, TDEE, and macros
  const calculateTargets = (data: UserData): Targets | null => {
    const age = parseInt(data.age);
    const height = parseInt(data.height);
    const weight = parseInt(data.weight);

    // Validate inputs
    if (isNaN(age) || isNaN(height) || isNaN(weight) || age <= 0 || height <= 0 || weight <= 0) {
      return null;
    }

    // BMI calculation
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    // BMR calculation using Mifflin-St Jeor Equation
    let bmr: number;
    if (data.gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multipliers
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };

    // TDEE calculation
    const tdee = bmr * activityMultipliers[data.activityLevel];

    // Adjust for goal
    let dailyCalories = tdee;
    if (data.goal === "lose") {
      dailyCalories = tdee - 500; // 500 calorie deficit for weight loss
    } else if (data.goal === "gain") {
      dailyCalories = tdee + 300; // 300 calorie surplus for weight gain
    }

    // Macro calculations (30% protein, 40% carbs, 30% fats)
    const protein = Math.round((dailyCalories * 0.3) / 4); // 4 calories per gram
    const carbs = Math.round((dailyCalories * 0.4) / 4); // 4 calories per gram
    const fats = Math.round((dailyCalories * 0.3) / 9); // 9 calories per gram

    return {
      bmi,
      bmr,
      tdee,
      dailyCalories,
      macros: { protein, carbs, fats },
    };
  };

  const handleOnboardingComplete = (data: UserData) => {
    setUserData(data);
    const calculatedTargets = calculateTargets(data);
    if (calculatedTargets) {
      setTargets(calculatedTargets);
    }
    saveUserProfile(data);
    setCurrentScreen("targets");
  };

  const handleCalculateTargets = () => {
    if (userData) {
      const calculatedTargets = calculateTargets(userData);
      if (calculatedTargets) {
        setTargets(calculatedTargets);
        setCurrentScreen("targets");
      }
    }
  };

  const handleSelectItem = (item: MenuItem) => {
    setSelectedItems((prev) => {
      const isSelected = prev.some((i) => i.id === item.id);
      if (isSelected) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleLogItems = () => {
    if (selectedItems.length > 0) {
      const newEntries: LogEntry[] = selectedItems.map((item) => ({
        item,
        timestamp: new Date().toISOString(),
      }));
      setLoggedItems((prev) => [...prev, ...newEntries]);
      // Save to Firestore
      newEntries.forEach(entry => saveLogEntry(entry));
      setSelectedItems([]);
      // Navigate to log screen to show the newly logged items
      setCurrentScreen("log");
    }
  };

  const handleRemoveLogEntry = (index: number) => {
    const entryToRemove = loggedItems[index];
    setLoggedItems((prev) => prev.filter((_, i) => i !== index));
    if (entryToRemove) {
      removeLogEntry(entryToRemove);
    }
  };

  const handleAddManualMeal = (item: MenuItem) => {
    const newEntry: LogEntry = {
      item,
      timestamp: new Date().toISOString(),
    };
    setLoggedItems((prev) => [...prev, newEntry]);
    saveLogEntry(newEntry);
  };

  const handleGetSuggestions = () => {
    setCurrentScreen("options");
  };

  const handleSignupComplete = () => {
    setCurrentScreen("onboarding");
  };

  // Calculate consumed macros from logged items
  const consumedCalories = loggedItems.reduce((sum, entry) => sum + entry.item.calories, 0);
  const consumedProtein = loggedItems.reduce((sum, entry) => sum + entry.item.protein, 0);
  const consumedCarbs = loggedItems.reduce((sum, entry) => sum + entry.item.carbs, 0);
  const consumedFats = loggedItems.reduce((sum, entry) => sum + entry.item.fats, 0);

  const remainingCalories = targets ? targets.dailyCalories - consumedCalories : 0;

  // Check if onboarding form is valid
  const isOnboardingFormValid = userData && userData.age && userData.height && userData.weight;

  const navigationItems = [
    { id: "onboarding" as Screen, label: "Profile", icon: Users, disabled: false },
    { id: "targets" as Screen, label: "Targets", icon: Target, disabled: !targets },
    { id: "options" as Screen, label: "Suggestions", icon: Lightbulb, disabled: !targets },
    { id: "log" as Screen, label: "Log", icon: BookOpen, disabled: !targets },
  ];

  return (
    <div className="min-h-screen bg-[#0B0E14] pb-32">
      <Header onSettingsClick={() => setCurrentScreen("settings")} />

      {user && (
        <div className="absolute top-4 right-20 z-50">
          <button
            onClick={logout}
            className="p-2 text-[#9AA3B2] hover:text-red-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Navigation */}
          {targets && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex justify-center"
            >
              <div className="inline-flex items-center gap-2 p-2 rounded-full bg-[#121722]/60 backdrop-blur-xl border border-[#2A3242]">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => !item.disabled && setCurrentScreen(item.id)}
                    disabled={item.disabled}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${currentScreen === item.id
                      ? "bg-gradient-to-r from-[#22D3EE] to-[#14B8A6] text-[#0B0E14]"
                      : item.disabled
                        ? "text-[#9AA3B2]/40 cursor-not-allowed"
                        : "text-[#9AA3B2] hover:text-[#E6E9EF] hover:bg-[#2A3242]/50"
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Main Content */}
          <div className={`grid gap-6 ${targets ? "grid-cols-1 lg:grid-cols-[1fr_320px]" : "grid-cols-1"}`}>
            {/* Main Screen */}
            <div>
              <AnimatePresence mode="wait">
                {currentScreen === "signup" && (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <SignupScreen onComplete={handleSignupComplete} />
                  </motion.div>
                )}

                {currentScreen === "onboarding" && (
                  <motion.div
                    key="onboarding"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <OnboardingScreen
                      onComplete={handleOnboardingComplete}
                      initialData={userData}
                    />
                  </motion.div>
                )}

                {currentScreen === "targets" && targets && (
                  <motion.div
                    key="targets"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <TargetsScreen
                      bmi={targets.bmi}
                      bmr={targets.bmr}
                      tdee={targets.tdee}
                      dailyCalories={targets.dailyCalories}
                      macros={targets.macros}
                      onEditProfile={() => setCurrentScreen("onboarding")}
                    />
                  </motion.div>
                )}

                {currentScreen === "menu" && targets && (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <MenuScreen onSelectItem={handleSelectItem} selectedItems={selectedItems} />
                  </motion.div>
                )}

                {currentScreen === "options" && targets && (
                  <motion.div
                    key="options"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <OptionsScreen
                      dailyCalories={targets.dailyCalories}
                      remainingCalories={remainingCalories}
                      macros={{
                        protein: { consumed: consumedProtein, target: targets.macros.protein },
                        carbs: { consumed: consumedCarbs, target: targets.macros.carbs },
                        fats: { consumed: consumedFats, target: targets.macros.fats },
                      }}
                      onSelectItem={handleSelectItem}
                      selectedItems={selectedItems}
                    />
                  </motion.div>
                )}

                {currentScreen === "log" && targets && (
                  <motion.div
                    key="log"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <LogScreen
                      loggedItems={loggedItems}
                      onRemoveItem={handleRemoveLogEntry}
                      onAddManualMeal={handleAddManualMeal}
                    />
                  </motion.div>
                )}

                {currentScreen === "settings" && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <SettingsScreen />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Summary Card (Right Side) */}
            {targets && (
              <div className="hidden lg:block">
                <SummaryCard
                  dailyCalories={targets.dailyCalories}
                  consumedCalories={consumedCalories}
                  remainingCalories={remainingCalories}
                  macros={{
                    protein: { consumed: consumedProtein, target: targets.macros.protein },
                    carbs: { consumed: consumedCarbs, target: targets.macros.carbs },
                    fats: { consumed: consumedFats, target: targets.macros.fats },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Composer */}
      {targets && (
        <FloatingComposer
          currentScreen={currentScreen}
          onCalculate={undefined}
          onSuggest={currentScreen === "menu" ? handleGetSuggestions : undefined}
          onLog={selectedItems.length > 0 ? handleLogItems : undefined}
        />
      )}

      {currentScreen === "onboarding" && !targets && (
        <FloatingComposer
          currentScreen={currentScreen}
          onCalculate={handleCalculateTargets}
          onSuggest={undefined}
          onLog={undefined}
          isFormValid={!!isOnboardingFormValid}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}