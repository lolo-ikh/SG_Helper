import React, { useState } from 'react';

const Home = () => {
  // Logic for the Reference Number Card
  const [refNum, setRefNum] = useState("EBEC-2026-ADM-024");
  const [isEditingRef, setIsEditingRef] = useState(false);

  return (
    <div className="dashboard">
      {/* Top Header - Apple Style */}
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span style={{ color: 'var(--ebec-gold)', fontWeight: 'bold', letterSpacing: '1px', fontSize: '12px' }}>SECRETARY GENERAL</span>
          <h1 style={{ margin: 0, fontSize: '36px', color: 'var(--ebec-navy)', fontWeight: '700' }}>SG Helper.</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>Friday, Feb 13</p>
          <p style={{ margin: 0, fontWeight: '600' }}>Welcome, Amine</p>
        </div>
      </header>

      <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        
        {/* Card 1: Reference Number (The Administration Hook) */}
        <div className="glass-card" style={{ gridColumn: 'span 1', borderTop: '4px solid var(--ebec-gold)' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', opacity: 0.6 }}>CURRENT REF NUMBER</h4>
          {isEditingRef ? (
            <input 
              className="ref-input"
              value={refNum} 
              onChange={(e) => setRefNum(e.target.value)}
              onBlur={() => setIsEditingRef(false)}
              autoFocus
            />
          ) : (
            <h2 style={{ margin: '0 0 15px 0', fontSize: '22px' }}>{refNum}</h2>
          )}
          <button onClick={() => setIsEditingRef(!isEditingRef)} className="btn-secondary">
            {isEditingRef ? "Save Reference" : "Update Number"}
          </button>
        </div>

        {/* Card 2: Primary Actions (The "Add" Section) */}
        <div className="glass-card" style={{ gridColumn: 'span 2', background: 'var(--ebec-navy)', color: 'white' }}>
          <h3 style={{ marginTop: 0 }}>Administrative Actions</h3>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button className="action-pill gold">＋ New Meeting Report</button>
            <button className="action-pill white">👤 Take Attendance</button>
          </div>
        </div>

        {/* Card 3: History & Archive (Linked to Google) */}
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Recent Reports History</h3>
            <a href="#" style={{ fontSize: '12px', color: 'var(--ebec-navy)', textDecoration: 'none', fontWeight: 'bold' }}>VIEW ALL IN SHEETS →</a>
          </div>
          <div className="report-row">
            <span>#023 - Weekly Sync</span>
            <span className="status-tag">Google Doc</span>
          </div>
          <div className="report-row">
            <span>#022 - Marketing Dept Meeting</span>
            <span className="status-tag">Google Doc</span>
          </div>
        </div>

        {/* Card 4: Quick Stats */}
        <div className="glass-card" style={{ background: '#f0f2f5' }}>
          <h4 style={{ margin: 0, opacity: 0.6 }}>SHEET STATUS</h4>
          <p style={{ fontSize: '14px', margin: '10px 0' }}>All attendance records are <b>Synced</b></p>
          <div style={{ width: '100%', height: '6px', background: '#ddd', borderRadius: '10px' }}>
            <div style={{ width: '100%', height: '100%', background: '#4CAF50', borderRadius: '10px' }}></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;