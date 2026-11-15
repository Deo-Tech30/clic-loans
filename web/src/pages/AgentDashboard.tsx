import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useLocation } from 'react-router-dom';
import AgentTraders from './agent/Traders';
import AgentOffers from './agent/Offers';
import AgentApprovals from './agent/Approvals';
import AgentRepayments from './agent/Repayments';
import AgentReminders from './agent/Reminders';
import AgentRestructure from './agent/Restructure';
import AgentProfile from './agent/Profile';

interface Market { name: string; location: string; wallet_balance: number; }

export default function AgentDashboard({ onLogout }: { onLogout: () => void }) {
  const [market, setMarket] = useState<Market | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const token = localStorage.getItem('token');
  const location = useLocation();

  useEffect(() => {
    const fetchMarket = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agent/my-market`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setMarket(await res.json());
    };
    
    const fetchAnalytics = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/agent/analytics`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setAnalytics(await res.json());
    };

    fetchMarket();
    fetchAnalytics();
  }, [token]);

  let content;
  if (location.pathname === '/agent/traders') {
    content = <AgentTraders />;
  } else if (location.pathname === '/agent/offers') {
    content = <AgentOffers />;
  } else if (location.pathname === '/agent/approvals') {
    content = <AgentApprovals />;
  } else if (location.pathname === '/agent/repayments') {
    content = <AgentRepayments />;
  } else if (location.pathname === '/agent/reminders') {
    content = <AgentReminders />;
  } else if (location.pathname === '/agent/restructure') {
    content = <AgentRestructure />;
  } else if (location.pathname === '/agent/profile') {
    content = <AgentProfile />;
  } else {
    // DEFAULT DASHBOARD VIEW (ANALYTICS)
    content = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* MARKET & WALLET CARDS */}
        {market && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>Assigned Market</div>
              <div style={{ marginTop: '10px', fontSize: '24px', fontWeight: '700', color: '#111827' }}>{market.name}</div>
              <div style={{ marginTop: '4px', fontSize: '14px', color: '#6b7280' }}>{market.location}</div>
            </div>
            <div style={{ background: '#10b981', padding: '24px', borderRadius: '12px', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ color: '#ecfdf5', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>My Wallet Balance</div>
              <div style={{ marginTop: '10px', fontSize: '28px', fontWeight: '700' }}>{market.wallet_balance || 0} <span style={{ fontSize: '16px' }}>UGX</span></div>
              <div style={{ marginTop: '4px', fontSize: '14px', color: '#ecfdf5' }}>Your 80% Interest Share</div>
            </div>
          </div>
        )}

        {/* ANALYTICS CARDS */}
        {analytics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Total Disbursed</div>
              <div style={{ marginTop: '10px', fontSize: '24px', fontWeight: '700', color: '#111827' }}>{analytics.total_disbursed} <span style={{ fontSize: '14px' }}>UGX</span></div>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Total Collected</div>
              <div style={{ marginTop: '10px', fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{analytics.total_collected} <span style={{ fontSize: '14px' }}>UGX</span></div>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Active Loans</div>
              <div style={{ marginTop: '10px', fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>{analytics.active_loans}</div>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Completed Loans</div>
              <div style={{ marginTop: '10px', fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{analytics.completed_loans}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Layout role="agent" onLogout={onLogout}>
      {content}
    </Layout>
  );
}