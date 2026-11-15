import { useState, useEffect, FormEvent } from 'react';

export default function AgentOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [duration, setDuration] = useState('');
  const [offerMsg, setOfferMsg] = useState('');
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);
  const token = localStorage.getItem('token');

  const fetchOffers = async () => {
    const res = await fetch('http://localhost:4000/api/agent/offers', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setOffers(await res.json());
  };

  useEffect(() => { fetchOffers(); }, []);

  const handleOfferSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setOfferMsg('Saving...');
    const url = editingOfferId ? `http://localhost:4000/api/agent/offers/${editingOfferId}` : 'http://localhost:4000/api/agent/offers';
    const method = editingOfferId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ amount, interest_rate: interestRate, duration_days: duration })
    });
    if (res.ok) {
      setOfferMsg(editingOfferId ? 'Offer updated!' : 'Offer created!');
      setAmount(''); setInterestRate(''); setDuration(''); setEditingOfferId(null);
      fetchOffers();
    } else {
      const err = await res.json();
      setOfferMsg(`Error: ${err.error}`);
    }
  };

  const handleDeleteOffer = async (id: number) => {
    if (!window.confirm('Delete this offer?')) return;
    await fetch(`http://localhost:4000/api/agent/offers/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
    fetchOffers();
  };

  return (
    <div>
      <h1 style={{ color: '#1e3c72' }}>Loan Offers</h1>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', maxWidth: '500px' }}>
        <h3 style={{ marginTop: 0 }}>{editingOfferId ? 'Edit Loan Offer' : 'Create Loan Offer'}</h3>
        <form onSubmit={handleOfferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="number" placeholder="Amount (UGX)" value={amount} onChange={e => setAmount(e.target.value)} required style={{ padding: '10px' }} />
          <input type="number" placeholder="Interest Rate (%)" value={interestRate} onChange={e => setInterestRate(e.target.value)} required style={{ padding: '10px' }} />
          <input type="number" placeholder="Duration (Days)" value={duration} onChange={e => setDuration(e.target.value)} required style={{ padding: '10px' }} />
          <div>
            <button type="submit" style={{ padding: '10px 20px', background: '#1e3c72', color: 'white', border: 'none', borderRadius: '4px' }}>
              {editingOfferId ? 'Update Offer' : 'Create Offer'}
            </button>
            {editingOfferId && <button type="button" onClick={() => { setEditingOfferId(null); setAmount(''); setInterestRate(''); setDuration(''); }} style={{ marginLeft: '10px', padding: '10px' }}>Cancel</button>}
          </div>
        </form>
        {offerMsg && <p style={{ color: offerMsg.includes('Error') ? 'red' : 'green' }}>{offerMsg}</p>}
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>My Active Loan Offers</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f8f9fa', textAlign: 'left' }}><th style={{ padding: '10px' }}>Amount</th><th style={{ padding: '10px' }}>Interest</th><th style={{ padding: '10px' }}>Duration</th><th style={{ padding: '10px' }}>Actions</th></tr></thead>
          <tbody>
            {offers.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{o.amount} UGX</td>
                <td style={{ padding: '10px' }}>{o.interest_rate}%</td>
                <td style={{ padding: '10px' }}>{o.duration_days} Days</td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => { setEditingOfferId(o.id); setAmount(o.amount.toString()); setInterestRate(o.interest_rate.toString()); setDuration(o.duration_days.toString()); }} style={{ marginRight: '5px', background: '#ffc107', border: 'none', padding: '5px 10px', borderRadius: '3px' }}>Edit</button>
                  <button onClick={() => handleDeleteOffer(o.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}