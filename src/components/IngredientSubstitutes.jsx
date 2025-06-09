import { useState } from 'react';
import { spoonacularApi } from '../services/spoonacularApi';
import './IngredientSubstitutes.css';

export default function IngredientSubstitutes() {
  const [ingredient, setIngredient] = useState('');
  const [substitutes, setSubstitutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ingredient.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const data = await spoonacularApi.getIngredientSubstitutes(ingredient.trim());
      setSubstitutes(data);
    } catch (err) {
      setError('Failed to find substitutes. Please try a different ingredient.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setIngredient('');
    setSubstitutes(null);
    setError(null);
  };

  return (
    <div className="ingredient-substitutes">
      <h2>Find Ingredient Substitutes</h2>
      <p className="subtitle">Don't have an ingredient? Find alternatives!</p>

      <form onSubmit={handleSubmit} className="substitute-form">
        <div className="input-group">
          <input
            type="text"
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            placeholder="Enter an ingredient (e.g., butter, eggs, milk)"
            className="substitute-input"
          />
          <button type="submit" disabled={loading || !ingredient.trim()} className="find-button">
            {loading ? 'Finding...' : 'Find Substitutes'}
          </button>
          {(substitutes || error) && (
            <button type="button" onClick={handleClear} className="clear-button">
              Clear
            </button>
          )}
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      {substitutes && !error && (
        <div className="substitutes-result">
          <h3>{substitutes.ingredient}</h3>
          
          {substitutes.status === 'success' ? (
            <>
              <div className="message success">
                {substitutes.message}
              </div>
              <ul className="substitutes-list">
                {substitutes.substitutes.map((substitute, index) => (
                  <li key={index} className="substitute-item">
                    <span className="substitute-icon">🔄</span>
                    {substitute}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="message error">
              No substitutes found for this ingredient.
            </div>
          )}
        </div>
      )}
    </div>
  );
} 