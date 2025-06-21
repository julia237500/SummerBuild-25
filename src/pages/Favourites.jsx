import { useEffect, useState } from 'react';
import axios from 'axios';

function Favourites({ user_id }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchFavoriteRecipes(userId).then(setFavorites);
  }, [userId]);

  return (
    <div>
      <h2>Your Favorite Recipes</h2>
      {favorites.length === 0 ? (
        <p>You have no favorite recipes yet.</p>
      ) : (
        favorites.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <h3>{recipe.title}</h3>
            <img src={recipe.image_url} alt={recipe.title} />
            {/* add other recipe details here */}
          </div>
        ))
      )}
    </div>
  );
}
export default Favourites;