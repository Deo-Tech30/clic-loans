import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function AgentReminders() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [message, setMessage] = useState('Hello! This is a friendly reminder that your Clic-Loans repayment is due soon. Please ensure you make your payment on time to avoid penalties. Thank you!');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchReminders = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agent/reminders`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setReminders(await res.json());
    };
    fetchReminders();
  }, [token]);

  const handleSendBroadcast = () => {
    const toastId = toast.loading(`Sending SMS to ${reminders.length} traders...`);
    
    // Mock API call (We will replace this with real SMS later)
    setTimeout(() => {
      toast.update(toastId, { 
        render: `Successfully sent ${reminders.length} reminders!`, 
        type: "success", 
        isLoading: false, 
        autoClose: 3000 
      });
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* BROADCAST MESSAGE BOX */}
      <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', color: 'white' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>📢 Broadcast Reminder</h3>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>Send a reminder to all {reminders.length} traders with active loans.</p>
        
        <textarea 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: '15px', borderRadius: '8px', border: 'none', fontSize: '14px', resize: 'none', marginBottom: '15px' }}
        />
        
        <button 
          onClick={handleSendBroadcast}
          disabled={reminders.length === 0}
          style={{ padding: '12px 24px', background: reminders.length === 0 ? '#4b5563' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: reminders.length === 0 ? 'not-allowed' : 'pointer' }}
        >
          Send SMS to All ({reminders.length})
        </button>
      </div>

      {/* LIST OF TRADERS TO REMIND */}
      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>Traders with Active Loans</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 24px' }}>Trader</th>
              <th style={{ padding: '12px 24px' }}>Phone</th>
              <th style={{ padding: '12px 24px' }}>Balance Due</th>
              <th style={{ padding: '12px 24px' }}>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {reminders.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No active loans to remind.</td></tr>
            ) : reminders.map((r, i) => {
              const balance = r.total_repayment - r.paid_amount;
              return (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 24px', fontWeight: '500', color: '#111827' }}>{r.trader_name}</td>
                  <td style={{ padding: '12px 24px', color: '#6b7280' }}>{r.trader_phone}</td>
                  <td style={{ padding: '12px 24px', fontWeight: 'bold', color: '#ef4444' }}>{balance} UGX</td>
                  <td style={{ padding: '12px 24px', color: '#6b7280' }}>{new Date(r.due_date).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}