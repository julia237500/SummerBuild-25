import supabase from './supabaseClient';

export const recipeService = {
  // Get all recipes (public)
  async getAllRecipes() {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          categories (*),
          profiles!recipes_user_id_fkey (
            id,
            email,
            full_name,
            avatar_url,
            cooking_level
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching all recipes:', error);
      throw error;
    }
  },

  // Get recipes for the current user
  async getUserRecipes() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          categories (*),
          profiles!recipes_user_id_fkey (
            id,
            email,
            full_name,
            avatar_url,
            cooking_level
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user recipes:', error);
      throw error;
    }
  },

  // Get recipe by ID (with user check option)
  async getRecipeById(id, checkOwnership = false) {
    try {
      console.log('RecipeService: Fetching recipe with ID:', id);
      let query = supabase
        .from('recipes')
        .select(`
          *,
          categories (*),
          profiles!recipes_user_id_fkey (
            id,
            email,
            full_name,
            avatar_url,
            cooking_level
          )
        `)
        .eq('id', id)
        .single();
      
      if (checkOwnership) {
        const { data: { user } } = await supabase.auth.getUser();
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      if (error) {
        console.log('RecipeService: Error fetching recipe:', error);
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      console.log('RecipeService: Successfully fetched recipe:', data);
      return data;
    } catch (error) {
      console.error('RecipeService: Error fetching recipe:', error);
      throw error;
    }
  },

  // Create a new recipe
  async createRecipe(recipe) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      // Check if profile exists, if not create it
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        
        if (profileError) throw profileError;
      }

      // Parse ingredients if they're provided as a string
      const ingredients = typeof recipe.ingredients === 'string' 
        ? JSON.parse(recipe.ingredients)
        : recipe.ingredients;

      // Generate slug from name
      const slug = recipe.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data, error } = await supabase
        .from('recipes')
        .insert([{
          name: recipe.name,
          slug,
          description: recipe.description,
          ingredients: ingredients,
          instructions: recipe.instructions,
          prep_time_minutes: recipe.prep_time_minutes,
          cook_time_minutes: recipe.cook_time_minutes,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          cuisine_type: recipe.cuisine_type,
          calories_per_serving: recipe.calories_per_serving,
          image_url: recipe.image_url,
          video_url: recipe.video_url,
          source_url: recipe.source_url,
          notes: recipe.notes,
          is_private: recipe.is_private,
          user_id: user.id,
          category_id: recipe.category_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          categories (*),
          profiles!recipes_user_id_fkey (
            id,
            email,
            full_name,
            avatar_url,
            cooking_level
          )
        `);
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  },

  // Update a recipe (with ownership check)
  async updateRecipe(id, updates) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      // Parse ingredients if they're provided as a string
      const ingredients = typeof updates.ingredients === 'string'
        ? JSON.parse(updates.ingredients)
        : updates.ingredients;

      // Generate slug from name if name is being updated
      const slug = updates.name
        ? updates.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        : undefined;

    const { data, error } = await supabase
      .from('recipes')
        .update({
          name: updates.name,
          ...(slug && { slug }), // Only include slug if name was updated
          description: updates.description,
          ingredients: ingredients,
          instructions: updates.instructions,
          prep_time_minutes: updates.prep_time_minutes,
          cook_time_minutes: updates.cook_time_minutes,
          servings: updates.servings,
          difficulty: updates.difficulty,
          cuisine_type: updates.cuisine_type,
          calories_per_serving: updates.calories_per_serving,
          image_url: updates.image_url,
          video_url: updates.video_url,
          source_url: updates.source_url,
          notes: updates.notes,
          is_private: updates.is_private,
          category_id: updates.category_id || null,
          updated_at: new Date().toISOString()
        })
      .eq('id', id)
        .eq('user_id', user.id) // Ensure user owns the recipe
        .select(`
          *,
          categories (*),
          profiles!recipes_user_id_fkey (
            id,
            email,
            full_name,
            avatar_url,
            cooking_level
          )
        `);
    
    if (error) throw error;
    return data[0];
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  },

  // Delete a recipe (with ownership check)
  async deleteRecipe(id) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('recipes')
      .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user owns the recipe
    
    if (error) throw error;
    return true;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  },

  // Get all categories
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get user's favorite recipes
  async getFavoriteRecipes() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('favorite_recipes')
        .select(`
          recipe_id,
          recipes!favorite_recipes_recipe_id_fkey (
            *,
            categories (*),
            profiles!recipes_user_id_fkey (
              id,
              email,
              full_name,
              avatar_url,
              cooking_level
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map(favorite => favorite.recipes);
    } catch (error) {
      console.error('Error fetching favorite recipes:', error);
      throw error;
    }
  },

  // Toggle recipe favorite status
  async toggleFavorite(recipeId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      // Check if recipe is already favorited
      const { data: existing } = await supabase
        .from('favorite_recipes')
        .select('*')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .single();

      if (existing) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorite_recipes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);

        if (error) throw error;
        return false; // Indicates recipe was unfavorited
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorite_recipes')
          .insert([{ user_id: user.id, recipe_id: recipeId }]);

        if (error) throw error;
        return true; // Indicates recipe was favorited
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      throw error;
    }
  },

  // Test storage access
  async testStorageAccess() {
    try {
      // List all files in the recipe-images bucket
      const { data: files, error } = await supabase.storage
        .from('recipe-images')
        .list();

      if (error) throw error;

      // Get public URLs for all files
      const urls = await Promise.all(
        files.map(async (file) => {
          const { data: { publicUrl } } = supabase.storage
            .from('recipe-images')
            .getPublicUrl(file.name);
          return publicUrl;
        })
      );

      return { files, urls };
    } catch (error) {
      console.error('Error testing storage access:', error);
      throw error;
    }
  },

  // Save meal plan for user
  saveMealPlan: async (planner) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not found');
    // If planner is empty, upsert will fail due to missing required fields in DB
    if (!planner || Object.keys(planner).length === 0) {
      throw new Error('Meal plan is empty.');
    }
    let year, month;
    const keys = Object.keys(planner);
    if (keys.length > 0) {
      const [firstKey] = keys;
      const [y, m] = firstKey.split('-');
      year = parseInt(y, 10);
      month = parseInt(m, 10) - 1;
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
    }
    const start_date = new Date(year, month, 1).toISOString().slice(0, 10);
    const end_date = new Date(year, month + 1, 0).toISOString().slice(0, 10);

    // Upsert with valid start_date and end_date
    const { error } = await supabase
      .from('meal_plans')
      .upsert({
        user_id: user.id,
        name: 'Weekly Plan',
        start_date,
        end_date,
        plan_data: planner,
        updated_at: new Date().toISOString()
      }, { onConflict: ['user_id', 'name'] });
    if (error) {
      // Provide more details for debugging
      console.error('Failed to save meal plan:', error);
      throw new Error(error.message || 'Failed to save meal plan');
    }
    return true;
  },

  // Get meal plan for user
  getMealPlan: async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not found');
    const { data, error } = await supabase
      .from('meal_plans')
      .select('plan_data')
      .eq('user_id', user.id)
      .eq('name', 'Weekly Plan')
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data?.plan_data || {};
  },
};