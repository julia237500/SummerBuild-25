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

  const handleFavoriteToggle = (recipeId, isFavorite) => {
    // Update both recipe lists
    const updateRecipes = (recipes) =>
      recipes.map(recipe =>
        recipe.id === recipeId
          ? { ...recipe, is_favorite: isFavorite }
          : recipe
      );
    
    setRandomRecipes(updateRecipes(randomRecipes));
    setPopularRecipes(updateRecipes(popularRecipes));
  };

  useEffect(() => {
    let mounted = true;
    
    const fetchRecipes = async () => {
      if (!mounted) return;
      
      try {
        setLoading(true);
        setError(null);

        // Try to fetch random recipes first, then popular ones
        try {
          const randomData = await spoonacularApi.getRandomRecipes(6);
          if (mounted && randomData?.recipes) {            const formattedRandomRecipes = randomData.recipes.map(recipe => ({
              id: recipe.id,
              title: recipe.title,
              description: recipe.summary?.slice(0, 150) + '...',
              image_url: recipe.image,
              cooking_time: recipe.readyInMinutes,
              prep_time_minutes: Math.floor(recipe.readyInMinutes / 2),
              cook_time_minutes: Math.ceil(recipe.readyInMinutes / 2),
              difficulty: recipe.difficulty || 'medium',
              cuisine_type: recipe.cuisines?.[0] || 'Various',
              calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || '562',
              protein: recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount + 'g' || '13g',
              carbs: recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount + 'g' || '22g',
              is_private: false,
              is_favorite: false,
              average_rating: recipe.spoonacularScore ? (recipe.spoonacularScore / 20) : 4.5,
              total_ratings: recipe.aggregateLikes || 0,
              dietary_restrictions: recipe.diets || []
            }));
            setRandomRecipes(formattedRandomRecipes);
          }

          const popularData = await spoonacularApi.searchRecipes('', 'popularity', 6);
          if (mounted && popularData?.results) {            const formattedPopularRecipes = popularData.results.map(recipe => ({
              id: recipe.id,
              title: recipe.title,
              description: recipe.summary?.slice(0, 150) + '...',
              image_url: recipe.image,
              cooking_time: recipe.readyInMinutes,
              prep_time_minutes: Math.floor(recipe.readyInMinutes / 2),
              cook_time_minutes: Math.ceil(recipe.readyInMinutes / 2),
              difficulty: recipe.difficulty || 'medium',
              cuisine_type: recipe.cuisines?.[0] || 'Various',
              calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || '562',
              protein: recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount + 'g' || '13g',
              carbs: recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount + 'g' || '22g',
              is_private: false,
              is_favorite: false,
              average_rating: recipe.spoonacularScore ? (recipe.spoonacularScore / 20) : 4.5,
              total_ratings: recipe.aggregateLikes || 0,
              dietary_restrictions: recipe.diets || []
            }));
            setPopularRecipes(formattedPopularRecipes);
          }
          if (mounted) {
            setLoading(false);
          }
        } catch (apiError) {
          console.error('API Error:', apiError);
          if (mounted) {
            const fallbackRecipes = [
              {
                id: 1,
                title: 'Classic Spaghetti Carbonara',
                description: 'A classic Italian pasta dish with eggs, cheese, pancetta, and black pepper.',
                image_url: 'https://images.unsplash.com/photo-1588013273468-315fd88ea34c',
                prep_time_minutes: 15,
                cook_time_minutes: 15,
                difficulty: 'medium',
                cuisine_type: 'Italian',
                calories_per_serving: 562,
                is_private: false,
                is_favorite: false,
                average_rating: 4.5,
                total_ratings: 128,
                dietary_restrictions: []
              },
              {
                id: 2,
                title: 'Grilled Chicken Salad',
                description: 'Fresh and healthy salad with grilled chicken, mixed greens, and homemade dressing.',
                image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1',
                prep_time_minutes: 10,
                cook_time_minutes: 15,
                difficulty: 'easy',
                cuisine_type: 'American',
                calories_per_serving: 320,
                is_private: false,
                is_favorite: false,
                average_rating: 4.3,
                total_ratings: 95,
                dietary_restrictions: ['gluten-free']
              }
            ];
            setRandomRecipes(fallbackRecipes);
            setPopularRecipes(fallbackRecipes);
            setLoading(false);
          }
        }
      } catch (err) {
        if (mounted) {
          console.error('Error in Home component:', err);
          setError('Something went wrong. Using fallback recipe data.');
          setLoading(false);
        }
      }
    };

    fetchRecipes();
    
    return () => {
      mounted = false;
    };
  }, []);

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };
  if (loading) {
    return (
      <div className="home">
        <section className="hero-section">
          <div className="hero-content">
            <h1>Discover Delicious Recipes</h1>
            <p>Find and save your favorite recipes from around the world</p>
          </div>
        </section>
        
        <div className="animate-pulse">
          <section className="featured-section">
            <h2>Featured Recipes</h2>
            <div className="recipes-grid">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="recipe-card">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {error}
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Discover Delicious Recipes</h1>
          <p>Find and save your favorite recipes from around the world</p>
        </div>
      </section>

      {(randomRecipes.length > 0 || popularRecipes.length > 0) ? (
        <>
          {randomRecipes.length > 0 && (
            <section className="featured-section">
              <h2>Featured Recipes</h2>
              <div className="recipes-grid">                {randomRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    showActions={true}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            </section>
          )}

          {popularRecipes.length > 0 && (
            <section className="popular-section">
              <h2>Popular Now</h2>
              <div className="recipes-grid">                {popularRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    showActions={true}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              No recipes found
            </h2>
            <p className="text-gray-600">
              Try reloading the page or check back later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
