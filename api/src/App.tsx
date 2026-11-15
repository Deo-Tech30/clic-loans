import { useState, FormEvent } from 'react';

function App() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('Loading...');
    
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`Success! Logged in as ${data.user.name} (${data.user.role})`);
        localStorage.setItem('token', data.token); 
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (error) {
      setMessage('Cannot connect to server');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1e3c72', fontFamily: 'Arial' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '10px', width: '350px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
        <h1 style={{ textAlign: 'center', color: '#1e3c72' }}>Clic-Loans</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>Daily micro-loans for traders</p>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone Number</label>
            <input 
              type="text" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="e.g. 0700123456" 
              required 
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }}>
            Login
          </button>
        </form>
        
        {message && (
          <p style={{ marginTop: '15px', textAlign: 'center', color: message.includes('Success') ? 'green' : 'red' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}



export default App;