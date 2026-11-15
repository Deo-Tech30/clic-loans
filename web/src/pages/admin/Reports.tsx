import { useState, useEffect } from 'react';

export default function AdminReports() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/admin/reports', { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        
        if (res.ok) {
          setData(await res.json());
        } else {
          setError('Failed to load reports from the server.');
        }
      } catch (err) {
        setError('Cannot connect to the backend server.');
      }
    };
    fetchReports();
  }, [token]);

  if (error) return <p style={{ color: '#ef4444', fontWeight: 'bold', padding: '20px' }}>{error}</p>;
  if (!data) return <p style={{ padding: '20px' }}>Loading reports...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* INCOME FLOW */}
      <h2 style={{ fontSize: '18px', color: '#111827', margin: 0 }}>Income Flow</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', borderLeft: '4px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h4 style={{ margin: 0, color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Total Cash Collected</h4>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '24px', color: '#111827' }}>{data.repayments.totalCollected} UGX</h2>
        </div>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h4 style={{ margin: 0, color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Total Paid to Agents (80%)</h4>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '24px', color: '#111827' }}>{data.repayments.agentPayout} UGX</h2>
        </div>
        <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', borderLeft: '4px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h4 style={{ margin: 0, color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>Net Platform Revenue (20%)</h4>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '24px', color: '#10b981' }}>{data.repayments.systemRevenue} UGX</h2>
        </div>
      </div>

      {/* LOAN BOOK */}
      <h2 style={{ fontSize: '18px', color: '#111827', margin: '10px 0 0 0' }}>Loan Book & Health</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h4 style={{ margin: 0, color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Total Principal Lent Out</h4>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '24px', color: '#111827' }}>{data.activeLoans.principal} UGX</h2>
        </div>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h4 style={{ margin: 0, color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Expected Interest to be Collected</h4>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '24px', color: '#111827' }}>{data.activeLoans.expectedInterest} UGX</h2>
        </div>
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h4 style={{ margin: 0, color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Platform Size</h4>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '18px', color: '#3b82f6' }}>{data.platform.totalUsers} Users | {data.platform.totalMarkets} Markets</h2>
        </div>
      </div>

      {/* RECENT TRANSACTIONS LEDGER */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', marginTop: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>Recent Transactions</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 24px' }}>Trader</th>
              <th style={{ padding: '12px 24px' }}>Agent</th>
              <th style={{ padding: '12px 24px' }}>Paid</th>
              <th style={{ padding: '12px 24px' }}>System Rev</th>
              <th style={{ padding: '12px 24px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.recentTransactions.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No transactions yet.</td></tr>
            ) : data.recentTransactions.map((t: any, i: number) => (
              <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 24px', fontWeight: '500', color: '#111827' }}>{t.trader_name}</td>
                <td style={{ padding: '12px 24px', color: '#6b7280' }}>{t.agent_name}</td>
                <td style={{ padding: '12px 24px', color: '#111827' }}>{t.amount_paid} UGX</td>
                <td style={{ padding: '12px 24px', color: '#10b981', fontWeight: 'bold' }}>+{t.system_share} UGX</td>
                <td style={{ padding: '12px 24px', color: '#6b7280' }}>{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}