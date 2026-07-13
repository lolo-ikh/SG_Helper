import { useState, useEffect } from 'react';
import { Check, Search } from 'lucide-react';
import { getInitials } from '../../utils/helpers';
import { LEGACY_2025_TEAM } from '../../utils/legacyData';
import { supabase } from '../../lib/supabase';

export default function EditMeetingModal({ meeting, onCancel, onSubmit }) {
  const [teamList, setTeamList] = useState(LEGACY_2025_TEAM);
  const [formData, setFormData] = useState({
    ...meeting,
    attendees: meeting.attendees || []
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadTeam() {
      const { data } = await supabase.from('managers').select('name, role').eq('is_active', true);
      if (data && data.length > 0) setTeamList(data.map(m => ({ name: m.name, role: m.role })));
    }
    loadTeam();
  }, []);

  const toggleAttendee = (name) => {
    setFormData(prev => ({
      ...prev,
      attendees: (prev.attendees || []).includes(name)
        ? prev.attendees.filter(a => a !== name)
        : [...(prev.attendees || []), name]
    }));
  };

  return (
    <div className="form-overlay fade-in">
      <div className="premium-form meeting-premium" style={{ maxHeight: '95vh' }}>
        <div className="form-header">
          <div className="header-content">
            <div className="header-meta">
              <span className="ref-tag">EDIT SESSION • EBEC-ADM-2026-{meeting.id.toString().slice(-4)}</span>
            </div>
            <h2>Update Meeting Intel</h2>
          </div>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="form-body">
          <div className="input-group-premium">
            <input type="text" className="form-input-title" value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} autoFocus />
          </div>

          <div className="time-grid mt-6">
            <div className="datetime-input">
              <span className="input-label">Reschedule Date</span>
              <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div className="datetime-input">
              <span className="input-label">Reschedule Time</span>
              <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
            </div>
          </div>

          <div className="field-group mt-6">
            <label>Update Description</label>
            <textarea className="premium-textarea" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="form-section-premium mt-8">
            <div className="flex-between items-center mb-4">
              <div className="section-info">
                <label className="section-label mb-0">Rework Attendance List</label>
                <div className="premium-search-container mt-2">
                  <div className="search-icon-wrapper"><Search size={14} /></div>
                  <input type="text" placeholder="Search name or role..." className="cute-search-input"
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
              <div className="selection-actions">
                <button className="pill-btn" onClick={() => setFormData({ ...formData, attendees: teamList.map(t => t.name) })}>Select All</button>
                <button className="pill-btn secondary" onClick={() => setFormData({ ...formData, attendees: [] })}>Clear</button>
              </div>
            </div>

            <div className="modern-attendee-grid" style={{ maxHeight: '300px' }}>
              {teamList.filter(member =>
                member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.role.toLowerCase().includes(searchQuery.toLowerCase())
              ).map(member => (
                <div key={member.name} className={`attendee-item ${formData.attendees?.includes(member.name) ? 'selected' : ''}`}
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
        </div>

        <div className="form-footer-premium">
          <button className="btn-tertiary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary-premium ripple" onClick={() => onSubmit(formData)}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
