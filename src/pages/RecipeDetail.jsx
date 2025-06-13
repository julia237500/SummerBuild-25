import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recipeService } from '../services/recipeService';
import { spoonacularApi } from '../services/spoonacularApi';
import RecipeForm from '../components/RecipeForm';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSpoonacularRecipe, setIsSpoonacularRecipe] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      console.log('Fetching recipe with ID:', id);
      setLoading(true);
      setError(null);

      try {
        // Try local database first
        try {
          console.log('Attempting to fetch from local database...');
          const localData = await recipeService.getRecipeById(id);
          console.log('Local database response:', localData);
          if (localData) {
            setRecipe(localData);
            setIsSpoonacularRecipe(false);
            return;
          }
        } catch (localErr) {
          console.log('Recipe not found in local database:', localErr);
        }

        // If not in local database, try Spoonacular
        console.log('Attempting to fetch from Spoonacular...');
        const spoonacularRecipe = await spoonacularApi.getRecipeById(id);
        console.log('Spoonacular response:', spoonacularRecipe);
        
        if (!spoonacularRecipe) {
          throw new Error('Recipe not found in either database');
        }

        // Format Spoonacular recipe to match our schema
        const formattedRecipe = {
          id: spoonacularRecipe.id,
          name: spoonacularRecipe.title,
          description: spoonacularRecipe.summary,
          image_url: spoonacularRecipe.image,
          prep_time_minutes: Math.floor(spoonacularRecipe.readyInMinutes / 2),
          cook_time_minutes: Math.ceil(spoonacularRecipe.readyInMinutes / 2),
          servings: spoonacularRecipe.servings,
          difficulty: spoonacularRecipe.difficulty || 'medium',
          cuisine_type: spoonacularRecipe.cuisines?.[0] || 'Various',
          ingredients: spoonacularRecipe.extendedIngredients?.map(ing => ({
            item: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            notes: ing.notes
          })) || [],
          instructions: spoonacularRecipe.analyzedInstructions?.[0]?.steps?.map(step => ({
            step: step.number,
            text: step.step,
            time: step.length?.number || '',
            note: ''
          })) || []
        };

        console.log('Formatted Spoonacular recipe:', formattedRecipe);
        setRecipe(formattedRecipe);
        setIsSpoonacularRecipe(true);

      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError(err.message || 'Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      const updatedRecipe = await recipeService.updateRecipe(id, formData);
      setRecipe(updatedRecipe);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating recipe:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {error || 'Recipe not found'}
          </h2>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">      <div className="max-w-4xl mx-auto">
        {recipe.image_url && (
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="w-full h-64 object-cover rounded-lg shadow-lg mb-8"
          />
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{recipe.name}</h1>
          {!isSpoonacularRecipe && user && user.id === recipe.user_id && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Recipe'}
            </button>
          )}
          {isSpoonacularRecipe && (
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Back to Home
            </button>
          )}
        </div>

        {isEditing ? (
          <RecipeForm onSubmit={handleUpdate} initialData={recipe} />
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700">{recipe.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Preparation Time</h2>
                <p className="text-gray-700">{recipe.prep_time_minutes} minutes</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Cooking Time</h2>
                <p className="text-gray-700">{recipe.cook_time_minutes} minutes</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Difficulty</h2>
                <p className="text-gray-700 capitalize">{recipe.difficulty}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Servings</h2>
                <p className="text-gray-700">{recipe.servings}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingredients</h2>
              <ul className="list-disc list-inside space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-gray-700">
                    {ingredient.amount} {ingredient.unit} {ingredient.item}
                    {ingredient.notes && <span className="text-gray-500 ml-2">({ingredient.notes})</span>}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
              <ol className="list-decimal list-inside space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="text-gray-700">
                    <span>{instruction.text}</span>
                    {instruction.time && <span className="text-gray-500 ml-2">({instruction.time} minutes)</span>}
                    {instruction.note && <span className="text-gray-500 ml-2">- {instruction.note}</span>}
                  </li>
                ))}
              </ol>
            </div>

            {recipe.notes && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Notes</h2>
                <p className="text-gray-700">{recipe.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}