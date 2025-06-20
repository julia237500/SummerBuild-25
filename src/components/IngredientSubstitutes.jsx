import { useState } from 'react';
import { spoonacularApi } from '../services/spoonacularApi';
import './IngredientSubstitutes.css';

export default function IngredientSubstitutes() {
  const [ingredient, setIngredient] = useState('');
  const [substitutes, setSubstitutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!ingredient.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const data = await spoonacularApi.getIngredientSubstitutes(ingredient);
      setSubstitutes(data);
    } catch (err) {
      setError('Failed to find substitutes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ingredient-substitutes">
      <div className="substitutes-header">
        <h2>Ingredient Substitutes</h2>
        <p>Find alternatives for ingredients you don't have</p>
      </div>

      <form onSubmit={handleSearch} className="substitutes-form">
        <div className="input-group">
          <input
            type="text"
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            placeholder="Enter ingredient name (e.g., butter, eggs, milk)..."
            className="substitute-input"
            required
          />
          <button type="submit" disabled={loading} className="search-substitute-btn">
            {loading ? 'Searching...' : 'Find Substitutes'}
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      {substitutes && (
        <div className="substitutes-results">
          {substitutes.status === 'success' ? (
            <div className="substitutes-content">
              <h3>Substitutes for {ingredient}</h3>
              
              {substitutes.substitutes && substitutes.substitutes.length > 0 ? (
                <div className="substitutes-list">
                  {substitutes.substitutes.map((substitute, index) => (
                    <div key={index} className="substitute-item">
                      <h4>{substitute.name}</h4>
                      {substitute.message && (
                        <p className="substitute-message">{substitute.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-substitutes">No specific substitutes found for {ingredient}.</p>
              )}

              {substitutes.message && (
                <div className="general-message">
                  <h4>General Information:</h4>
                  <p>{substitutes.message}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="no-results">
              <p>No substitutes found for "{ingredient}". Try a different ingredient or check the spelling.</p>
            </div>
          )}
        </div>
      )}

      <div className="substitutes-tips">
        <h3>Tips for Finding Substitutes</h3>
        <ul>
          <li>Use common ingredient names (e.g., "butter" instead of "unsalted butter")</li>
          <li>Try singular forms (e.g., "egg" instead of "eggs")</li>
          <li>Use basic ingredients rather than brand names</li>
          <li>Consider dietary restrictions when choosing substitutes</li>
        </ul>
      </div>
    </div>
  );
} 