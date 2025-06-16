import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaClock, FaUtensils, FaHeart, FaStar, FaLock } from 'react-icons/fa';
import { GiCookingPot } from 'react-icons/gi';
import { recipeService } from '../services/recipeService';
import './RecipeCard.css';

export default function RecipeCard({ recipe, onFavoriteToggle, showActions = true }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(recipe.is_favorite);

  const {
    id,
    name,
    title, // support both name and title
    description,
    image_url,
    cooking_time,
    prep_time_minutes,
    cook_time_minutes,
    difficulty,
    cuisine_type,
    calories_per_serving,
    is_private,
    average_rating,
    total_ratings,
    dietary_restrictions = [],
    calories,
    protein,
    carbs
  } = recipe;

  const totalTime = prep_time_minutes && cook_time_minutes 
    ? prep_time_minutes + cook_time_minutes 
    : cooking_time;

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsLoading(true);
      setError(null);
      const newFavoriteStatus = await recipeService.toggleFavorite(id);
      setIsFavorite(newFavoriteStatus);
      if (onFavoriteToggle) {
        onFavoriteToggle(id, newFavoriteStatus);
      }
    } catch (err) {
      setError('Failed to update favorite status');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (level) => {
    const colors = {
      easy: 'bg-green-500',
      medium: 'bg-yellow-500',
      hard: 'bg-red-500'
    };
    return colors[level?.toLowerCase()] || 'bg-gray-500';
  };

  return (
    <Link to={`/recipe/${id.toString()}`} className="recipe-card">
      <div className="recipe-image-container">
        {image_url ? (
          <img src={image_url} alt={name || title} className="recipe-image" />
        ) : (
          <div className="recipe-image-placeholder">
            <GiCookingPot className="placeholder-icon" />
          </div>
        )}
        {showActions && (
          <button
            onClick={handleFavoriteClick}
            disabled={isLoading}
            className={`favorite-btn ${isFavorite ? 'active' : ''} ${isLoading ? 'loading' : ''}`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FaHeart />
          </button>
        )}
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}
        {is_private && (
          <div className="absolute top-2 left-2 bg-gray-800 bg-opacity-75 p-1 rounded-full">
            <FaLock className="text-white" />
          </div>
        )}
      </div>

      <div className="recipe-content">
        <h3 className="recipe-title">{name || title}</h3>
        {description && (
          <p className="recipe-description">{description}</p>
        )}

        <div className="recipe-meta">
          <div className="recipe-stat">
            <FaClock className="icon" />
            <span>{totalTime} mins</span>
          </div>
          {cuisine_type && (
            <div className="recipe-stat">
              <FaUtensils className="icon" />
              <span>{cuisine_type.replace('_', ' ')}</span>
            </div>
          )}
          {(calories_per_serving || calories) && (
            <div className="recipe-stat">
              <GiCookingPot className="icon" />
              <span>{calories_per_serving || calories} cal</span>
            </div>
          )}
        </div>

        <div className="recipe-footer">
          <div className="recipe-badges">
            {difficulty && (
              <span className={`difficulty-badge ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </span>
            )}
            {dietary_restrictions?.map((restriction) => (
              <span key={restriction} className="dietary-badge">
                {restriction.replace('_', ' ')}
              </span>
            ))}
          </div>

          {showActions && (
            <div className="recipe-actions">
              {average_rating && (
                <div className="recipe-rating">
                  <FaStar />
                  <span>{average_rating.toFixed(1)}</span>
                  {total_ratings && (
                    <span className="rating-count">({total_ratings})</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}


const handleFavourite = async () => {
  await axios.post('/api/favourites', { user_id, recipe_id: recipe.id });
  // Optionally update UI
};
// ...in your render:
<button onClick={handleFavourite}>Favourite</button>