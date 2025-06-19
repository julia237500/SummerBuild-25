require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // use service key for full access
);

const resetRecipeTable = async (req, res) => {
  try {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .neq('id', 0); // delete all (can adjust this)

    if (error) throw error;

    res.status(200).json({ message: 'Recipe table reset successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { resetRecipeTable };
