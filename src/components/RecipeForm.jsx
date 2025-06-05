import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userRecipesService } from '../services/userRecipesService';
import './RecipeForm.css';

export default function RecipeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    prep_time: '',
    cook_time: '',
    servings: '',
    image_url: '',
  });

  useEffect(() => {
    if (isEditing) {
      loadRecipe();
    }
  }, [id]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      const data = await userRecipesService.getRecipeById(id);
      setRecipe({
        ...data,
        ingredients: data.ingredients || [''],
        instructions: data.instructions || [''],
      });
    } catch (err) {
      setError('Failed to load recipe. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayChange = (index, value, field) => {
    setRecipe((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field) => {
    setRecipe((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (index, field) => {
    setRecipe((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Filter out empty items from arrays
      const formattedRecipe = {
        ...recipe,
        ingredients: recipe.ingredients.filter(Boolean),
        instructions: recipe.instructions.filter(Boolean),
      };

      if (isEditing) {
        await userRecipesService.updateRecipe(id, formattedRecipe);
      } else {
        await userRecipesService.createRecipe(formattedRecipe);
      }

      navigate('/my-recipes');
    } catch (err) {
      setError('Failed to save recipe. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) return <div className="loading">Loading recipe...</div>;

  return (
    <div className="recipe-form-container">
      <h1>{isEditing ? 'Edit Recipe' : 'Create New Recipe'}</h1>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="form-group">
          <label htmlFor="title">Recipe Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={recipe.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={recipe.description}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Ingredients*</label>
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index} className="array-input">
              <input
                type="text"
                value={ingredient}
                onChange={(e) =>
                  handleArrayChange(index, e.target.value, 'ingredients')
                }
                placeholder="e.g., 2 cups flour"
              />
              <button
                type="button"
                onClick={() => removeArrayItem(index, 'ingredients')}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('ingredients')}
            className="add-btn"
          >
            Add Ingredient
          </button>
        </div>

        <div className="form-group">
          <label>Instructions*</label>
          {recipe.instructions.map((instruction, index) => (
            <div key={index} className="array-input">
              <textarea
                value={instruction}
                onChange={(e) =>
                  handleArrayChange(index, e.target.value, 'instructions')
                }
                placeholder={`Step ${index + 1}`}
                rows="2"
              />
              <button
                type="button"
                onClick={() => removeArrayItem(index, 'instructions')}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('instructions')}
            className="add-btn"
          >
            Add Step
          </button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="prep_time">Prep Time (minutes)*</label>
            <input
              type="number"
              id="prep_time"
              name="prep_time"
              value={recipe.prep_time}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cook_time">Cook Time (minutes)*</label>
            <input
              type="number"
              id="cook_time"
              name="cook_time"
              value={recipe.cook_time}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="servings">Servings*</label>
            <input
              type="number"
              id="servings"
              name="servings"
              value={recipe.servings}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="image_url">Image URL</label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={recipe.image_url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/my-recipes')}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Recipe' : 'Create Recipe'}
          </button>
        </div>
      </form>
    </div>
  );
} 