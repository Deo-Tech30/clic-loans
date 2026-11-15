import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function AdminLoanManagement() {
  const [apps, setApps] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const token = localStorage.getItem('token');

  const fetchApps = async () => {
    const res = await fetch('http://localhost:4000/api/admin/all-applications', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setApps(await res.json());
  };

  useEffect(() => { fetchApps(); }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    const toastId = toast.loading("Updating status...");
    const res = await fetch(`http://localhost:4000/api/admin/applications/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      toast.update(toastId, { render: `Application ${newStatus}`, type: "success", isLoading: false, autoClose: 3000 });
      fetchApps();
    } else {
      toast.update(toastId, { render: "Failed to update", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  // Filter logic
  const filteredApps = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  // Status Cards
  const counts = {
    all: apps.length,
    pending: apps.filter(a => a.status === 'pending').length,
    approved: apps.filter(a => a.status === 'approved').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* STATUS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
        <div onClick={() => setFilter('all')} style={{ background: 'white', padding: '20px', borderRadius: '12px', borderTop: '4px solid #3b82f6', cursor: 'pointer' }}>
          <h4 style={{ margin: 0, color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>All Applications</h4>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '24px' }}>{counts.all}</h2>
        </div>
        <div onClick={() => setFilter('pending')} style={{ background: 'white', padding: '20px', borderRadius: '12px', borderTop: '4px solid #f59e0b', cursor: 'pointer' }}>
          <h4 style={{ margin: 0, color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Pending</h4>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '24px', color: '#f59e0b' }}>{counts.pending}</h2>
        </div>
        <div onClick={() => setFilter('approved')} style={{ background: 'white', padding: '20px', borderRadius: '12px', borderTop: '4px solid #10b981', cursor: 'pointer' }}>
          <h4 style={{ margin: 0, color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Approved</h4>
          <h2 style={{ margin: '10px 0 0 0', fontSize: '24px', color: '#10b981' }}>{counts.approved}</h2>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 16px' }}>Trader</th>
              <th style={{ padding: '12px 16px' }}>Agent</th>
              <th style={{ padding: '12px 16px' }}>Purpose</th>
              <th style={{ padding: '12px 16px' }}>Amount</th>
              <th style={{ padding: '12px 16px' }}>Total Due</th>
              <th style={{ padding: '12px 16px' }}>Paid</th>
              <th style={{ padding: '12px 16px' }}>Balance</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.map(app => (
              <tr key={app.app_id} style={{ borderBottom: '1px solid #e5e7eb', fontSize: '14px' }}>
                <td style={{ padding: '12px 16px', fontWeight: '500' }}>{app.trader_name}</td>
                <td style={{ padding: '12px 16px', color: '#6b7280' }}>{app.agent_name}</td>
                <td style={{ padding: '12px 16px', color: '#6b7280' }}>{app.purpose || 'N/A'}</td>
                <td style={{ padding: '12px 16px' }}>{app.amount} UGX</td>
                <td style={{ padding: '12px 16px', fontWeight: '600' }}>{app.total_repayment} UGX</td>
                <td style={{ padding: '12px 16px', color: '#10b981' }}>{app.total_paid} UGX</td>
                <td style={{ padding: '12px 16px', color: '#ef4444', fontWeight: '600' }}>{app.total_repayment - app.total_paid} UGX</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: app.status === 'pending' ? '#fef3c7' : app.status === 'approved' ? '#d1fae5' : '#fee2e2', color: app.status === 'pending' ? '#92400e' : app.status === 'approved' ? '#065f46' : '#991b1b' }}>
                    {app.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: '5px' }}>
                  {app.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatusChange(app.app_id, 'approved')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Approve</button>
                      <button onClick={() => handleStatusChange(app.app_id, 'rejected')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}