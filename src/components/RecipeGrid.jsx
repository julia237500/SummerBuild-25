import RecipeCard from './RecipeCard';
import './RecipeGrid.css';

export default function RecipeGrid({ recipes }) {
  // Take only the first 4 recipes
  const displayRecipes = recipes.slice(0, 4);

  return (
    <div className="recipe-grid-container">
      <div className="recipe-grid">
        {displayRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={{
              id: recipe.id,
              title: recipe.title,
              image_url: recipe.image_url,
              cooking_time: recipe.cooking_time,
              difficulty: recipe.difficulty
            }}
          />
        ))}
      </div>
    </div>
  );
} 