const API_KEY = '2863f900ec384741b259f7931da49aae';
const BASE_URL = 'https://api.spoonacular.com/recipes';

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
        apiKey: API_KEY,
        query: query,
        number: number
      });

      const response = await fetch(
        `https://api.spoonacular.com/recipes/autocomplete?${params}`
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
        apiKey: API_KEY,
        number: limit,
        addRecipeInformation: true,
        sort: sortBy || 'popularity', // Default sort by popularity if not specified
      });

      if (query) {
        params.append('query', query);
      }

      const response = await fetch(`${BASE_URL}/complexSearch?${params}`);
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
        apiKey: API_KEY,
        includeNutrition: true,
      });

      const response = await fetch(`${BASE_URL}/${id}/information?${params}`);
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
      const response = await fetch(
        `${BASE_URL}/${id}/similar?apiKey=${API_KEY}&number=${number}`
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
        apiKey: API_KEY,
        number: number,
        tags: tags,
      });

      const response = await fetch(`${BASE_URL}/random?${params}`);
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
      const response = await fetch(
        `${BASE_URL}/${id}/analyzedInstructions?apiKey=${API_KEY}&stepBreakdown=true`
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
        apiKey: API_KEY,
        stepBreakdown: true,
      });

      const response = await fetch(
        `${BASE_URL}/${id}/analyzedInstructions?${params}`
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
        apiKey: API_KEY,
        ingredientName: ingredientName
      });

      const response = await fetch(
        `https://api.spoonacular.com/food/ingredients/substitutes?${params}`
      );
      return handleResponse(response);
    } catch (error) {
      console.error('Error getting ingredient substitutes:', error);
      throw error;
    }
  }
};