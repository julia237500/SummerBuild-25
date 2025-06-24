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
      console.error('Error in handleSearch:', err);
      setError(`Failed to find substitutes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render substitutes based on different response formats
  const renderSubstitutes = () => {
    if (!substitutes) return null;

    // Handle different response formats
    let substitutesList = [];
    let generalMessage = '';
    let status = 'unknown';

    // Check if it's the expected format (array of strings)
    if (substitutes.status === 'success' && Array.isArray(substitutes.substitutes)) {
      substitutesList = substitutes.substitutes.map(substitute => ({
        name: substitute.split('=')[0]?.trim() || substitute,
        message: substitute,
        ratio: substitute.split('=')[1]?.trim() || ''
      }));
      generalMessage = substitutes.message || '';
      status = 'success';
    }
    // Check if it's the object format with name and message
    else if (substitutes.status === 'success' && substitutes.substitutes && Array.isArray(substitutes.substitutes)) {
      substitutesList = substitutes.substitutes;
      generalMessage = substitutes.message || '';
      status = 'success';
    }
    // Check if it's a different format (direct array)
    else if (Array.isArray(substitutes)) {
      substitutesList = substitutes.map(substitute => {
        if (typeof substitute === 'string') {
          return {
            name: substitute.split('=')[0]?.trim() || substitute,
            message: substitute,
            ratio: substitute.split('=')[1]?.trim() || ''
          };
        }
        return substitute;
      });
      status = 'success';
    }
    // Check if it's an object with different structure
    else if (substitutes.substitutes && Array.isArray(substitutes.substitutes)) {
      substitutesList = substitutes.substitutes;
      generalMessage = substitutes.message || '';
      status = 'success';
    }
    // Check if it's a single substitute object
    else if (substitutes.name || substitutes.substitute) {
      substitutesList = [substitutes];
      status = 'success';
    }
    // Check if it's an error response
    else if (substitutes.status === 'failure' || substitutes.error) {
      status = 'failure';
      generalMessage = substitutes.message || substitutes.error || 'No substitutes found';
    }

    if (status === 'success' && substitutesList.length > 0) {
      return (
        <div className="substitutes-content">
          <h3>Substitutes for {ingredient}</h3>
          
          <div className="substitutes-list">
            {substitutesList.map((substitute, index) => (
              <div key={index} className="substitute-item">
                <h4>{substitute.name || substitute.substitute || substitute.title || 'Unknown Substitute'}</h4>
                {(substitute.message || substitute.description) && (
                  <p className="substitute-message">{substitute.message || substitute.description}</p>
                )}
                {substitute.ratio && (
                  <p className="substitute-ratio">Ratio: {substitute.ratio}</p>
                )}
              </div>
            ))}
          </div>

          {generalMessage && (
            <div className="general-message">
              <h4>General Information:</h4>
              <p>{generalMessage}</p>
            </div>
          )}
        </div>
      );
    } else if (status === 'failure') {
      return (
        <div className="no-results">
          <p>{generalMessage || `No substitutes found for "${ingredient}". Try a different ingredient or check the spelling.`}</p>
        </div>
      );
    } else {
      return (
        <div className="no-results">
          <p>No substitutes found for "{ingredient}". Try a different ingredient or check the spelling.</p>
        </div>
      );
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
          {renderSubstitutes()}
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