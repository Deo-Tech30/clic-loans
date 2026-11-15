import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, FormEvent } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import TraderDashboard from './pages/TraderDashboard';

function App() {
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('role'));
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Login States
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Registration States
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMarket, setRegMarket] = useState('');
  const [markets, setMarkets] = useState<any[]>([]);

  useEffect(() => {
    // Fetch markets for the registration dropdown
    if (!isLoginView) {
      fetch(`${import.meta.env.VITE_API_URL}/api/admin/markets`)
        .then(res => res.json())
        .then(data => setMarkets(data));
    }
  }, [isLoginView]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('Loading...');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role); 
        setUserRole(data.user.role); 
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (error) {
      setMessage('Cannot connect to server');
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('Registering...');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register-trader`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, phone: regPhone, password: regPassword, market_id: regMarket })
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Registration successful! Please log in.');
        setIsLoginView(true); // Switch back to login
      } else {
        setMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      setMessage('Cannot connect to server');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUserRole(null);
  };

  if (!userRole) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1e3c72', fontFamily: 'Arial' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '10px', width: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
          <h1 style={{ textAlign: 'center', color: '#1e3c72', marginBottom: '20px' }}>Clic-Loans</h1>
          
          {isLoginView ? (
            // LOGIN FORM
            <>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px' }} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px' }} />
                <button type="submit" style={{ padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Login</button>
              </form>
              <p style={{ textAlign: 'center', marginTop: '15px', color: '#666', fontSize: '14px' }}>
                Are you a Trader? <span onClick={() => setIsLoginView(false)} style={{ color: '#28a745', cursor: 'pointer', fontWeight: 'bold' }}>Register Here</span>
              </p>
            </>
          ) : (
            // REGISTRATION FORM
            <>
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" placeholder="Full Name" value={regName} onChange={(e) => setRegName(e.target.value)} required style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px' }} />
                <input type="text" placeholder="Phone Number" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px' }} />
                <input type="password" placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px' }} />
                <select value={regMarket} onChange={(e) => setRegMarket(e.target.value)} required style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '5px' }}>
                  <option value="">Select Your Market...</option>
                  {markets.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <button type="submit" style={{ padding: '12px', background: '#1e3c72', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Create Account</button>
              </form>
              <p style={{ textAlign: 'center', marginTop: '15px', color: '#666', fontSize: '14px' }}>
                Already have an account? <span onClick={() => setIsLoginView(true)} style={{ color: '#28e745', cursor: 'pointer', fontWeight: 'bold' }}>Login Here</span>
              </p>
            </>
          )}
          
          {message && <p style={{ marginTop: '15px', textAlign: 'center', color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          userRole === 'admin' ? <Navigate to="/admin" /> :
          userRole === 'agent' ? <Navigate to="/agent" /> :
          <Navigate to="/trader" />
        } />
        <Route path="/admin/*" element={<AdminDashboard onLogout={handleLogout} />} />
        <Route path="/agent/*" element={<AgentDashboard onLogout={handleLogout} />} />
        <Route path="/trader/*" element={<TraderDashboard onLogout={handleLogout} />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;