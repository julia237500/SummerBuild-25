const API_KEY = '97d0f4a15fmsh7c7a1df5962d67ep17df05jsnb60fa2136237';
const BASE_URL = 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com';

const headers = {
  'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
  'x-rapidapi-key': API_KEY,
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

const logApiUsage = async () => {
  try {
    await fetch('/api/spoonacular/log', { method: 'POST' });
  } catch {}
};

export const spoonacularApi = {
  // Autocomplete search suggestions
  getAutocompleteSuggestions: async (query, number = 5) => {
    try {
      await logApiUsage();
      const params = new URLSearchParams({
        query: query,
        number: number
      });

      const response = await fetch(
        `${BASE_URL}/recipes/autocomplete?${params}`,
        { headers }
      );
      return handleResponse(response);
    } catch (error) {
      console.error('Error getting autocomplete suggestions:', error);
      throw error;
    }
  },

  // Search recipes with various parameters
  searchRecipes: async (query, sortBy = '', limit = 12) => {
    try {
      await logApiUsage();
      const params = new URLSearchParams({
        number: limit,
        addRecipeInformation: true,
        sort: sortBy || 'popularity', // Default sort by popularity if not specified
      });

      if (query) {
        params.append('query', query);
      }

      const response = await fetch(`${BASE_URL}/recipes/complexSearch?${params}`, { headers });
      return handleResponse(response);
    } catch (error) {
      console.error('Error searching recipes:', error);
      throw error;
    }
  },
  // Get detailed recipe information by ID
  getRecipeById: async (id) => {
    try {
      await logApiUsage();
      console.log('SpoonacularAPI: Fetching recipe with ID:', id);
      const params = new URLSearchParams({
        includeNutrition: true,
      });

      const response = await fetch(`${BASE_URL}/recipes/${id}/information?${params}`, { headers });
      if (!response.ok) {
        console.error('SpoonacularAPI: Error response:', response.status, response.statusText);
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('SpoonacularAPI: Successfully fetched recipe:', data);
      return data;
    } catch (error) {
      console.error('SpoonacularAPI: Error fetching recipe:', error);
      throw error;
    }
  },

  // Get similar recipes
  getSimilarRecipes: async (id, number = 4) => {
    try {
      await logApiUsage();
      const params = new URLSearchParams({
        number: number,
      });
      const response = await fetch(
        `${BASE_URL}/recipes/${id}/similar?${params}`,
        { headers }
      );
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching similar recipes:', error);
      throw error;
    }
  },

  // Get random recipes
  getRandomRecipes: async (number = 10, tags = '') => {
    try {
      await logApiUsage();
      const params = new URLSearchParams({
        number: number,
        tags: tags,
      });

      const response = await fetch(`${BASE_URL}/recipes/random?${params}`, { headers });
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching random recipes:', error);
      throw error;
    }
  },

  // Get recipe instructions by ID
  getRecipeInstructions: async (id) => {
    try {
      await logApiUsage();
      const params = new URLSearchParams({
        stepBreakdown: true,
      });
      const response = await fetch(
        `${BASE_URL}/recipes/${id}/analyzedInstructions?${params}`,
        { headers }
      );
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching recipe instructions:', error);
      throw error;
    }
  },

  // Get analyzed recipe instructions with equipment and ingredients
  getAnalyzedInstructions: async (id) => {
    try {
      await logApiUsage();
      const params = new URLSearchParams({
        stepBreakdown: true,
      });

      const response = await fetch(
        `${BASE_URL}/recipes/${id}/analyzedInstructions?${params}`,
        { headers }
      );
      const data = await handleResponse(response);
      
      // Return first instruction set if exists, otherwise empty array
      return data[0]?.steps || [];
    } catch (error) {
      console.error('Error fetching analyzed instructions:', error);
      throw error;
    }
  },

  // Get ingredient substitutes
  getIngredientSubstitutes: async (ingredientName) => {
    try {
      await logApiUsage();
      const params = new URLSearchParams({
        ingredientName: ingredientName
      });

      const response = await fetch(
        `${BASE_URL}/food/ingredients/substitutes?${params}`,
        { headers }
      );
      return handleResponse(response);
    } catch (error) {
      console.error('Error getting ingredient substitutes:', error);
      throw error;
    }
  }
};