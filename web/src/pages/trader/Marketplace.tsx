import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApplyModal from '../../components/trader/ApplyModal';
import LoanCalculator from '../../components/trader/LoanCalculator';

export default function TraderMarketplace() {
  const [offers, setOffers] = useState<any[]>([]);
  const [activeLoan, setActiveLoan] = useState<any>(null);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [selectedLoanType, setSelectedLoanType] = useState('All');
  const token = localStorage.getItem('token');

  const loanTypes = [
    { name: 'Boda Boda Loan', icon: '🛵' },
    { name: 'Market Vendor Loan', icon: '🛒' },
    { name: 'Salon & Barbershop Loan', icon: '💇' },
    { name: 'Food Vendor Loan', icon: '🍲' },
    { name: 'Small-Scale Farmer Loan', icon: '🌾' },
    { name: 'Tailor & Artisan Loan', icon: '✂️' },
  ];

  const fetchData = async () => {
    // 1. Fetch Offers
    const resO = await fetch(`${import.meta.env.VITE_API_URL}/api/trader/offers`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (resO.ok) setOffers(await resO.json());

    // 2. Fetch ACTIVE LOAN (Not history)
    const resL = await fetch(`${import.meta.env.VITE_API_URL}/api/trader/active-loan`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (resL.ok) {
      const loanData = await resL.json();
      setActiveLoan(loanData); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApplyClick = (offer: any) => {
    setSelectedOffer(offer);
  };

  const submitApplication = async (data: any) => {
    const toastId = toast.loading("Submitting application...");
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trader/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        toast.update(toastId, { render: "Application Submitted Successfully!", type: "success", isLoading: false, autoClose: 3000 });
        setSelectedOffer(null);
        fetchData(); 
      } else {
        const err = await res.json();
        toast.update(toastId, { render: err.error, type: "error", isLoading: false, autoClose: 3000 });
      }
    } catch (error) {
      toast.update(toastId, { render: "Server error", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  // Filter offers based on selected loan type
  const filteredOffers = selectedLoanType === 'All' ? offers : offers.filter(o => o.loan_type === selectedLoanType || o.loan_type === undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* 1. CALCULATOR ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <LoanCalculator />
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#111827' }}>Why use Clic-Loans?</h3>
          <ul style={{ paddingLeft: '20px', color: '#4b5563', lineHeight: '1.8', fontSize: '14px' }}>
            <li>Fast approval from local Agents.</li>
            <li>Flexible repayment schedules.</li>
            <li>Transparent interest rates with no hidden fees.</li>
            <li>Build your credit score for bigger loans.</li>
          </ul>
        </div>
      </div>

      {/* 2. LOAN TYPES (Horizontal Scroll) */}
      <div>
        <h3 style={{ fontSize: '18px', color: '#111827', marginBottom: '15px' }}>Filter by Loan Type</h3>
        <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', whiteSpace: 'nowrap' }}>
          <button onClick={() => setSelectedLoanType('All')} style={{ padding: '12px 20px', borderRadius: '30px', border: selectedLoanType === 'All' ? '2px solid #10b981' : '1px solid #e5e7eb', background: selectedLoanType === 'All' ? '#ecfdf5' : 'white', color: selectedLoanType === 'All' ? '#065f46' : '#6b7280', fontWeight: 'bold', cursor: 'pointer' }}>All Loans</button>
          {loanTypes.map(lt => (
            <button key={lt.name} onClick={() => setSelectedLoanType(lt.name)} style={{ padding: '12px 20px', borderRadius: '30px', border: selectedLoanType === lt.name ? '2px solid #10b981' : '1px solid #e5e7eb', background: selectedLoanType === lt.name ? '#ecfdf5' : 'white', color: selectedLoanType === lt.name ? '#065f46' : '#6b7280', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{lt.icon}</span> {lt.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. OFFERS GRID */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', padding: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#111827' }}>Available Offers</h3>
        
        {activeLoan ? (
          <div style={{ padding: '16px', backgroundColor: '#fffbeb', color: '#92400e', borderRadius: '8px', fontWeight: '500' }}>
            You must repay your current active loan before applying for a new one.
          </div>
        ) : filteredOffers.length === 0 ? (
          <div style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px', color: '#6b7280', textAlign: 'center' }}>
            No offers available for this loan type right now. Please check back later.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredOffers.map(o => (
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
                
                <button onClick={() => handleApplyClick(o)} style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Apply for this Loan
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOffer && (
        <ApplyModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} onSubmit={submitApplication} />
      )}
    </div>
  );
}