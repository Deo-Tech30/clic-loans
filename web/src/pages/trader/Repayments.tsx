import { useState, useEffect, FormEvent } from 'react';
import { toast } from 'react-toastify';

export default function TraderRepayments() {
  const [activeLoan, setActiveLoan] = useState<any>(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayMsg, setRepayMsg] = useState('');
  const token = localStorage.getItem('token');

  const fetchLoan = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trader/active-loan`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setActiveLoan(await res.json());
  };

  useEffect(() => { fetchLoan(); }, []);

  const handleRepay = async (e: FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Processing payment...");
    
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trader/repay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ amount_paid: Number(repayAmount) })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.discount_applied > 0) {
        toast.update(toastId, { render: `Success! You saved ${data.discount_applied.toFixed(0)} UGX on interest!`, type: "success", isLoading: false, autoClose: 5000 });
      } else {
        toast.update(toastId, { render: "Payment recorded successfully!", type: "success", isLoading: false, autoClose: 3000 });
      }
      setRepayAmount('');
      fetchLoan(); 
    } else {
      const err = await res.json();
      toast.update(toastId, { render: err.error, type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  if (!activeLoan) {
    return (
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
        <h3 style={{ color: '#6b7280' }}>You do not have any active loans to repay right now.</h3>
      </div>
    );
  }

  const remaining = activeLoan.total_repayment - activeLoan.total_paid;
  const isFullPayment = Number(repayAmount) >= remaining;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      
      {/* LOAN DETAILS */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#111827' }}>Loan Repayment Schedule</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ color: '#6b7280' }}>Principal Amount:</span>
          <strong style={{ color: '#111827' }}>{activeLoan.principal} UGX</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ color: '#6b7280' }}>Total Repayment:</span>
          <strong style={{ color: '#111827' }}>{activeLoan.total_repayment} UGX</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ color: '#6b7280' }}>Due Date:</span>
          <strong style={{ color: '#ef4444' }}>{new Date(activeLoan.due_date).toLocaleDateString()}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
          <span style={{ color: '#6b7280', fontWeight: 'bold' }}>Remaining Balance:</span>
          <strong style={{ color: '#ef4444', fontSize: '20px' }}>{remaining} UGX</strong>
        </div>
      </div>

      {/* MAKE PAYMENT FORM */}
      <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', color: 'white' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Make a Repayment</h3>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>Submit your mobile money payment below.</p>
        
        <form onSubmit={handleRepay} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Amount to Pay (UGX)</label>
            <input 
              type="number" 
              placeholder="Enter amount..." 
              value={repayAmount} 
              onChange={e => setRepayAmount(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', fontSize: '16px' }} 
            />
          </div>

          {/* DISCOUNT HINT */}
          {repayAmount && isFullPayment && (
            <div style={{ backgroundColor: '#065f46', color: '#ecfdf5', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
              🎉 Early Payoff Bonus: 10% discount on remaining interest will be applied!
            </div>
          )}

          <button type="submit" style={{ padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Submit Payment
          </button>
        </form>
        {repayMsg && <p style={{ marginTop: '16px', color: '#10b981', fontWeight: 'bold' }}>{repayMsg}</p>}
      </div>

    </div>
  );
}