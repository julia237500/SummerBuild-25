import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { recipeService } from '../services/recipeService';
import RecipeCard from '../components/RecipeCard';

export default function MyRecipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRecipes = async () => {
      try {
        const data = await recipeService.getUserRecipes(user.id);
        setRecipes(data);
      } catch (error) {
        console.error('Error fetching user recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRecipes();
  }, [user.id]);

  const handleDeleteRecipe = async (recipeId) => {
    try {
      await recipeService.deleteRecipe(recipeId);
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Recipes</h1>
      {recipes.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>You haven't created any recipes yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <div key={recipe.id} className="relative">
              <RecipeCard recipe={recipe} />
              <button
                onClick={() => handleDeleteRecipe(recipe.id)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 