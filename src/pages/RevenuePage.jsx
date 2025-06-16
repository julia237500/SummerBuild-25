import { useEffect, useState } from 'react';

export default function RevenuePage() {
  const [revenueStats, setRevenueStats] = useState({ total: 0, daily: [], plans: {} });
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Revenue</h1>
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 32 }}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div style={{ fontSize: 22, marginBottom: 16 }}>Total Revenue: <b>${revenueStats.total}</b></div>
            <div style={{ fontSize: 18, marginBottom: 12 }}>Most Popular Plan: <b>{revenueStats.plans?.mostPopular || 'N/A'}</b></div>
            <h3 style={{ fontSize: 18, marginTop: 24 }}>Daily Revenue Growth</h3>
            <table style={{ width: '100%', background: '#f9f9f9', borderRadius: 8, marginTop: 8 }}>
              <thead>
                <tr>
                  <th style={{ padding: 8 }}>Date</th>
                  <th style={{ padding: 8 }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {revenueStats.daily?.length
                  ? revenueStats.daily.map(row => (
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
    </div>
  );
}
