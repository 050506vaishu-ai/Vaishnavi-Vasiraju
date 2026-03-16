import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateRecipe = async (ingredients: string[], goal: string, dietType: string) => {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a healthy recipe for someone with the goal of ${goal} and a ${dietType} diet. 
    Use these ingredients: ${ingredients.join(", ")}. 
    Format the response in Markdown with sections for Title, Ingredients, Step-by-step Instructions, and Nutritional Info (Calories, Protein, Carbs, Fats).`,
  });
  
  const response = await model;
  return response.text;
};

export const analyzeMealImage = async (base64Image: string) => {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
      {
        text: "Analyze this meal image. Estimate the total calories and provide a breakdown of macronutrients (Protein, Carbs, Fats). Also, give a brief health suggestion based on this meal.",
      },
    ],
  });

  const response = await model;
  return response.text;
};
