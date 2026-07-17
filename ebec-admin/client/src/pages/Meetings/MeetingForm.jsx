import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Search, Video, Mail } from 'lucide-react';
import { getInitials } from '../../utils/helpers';
import { LEGACY_2025_TEAM } from '../../utils/legacyData';
import { supabase } from '../../lib/supabase';
import Toast from '../../components/Toast';

export default function MeetingForm({ existingMeeting }) {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [formData, setFormData] = useState(existingMeeting || {
    title: "",
    date: "",
    time: "",
    description: "",
    attendees: [],
    useMeet: true,
    sendEmail: true
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    async function loadManagers() {
      const { data } = await supabase.from('managers').select('*').eq('is_active', true);
      if (data && data.length > 0) {
        setTeamMembers(data.map(m => ({ name: m.name, role: m.role })));
      } else {
        setTeamMembers(LEGACY_2025_TEAM);
      }
    }
    loadManagers();
  }, []);

  const toggleAttendee = (name) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(name)
        ? prev.attendees.filter(a => a !== name)
        : [...prev.attendees, name]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      setNotification({ message: '⚠️ A session title is required', type: 'error' });
      return;
    }
    try {
      if (existingMeeting) {
        const { id, ...updateData } = { ...formData, id: existingMeeting.id };
        const { error } = await supabase.from('meetings').update(updateData).eq('id', existingMeeting.id);
        if (error) throw error;
        navigate('/meetings');
      } else {
        const payload = { ...formData, id: Date.now(), season: '2026-2027', checkin_token: crypto.randomUUID() };
        let { data, error } = await supabase.from('meetings').insert([payload]).select();
        if (error && error.message?.includes('checkin_token')) {
          delete payload.checkin_token;
          ({ data, error } = await supabase.from('meetings').insert([payload]).select());
        }
        if (error) throw error;
        navigate('/meetings');
      }
    } catch (err) {
      setNotification({ message: `Failed: ${err.message}`, type: 'error' });
    }
  };

  const teamList = teamMembers.length > 0 ? teamMembers : LEGACY_2025_TEAM;

  return (
    <div className="form-overlay fade-in">
      <Toast message={notification?.message} type={notification?.type} onDone={() => setNotification(null)} />
      <div className="premium-form meeting-premium">
        <div className="form-header">
          <div className="header-content">
            <div className="header-meta">
              <span className="status-dot online"></span>
              <span className="meta-text">MEETING SCHEDULER</span>
            </div>
            <h2>{existingMeeting ? 'Update Session' : 'New Sync Session'}</h2>
          </div>
          <button className="close-btn" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="form-body">
          <div className="input-group-premium">
            <input type="text" placeholder="Session Title" className="form-input-title" value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} autoFocus />
          </div>

          <div className="time-grid mt-6">
            <div className="datetime-input">
              <span className="input-label">Session Date</span>
              <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div className="datetime-input">
              <span className="input-label">Start Time</span>
              <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
            </div>
          </div>

          <div className="field-group mt-6">
            <label>Notes & Context</label>
            <textarea placeholder="What topics will be covered in this meeting?" className="premium-textarea"
              value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="form-section-premium mt-8">
            <div className="flex-between items-center mb-4">
              <div className="section-info">
                <label className="section-label mb-0">Team Invitation</label>
                <div className="premium-search-container mt-2">
                  <div className="search-icon-wrapper">
                    <Search size={14} />
                  </div>
                  <input type="text" placeholder="Search name or role..." className="cute-search-input"
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
              <div className="selection-actions">
                <button className="pill-btn" onClick={() => setFormData({ ...formData, attendees: teamList.map(t => t.name) })}>All EBEC</button>
                <button className="pill-btn secondary" onClick={() => setFormData({ ...formData, attendees: [] })}>Clear</button>
              </div>
            </div>

            <div className="modern-attendee-grid">
              {teamList.filter(member =>
                member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.role.toLowerCase().includes(searchQuery.toLowerCase())
              ).map(member => (
                <div key={member.name} className={`attendee-item ${formData.attendees.includes(member.name) ? 'selected' : ''}`}
                  onClick={() => toggleAttendee(member.name)}>
                  <div className="member-avatar">
                    {getInitials(member.name)}
                    <div className="selection-check"><Check size={12} /></div>
                  </div>
                  <div className="member-info">
                    <span className="member-name">{member.name}</span>
                    <span className="member-role">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="options-panel mt-10">
            <div className="option-row" onClick={() => setFormData({ ...formData, useMeet: !formData.useMeet })}>
              <div className="option-icon meet"><Video size={20} /></div>
              <div className="option-content">
                <span className="option-title">Google Meet Integration</span>
                <span className="option-desc">Generate a virtual meeting link</span>
              </div>
              <div className={`ios-switch ${formData.useMeet ? 'on' : ''}`}></div>
            </div>
            <div className="option-row" onClick={() => setFormData({ ...formData, sendEmail: !formData.sendEmail })}>
              <div className="option-icon email"><Mail size={20} /></div>
              <div className="option-content">
                <span className="option-title">Email Invitation</span>
                <span className="option-desc">Notify all attendees via email</span>
              </div>
              <div className={`ios-switch ${formData.sendEmail ? 'on' : ''}`}></div>
            </div>
          </div>
        </div>

        <div className="form-footer-premium">
          <button className="btn-tertiary" onClick={() => navigate(-1)}>Discard</button>
          <button className="btn-primary-premium ripple" onClick={handleSubmit}>
            {existingMeeting ? 'Save Changes' : 'Confirm Sync Session'}
          </button>
        </div>
      </div>
    </div>
  );
}
