import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function AgentRestructure() {
  const [loans, setLoans] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  const fetchLoans = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agent/active-loans-list`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setLoans(await res.json());
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleExtend = async (loanId: number, extraDays: number) => {
    if (!window.confirm(`Extend this loan by ${extraDays} days?`)) return;
    const toastId = toast.loading("Extending loan...");
    
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agent/extend-loan/${loanId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ extra_days: extraDays })
    });

    if (res.ok) {
      toast.update(toastId, { render: "Loan extended successfully!", type: "success", isLoading: false, autoClose: 3000 });
      fetchLoans();
    } else {
      toast.update(toastId, { render: "Failed to extend", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>Loan Restructuring</h3>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#6b7280' }}>Extend the due date for Traders who need more time.</p>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
            <th style={{ padding: '16px 24px' }}>Trader</th>
            <th style={{ padding: '16px 24px' }}>Current Due Date</th>
            <th style={{ padding: '16px 24px' }}>Total Due</th>
            <th style={{ padding: '16px 24px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {loans.length === 0 ? (
            <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No active loans found.</td></tr>
          ) : loans.map(l => (
            <tr key={l.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '16px 24px', fontWeight: '500', color: '#111827' }}>{l.trader_name}</td>
              <td style={{ padding: '16px 24px', color: '#ef4444', fontWeight: '500' }}>{new Date(l.due_date).toLocaleDateString()}</td>
              <td style={{ padding: '16px 24px', color: '#111827' }}>{l.total_repayment} UGX</td>
              <td style={{ padding: '16px 24px', display: 'flex', gap: '8px' }}>
                <button onClick={() => handleExtend(l.id, 7)} style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>+7 Days</button>
                <button onClick={() => handleExtend(l.id, 14)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>+14 Days</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}