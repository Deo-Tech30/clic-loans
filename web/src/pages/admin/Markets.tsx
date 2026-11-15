import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function TraderMarketplace() {
  const [offers, setOffers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [purpose, setPurpose] = useState('Stock Inventory');
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    const resO = await fetch('http://localhost:4000/api/trader/offers', { headers: { 'Authorization': `Bearer ${token}` } });
    if (resO.ok) setOffers(await resO.json());

    const resA = await fetch('http://localhost:4000/api/trader/applications', { headers: { 'Authorization': `Bearer ${token}` } });
    if (resA.ok) setApplications(await resA.json());
  };

  useEffect(() => { fetchData(); }, []);

  const handleApply = async (offerId: number) => {
    if (!window.confirm('Apply for this loan?')) return;
    
    const toastId = toast.loading("Submitting application...");
    
    const res = await fetch('http://localhost:4000/api/trader/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ offer_id: offerId, purpose: purpose })
    });

    if (res.ok) {
      toast.update(toastId, { render: "Application Submitted!", type: "success", isLoading: false, autoClose: 3000 });
      fetchData(); 
    } else {
      const err = await res.json();
      toast.update(toastId, { render: err.error, type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const hasActiveOrPending = applications.some(app => app.status === 'pending' || app.status === 'approved');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', padding: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#111827' }}>Available Loan Offers</h3>
        
        {hasActiveOrPending ? (
          <div style={{ padding: '16px', backgroundColor: '#fffbeb', color: '#92400e', borderRadius: '8px', fontWeight: '500' }}>
            You must repay your current active loan before applying for a new one.
          </div>
        ) : offers.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No offers available right now. Please check back later.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {offers.map(o => (
              <div key={o.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', backgroundColor: '#f9fafb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{o.amount} <span style={{ fontSize: '14px', color: '#6b7280' }}>UGX</span></span>
                  <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{o.agent_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#6b7280' }}>Duration:</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>{o.duration_days} Days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px' }}>
                  <span style={{ color: '#6b7280' }}>Interest Rate:</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>{o.interest_rate}%</span>
                </div>
                
                {/* PURPOSE DROPDOWN */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Loan Purpose</label>
                  <select 
                    value={purpose} 
                    onChange={(e) => setPurpose(e.target.value)} 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
                  >
                    <option value="Stock Inventory">Stock Inventory</option>
                    <option value="Shop Rent">Shop Rent</option>
                    <option value="Equipment Repair">Equipment Repair</option>
                    <option value="Emergency Cash">Emergency Cash</option>
                  </select>
                </div>

                <button onClick={() => handleApply(o.id)} style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Apply for this Loan
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}