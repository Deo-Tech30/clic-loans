import { useState, useEffect, FormEvent } from 'react';
import { toast } from 'react-toastify';

export default function TraderProfile() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Market Vendor');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trader/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setName(data.name || '');
        setPhone(data.phone || '');
        setBusinessName(data.business_name || '');
        setBusinessType(data.business_type || 'Market Vendor');
        setEmergencyName(data.emergency_contact_name || '');
        setEmergencyPhone(data.emergency_contact_phone || '');
      }
    };
    fetchProfile();
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Saving profile...");
    
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trader/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ 
        business_name: businessName, 
        business_type: businessType, 
        emergency_contact_name: emergencyName, 
        emergency_contact_phone: emergencyPhone 
      })
    });

    if (res.ok) {
      toast.update(toastId, { render: "Profile Saved!", type: "success", isLoading: false, autoClose: 3000 });
    } else {
      toast.update(toastId, { render: "Failed to save", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', maxWidth: '700px' }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#111827' }}>My Profile</h3>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '25px' }}>Complete your profile to increase your chances of loan approval.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Read-only personal info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Full Name</label>
            <input type="text" value={name} disabled style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Phone Number</label>
            <input type="text" value={phone} disabled style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }} />
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

        {/* Business Info */}
        <h4 style={{ margin: 0, color: '#111827' }}>Business Details</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Business Name</label>
            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Deus Fresh Produce" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Business Type</label>
            <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
              <option value="Market Vendor">Market Vendor</option>
              <option value="Boda Boda Rider">Boda Boda Rider</option>
              <option value="Salon & Barbershop">Salon & Barbershop</option>
              <option value="Food Vendor">Food Vendor</option>
              <option value="Farmer">Farmer</option>
              <option value="Tailor & Artisan">Tailor & Artisan</option>
            </select>
          </div>
        </div>

        {/* Emergency Contact */}
        <h4 style={{ margin: '10px 0 0 0', color: '#dc2626' }}>Emergency Contact (Required)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Contact Name</label>
            <input type="text" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} required placeholder="e.g. Wife, Brother" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Contact Phone</label>
            <input type="text" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} required placeholder="e.g. 0700000000" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>
        </div>

        <button type="submit" style={{ padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
          Save Profile
        </button>
      </form>
    </div>
  );
}