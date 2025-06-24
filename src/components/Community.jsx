import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recipeService } from '../services/recipeService';
import RecipeCard from './RecipeCard';
import { FaUsers, FaShare, FaHeart, FaStar, FaFilter } from 'react-icons/fa';
import './Community.css';

export default function Community() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, trending, recent, popular
  const [searchQuery, setSearchQuery] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  useEffect(() => {
    loadCommunityRecipes();
  }, [filter, cuisineFilter, difficultyFilter]);

  const loadCommunityRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all public recipes from the community
      const allRecipes = await recipeService.getAllRecipes();
      
      // Filter recipes based on current filters
      let filteredRecipes = allRecipes.filter(recipe => {
        // Only show public recipes
        if (recipe.is_private) return false;
        
        // Apply cuisine filter
        if (cuisineFilter !== 'all' && recipe.cuisine_type !== cuisineFilter) return false;
        
        // Apply difficulty filter
        if (difficultyFilter !== 'all' && recipe.difficulty !== difficultyFilter) return false;
        
        // Apply search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const recipeText = [
            recipe.name,
            recipe.description,
            recipe.cuisine_type,
            recipe.difficulty
          ].join(' ').toLowerCase();
          
          if (!recipeText.includes(query)) return false;
        }
        
        return true;
      });

      // Apply sorting based on filter
      switch (filter) {
        case 'trending':
          filteredRecipes.sort((a, b) => (b.total_ratings || 0) - (a.total_ratings || 0));
          break;
        case 'recent':
          filteredRecipes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case 'popular':
          filteredRecipes.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
          break;
        default:
          // Keep original order for 'all'
          break;
      }

      setRecipes(filteredRecipes);
    } catch (err) {
      setError('Failed to load community recipes');
      console.error('Error loading community recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCommunityRecipes();
  };

  const clearFilters = () => {
    setFilter('all');
    setSearchQuery('');
    setCuisineFilter('all');
    setDifficultyFilter('all');
  };

  const getFilterIcon = () => {
    switch (filter) {
      case 'trending': return '🔥';
      case 'recent': return '🕒';
      case 'popular': return '⭐';
      default: return '📋';
    }
  };

  return (
    <div className="community">
      <div className="community-header">
        <div className="community-hero">
          <h1>🍳 Recipe Community</h1>
          <p>Discover, share, and connect with fellow food lovers from around the world</p>
          <div className="community-stats">
            <div className="stat">
              <FaUsers className="stat-icon" />
              <span>{recipes.length} Recipes Shared</span>
            </div>
            <div className="stat">
              <FaShare className="stat-icon" />
              <span>Global Community</span>
            </div>
          </div>
        </div>

        {user && (
          <div className="share-cta">
            <h3>Share Your Recipe</h3>
            <p>Have a delicious recipe to share? Join the community!</p>
            <Link to="/my-recipes/new" className="share-button">
              <FaShare />
              Share Recipe
            </Link>
          </div>
        )}
      </div>

      <div className="community-filters">
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Recipes</option>
              <option value="trending">🔥 Trending</option>
              <option value="recent">🕒 Recent</option>
              <option value="popular">⭐ Popular</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Cuisine:</label>
            <select 
              value={cuisineFilter} 
              onChange={(e) => setCuisineFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Cuisines</option>
              <option value="italian">Italian</option>
              <option value="chinese">Chinese</option>
              <option value="indian">Indian</option>
              <option value="mexican">Mexican</option>
              <option value="thai">Thai</option>
              <option value="american">American</option>
              <option value="mediterranean">Mediterranean</option>
              <option value="japanese">Japanese</option>
              <option value="french">French</option>
              <option value="korean">Korean</option>
              <option value="vietnamese">Vietnamese</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Difficulty:</label>
            <select 
              value={difficultyFilter} 
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <button onClick={clearFilters} className="clear-filters-btn">
            <FaFilter />
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading community recipes...</p>
        </div>
      ) : (
        <div className="community-content">
          <div className="results-header">
            <h2>{getFilterIcon()} {filter.charAt(0).toUpperCase() + filter.slice(1)} Recipes</h2>
            <p>{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found</p>
          </div>

          {recipes.length === 0 ? (
            <div className="no-recipes">
              <div className="no-recipes-content">
                <h3>No recipes found</h3>
                <p>Try adjusting your filters or be the first to share a recipe!</p>
                {user && (
                  <Link to="/my-recipes/new" className="share-button">
                    <FaShare />
                    Share Your First Recipe
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="recipes-grid">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!user && (
        <div className="join-community">
          <div className="join-content">
            <h3>Join the Recipe Community</h3>
            <p>Sign up to share your own recipes and connect with food lovers worldwide!</p>
            <div className="join-buttons">
              <Link to="/signup" className="join-button primary">
                Sign Up
              </Link>
              <Link to="/signin" className="join-button secondary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 