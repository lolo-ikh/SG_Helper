import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, Clock, UserCheck, Shield, ChevronDown } from 'lucide-react';

const ROLES = [
  'President',
  'Vice President',
  'Secretary General',
  'HR Manager',
  'IT Manager',
  'Design Manager',
  'Marketing Manager',
  'Logistics Manager',
  'Events Manager',
  'Finance Manager',
  'Member',
];

export default function CheckInPage() {
  const { meetingId, token } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', email: '', role: '' });
  const [errors, setErrors] = useState({});

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

      setStatus('ready');
    }
    load();
  }, [meetingId, token]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Valid email is required';
    if (!form.role) errs.role = 'Please select a role';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckIn = async () => {
    if (!validate()) return;
    const trimmedName = form.name.trim();

    const attendees = meeting?.attendees || [];
    const match = attendees.find(a => a.toLowerCase() === trimmedName.toLowerCase());
    if (!match) {
      setErrors({ name: 'Your name is not on the attendee list for this meeting.' });
      return;
    }

    setStatus('submitting');
    const { error } = await supabase.rpc('checkin_attendee', {
      p_meeting_id: Number(meetingId),
      p_name: match,
      p_email: form.email.trim(),
      p_role: form.role,
    });
    if (error) {
      setMessage('Something went wrong. Try again.');
      setStatus('ready');
      return;
    }
    setStatus('done');
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
          <h2>Attendance Recorded</h2>
          <p style={{ color: '#666', marginTop: 8, fontSize: 14 }}>
            Thank you, {form.name.trim()}! Your attendance has been recorded. You can close this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkin-page">
      <div className="checkin-card">
        <UserCheck size={36} style={{ color: 'var(--ebec-navy)', marginBottom: 8 }} />
        <h2>{meeting?.title}</h2>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 24 }}>
          {meeting?.date} at {meeting?.time}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#86868b', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12, border: errors.name ? '1.5px solid #ff3b30' : '1.5px solid #e5e5e5',
                fontSize: 14, outline: 'none', transition: '0.2s', boxSizing: 'border-box',
              }}
            />
            {errors.name && <p style={{ color: '#ff3b30', fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#86868b', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12, border: errors.email ? '1.5px solid #ff3b30' : '1.5px solid #e5e5e5',
                fontSize: 14, outline: 'none', transition: '0.2s', boxSizing: 'border-box',
              }}
            />
            {errors.email && <p style={{ color: '#ff3b30', fontSize: 12, marginTop: 4 }}>{errors.email}</p>}
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#86868b', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>Role</label>
            <div style={{ position: 'relative' }}>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12, border: errors.role ? '1.5px solid #ff3b30' : '1.5px solid #e5e5e5',
                  fontSize: 14, outline: 'none', transition: '0.2s', appearance: 'none', background: '#fff',
                  color: form.role ? '#1d1d1f' : '#999', boxSizing: 'border-box', cursor: 'pointer',
                }}
              >
                <option value="" disabled>Select your role</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#86868b', pointerEvents: 'none' }} />
            </div>
            {errors.role && <p style={{ color: '#ff3b30', fontSize: 12, marginTop: 4 }}>{errors.role}</p>}
          </div>
        </div>

        {message && <p style={{ color: '#ff3b30', fontSize: 13, marginTop: 12 }}>{message}</p>}

        <button
          className="cta"
          style={{ width: '100%', marginTop: 20 }}
          onClick={handleCheckIn}
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Submitting...' : 'Check In'}
        </button>
      </div>
    </div>
  );
}
