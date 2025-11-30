import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lightbulb, TrendingUp, Utensils, ClipboardPaste, Sparkles, Check, Star, X, Circle, Coffee, Sun, Moon, CheckCircle2, Loader2 } from "lucide-react";
import { parseMenu, estimateNutrition } from "../lib/menuParser";
import { parseMenuWithOpenAI } from "../lib/openai";

interface MenuItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: string;
  servingSize?: string;
}

interface OptionsScreenProps {
  dailyCalories: number;
  remainingCalories: number;
  macros: {
    protein: { consumed: number; target: number };
    carbs: { consumed: number; target: number };
    fats: { consumed: number; target: number };
  };
  onSelectItem: (item: MenuItem) => void;
  selectedItems: MenuItem[];
}

type ItemPreference = "must-have" | "optional" | "not-necessary";

interface MealPlan {
  name: string;
  icon: any;
  items: MenuItem[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DayPlan {
  id: string;
  name: string;
  breakfast: MealPlan;
  lunch: MealPlan;
  dinner: MealPlan;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
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

// Parse menu text into food items
const parseMenu = (text: string): MenuItem[] => {
  if (!text.trim()) return [];

  const lines = text.split('\n').filter(line => line.trim());
  const items: MenuItem[] = [];

  lines.forEach((line, index) => {
    // Remove common prefixes like numbers, bullets, dashes
    const cleaned = line.replace(/^[\d\.\-\*\•\→\➤\►\◆]+\s*/, '').trim();
    if (cleaned.length < 3) return; // Skip very short lines

    const nutrition = estimateNutrition(cleaned);
    items.push({
      id: `parsed - ${index} `,
      name: cleaned,
      ...nutrition
    });
  });

  return items;
};

export function OptionsScreen({ dailyCalories, remainingCalories, macros, onSelectItem, selectedItems }: OptionsScreenProps) {
  const [menuText, setMenuText] = useState("");
  const [parsedItems, setParsedItems] = useState<MenuItem[]>([]);
  const [itemPreferences, setItemPreferences] = useState<Map<string, ItemPreference>>(new Map());
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategorization, setShowCategorization] = useState(false);
  const [selectedMeals, setSelectedMeals] = useState<{
    breakfast: string | null;
    lunch: string | null;
    dinner: string | null;
  }>({ breakfast: null, lunch: null, dinner: null });
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [parserType, setParserType] = useState<"ai" | "local" | null>(null);

  const handleParseMenu = async () => {
    console.log("[PARSER] Starting menu parse...");
    console.log("[PARSER] Menu text:", menuText);

    setIsParsing(true);
    setParseError(null);
    setParserType(null);

    try {
      let items: MenuItem[] = [];
      const openaiKey = localStorage.getItem("openai_api_key");

      console.log("[PARSER] OpenAI key present:", !!openaiKey);

      // Try OpenAI if API key is available
      if (openaiKey) {
        try {
          console.log("[PARSER] Attempting OpenAI parsing...");
          items = await parseMenuWithOpenAI(menuText, openaiKey);
          console.log("[PARSER] OpenAI parsing successful! Items:", items);

          if (items.length === 0) {
            setParseError("No food items found in the text.");
          }
          setParserType("ai");
        } catch (openaiError) {
          console.error("[PARSER] OpenAI parsing failed, using local parser:", openaiError);

          // Check if it's a quota/rate limit error
          const errorMessage = openaiError instanceof Error ? openaiError.message : '';
          if (errorMessage.includes('insufficient_quota')) {
            setParseError("⚠️ OpenAI quota exceeded. Add credits at platform.openai.com/billing. Using local parser.");
          } else if (errorMessage.includes('429')) {
            setParseError("⚠️ OpenAI rate limit reached. Using local parser.");
          } else {
            setParseError("OpenAI unavailable. Using local parser.");
          }

          items = parseMenu(menuText);
          console.log("[PARSER] Local parsing result:", items);

          if (items.length === 0) {
            setParseError("No food items found in the text.");
          }
          setParserType("local");
        }
      } else {
        // No API key, use local parser
        console.log("[PARSER] No OpenAI API key, using local parser");
        items = parseMenu(menuText);
        console.log("[PARSER] Local parsing result:", items);

        if (items.length === 0) {
          setParseError("No food items found in the text. Tip: Add your OpenAI API key in Settings for better parsing.");
        }
        setParserType("local");
      }

      console.log("[PARSER] Final items count:", items.length);
      setParsedItems(items);
      setShowCategorization(true);
      setShowSuggestions(false);
      setDayPlans([]);

      // Initialize all items as "optional" by default
      const newPreferences = new Map<string, ItemPreference>();
      items.forEach(item => {
        newPreferences.set(item.id, "optional");
      });
      setItemPreferences(newPreferences);
    } catch (error) {
      console.error("[PARSER] Critical parsing error:", error);
      setParseError(`Failed to parse menu: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsParsing(false);
      console.log("[PARSER] Parsing complete");
    }
  };

  const setItemPreference = (itemId: string, preference: ItemPreference) => {
    setItemPreferences(prev => {
      const newMap = new Map(prev);
      newMap.set(itemId, preference);
      return newMap;
    });
  };

  // Helper function to select optimal items for a meal
  const selectMealItems = (
    availableItems: MenuItem[],
    calTarget: number,
    proteinTarget: number,
    carbsTarget: number,
    fatsTarget: number,
    excludeIds: Set<string> = new Set()
  ): MenuItem[] => {
    const selected: MenuItem[] = [];
    let currentStats = { calories: 0, protein: 0, carbs: 0, fats: 0 };

    // Filter out already used items
    const available = availableItems.filter(item => !excludeIds.has(item.id));

    // 1. Add Must-Have items first (if they fit reasonably)
    const mustHaves = available.filter(item => itemPreferences.get(item.id) === "must-have");
    for (const item of mustHaves) {
      // Allow slightly looser constraint for must-haves (up to 10% over individually)
      if (currentStats.calories + item.calories <= calTarget * 1.1) {
        selected.push(item);
        currentStats.calories += item.calories;
        currentStats.protein += item.protein;
        currentStats.carbs += item.carbs;
        currentStats.fats += item.fats;
        excludeIds.add(item.id);
      }
    }

    // 2. Iteratively fill with Optional items to meet targets strictly
    const optional = available.filter(
      item => itemPreferences.get(item.id) !== "must-have" && !selected.includes(item)
    );

    while (true) {
      const remainingCal = calTarget - currentStats.calories;
      const remainingProtein = proteinTarget - currentStats.protein;
      const remainingCarbs = carbsTarget - currentStats.carbs;
      const remainingFats = fatsTarget - currentStats.fats;

      // Stop if we are close enough (within 50 cals) or over budget
      if (remainingCal < 50) break;

      let bestItem: MenuItem | null = null;
      let bestScore = -Infinity;

      for (const item of optional) {
        if (excludeIds.has(item.id)) continue;

        // Strict Constraint: Don't exceed calorie target by more than 5%
        if (item.calories > remainingCal * 1.05 + 50) continue;

        // Score based on how well it fills the REMAINING gaps
        // We want items that have high density in the needed macros
        const proteinScore = remainingProtein > 0 ? Math.min(item.protein / remainingProtein, 1.2) : (item.protein > 0 ? -0.1 : 0);
        const carbsScore = remainingCarbs > 0 ? Math.min(item.carbs / remainingCarbs, 1.2) : (item.carbs > 0 ? -0.1 : 0);
        const fatsScore = remainingFats > 0 ? Math.min(item.fats / remainingFats, 1.2) : (item.fats > 0 ? -0.1 : 0);

        // Calorie efficiency: How much of the remaining calorie budget does it use?
        // We prefer items that use a good chunk but not all of it if macros aren't balanced
        const calFill = Math.min(item.calories / remainingCal, 1);

        // Weighted score: Prioritize Protein > Calorie Fit > Other Macros
        const score = (proteinScore * 2.0) + (calFill * 1.5) + (carbsScore * 1.0) + (fatsScore * 1.0);

        if (score > bestScore) {
          bestScore = score;
          bestItem = item;
        }
      }

      if (bestItem) {
        selected.push(bestItem);
        currentStats.calories += bestItem.calories;
        currentStats.protein += bestItem.protein;
        currentStats.carbs += bestItem.carbs;
        currentStats.fats += bestItem.fats;
        excludeIds.add(bestItem.id);
      } else {
        // No suitable item found to fill the gap
        break;
      }
    }

    return selected;
  };

  const generateDayPlans = () => {
    const remainingProtein = macros.protein.target - macros.protein.consumed;
    const remainingCarbs = macros.carbs.target - macros.carbs.consumed;
    const remainingFats = macros.fats.target - macros.fats.consumed;

    const mustHaveItems = parsedItems.filter(item => itemPreferences.get(item.id) === "must-have");
    const optionalItems = parsedItems.filter(item => itemPreferences.get(item.id) === "optional");

    // Meal targets (30% breakfast, 40% lunch, 30% dinner)
    const breakfastCalTarget = remainingCalories * 0.30;
    const lunchCalTarget = remainingCalories * 0.40;
    const dinnerCalTarget = remainingCalories * 0.30;

    const breakfastProteinTarget = remainingProtein * 0.30;
    const lunchProteinTarget = remainingProtein * 0.40;
    const dinnerProteinTarget = remainingProtein * 0.30;

    const breakfastCarbsTarget = remainingCarbs * 0.30;
    const lunchCarbsTarget = remainingCarbs * 0.40;
    const dinnerCarbsTarget = remainingCarbs * 0.30;

    const breakfastFatsTarget = remainingFats * 0.30;
    const lunchFatsTarget = remainingFats * 0.40;
    const dinnerFatsTarget = remainingFats * 0.30;

    // Categorize items by meal suitability
    const breakfastSuitable = [...mustHaveItems, ...optionalItems].filter(item =>
      item.category === 'Breakfast' || item.category === 'Beverage' || item.category === 'Snacks'
    );
    const lunchSuitable = [...mustHaveItems, ...optionalItems].filter(item =>
      item.category === 'Main Course' || item.category === 'Bread' || item.category === 'Sides' || item.category === 'Beverage'
    );
    const dinnerSuitable = [...mustHaveItems, ...optionalItems].filter(item =>
      item.category === 'Main Course' || item.category === 'Bread' || item.category === 'Sides' || item.category === 'Dessert'
    );

    const plans: DayPlan[] = [];

    // Generate 3 different day plans
    for (let i = 0; i < 3; i++) {
      const usedIds = new Set<string>();

      // Shuffle items for variation (simple rotation based on index)
      const breakfastOptions = [...breakfastSuitable.length > 0 ? breakfastSuitable : lunchSuitable];
      const lunchOptions = [...lunchSuitable];
      const dinnerOptions = [...dinnerSuitable];

      // Rotate arrays for variation
      for (let j = 0; j < i * 2; j++) {
        breakfastOptions.push(breakfastOptions.shift()!);
        lunchOptions.push(lunchOptions.shift()!);
        dinnerOptions.push(dinnerOptions.shift()!);
      }

      const breakfastItems = selectMealItems(
        breakfastOptions,
        breakfastCalTarget,
        breakfastProteinTarget,
        breakfastCarbsTarget,
        breakfastFatsTarget,
        usedIds
      ).map(item => ({ ...item, id: `plan - ${i} -breakfast - ${item.id} ` }));

      const lunchItems = selectMealItems(
        lunchOptions,
        lunchCalTarget,
        lunchProteinTarget,
        lunchCarbsTarget,
        lunchFatsTarget,
        usedIds
      ).map(item => ({ ...item, id: `plan - ${i} -lunch - ${item.id} ` }));

      const dinnerItems = selectMealItems(
        dinnerOptions,
        dinnerCalTarget,
        dinnerProteinTarget,
        dinnerCarbsTarget,
        dinnerFatsTarget,
        usedIds
      ).map(item => ({ ...item, id: `plan - ${i} -dinner - ${item.id} ` }));

      const breakfast: MealPlan = {
        name: "Breakfast",
        icon: Coffee,
        items: breakfastItems,
        calories: breakfastItems.reduce((sum, item) => sum + item.calories, 0),
        protein: breakfastItems.reduce((sum, item) => sum + item.protein, 0),
        carbs: breakfastItems.reduce((sum, item) => sum + item.carbs, 0),
        fats: breakfastItems.reduce((sum, item) => sum + item.fats, 0),
      };

      const lunch: MealPlan = {
        name: "Lunch",
        icon: Sun,
        items: lunchItems,
        calories: lunchItems.reduce((sum, item) => sum + item.calories, 0),
        protein: lunchItems.reduce((sum, item) => sum + item.protein, 0),
        carbs: lunchItems.reduce((sum, item) => sum + item.carbs, 0),
        fats: lunchItems.reduce((sum, item) => sum + item.fats, 0),
      };

      const dinner: MealPlan = {
        name: "Dinner",
        icon: Moon,
        items: dinnerItems,
        calories: dinnerItems.reduce((sum, item) => sum + item.calories, 0),
        protein: dinnerItems.reduce((sum, item) => sum + item.protein, 0),
        carbs: dinnerItems.reduce((sum, item) => sum + item.carbs, 0),
        fats: dinnerItems.reduce((sum, item) => sum + item.fats, 0),
      };

      const totalCalories = breakfast.calories + lunch.calories + dinner.calories;
      const totalProtein = breakfast.protein + lunch.protein + dinner.protein;
      const totalCarbs = breakfast.carbs + lunch.carbs + dinner.carbs;
      const totalFats = breakfast.fats + lunch.fats + dinner.fats;

      plans.push({
        id: `plan - ${i} `,
        name: `Option ${String.fromCharCode(65 + i)} `,
        breakfast,
        lunch,
        dinner,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFats,
      });
    }

    setDayPlans(plans);
    setShowSuggestions(true);
  };

  const handleSelectMeal = (meal: MealPlan, planId: string) => {
    const mealType = meal.name.toLowerCase() as 'breakfast' | 'lunch' | 'dinner';
    const currentlySelected = selectedMeals[mealType];

    // If this meal is already selected, unselect it
    if (currentlySelected === planId) {
      // Remove all items from this meal
      meal.items.forEach(item => {
        if (selectedItems.some(selected => selected.id === item.id)) {
          onSelectItem(item); // Toggle to remove
        }
      });

      // Update selected meals state
      setSelectedMeals(prev => ({
        ...prev,
        [mealType]: null
      }));
    } else {
      // First, remove items from previously selected meal of this type
      if (currentlySelected) {
        const prevPlan = dayPlans.find(p => p.id === currentlySelected);
        if (prevPlan) {
          const prevMeal = prevPlan[mealType];
          prevMeal.items.forEach(item => {
            if (selectedItems.some(selected => selected.id === item.id)) {
              onSelectItem(item); // Toggle to remove
            }
          });
        }
      }

      // Then add items from the new meal
      meal.items.forEach(item => {
        if (!selectedItems.some(selected => selected.id === item.id)) {
          onSelectItem(item); // Toggle to add
        }
      });

      // Update selected meals state
      setSelectedMeals(prev => ({
        ...prev,
        [mealType]: planId
      }));
    }
  };

  const isMealFullySelected = (meal: MealPlan, planId: string) => {
    const mealType = meal.name.toLowerCase() as 'breakfast' | 'lunch' | 'dinner';
    return selectedMeals[mealType] === planId;
  };

  const isSelected = (itemId: string) => selectedItems.some(item => item.id === itemId);
  const getItemPreference = (itemId: string) => itemPreferences.get(itemId) || "optional";

  const mustHaveCount = Array.from(itemPreferences.values()).filter(p => p === "must-have").length;
  const optionalCount = Array.from(itemPreferences.values()).filter(p => p === "optional").length;
  const notNecessaryCount = Array.from(itemPreferences.values()).filter(p => p === "not-necessary").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl text-[#E6E9EF]">Smart Menu Suggestions</h1>
        <p className="text-[#9AA3B2]">
          Paste your cafeteria menu and get personalized recommendations
        </p>
      </div>

      {/* Remaining Summary */}
      <div className="rounded-2xl bg-gradient-to-br from-[#22D3EE]/10 to-[#14B8A6]/10 border border-[#22D3EE]/30 shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-[#22D3EE]" />
          <h3 className="text-lg text-[#E6E9EF]">Remaining Today</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-[#9AA3B2] mb-1">Calories</p>
            <p className="text-xl text-[#E6E9EF]">{remainingCalories}</p>
          </div>
          <div>
            <p className="text-xs text-[#9AA3B2] mb-1">Protein</p>
            <p className="text-xl text-[#E6E9EF]">{Math.max(0, macros.protein.target - macros.protein.consumed)}g</p>
          </div>
          <div>
            <p className="text-xs text-[#9AA3B2] mb-1">Carbs</p>
            <p className="text-xl text-[#E6E9EF]">{Math.max(0, macros.carbs.target - macros.carbs.consumed)}g</p>
          </div>
          <div>
            <p className="text-xs text-[#9AA3B2] mb-1">Fats</p>
            <p className="text-xl text-[#E6E9EF]">{Math.max(0, macros.fats.target - macros.fats.consumed)}g</p>
          </div>
        </div>
      </div>

      {/* Menu Input Section */}
      {!showCategorization && (
        <div className="rounded-2xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] shadow-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ClipboardPaste className="w-5 h-5 text-[#14B8A6]" />
            <h3 className="text-lg text-[#E6E9EF]">Paste Your Menu</h3>
          </div>

          <textarea
            value={menuText}
            onChange={(e) => setMenuText(e.target.value)}
            placeholder="Paste your cafeteria menu here... (e.g., Vegetable Biryani, Chicken Curry, Dal Tadka, etc.)"
            className="w-full h-32 px-4 py-3 rounded-xl bg-[#0B0E14]/50 border border-[#2A3242] text-[#E6E9EF] placeholder-[#9AA3B2]/50 resize-none focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/50 focus:border-[#22D3EE]"
          />

          <button
            onClick={handleParseMenu}
            disabled={!menuText.trim()}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#14B8A6] text-[#0B0E14] transition-all hover:shadow-lg hover:shadow-[#22D3EE]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Parse Menu
          </button>

          {isParsing && (
            <div className="flex items-center justify-center gap-2 text-[#22D3EE]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing menu with AI...</span>
            </div>
          )}

          {parseError && (
            <div className="text-red-400 text-sm text-center">
              {parseError}
            </div>
          )}
        </div>
      )}



      {/* Categorize Menu Items */}
      <AnimatePresence>
        {showCategorization && !showSuggestions && parsedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#14B8A6]" />
                <h3 className="text-lg text-[#E6E9EF]">Categorize Your Menu Items ({parsedItems.length})</h3>
              </div>
              <button
                onClick={() => {
                  setShowCategorization(false);
                  setParsedItems([]);
                  setMenuText("");
                  setItemPreferences(new Map());
                }}
                className="text-xs text-[#9AA3B2] hover:text-[#E6E9EF] transition-colors"
              >
                Reset Menu
              </button>
            </div>

            <div className="rounded-xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] shadow-md p-4">
              <p className="text-sm text-[#9AA3B2] mb-3">Mark each item based on your preference:</p>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#14B8A6] fill-[#14B8A6]" />
                  <span className="text-[#E6E9EF]">Must Have ({mustHaveCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="w-4 h-4 text-[#22D3EE]" />
                  <span className="text-[#E6E9EF]">Optional ({optionalCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-[#9AA3B2]" />
                  <span className="text-[#E6E9EF]">Not Necessary ({notNecessaryCount})</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {parsedItems.map((item, index) => {
                const preference = getItemPreference(item.id);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`rounded-xl bg-[#121722]/40 backdrop-blur-xl border shadow-md p-4 ${preference === "must-have"
                      ? "border-[#14B8A6] ring-2 ring-[#14B8A6]/20"
                      : preference === "not-necessary"
                        ? "border-[#9AA3B2]/30 opacity-60"
                        : "border-[#2A3242]"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[#E6E9EF] truncate">{item.name}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-xs mt-1">
                          <span className="text-[#9AA3B2]">{item.category}</span>
                          <span className="text-[#9AA3B2]">•</span>
                          <span className="text-[#E6E9EF]">{item.calories} cal</span>
                          <span className="text-[#9AA3B2]">P:{item.protein}g C:{item.carbs}g F:{item.fats}g</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setItemPreference(item.id, "must-have")}
                          className={`p-2 rounded-lg transition-all ${preference === "must-have"
                            ? "bg-[#14B8A6] text-[#0B0E14]"
                            : "bg-[#2A3242] text-[#9AA3B2] hover:bg-[#2A3242]/70"
                            }`}
                          title="Must Have"
                        >
                          <Star className={`w-4 h-4 ${preference === "must-have" ? "fill-current" : ""}`} />
                        </button>
                        <button
                          onClick={() => setItemPreference(item.id, "optional")}
                          className={`p-2 rounded-lg transition-all ${preference === "optional"
                            ? "bg-[#22D3EE] text-[#0B0E14]"
                            : "bg-[#2A3242] text-[#9AA3B2] hover:bg-[#2A3242]/70"
                            }`}
                          title="Optional"
                        >
                          <Circle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setItemPreference(item.id, "not-necessary")}
                          className={`p-2 rounded-lg transition-all ${preference === "not-necessary"
                            ? "bg-[#9AA3B2] text-[#0B0E14]"
                            : "bg-[#2A3242] text-[#9AA3B2] hover:bg-[#2A3242]/70"
                            }`}
                          title="Not Necessary"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <button
              onClick={generateDayPlans}
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#14B8A6] text-[#0B0E14] flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-[#22D3EE]/20"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate 3 Meal Plan Options</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deficit Analysis */}
      <AnimatePresence>
        {showSuggestions && dayPlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-2xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] shadow-lg p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#22D3EE]" />
              <h3 className="text-lg text-[#E6E9EF]">Nutritional Analysis</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Calorie Status */}
              <div className="rounded-xl bg-[#0B0E14]/50 border border-[#2A3242] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#9AA3B2]">Calories</span>
                  <span className={`text-sm font-medium ${remainingCalories > 0 ? "text-[#F59E0B]" : "text-[#14B8A6]"
                    }`}>
                    {remainingCalories > 0 ? `${Math.round(remainingCalories)} to go` : "Goal met!"}
                  </span>
                </div>
                <div className="w-full bg-[#2A3242] rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#22D3EE] to-[#14B8A6] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(((dailyCalories - remainingCalories) / dailyCalories) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Protein Status */}
              <div className="rounded-xl bg-[#0B0E14]/50 border border-[#2A3242] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#9AA3B2]">Protein</span>
                  <span className={`text-sm font-medium ${macros.protein.consumed < macros.protein.target ? "text-[#F59E0B]" : "text-[#14B8A6]"
                    }`}>
                    {macros.protein.consumed < macros.protein.target
                      ? `${Math.round(macros.protein.target - macros.protein.consumed)}g needed`
                      : "Goal met!"}
                  </span>
                </div>
                <div className="w-full bg-[#2A3242] rounded-full h-2">
                  <div
                    className="bg-[#14B8A6] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((macros.protein.consumed / macros.protein.target) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Carbs Status */}
              <div className="rounded-xl bg-[#0B0E14]/50 border border-[#2A3242] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#9AA3B2]">Carbs</span>
                  <span className={`text-sm font-medium ${macros.carbs.consumed < macros.carbs.target ? "text-[#F59E0B]" : "text-[#14B8A6]"
                    }`}>
                    {macros.carbs.consumed < macros.carbs.target
                      ? `${Math.round(macros.carbs.target - macros.carbs.consumed)}g needed`
                      : "Goal met!"}
                  </span>
                </div>
                <div className="w-full bg-[#2A3242] rounded-full h-2">
                  <div
                    className="bg-[#22D3EE] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((macros.carbs.consumed / macros.carbs.target) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Fats Status */}
              <div className="rounded-xl bg-[#0B0E14]/50 border border-[#2A3242] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#9AA3B2]">Fats</span>
                  <span className={`text-sm font-medium ${macros.fats.consumed < macros.fats.target ? "text-[#F59E0B]" : "text-[#14B8A6]"
                    }`}>
                    {macros.fats.consumed < macros.fats.target
                      ? `${Math.round(macros.fats.target - macros.fats.consumed)}g needed`
                      : "Goal met!"}
                  </span>
                </div>
                <div className="w-full bg-[#2A3242] rounded-full h-2">
                  <div
                    className="bg-[#F59E0B] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((macros.fats.consumed / macros.fats.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {remainingCalories > 100 && (
              <div className="rounded-xl bg-gradient-to-r from-[#22D3EE]/10 to-[#14B8A6]/10 border border-[#22D3EE]/30 p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-[#22D3EE] flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm text-[#E6E9EF] font-medium">Recommendations to meet your goals:</p>
                    <ul className="text-sm text-[#9AA3B2] space-y-1">
                      {macros.protein.consumed < macros.protein.target && (
                        <li>• Add protein-rich foods like chicken, eggs, paneer, or dal ({Math.round(macros.protein.target - macros.protein.consumed)}g protein needed)</li>
                      )}
                      {macros.carbs.consumed < macros.carbs.target && (
                        <li>• Include carbs like rice, roti, oats, or fruits ({Math.round(macros.carbs.target - macros.carbs.consumed)}g carbs needed)</li>
                      )}
                      {macros.fats.consumed < macros.fats.target && (
                        <li>• Add healthy fats from nuts, ghee, or avocado ({Math.round(macros.fats.target - macros.fats.consumed)}g fats needed)</li>
                      )}
                      {remainingCalories > 0 && macros.protein.consumed >= macros.protein.target && macros.carbs.consumed >= macros.carbs.target && macros.fats.consumed >= macros.fats.target && (
                        <li>• You need {Math.round(remainingCalories)} more calories. Add any balanced meal or snack.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3 Full Day Meal Plan Options */}
      <AnimatePresence>
        {showSuggestions && dayPlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#22D3EE]" />
                <h3 className="text-lg text-[#E6E9EF]">3 Full Day Meal Options</h3>
              </div>
              <button
                onClick={() => {
                  setShowSuggestions(false);
                  setShowCategorization(true);
                }}
                className="text-xs text-[#9AA3B2] hover:text-[#E6E9EF] transition-colors"
              >
                Back to Categories
              </button>
            </div>

            <p className="text-sm text-[#9AA3B2] text-center">
              Select individual meals from any option or pick specific items
            </p>

            {/* Day Plans */}
            <div className="grid grid-cols-1 gap-6">
              {dayPlans.map((plan, planIndex) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: planIndex * 0.1 }}
                  className="rounded-2xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] shadow-lg overflow-hidden"
                >
                  {/* Plan Header */}
                  <div className="bg-gradient-to-r from-[#22D3EE]/10 to-[#14B8A6]/10 border-b border-[#2A3242] p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl text-[#E6E9EF]">{plan.name}</h3>
                    </div>
                    <div className="flex items-center flex-wrap gap-6 text-sm">
                      <span className="text-[#E6E9EF]">{plan.totalCalories} cal</span>
                      <span className="text-[#9AA3B2]">Protein: {plan.totalProtein}g</span>
                      <span className="text-[#9AA3B2]">Carbs: {plan.totalCarbs}g</span>
                      <span className="text-[#9AA3B2]">Fats: {plan.totalFats}g</span>
                    </div>
                  </div>

                  {/* Meals Grid */}
                  <div className="p-5 space-y-4">
                    {[plan.breakfast, plan.lunch, plan.dinner].map((meal, mealIndex) => (
                      <div key={mealIndex} className="space-y-3">
                        {/* Meal Header with Select Button */}
                        <div className="flex items-center justify-between pb-2 border-b border-[#2A3242]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#22D3EE]/20 to-[#14B8A6]/20 flex items-center justify-center">
                              <meal.icon className="w-4 h-4 text-[#22D3EE]" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-[#E6E9EF]">{meal.name}</h4>
                              <p className="text-xs text-[#9AA3B2]">
                                {meal.calories} cal • P:{meal.protein}g C:{meal.carbs}g F:{meal.fats}g
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSelectMeal(meal, plan.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${isMealFullySelected(meal, plan.id)
                              ? "bg-[#22D3EE] text-[#0B0E14]"
                              : "bg-[#2A3242] text-[#E6E9EF] hover:bg-[#2A3242]/70"
                              }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isMealFullySelected(meal, plan.id) ? "Selected" : "Select Meal"}</span>
                          </button>
                        </div>

                        {/* Meal Items */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {meal.items.map((item) => {
                            const preference = getItemPreference(item.id);
                            return (
                              <button
                                key={item.id}
                                onClick={() => onSelectItem(item)}
                                className={`text-left rounded-lg bg-[#0B0E14]/50 border p-3 space-y-2 transition-all hover:shadow-md ${isSelected(item.id)
                                  ? "border-[#22D3EE] ring-1 ring-[#22D3EE]/20"
                                  : "border-[#2A3242] hover:border-[#22D3EE]/50"
                                  }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {preference === "must-have" && (
                                      <Star className="w-3 h-3 text-[#14B8A6] fill-[#14B8A6] flex-shrink-0" />
                                    )}
                                    <span className="text-sm text-[#E6E9EF] truncate">{item.name}</span>
                                  </div>
                                  <div className="flex flex-col items-end ml-2">
                                    {item.servingSize && (
                                      <span className="text-xs text-[#9AA3B2]">{item.servingSize}</span>
                                    )}
                                    <span className="text-sm text-[#E6E9EF]">{item.calories} cal</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-[#9AA3B2]">
                                  <span>P:{item.protein}g</span>
                                  <span>C:{item.carbs}g</span>
                                  <span>F:{item.fats}g</span>
                                  {isSelected(item.id) && (
                                    <span className="ml-auto text-[#22D3EE] flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      Selected
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
