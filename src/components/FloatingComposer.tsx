import { motion } from "motion/react";
import { Calculator, Lightbulb, Plus } from "lucide-react";

interface FloatingComposerProps {
  currentScreen: string;
  onCalculate?: () => void;
  onSuggest?: () => void;
  onLog?: () => void;
  isFormValid?: boolean;
}

export function FloatingComposer({ currentScreen, onCalculate, onSuggest, onLog, isFormValid = true }: FloatingComposerProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="rounded-full bg-[#121722]/80 backdrop-blur-xl border border-[#2A3242] shadow-2xl px-4 py-3 flex items-center gap-3">
        {currentScreen === "onboarding" && onCalculate && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCalculate}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#14B8A6] text-[#0B0E14] transition-all hover:shadow-lg hover:shadow-[#22D3EE]/20 cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span className="text-sm">Calculate Targets</span>
          </motion.button>
        )}

        {currentScreen === "menu" && (
          <>
            {onSuggest && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSuggest}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#14B8A6] text-[#0B0E14] transition-all hover:shadow-lg hover:shadow-[#22D3EE]/20"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm">Get Suggestions</span>
              </motion.button>
            )}
          </>
        )}

        {(currentScreen === "options" || currentScreen === "menu") && onLog && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLog}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#22D3EE] text-[#22D3EE] transition-all hover:bg-[#22D3EE]/10"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Log Selected</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
