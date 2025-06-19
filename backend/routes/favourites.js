const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient'); // adjust path as needed

// Add favourite
router.post('/', async (req, res) => {
  const { user_id, recipe_id } = req.body;
  const { data, error } = await supabase
    .from('favourites')
    .insert([{ user_id, recipe_id }]);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

// Get user's favourites
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from('favourites')
    .select('*, recipes(*)')
    .eq('user_id', user_id);
  if (error) return res.status(400).json({ error });
  res.json(data);
});

module.exports = router;