import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatBullets, formatNumbered } from '../../utils/helpers';
import Toast from '../../components/Toast';

export default function TechCardForm() {
  const navigate = useNavigate();
  const [techCards, setTechCards] = useState([]);
  const [refCounter, setRefCounter] = useState(1);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('tech_cards').select('*').order('id', { ascending: false });
      setTechCards(data || []);
      if (data && data.length > 0) {
        const refs = data.map(tc => { if (!tc.reference) return 0; return parseInt(tc.reference.split('/')[0]) || 0; }).filter(n => n >= 8);
        const maxRef = refs.length > 0 ? Math.max(...refs) : 7;
        setRefCounter(maxRef + 1);
      } else {
        setRefCounter(8);
      }
    }
    load();
  }, []);

  const currentRef = `${String(refCounter).padStart(2, '0')}/26`;

  const [formData, setFormData] = useState({
    title: "", theme: "", activityType: "scientific", duration: "One Day",
    startTime: "", endTime: "", objectives: "", agenda: "", isSponsored: false,
    sponsorName: "", needs: "", attendeeType: "School", externalAttendees: [],
    reference: currentRef, location: "", isIndoor: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [externalInput, setExternalInput] = useState({
    name: "", email: "", phone: "", isStudent: true, school: "", year: "", studentId: "", nationalId: ""
  });
  const [showGuestForm, setShowGuestForm] = useState(false);

  useEffect(() => {
    setFormData(prev => ({ ...prev, reference: currentRef }));
  }, [currentRef]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const addExternal = () => {
    if (externalInput.name && (externalInput.studentId || externalInput.nationalId)) {
      setFormData({ ...formData, externalAttendees: [...formData.externalAttendees, { ...externalInput, id: Date.now() }] });
      setExternalInput({ name: "", email: "", phone: "", isStudent: true, school: "", year: "", studentId: "", nationalId: "" });
      setShowGuestForm(false);
      showNotification('✓ Guest added successfully');
    } else {
      showNotification('⚠️ Please fill in Name and ID Number', 'error');
    }
  };

  const removeExternal = (id) => {
    setFormData({ ...formData, externalAttendees: formData.externalAttendees.filter(a => a.id !== id) });
  };

  const handleSubmit = async () => {
    if (!formData.title) { showNotification('⚠️ Please enter the activity title', 'error'); return; }
    setIsSaving(true);
    let docUrl = null;
    try {
      const dateObj = new Date(formData.startTime || Date.now());
      const dateEndObj = new Date(formData.endTime || Date.now());
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const payload = {
        ref_num: formData.reference, date_write: new Date().toLocaleDateString('en-GB'),
        type: formData.activityType, title: formData.title, place_name: formData.location || "TBD",
        is_inside: formData.isIndoor, day_name: days[dateObj.getDay()],
        date_activity: dateObj.toLocaleDateString('en-GB'),
        time_from: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        time_to: dateEndObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        target_group: formData.attendeeType, coordination: "",
        objectives: formatBullets(formData.objectives), themes: formData.theme,
        needs: formatNumbered(formData.needs), agenda: formatBullets(formData.agenda),
        is_sponsored: formData.isSponsored
      };
      const res = await fetch("https://script.google.com/macros/s/AKfycbyehjXK9isbudF-O6JIRIo3Wx0KZpnKENSKJcPYlybi_79UubGsH7dJXUNnKsqQAcwGZw/exec", {
        method: "POST", body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === 'success' && data.url) { docUrl = data.url; showNotification('✓ Google Doc created successfully!'); }
      else { showNotification('⚠️ Google Doc not generated. Card saved without link.', 'error'); }
    } catch (e) { console.error("Google Doc Sync Failed", e); }

    const { error } = await supabase.from('tech_cards').insert([{ ...formData, id: Date.now(), docUrl }]);
    if (!error) navigate('/techcards');
    else showNotification('Error saving card', 'error');
    setIsSaving(false);
  };

  return (
    <div className="form-overlay fade-in">
      <Toast message={notification?.message} type={notification?.type} onDone={() => setNotification(null)} />
      <div className="premium-form tech-card-premium">
        <div className="form-header">
          <div className="header-content">
            <div className="header-meta"><span className="ref-tag">ADMIN • LOGISTICS • {formData.reference}</span></div>
            <h2>Create Technical Card</h2>
          </div>
          <button className="close-btn" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="form-body">
          <div className="input-group-premium">
            <input type="text" placeholder="Activity Title (e.g. Design Thinking Workshop)" className="form-input-title"
              value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} autoFocus />
          </div>

          <div className="field-group mb-6" style={{ background: 'rgba(0, 113, 227, 0.05)', padding: '12px 20px', borderRadius: 16, border: '1px solid rgba(0, 113, 227, 0.2)' }}>
            <div className="flex-between items-center">
              <label style={{ fontSize: 12, fontWeight: 700, color: '#0071e3' }}>Reference Number</label>
              {techCards.some(tc => tc.reference === formData.reference) && (
                <span style={{ fontSize: 10, color: '#ff3b30', fontWeight: 700 }}>⚠️ DUPLICATE DETECTED</span>
              )}
            </div>
            <input type="text" className="premium-input-small"
              style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1.5px solid #0071e3', padding: '8px 0', fontSize: 14, fontWeight: 700, outline: 'none' }}
              value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} />
          </div>

          <div className="flex-between items-center mb-6" style={{ background: 'rgba(255,255,255,0.5)', padding: '12px 20px', borderRadius: 16 }}>
            <div style={{ flex: 1, marginRight: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#888', display: 'block', marginBottom: 6 }}>Location / Venue</label>
              <input type="text" placeholder="Where is it happening?"
                style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 16, fontWeight: 600, color: '#1d1d1f', outline: 'none' }}
                value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: formData.isIndoor ? '#1d1d1f' : '#888' }}>{formData.isIndoor ? 'Indoor' : 'Outdoor'}</span>
              <div className={`ios-switch ${formData.isIndoor ? 'on' : ''}`}
                onClick={() => setFormData({ ...formData, isIndoor: !formData.isIndoor })} style={{ width: 42, height: 26 }}></div>
            </div>
          </div>

          <div className="form-section-premium">
            <label className="section-label">Activity Type</label>
            <div className="segmented-control">
              {[{ value: "scientific", label: "Scientific" }, { value: "cultural", label: "Cultural" }, { value: "sport", label: "Sport" }].map(type => (
                <button key={type.value} className={`segment-btn ${formData.activityType === type.value ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, activityType: type.value })}>{type.label}</button>
              ))}
            </div>
          </div>

          <div className="form-grid mt-4">
            <div className="field-group">
              <label>Domain / Theme</label>
              <input type="text" placeholder="e.g., Robotics, Marketing, Entrepreneurship..." className="premium-input"
                value={formData.theme} onChange={(e) => setFormData({ ...formData, theme: e.target.value })} />
            </div>
          </div>

          <div className="form-section-premium">
            <label className="section-label">Session Duration</label>
            <div className="segmented-control">
              {["Hours", "One Day", "Multi-Day"].map(d => (
                <button key={d} className={`segment-btn ${formData.duration === d ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, duration: d })}>{d}</button>
              ))}
            </div>
            <div className="time-row mt-4">
              <div className="datetime-input">
                <span className="input-label">{formData.duration === 'Multi-Day' ? 'Start Date & Time' : 'From'}</span>
                <input type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
              </div>
              <div className="datetime-input">
                <span className="input-label">{formData.duration === 'Multi-Day' ? 'End Date & Time' : 'To'}</span>
                <input type="datetime-local" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="form-grid mt-4">
            <div className="field-group">
              <label>Objectives</label>
              <textarea placeholder="Primary goals of this session..." value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                className="premium-textarea" style={{ height: '80px' }} />
            </div>
            <div className="field-group">
              <label>Activity Agenda</label>
              <textarea placeholder="Walkthrough of the activity steps..." value={formData.agenda}
                onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                className="premium-textarea" style={{ height: '80px' }} />
            </div>
          </div>

          <div className="form-section-premium">
            <label className="section-label">Logistics & School Needs</label>
            <textarea placeholder="Room, Projectors, Material, Boards..." className="premium-textarea"
              value={formData.needs} onChange={(e) => setFormData({ ...formData, needs: e.target.value })} />
          </div>

          <div className="form-section-premium">
            <div className="switch-row" onClick={() => setFormData({ ...formData, isSponsored: !formData.isSponsored })}>
              <div className="switch-info">
                <label>External Sponsorship</label>
                <p>Is this activity powered by a sponsor?</p>
              </div>
              <div className={`ios-switch ${formData.isSponsored ? 'on' : ''}`}></div>
            </div>
            {formData.isSponsored && (
              <div className="fade-in mt-3">
                <input type="text" placeholder="Official Sponsor Name" className="premium-input gold-focus"
                  value={formData.sponsorName} onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })} />
              </div>
            )}
          </div>

          <div className="form-section-premium">
            <label className="section-label">Target Audience</label>
            <div className="segmented-control">
              {[{ value: "School", label: "School Only", desc: "ENSIA Students" }, { value: "Outside", label: "External", desc: "Professionals / Visitors" }, { value: "Mixed", label: "Mixed", desc: "Students + External" }].map(type => (
                <button key={type.value} className={`segment-btn ${formData.attendeeType === type.value ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, attendeeType: type.value })} title={type.desc}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 13 }}>{type.label}</span>
                    <span style={{ fontSize: 8, opacity: 0.7, fontWeight: 500 }}>{type.desc}</span>
                  </div>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
              {formData.attendeeType === 'School' && '🎓 Only ENSIA students will attend'}
              {formData.attendeeType === 'Outside' && '🌍 External guests only (no ENSIA students)'}
              {formData.attendeeType === 'Mixed' && '🤝 Both ENSIA students and external guests'}
            </p>
          </div>

          {formData.attendeeType !== 'School' && (
            <div className="form-section-premium">
              <div className="flex-between items-center mb-3">
                <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>External Guests ({formData.externalAttendees.length})</span>
                <button className="pill-btn mini" onClick={() => setShowGuestForm(true)}>+ Add Guest</button>
              </div>

              {showGuestForm && (
                <div className="guest-data-form fade-in">
                  <div className="form-grid compact">
                    <input placeholder="Full Name" value={externalInput.name} onChange={e => setExternalInput({ ...externalInput, name: e.target.value })} className="premium-input-small" />
                    <input placeholder="Email" value={externalInput.email} onChange={e => setExternalInput({ ...externalInput, email: e.target.value })} className="premium-input-small" />
                    <input placeholder="Phone" value={externalInput.phone} onChange={e => setExternalInput({ ...externalInput, phone: e.target.value })} className="premium-input-small" />
                  </div>
                  <div className="segmented-control tiny mt-3">
                    <button className={`segment-btn ${externalInput.isStudent ? 'active' : ''}`} onClick={() => setExternalInput({ ...externalInput, isStudent: true })}>Student</button>
                    <button className={`segment-btn ${!externalInput.isStudent ? 'active' : ''}`} onClick={() => setExternalInput({ ...externalInput, isStudent: false })}>Professional / Other</button>
                  </div>
                  <div className="form-grid compact mt-3">
                    {externalInput.isStudent ? (
                      <>
                        <input placeholder="School / University" value={externalInput.school} onChange={e => setExternalInput({ ...externalInput, school: e.target.value })} className="premium-input-small" />
                        <input placeholder="Year of Study" value={externalInput.year} onChange={e => setExternalInput({ ...externalInput, year: e.target.value })} className="premium-input-small" />
                        <input placeholder="Student ID Card #" value={externalInput.studentId} onChange={e => setExternalInput({ ...externalInput, studentId: e.target.value })} className="premium-input-small" />
                      </>
                    ) : (
                      <input placeholder="National ID (NIN) Number" value={externalInput.nationalId} onChange={e => setExternalInput({ ...externalInput, nationalId: e.target.value })} className="premium-input-small" style={{ gridColumn: 'span 2' }} />
                    )}
                  </div>
                  <div className="flex-between mt-4">
                    <button className="btn-tertiary mini" onClick={() => setShowGuestForm(false)}>Cancel</button>
                    <button className="btn-primary-premium ripple mini" onClick={addExternal}>Confirm Guest</button>
                  </div>
                </div>
              )}

              <div className="guest-scroller-premium mt-4">
                {formData.externalAttendees.map(g => (
                  <div key={g.id} className="guest-log-item">
                    <div className="guest-main">
                      <span className="gn">{g.name}</span>
                      <span className="gt">{g.isStudent ? `${g.year} • ${g.school}` : 'Professional Access'}</span>
                    </div>
                    <div className="guest-contact">
                      <span>{g.email}</span>
                      <span>{g.isStudent ? `ID: ${g.studentId}` : `NIN: ${g.nationalId}`}</span>
                    </div>
                    <button className="delete-guest" onClick={() => removeExternal(g.id)}><Trash size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="form-footer-premium">
          <button className="btn-tertiary" onClick={() => navigate(-1)} disabled={isSaving}>Discard</button>
          <button className="btn-primary-premium ripple" disabled={isSaving} onClick={handleSubmit}>
            {isSaving ? 'Generating Doc...' : 'Save & Auto-Generate Doc'}
          </button>
        </div>
      </div>
    </div>
  );
}
