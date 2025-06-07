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
          <h1>Discover Delicious Recipes</h1>
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
                title: recipe.title,
                image_url: recipe.image,
                cooking_time: recipe.readyInMinutes,
                calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || '562',
                protein: recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount + 'g' || '13g',
                carbs: recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount + 'g' || '22g'
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
                title: recipe.title,
                image_url: recipe.image,
                cooking_time: recipe.readyInMinutes,
                calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || '562',
                protein: recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount + 'g' || '13g',
                carbs: recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount + 'g' || '22g'
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
} 
