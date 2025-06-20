import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { spoonacularApi } from '../services/spoonacularApi';
import RecipeCard from './RecipeCard';
import './RecipeSearch.css';

export default function RecipeSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
      const data = await spoonacularApi.searchRecipes(query);
      
      // Format recipes to match RecipeCard component expectations
      const formattedRecipes = data.results.map(recipe => ({
        id: recipe.id,
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
        dietary_restrictions: recipe.diets || []
      }));
      
      setRecipes(formattedRecipes);
    } catch (err) {
      setError('Failed to search recipes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setQuery(suggestion.title);
    setShowSuggestions(false);
    try {
      setLoading(true);
      setError(null);
      const data = await spoonacularApi.searchRecipes(suggestion.title);
      
      // Format recipes to match RecipeCard component expectations
      const formattedRecipes = data.results.map(recipe => ({
        id: recipe.id,
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
        dietary_restrictions: recipe.diets || []
      }));
      
      setRecipes(formattedRecipes);
    } catch (err) {
      setError('Failed to search recipes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = (recipeId, isFavorite) => {
    // Update the recipe's favorite status in the local state
    setRecipes(prevRecipes =>
      prevRecipes.map(recipe =>
        recipe.id === recipeId
          ? { ...recipe, is_favorite: isFavorite }
          : recipe
      )
    );
  };

  return (
    <div className="recipe-search">
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

      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            showActions={true}
            onFavoriteToggle={handleFavoriteToggle}
          />
        ))}
      </div>
    </div>
  );
} 