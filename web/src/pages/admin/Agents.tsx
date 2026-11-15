import { useState, useEffect, FormEvent } from 'react';

export default function AdminAgents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [agentName, setAgentName] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [agentPassword, setAgentPassword] = useState('');
  const [agentMarketId, setAgentMarketId] = useState('');
  const [agentMsg, setAgentMsg] = useState('');
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    const resM = await fetch('http://localhost:4000/api/admin/markets');
    setMarkets(await resM.json());
    
    const resA = await fetch('http://localhost:4000/api/admin/agents', { headers: { 'Authorization': `Bearer ${token}` }});
    if (resA.ok) setAgents(await resA.json());
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateAgent = async (e: FormEvent) => {
    e.preventDefault();
    setAgentMsg('Saving...');
    const res = await fetch('http://localhost:4000/api/admin/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: agentName, phone: agentPhone, password: agentPassword, market_id: agentMarketId })
    });
    if (res.ok) {
      setAgentMsg('Agent created!');
      setAgentName(''); setAgentPhone(''); setAgentPassword(''); setAgentMarketId('');
      fetchData();
    } else { 
      const err = await res.json();
      setAgentMsg(`Error: ${err.error}`); 
    }
  };

  const handleDeleteAgent = async (id: number) => {
    if (!window.confirm('Delete this agent?')) return;
    await fetch(`http://localhost:4000/api/admin/agents/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
    fetchData();
  };

  return (
    <div>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', maxWidth: '500px' }}>
        <h3 style={{ marginTop: 0 }}>Create Agent</h3>
        <form onSubmit={handleCreateAgent} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Agent Name" value={agentName} onChange={e => setAgentName(e.target.value)} required style={{ padding: '10px' }} />
          <input type="text" placeholder="Phone" value={agentPhone} onChange={e => setAgentPhone(e.target.value)} required style={{ padding: '10px' }} />
          <input type="password" placeholder="Password" value={agentPassword} onChange={e => setAgentPassword(e.target.value)} required style={{ padding: '10px' }} />
          <select value={agentMarketId} onChange={e => setAgentMarketId(e.target.value)} required style={{ padding: '10px' }}>
            <option value="">Select Market...</option>
            {markets.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <div>
            <button type="submit" style={{ padding: '10px 20px', background: '#1e3c72', color: 'white', border: 'none', borderRadius: '4px' }}>Create Agent</button>
          </div>
        </form>
        {agentMsg && <p style={{ color: agentMsg.includes('Error') ? 'red' : 'green' }}>{agentMsg}</p>}
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Registered Agents</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f8f9fa', textAlign: 'left' }}><th style={{ padding: '10px' }}>Name</th><th style={{ padding: '10px' }}>Phone</th><th style={{ padding: '10px' }}>Market</th><th style={{ padding: '10px' }}>Action</th></tr></thead>
          <tbody>
            {agents.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{a.name}</td>
                <td style={{ padding: '10px' }}>{a.phone}</td>
                <td style={{ padding: '10px' }}>{a.market_name}</td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => handleDeleteAgent(a.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px' }}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}