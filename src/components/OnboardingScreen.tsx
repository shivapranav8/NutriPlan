import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { User, Ruler, Weight, Activity, Target } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface UserData {
  age: string;
  gender: string;
  height: string;
  weight: string;
  activityLevel: string;
  goal: string;
}

interface OnboardingScreenProps {
  onComplete: (data: UserData) => void;
  initialData?: UserData | null;
}

export function OnboardingScreen({ onComplete, initialData }: OnboardingScreenProps) {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    age: initialData?.age || "",
    gender: initialData?.gender || "male",
    height: initialData?.height || "",
    weight: initialData?.weight || "",
    activityLevel: initialData?.activityLevel || "moderate",
    goal: initialData?.goal || "maintain",
  });

  // Extract first name from Google account
  const firstName = user?.displayName?.split(' ')[0] || 'there';

  const handleSubmit = () => {
    if (isFormValid) {
      onComplete(userData);
    }
  };

  const isFormValid = userData.age && userData.height && userData.weight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl text-[#E6E9EF]">Welcome, {firstName}! 👋</h1>
        <p className="text-[#9AA3B2]">
          Let's set up your personalized nutrition plan
        </p>
      </div>

      <div className="rounded-2xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] shadow-2xl p-8 space-y-6">
        {/* Age & Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-[#E6E9EF]">
              <User className="w-4 h-4 text-[#22D3EE]" />
              Age
            </label>
            <input
              type="number"
              value={userData.age}
              onChange={(e) => setUserData({ ...userData, age: e.target.value })}
              placeholder="25"
              className="w-full px-4 py-2.5 rounded-full bg-[#0B0E14] border border-[#2A3242] text-[#E6E9EF] placeholder:text-[#9AA3B2] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-[#E6E9EF]">
              <User className="w-4 h-4 text-[#22D3EE]" />
              Gender
            </label>
            <div className="flex gap-2">
              {["male", "female"].map((gender) => (
                <button
                  key={gender}
                  onClick={() => setUserData({ ...userData, gender })}
                  className={`flex-1 px-4 py-2.5 rounded-full border transition-all ${userData.gender === gender
                    ? "bg-[#22D3EE] border-[#22D3EE] text-[#0B0E14]"
                    : "bg-[#0B0E14] border-[#2A3242] text-[#9AA3B2] hover:border-[#22D3EE]/50"
                    }`}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Height & Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-[#E6E9EF]">
              <Ruler className="w-4 h-4 text-[#14B8A6]" />
              Height (cm)
            </label>
            <input
              type="number"
              value={userData.height}
              onChange={(e) => setUserData({ ...userData, height: e.target.value })}
              placeholder="170"
              className="w-full px-4 py-2.5 rounded-full bg-[#0B0E14] border border-[#2A3242] text-[#E6E9EF] placeholder:text-[#9AA3B2] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-[#E6E9EF]">
              <Weight className="w-4 h-4 text-[#14B8A6]" />
              Weight (kg)
            </label>
            <input
              type="number"
              value={userData.weight}
              onChange={(e) => setUserData({ ...userData, weight: e.target.value })}
              placeholder="70"
              className="w-full px-4 py-2.5 rounded-full bg-[#0B0E14] border border-[#2A3242] text-[#E6E9EF] placeholder:text-[#9AA3B2] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/50 transition-all"
            />
          </div>
        </div>

        {/* Activity Level */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-[#E6E9EF]">
            <Activity className="w-4 h-4 text-[#22D3EE]" />
            Activity Level
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { value: "sedentary", label: "Sedentary" },
              { value: "light", label: "Light" },
              { value: "moderate", label: "Moderate" },
              { value: "active", label: "Active" },
              { value: "veryActive", label: "Very Active" },
            ].map((activity) => (
              <button
                key={activity.value}
                onClick={() => setUserData({ ...userData, activityLevel: activity.value })}
                className={`px-3 py-2 rounded-full border text-sm transition-all ${userData.activityLevel === activity.value
                  ? "bg-[#22D3EE] border-[#22D3EE] text-[#0B0E14]"
                  : "bg-[#0B0E14] border-[#2A3242] text-[#9AA3B2] hover:border-[#22D3EE]/50"
                  }`}
              >
                {activity.label}
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-[#E6E9EF]">
            <Target className="w-4 h-4 text-[#14B8A6]" />
            Goal
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {[
              { value: "lose", label: "Lose Weight" },
              { value: "maintain", label: "Maintain" },
              { value: "gain", label: "Gain Weight" },
            ].map((goal) => (
              <button
                key={goal.value}
                onClick={() => setUserData({ ...userData, goal: goal.value })}
                className={`px-4 py-2.5 rounded-full border transition-all ${userData.goal === goal.value
                  ? "bg-gradient-to-r from-[#22D3EE] to-[#14B8A6] border-transparent text-[#0B0E14]"
                  : "bg-[#0B0E14] border-[#2A3242] text-[#9AA3B2] hover:border-[#14B8A6]/50"
                  }`}
              >
                {goal.label}
              </button>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${isFormValid
            ? "bg-gradient-to-r from-[#22D3EE] to-[#14B8A6] text-[#0B0E14] shadow-lg shadow-[#22D3EE]/20 hover:scale-[1.02] active:scale-[0.98]"
            : "bg-[#1A202C] text-[#4B5563] cursor-not-allowed"
            }`}
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}
