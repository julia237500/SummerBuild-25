import { useNavigate } from 'react-router-dom';
import { recipeService } from '../services/recipeService';
import RecipeForm from '../components/RecipeForm';

export default function NewRecipe() {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await recipeService.createRecipe(formData);
      navigate('/my-recipes');
    } catch (error) {
      console.error('Error creating recipe:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Recipe</h1>
      <div className="max-w-2xl mx-auto">
        <RecipeForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
} 