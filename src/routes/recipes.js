require('dotenv').config(); // If not already in app.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const express = require('express');
const router = express.Router();

// CREATE Recipe
router.post('/', async (req, res) => {
  const { title, ingredients, instructions, user_id } = req.body;
  const { data, error } = await supabase
    .from('recipes')
    .insert([{ title, ingredients, instructions, user_id }]);

  if (error) return res.status(400).json({ error });
  res.json(data);
});

// READ all recipes for a user
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', user_id);

  if (error) return res.status(400).json({ error });
  res.json(data);
});

// UPDATE recipe
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, ingredients, instructions } = req.body;
  const { data, error } = await supabase
    .from('recipes')
    .update({ title, ingredients, instructions })
    .eq('id', id);

  if (error) return res.status(400).json({ error });
  res.json(data);
});

// DELETE recipe
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('recipes').delete().eq('id', id);

  if (error) return res.status(400).json({ error });
  res.json(data);
});

module.exports = router;