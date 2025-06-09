import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { spoonacularApi } from '../services/spoonacularApi';
import RecipeCard from './RecipeCard';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch random recipes
        const randomData = await spoonacularApi.getRandomRecipes(6);
        setRandomRecipes(randomData.recipes);

        // Fetch popular recipes (using search with sorting by popularity)
        const popularData = await spoonacularApi.searchRecipes('', 'popularity', 6);
        setPopularRecipes(popularData.results);
      } catch (err) {
        setError('Failed to load recipes. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };

  if (loading) return <div className="loading">Loading recipes...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Discover <strong>Delicious</strong> Recipes</h1>
          <p>Find and save your favorite recipes from around the world</p>
        </div>
      </section>

      <section className="featured-section">
        <h2>Featured Recipes</h2>
        <div className="recipes-grid">
          {randomRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={{
                id: recipe.id,
                name: recipe.title,
                description: recipe.summary,
                image_url: recipe.image,
                prep_time_minutes: Math.floor(recipe.readyInMinutes / 2),
                cook_time_minutes: Math.ceil(recipe.readyInMinutes / 2),
                difficulty: 'medium',
                cuisine_type: recipe.cuisines?.[0] || 'Various',
                calories_per_serving: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || '562',
                is_private: false,
                is_favorite: false,
                average_rating: recipe.spoonacularScore ? (recipe.spoonacularScore / 20) : 4.5,
                total_ratings: recipe.aggregateLikes || 0,
                dietary_restrictions: recipe.diets || []
              }}
            />
          ))}
        </div>
      </section>

      <section className="popular-section">
        <h2>Popular Now</h2>
        <div className="recipes-grid">
          {popularRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={{
                id: recipe.id,
                name: recipe.title,
                description: recipe.summary,
                image_url: recipe.image,
                prep_time_minutes: Math.floor(recipe.readyInMinutes / 2),
                cook_time_minutes: Math.ceil(recipe.readyInMinutes / 2),
                difficulty: 'medium',
                cuisine_type: recipe.cuisines?.[0] || 'Various',
                calories_per_serving: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || '562',
                is_private: false,
                is_favorite: false,
                average_rating: recipe.spoonacularScore ? (recipe.spoonacularScore / 20) : 4.5,
                total_ratings: recipe.aggregateLikes || 0,
                dietary_restrictions: recipe.diets || []
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
} 
