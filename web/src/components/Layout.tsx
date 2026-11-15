import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  role: string;
  children: ReactNode;
  onLogout: () => void;
}

export default function Layout({ role, children, onLogout }: LayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = {
        admin: [
      { name: 'Overview', path: '/admin' },
      { name: 'Markets', path: '/admin/markets' },
      { name: 'Agents', path: '/admin/agents' },
      { name: 'All Users', path: '/admin/users' },
      { name: 'All Loans', path: '/admin/loans' },
      { name: 'Loan Management', path: '/admin/loan-management' },
      { name: 'Financial Reports', path: '/admin/reports' },
      { name: 'Revenue Ledger', path: '/admin/repayments' },
      { name: 'Audit Logs', path: '/admin/audit-logs' }, 
      { name: 'Settings', path: '/admin/settings' } 
    ],
           agent: [
      { name: 'Dashboard', path: '/agent' },
      { name: 'My Traders', path: '/agent/traders' },
      { name: 'Loan Offers', path: '/agent/offers' },
      { name: 'Approvals', path: '/agent/approvals' },
      { name: 'Repayments', path: '/agent/repayments' },
      { name: 'Reminders', path: '/agent/reminders' },
      { name: 'Restructure', path: '/agent/restructure' },
      { name: 'My Profile', path: '/agent/profile' } // <-- NEW
    ],     
     
    
             trader: [
      { name: 'Marketplace', path: '/trader' },
      { name: 'My Applications', path: '/trader/applications' },
      { name: 'Repayments', path: '/trader/repayments' },
      { name: 'Transactions', path: '/trader/transactions' },
      { name: 'Loan Agreement', path: '/trader/receipt' }, // <-- NEW
      { name: 'My Profile', path: '/trader/profile' }
    ],  
  };

  const links = menuItems[role as keyof typeof menuItems] || [];

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6', flexDirection: 'row' }}>
      
      {/* MOBILE HEADER */}
      <div style={{ display: 'none', backgroundColor: '#111827', color: 'white', padding: '15px 20px', justifyContent: 'space-between', alignItems: 'center', width: '100%', position: 'fixed', top: 0, zIndex: 50 }} className="mobile-header">
        <h2 style={{ margin: 0, fontSize: '20px', color: '#10b981' }}>Clic-Loans.</h2>
        <button onClick={toggleMenu} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>☰</button>
      </div>

      {/* SIDEBAR */}
      <div 
        className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}
        style={{ 
          width: '250px', 
          minWidth: '250px', 
          backgroundColor: '#111827', 
          color: 'white', 
          display: 'flex', 
          flexDirection: 'column', 
          boxShadow: '4px 0 10px rgba(0,0,0,0.05)',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ padding: '24px', borderBottom: '1px solid #374151' }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px', color: '#10b981' }}>
            Clic-Loans<span style={{ color: 'white' }}>.</span>
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af', textTransform: 'capitalize' }}>
            {role} Portal
          </p>
        </div>

        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ 
                  display: 'block', 
                  padding: '12px 16px', 
                  borderRadius: '8px',
                  color: isActive ? 'white' : '#9ca3af',
                  textDecoration: 'none',
                  backgroundColor: isActive ? '#374151' : 'transparent',
                  fontWeight: isActive ? '600' : '500',
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '20px' }}>
          <button 
            onClick={onLogout} 
            style={{ width: '100%', padding: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
        
        {/* TOP HEADER WITH NOTIFICATION BELL */}
        <header style={{ backgroundColor: 'white', padding: '20px 40px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="desktop-header">
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#111827' }}>
            {links.find(l => l.path === location.pathname)?.name || 'Dashboard'}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            
            {/* NOTIFICATION BELL */}
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <span style={{ fontSize: '20px' }}>🔔</span>
              <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', borderRadius: '50%', padding: '2px 6px' }}>3</span>
            </div>

            {/* PROFILE AVATAR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {role.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          {children}
        </main>

      </div>

      {/* MOBILE RESPONSIVE CSS */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-header { display: flex !important; }
          .desktop-header { display: none !important; }
          .sidebar { 
            position: fixed !important; 
            transform: translateX(-100%); 
            transition: transform 0.3s ease-in-out;
            padding-top: 60px !important;
          }
          .sidebar.open { transform: translateX(0); }
          main { padding: 80px 20px 20px 20px !important; }
        }
      `}</style>

    </div>
  );
}