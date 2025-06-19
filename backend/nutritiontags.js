const axios = require('axios');

async function getNutritionInfo(ingredients) {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  const response = await axios.post(
    `https://api.spoonacular.com/recipes/analyzeIngredients?apiKey=${apiKey}`,
    { ingredients }
  );
  // Parse response for calories, protein, fat, carbs
  return {
    calories: response.data.calories,
    protein: response.data.protein,
    fat: response.data.fat,
    carbs: response.data.carbs,
  };
}