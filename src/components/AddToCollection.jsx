import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AddToCollection({ recipeId, userId }) {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    axios.get(`/api/collections?user_id=${userId}`).then(res => setCollections(res.data));
  }, [userId]);

  const handleAdd = async (collectionId) => {
    await axios.post(`/api/collections/${collectionId}/recipes`, { recipe_id: recipeId });
    alert('Recipe added to collection!');
  };

  return (
    <div>
      <h4>Add to Collection:</h4>
      <ul>
        {collections.map(col => (
          <li key={col.id}>
            {col.name}
            <button onClick={() => handleAdd(col.id)}>Add</button>
          </li>
        ))}
      </ul>
    </div>
  );
}