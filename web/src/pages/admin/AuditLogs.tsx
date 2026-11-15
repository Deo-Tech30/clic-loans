import { useState, useEffect } from 'react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/audit-logs`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setLogs(await res.json());
    };
    fetchLogs();
  }, [token]);

  return (
    <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>Platform Audit Logs</h3>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#6b7280' }}>A complete history of all activities on Clic-Loans.</p>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
            <th style={{ padding: '16px 24px' }}>Date</th>
            <th style={{ padding: '16px 24px' }}>User</th>
            <th style={{ padding: '16px 24px' }}>Role</th>
            <th style={{ padding: '16px 24px' }}>Action</th>
            <th style={{ padding: '16px 24px' }}>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No audit logs recorded yet.</td></tr>
          ) : logs.map(log => (
            <tr key={log.id} style={{ borderBottom: '1px solid #e5e7eb', fontSize: '14px' }}>
              <td style={{ padding: '16px 24px', color: '#6b7280' }}>{new Date(log.created_at).toLocaleString()}</td>
              <td style={{ padding: '16px 24px', fontWeight: '500', color: '#111827' }}>{log.user_name || 'System'}</td>
              <td style={{ padding: '16px 24px' }}>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: log.user_role === 'admin' ? '#fef3c7' : log.user_role === 'agent' ? '#e0f2fe' : '#ecfdf5', color: log.user_role === 'admin' ? '#92400e' : log.user_role === 'agent' ? '#0369a1' : '#065f46' }}>
                  {(log.user_role || 'system').toUpperCase()}
                </span>
              </td>
              <td style={{ padding: '16px 24px', fontWeight: '500' }}>{log.action}</td>
              <td style={{ padding: '16px 24px', color: '#6b7280' }}>{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}