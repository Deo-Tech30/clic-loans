import { useState } from 'react';

interface ApplyModalProps {
  offer: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function ApplyModal({ offer, onClose, onSubmit }: ApplyModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [requestedAmount, setRequestedAmount] = useState(offer.amount);
  const [purpose, setPurpose] = useState('Stock Inventory');
  const [duration, setDuration] = useState(offer.duration_days);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ offer_id: offer.id, requestedAmount, purpose, duration });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#111827' }}>Loan Application Form</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter your name" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Phone Number</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="e.g. 0700123456" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Loan Amount (UGX)</label>
              <input type="number" value={requestedAmount} onChange={(e) => setRequestedAmount(Number(e.target.value))} max={offer.amount} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Max: {offer.amount} UGX</p>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Duration (Days)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} max={offer.duration_days} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Max: {offer.duration_days} days</p>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Purpose of Loan</label>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
              <option value="Boda Boda Loan">Boda Boda Loan</option>
              <option value="Market Vendor Loan">Market Vendor Loan</option>
              <option value="Salon & Barbershop Loan">Salon & Barbershop Loan</option>
              <option value="Food Vendor Loan">Food Vendor Loan</option>
              <option value="Small-Scale Farmer Loan">Small-Scale Farmer Loan</option>
              <option value="Tailor & Artisan Loan">Tailor & Artisan Loan</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ flex: 1, padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Submit Application</button>
          </div>
        </form>
      </div>
    </div>
  );
}