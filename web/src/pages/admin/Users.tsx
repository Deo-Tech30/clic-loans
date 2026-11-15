import { useState, useEffect } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('http://localhost:4000/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setUsers(await res.json());
    };
    fetchUsers();
  }, [token]);

  return (
    <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>Platform Users Audit</h3>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <th style={{ padding: '16px 24px', fontWeight: '600' }}>Name</th>
            <th style={{ padding: '16px 24px', fontWeight: '600' }}>Phone</th>
            <th style={{ padding: '16px 24px', fontWeight: '600' }}>Role</th>
            <th style={{ padding: '16px 24px', fontWeight: '600' }}>Market</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '16px 24px', fontWeight: '500', color: '#111827' }}>{u.name}</td>
              <td style={{ padding: '16px 24px', color: '#6b7280' }}>{u.phone}</td>
              <td style={{ padding: '16px 24px' }}>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', backgroundColor: u.role === 'agent' ? '#e0f2fe' : '#fef3c7', color: u.role === 'agent' ? '#0369a1' : '#92400e' }}>
                  {u.role.toUpperCase()}
                </span>
              </td>
              <td style={{ padding: '16px 24px', color: '#6b7280' }}>{u.market_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}