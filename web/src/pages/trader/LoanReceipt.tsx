import { useState, useEffect } from 'react';

export default function TraderLoanReceipt() {
  const [loan, setLoan] = useState<any>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchLoan = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trader/loan-agreement`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) setLoan(await res.json());
    };
    fetchLoan();
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  if (!loan) {
    return (
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
        <h3 style={{ color: '#6b7280' }}>You do not have any active loan agreements right now.</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      
      {/* ACTION BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div>
          <h3 style={{ margin: 0, color: '#111827' }}>Official Loan Agreement</h3>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Keep this document for your records.</p>
        </div>
        <button onClick={handlePrint} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          🖨️ Print / Download PDF
        </button>
      </div>

      {/* THE RECEIPT DOCUMENT */}
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #111827', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#10b981' }}>Clic-Loans.</h1>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Micro-Loan Marketplace</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>OFFICIAL RECEIPT</h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Loan ID: #L-{loan.loan_id.toString().padStart(5, '0')}</p>
          </div>
        </div>

        {/* PARTIES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Borrower Details</h4>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '16px' }}>{loan.trader_name}</p>
            <p style={{ margin: '0 0 5px 0', color: '#4b5563' }}>{loan.trader_phone}</p>
            <p style={{ margin: 0, color: '#4b5563' }}>{loan.market_name} Market</p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Lender (Agent) Details</h4>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '16px' }}>{loan.agent_name}</p>
            <p style={{ margin: 0, color: '#4b5563' }}>Approved by Clic-Loans</p>
          </div>
        </div>

        {/* TERMS TABLE */}
        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Loan Terms</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 0', color: '#4b5563' }}>Date Approved</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold' }}>{new Date(loan.applied_at).toLocaleDateString()}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 0', color: '#4b5563' }}>Purpose</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold' }}>{loan.purpose}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 0', color: '#4b5563' }}>Principal Amount</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold' }}>{loan.principal} UGX</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 0', color: '#4b5563' }}>Interest Charged</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold' }}>{loan.interest_amount} UGX</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 0', color: '#4b5563' }}>Due Date</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold', color: '#ef4444' }}>{new Date(loan.due_date).toLocaleDateString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TOTAL BOX */}
        <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Total Repayment Due:</span>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{loan.total_repayment} UGX</span>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
          <p>This is a system-generated document. No signature is required.</p>
          <p>For inquiries, contact support@clic-loans.com</p>
        </div>
      </div>

      {/* PRINT CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable, .printable * { visibility: visible; }
          .printable { position: absolute; left: 0; top: 0; width: 100%; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}