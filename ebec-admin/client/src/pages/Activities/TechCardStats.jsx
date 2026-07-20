import { useState, useEffect } from 'react';
import { Layout } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function TechCardStats() {
  const [techCards, setTechCards] = useState([]);

  useEffect(() => {
    async function loadCards() {
      const { data } = await supabase.from('tech_cards').select('*');
      setTechCards(data || []);
    }
    loadCards();
  }, []);
  const activeCards = techCards.filter(tc => !tc.isArchived);
  const total = activeCards.length;
  const scientific = activeCards.filter(c => c.activityType === 'scientific').length;
  const cultural = activeCards.filter(c => c.activityType === 'cultural').length;
  const sport = activeCards.filter(c => c.activityType === 'sport').length;
  const indoor = activeCards.filter(c => c.isIndoor).length;
  const outdoor = activeCards.filter(c => !c.isIndoor).length;
  const hours = activeCards.filter(c => c.duration === 'Hours').length;
  const oneDay = activeCards.filter(c => c.duration === 'One Day').length;
  const multiDay = activeCards.filter(c => c.duration === 'Multi-Day').length;
  const totalGuests = activeCards.reduce((acc, c) => acc + (c.externalAttendees?.length || 0), 0);
  const sponsoredCount = activeCards.filter(c => c.isSponsored).length;
  const sponsorRate = total > 0 ? Math.round((sponsoredCount / total) * 100) : 0;

  return (
    <div className="dashboard-content fade-in">
      <div className="glass-panel-wide" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ color: '#fff', fontSize: '32px', marginBottom: '10px' }}>Activities Hub</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto' }}>
          Overview of EBEC's logistical and technical performance for the 2026 mandate.
        </p>
      </div>

      <div className="quick-summary" style={{ marginBottom: '40px' }}>
        <div className="stat-card"><div className="stat-value">{total}</div><div className="stat-label">Total Activities</div></div>
        <div className="stat-card"><div className="stat-value">{totalGuests}</div><div className="stat-label">Total Guests</div></div>
        <div className="stat-card"><div className="stat-value">{sponsorRate}%</div><div className="stat-label">Sponsorship Rate</div></div>
      </div>

      <div className="stats-grid-2col" style={{ marginBottom: '40px' }}>
        <div className="glass-panel-wide stat-panel-inner">
          <h4 style={{ color: '#fff', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: 10 }}>Type Distribution</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[{ label: 'Scientific', count: scientific, color: '#0071e3' }, { label: 'Cultural', count: cultural, color: '#34c759' }, { label: 'Sport', count: sport, color: '#ffc107' }].map(item => (
              <div key={item.label}>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ color: '#fff', fontSize: '13px', fontWeight: 800 }}>{item.count}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', height: '10px', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ background: item.color, height: '100%', width: total > 0 ? `${(item.count / total) * 100}%` : '0%', transition: 'width 1s ease-out', boxShadow: `0 0 15px ${item.color}40` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel-wide stat-panel-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h4 style={{ color: '#fff', marginBottom: '20px' }}>Partnership Strength</h4>
          <div style={{ position: 'relative', width: '150px', height: '150px' }}>
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="65" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
              <circle cx="75" cy="75" r="65" stroke="#ffc107" strokeWidth="12" fill="none" strokeDasharray={408} strokeDashoffset={408 - (408 * sponsorRate / 100)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: '28px', fontWeight: 900 }}>{sponsorRate}%</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 700 }}>FUNDED</div>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '20px', textAlign: 'center' }}>Percentage of activities secured through external sponsorship.</p>
        </div>
      </div>

      <div className="stats-grid-2col" style={{ marginBottom: '40px' }}>
        <div className="glass-panel-wide stat-panel-inner">
          <h4 style={{ color: '#fff', marginBottom: '20px' }}>Venue Analytics</h4>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', background: 'rgba(52, 199, 89, 0.1)', padding: 20, borderRadius: 16, flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#34c759' }}>{indoor}</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>Indoor Events</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255, 193, 7, 0.1)', padding: 20, borderRadius: 16, flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ebec-gold)' }}>{outdoor}</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>Outdoor Events</div>
            </div>
          </div>
        </div>

        <div className="glass-panel-wide stat-panel-inner">
          <h4 style={{ color: '#fff', marginBottom: '20px' }}>Duration Breakdown</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 100, paddingBottom: 10 }}>
            {[{ l: 'Hours', c: hours }, { l: '1 Day', c: oneDay }, { l: 'Multi', c: multiDay }].map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ width: 40, height: total > 0 ? Math.max((d.c / total) * 80, 5) : 5, background: '#0071e3', borderRadius: '8px 8px 0 0', marginBottom: 8 }}></div>
                <span style={{ fontSize: 11, color: '#ccc' }}>{d.l}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{d.c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h4 style={{ color: '#fff', marginBottom: '30px' }}>Recent activity timeline</h4>
      <div className="glass-panel-wide" style={{ padding: '20px' }}>
        {activeCards.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center' }}>No activities recorded yet.</p>
        ) : (
          activeCards.slice(-5).reverse().map((tc, i) => (
            <div key={tc.id} className="list-item" style={{ marginBottom: i === 4 ? 0 : 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: tc.activityType === 'scientific' ? '#0071e3' : tc.activityType === 'cultural' ? '#34c759' : '#ffc107' }} />
                <div>
                  <h4 className="meet-title">{tc.title}</h4>
                  <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{tc.reference} • {tc.theme}</p>
                </div>
              </div>
              <span className="tag">{tc.isSponsored ? 'SPONSORED' : 'INTERNAL'}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
