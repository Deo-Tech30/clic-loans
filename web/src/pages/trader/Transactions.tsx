import { useState, useEffect } from 'react';

export default function TraderTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTransactions = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trader/transactions`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) setTransactions(await res.json());
    };
    fetchTransactions();
  }, [token]);

  // Calculate total paid across all history
  const totalPaid = transactions.reduce((sum, t) => sum + Number(t.amount_paid), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* SUMMARY CARD */}
      <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, color: '#9ca3af', fontSize: '14px', textTransform: 'uppercase' }}>Total Amount Repaid</h4>
          <h2 style={{ margin: '8px 0 0 0', fontSize: '32px' }}>{totalPaid.toLocaleString()} UGX</h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, color: '#9ca3af' }}>Total Transactions</p>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '24px' }}>{transactions.length}</h3>
        </div>
      </div>

      {/* TRANSACTION LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {transactions.length === 0 ? (
          <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', margin: 0 }}>You haven't made any repayments yet.</p>
          </div>
        ) : transactions.map(t => {
          const remaining = t.total_repayment - t.total_paid_on_loan;
          
          return (
            <div key={t.receipt_id} style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
              
              {/* LEFT: Receipt Info */}
              <div style={{ borderRight: '1px solid #e5e7eb', paddingRight: '24px' }}>
                <span style={{ display: 'inline-block', background: '#ecfdf5', color: '#065f46', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginBottom: '12px' }}>
                  PAID
                </span>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#111827' }}>+{t.amount_paid} UGX</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#6b7280' }}>{new Date(t.created_at).toLocaleString()}</p>
                
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  <p style={{ margin: '0 0 4px 0' }}>Receipt: <strong style={{ color: '#3b82f6' }}>#TXN-{t.receipt_id.toString().padStart(5, '0')}</strong></p>
                  <p style={{ margin: 0 }}>Agent: <strong style={{ color: '#111827' }}>{t.agent_name}</strong></p>
                </div>
              </div>

              {/* RIGHT: Loan Details */}
              <div>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Loan Breakdown</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>Principal Borrowed:</p>
                    <strong style={{ color: '#111827' }}>{t.principal} UGX</strong>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>Interest Charged:</p>
                    <strong style={{ color: '#111827' }}>{t.interest_amount} UGX</strong>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>Total Repayment Due:</p>
                    <strong style={{ color: '#111827' }}>{t.total_repayment} UGX</strong>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', color: '#6b7280' }}>Loan Balance:</p>
                    <strong style={{ color: remaining <= 0 ? '#10b981' : '#ef4444' }}>
                      {remaining <= 0 ? 'FULLY PAID' : `${remaining} UGX`}
                    </strong>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}