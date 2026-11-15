import { useState, useEffect } from 'react';

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch('http://localhost:4000/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setStats(await res.json());
    };
    fetchStats();
  }, [token]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', borderLeft: '4px solid #3b82f6' }}>
            <h4 style={{ margin: 0, color: '#6b7280', fontSize: '14px', textTransform: 'uppercase' }}>Total Traders</h4>
            <h2 style={{ margin: '12px 0 0 0', fontSize: '32px', color: '#111827' }}>{stats.totalTraders}</h2>
          </div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', borderLeft: '4px solid #10b981' }}>
            <h4 style={{ margin: 0, color: '#6b7280', fontSize: '14px', textTransform: 'uppercase' }}>Total Agents</h4>
            <h2 style={{ margin: '12px 0 0 0', fontSize: '32px', color: '#111827' }}>{stats.totalAgents}</h2>
          </div>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', borderLeft: '4px solid #f59e0b' }}>
            <h4 style={{ margin: 0, color: '#6b7280', fontSize: '14px', textTransform: 'uppercase' }}>Active Loans</h4>
            <h2 style={{ margin: '12px 0 0 0', fontSize: '32px', color: '#111827' }}>{stats.activeLoans}</h2>
          </div>
          <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <h4 style={{ margin: 0, color: '#9ca3af', fontSize: '14px', textTransform: 'uppercase' }}>Platform Revenue</h4>
            <h2 style={{ margin: '12px 0 0 0', fontSize: '32px', color: '#10b981' }}>{stats.totalRevenue} <span style={{ fontSize: '16px' }}>UGX</span></h2>
          </div>
        </div>
      ) : <p style={{ color: '#6b7280' }}>Loading stats...</p>}
      
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#111827' }}>Welcome to the Admin Portal</h3>
        <p style={{ color: '#6b7280', margin: 0 }}>Use the sidebar to manage Markets, Agents, and view the Platform Revenue.</p>
      </div>
    </div>
  );
}