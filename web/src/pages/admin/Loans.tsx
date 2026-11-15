import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function AdminLoans() {
  const [loans, setLoans] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  const fetchLoans = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/loans`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setLoans(await res.json());
  };

  useEffect(() => { fetchLoans(); }, [token]);

  const handleOverride = async (loanId: number, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to mark this loan as ${newStatus}?`)) return;
    
    const toastId = toast.loading("Updating loan status...");
    
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/loans/${loanId}/override`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    });

    if (res.ok) {
      toast.update(toastId, { render: "Loan status updated!", type: "success", isLoading: false, autoClose: 3000 });
      fetchLoans();
    } else {
      toast.update(toastId, { render: "Failed to update loan", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>All Platform Loans</h3>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#6b7280' }}>Monitor and override loan statuses.</p>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
            <th style={{ padding: '16px 24px' }}>Loan ID</th>
            <th style={{ padding: '16px 24px' }}>Trader</th>
            <th style={{ padding: '16px 24px' }}>Agent</th>
            <th style={{ padding: '16px 24px' }}>Total Due</th>
            <th style={{ padding: '16px 24px' }}>Status</th>
            <th style={{ padding: '16px 24px' }}>Admin Actions</th>
          </tr>
        </thead>
        <tbody>
          {loans.length === 0 ? (
            <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No loans found.</td></tr>
          ) : loans.map(l => (
            <tr key={l.id} style={{ borderBottom: '1px solid #e5e7eb', fontSize: '14px' }}>
              <td style={{ padding: '16px 24px', color: '#6b7280' }}>#L-{l.id.toString().padStart(5, '0')}</td>
              <td style={{ padding: '16px 24px', fontWeight: '500' }}>{l.trader_name}</td>
              <td style={{ padding: '16px 24px', color: '#6b7280' }}>{l.agent_name}</td>
              <td style={{ padding: '16px 24px', fontWeight: '600' }}>{l.total_repayment} UGX</td>
              <td style={{ padding: '16px 24px' }}>
                <span style={{ 
                  padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', 
                  backgroundColor: l.status === 'active' ? '#fef3c7' : l.status === 'fully_paid' ? '#ecfdf5' : '#fee2e2', 
                  color: l.status === 'active' ? '#92400e' : l.status === 'fully_paid' ? '#065f46' : '#991b1b' 
                }}>
                  {l.status.toUpperCase()}
                </span>
              </td>
              <td style={{ padding: '16px 24px', display: 'flex', gap: '5px' }}>
                {l.status === 'active' && (
                  <>
                    <button onClick={() => handleOverride(l.id, 'fully_paid')} style={{ padding: '6px 10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Mark Paid</button>
                    <button onClick={() => handleOverride(l.id, 'defaulted')} style={{ padding: '6px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Default</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}