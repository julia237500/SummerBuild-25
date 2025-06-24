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

export const spoonacularApi = {
  // Autocomplete search suggestions
  getAutocompleteSuggestions: async (query, number = 5) => {
    try {
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
      console.log('SpoonacularAPI: Getting substitutes for:', ingredientName);
      const params = new URLSearchParams({
        ingredientName: ingredientName
      });

      const url = `${BASE_URL}/food/ingredients/substitutes?${params}`;
      console.log('SpoonacularAPI: Making request to:', url);

      const response = await fetch(url, { headers });
      console.log('SpoonacularAPI: Response status:', response.status);
      
      if (!response.ok) {
        console.error('SpoonacularAPI: Error response:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('SpoonacularAPI: Error body:', errorText);
        
        // If it's a 429 (rate limit) or 403 (forbidden), provide fallback data
        if (response.status === 429 || response.status === 403) {
          console.log('SpoonacularAPI: Using fallback data due to API limits');
          return getFallbackSubstitutes(ingredientName);
        }
        
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('SpoonacularAPI: Successfully fetched substitutes:', data);
      
      // If the API returns an empty response, try fallback
      if (!data || (data.status === 'failure' && !data.substitutes)) {
        console.log('SpoonacularAPI: Using fallback data due to empty response');
        return getFallbackSubstitutes(ingredientName);
      }
      
      return data;
    } catch (error) {
      console.error('SpoonacularAPI: Error getting ingredient substitutes:', error);
      
      // If there's a network error, provide fallback data
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        console.log('SpoonacularAPI: Using fallback data due to network error');
        return getFallbackSubstitutes(ingredientName);
      }
      
      throw error;
    }
  }
};

// Fallback substitutes data for common ingredients
const getFallbackSubstitutes = (ingredientName) => {
  const fallbackData = {
    'butter': {
      status: 'success',
      substitutes: [
        {
          name: 'Olive Oil',
          message: 'Use 3/4 cup olive oil for 1 cup butter in most recipes. Best for cooking and baking.',
          ratio: '3/4 cup olive oil = 1 cup butter'
        },
        {
          name: 'Coconut Oil',
          message: 'Use 1:1 ratio. Best for baking and cooking. Adds a slight coconut flavor.',
          ratio: '1:1 ratio'
        },
        {
          name: 'Applesauce',
          message: 'Use 1/2 cup applesauce for 1 cup butter in baking. Reduces fat content.',
          ratio: '1/2 cup applesauce = 1 cup butter'
        }
      ],
      message: 'These are common substitutes for butter. Adjust based on your recipe and dietary needs.'
    },
    'eggs': {
      status: 'success',
      substitutes: [
        {
          name: 'Flaxseed Meal',
          message: 'Mix 1 tbsp ground flaxseed with 3 tbsp water. Let sit for 5 minutes before using.',
          ratio: '1 tbsp flaxseed + 3 tbsp water = 1 egg'
        },
        {
          name: 'Chia Seeds',
          message: 'Mix 1 tbsp chia seeds with 3 tbsp water. Let sit for 15 minutes before using.',
          ratio: '1 tbsp chia seeds + 3 tbsp water = 1 egg'
        },
        {
          name: 'Banana',
          message: 'Use 1/4 cup mashed banana for 1 egg in baking. Adds sweetness and moisture.',
          ratio: '1/4 cup mashed banana = 1 egg'
        }
      ],
      message: 'These substitutes work well in most baking recipes. Adjust baking time as needed.'
    },
    'milk': {
      status: 'success',
      substitutes: [
        {
          name: 'Almond Milk',
          message: 'Use 1:1 ratio. Unsweetened works best for savory dishes.',
          ratio: '1:1 ratio'
        },
        {
          name: 'Soy Milk',
          message: 'Use 1:1 ratio. Good for both sweet and savory recipes.',
          ratio: '1:1 ratio'
        },
        {
          name: 'Coconut Milk',
          message: 'Use 1:1 ratio. Adds a slight coconut flavor.',
          ratio: '1:1 ratio'
        }
      ],
      message: 'Plant-based milks work well in most recipes. Choose unsweetened for savory dishes.'
    }
  };

  const ingredient = ingredientName.toLowerCase();
  return fallbackData[ingredient] || {
    status: 'failure',
    message: `No substitutes found for "${ingredientName}". Try common ingredients like butter, eggs, or milk.`
  };
};