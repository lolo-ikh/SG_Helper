import { useState, useEffect } from 'react';
import { Layout } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LEGACY_2025_TEAM } from '../../utils/legacyData';

export default function AttendancePredictor() {
  const [teamList, setTeamList] = useState(LEGACY_2025_TEAM);
  const [meetings, setMeetings] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const [duration, setDuration] = useState(2);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    async function loadData() {
      const { data: teamData } = await supabase.from('managers').select('name, role').eq('is_active', true);
      if (teamData && teamData.length > 0) setTeamList(teamData.map(m => ({ name: m.name, role: m.role })));
      const { data: meetingData } = await supabase.from('meetings').select('*');
      setMeetings(meetingData || []);
    }
    loadData();
  }, []);

  const predict = () => {
    if (!date) return alert("Please select a date first!");

    const results = teamList.map(member => {
      const history = meetings.filter(m => m.attendance && m.attendance[member.name]);
      const presentCount = history.filter(m => m.attendance[member.name] === 'present' || m.attendance[member.name] === 'late').length;

      let probability = history.length > 0 ? (presentCount / history.length) * 100 : 75;

      const hour = parseInt(time.split(":")[0]);
      if (hour < 10) probability -= 10;
      if (hour > 20) probability -= 5;

      if (duration > 3) probability -= 15;

      const confidence = Math.min(history.length * 20 + 20, 95);

      return {
        name: member.name,
        role: member.role,
        probability: Math.max(Math.min(probability, 99), 5),
        confidence
      };
    });

    setPredictions(results);
  };

  return (
    <div className="premium-card" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', padding: 32, borderRadius: 32 }}>
      <div className="flex-between" style={{ alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 20, marginBottom: 30 }}>
        <div>
          <h3 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, background: 'var(--ebec-gold)', borderRadius: 10, color: '#000' }}><Layout size={20} /></div>
            Diva AI Attendance Predictor
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 8 }}>Predict attendance probability based on historical patterns</p>
        </div>
        <button className="btn-primary-premium ripple" onClick={predict} style={{ minWidth: 150 }}>Run Simulation</button>
      </div>

      <div className="mgmt-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 30 }}>
        <div className="input-group">
          <label style={{ color: '#fff', fontSize: 11, textTransform: 'uppercase', opacity: 0.6 }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="premium-input-small" style={{ width: '100%', marginTop: 8 }} />
        </div>
        <div className="input-group">
          <label style={{ color: '#fff', fontSize: 11, textTransform: 'uppercase', opacity: 0.6 }}>Proposed Time</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="premium-input-small" style={{ width: '100%', marginTop: 8 }} />
        </div>
        <div className="input-group">
          <label style={{ color: '#fff', fontSize: 11, textTransform: 'uppercase', opacity: 0.6 }}>Duration (Hours)</label>
          <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="premium-input-small" style={{ width: '100%', marginTop: 8 }} />
        </div>
      </div>

      {predictions && (
        <div className="prediction-results fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {predictions.sort((a, b) => b.probability - a.probability).map(p => (
            <div key={p.name} className="list-item" style={{ background: 'rgba(255,255,255,0.05)', marginBottom: 0, padding: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                  <span style={{ color: p.probability > 70 ? '#34c759' : (p.probability > 40 ? 'var(--ebec-gold)' : '#ff3b30'), fontWeight: 800 }}>{Math.round(p.probability)}%</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{p.role}</div>

                <div className="mt-3" style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.probability}%`, background: p.probability > 70 ? '#34c759' : (p.probability > 40 ? 'var(--ebec-gold)' : '#ff3b30'), transition: 'width 0.8s ease-out' }}></div>
                </div>
                <div className="mt-2" style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>Confidence: {p.confidence}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
