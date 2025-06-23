import { useState } from 'react';
import axios from 'axios';

export default function CreateCollection({ onCreated }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    try {
      const res = await axios.post('/api/collections', {
        user_id: user_id,
        name,
        description: desc
      });
      onCreated(res.data);
      setName('');
      setDesc('');
    } catch (err) {
      setError('Failed to create collection');
    }
  };

  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Collection name" />
      <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" />
      <button onClick={handleCreate}>Create Collection</button>
      {error && <div>{error}</div>}
    </div>
  );
}