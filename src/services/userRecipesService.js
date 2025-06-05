import { supabase } from './supabaseClient';

export const userRecipesService = {
  // Create a new recipe
  createRecipe: async (recipeData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('user_recipes')
        .insert([
          {
            ...recipeData,
            user_id: user.user.id,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  },

  // Get all recipes for the current user
  getUserRecipes: async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('user_recipes')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user recipes:', error);
      throw error;
    }
  },

  // Get a single recipe by ID
  getRecipeById: async (recipeId) => {
    try {
      const { data, error } = await supabase
        .from('user_recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching recipe:', error);
      throw error;
    }
  },

  // Update a recipe
  updateRecipe: async (recipeId, recipeData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('user_recipes')
        .update({
          ...recipeData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', recipeId)
        .eq('user_id', user.user.id) // Ensure user owns the recipe
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  },

  // Delete a recipe
  deleteRecipe: async (recipeId) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('user_recipes')
        .delete()
        .eq('id', recipeId)
        .eq('user_id', user.user.id); // Ensure user owns the recipe

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  },
}; 