import { useEffect, useState } from 'react';

export default function RevenuePage() {
  const [revenueStats, setRevenueStats] = useState({ total: 0, daily: [], plans: {} });
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subLoading, setSubLoading] = useState(true);
  const [filter, setFilter] = useState({ field: 'date', value: '' });
  const [graphRange, setGraphRange] = useState(7);

  useEffect(() => {
    async function fetchRevenue() {
      setLoading(true);
      try {
        const res = await fetch('/api/revenue/summary');
        if (res.ok) {
          const stats = await res.json();
          setRevenueStats(stats);
        }
      } catch {}
      setLoading(false);
    }
    fetchRevenue();
  }, []);

  useEffect(() => {
    async function fetchSubscriptions() {
      setSubLoading(true);
      try {
        // Replace with your backend endpoint for subscription events
        // This endpoint must return an array of subscription purchases, e.g.:
        // [{ date: '2024-06-01', name: 'John Doe', plan: 'Premium', amount: 9.99 }, ...]
        const res = await fetch('/api/revenue/subscriptions');
        if (res.ok) {
          const data = await res.json();
          setSubscriptions(data);
        } else {
          setSubscriptions([]);
        }
      } catch {
        setSubscriptions([]);
      }
      setSubLoading(false);
    }
    fetchSubscriptions();
  }, []);

  // Filtering logic
  const filteredSubs = subscriptions.filter(sub => {
    if (!filter.value) return true;
    const val = filter.value.toLowerCase();
    if (filter.field === 'date') {
      return sub.date.toLowerCase().includes(val);
    }
    if (filter.field === 'name') {
      return sub.name.toLowerCase().includes(val);
    }
    if (filter.field === 'plan') {
      return sub.plan.toLowerCase().includes(val);
    }
    if (filter.field === 'amount') {
      return String(sub.amount).toLowerCase().includes(val);
    }
    return true;
  });

  // Filter daily revenue data for graph
  const getGraphData = () => {
    if (!revenueStats.daily || !revenueStats.daily.length) return [];
    if (graphRange === 'all') return revenueStats.daily;
    return revenueStats.daily.slice(-graphRange);
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Revenue</h1>
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 32, marginBottom: 32 }}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div style={{ fontSize: 22, marginBottom: 16 }}>Total Revenue: <b>${revenueStats.total}</b></div>
            <div style={{ fontSize: 18, marginBottom: 12 }}>Most Popular Plan: <b>{revenueStats.plans?.mostPopular || 'N/A'}</b></div>
            <h3 style={{ fontSize: 18, marginTop: 24 }}>Daily Revenue Growth</h3>
            <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ fontWeight: 500 }}>Show:</label>
              <select
                value={graphRange}
                onChange={e => setGraphRange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
              >
                <option value={7}>Past 7 days</option>
                <option value={30}>Past 30 days</option>
                <option value="all">All time</option>
              </select>
            </div>
            <RevenueLineChart data={getGraphData()} />
            <table style={{ width: '100%', background: '#f9f9f9', borderRadius: 8, marginTop: 8 }}>
              <thead>
                <tr>
                  <th style={{ padding: 8 }}>Date</th>
                  <th style={{ padding: 8 }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {revenueStats.daily?.length
                  ? getGraphData().map(row => (
                      <tr key={row.date}>
                        <td style={{ padding: 8 }}>{row.date}</td>
                        <td style={{ padding: 8 }}>${row.amount}</td>
                      </tr>
                    ))
                  : <tr><td colSpan={2} style={{ textAlign: 'center', color: '#888', padding: 16 }}>No data</td></tr>
                }
              </tbody>
            </table>
          </>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 32 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18 }}>Subscription Purchases</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 500 }}>Filter by:</label>
          <select
            value={filter.field}
            onChange={e => setFilter(f => ({ ...f, field: e.target.value }))}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="plan">Subscription Plan</option>
            <option value="amount">Money Earned</option>
          </select>
          <input
            type={filter.field === 'amount' ? 'number' : 'text'}
            placeholder={`Search ${filter.field}`}
            value={filter.value}
            onChange={e => setFilter(f => ({ ...f, value: e.target.value }))}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 180 }}
          />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', background: '#f9f9f9', borderRadius: 8 }}>
            <thead>
              <tr style={{ background: '#e3f2fd' }}>
                <th style={{ padding: 10, textAlign: 'left' }}>Date</th>
                <th style={{ padding: 10, textAlign: 'left' }}>Name</th>
                <th style={{ padding: 10, textAlign: 'left' }}>Subscription Plan</th>
                <th style={{ padding: 10, textAlign: 'right' }}>Money Earned</th>
              </tr>
            </thead>
            <tbody>
              {subLoading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#888', padding: 16 }}>Loading...</td>
                </tr>
              ) : filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#888', padding: 16 }}>No subscription purchases found</td>
                </tr>
              ) : (
                filteredSubs.map((sub, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 10 }}>{sub.date}</td>
                    <td style={{ padding: 10 }}>{sub.name}</td>
                    <td style={{ padding: 10 }}>{sub.plan}</td>
                    <td style={{ padding: 10, textAlign: 'right' }}>${Number(sub.amount).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Revenue line chart component
function RevenueLineChart({ data }) {
  if (!data || data.length === 0) return <div style={{ color: '#888', marginBottom: 24 }}>No revenue data</div>;
  const width = 700, height = 220, pad = 40;
  const max = Math.max(...data.map(d => d.amount), 1);
  const min = Math.min(...data.map(d => d.amount), 0);
  const points = data.map((d, i) => [
    pad + (i * (width - 2 * pad)) / (data.length - 1),
    height - pad - ((d.amount - min) / (max - min || 1)) * (height - 2 * pad)
  ]);
  return (
    <div style={{ width: '100%', overflowX: 'auto', marginBottom: 24 }}>
      <svg width={width} height={height} style={{ display: 'block', margin: '0 auto', background: '#f9f9f9', borderRadius: 8 }}>
        {/* Axes */}
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#bbb" strokeWidth="2" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#bbb" strokeWidth="2" />
        {/* Axis labels */}
        <text x={width / 2} y={height - 5} fontSize="14" textAnchor="middle" fill="#444">Date</text>
        <text x={pad - 30} y={height / 2} fontSize="14" textAnchor="middle" fill="#444" transform={`rotate(-90,${pad - 30},${height / 2})`}>Revenue ($)</text>
        {/* Data line */}
        <polyline
          fill="none"
          stroke="#3498db"
          strokeWidth="3"
          points={points.map(p => p.join(',')).join(' ')}
        />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={4} fill="#3498db" />
        ))}
        {/* X axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={points[i][0]}
            y={height - pad + 18}
            fontSize="12"
            textAnchor="middle"
            fill="#888"
            style={{ pointerEvents: 'none' }}
          >
            {d.date}
          </text>
        ))}
        {/* Y axis labels (max/min) */}
        <text x={pad - 10} y={pad + 5} fontSize="12" textAnchor="end" fill="#888">{max}</text>
        <text x={pad - 10} y={height - pad + 5} fontSize="12" textAnchor="end" fill="#888">{min}</text>
      </svg>
    </div>
  );
}
