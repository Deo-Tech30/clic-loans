import { useState, useEffect } from 'react';

export default function TraderApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchApplications = async () => {
      const res = await fetch('http://localhost:4000/api/trader/applications', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setApplications(await res.json());
    };
    fetchApplications();
  }, []);

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>My Applications</h3>
      {applications.length === 0 ? <p>You haven't applied for any loans yet.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f8f9fa', textAlign: 'left' }}><th style={{ padding: '10px' }}>Agent</th><th style={{ padding: '10px' }}>Amount</th><th style={{ padding: '10px' }}>Status</th></tr></thead>
          <tbody>
            {applications.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{a.agent_name}</td>
                <td style={{ padding: '10px' }}>{a.amount} UGX</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold', color: 'white', background: a.status === 'pending' ? '#ffc107' : a.status === 'approved' ? '#28a745' : '#dc3545' }}>
                    {a.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}