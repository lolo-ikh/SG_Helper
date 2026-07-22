import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, Clock, UserCheck, Shield, ChevronDown } from 'lucide-react';

const ROLES = [
  'President', 'Vice President', 'Secretary General',
  'HR Manager', 'HR Co-Manager', 'HR Department Head',
  'IT Manager', 'IT Department Head',
  'Design Manager', 'Design Co-Manager', 'Design Department Head',
  'Marketing Manager', 'Marketing Co-Manager', 'Marketing Department Head',
  'Logistics Manager', 'Logistics Co-Manager', 'Logistics Department Head',
  'Events Manager', 'Events Co-Manager', 'Events Department Head',
  'Finance & Legal Manager', 'Finance & Legal Co-Manager', 'Finance & Legal Department Head',
  'Relex Manager', 'Relex Co-Manager', 'Relex Department Head',
  'General Department Head', 'Member',
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
      const { data: m, error: fetchErr } = await supabase.from('meetings').select('*').eq('id', meetingId).single();
      if (fetchErr || !m || m.checkin_token !== token) {
        setStatus('invalid');
        return;
      }
      setMeeting(m);
      const now = new Date();
      const meetingStart = new Date(`${m.date}T${m.time || '00:00'}`);
      const checkinWindow = new Date(meetingStart.getTime() + 3 * 60 * 60 * 1000);
      if (now > checkinWindow) { setStatus('expired'); return; }
      setStatus('ready');
    }
    load();
  }, [meetingId, token]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Valid email is required';
    if (!form.role) errs.role = 'Please select a role';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckIn = async () => {
    if (!validate()) return;
    const trimmedName = form.name.trim();
    const match = (meeting?.attendees || []).find(a => a.toLowerCase() === trimmedName.toLowerCase());
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
      console.error('Check-in error:', error);
      setMessage(error.message || 'Something went wrong. Please try again.');
      setStatus('ready');
      return;
    }
    setStatus('done');
  };

  const inputStyle = (hasError) => ({
    width: '100%', padding: '14px 16px', borderRadius: 12,
    border: hasError ? '1.5px solid rgba(255,59,48,0.6)' : '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(255,255,255,0.08)', fontSize: 15, color: '#fff',
    outline: 'none', transition: '0.2s', boxSizing: 'border-box',
    fontFamily: 'var(--system-font)',
  });

  const labelStyle = {
    fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
    marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 0.8,
  };

  if (status === 'loading') {
    return (
      <div className="checkin-page">
        <div className="checkin-glass-card">
          <div className="checkin-spinner"></div>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 16, fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="checkin-page">
        <div className="checkin-glass-card">
          <div className="checkin-icon-ring" style={{ borderColor: 'rgba(255,59,48,0.4)' }}>
            <Shield size={28} style={{ color: '#ff6b6b' }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 20, color: '#fff' }}>Invalid Link</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8, fontSize: 14 }}>This check-in link is not valid.</p>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="checkin-page">
        <div className="checkin-glass-card">
          <div className="checkin-icon-ring" style={{ borderColor: 'rgba(255,149,0,0.4)' }}>
            <Clock size={28} style={{ color: '#ffb340' }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 20, color: '#fff' }}>Check-in Closed</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8, fontSize: 14 }}>This meeting has already ended.</p>
        </div>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="checkin-page">
        <div className="checkin-glass-card">
          <div className="checkin-icon-ring" style={{ borderColor: 'rgba(52,199,89,0.4)' }}>
            <CheckCircle size={28} style={{ color: '#34c759' }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 20, color: '#fff' }}>You're All Set</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>
            Thank you, <strong style={{ color: '#fff' }}>{form.name.trim()}</strong>! Your attendance has been recorded. You can close this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkin-page">
      <div className="checkin-glass-card">
        <div className="checkin-icon-ring" style={{ borderColor: 'rgba(255,193,7,0.4)' }}>
          <UserCheck size={26} style={{ color: 'var(--ebec-gold)' }} />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 20, color: '#fff' }}>{meeting?.title}</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>
          {meeting?.date} {meeting?.time && `at ${meeting.time}`}
        </p>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '24px 0 20px', width: '100%' }} />

        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 16, textAlign: 'left', width: '100%', textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Check In
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={labelStyle}>Full Name</label>
            <input type="text" placeholder="As it appears on the invite" value={form.name}
              onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
              style={inputStyle(errors.name)} />
            {errors.name && <p style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={labelStyle}>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
              style={inputStyle(errors.email)} />
            {errors.email && <p style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4 }}>{errors.email}</p>}
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={labelStyle}>Role</label>
            <div style={{ position: 'relative' }}>
              <select value={form.role}
                onChange={e => { setForm({ ...form, role: e.target.value }); setErrors({ ...errors, role: '' }); }}
                style={{ ...inputStyle(errors.role), appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', paddingRight: 36, color: form.role ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                <option value="" disabled>Select your role</option>
                {ROLES.map(r => <option key={r} value={r} style={{ color: '#1d1d1f', background: '#fff' }}>{r}</option>)}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
            </div>
            {errors.role && <p style={{ color: '#ff6b6b', fontSize: 12, marginTop: 4 }}>{errors.role}</p>}
          </div>
        </div>

        {message && <p style={{ color: '#ff6b6b', fontSize: 13, marginTop: 12, textAlign: 'left', width: '100%' }}>{message}</p>}

        <button className="checkin-btn" onClick={handleCheckIn} disabled={status === 'submitting'} style={{ marginTop: 24 }}>
          {status === 'submitting' ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div className="checkin-spinner-small"></div> Submitting...
            </span>
          ) : 'Check In'}
        </button>

        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 20 }}>EBEC Admin Hub</p>
      </div>
    </div>
  );
}
