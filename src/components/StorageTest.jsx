import { useState, useEffect } from 'react';
import { recipeService } from '../services/recipeService';

export default function StorageTest() {
  const [files, setFiles] = useState([]);
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testStorage() {
      try {
        const { files, urls } = await recipeService.testStorageAccess();
        setFiles(files);
        setUrls(urls);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    testStorage();
  }, []);

  if (loading) return <div>Testing storage access...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Storage Test Results</h2>
      <h3>Files in recipe-images bucket:</h3>
      <ul>
        {files.map((file, index) => (
          <li key={file.name}>
            {file.name} ({file.metadata?.size} bytes)
            <br />
            URL: {urls[index]}
            <br />
            <img 
              src={urls[index]} 
              alt={file.name} 
              style={{ maxWidth: '200px', marginTop: '10px' }}
              onError={(e) => {
                e.target.style.display = 'none';
                console.error(`Failed to load image: ${urls[index]}`);
              }}
            />
          </li>
        ))}
      </ul>
      {files.length === 0 && <p>No files found in the storage bucket.</p>}
    </div>
  );
} 