import { useState } from 'react';

export default function LoanCalculator() {
  const [amount, setAmount] = useState(50000);
  const [duration, setDuration] = useState(30);
  const interestRate = 10; // 10% flat rate for estimation

  const interest = amount * (interestRate / 100);
  const totalRepayment = amount + interest;
  const dailyPayment = totalRepayment / duration;

  return (
    <div style={{ background: '#1e3c72', color: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>📊 Loan Calculator</h3>
      <p style={{ color: '#a0b3d6', fontSize: '14px', marginBottom: '20px' }}>Estimate your repayment before you apply.</p>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
          <span>Loan Amount (UGX)</span>
          <strong>{amount.toLocaleString()}</strong>
        </label>
        <input 
          type="range" min="10000" max="500000" step="10000" 
          value={amount} onChange={(e) => setAmount(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }} 
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
          <span>Duration (Days)</span>
          <strong>{duration}</strong>
        </label>
        <input 
          type="range" min="7" max="90" step="1" 
          value={duration} onChange={(e) => setDuration(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }} 
        />
      </div>

      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span>Interest ({interestRate}%):</span>
          <span>{interest.toLocaleString()} UGX</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
          <span>Total Repayment:</span>
          <span style={{ color: '#10b981' }}>{totalRepayment.toLocaleString()} UGX</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#a0b3d6' }}>
          <span>Daily Payment:</span>
          <span>{Math.ceil(dailyPayment).toLocaleString()} UGX / day</span>
        </div>
      </div>
    </div>
  );
}