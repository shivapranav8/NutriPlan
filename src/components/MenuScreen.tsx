import { motion } from "motion/react";
import { useState } from "react";
import { Search, Utensils } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: string;
}

interface MenuScreenProps {
  onSelectItem: (item: MenuItem) => void;
  selectedItems: MenuItem[];
}

// Sample Indian cafeteria menu items
const menuItems: MenuItem[] = [
  { id: "1", name: "Vegetable Biryani", calories: 450, protein: 12, carbs: 75, fats: 12, category: "Main Course" },
  { id: "2", name: "Chicken Curry with Rice", calories: 580, protein: 35, carbs: 68, fats: 18, category: "Main Course" },
  { id: "3", name: "Dal Tadka with Roti (2)", calories: 320, protein: 15, carbs: 48, fats: 8, category: "Main Course" },
  { id: "4", name: "Paneer Butter Masala", calories: 380, protein: 18, carbs: 22, fats: 25, category: "Main Course" },
  { id: "5", name: "Chole Bhature", calories: 550, protein: 14, carbs: 72, fats: 22, category: "Main Course" },
  { id: "6", name: "Idli Sambar (3 pcs)", calories: 280, protein: 8, carbs: 52, fats: 4, category: "Breakfast" },
  { id: "7", name: "Masala Dosa", calories: 420, protein: 10, carbs: 65, fats: 14, category: "Breakfast" },
  { id: "8", name: "Poha", calories: 250, protein: 6, carbs: 42, fats: 6, category: "Breakfast" },
  { id: "9", name: "Upma", calories: 220, protein: 5, carbs: 38, fats: 5, category: "Breakfast" },
  { id: "10", name: "Mixed Veg Salad", calories: 80, protein: 3, carbs: 12, fats: 2, category: "Sides" },
  { id: "11", name: "Raita (Bowl)", calories: 90, protein: 4, carbs: 8, fats: 5, category: "Sides" },
  { id: "12", name: "Papad (2 pcs)", calories: 80, protein: 2, carbs: 10, fats: 3, category: "Sides" },
  { id: "13", name: "Rajma Chawal", calories: 420, protein: 16, carbs: 64, fats: 10, category: "Main Course" },
  { id: "14", name: "Aloo Paratha (2)", calories: 480, protein: 10, carbs: 68, fats: 18, category: "Breakfast" },
  { id: "15", name: "Fruit Bowl (Mixed)", calories: 150, protein: 2, carbs: 36, fats: 0, category: "Snacks" },
];

export function MenuScreen({ onSelectItem, selectedItems }: MenuScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(menuItems.map((item) => item.category)))];

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isSelected = (itemId: string) => selectedItems.some((item) => item.id === itemId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl text-[#E6E9EF]">Cafeteria Menu</h1>
        <p className="text-[#9AA3B2]">
          Browse and select items to log or get suggestions
        </p>
      </div>

      {/* Search and Filter */}
      <div className="rounded-2xl bg-[#121722]/40 backdrop-blur-xl border border-[#2A3242] shadow-2xl p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA3B2]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#0B0E14] border border-[#2A3242] text-[#E6E9EF] placeholder:text-[#9AA3B2] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/50 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                selectedCategory === category
                  ? "bg-[#22D3EE] text-[#0B0E14]"
                  : "bg-[#0B0E14] border border-[#2A3242] text-[#9AA3B2] hover:border-[#22D3EE]/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectItem(item)}
            className={`text-left rounded-2xl bg-[#121722]/40 backdrop-blur-xl border shadow-lg p-5 space-y-3 transition-all hover:shadow-xl ${
              isSelected(item.id)
                ? "border-[#22D3EE] ring-2 ring-[#22D3EE]/20"
                : "border-[#2A3242] hover:border-[#22D3EE]/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/10 flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-[#22D3EE]" />
                </div>
                <div>
                  <h3 className="text-[#E6E9EF]">{item.name}</h3>
                  <p className="text-xs text-[#9AA3B2]">{item.category}</p>
                </div>
              </div>
              <span className="text-lg text-[#E6E9EF]">{item.calories}</span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#22D3EE]" />
                <span className="text-[#9AA3B2]">P: {item.protein}g</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#14B8A6]" />
                <span className="text-[#9AA3B2]">C: {item.carbs}g</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#14B8A6]" />
                <span className="text-[#9AA3B2]">F: {item.fats}g</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#9AA3B2]">No items found matching your search.</p>
        </div>
      )}
    </motion.div>
  );
}
