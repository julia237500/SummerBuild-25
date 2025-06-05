import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { spoonacularApi } from '../services/spoonacularApi';
import './RecipeDetails.css';

export default function RecipeDetails() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const [recipeData, instructionsData] = await Promise.all([
          spoonacularApi.getRecipeById(id),
          spoonacularApi.getRecipeInstructions(id)
        ]);
        setRecipe(recipeData);
        setInstructions(instructionsData);
      } catch (err) {
        setError('Failed to load recipe details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id]);

  if (loading) return <div className="loading">Loading recipe details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!recipe) return <div className="error-message">Recipe not found</div>;

  return (
    <div className="recipe-details">
      <div className="recipe-header">
        <h1>{recipe.title}</h1>
        <img src={recipe.image} alt={recipe.title} className="recipe-main-image" />
        
        <div className="recipe-meta">
          <div className="meta-item">
            <span className="meta-label">Ready in:</span>
            <span className="meta-value">{recipe.readyInMinutes} minutes</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Servings:</span>
            <span className="meta-value">{recipe.servings}</span>
          </div>
          {recipe.healthScore && (
            <div className="meta-item">
              <span className="meta-label">Health Score:</span>
              <span className="meta-value">{recipe.healthScore}</span>
            </div>
          )}
        </div>

        {recipe.diets?.length > 0 && (
          <div className="recipe-tags">
            {recipe.diets.map((diet) => (
              <span key={diet} className="tag">
                {diet}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="recipe-content">
        <section className="ingredients-section">
          <h2>Ingredients</h2>
          <ul className="ingredients-list">
            {recipe.extendedIngredients?.map((ingredient) => (
              <li key={ingredient.id} className="ingredient-item">
                <span className="ingredient-amount">
                  {ingredient.amount} {ingredient.unit}
                </span>
                <span className="ingredient-name">{ingredient.name}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="instructions-section">
          <h2>Instructions</h2>
          {instructions.length > 0 ? (
            instructions.map((instruction) => (
              <div key={instruction.name || 'main'} className="instruction-group">
                {instruction.name && <h3>{instruction.name}</h3>}
                <ol className="instructions-list">
                  {instruction.steps.map((step) => (
                    <li key={step.number} className="instruction-step">
                      <span className="step-number">{step.number}</span>
                      <span className="step-text">{step.step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))
          ) : (
            <p className="no-instructions">No detailed instructions available.</p>
          )}
        </section>

        {recipe.nutrition && (
          <section className="nutrition-section">
            <h2>Nutrition Information</h2>
            <div className="nutrition-grid">
              {recipe.nutrition.nutrients?.slice(0, 8).map((nutrient) => (
                <div key={nutrient.name} className="nutrient-item">
                  <span className="nutrient-name">{nutrient.name}</span>
                  <span className="nutrient-value">
                    {nutrient.amount}{nutrient.unit}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
} 