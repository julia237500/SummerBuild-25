import { useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import supabase from '../services/supabaseClient';

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

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'expert'];
const CUISINE_TYPES = [
  'american', 'italian', 'chinese', 'japanese', 'mexican', 'indian',
  'french', 'thai', 'mediterranean', 'korean', 'vietnamese', 'other'
];

export default function UploadTester() {
  const [form, setForm] = useState(initialRecipe);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState('');

  // Test Supabase connection on mount
  useState(() => {
    (async () => {
      try {
        // Try to fetch 1 row from test_recipes table
        const { error } = await supabase.from('test_recipes').select('*').limit(1);
        if (error) {
          setSupabaseStatus('❌ Not connected to Supabase (test_recipes table not found or permission denied)');
        } else {
          setSupabaseStatus('✅ Connected to Supabase (test_recipes table accessible)');
        }
      } catch (err) {
        setSupabaseStatus('❌ Not connected to Supabase (error: ' + err.message + ')');
      }
    })();
  }, []);

  // Live preview recipe object for RecipeCard
  const previewRecipe = {
    ...form,
    id: 'preview',
    title: form.name,
    average_rating: 4.5,
    total_ratings: 10,
    is_favorite: false,
    image_url: imagePreview || form.image_url,
    prep_time_minutes: Number(form.prep_time_minutes) || 0,
    cook_time_minutes: Number(form.cook_time_minutes) || 0,
    dietary_restrictions: form.dietary_restrictions,
    ingredients: form.ingredients ? form.ingredients.split('\n') : [],
    instructions: form.instructions ? form.instructions.split('\n') : [],
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(prev => ({ ...prev, image_url: '' }));
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleDietaryChange = (restriction) => {
    setForm(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.includes(restriction)
        ? prev.dietary_restrictions.filter(r => r !== restriction)
        : [...prev.dietary_restrictions, restriction]
    }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'Recipe name is required.';
    if (!form.description.trim()) return 'Description is required.';
    if (!form.prep_time_minutes || !form.cook_time_minutes) return 'Prep and cook time required.';
    if (!form.servings) return 'Servings required.';
    if (!form.ingredients.trim()) return 'At least one ingredient required.';
    if (!form.instructions.trim()) return 'At least one instruction required.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const errMsg = validate();
    if (errMsg) {
      setError(errMsg);
      return;
    }
    setSubmitting(true);
    // Simulate upload to a test table (test_recipes)
    try {
      const { error: uploadError } = await supabase
        .from('test_recipes')
        .insert([{
          ...form,
          image_url: imagePreview || form.image_url,
          created_at: new Date().toISOString()
        }]);
      if (uploadError) throw uploadError;
      setSuccessMsg('Mock recipe uploaded to test_recipes table!');
    } catch (err) {
      setError('Failed to upload mock recipe: ' + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>🧪 Upload Tester</h1>
      <div style={{ marginBottom: 16, fontWeight: 500 }}>
        Supabase status: <span>{supabaseStatus}</span>
      </div>
      <p style={{ marginBottom: 24, color: '#666' }}>
        Test your recipe upload form here. This will not affect production data.
      </p>
      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
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
            <label>Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginBottom: 12 }} />
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
        {error && <div style={{ color: '#e74c3c', marginTop: 12 }}>{error}</div>}
        {successMsg && <div style={{ color: '#388E3C', marginTop: 12 }}>{successMsg}</div>}
        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 24,
            background: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '12px 32px',
            fontWeight: 600,
            fontSize: 16,
            cursor: submitting ? 'not-allowed' : 'pointer'
          }}
        >
          {submitting ? 'Uploading...' : 'Upload Mock Recipe'}
        </button>
      </form>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Live Preview</h2>
        <RecipeCard recipe={previewRecipe} showActions={false} />
      </div>
    </div>
  );
}
