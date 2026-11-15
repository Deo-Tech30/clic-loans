import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useLocation } from 'react-router-dom';
import TraderMarketplace from './trader/Marketplace';
import TraderApplications from './trader/Applications';
import TraderRepayments from './trader/Repayments';
import TraderTransactions from './trader/Transactions';
import TraderProfile from './trader/Profile';
import TraderLoanReceipt from './trader/LoanReceipt';

interface Market { name: string; location: string; }

export default function TraderDashboard({ onLogout }: { onLogout: () => void }) {
  const [market, setMarket] = useState<Market | null>(null);
  const token = localStorage.getItem('token');
  const location = useLocation();

  useEffect(() => {
    const fetchMarket = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trader/my-market`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) setMarket(await res.json());
    };
    fetchMarket();
  }, [token]);

  let content;
  if (location.pathname === '/trader/applications') {
    content = <TraderApplications />;
  } else if (location.pathname === '/trader/repayments') {
    content = <TraderRepayments />;
  } else if (location.pathname === '/trader/transactions') {
    content = <TraderTransactions />;
  } else if (location.pathname === '/trader/receipt') {
    content = <TraderLoanReceipt />;
  } else if (location.pathname === '/trader/profile') {
    content = <TraderProfile />;
  } else {
    content = <TraderMarketplace />;
  }

  return (
    <Layout role="trader" onLogout={onLogout}>
      
      {/* PAGE TITLE & MARKET INFO */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', color: '#111827', margin: '0 0 10px 0' }}>
          {location.pathname === '/trader/applications' ? 'My Applications' : 
           location.pathname === '/trader/repayments' ? 'Repayments' : 
           location.pathname === '/trader/transactions' ? 'Transaction History' : 
           location.pathname === '/trader/receipt' ? 'Loan Agreement' :
           location.pathname === '/trader/profile' ? 'My Profile' :
           'Loan Marketplace'}
        </h1>
        
        {market && (
          <div style={{ background: '#e3f2fd', padding: '12px 20px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', display: 'inline-block' }}>
            <span style={{ fontSize: '14px', color: '#1e40af' }}>Your Market: <strong>{market.name} ({market.location})</strong></span>
          </div>
        )}
      </div>

      {content}
    </Layout>
  );
}