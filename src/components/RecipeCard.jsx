import { Link } from 'react-router-dom';

export default function RecipeCard({ recipe }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {recipe.image_url && (
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {recipe.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {recipe.cooking_time} mins
          </span>
          <Link
            to={`/recipe/${recipe.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            View Recipe
          </Link>
        </div>
      </div>
    </div>
  );
} 