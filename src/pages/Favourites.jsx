import { useEffect, useState } from 'react';
import axios from 'axios';

function Favourites({ user_id }) {
  const [favourites, setFavourites] = useState([]);
  useEffect(() => {
    axios.get(`/api/favourites/${user_id}`).then(res => setFavourites(res.data));
  }, [user_id]);
  return (
    <div>
      <h2>Your Favourites</h2>
      <ul>
        {favourites.map(fav => (
          <li key={fav.recipe_id}>{fav.recipes.name}</li>
        ))}
      </ul>
    </div>
  );
}
export default Favourites;