import { motion } from "motion/react";
import { Trash2, Clock, Plus } from "lucide-react";
import { useState } from "react";

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

interface LogScreenProps {
  loggedItems: LogEntry[];
  onRemoveItem: (index: number) => void;
  onAddManualMeal?: (item: MenuItem) => void;
}

// Nutrition estimation based on common Indian foods
const estimateNutrition = (foodName: string): { calories: number; protein: number; carbs: number; fats: number; category: string } => {
  const name = foodName.toLowerCase();
  
  // Rice dishes
  if (name.includes('biryani')) return { calories: 450, protein: 12, carbs: 75, fats: 12, category: 'Main Course' };
  if (name.includes('pulao') || name.includes('pilaf')) return { calories: 380, protein: 10, carbs: 65, fats: 10, category: 'Main Course' };
  if (name.includes('fried rice')) return { calories: 400, protein: 8, carbs: 70, fats: 12, category: 'Main Course' };
  if (name.includes('jeera rice') || name.includes('plain rice')) return { calories: 200, protein: 4, carbs: 44, fats: 1, category: 'Main Course' };
  
  // Bread/Roti
  if (name.includes('naan')) return { calories: 260, protein: 8, carbs: 45, fats: 5, category: 'Bread' };
  if (name.includes('roti') || name.includes('chapati')) return { calories: 120, protein: 4, carbs: 22, fats: 2, category: 'Bread' };
  if (name.includes('paratha')) return { calories: 280, protein: 6, carbs: 38, fats: 12, category: 'Bread' };
  if (name.includes('puri') || name.includes('poori')) return { calories: 180, protein: 3, carbs: 20, fats: 10, category: 'Bread' };
  
  // Curries
  if (name.includes('chicken curry') || name.includes('chicken masala')) return { calories: 320, protein: 35, carbs: 12, fats: 18, category: 'Main Course' };
  if (name.includes('butter chicken')) return { calories: 400, protein: 30, carbs: 15, fats: 25, category: 'Main Course' };
  if (name.includes('paneer') && name.includes('butter')) return { calories: 380, protein: 18, carbs: 22, fats: 25, category: 'Main Course' };
  if (name.includes('paneer') && (name.includes('tikka') || name.includes('masala'))) return { calories: 320, protein: 20, carbs: 18, fats: 20, category: 'Main Course' };
  if (name.includes('chole') || name.includes('chana')) return { calories: 280, protein: 14, carbs: 42, fats: 8, category: 'Main Course' };
  if (name.includes('rajma')) return { calories: 250, protein: 15, carbs: 38, fats: 6, category: 'Main Course' };
  
  // Dal
  if (name.includes('dal') && name.includes('tadka')) return { calories: 180, protein: 12, carbs: 25, fats: 5, category: 'Main Course' };
  if (name.includes('dal')) return { calories: 150, protein: 10, carbs: 22, fats: 4, category: 'Main Course' };
  
  // South Indian
  if (name.includes('dosa')) return { calories: 200, protein: 6, carbs: 35, fats: 5, category: 'Breakfast' };
  if (name.includes('idli')) return { calories: 90, protein: 3, carbs: 17, fats: 1, category: 'Breakfast' };
  if (name.includes('vada')) return { calories: 150, protein: 4, carbs: 18, fats: 8, category: 'Breakfast' };
  if (name.includes('upma')) return { calories: 200, protein: 6, carbs: 32, fats: 6, category: 'Breakfast' };
  if (name.includes('uttapam')) return { calories: 220, protein: 7, carbs: 38, fats: 5, category: 'Breakfast' };
  
  // Sides
  if (name.includes('raita')) return { calories: 90, protein: 4, carbs: 8, fats: 5, category: 'Sides' };
  if (name.includes('salad')) return { calories: 80, protein: 3, carbs: 12, fats: 2, category: 'Sides' };
  if (name.includes('pickle') || name.includes('achar')) return { calories: 40, protein: 1, carbs: 6, fats: 2, category: 'Sides' };
  if (name.includes('papad')) return { calories: 50, protein: 2, carbs: 8, fats: 1, category: 'Sides' };
  
  // Snacks
  if (name.includes('samosa')) return { calories: 250, protein: 5, carbs: 30, fats: 13, category: 'Snacks' };
  if (name.includes('pakora') || name.includes('bhaji')) return { calories: 200, protein: 4, carbs: 22, fats: 12, category: 'Snacks' };
  if (name.includes('sandwich')) return { calories: 280, protein: 12, carbs: 40, fats: 8, category: 'Snacks' };
  
  // Desserts
  if (name.includes('gulab jamun')) return { calories: 150, protein: 3, carbs: 25, fats: 6, category: 'Dessert' };
  if (name.includes('kheer')) return { calories: 180, protein: 5, carbs: 28, fats: 6, category: 'Dessert' };
  if (name.includes('halwa')) return { calories: 200, protein: 3, carbs: 32, fats: 8, category: 'Dessert' };
  
  // Beverages
  if (name.includes('tea') || name.includes('chai')) return { calories: 60, protein: 2, carbs: 10, fats: 2, category: 'Beverage' };
  if (name.includes('coffee')) return { calories: 50, protein: 2, carbs: 8, fats: 2, category: 'Beverage' };
  if (name.includes('lassi')) return { calories: 150, protein: 6, carbs: 22, fats: 4, category: 'Beverage' };
  
  // Default fallback
  return { calories: 250, protein: 10, carbs: 35, fats: 8, category: 'Other' };
};

export function LogScreen({ loggedItems, onRemoveItem, onAddManualMeal }: LogScreenProps) {
  const [mealText, setMealText] = useState("");
  const [showAddMeal, setShowAddMeal] = useState(false);
  const totalCalories = loggedItems.reduce((sum, entry) => sum + entry.item.calories, 0);
  const totalProtein = loggedItems.reduce((sum, entry) => sum + entry.item.protein, 0);
  const totalCarbs = loggedItems.reduce((sum, entry) => sum + entry.item.carbs, 0);
  const totalFats = loggedItems.reduce((sum, entry) => sum + entry.item.fats, 0);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const handleAddMeal = () => {
    if (mealText.trim() && onAddManualMeal) {
      const nutrition = estimateNutrition(mealText);
      const newMeal: MenuItem = {
        id: `manual-${Date.now()}`,
        name: mealText.trim(),
        ...nutrition
      };
      onAddManualMeal(newMeal);
      setMealText("");
      setShowAddMeal(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl text-[#E6E9EF]">Meal Log</h1>
        <p className="text-[#9AA3B2]">
          Track your daily food intake
        </p>
      </div>

      {/* Daily Summary */}
      <div className="rounded-2xl bg-gradient-to-br from-[#22D3EE]/10 to-[#14B8A6]/10 border border-[#22D3EE]/30 shadow-2xl p-6">
        <h3 className="text-lg text-[#E6E9EF] mb-4">Today's Total</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-[#9AA3B2] mb-1">Calories</p>
            <p className="text-2xl text-[#E6E9EF]">{totalCalories}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#9AA3B2] mb-1">Protein</p>
            <p className="text-2xl text-[#22D3EE]">{totalProtein}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#9AA3B2] mb-1">Carbs</p>
            <p className="text-2xl text-[#14B8A6]">{totalCarbs}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-[#9AA3B2] mb-1">Fats</p>
            <p className="text-2xl text-[#E6E9EF]">{totalFats}g</p>
          </div>
        </div>
      </div>

      {/* Add New Meal Section */}
      {showAddMeal ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] shadow-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg text-[#E6E9EF]">Add New Meal</h3>
            <button
              onClick={() => {
                setShowAddMeal(false);
                setMealText("");
              }}
              className="text-xs text-[#9AA3B2] hover:text-[#E6E9EF] transition-colors"
            >
              Cancel
            </button>
          </div>
          
          <input
            type="text"
            value={mealText}
            onChange={(e) => setMealText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddMeal()}
            placeholder="e.g., Chicken Biryani, Paneer Butter Masala, Idli..."
            className="w-full px-4 py-3 rounded-xl bg-[#0B0E14]/50 border border-[#2A3242] text-[#E6E9EF] placeholder-[#9AA3B2]/50 focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/50 focus:border-[#22D3EE]"
            autoFocus
          />
          
          <button
            onClick={handleAddMeal}
            disabled={!mealText.trim()}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#14B8A6] text-[#0B0E14] transition-all hover:shadow-lg hover:shadow-[#22D3EE]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Meal
          </button>
        </motion.div>
      ) : (
        <button
          onClick={() => setShowAddMeal(true)}
          className="w-full rounded-xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] shadow-lg p-4 hover:border-[#22D3EE]/50 transition-all group"
        >
          <div className="flex items-center justify-center gap-2 text-[#9AA3B2] group-hover:text-[#22D3EE]">
            <Plus className="w-5 h-5" />
            <span>Add a New Meal</span>
          </div>
        </button>
      )}

      {/* Logged Items */}
      <div className="space-y-4">
        <h3 className="text-lg text-[#E6E9EF]">
          Logged Items ({loggedItems.length})
        </h3>

        {loggedItems.length > 0 ? (
          <div className="space-y-3">
            {loggedItems.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] shadow-lg p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[#E6E9EF]">{entry.item.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#9AA3B2]">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(entry.timestamp)}</span>
                      <span>•</span>
                      <span>{entry.item.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(index)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-[#9AA3B2] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#22D3EE]" />
                      <span className="text-[#9AA3B2]">P: {entry.item.protein}g</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#14B8A6]" />
                      <span className="text-[#9AA3B2]">C: {entry.item.carbs}g</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#14B8A6]" />
                      <span className="text-[#9AA3B2]">F: {entry.item.fats}g</span>
                    </div>
                  </div>
                  <span className="text-lg text-[#E6E9EF]">{entry.item.calories} kcal</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] shadow-lg p-12 text-center">
            <p className="text-[#9AA3B2]">
              No meals logged yet. Start by selecting items from the menu or suggestions.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
