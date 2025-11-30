import { motion } from "motion/react";
import { Flame, Target, TrendingUp } from "lucide-react";

interface SummaryCardProps {
  dailyCalories: number;
  consumedCalories: number;
  remainingCalories: number;
  macros: {
    protein: { consumed: number; target: number };
    carbs: { consumed: number; target: number };
    fats: { consumed: number; target: number };
  };
}

export function SummaryCard({ dailyCalories, consumedCalories, remainingCalories, macros }: SummaryCardProps) {
  const calorieProgress = (consumedCalories / dailyCalories) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-20 h-fit"
    >
      <div className="rounded-2xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] shadow-2xl p-6 space-y-6">
        {/* Daily Calories */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-[#22D3EE]" />
            <h3 className="text-sm text-[#9AA3B2]">Daily Calories</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-[#E6E9EF]">{consumedCalories}</span>
              <span className="text-sm text-[#9AA3B2]">/ {dailyCalories} kcal</span>
            </div>
            <div className="w-full h-2 bg-[#2A3242] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(calorieProgress, 100)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full rounded-full ${calorieProgress > 100
                  ? "bg-red-500"
                  : "bg-gradient-to-r from-[#22D3EE] to-[#14B8A6]"
                  }`}
              />
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-[#14B8A6]" />
              <span className="text-xs text-[#9AA3B2]">
                {remainingCalories > 0 ? `${remainingCalories} kcal remaining` : `${Math.abs(remainingCalories)} kcal over`}
              </span>
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#14B8A6]" />
            <h3 className="text-sm text-[#9AA3B2]">Macros</h3>
          </div>

          {/* Protein */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#E6E9EF]">Protein</span>
              <span className="text-sm text-[#9AA3B2]">
                {macros.protein.consumed}g / {macros.protein.target}g
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#2A3242] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((macros.protein.consumed / macros.protein.target) * 100, 100)}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                className="h-full bg-[#22D3EE] rounded-full"
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#E6E9EF]">Carbs</span>
              <span className="text-sm text-[#9AA3B2]">
                {macros.carbs.consumed}g / {macros.carbs.target}g
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#2A3242] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((macros.carbs.consumed / macros.carbs.target) * 100, 100)}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                className="h-full bg-[#14B8A6] rounded-full"
              />
            </div>
          </div>

          {/* Fats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#E6E9EF]">Fats</span>
              <span className="text-sm text-[#9AA3B2]">
                {macros.fats.consumed}g / {macros.fats.target}g
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#2A3242] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((macros.fats.consumed / macros.fats.target) * 100, 100)}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                className="h-full bg-gradient-to-r from-[#22D3EE] to-[#14B8A6] rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {remainingCalories > 100 && (
        <div className="mt-4 rounded-xl bg-gradient-to-r from-[#22D3EE]/10 to-[#14B8A6]/10 border border-[#22D3EE]/30 p-4">
          <div className="flex items-start gap-3">
            <div className="space-y-2">
              <p className="text-sm text-[#E6E9EF] font-medium">Recommendations:</p>
              <ul className="text-xs text-[#9AA3B2] space-y-1.5">
                {macros.protein.consumed < macros.protein.target && (
                  <li>• Protein: Add chicken, eggs, paneer, or dal ({Math.round(macros.protein.target - macros.protein.consumed)}g needed)</li>
                )}
                {macros.carbs.consumed < macros.carbs.target && (
                  <li>• Carbs: Include rice, roti, oats, or fruits ({Math.round(macros.carbs.target - macros.carbs.consumed)}g needed)</li>
                )}
                {macros.fats.consumed < macros.fats.target && (
                  <li>• Fats: Add nuts, ghee, or avocado ({Math.round(macros.fats.target - macros.fats.consumed)}g needed)</li>
                )}
                {remainingCalories > 0 && macros.protein.consumed >= macros.protein.target && macros.carbs.consumed >= macros.carbs.target && macros.fats.consumed >= macros.fats.target && (
                  <li>• You need {Math.round(remainingCalories)} more calories. Add any balanced meal.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
