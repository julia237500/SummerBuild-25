import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaClock, FaUtensils, FaHeart, FaStar, FaLock } from 'react-icons/fa';
import { GiCookingPot } from 'react-icons/gi';
import { recipeService } from '../services/recipeService';
import './RecipeCard.css';

export default function RecipeCard({ recipe, onFavoriteToggle, showActions = true }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    id,
    name,
    description,
    image_url,
    prep_time_minutes,
    cook_time_minutes,
    difficulty,
    cuisine_type,
    calories_per_serving,
    is_private,
    is_favorite,
    average_rating,
    total_ratings,
    dietary_restrictions = []
  } = recipe;

  const totalTime = prep_time_minutes + cook_time_minutes;

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsLoading(true);
      setError(null);
      await recipeService.toggleFavorite(id);
      if (onFavoriteToggle) {
        onFavoriteToggle(id);
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
      easy: '#2ecc71',
      medium: '#f1c40f',
      hard: '#e67e22',
      expert: '#e74c3c'
    };
    return colors[level] || '#95a5a6';
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Link to={`/recipe/${id}`} className="recipe-card">
      <div className="recipe-card-image">
        {image_url ? (
          <img src={image_url} alt={name} loading="lazy" />
        ) : (
          <div className="recipe-card-placeholder">
            <GiCookingPot />
          </div>
        )}
        {is_private && (
          <div className="recipe-privacy-badge">
            <FaLock />
          </div>
        )}
      </div>

      <div className="recipe-card-content">
        <div className="recipe-card-header">
          <h3>{name}</h3>
          {showActions && (
            <button
              className={`favorite-btn ${is_favorite ? 'active' : ''} ${isLoading ? 'loading' : ''}`}
              onClick={handleFavoriteClick}
              disabled={isLoading}
              aria-label={is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FaHeart />
            </button>
          )}
        </div>

        <p className="recipe-description">{description}</p>

        <div className="recipe-meta">
          <div className="recipe-stat">
            <FaClock />
            <span>{formatTime(totalTime)}</span>
          </div>
          <div className="recipe-stat">
            <FaUtensils />
            <span>{cuisine_type ? cuisine_type.replace('_', ' ') : 'Various'}</span>
          </div>
          {calories_per_serving && (
            <div className="recipe-stat">
              <span className="calories">{calories_per_serving}</span>
              <span>cal</span>
            </div>
          )}
        </div>

        <div className="recipe-footer">
          <div className="recipe-badges">
            <span 
              className="difficulty-badge"
              style={{ backgroundColor: getDifficultyColor(difficulty) }}
            >
              {difficulty}
          </span>
            {dietary_restrictions.map(restriction => (
              <span 
                key={restriction} 
                className="dietary-badge"
              >
                {restriction.replace('_', ' ')}
              </span>
            ))}
          </div>

          {average_rating > 0 && (
            <div className="recipe-rating">
              <FaStar />
              <span>{average_rating.toFixed(1)}</span>
              <span className="rating-count">({total_ratings})</span>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>
    </Link>
  );
} 