import { useState } from 'react';
import { addMockRecipes, clearMockRecipes } from '../utils/mockRecipes';
import './MockDataManager.css';

export default function MockDataManager() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState('');

  const handleAddMockRecipes = async () => {
    setLoading(true);
    setMessage('');
    setResults(null);
    
    try {
      const results = await addMockRecipes();
      setResults(results);
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (failCount === 0) {
        setMessage(`✅ Successfully added ${successCount} mock recipes to your database!`);
      } else {
        setMessage(`⚠️ Added ${successCount} recipes, ${failCount} failed. Check console for details.`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      console.error('Error adding mock recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearMockRecipes = async () => {
    if (!window.confirm('Are you sure you want to remove all mock recipes? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setMessage('');
    setResults(null);
    
    try {
      await clearMockRecipes();
      setMessage('✅ Successfully removed all mock recipes from your database!');
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      console.error('Error clearing mock recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mock-data-manager">
      <div className="mock-data-header">
        <h2>📚 Mock Data Manager</h2>
        <p>Add sample recipes to your database for testing and demonstration purposes</p>
      </div>

      <div className="mock-data-actions">
        <button 
          onClick={handleAddMockRecipes}
          disabled={loading}
          className="add-mock-btn"
        >
          {loading ? 'Adding Recipes...' : '➕ Add Mock Recipes'}
        </button>
        
        <button 
          onClick={handleClearMockRecipes}
          disabled={loading}
          className="clear-mock-btn"
        >
          {loading ? 'Removing...' : '🗑️ Clear Mock Recipes'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : message.includes('⚠️') ? 'warning' : 'error'}`}>
          {message}
        </div>
      )}

      {results && (
        <div className="results-summary">
          <h3>Results Summary</h3>
          <div className="results-grid">
            {results.map((result, index) => (
              <div key={index} className={`result-item ${result.success ? 'success' : 'error'}`}>
                <span className="result-icon">
                  {result.success ? '✅' : '❌'}
                </span>
                <span className="result-name">{result.recipe}</span>
                {!result.success && (
                  <span className="result-error">{result.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mock-data-info">
        <h3>📋 What's Included</h3>
        <div className="recipe-list">
          <div className="recipe-category">
            <h4>🍝 Italian Cuisine</h4>
            <ul>
              <li>Classic Spaghetti Carbonara</li>
              <li>Homemade Pizza Margherita</li>
            </ul>
          </div>
          
          <div className="recipe-category">
            <h4>🍛 Asian Cuisine</h4>
            <ul>
              <li>Chicken Tikka Masala (Indian)</li>
              <li>Thai Green Curry</li>
              <li>Beef Stir Fry (Chinese)</li>
            </ul>
          </div>
          
          <div className="recipe-category">
            <h4>🥗 Healthy Options</h4>
            <ul>
              <li>Quick Breakfast Smoothie Bowl</li>
              <li>Mediterranean Quinoa Salad</li>
            </ul>
          </div>
          
          <div className="recipe-category">
            <h4>🍪 Desserts</h4>
            <ul>
              <li>Chocolate Chip Cookies</li>
            </ul>
          </div>
        </div>
        
        <div className="features-highlight">
          <h4>✨ Features to Test</h4>
          <ul>
            <li>Search functionality across your recipes</li>
            <li>Recipe filtering by cuisine type and difficulty</li>
            <li>Recipe details and instructions</li>
            <li>Ingredient lists and nutritional information</li>
            <li>Recipe cards and grid layouts</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 