const express = require('express');
const router = express.Router();

// Placeholder route
router.get('/', (req, res) => {
  res.json([]);
});



const { getNutritionInfo } = require('../nutritiontags');
const supabase = require('../supabaseClient'); // adjust path as needed

// CREATE Recipe
router.post('/', async (req, res) => {
  try {
    const { name, ingredients, instructions, user_id } = req.body;
    // Get nutrition info from Spoonacular
    const nutrition = await getNutritionInfo(ingredients);

    const { data, error } = await supabase
      .from('recipes')
      .insert([{
        name,
        ingredients,
        instructions,
        user_id,
        calories: nutrition.calories,
        protein: nutrition.protein,
        fat: nutrition.fat,
        carbs: nutrition.carbs,
      }]);

    if (error) return res.status(400).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRecipe = req.body;
    const { data, error } = await supabase
      .from('recipes')
      .update(updatedRecipe)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

