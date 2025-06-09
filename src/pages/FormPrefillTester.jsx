import { useState } from 'react';
import RecipeCard from '../components/RecipeCard';

const initialRecipe = {
  name: '',
  description: '',
  image_url: '',
  prep_time_minutes: '',
  cook_time_minutes: '',
  servings: '',
  difficulty: 'medium',
  cuisine_type: 'other',
  calories_per_serving: '',
  is_private: false,
  dietary_restrictions: [],
  ingredients: '',
  instructions: '',
};

const sampleRecipe = {
  name: 'Classic Spaghetti Carbonara',
  description: 'A creamy, savory Italian pasta dish with pancetta, eggs, and cheese.',
  image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  prep_time_minutes: 10,
  cook_time_minutes: 20,
  servings: 2,
  difficulty: 'medium',
  cuisine_type: 'italian',
  calories_per_serving: 650,
  is_private: false,
  dietary_restrictions: ['gluten_free'],
  ingredients: [
    '200g gluten-free spaghetti',
    '100g pancetta',
    '2 large eggs',
    '50g grated parmesan',
    '2 cloves garlic',
    'Salt and pepper',
    'Fresh parsley'
  ].join('\n'),
  instructions: [
    'Cook spaghetti according to package instructions.',
    'Fry pancetta until crisp. Add garlic and cook briefly.',
    'Beat eggs and mix with parmesan.',
    'Drain pasta and combine with pancetta and garlic.',
    'Remove from heat, add egg/cheese mixture, and toss quickly.',
    'Season with salt, pepper, and parsley. Serve immediately.'
  ].join('\n'),
};

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'expert'];
const CUISINE_TYPES = [
  'american', 'italian', 'chinese', 'japanese', 'mexican', 'indian',
  'french', 'thai', 'mediterranean', 'korean', 'vietnamese', 'other'
];

export default function FormPrefillTester() {
  const [form, setForm] = useState(initialRecipe);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : value
    }));
  };

  const handleDietaryChange = (restriction) => {
    setForm(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.includes(restriction)
        ? prev.dietary_restrictions.filter(r => r !== restriction)
        : [...prev.dietary_restrictions, restriction]
    }));
  };

  const handlePrefill = () => {
    setForm(sampleRecipe);
  };

  const previewRecipe = {
    ...form,
    id: 'preview',
    title: form.name,
    average_rating: 4.7,
    total_ratings: 23,
    is_favorite: false,
    image_url: form.image_url,
    prep_time_minutes: Number(form.prep_time_minutes) || 0,
    cook_time_minutes: Number(form.cook_time_minutes) || 0,
    dietary_restrictions: form.dietary_restrictions,
    ingredients: form.ingredients ? form.ingredients.split('\n') : [],
    instructions: form.instructions ? form.instructions.split('\n') : [],
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>🧪 Form Pre-fill Tester</h1>
      <p style={{ marginBottom: 24, color: '#666' }}>
        Instantly fill the form with sample data to test layout, validation, and preview.
      </p>
      <button
        type="button"
        onClick={handlePrefill}
        style={{
          marginBottom: 24,
          background: '#ffd600',
          color: '#222c36',
          border: 'none',
          borderRadius: 6,
          padding: '12px 32px',
          fontWeight: 700,
          fontSize: 16,
          cursor: 'pointer'
        }}
      >
        Pre-fill form with sample data
      </button>
      <form style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <label>Recipe Name*</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
              required
            />
            <label>Description*</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
              required
            />
            <label>Image URL</label>
            <input
              type="text"
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
            />
            <label>Prep Time (min)*</label>
            <input
              type="number"
              name="prep_time_minutes"
              value={form.prep_time_minutes}
              onChange={handleChange}
              style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
              required
            />
            <label>Cook Time (min)*</label>
            <input
              type="number"
              name="cook_time_minutes"
              value={form.cook_time_minutes}
              onChange={handleChange}
              style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
              required
            />
            <label>Servings*</label>
            <input
              type="number"
              name="servings"
              value={form.servings}
              onChange={handleChange}
              style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
              required
            />
            <label>Difficulty</label>
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
            >
              {DIFFICULTY_LEVELS.map(level => (
                <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
              ))}
            </select>
            <label>Cuisine Type</label>
            <select
              name="cuisine_type"
              value={form.cuisine_type}
              onChange={handleChange}
              style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
            >
              {CUISINE_TYPES.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}</option>
              ))}
            </select>
            <label>Calories per Serving</label>
            <input
              type="number"
              name="calories_per_serving"
              value={form.calories_per_serving}
              onChange={handleChange}
              style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
            />
            <label>
              <input
                type="checkbox"
                name="is_private"
                checked={form.is_private}
                onChange={handleChange}
                style={{ marginRight: 8 }}
              />
              Private Recipe
            </label>
            <div style={{ margin: '12px 0' }}>
              <label>Dietary Restrictions:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free', 'halal', 'kosher', 'none'].map(r => (
                  <label key={r} style={{ fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={form.dietary_restrictions.includes(r)}
                      onChange={() => handleDietaryChange(r)}
                      style={{ marginRight: 4 }}
                    />
                    {r.replace('_', ' ')}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <label>Ingredients* (one per line)</label>
            <textarea
              name="ingredients"
              value={form.ingredients}
              onChange={handleChange}
              rows={8}
              style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
              required
            />
            <label>Instructions* (one per line)</label>
            <textarea
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              rows={8}
              style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
              required
            />
          </div>
        </div>
      </form>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Live Preview</h2>
        <RecipeCard recipe={previewRecipe} showActions={false} />
      </div>
    </div>
  );
}
