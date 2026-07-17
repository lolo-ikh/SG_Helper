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
      const { data: m, error: fetchErr } = await supabase.from('meetings').select('*').eq('id', meetingId).single();
      if (fetchErr || !m || m.checkin_token !== token) {
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
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Valid email is required';
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
    const { data, error } = await supabase.rpc('checkin_attendee', {
      p_meeting_id: Number(meetingId),
      p_name: match,
      p_email: form.email.trim(),
      p_role: form.role,
    });

    if (error) {
      console.error('Check-in error:', error);
      setMessage(`Error: ${error.message || 'Something went wrong. Please try again.'}`);
      setStatus('ready');
      return;
    }
    setStatus('done');
  };

  if (status === 'loading') {
    return (
      <div className="checkin-page">
        <div className="checkin-card">
          <div className="checkin-spinner"></div>
          <p style={{ color: '#86868b', marginTop: 16, fontSize: 14 }}>Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="checkin-page">
        <div className="checkin-card">
          <div className="checkin-icon-circle" style={{ background: 'rgba(255, 59, 48, 0.1)' }}>
            <Shield size={32} style={{ color: '#ff3b30' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 16 }}>Invalid Link</h2>
          <p style={{ color: '#86868b', marginTop: 8, fontSize: 14, lineHeight: 1.5 }}>This check-in link is not valid or has been deactivated.</p>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="checkin-page">
        <div className="checkin-card">
          <div className="checkin-icon-circle" style={{ background: 'rgba(255, 149, 0, 0.1)' }}>
            <Clock size={32} style={{ color: '#ff9500' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 16 }}>Check-in Closed</h2>
          <p style={{ color: '#86868b', marginTop: 8, fontSize: 14, lineHeight: 1.5 }}>This meeting has already ended. Check-in is no longer available.</p>
        </div>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="checkin-page">
        <div className="checkin-card">
          <div className="checkin-icon-circle" style={{ background: 'rgba(52, 199, 89, 0.1)' }}>
            <CheckCircle size={32} style={{ color: '#34c759' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 16 }}>You're All Set</h2>
          <p style={{ color: '#86868b', marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>
            Thank you, <strong style={{ color: '#1d1d1f' }}>{form.name.trim()}</strong>! Your attendance has been recorded. You can safely close this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkin-page">
      <div className="checkin-card">
        <div className="checkin-icon-circle" style={{ background: 'rgba(29, 53, 94, 0.08)' }}>
          <UserCheck size={28} style={{ color: 'var(--ebec-navy)' }} />
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 16 }}>{meeting?.title}</h2>
        <p style={{ color: '#86868b', fontSize: 13, marginTop: 4 }}>
          {meeting?.date} {meeting?.time && `at ${meeting.time}`}
        </p>

        <div className="checkin-divider"></div>

        <p style={{ fontSize: 12, fontWeight: 600, color: '#86868b', marginBottom: 16, textAlign: 'left', width: '100%', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Check In
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
          <div style={{ textAlign: 'left' }}>
            <label className="checkin-label">Full Name</label>
            <input
              type="text"
              placeholder="As it appears on the invite"
              value={form.name}
              onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
              className={`checkin-input ${errors.name ? 'error' : ''}`}
            />
            {errors.name && <p className="checkin-error">{errors.name}</p>}
          </div>

          <div style={{ textAlign: 'left' }}>
            <label className="checkin-label">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
              className={`checkin-input ${errors.email ? 'error' : ''}`}
            />
            {errors.email && <p className="checkin-error">{errors.email}</p>}
          </div>

          <div style={{ textAlign: 'left' }}>
            <label className="checkin-label">Role</label>
            <div style={{ position: 'relative' }}>
              <select
                value={form.role}
                onChange={e => { setForm({ ...form, role: e.target.value }); setErrors({ ...errors, role: '' }); }}
                className={`checkin-input checkin-select ${errors.role ? 'error' : ''} ${form.role ? 'has-value' : ''}`}
              >
                <option value="" disabled>Select your role</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#86868b', pointerEvents: 'none' }} />
            </div>
            {errors.role && <p className="checkin-error">{errors.role}</p>}
          </div>
        </div>

        {message && <p className="checkin-error" style={{ marginTop: 12 }}>{message}</p>}

        <button
          className="checkin-btn"
          onClick={handleCheckIn}
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="checkin-spinner-small"></div>
              Submitting...
            </span>
          ) : 'Check In'}
        </button>

        <p style={{ color: '#c7c7cc', fontSize: 11, marginTop: 16 }}>EBEC Admin Hub</p>
      </div>
    </div>
  );
}
