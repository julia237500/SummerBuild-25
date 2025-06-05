import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userRecipesService } from '../services/userRecipesService';
import './MyRecipes.css';

export default function MyRecipes() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await userRecipesService.getUserRecipes();
      setRecipes(data);
    } catch (err) {
      setError('Failed to load recipes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await userRecipesService.deleteRecipe(recipeId);
        setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
      } catch (err) {
        setError('Failed to delete recipe. Please try again.');
        console.error(err);
      }
    }
  };

  const handleEdit = (recipeId) => {
    navigate(`/my-recipes/edit/${recipeId}`);
  };

  const handleCreate = () => {
    navigate('/my-recipes/new');
  };

  if (loading) return <div className="loading">Loading recipes...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="my-recipes">
      <div className="my-recipes-header">
        <h1>My Recipes</h1>
        <button onClick={handleCreate} className="create-recipe-btn">
          Create New Recipe
        </button>
      </div>

      {recipes.length === 0 ? (
        <div className="no-recipes">
          <p>You haven't created any recipes yet.</p>
          <button onClick={handleCreate} className="create-recipe-btn">
            Create Your First Recipe
          </button>
        </div>
      ) : (
        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card">
              <div className="recipe-image-container">
                {recipe.image_url ? (
                  <img src={recipe.image_url} alt={recipe.title} />
                ) : (
                  <div className="placeholder-image">No Image</div>
                )}
              </div>
              <div className="recipe-content">
                <h3>{recipe.title}</h3>
                <p className="recipe-description">{recipe.description}</p>
                <div className="recipe-meta">
                  <span>Prep: {recipe.prep_time} mins</span>
                  <span>Cook: {recipe.cook_time} mins</span>
                </div>
                <div className="recipe-actions">
                  <button
                    onClick={() => handleEdit(recipe.id)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 