import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CollectionsList({ userId }) {
  const [collections, setCollections] = useState([]);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    axios.get(`/api/collections?user_id=${userId}`).then(res => setCollections(res.data));
  }, [userId]);

  const handleView = async (collectionId) => {
    const res = await axios.get(`/api/collections/${collectionId}/recipes`);
    setRecipes(res.data);
  };

  return (
    <div>
      <h2>Your Collections</h2>
      <ul>
        {collections.map(col => (
          <li key={col.id}>
            {col.name}
            <button onClick={() => handleView(col.id)}>View Recipes</button>
          </li>
        ))}
      </ul>
      <div>
        <h3>Recipes in Collection</h3>
        <ul>
          {recipes.map(r => <li key={r.id}>{r.name}</li>)}
        </ul>
      </div>
    </div>
  );
}