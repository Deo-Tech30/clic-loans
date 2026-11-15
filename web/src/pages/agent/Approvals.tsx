import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function AgentApprovals() {
  const [applications, setApplications] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  const fetchApplications = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agent/applications`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setApplications(await res.json());
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleApprove = async (appId: number) => {
    if (!window.confirm('Approve this loan application?')) return;
    
    const toastId = toast.loading("Approving loan...");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agent/approve/${appId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      toast.update(toastId, { render: "Loan Approved!", type: "success", isLoading: false, autoClose: 3000 });
      fetchApplications(); 
    } else {
      toast.update(toastId, { render: "Failed to approve", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#111827' }}>Pending Applications</h3>
      {applications.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No pending applications in your market.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 24px' }}>Trader</th>
              <th style={{ padding: '12px 24px' }}>Phone</th>
              <th style={{ padding: '12px 24px' }}>Amount</th>
              <th style={{ padding: '12px 24px' }}>Purpose</th>
              <th style={{ padding: '12px 24px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 24px', fontWeight: '500' }}>{app.trader_name}</td>
                <td style={{ padding: '12px 24px', color: '#6b7280' }}>{app.phone}</td>
                <td style={{ padding: '12px 24px' }}>{app.amount} UGX</td>
                <td style={{ padding: '12px 24px', color: '#6b7280' }}>{app.purpose}</td>
                <td style={{ padding: '12px 24px' }}>
                  <button onClick={() => handleApprove(app.id)} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Approve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}