const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient'); // adjust path if needed

// POST /api/collections
router.post('/', async (req, res) => {
  const { user_id, name, description } = req.body;
  const { data, error } = await supabase
    .from('collections')
    .insert([{ user_id, name, description }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

// GET /api/collections?user_id=...
router.get('/', async (req, res) => {
  const { user_id } = req.query;
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', user_id);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;