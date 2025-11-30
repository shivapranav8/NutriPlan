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

export async function parseMenuWithOpenAI(text: string, apiKey: string): Promise<MenuItem[]> {
    try {
        console.log("[OPENAI] Calling OpenAI API...");
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a nutrition expert specializing in Indian cuisine and food analysis. Parse menu text accurately and provide detailed nutritional information. Return only valid JSON arrays."
                    },
                    {
                        role: "user",
                        content: `Parse the following menu text and extract all food items with their nutritional information.

INSTRUCTIONS:
1. Extract all food items from the text
2. Estimate calories, protein, carbs, and fats per item
3. Categorize each item by meal type
4. Focus on Indian and common foods
5. If an item says "2 rotis" or "3 eggs", calculate macros for the TOTAL quantity
6. If a line says "Paneer bhurji + 2 rotis", treat it as ONE meal and sum the macros
7. IGNORE noise like headers, prices, dates, or section titles

MENU TEXT:
${text}

OUTPUT FORMAT (return ONLY valid JSON, no markdown):
[
  {
    "name": "Food item name",
    "calories": 450,
    "protein": 25,
    "carbs": 60,
    "fats": 12,
    "category": "Breakfast|Main Course|Sides|Snacks|Dessert|Beverage|Bread",
    "servingSize": "The quantity/portion size (e.g., '1 cup', '2 pieces', '100g', '1 bowl')"
  }
]

If NO food items are found, return an empty array: []`
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("[OPENAI] API Error:", errorData);
            throw new Error(`OpenAI API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const textResponse = data.choices?.[0]?.message?.content;

        if (!textResponse) {
            throw new Error("No response from OpenAI");
        }

        console.log("[OPENAI] Raw response:", textResponse);

        // Clean up potential markdown formatting
        const cleanJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsedData = JSON.parse(cleanJson);

        // Handle both direct array and object with items property
        const parsedItems = Array.isArray(parsedData) ? parsedData : (parsedData.items || []);

        if (!Array.isArray(parsedItems)) {
            throw new Error("Invalid response format: not an array");
        }

        const items = parsedItems.map((item: any, index: number) => ({
            id: `openai-${Date.now()}-${index}`,
            name: item.name || "Unknown Item",
            calories: Number(item.calories) || 0,
            protein: Number(item.protein) || 0,
            carbs: Number(item.carbs) || 0,
            fats: Number(item.fats) || 0,
            category: item.category || "Other",
            servingSize: item.servingSize || "1 serving"
        }));

        console.log("[OPENAI] Parsed items:", items);
        return items;

    } catch (error) {
        console.error("[OPENAI] Error:", error);
        throw error;
    }
}
