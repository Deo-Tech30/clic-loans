import { useState, useEffect, FormEvent } from 'react';
import { toast } from 'react-toastify';

export default function AdminSettings() {
  const [fee, setFee] = useState('');
  const [discount, setDiscount] = useState('');
  const [smsId, setSmsId] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setFee(data.platform_fee_percentage);
        setDiscount(data.early_payment_discount);
        setSmsId(data.sms_sender_id);
      }
    };
    fetchSettings();
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Saving settings...");
    
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ 
        platform_fee_percentage: Number(fee), 
        early_payment_discount: Number(discount), 
        sms_sender_id: smsId 
      })
    });

    if (res.ok) {
      toast.update(toastId, { render: "Settings updated!", type: "success", isLoading: false, autoClose: 3000 });
    } else {
      toast.update(toastId, { render: "Failed to update", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', maxWidth: '700px' }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#111827' }}>System Settings</h3>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '25px' }}>Control the global financial parameters of the Clic-Loans platform.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Platform Fee (%)</label>
            <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} step="0.1" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>The 20% share taken from Agent interest.</p>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Early Payoff Discount (%)</label>
            <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} step="0.1" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>The interest discount given to Traders who pay early.</p>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>SMS Sender ID</label>
          <input type="text" value={smsId} onChange={(e) => setSmsId(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>The name that appears on Traders' phones when you send reminders.</p>
        </div>

        <button type="submit" style={{ padding: '14px', background: '#111827', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
          Save Settings
        </button>
      </form>
    </div>
  );
}