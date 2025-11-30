import { motion } from "motion/react";
import { Activity, Flame, TrendingUp, Target, Edit } from "lucide-react";

interface TargetsScreenProps {
  bmi: number;
  bmr: number;
  tdee: number;
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  onEditProfile?: () => void;
}

export function TargetsScreen({ bmi, bmr, tdee, dailyCalories, macros, onEditProfile }: TargetsScreenProps) {
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-yellow-400" };
    if (bmi < 25) return { label: "Normal", color: "text-[#14B8A6]" };
    if (bmi < 30) return { label: "Overweight", color: "text-orange-400" };
    return { label: "Obese", color: "text-red-400" };
  };

  const bmiCategory = getBMICategory(bmi);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl text-[#E6E9EF]">Your Nutrition Targets</h1>
        <p className="text-[#9AA3B2]">
          Based on your profile and goals
        </p>
        {onEditProfile && (
          <button
            onClick={onEditProfile}
            className="mt-4 px-6 py-2.5 rounded-full bg-[#121722]/60 border border-[#2A3242] text-[#E6E9EF] hover:border-[#22D3EE]/50 transition-all inline-flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BMI Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] shadow-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#22D3EE]" />
            </div>
            <div>
              <h3 className="text-sm text-[#9AA3B2]">Body Mass Index</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl text-[#E6E9EF]">{bmi.toFixed(1)}</span>
                <span className={`text-sm ${bmiCategory.color}`}>{bmiCategory.label}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* BMR Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] shadow-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-[#14B8A6]" />
            </div>
            <div>
              <h3 className="text-sm text-[#9AA3B2]">Basal Metabolic Rate</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl text-[#E6E9EF]">{Math.round(bmr)}</span>
                <span className="text-sm text-[#9AA3B2]">kcal/day</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* TDEE Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] shadow-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#22D3EE]" />
            </div>
            <div>
              <h3 className="text-sm text-[#9AA3B2]">Total Daily Energy Expenditure</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl text-[#E6E9EF]">{Math.round(tdee)}</span>
                <span className="text-sm text-[#9AA3B2]">kcal/day</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Calories Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-gradient-to-br from-[#22D3EE]/10 to-[#14B8A6]/10 border border-[#22D3EE]/30 shadow-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#14B8A6] flex items-center justify-center">
              <Target className="w-5 h-5 text-[#0B0E14]" />
            </div>
            <div>
              <h3 className="text-sm text-[#9AA3B2]">Daily Calorie Target</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl text-[#E6E9EF]">{Math.round(dailyCalories)}</span>
                <span className="text-sm text-[#9AA3B2]">kcal/day</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Macros Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] shadow-2xl p-6 space-y-6"
      >
        <h3 className="text-lg text-[#E6E9EF]">Daily Macro Targets</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Protein */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9AA3B2]">Protein</span>
              <span className="text-sm text-[#E6E9EF]">{macros.protein}g</span>
            </div>
            <div className="relative pt-1">
              <div className="w-full h-2 bg-[#2A3242] rounded-full overflow-hidden">
                <div className="h-full bg-[#22D3EE] rounded-full w-full" />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9AA3B2]">30% of calories</span>
              <span className="text-[#9AA3B2]">{Math.round(macros.protein * 4)} kcal</span>
            </div>
          </div>

          {/* Carbs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9AA3B2]">Carbs</span>
              <span className="text-sm text-[#E6E9EF]">{macros.carbs}g</span>
            </div>
            <div className="relative pt-1">
              <div className="w-full h-2 bg-[#2A3242] rounded-full overflow-hidden">
                <div className="h-full bg-[#14B8A6] rounded-full w-full" />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9AA3B2]">40% of calories</span>
              <span className="text-[#9AA3B2]">{Math.round(macros.carbs * 4)} kcal</span>
            </div>
          </div>

          {/* Fats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9AA3B2]">Fats</span>
              <span className="text-sm text-[#E6E9EF]">{macros.fats}g</span>
            </div>
            <div className="relative pt-1">
              <div className="w-full h-2 bg-[#2A3242] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#22D3EE] to-[#14B8A6] rounded-full w-full" />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9AA3B2]">30% of calories</span>
              <span className="text-[#9AA3B2]">{Math.round(macros.fats * 9)} kcal</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
