import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { spoonacularApi } from '../services/spoonacularApi';
import { recipeService } from '../services/recipeService';
import RecipeCard from './RecipeCard';
import './RecipeSearch.css';

export default function RecipeSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [onlineRecipes, setOnlineRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchMode, setSearchMode] = useState('all'); // 'all', 'database', 'online'
  const searchRef = useRef(null);

  useEffect(() => {
    // Add click outside listener to close suggestions
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const data = await spoonacularApi.getAutocompleteSuggestions(query);
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setShowSuggestions(false);

      // Search in user's database recipes
      let dbResults = [];
      if (searchMode === 'all' || searchMode === 'database') {
        dbResults = await searchUserRecipes(query);
      }

      // Search in online recipes
      let onlineResults = [];
      if (searchMode === 'all' || searchMode === 'online') {
        try {
          const data = await spoonacularApi.searchRecipes(query);
          onlineResults = data.results.map(recipe => ({
            id: `online-${recipe.id}`,
            title: recipe.title,
            description: recipe.summary?.slice(0, 150) + '...',
            image_url: recipe.image,
            cooking_time: recipe.readyInMinutes,
            prep_time_minutes: Math.floor(recipe.readyInMinutes / 2),
            cook_time_minutes: Math.ceil(recipe.readyInMinutes / 2),
            difficulty: recipe.difficulty || 'medium',
            cuisine_type: recipe.cuisines?.[0] || 'Various',
            calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || '562',
            protein: recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount + 'g' || '13g',
            carbs: recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount + 'g' || '22g',
            is_private: false,
            is_favorite: false,
            average_rating: recipe.spoonacularScore ? (recipe.spoonacularScore / 20) : 4.5,
            total_ratings: recipe.aggregateLikes || 0,
            dietary_restrictions: recipe.diets || [],
            source: 'online'
          }));
        } catch (err) {
          console.error('Failed to fetch online recipes:', err);
        }
      }

      setUserRecipes(dbResults);
      setOnlineRecipes(onlineResults);
    } catch (err) {
      setError('Failed to search recipes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchUserRecipes = async (searchQuery) => {
    try {
      const allUserRecipes = await recipeService.getUserRecipes();
      const searchTerms = searchQuery.toLowerCase().split(' ');
      
      return allUserRecipes.filter(recipe => {
        const recipeText = [
          recipe.name,
          recipe.description,
          recipe.cuisine_type,
          recipe.difficulty,
          recipe.ingredients ? JSON.stringify(recipe.ingredients) : '',
          recipe.instructions
        ].join(' ').toLowerCase();
        
        return searchTerms.some(term => recipeText.includes(term));
      }).map(recipe => ({
        id: recipe.id,
        title: recipe.name,
        description: recipe.description || 'No description available',
        image_url: recipe.image_url || '/default-recipe-image.jpg',
        cooking_time: (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0),
        prep_time_minutes: recipe.prep_time_minutes || 0,
        cook_time_minutes: recipe.cook_time_minutes || 0,
        difficulty: recipe.difficulty || 'medium',
        cuisine_type: recipe.cuisine_type || 'Various',
        calories: recipe.calories_per_serving || 'N/A',
        protein: 'N/A',
        carbs: 'N/A',
        is_private: recipe.is_private || false,
        is_favorite: false,
        average_rating: 4.5,
        total_ratings: 0,
        dietary_restrictions: [],
        source: 'database',
        servings: recipe.servings,
        user_id: recipe.user_id
      }));
    } catch (error) {
      console.error('Error searching user recipes:', error);
      return [];
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setQuery(suggestion.title);
    setShowSuggestions(false);
    await handleSearch({ preventDefault: () => {} });
  };

  const handleFavoriteToggle = (recipeId, isFavorite) => {
    // Update the recipe's favorite status in the local state
    if (recipeId.startsWith('online-')) {
      setOnlineRecipes(prevRecipes =>
        prevRecipes.map(recipe =>
          recipe.id === recipeId
            ? { ...recipe, is_favorite: isFavorite }
            : recipe
        )
      );
    } else {
      setUserRecipes(prevRecipes =>
        prevRecipes.map(recipe =>
          recipe.id === recipeId
            ? { ...recipe, is_favorite: isFavorite }
            : recipe
        )
      );
    }
  };

  const handleRecipeClick = (recipe) => {
    if (recipe.source === 'database') {
      // Navigate to user's recipe detail page
      navigate(`/my-recipes/${recipe.id}`);
    } else {
      // Navigate to online recipe detail page
      navigate(`/recipe/${recipe.id.replace('online-', '')}`);
    }
  };

  const totalResults = userRecipes.length + onlineRecipes.length;

  return (
    <div className="recipe-search">
      <div className="search-header">
        <h1>Recipe Search</h1>
        <p>Search through your personal recipes and discover new ones online</p>
      </div>

      <div className="search-container" ref={searchRef}>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for recipes..."
            className="search-input"
          />
          <button type="submit" disabled={loading} className="search-button">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="search-filters">
          <button 
            className={`filter-btn ${searchMode === 'all' ? 'active' : ''}`}
            onClick={() => setSearchMode('all')}
          >
            All Recipes
          </button>
          <button 
            className={`filter-btn ${searchMode === 'database' ? 'active' : ''}`}
            onClick={() => setSearchMode('database')}
          >
            My Recipes
          </button>
          <button 
            className={`filter-btn ${searchMode === 'online' ? 'active' : ''}`}
            onClick={() => setSearchMode('online')}
          >
            Online Recipes
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.title}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {query && !loading && (
        <div className="search-results">
          <div className="results-summary">
            <h2>Search Results for "{query}"</h2>
            <p>Found {totalResults} recipe(s)</p>
          </div>

          {/* User's Database Recipes Section */}
          {userRecipes.length > 0 && (searchMode === 'all' || searchMode === 'database') && (
            <div className="recipes-section">
              <div className="section-header">
                <h3>📚 Your Recipes ({userRecipes.length})</h3>
                <p>Recipes from your personal collection</p>
              </div>
              <div className="recipes-grid">
                {userRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    showActions={true}
                    onFavoriteToggle={handleFavoriteToggle}
                    onClick={() => handleRecipeClick(recipe)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Online Recipes Section */}
          {onlineRecipes.length > 0 && (searchMode === 'all' || searchMode === 'online') && (
            <div className="recipes-section">
              <div className="section-header">
                <h3>🌐 Online Recipes ({onlineRecipes.length})</h3>
                <p>Recipes from our online database</p>
              </div>
              <div className="recipes-grid">
                {onlineRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    showActions={true}
                    onFavoriteToggle={handleFavoriteToggle}
                    onClick={() => handleRecipeClick(recipe)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {totalResults === 0 && !loading && (
            <div className="no-results">
              <h3>No recipes found</h3>
              <p>Try different keywords or check your spelling. You can also:</p>
              <ul>
                <li>Search for specific ingredients (e.g., "chicken pasta")</li>
                <li>Search by cuisine type (e.g., "Italian recipes")</li>
                <li>Search by meal type (e.g., "quick dinner")</li>
                <li>Create a new recipe in your collection</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Quick Search Suggestions */}
      {!query && !loading && (
        <div className="quick-search">
          <h3>Popular Searches</h3>
          <div className="quick-search-buttons">
            <button onClick={() => setQuery('chicken')}>Chicken</button>
            <button onClick={() => setQuery('pasta')}>Pasta</button>
            <button onClick={() => setQuery('vegetarian')}>Vegetarian</button>
            <button onClick={() => setQuery('quick dinner')}>Quick Dinner</button>
            <button onClick={() => setQuery('italian')}>Italian</button>
            <button onClick={() => setQuery('dessert')}>Dessert</button>
          </div>
        </div>
      )}
    </div>
  );
} 