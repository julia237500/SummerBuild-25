import axios from 'axios';

export const spoonacularApi = {
  // Search recipes with various parameters
  searchRecipes: async (query, sortBy = '', limit = 12) => {
    try {
      const res = await axios.get('/api/spoonacular/search', {
        params: { query, sort: sortBy, number: limit }
      });
      return res.data.results || res.data;
    } catch (error) {
      console.error('Error searching recipes:', error);
      throw error;
    }
  },

  // Get detailed recipe information by ID
  getRecipeById: async (id) => {
    try {
      const res = await axios.get(`/api/spoonacular/recipe/${id}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching recipe by ID:', error);
      throw error;
    }
  },

  // Get similar recipes
  getSimilarRecipes: async (id, number = 4) => {
    try {
      const res = await axios.get(`/api/spoonacular/recipe/${id}/similar`, {
        params: { number }
      });
      return res.data;
    } catch (error) {
      console.error('Error fetching similar recipes:', error);
      throw error;
    }
  },

  // Get random recipes
  getRandomRecipes: async (number = 10, tags = '') => {
    try {
      const res = await axios.get('/api/spoonacular/random', {
        params: { number, tags }
      });
      return res.data.recipes || res.data;
    } catch (error) {
      console.error('Error fetching random recipes:', error);
      throw error;
    }
  },

  // Get recipe instructions by ID
  getRecipeInstructions: async (id) => {
    try {
      const res = await axios.get(`/api/spoonacular/recipe/${id}/instructions`);
      return res.data;
    } catch (error) {
      console.error('Error fetching recipe instructions:', error);
      throw error;
    }
  },

  // Get ingredient substitutes
  getIngredientSubstitutes: async (ingredientName) => {
    try {
      const res = await axios.get('/api/spoonacular/substitutes', {
        params: { ingredientName }
      });
      return res.data;
    } catch (error) {
      console.error('Error getting ingredient substitutes:', error);
      throw error;
    }
  }
};