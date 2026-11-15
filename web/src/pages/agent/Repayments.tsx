import { useState, useEffect } from 'react';

export default function AgentRepayments() {
  const [repayments, setRepayments] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchRepayments = async () => {
      const res = await fetch('http://localhost:4000/api/agent/repayments', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setRepayments(await res.json());
    };
    fetchRepayments();
  }, [token]);

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>Repayment History</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
          <th style={{ padding: '10px' }}>Trader</th>
          <th style={{ padding: '10px' }}>Amount Paid</th>
          <th style={{ padding: '10px' }}>Your Share (80%)</th>
          <th style={{ padding: '10px' }}>System Fee (20%)</th>
          <th style={{ padding: '10px' }}>Date</th>
        </tr></thead>
        <tbody>
          {repayments.length === 0 ? <tr><td colSpan={5} style={{ padding: '10px' }}>No repayments yet.</td></tr> : repayments.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{r.trader_name}</td>
              <td style={{ padding: '10px' }}>{r.amount_paid} UGX</td>
              <td style={{ padding: '10px', color: 'green', fontWeight: 'bold' }}>+{r.agent_share} UGX</td>
              <td style={{ padding: '10px', color: 'red' }}>{r.system_share} UGX</td>
              <td style={{ padding: '10px' }}>{new Date(r.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}