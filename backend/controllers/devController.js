require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = require('../supabaseClient');


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
