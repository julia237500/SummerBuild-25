const express = require('express');
const router = express.Router();
const supabase = require('../db/supabaseClient');

// Delete all recipes
router.delete('/reset', async (req, res) => {
  const { error } = await supabase.from('recipes').delete().neq('id', 0); // Delete all
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'All recipes deleted successfully' });
});

module.exports = router;
