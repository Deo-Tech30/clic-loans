import { useState, useEffect, FormEvent } from 'react';
import { toast } from 'react-toastify';

export default function AgentProfile() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [location, setLocation] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agent/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setName(data.name || '');
        setPhone(data.phone || '');
        setBusinessName(data.business_name || '');
        setMomoNumber(data.momo_number || '');
        setLocation(data.business_location || '');
      }
    };
    fetchProfile();
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Saving profile...");
    
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agent/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ business_name: businessName, momo_number: momoNumber, business_location: location })
    });

    if (res.ok) {
      toast.update(toastId, { render: "Profile Saved!", type: "success", isLoading: false, autoClose: 3000 });
    } else {
      toast.update(toastId, { render: "Failed to save", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', maxWidth: '700px' }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#111827' }}>My Agent Profile</h3>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '25px' }}>Update your business details so Traders and Admin can identify you.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Read-only personal info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Full Name</label>
            <input type="text" value={name} disabled style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Login Phone</label>
            <input type="text" value={phone} disabled style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }} />
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

        {/* Editable Business Info */}
        <h4 style={{ margin: 0, color: '#111827' }}>Business Details</h4>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Business / Shop Name</label>
          <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Deus Mobile Money" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Mobile Money Number (Payout)</label>
            <input type="text" value={momoNumber} onChange={(e) => setMomoNumber(e.target.value)} placeholder="e.g. 0772222222" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Physical Business Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Shop A12, Wandegeya" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
        </div>

        <button type="submit" style={{ padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
          Save Profile
        </button>
      </form>
    </div>
  );
}