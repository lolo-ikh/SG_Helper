import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, Clock, UserCheck, Shield } from 'lucide-react';

export default function CheckInPage() {
  const { meetingId, token } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      const { data: m } = await supabase.from('meetings').select('*').eq('id', meetingId).single();
      if (!m || m.checkin_token !== token) {
        setStatus('invalid');
        return;
      }
      setMeeting(m);

      const now = new Date();
      const meetingEnd = new Date(`${m.date}T${m.time || '23:59'}`);
      if (now > meetingEnd) {
        setStatus('expired');
        return;
      }

      const { data: existingCheckins } = await supabase.rpc('get_meeting_checkins', { p_meeting_id: Number(meetingId) });
      setCheckins(existingCheckins || []);
      setStatus('ready');
    }
    load();
  }, [meetingId, token]);

  const handleCheckIn = async () => {
    if (!selected) return;
    setStatus('submitting');
    const { data, error } = await supabase.rpc('checkin_attendee', {
      p_meeting_id: Number(meetingId),
      p_name: selected
    });
    if (error) {
      setMessage('Something went wrong. Try again.');
      setStatus('ready');
      return;
    }
    setCheckins(prev => [...prev, { name: selected, checked_in_at: new Date().toISOString() }]);
    setStatus('done');
    setMessage(`Welcome, ${selected}! Your attendance has been recorded.`);
  };

  if (status === 'loading') {
    return (
      <div className="checkin-page">
        <div className="checkin-card">
          <p>Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="checkin-page">
        <div className="checkin-card">
          <Shield size={48} style={{ color: '#ff3b30', marginBottom: 12 }} />
          <h2>Invalid Link</h2>
          <p style={{ color: '#666', marginTop: 8 }}>This check-in link is not valid.</p>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="checkin-page">
        <div className="checkin-card">
          <Clock size={48} style={{ color: '#ff9500', marginBottom: 12 }} />
          <h2>Check-in Closed</h2>
          <p style={{ color: '#666', marginTop: 8 }}>This meeting has already ended.</p>
        </div>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="checkin-page">
        <div className="checkin-card">
          <CheckCircle size={48} style={{ color: '#34c759', marginBottom: 12 }} />
          <h2>You're Checked In!</h2>
          <p style={{ color: '#666', marginTop: 8 }}>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkin-page">
      <div className="checkin-card">
        <UserCheck size={36} style={{ color: 'var(--ebec-navy)', marginBottom: 8 }} />
        <h2>{meeting?.title}</h2>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>
          {meeting?.date} at {meeting?.time}
        </p>

        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, textAlign: 'left', width: '100%' }}>
          Select your name to check in:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginBottom: 16 }}>
          {(meeting?.attendees || []).map(name => {
            const isChecked = checkins.some(c => c.name === name);
            return (
              <button
                key={name}
                onClick={() => !isChecked && setSelected(name)}
                disabled={isChecked}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: selected === name ? '2px solid var(--ebec-navy)' : '1px solid #e5e5e5',
                  background: isChecked ? '#f0f8f0' : selected === name ? 'rgba(29, 53, 94, 0.05)' : '#fff',
                  cursor: isChecked ? 'default' : 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: isChecked ? '#34c759' : '#1d1d1f',
                  transition: '0.2s',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                {isChecked ? <CheckCircle size={16} /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #ccc' }} />}
                {name}
                {isChecked && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#34c759' }}>Already checked in</span>}
              </button>
            );
          })}
        </div>

        {message && status === 'ready' && <p style={{ color: '#ff3b30', fontSize: 13, marginBottom: 8 }}>{message}</p>}

        {selected && status !== 'submitting' && (
          <button className="cta" style={{ width: '100%' }} onClick={handleCheckIn}>
            Check In as {selected}
          </button>
        )}
        {status === 'submitting' && (
          <p style={{ color: '#666', fontSize: 13 }}>Submitting...</p>
        )}
      </div>
    </div>
  );
}
