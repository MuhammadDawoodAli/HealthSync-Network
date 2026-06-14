import { useState } from 'react';
import './index.css';

export default function App() {
  const [mode, setMode] = useState('member');
  const [dispatchBuffer, setDispatchBuffer] = useState([]);
  const [events, setEvents] = useState([]);
  const [memory, setMemory] = useState([]); // Random replacement cache
  const [faultCount, setFaultCount] = useState(0);
  const [allClaims, setAllClaims] = useState([]);

  // OS Concept: Banker's Algorithm
  const RISK_FUND = 1000000;
  const providerLimits = { 'Apex Health': 300000, 'Wellness Inc': 250000 };

  const logEvent = (e) => setEvents(prev => [`[OS Kernel] ${e}`, ...prev].slice(0, 10));

  // OS Concept: Producer (Semaphore)
  const dispatchClaim = (e) => {
    e.preventDefault();
    const provider = e.target.provider.value;
    const value = parseInt(e.target.value.value);
    const eligibility = e.target.eligibility.value;
    const file = e.target.file.files[0];

    if (!file) return alert('Document needed for processing.');

    if (eligibility === 'Not Eligible') {
      logEvent(`Eligibility Check Failed for ${provider}`);
      return alert('Validation: Patient is not eligible for this claim.');
    }

    // Semaphore limit 6
    if (dispatchBuffer.length >= 6) {
      logEvent('Semaphore Wait: Buffer full.');
      return alert('OS Exception: Dispatch Buffer Full. Semaphore acquired by others.');
    }

    if (value > providerLimits[provider] || value > RISK_FUND) {
      logEvent(`Banker Alert: Allocation of ${value} to ${provider} denied.`);
      return alert('Banker\'s Algorithm: Unsafe State detected! Request Denied.');
    }

    let fraudScore = (value > 10000) ? 80 : 15;
    
    const claim = {
      id: `HSX-${Math.floor(Math.random()*10000)}`,
      provider,
      value,
      fraudScore,
      fileName: file.name,
      burstTime: Math.floor(Math.random() * 8) + 2,
      arrivalTime: Date.now()
    };

    setDispatchBuffer([...dispatchBuffer, claim]);
    setAllClaims([...allClaims, { ...claim, state: 'Pending' }]);
    logEvent(`Claim ${claim.id} dispatched by ${provider}`);
    alert('Dispatched Successfully');
  };

  // OS Concept: Consumer
  const handleClaim = (id, state) => {
    setDispatchBuffer(dispatchBuffer.filter(c => c.id !== id));
    setAllClaims(allClaims.map(c => c.id === id ? { ...c, state } : c));
    logEvent(`Agent processed claim ${id} as ${state}. Semaphore signaled.`);
  };

  // OS Concept: CPU Scheduling (HRRN)
  const [algorithm, setAlgorithm] = useState('HRRN');
  const getQueue = () => {
    let q = [...dispatchBuffer];
    if (algorithm === 'SJF') q.sort((a, b) => a.burstTime - b.burstTime);
    if (algorithm === 'HRRN') {
      const now = Date.now();
      q.sort((a, b) => {
        const rrA = ((now - a.arrivalTime) + a.burstTime) / a.burstTime;
        const rrB = ((now - b.arrivalTime) + b.burstTime) / b.burstTime;
        return rrB - rrA; // Highest response ratio first
      });
    }
    // FCFS is default insertion order
    return q;
  };

  // OS Concept: Random Page Replacement
  const inspectClaim = (c) => {
    if (memory.find(m => m.id === c.id)) {
      logEvent(`Page Hit! ${c.id} found in memory.`);
      alert(`Page Hit! Memory details:\nFile: ${c.fileName}\nFraud Score: ${c.fraudScore}`);
    } else {
      setFaultCount(fc => fc + 1);
      alert(`Page Fault! Swapping into memory.\nFile: ${c.fileName}`);
      let newMem = [...memory];
      if (newMem.length >= 3) {
        // Random Replacement
        const victimIdx = Math.floor(Math.random() * newMem.length);
        newMem[victimIdx] = c;
        logEvent(`Page Fault! Replaced block ${victimIdx} randomly.`);
      } else {
        newMem.push(c);
        logEvent('Page Fault! Loaded into empty block.');
      }
      setMemory(newMem);
    }
  };

  const [search, setSearch] = useState('');
  const [sr, setSr] = useState(null);

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 className="logo">HealthSync</h2>
        <nav>
          <button className={mode==='member'?'active':''} onClick={()=>setMode('member')}>Member Portal</button>
          <button className={mode==='provider'?'active':''} onClick={()=>setMode('provider')}>Provider Portal</button>
          <button className={mode==='agent'?'active':''} onClick={()=>setMode('agent')}>Agent Console</button>
        </nav>
        <div className="os-metrics">
          <h4>OS Metrics</h4>
          <p>Buffer Usage: {dispatchBuffer.length}/6</p>
          <p>Page Faults: {faultCount}</p>
        </div>
      </aside>

      <main className="main-content">
        {mode === 'member' && (
          <div className="card">
            <h3>Insured Member Tracker</h3>
            <div className="grid-form">
              <input placeholder="Enter HSX- ID" onChange={e => setSearch(e.target.value)} />
              <button className="btn-dispatch" onClick={() => setSr(allClaims.find(c => c.id === search) || 'none')}>Track</button>
            </div>
            {sr && sr !== 'none' && (
              <div style={{marginTop: '20px'}}>
                <p>ID: {sr.id}</p>
                <p>State: <strong>{sr.state}</strong></p>
              </div>
            )}
          </div>
        )}

        {mode === 'provider' && (
          <div className="card">
            <h3>Dispatch New Claim</h3>
            <p className="subtitle">Producer Module - Banker's Checked</p>
            <form onSubmit={dispatchClaim} className="grid-form">
              <select name="provider">
                <option>Apex Health</option>
                <option>Wellness Inc</option>
              </select>
              <select name="eligibility">
                <option>Eligible</option>
                <option>Not Eligible</option>
              </select>
              <input name="value" type="number" placeholder="Claim Value ($)" required />
              <input name="file" type="file" required />
              <button type="submit" className="btn-dispatch">Dispatch (P)</button>
            </form>
            <div className="os-viva-card">
              <strong>OS Concept: Producer (Semaphore) & Banker's Algo</strong><br/>
              <strong>Why & How:</strong> The Provider dispatches claims to a <em>Semaphore-controlled buffer</em>. If the buffer is full, the OS blocks the action. The <em>Banker's Algorithm</em> evaluates the Risk Fund Matrix before dispatching to ensure the allocation avoids a <strong>Deadlock</strong>.
            </div>
          </div>
        )}

        {mode === 'agent' && (
          <div className="card">
            <div className="card-header" style={{marginBottom: 0}}>
              <h3>Agent Console (Consumer)</h3>
              <select value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
                <option value="FCFS">FCFS</option>
                <option value="SJF">SJF</option>
                <option value="HRRN">HRRN</option>
              </select>
            </div>
            <div className="os-viva-card" style={{marginTop:0, marginBottom: '20px'}}>
              <strong>OS Concept: Consumer & HRRN Scheduling</strong><br/>
              <strong>Why & How:</strong> The Agent acts as the <em>Consumer</em>. Using the <em>HRRN (Highest Response Ratio Next)</em> algorithm prevents starvation by prioritizing claims that have been waiting the longest relative to their required burst time.
            </div>
            
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Claim ID</th><th>Burst (ms)</th><th>Risk Factor</th><th>Action</th></tr></thead>
                <tbody>
                  {getQueue().map(c => (
                    <tr key={c.id}>
                      <td onClick={() => inspectClaim(c)} className="clickable">{c.id}</td>
                      <td>{c.burstTime}</td>
                      <td style={{color: c.fraudScore > 50 ? '#ef4444' : '#10b981'}}>{c.fraudScore}/100</td>
                      <td>
                        <button onClick={() => handleClaim(c.id, 'Resolved')} className="btn-resolve">Resolve (V)</button>
                        <button onClick={() => handleClaim(c.id, 'Rejected')} style={{marginLeft:'5px', background:'#ef4444'}} className="btn-resolve">Reject</button>
                      </td>
                    </tr>
                  ))}
                  {dispatchBuffer.length === 0 && <tr><td colSpan="4">Agent Idle (Blocked)</td></tr>}
                </tbody>
              </table>
            </div>

            <div className="memory-blocks">
              <h4>RAM Blocks (Random Replacement)</h4>
              <div className="blocks">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`block ${memory[i] ? 'filled' : ''}`}>
                    {memory[i] ? memory[i].id : 'Free'}
                  </div>
                ))}
              </div>
            </div>
            <div className="os-viva-card">
              <strong>OS Concept: Page Replacement (Random)</strong><br/>
              <strong>Why & How:</strong> Inspecting a claim loads it into RAM blocks. A Cache miss triggers a <strong>Page Fault</strong>. If all 3 blocks are full, a <em>Random Replacement</em> algorithm selects a random victim block to swap out, demonstrating non-deterministic OS paging.
            </div>
          </div>
        )}

        <div className="card terminal">
          <h3>Kernel Event Log</h3>
          {events.map((e, i) => <div key={i} className="term-line">{e}</div>)}
        </div>
      </main>
    </div>
  );
}
