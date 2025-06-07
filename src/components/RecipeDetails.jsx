import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { spoonacularApi } from '../services/spoonacularApi';
import './RecipeDetails.css';

export default function RecipeDetails() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [analyzedInstructions, setAnalyzedInstructions] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [servings, setServings] = useState(1);
  const [measurementSystem, setMeasurementSystem] = useState('Metric');

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const [recipeData, instructionsData, analyzedData] = await Promise.all([
          spoonacularApi.getRecipeById(id),
          spoonacularApi.getRecipeInstructions(id),
          spoonacularApi.getAnalyzedInstructions(id)
        ]);
        setRecipe(recipeData);
        setInstructions(instructionsData);
        setAnalyzedInstructions(analyzedData);
      } catch (err) {
        setError('Failed to load recipe details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id]);

  const handleServingChange = (change) => {
    const newServings = servings + change;
    if (newServings > 0) {
      setServings(newServings);
    }
  };

  if (loading) return <div className="loading">Loading recipe details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!recipe) return <div className="error-message">Recipe not found</div>;

  return (
    <div className="recipe-details">
      <div className="recipe-header">
        <div className="recipe-image-container">
          <img src={recipe.image} alt={recipe.title} className="recipe-main-image" />
          <div className="recipe-rating">
            <span className="star-icon">★</span>
            <span>{recipe.spoonacularScore ? (recipe.spoonacularScore / 20).toFixed(1) : '4.9'}</span>
          </div>
          <div className="recipe-actions">
            <button className="action-btn download">
              <span>↓</span>
            </button>
            <button className="action-btn favorite">
              <span>♥</span>
            </button>
          </div>
        </div>

        <div className="recipe-title-section">
          <h1>{recipe.title}</h1>
          <p className="recipe-description">{recipe.summary}</p>
          
          <div className="recipe-meta">
            <div className="meta-item">
              <span className="meta-icon">⏱</span>
              <span>Preparation time</span>
              <strong>{recipe.readyInMinutes} min</strong>
            </div>
            <div className="meta-item">
              <span className="meta-icon">📊</span>
              <span>Level</span>
              <strong>{recipe.difficulty || 'Beginner'}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="recipe-content">
        <section className="ingredients-section">
          <div className="section-header">
            <h2>Ingredients</h2>
            <div className="measurement-toggle">
              <button 
                className={measurementSystem === 'Metric' ? 'active' : ''}
                onClick={() => setMeasurementSystem('Metric')}
              >
                Metric
              </button>
              <button 
                className={measurementSystem === 'US' ? 'active' : ''}
                onClick={() => setMeasurementSystem('US')}
              >
                US
              </button>
            </div>
          </div>

          <div className="servings-control">
            <span>Servings</span>
            <button onClick={() => handleServingChange(-1)}>−</button>
            <span>{servings}</span>
            <button onClick={() => handleServingChange(1)}>+</button>
          </div>

          <div className="ingredients-list">
            {recipe.extendedIngredients?.map((ingredient) => (
              <div key={ingredient.id} className="ingredient-item">
                <div className="ingredient-icon">
                  <img 
                    src={`https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`}
                    alt={ingredient.name}
                  />
                </div>
                <span className="ingredient-name">{ingredient.name}</span>
                <span className="ingredient-amount">
                  {measurementSystem === 'Metric' 
                    ? `${(ingredient.measures.metric.amount * servings).toFixed(1)}${ingredient.measures.metric.unitShort}`
                    : `${(ingredient.measures.us.amount * servings).toFixed(1)}${ingredient.measures.us.unitShort}`
                  }
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="directions-section">
          <h2>Directions</h2>
          {analyzedInstructions.length > 0 ? (
            <div className="steps-list">
              {analyzedInstructions.map((step, index) => (
                <div key={index} className="step-group">
                  <h3>Step {step.number}</h3>
                  
                  {/* Equipment needed for this step */}
                  {step.equipment && step.equipment.length > 0 && (
                    <div className="step-equipment">
                      <h4>Equipment Needed:</h4>
                      <div className="equipment-list">
                        {step.equipment.map((item, i) => (
                          <div key={i} className="equipment-item">
                            <img 
                              src={`https://spoonacular.com/cdn/equipment_100x100/${item.image}`}
                              alt={item.name}
                            />
                            <span>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Ingredients used in this step */}
                  {step.ingredients && step.ingredients.length > 0 && (
                    <div className="step-ingredients">
                      <h4>Ingredients Used:</h4>
                      <div className="ingredients-list">
                        {step.ingredients.map((ingredient, i) => (
                          <div key={i} className="step-ingredient">
                            <img 
                              src={`https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`}
                              alt={ingredient.name}
                            />
                            <span>{ingredient.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Step instruction */}
                  <p className="step-instruction">{step.step}</p>
                  
                  {/* Optional timing information */}
                  {step.length && (
                    <div className="step-timing">
                      <span className="time-icon">⏱</span>
                      <span>{step.length.number} {step.length.unit}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-instructions">No detailed instructions available.</p>
          )}
        </section>
      </div>
    </div>
  );
} 