import { useState, useEffect, FormEvent } from 'react';
import { toast } from 'react-toastify';

export default function AgentTraders() {
  const [traders, setTraders] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [traderName, setTraderName] = useState('');
  const [traderPhone, setTraderPhone] = useState('');
  const [traderPassword, setTraderPassword] = useState('');
  
  const token = localStorage.getItem('token');

  const fetchTraders = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agent/traders-crm`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setTraders(await res.json());
  };

  useEffect(() => { fetchTraders(); }, []);

  const handleRegisterTrader = async (e: FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Registering trader...");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agent/traders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: traderName, phone: traderPhone, password: traderPassword })
    });
    if (res.ok) {
      toast.update(toastId, { render: "Trader registered successfully!", type: "success", isLoading: false, autoClose: 3000 });
      setTraderName(''); setTraderPhone(''); setTraderPassword(''); setShowForm(false);
      fetchTraders();
    } else {
      const err = await res.json();
      toast.update(toastId, { render: err.error, type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER & ACTION BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#111827' }}>My Traders (CRM)</h2>
          <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Manage your registered traders and view their loan history.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          style={{ padding: '12px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {showForm ? 'Cancel' : '+ Register New Trader'}
        </button>
      </div>

      {/* REGISTRATION FORM (Collapsible) */}
      {showForm && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Register a New Trader</h3>
          <form onSubmit={handleRegisterTrader} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600' }}>Full Name</label>
              <input type="text" placeholder="e.g. John Doe" value={traderName} onChange={e => setTraderName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600' }}>Phone Number</label>
              <input type="text" placeholder="e.g. 0700000000" value={traderPhone} onChange={e => setTraderPhone(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600' }}>Password</label>
              <input type="password" placeholder="Password" value={traderPassword} onChange={e => setTraderPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            </div>
            <button type="submit" style={{ padding: '10px 20px', background: '#1e3c72', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
          </form>
        </div>
      )}

      {/* CRM TABLE */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
              <th style={{ padding: '16px 24px' }}>Trader</th>
              <th style={{ padding: '16px 24px' }}>Contact</th>
              <th style={{ padding: '16px 24px' }}>Total Loans</th>
              <th style={{ padding: '16px 24px' }}>Total Borrowed</th>
              <th style={{ padding: '16px 24px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {traders.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No traders registered yet.</td></tr>
            ) : traders.map(t => (
              <tr key={t.trader_user_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: '600', color: '#111827' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Joined {new Date(t.joined_date).toLocaleDateString()}</div>
                </td>
                <td style={{ padding: '16px 24px', color: '#4b5563' }}>{t.phone}</td>
                <td style={{ padding: '16px 24px', color: '#111827', fontWeight: '500' }}>{t.total_loans_taken}</td>
                <td style={{ padding: '16px 24px', fontWeight: 'bold', color: '#111827' }}>{t.total_borrowed} UGX</td>
                <td style={{ padding: '16px 24px' }}>
                  {Number(t.active_loans) > 0 ? (
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#fef3c7', color: '#92400e' }}>ACTIVE LOAN</span>
                  ) : (
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#ecfdf5', color: '#065f46' }}>CLEAR</span>
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