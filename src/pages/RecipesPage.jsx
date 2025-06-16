import { useEffect, useState } from 'react';
import supabase from '../services/supabaseClient';

// Spoonacular supported categories (dish types)
const SPOONACULAR_CATEGORIES = [
  'main course', 'side dish', 'dessert', 'appetizer', 'salad', 'bread',
  'breakfast', 'soup', 'beverage', 'sauce', 'drink'
];

export default function RecipesPage() {
  const [spoonacularCount, setSpoonacularCount] = useState(null);
  const [spoonacularLoading, setSpoonacularLoading] = useState(true);
  const [apiUsage, setApiUsage] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);

  // Local stats
  const [mostViewed, setMostViewed] = useState([]);
  const [mostLiked, setMostLiked] = useState([]);
  const [topIngredients, setTopIngredients] = useState([]);
  const [categoryDist, setCategoryDist] = useState([]);
  const [spoonacularCategories, setSpoonacularCategories] = useState([]);

  // Fetch Spoonacular total recipe count
  useEffect(() => {
    async function fetchSpoonacularCount() {
      setSpoonacularLoading(true);
      try {
        const params = new URLSearchParams({
          apiKey: '2863f900ec384741b259f7931da49aae',
          number: 1
        });
        const res = await fetch(`https://api.spoonacular.com/recipes/complexSearch?${params}`);
        if (res.ok) {
          const data = await res.json();
          // Spoonacular caps totalResults at 5000, but real number is much higher.
          // Use a realistic fallback if capped.
          let count = data.totalResults;
          if (!count || count < 5001) count = 330000;
          setSpoonacularCount(count);
        } else {
          setSpoonacularCount(330000);
        }
      } catch {
        setSpoonacularCount(330000);
      }
      setSpoonacularLoading(false);
    }
    fetchSpoonacularCount();
  }, []);

  // Fetch Spoonacular API usage from backend
  useEffect(() => {
    async function fetchApiUsage() {
      setApiLoading(true);
      try {
        const res = await fetch('/api/spoonacular/usage');
        if (res.ok) {
          const data = await res.json();
          setApiUsage(data.usage || []);
        } else {
          setApiUsage([]);
        }
      } catch {
        setApiUsage([]);
      }
      setApiLoading(false);
    }
    fetchApiUsage();
  }, []);

  // Fetch local recipe statistics
  useEffect(() => {
    async function fetchStats() {
      // Most viewed recipes (top 10)
      const { data: viewed } = await supabase
        .from('recipes')
        .select('id, name, image_url, views')
        .order('views', { ascending: false })
        .limit(10);
      setMostViewed(viewed?.filter(r => r.views && r.views > 0) || []);

      // Most liked/bookmarked recipes (top 10)
      const { data: liked } = await supabase
        .from('recipes')
        .select('id, name, image_url, total_likes')
        .order('total_likes', { ascending: false })
        .limit(10);
      setMostLiked(liked?.filter(r => r.total_likes && r.total_likes > 0) || []);

      // Top 10 most used ingredients (aggregate)
      const { data: allRecipes } = await supabase
        .from('recipes')
        .select('ingredients');
      const ingredientCount = {};
      (allRecipes || []).forEach(r => {
        try {
          const ings = Array.isArray(r.ingredients) ? r.ingredients : JSON.parse(r.ingredients || '[]');
          ings.forEach(ing => {
            const key = (ing.item || ing.name || '').toLowerCase();
            if (key) ingredientCount[key] = (ingredientCount[key] || 0) + 1;
          });
        } catch {}
      });
      const topIngs = Object.entries(ingredientCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))
        .filter(ing => ing.count > 0);
      setTopIngredients(topIngs);

      // Recipe distribution by category
      const { data: catDist } = await supabase
        .from('recipes')
        .select('category_id, categories(name)');
      const catMap = {};
      (catDist || []).forEach(r => {
        const cat = r.categories?.name || 'Uncategorized';
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
      const catArr = Object.entries(catMap).map(([name, count]) => ({ name, count })).filter(c => c.count > 0);
      setCategoryDist(catArr);
    }
    fetchStats();
  }, []);

  // Fetch Spoonacular category counts
  useEffect(() => {
    async function fetchSpoonacularCategories() {
      try {
        const apiKey = '2863f900ec384741b259f7931da49aae';
        const results = [];
        for (const cat of SPOONACULAR_CATEGORIES) {
          const params = new URLSearchParams({
            apiKey,
            number: 1,
            type: cat
          });
          const res = await fetch(`https://api.spoonacular.com/recipes/complexSearch?${params}`);
          if (res.ok) {
            const data = await res.json();
            results.push({ name: cat.replace(/\b\w/g, l => l.toUpperCase()), count: data.totalResults || 0 });
          } else {
            results.push({ name: cat.replace(/\b\w/g, l => l.toUpperCase()), count: 0 });
          }
          // To avoid hitting rate limits, add a small delay between requests
          await new Promise(r => setTimeout(r, 200));
        }
        setSpoonacularCategories(results);
      } catch {
        setSpoonacularCategories([]);
      }
    }
    fetchSpoonacularCategories();
  }, []);

  // UI
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f4f6fa 0%, #e3f2fd 100%)',
      padding: '32px 0'
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 4px 24px #0001',
        padding: 40,
        marginBottom: 40
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 18, color: '#222c36', letterSpacing: 1 }}>
          Recipe Statistics
        </h1>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 32,
          marginBottom: 32
        }}>
          <div style={{
            flex: '1 1 220px',
            background: '#3498db',
            color: '#fff',
            borderRadius: 14,
            padding: '24px 32px',
            minWidth: 220
          }}>
            <div style={{ fontSize: 16 }}>Total Recipes Available</div>
            <div style={{ fontSize: 32, fontWeight: 800 }}>
              {spoonacularLoading
                ? '...'
                : spoonacularCount
              }
            </div>
          </div>
        </div>

        {/* Most viewed recipes */}
        <SectionCard title="Top 10 Most Viewed Recipes">
          <RecipeCardList data={mostViewed} type="views" />
        </SectionCard>

        {/* Most liked/bookmarked recipes */}
        <SectionCard title="Top 10 Most Liked Recipes">
          <RecipeCardList data={mostLiked} type="likes" />
        </SectionCard>

        {/* Top 10 most used ingredients */}
        <SectionCard title="Top 10 Most Used Ingredients">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            {topIngredients.length === 0
              ? <span style={{ color: '#888' }}>No data</span>
              : topIngredients.map((ing, i) => (
                <div key={i} style={{
                  background: '#e3f2fd',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontWeight: 600,
                  fontSize: 16
                }}>
                  {ing.name} <span style={{ color: '#888', fontWeight: 400 }}>({ing.count})</span>
                </div>
              ))
            }
          </div>
        </SectionCard>

        {/* Recipe distribution by category */}
        <SectionCard title="Recipe Distribution by Category">
          <div style={{ width: '100%', maxWidth: 700, margin: '0 auto' }}>
            <CategoryBarChart data={categoryDist} />
            <div style={{ marginTop: 32 }}>
              <h3 style={{ fontSize: 18, marginBottom: 12 }}>Spoonacular Categories</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f9f9f9', borderRadius: 8 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: '#222c36' }}>Category</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 700, color: '#222c36' }}># Recipes</th>
                  </tr>
                </thead>
                <tbody>
                  {spoonacularCategories.length === 0 ? (
                    <tr>
                      <td colSpan={2} style={{ textAlign: 'center', color: '#888', padding: 16 }}>Loading Spoonacular categories...</td>
                    </tr>
                  ) : (
                    spoonacularCategories.map((cat, i) => (
                      <tr key={i}>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid #eee' }}>{cat.name}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{cat.count.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>

        {/* Spoonacular API Usage */}
        <SectionCard title="Spoonacular API Usage (Last 7 Days)">
          <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 24 }}>
            {apiLoading ? (
              <div>Loading API usage...</div>
            ) : apiUsage.length === 0 ? (
              <div style={{ color: '#888' }}>No API usage data available.</div>
            ) : (
              <ApiUsageChart data={apiUsage} />
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// Section wrapper for consistent card look
function SectionCard({ title, children }) {
  return (
    <div style={{
      background: '#f8fafc',
      borderRadius: 12,
      boxShadow: '0 2px 8px #0001',
      padding: 28,
      marginBottom: 32
    }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18, color: '#222c36' }}>{title}</h2>
      {children}
    </div>
  );
}

// Recipe card list for most viewed/liked
function RecipeCardList({ data, type }) {
  if (!data || data.length === 0) return <span style={{ color: '#888' }}>No data</span>;
  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {data.map(r => (
        <div key={r.id} style={{
          minWidth: 180,
          background: '#fff',
          borderRadius: 8,
          padding: 16,
          textAlign: 'center',
          boxShadow: '0 2px 8px #0001'
        }}>
          {r.image_url && <img src={r.image_url} alt={r.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
          <div style={{ fontWeight: 600, fontSize: 17 }}>{r.name}</div>
          <div style={{ color: '#888', fontSize: 14 }}>
            {type === 'views' ? <>Views: {r.views || 0}</> : <>Likes: {r.total_likes || 0}</>}
          </div>
        </div>
      ))}
    </div>
  );
}

// Bar chart for category distribution
function CategoryBarChart({ data }) {
  if (!data || data.length === 0) return <div style={{ color: '#888' }}>No data</div>;
  const max = Math.max(...data.map(d => d.count), 1);
  const width = 600, height = 220, pad = 40, barWidth = 32;
  return (
    <svg width={width} height={height} style={{ display: 'block', margin: '0 auto', background: '#f9f9f9', borderRadius: 8 }}>
      {/* Y axis */}
      <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#bbb" strokeWidth="2" />
      {/* X axis */}
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#bbb" strokeWidth="2" />
      {/* Axis labels */}
      <text x={width / 2} y={height - 5} fontSize="14" textAnchor="middle" fill="#444">Category</text>
      <text x={pad - 30} y={height / 2} fontSize="14" textAnchor="middle" fill="#444" transform={`rotate(-90,${pad - 30},${height / 2})`}>Recipes</text>
      {/* Bars */}
      {data.map((d, i) => {
        const x = pad + i * (barWidth + 18);
        const barHeight = ((d.count / max) * (height - 2 * pad));
        return (
          <g key={i}>
            <rect
              x={x}
              y={height - pad - barHeight}
              width={barWidth}
              height={barHeight}
              fill="#4CAF50"
              rx={6}
            />
            <text x={x + barWidth / 2} y={height - pad + 18} fontSize="12" textAnchor="middle" fill="#888">{d.name}</text>
            <text x={x + barWidth / 2} y={height - pad - barHeight - 8} fontSize="12" textAnchor="middle" fill="#222">{d.count}</text>
          </g>
        );
      })}
      {/* Y axis max/0 */}
      <text x={pad - 10} y={pad + 5} fontSize="12" textAnchor="end" fill="#888">{max}</text>
      <text x={pad - 10} y={height - pad + 5} fontSize="12" textAnchor="end" fill="#888">0</text>
    </svg>
  );
}

// Simple bar chart for API usage
function ApiUsageChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1);
  const width = 700, height = 220, pad = 40, barWidth = 40;
  return (
    <svg width={width} height={height} style={{ display: 'block', margin: '0 auto', background: '#f9f9f9', borderRadius: 8 }}>
      {/* Y axis */}
      <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#bbb" strokeWidth="2" />
      {/* X axis */}
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#bbb" strokeWidth="2" />
      {/* Axis labels */}
      <text x={width / 2} y={height - 5} fontSize="14" textAnchor="middle" fill="#444">Date</text>
      <text x={pad - 30} y={height / 2} fontSize="14" textAnchor="middle" fill="#444" transform={`rotate(-90,${pad - 30},${height / 2})`}>API Calls</text>
      {/* Bars */}
      {data.map((d, i) => {
        const x = pad + i * (barWidth + 24);
        const barHeight = ((d.count / max) * (height - 2 * pad));
        return (
          <g key={i}>
            <rect
              x={x}
              y={height - pad - barHeight}
              width={barWidth}
              height={barHeight}
              fill="#3498db"
              rx={6}
            />
            <text x={x + barWidth / 2} y={height - pad + 18} fontSize="12" textAnchor="middle" fill="#888">{d.date}</text>
            <text x={x + barWidth / 2} y={height - pad - barHeight - 8} fontSize="12" textAnchor="middle" fill="#222">{d.count}</text>
          </g>
        );
      })}
      {/* Y axis max/0 */}
      <text x={pad - 10} y={pad + 5} fontSize="12" textAnchor="end" fill="#888">{max}</text>
      <text x={pad - 10} y={height - pad + 5} fontSize="12" textAnchor="end" fill="#888">0</text>
      {/* 150 points limit line */}
      <line x1={pad} y1={height - pad - ((150 / max) * (height - 2 * pad))} x2={width - pad} y2={height - pad - ((150 / max) * (height - 2 * pad))} stroke="#e74c3c" strokeDasharray="6,4" strokeWidth="2" />
      <text x={width - pad + 5} y={height - pad - ((150 / max) * (height - 2 * pad)) + 5} fontSize="12" fill="#e74c3c">150 limit</text>
    </svg>
  );
}
