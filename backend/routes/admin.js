const express = require('express');
const router = express.Router();

// Simple in-memory admin session (for dev only)
let isLoggedIn = false;

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@abc.com' && password === 'admin123') {
    isLoggedIn = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid login credentials' });
  }
});

// Middleware to check admin login (for dev only)
function requireAdmin(req, res, next) {
  if (isLoggedIn) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// DELETE /api/recipes/reset – delete all recipes
router.delete('/recipes/reset', requireAdmin, async (req, res) => {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { error } = await supabase.from('recipes').delete().neq('id', 0);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'All recipes deleted successfully' });
});

// GET /api/recipes – view all
router.get('/recipes', requireAdmin, async (req, res) => {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { data, error } = await supabase.from('recipes').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PUT /api/recipes/:id – update
router.put('/recipes/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { data, error } = await supabase.from('recipes').update(updates).eq('id', id).select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// DELETE /api/recipes/:id – delete
router.delete('/recipes/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Recipe deleted' });
});

module.exports = router;
