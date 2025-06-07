import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recipeService } from '../services/recipeService';
import supabase from '../services/supabaseClient';
import './RecipeForm.css';

// Enums from database
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'expert'];
const CUISINE_TYPES = [
  'american', 'italian', 'chinese', 'japanese', 'mexican', 'indian',
  'french', 'thai', 'mediterranean', 'korean', 'vietnamese', 'other'
];
const DIETARY_RESTRICTIONS = [
  'vegetarian', 'vegan', 'gluten_free', 'dairy_free',
  'nut_free', 'halal', 'kosher', 'none'
];

export default function RecipeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recipe, setRecipe] = useState({
    name: '',
    description: '',
    ingredients: [{ item: '', amount: '', unit: '', notes: '' }],
    instructions: [{ step: 1, text: '', time: '', note: '' }],
    prep_time_minutes: '',
    cook_time_minutes: '',
    servings: '',
    difficulty: 'medium',
    cuisine_type: 'other',
    calories_per_serving: '',
    image_url: '',
    video_url: '',
    source_url: '',
    notes: '',
    is_private: false,
    category_id: '',
    dietary_restrictions: []
  });

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadRecipe();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await recipeService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadRecipe = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getRecipeById(id);
      setRecipe({
        ...data,
        ingredients: data.ingredients || [{ item: '', amount: '', unit: '', notes: '' }],
        instructions: data.instructions || [{ step: 1, text: '', time: '', note: '' }],
        dietary_restrictions: data.dietary_restrictions?.map(dr => dr.restriction) || []
      });
      if (data.image_url) {
        setImagePreview(data.image_url);
      }
    } catch (err) {
      setError('Failed to load recipe. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRecipe(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async (file) => {
    try {
      // Validate file type
      const fileExt = file.name.split('.').pop().toLowerCase();
      const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      if (!allowedTypes.includes(fileExt)) {
        throw new Error(`File type .${fileExt} not allowed. Please use: ${allowedTypes.join(', ')}`);
      }

      // Generate a unique filename
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `recipe-images/${fileName}`;

      // Upload the file
      const { error: uploadError, data } = await supabase.storage
        .from('recipe-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100;
            setUploadProgress(Math.round(percentage));
          },
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(filePath);

      // Verify the URL is accessible
      const response = await fetch(publicUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('Uploaded image is not accessible. Please try again.');
      }

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleIngredientChange = (index, field, value) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      ),
    }));
  };

  const addIngredient = () => {
    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { item: '', amount: '', unit: '', notes: '' }],
    }));
  };

  const removeIngredient = (index) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleInstructionChange = (index, field, value) => {
    setRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? { ...inst, [field]: value } : inst
      ),
    }));
  };

  const addInstruction = () => {
    setRecipe(prev => ({
      ...prev,
      instructions: [
        ...prev.instructions,
        { step: prev.instructions.length + 1, text: '', time: '', note: '' }
      ],
    }));
  };

  const removeInstruction = (index) => {
    setRecipe(prev => ({
      ...prev,
      instructions: prev.instructions
        .filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, step: i + 1 })),
    }));
  };

  const handleDietaryRestrictionChange = (restriction) => {
    setRecipe(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.includes(restriction)
        ? prev.dietary_restrictions.filter(r => r !== restriction)
        : [...prev.dietary_restrictions, restriction]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Upload image if new file is selected
      let imageUrl = recipe.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Generate slug from name
      const slug = recipe.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Filter out empty ingredients and instructions
      const formattedRecipe = {
        ...recipe,
        slug,
        image_url: imageUrl,
        ingredients: recipe.ingredients.filter(ing => 
          ing.item.trim() && ing.amount.trim() && ing.unit.trim()
        ),
        instructions: recipe.instructions.filter(inst => inst.text.trim()),
        prep_time_minutes: parseInt(recipe.prep_time_minutes),
        cook_time_minutes: parseInt(recipe.cook_time_minutes),
        servings: parseInt(recipe.servings),
        calories_per_serving: parseInt(recipe.calories_per_serving) || null
      };

      if (isEditing) {
        await recipeService.updateRecipe(id, formattedRecipe);
      } else {
        await recipeService.createRecipe(formattedRecipe);
      }

      navigate('/my-recipes');
    } catch (err) {
      setError('Failed to save recipe. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (loading && isEditing) return <div className="loading">Loading recipe...</div>;

  return (
    <div className="recipe-form-container">
      <h1>{isEditing ? 'Edit Recipe' : 'Create New Recipe'}</h1>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-group">
            <label htmlFor="name">Recipe Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={recipe.name}
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prep_time_minutes">Prep Time (minutes)*</label>
              <input
                type="number"
                id="prep_time_minutes"
                name="prep_time_minutes"
                value={recipe.prep_time_minutes}
                onChange={handleChange}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cook_time_minutes">Cook Time (minutes)*</label>
              <input
                type="number"
                id="cook_time_minutes"
                name="cook_time_minutes"
                value={recipe.cook_time_minutes}
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

            <div className="form-group">
              <label htmlFor="calories_per_serving">Calories per Serving</label>
              <input
                type="number"
                id="calories_per_serving"
                name="calories_per_serving"
                value={recipe.calories_per_serving}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty Level</label>
              <select
                id="difficulty"
                name="difficulty"
                value={recipe.difficulty}
                onChange={handleChange}
              >
                {DIFFICULTY_LEVELS.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="cuisine_type">Cuisine Type</label>
              <select
                id="cuisine_type"
                name="cuisine_type"
                value={recipe.cuisine_type}
                onChange={handleChange}
              >
                {CUISINE_TYPES.map(cuisine => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category_id">Category</label>
              <select
                id="category_id"
                name="category_id"
                value={recipe.category_id || ''}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Dietary Restrictions</h2>
          <div className="dietary-restrictions">
            {DIETARY_RESTRICTIONS.map(restriction => (
              <label key={restriction} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={recipe.dietary_restrictions.includes(restriction)}
                  onChange={() => handleDietaryRestrictionChange(restriction)}
                />
                {restriction.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h2>Ingredients</h2>
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-row">
              <div className="form-group">
                <label>Item*</label>
                <input
                  type="text"
                  value={ingredient.item}
                  onChange={(e) => handleIngredientChange(index, 'item', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount*</label>
                <input
                  type="text"
                  value={ingredient.amount}
                  onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Unit*</label>
                <input
                  type="text"
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input
                  type="text"
                  value={ingredient.notes}
                  onChange={(e) => handleIngredientChange(index, 'notes', e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addIngredient} className="add-btn">
            Add Ingredient
          </button>
        </div>

        <div className="form-section">
          <h2>Instructions</h2>
          {recipe.instructions.map((instruction, index) => (
            <div key={index} className="instruction-row">
              <div className="step-number">Step {instruction.step}</div>
              <div className="form-group">
                <label>Instruction*</label>
                <textarea
                  value={instruction.text}
                  onChange={(e) => handleInstructionChange(index, 'text', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time (minutes)</label>
                <input
                  type="number"
                  value={instruction.time}
                  onChange={(e) => handleInstructionChange(index, 'time', e.target.value)}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Note</label>
                <input
                  type="text"
                  value={instruction.note}
                  onChange={(e) => handleInstructionChange(index, 'note', e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addInstruction} className="add-btn">
            Add Instruction
          </button>
        </div>

        <div className="form-section">
          <h2>Media</h2>
          <div className="form-group">
            <label htmlFor="image">Recipe Image</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
            />
            {uploadProgress > 0 && <div className="upload-progress">{uploadProgress}%</div>}
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Recipe preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="video_url">Video URL</label>
            <input
              type="url"
              id="video_url"
              name="video_url"
              value={recipe.video_url}
              onChange={handleChange}
              placeholder="e.g., YouTube or Vimeo URL"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Additional Information</h2>
          <div className="form-group">
            <label htmlFor="source_url">Source URL</label>
            <input
              type="url"
              id="source_url"
              name="source_url"
              value={recipe.source_url}
              onChange={handleChange}
              placeholder="e.g., Original recipe website"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Recipe Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={recipe.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Additional notes, tips, or variations"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_private"
                checked={recipe.is_private}
                onChange={handleChange}
              />
              Make this recipe private
            </label>
          </div>
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