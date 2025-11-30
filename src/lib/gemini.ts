
export interface MenuItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  category: string;
  servingSize: string;
}

export async function parseMenuWithGemini(text: string, apiKey: string): Promise<MenuItem[]> {
  const prompt = `
    You are a nutrition expert. Analyze the following text which may contain a menu, diet plan, or food list.
    
    Your task:
    1. IGNORE noise (headers like "Breakfast (10)", prices, dates).
    2. EXTRACT food items/meals.
    3. HANDLE QUANTITIES: If an item says "2 rotis" or "3 eggs", calculate the macros for that TOTAL quantity.
    4. HANDLE COMBOS: If a line says "Paneer bhurji + 2 rotis", treat it as ONE meal/item and sum the macros.
    5. ESTIMATE MACROS ACCURATELY: Use your knowledge of standard serving sizes and ingredients.
    
    Text to analyze:
    ${text}
    
    Return ONLY a valid JSON array. Each object must have:
    - name: The clean food name (e.g., "Paneer bhurji + 2 multigrain rotis")
    - calories: Total estimated calories (number)
    - protein: Total protein in g (number)
    - carbs: Total carbs in g (number)
    - fats: Total fats in g (number)
    - category: One of ["Breakfast", "Main Course", "Sides", "Snacks", "Dessert", "Beverage", "Bread"]
    - servingSize: The quantity/portion size (e.g., "1 cup", "2 pieces", "100g", "1 bowl")
    
    Important:
    - Return empty array [] if no food found.
    - NO markdown formatting.
    - NO comments.
    - RAW JSON only.
    
    Example output:
    [
      {
        "name": "Chicken Biryani",
        "calories": 450,
        "protein": 25,
        "carbs": 60,
        "fats": 12,
        "category": "Main Course",
        "servingSize": "1.5 cups"
      }
    ]
  `;

  // List of endpoints to try in order
  const endpoints = [
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
  ];

  let lastError;

  for (const url of endpoints) {
    try {
      console.log(`Trying Gemini API endpoint: ${url.split('?')[0]}...`);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`Endpoint failed: ${response.status}`, errorData);
        lastError = new Error(`Gemini API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        continue; // Try next endpoint
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        throw new Error("No response text from Gemini");
      }

      // Clean up potential markdown formatting
      const cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedItems = JSON.parse(cleanJson);

      if (!Array.isArray(parsedItems)) {
        throw new Error("Invalid response format: not an array");
      }

      return parsedItems.map((item: any, index: number) => ({
        id: `gemini-${Date.now()}-${index}`,
        name: item.name || "Unknown Item",
        calories: Number(item.calories) || 0,
        protein: Number(item.protein) || 0,
        carbs: Number(item.carbs) || 0,
        fats: Number(item.fats) || 0,
        category: item.category || "Other"
      }));

    } catch (error) {
      console.warn(`Error with endpoint ${url}:`, error);
      lastError = error;
      // Continue to next endpoint
    }
  }

  // If all endpoints failed
  console.error("All Gemini endpoints failed.");
  throw lastError || new Error("Failed to connect to Gemini API after multiple attempts");
}
