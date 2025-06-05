import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { spoonacularApi } from '../services/spoonacularApi';
import './RecipeSearch.css';

export default function RecipeSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const data = await spoonacularApi.searchRecipes(query);
      setRecipes(data.results);
    } catch (err) {
      setError('Failed to search recipes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };

  return (
    <div className="recipe-search">
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

      {error && <div className="error-message">{error}</div>}

      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="recipe-card"
            onClick={() => handleRecipeClick(recipe.id)}
            role="button"
            tabIndex={0}
          >
            <img src={recipe.image} alt={recipe.title} className="recipe-image" />
            <h3 className="recipe-title">{recipe.title}</h3>
            <div className="recipe-info">
              <span>Ready in {recipe.readyInMinutes} minutes</span>
              <span>{recipe.servings} servings</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 