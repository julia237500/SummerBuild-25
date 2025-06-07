const API_KEY = '2863f900ec384741b259f7931da49aae';
const BASE_URL = 'https://api.spoonacular.com/recipes';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

export const spoonacularApi = {
  // Search recipes with various parameters
  searchRecipes: async (query, sortBy = '', limit = 12) => {
    try {
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
      const response = await fetch(
        `${BASE_URL}/${id}/information?apiKey=${API_KEY}`
      );
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      throw error;
    }
  },

  // Get similar recipes
  getSimilarRecipes: async (id, number = 4) => {
    try {
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
  }
}; 