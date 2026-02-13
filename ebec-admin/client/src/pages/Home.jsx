import React, { useState, useEffect } from 'react';
import ebecLogo from '../assets/EBEC.jfif';

// --- Custom SVG Icons ---
const ChevronLeft = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const ChevronRight = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const Plus = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const Hash = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
);
const ArchiveIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
);
const Check = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const Mail = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
);
const Video = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
);
const UserCheck = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
);
const FileText = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const Clipboard = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
);
const Package = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);
const Trash = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path></svg>
);

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// --- Constants ---
const EBEC_TEAM = [
  { name: "Enzo Chaabnia", role: "President" },
  { name: "Boucekkine Oumaima", role: "VP" },
  { name: "Berbaoui Ashref Abderrahmane", role: "Vice President" },
  { name: "Leena IKHLEF", role: "SG" },
  { name: "Salah Badreddin", role: "HR Manager" },
  { name: "Oussama Bouziane", role: "HR Co-manager" },
  { name: "Khoumari Aya", role: "Co-Manager in Relex" },
  { name: "TOUTAH Sanaa", role: "Logistics Manager" },
  { name: "Mouhoun Cilia", role: "Events Logistics Co-manager" },
  { name: "Wissal Oulem", role: "Project Manager" },
  { name: "Zineb Bouchaib", role: "Media & Marketing" },
  { name: "AHSATAL Imed Eddine", role: "Media & Marketing" },
  { name: "Maria Ines Raheb", role: "Design Co-manager" },
  { name: "Sara BENALI", role: "Design Co-manager" },
  { name: "BEKHEDDA Asma", role: "Co-ManagerDesign" },
  { name: "LAKEL Maissa", role: "Co-Manager Relex" },
  { name: "MESSAOUDI Dorsaf", role: "Co-manger in Relex" },
  { name: "Bouzira Maroua", role: "Event Manager" },
  { name: "Tazgart Kaouther", role: "Event Co-manager" },
  { name: "Benzergua Djihene Chaimaa", role: "Finance & Legal Manager" },
  { name: "ALOUIT Mouhsine Abdelhakim", role: "Finance & Legal Manager" },
  { name: "HACENE Serine Nour el Imane", role: "Finance & Legal Manager" },
  { name: "Youcef Belaib", role: "Co-manager Finance" },
  { name: "DJOUBANI Sarah", role: "Marketing Co-Manager" },
  { name: "AMEZIANE Yani", role: "IT Manager" },
  { name: "BOULEFAA Mustapha", role: "Events" }
];

// --- Components ---

const NewTechnicalCardForm = ({ onCancel, onSubmit, currentRef }) => {
  const [formData, setFormData] = useState({
    title: "",
    theme: "",
    duration: "One Day", // One Day, Multi-Day, Hours
    startTime: "",
    endTime: "",
    objectives: "",
    agenda: "",
    isSponsored: false,
    sponsorName: "",
    needs: "",
    attendeeType: "School", // School, Outside, Mixed
    externalAttendees: [],
    reference: currentRef
  });

  const [externalInput, setExternalInput] = useState({ name: "", info: "" });

  const addExternal = () => {
    if (externalInput.name) {
      setFormData({
        ...formData,
        externalAttendees: [...formData.externalAttendees, { ...externalInput, id: Date.now() }]
      });
      setExternalInput({ name: "", info: "" });
    }
  };

  const removeExternal = (id) => {
    setFormData({
      ...formData,
      externalAttendees: formData.externalAttendees.filter(a => a.id !== id)
    });
  };

  return (
    <div className="form-overlay fade-in">
      <div className="premium-form tech-card-premium">
        <div className="form-header">
          <div className="header-content">
            <div className="header-meta">
              <span className="ref-tag">TECH CARD • {formData.reference}</span>
            </div>
            <h2>Activity Logistics</h2>
          </div>
          <button className="close-btn" onClick={onCancel}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="form-body">
          <div className="input-group-premium">
            <input
              type="text"
              placeholder="Activity Title"
              className="form-input-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              autoFocus
            />
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label>Theme & Domain</label>
              <input
                type="text"
                placeholder="e.g. AI Ethics, Robotics, Marketing"
                className="premium-input"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              />
            </div>
          </div>

          <div className="form-section-premium">
            <label className="section-label">Duration & Scheduling</label>
            <div className="segmented-control">
              {["Hours", "One Day", "Multi-Day"].map(d => (
                <button
                  key={d}
                  className={`segment-btn ${formData.duration === d ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, duration: d })}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="time-row mt-4">
              <div className="datetime-input">
                <span className="input-label">Start Time</span>
                <input type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
              </div>
              <div className="datetime-input">
                <span className="input-label">End Time</span>
                <input type="datetime-local" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="form-grid mt-4">
            <div className="field-group">
              <label>Core Objectives</label>
              <textarea
                placeholder="What are the key goals for this activity?"
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                className="premium-textarea"
              />
            </div>
            <div className="field-group">
              <label>Detailed Agenda</label>
              <textarea
                placeholder="Break down the timeline..."
                value={formData.agenda}
                onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                className="premium-textarea"
              />
            </div>
          </div>

          <div className="form-section-premium">
            <div className="switch-row" onClick={() => setFormData({ ...formData, isSponsored: !formData.isSponsored })}>
              <div className="switch-info">
                <label>Sponsorship Status</label>
                <p>Is this activity backed by an external partner?</p>
              </div>
              <div className={`ios-switch ${formData.isSponsored ? 'on' : ''}`}></div>
            </div>

            {formData.isSponsored && (
              <div className="fade-in mt-3">
                <input
                  type="text"
                  placeholder="Official Sponsor Name"
                  className="premium-input gold-focus"
                  value={formData.sponsorName}
                  onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="form-section-premium">
            <label className="section-label">Logistics & Materials</label>
            <textarea
              placeholder="What equipment, tools, or resources are required?"
              className="premium-textarea"
              value={formData.needs}
              onChange={(e) => setFormData({ ...formData, needs: e.target.value })}
            />
          </div>

          <div className="form-section-premium pb-10">
            <div className="flex-between items-center mb-4">
              <label className="section-label mb-0">Attendance Type</label>
              <select
                className="premium-select"
                value={formData.attendeeType}
                onChange={(e) => setFormData({ ...formData, attendeeType: e.target.value })}
              >
                <option value="School">Internal (School Only)</option>
                <option value="Outside">External (Guests Only)</option>
                <option value="Mixed">Mixed Access</option>
              </select>
            </div>

            {(formData.attendeeType === 'Outside' || formData.attendeeType === 'Mixed') && (
              <div className="guest-manager mt-4">
                <div className="guest-input-row">
                  <input placeholder="Guest Name" value={externalInput.name} onChange={e => setExternalInput({ ...externalInput, name: e.target.value })} />
                  <input placeholder="Affiliation/Role" value={externalInput.info} onChange={e => setExternalInput({ ...externalInput, info: e.target.value })} />
                  <button className="add-guest-btn" onClick={addExternal}>
                    <Plus size={20} />
                  </button>
                </div>
                <div className="guest-scroller mt-4">
                  {formData.externalAttendees.map(g => (
                    <div key={g.id} className="guest-card">
                      <div className="guest-info">
                        <span className="guest-name">{g.name}</span>
                        <span className="guest-meta">{g.info}</span>
                      </div>
                      <button className="remove-guest" onClick={() => removeExternal(g.id)}>
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-footer-premium">
          <button className="btn-tertiary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary-premium ripple" onClick={() => {
            if (!formData.title) return alert("Please enter an activity title");
            onSubmit({ ...formData, id: Date.now() });
          }}>Generate Technical Card</button>
        </div>
      </div>
    </div>
  );
};

const NewMeetingForm = ({ onCancel, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    description: "",
    attendees: [],
    useMeet: true,
    sendEmail: true
  });

  const toggleAttendee = (name) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(name)
        ? prev.attendees.filter(a => a !== name)
        : [...prev.attendees, name]
    }));
  };

  const sortedTeam = [...EBEC_TEAM].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="form-overlay fade-in">
      <div className="premium-form meeting-premium">
        <div className="form-header">
          <div className="header-content">
            <div className="header-meta">
              <span className="status-dot online"></span>
              <span className="meta-text">MEETING SCHEDULER</span>
            </div>
            <h2>New Sync Session</h2>
          </div>
          <button className="close-btn" onClick={onCancel}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="form-body">
          <div className="input-group-premium">
            <input
              type="text"
              placeholder="Session Title"
              className="form-input-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              autoFocus
            />
          </div>

          <div className="time-grid mt-6">
            <div className="datetime-input">
              <span className="input-label">Session Date</span>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="datetime-input">
              <span className="input-label">Start Time</span>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div className="field-group mt-6">
            <label>Notes & Context</label>
            <textarea
              placeholder="What topics will be covered in this meeting?"
              className="premium-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-section-premium mt-8">
            <div className="flex-between items-center mb-4">
              <div className="section-info">
                <label className="section-label mb-0">Team Invitation</label>
                <p className="sub-text">{formData.attendees.length} members selected</p>
              </div>
              <div className="selection-actions">
                <button className="pill-btn" onClick={() => setFormData({ ...formData, attendees: sortedTeam.map(t => t.name) })}>All EBEC</button>
                <button className="pill-btn secondary" onClick={() => setFormData({ ...formData, attendees: [] })}>Clear</button>
              </div>
            </div>

            <div className="modern-attendee-grid">
              {sortedTeam.map(member => (
                <div
                  key={member.name}
                  className={`attendee-item ${formData.attendees.includes(member.name) ? 'selected' : ''}`}
                  onClick={() => toggleAttendee(member.name)}
                >
                  <div className="member-avatar">
                    {getInitials(member.name)}
                    <div className="selection-check">
                      <Check size={12} />
                    </div>
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
              <div className="option-icon meet">
                <Video size={20} />
              </div>
              <div className="option-content">
                <span className="option-title">Google Meet Integration</span>
                <span className="option-desc">Generate a virtual meeting link</span>
              </div>
              <div className={`ios-switch ${formData.useMeet ? 'on' : ''}`}></div>
            </div>

            <div className="option-row" onClick={() => setFormData({ ...formData, sendEmail: !formData.sendEmail })}>
              <div className="option-icon email">
                <Mail size={20} />
              </div>
              <div className="option-content">
                <span className="option-title">Email Invitation</span>
                <span className="option-desc">Notify all attendees via email</span>
              </div>
              <div className={`ios-switch ${formData.sendEmail ? 'on' : ''}`}></div>
            </div>
          </div>
        </div>

        <div className="form-footer-premium">
          <button className="btn-tertiary" onClick={onCancel}>Discard</button>
          <button className="btn-primary-premium ripple" onClick={() => {
            if (!formData.title) return alert("A session title is required");
            onSubmit({ ...formData, id: Date.now() });
          }}>Confirm Sync Session</button>
        </div>
      </div>
    </div>
  );
};

// Notes modal: simple rich-text editor (bold/italic/underline) and save
const MeetingNotesModal = ({ meeting, onClose, onSave }) => {
  const [html, setHtml] = useState(meeting?.notes || "");

  useEffect(() => setHtml(meeting?.notes || ""), [meeting]);

  const exec = (cmd) => {
    document.execCommand(cmd, false);
  };

  return (
    <div className="form-overlay">
      <div className="google-style-form" style={{ maxWidth: 800 }}>
        <div className="form-header">
          <h3>Notes — {meeting?.title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="form-body">
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="quick-btn" onClick={() => exec('bold')}><b>B</b></button>
            <button className="quick-btn" onClick={() => exec('italic')}><i>I</i></button>
            <button className="quick-btn" onClick={() => exec('underline')}><u>U</u></button>
          </div>

          <div
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setHtml(e.currentTarget.innerHTML)}
            className="notes-editor"
            style={{ minHeight: 220, padding: 12, border: '1px solid #eee', borderRadius: 10, marginTop: 8 }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
        <div className="form-footer">
          <button className="btn-form-secondary" onClick={onClose}>Close</button>
          <button className="btn-form-primary" onClick={() => { onSave(meeting.id, html); onClose(); }}>Save Notes</button>
        </div>
      </div>
    </div>
  );
};

// Attendance modal: show selected attendees and allow marking present/absent
const MeetingAttendanceModal = ({ meeting, onClose, onSave }) => {
  const initialList = meeting?.attendees || [];
  const [attendance, setAttendance] = useState(() => {
    const map = {};
    initialList.forEach(n => { map[n] = meeting?.attendance?.[n] || false; });
    return map;
  });

  useEffect(() => {
    const map = {}; (meeting?.attendees || []).forEach(n => map[n] = meeting?.attendance?.[n] || false);
    setAttendance(map);
  }, [meeting]);

  const togglePresent = (name) => {
    setAttendance(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="form-overlay">
      <div className="google-style-form" style={{ maxWidth: 700 }}>
        <div className="form-header">
          <h3>Attendance — {meeting?.title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="form-body">
          <p className="sub-hint">Toggle present attendees and save.</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button className="quick-btn" onClick={() => {
              const all = {};
              (meeting?.attendees || []).forEach(n => all[n] = true);
              setAttendance(all);
            }}>Mark All Present</button>
            <button className="quick-btn secondary" onClick={() => {
              const none = {};
              (meeting?.attendees || []).forEach(n => none[n] = false);
              setAttendance(none);
            }}>Clear</button>
          </div>

          <div style={{ display: 'grid', gap: 8, maxHeight: 320, overflow: 'auto' }}>
            {(meeting?.attendees || []).map(name => (
              <label key={name} className="attendee-pill" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {attendance[name] ? <Check /> : <span style={{ opacity: 0.4 }}>—</span>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{name}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{(EBEC_TEAM.find(t => t.name === name)?.role) || ''}</div>
                  </div>
                </div>
                <input type="checkbox" checked={!!attendance[name]} onChange={() => togglePresent(name)} />
              </label>
            ))}
          </div>
        </div>
        <div className="form-footer">
          <button className="btn-form-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-form-primary" onClick={() => { onSave(meeting.id, attendance); onClose(); }}>Save Attendance</button>
        </div>
      </div>
    </div>
  );
};

const Home = ({ setPage, refNum, setRefNum, meetings, techCards, onDeleteMeeting, onDeleteTechCard, onSaveMeetingNotes, onSaveMeetingAttendance }) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [activeCard, setActiveCard] = useState(0);

  const phrases = [
    "SG? No, DIVA!",
    "SG? No, QUEEN!",
    "Ready to SG the world!",
    "EBEC SG!",
    "SG controlling the world",
    "A7san SG",
    "Administering with Elegance.",
    "The Hub. The Heart. The SG.",
    "Lead. Organize. Conquer.",
    "SECRETARY GENERAL WHOOO",
    "SG li al3alamyaaa!",
    "Empire built on Reports."
  ];

  useEffect(() => {
    const handleTyping = () => {
      const currentPhrase = phrases[phraseIndex];
      if (isDeleting) {
        setDisplayText(currentPhrase.substring(0, displayText.length - 1));
        setTypingSpeed(50);
      } else {
        setDisplayText(currentPhrase.substring(0, displayText.length + 1));
        setTypingSpeed(150);
      }
      if (!isDeleting && displayText === currentPhrase) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    };
    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex]);

  const cards = [
    {
      title: "Add New Meeting",
      subtitle: "Sync with board members",
      icon: <Plus size={48} />,
      action: () => setPage('new-meeting'),
    },
    {
      title: "Add Technical Card",
      subtitle: "Update logistics & materials",
      icon: <Plus size={48} />,
      action: () => setPage('new-tech-card'),
    },
    {
      title: "Reference Tracker",
      subtitle: `Next Ref: #${refNum}`,
      icon: <Hash size={48} />,
      action: () => setRefNum(prompt("Update Reference Number Basis (e.g. 01):", refNum.split('/')[0])),
    },
    {
      title: "See Archive",
      subtitle: "View past documentation",
      icon: <ArchiveIcon size={48} />,
      action: () => setPage('archive'),
    }
  ];

  const nextCard = () => setActiveCard((prev) => (prev + 1) % cards.length);
  const prevCard = () => setActiveCard((prev) => (prev - 1 + cards.length) % cards.length);

  const [openNotesFor, setOpenNotesFor] = useState(null);
  const [openAttendanceFor, setOpenAttendanceFor] = useState(null);

  const openNotes = (id) => setOpenNotesFor(id);
  const openAttendance = (id) => setOpenAttendanceFor(id);

  return (
    <>
      <div className="hero fade-in">
        <div className="phrase-container">
          <h1 className="typing-display">
            {displayText}<span className="cursor">|</span>
          </h1>
        </div>

        <p className="description">What's on the mind of the SG today?</p>

        <div className="carousel-container">
          <button className="nav-arrow" onClick={prevCard}><ChevronLeft size={32} /></button>

          <div className="main-focus-card">
            <div className="card-content-wrap">
              <h2 className="card-main-title">{cards[activeCard].title}</h2>
              <p className="card-subtitle">{cards[activeCard].subtitle}</p>

              <button className="main-plus-btn" onClick={cards[activeCard].action}>
                {cards[activeCard].icon}
              </button>
            </div>
          </div>

          <button className="nav-arrow" onClick={nextCard}><ChevronRight size={32} /></button>
        </div>

        <div className="card-indicators">
          {cards.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${activeCard === idx ? 'active' : ''}`}
              onClick={() => setActiveCard(idx)}
            />
          ))}
        </div>

        {/* Quick summary / actions under the main card for faster UX */}
        <div className="quick-summary">
          <div className="stat-card">
            <div className="stat-value">{meetings.length}</div>
            <div className="stat-label">Meetings</div>
            <div className="stat-note">Upcoming & recent</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{techCards.length}</div>
            <div className="stat-label">Technical Cards</div>
            <div className="stat-note">Ongoing activities</div>
          </div>

          <div className="stat-card action-card">
            <div className="stat-value">+</div>
            <div className="stat-label">Quick Actions</div>
            <div className="stat-note">Create meeting or card</div>
            <div className="quick-actions">
              <button className="quick-btn" onClick={() => setPage('new-meeting')}>New Meeting</button>
              <button className="quick-btn secondary" onClick={() => setPage('new-tech-card')}>New Card</button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Meetings Section */}
      <section className="mgmt-section">
        <div className="mgmt-content">
          <div className="mgmt-header-block flex-between">
            <div>
              <h2 className="mgmt-heading">Upcoming & Recent Meetings</h2>
              <p className="mgmt-sub">Manage documentation and attendance</p>
            </div>
            <button className="btn-icon-plus" onClick={() => setPage('new-meeting')}>
              <Plus size={20} /> New Meeting
            </button>
          </div>

          <div className="meetings-list">
            {meetings.length === 0 ? (
              <div className="empty-state">
                <p>No meetings scheduled yet.</p>
                <button className="cta" onClick={() => setPage('new-meeting')}>Create first meeting</button>
              </div>
            ) : (
              meetings.map(m => (
                <div className="meeting-card fade-in" key={m.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div className="meeting-main-info">
                      <div className="meeting-date-pill">
                        <span className="m-day">{m.date?.split('-')[2] || '--'}</span>
                        <span className="m-month">{m.date?.split('-')[1] || '??'}</span>
                      </div>
                      <div className="meeting-details">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <h3 style={{ margin: 0 }}>{m.title}</h3>
                          <div className="card-actions-inline">
                            <button className="action-btn" onClick={() => openAttendance(m.id)} title="Attendance"><UserCheck size={14} /> <span style={{ fontSize: 12 }}>Attendance</span></button>
                            <button className="action-btn" onClick={() => openNotes(m.id)} title="Notes"><Clipboard size={14} /> <span style={{ fontSize: 12 }}>Notes</span></button>
                            <button className="action-btn report" onClick={() => alert(`Report for ${m.title}`)} title="Report"><FileText size={14} /> <span style={{ fontSize: 12 }}>Report</span></button>
                          </div>
                        </div>
                        <p>{m.time} • {m.attendees.length} Attendees {m.attendance ? `• ${Object.values(m.attendance).filter(Boolean).length} present` : ''}</p>
                        {(m.description || m.notes) && <p className="meet-desc">{(m.description || '').slice(0, 140)}{m.notes ? ' — (notes saved)' : ''}</p>}
                        <div className="avatar-list">
                          {(m.attendees || []).slice(0, 4).map(a => (
                            <div className="avatar" title={a} key={a}>{getInitials(a)}</div>
                          ))}
                          {(m.attendees || []).length > 4 && <div className="avatar">+{(m.attendees || []).length - 4}</div>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button className="action-btn danger" onClick={() => {
                        if (window.confirm(`Delete meeting \"${m.title}\"? This cannot be undone.`)) {
                          onDeleteMeeting && onDeleteMeeting(m.id);
                        }
                      }} title="Delete"><Trash size={14} /> <span style={{ fontSize: 12 }}>Delete</span></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Technical Card Tracking Section */}
          <div className="mgmt-header-block flex-between mt-12">
            <div>
              <h2 className="mgmt-heading">Technical Card Tracking</h2>
              <p className="mgmt-sub">Activity agendas, objectives, and sponsors</p>
            </div>
            <button className="btn-icon-plus" onClick={() => setPage('new-tech-card')}>
              <Plus size={20} /> New Card
            </button>
          </div>

          <div className="tech-cards-list">
            {techCards.length === 0 ? (
              <div className="empty-state">
                <p>No technical cards active. Start tracking an activity!</p>
                <button className="cta" onClick={() => setPage('new-tech-card')}>Create first card</button>
              </div>
            ) : (
              techCards.map(tc => (
                <div className="meeting-card tech-card-item fade-in" key={tc.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div className="meeting-main-info">
                      <div className="meeting-date-pill tech-pill">
                        <Hash size={16} />
                        <span className="m-month" style={{ fontSize: '9px' }}>{tc.reference}</span>
                      </div>
                      <div className="meeting-details">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <h3 style={{ margin: 0 }}>{tc.title}</h3>
                          <span className={`status-pill ${tc.isSponsored ? 'gold' : ''}`}>
                            {tc.isSponsored ? 'Sponsored' : 'General'}
                          </span>
                          <div className="card-actions-inline">
                            <button className="action-btn" onClick={() => alert(`Reviewing agenda for: ${tc.agenda}`)} title="Agenda"><Clipboard size={14} /> <span style={{ fontSize: 12 }}>Agenda</span></button>
                            <button className="action-btn" onClick={() => alert(`Resources needed: ${tc.needs}`)} title="Needs"><Package size={14} /> <span style={{ fontSize: 12 }}>Needs</span></button>
                            <button className="action-btn report" onClick={() => alert(`Reference Doc for ${tc.reference}`)} title="Full Doc"><FileText size={14} /> <span style={{ fontSize: 12 }}>Full Doc</span></button>
                          </div>
                        </div>
                        <p className="theme-text">Theme: {tc.theme} • {tc.duration}</p>
                        <div className="meet-desc">{tc.agenda?.slice(0, 120)}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button className="action-btn danger" onClick={() => {
                        if (window.confirm(`Delete technical card \"${tc.title}\"? This cannot be undone.`)) {
                          onDeleteTechCard && onDeleteTechCard(tc.id);
                        }
                      }} title="Delete"><Trash size={14} /> <span style={{ fontSize: 12 }}>Delete</span></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="action-row" style={{ marginTop: '40px' }}>
            <button className="mgmt-btn secondary">Sync Google Drive</button>
            <button className="mgmt-btn primary" onClick={() => setPage('archive')}>Full Archive</button>
          </div>
        </div>
      </section>
      {openNotesFor && (
        <MeetingNotesModal
          meeting={meetings.find(m => m.id === openNotesFor)}
          onClose={() => setOpenNotesFor(null)}
          onSave={onSaveMeetingNotes}
        />
      )}

      {openAttendanceFor && (
        <MeetingAttendanceModal
          meeting={meetings.find(m => m.id === openAttendanceFor)}
          onClose={() => setOpenAttendanceFor(null)}
          onSave={onSaveMeetingAttendance}
        />
      )}
    </>
  );
};

const Archive = () => (
  <div className="dashboard-content fade-in">
    <h2 className="section-title" style={{ color: '#fff', fontSize: '32px', marginBottom: '20px' }}>Meeting Archive</h2>
    <div className="glass-panel-wide">
      <p style={{ opacity: 0.8, color: '#fff', marginBottom: '20px' }}>Historical records synced from drive...</p>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div className="list-item" key={i}>
          <div>
            <span className="date">Feb {10 - i}, 2026</span>
            <p className="meet-title">Executive Board Sync Session {i}</p>
          </div>
          <span className="tag">#EBEC-2026-ADM-02{i}</span>
        </div>
      ))}
    </div>
  </div>
);

const SGProof = ({ onVerify }) => {
  const [answer, setAnswer] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = () => {
    if (answer.toLowerCase().trim() === 'momtaz') {
      onVerify(true);
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 3000);
    }
  };

  return (
    <div className="proof-overlay bubble-theme fade-in">
      <div className="bubble bubble-1"></div>
      <div className="bubble bubble-2"></div>
      <div className="bubble bubble-3"></div>

      <div className={`glass-card-proof bubble-card ${isError ? 'shake' : ''}`}>
        <h2 className="proof-heading">Are you the SG of EBEC?</h2>
        <p className="proof-subtext">Proof that & gain access to the Secretary Portal.</p>

        <div className="question-box">
          <label>What is the famous word that the SG says?</label>
          <div className="input-field-wrapper mt-4">
            <input
              type="text"
              placeholder="Your answer..."
              className="premium-input proof-input classy-input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>
        </div>

        {isError && (
          <div className="error-message-sg fade-in">
            <p className="big-error">YOU ARE NOOOT THE SG!!!!</p>
            <p className="small-error">Why do you want to access the EBEC SG panel??</p>
          </div>
        )}

        <button className="btn-primary-premium ripple w-full mt-8 classy-btn" onClick={handleSubmit}>
          Verify Identity
        </button>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="footer-premium">
    <div className="footer-glass">
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo-circle small-logo">
              <img src={ebecLogo} alt="Logo" className="footer-logo-img" />
            </div>
            <span className="brand-name">EBEC Admin Hub</span>
          </div>
          <div className="footer-links">
            <span>Help Center</span>
            <span>Privacy Policy</span>
            <span>Contact Tech Team</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 EBEC Secretary General Administration. Built for Excellence.</p>
          <div className="social-dots">
            <div className="social-dot"></div>
            <div className="social-dot"></div>
            <div className="social-dot"></div>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [page, setPage] = useState('home');
  const [refCounter, setRefCounter] = useState(1);
  const currentRef = `${String(refCounter).padStart(2, '0')}/26`;

  const [meetings, setMeetings] = useState([
    {
      id: 1,
      title: "Board Weekly Sync",
      date: "2026-02-15",
      time: "18:00",
      attendees: ["Enzo Chaabnia", "Boucekkine Oumaima", "Leena IKHLEF"],
      description: "Standard weekly synchronization."
    }
  ]);

  const [techCards, setTechCards] = useState([
    {
      id: 101,
      title: "Arduino Workshop",
      theme: "Electronics",
      duration: "3 Hours",
      reference: "01/26",
      isSponsored: true,
      sponsorName: "TechCorp",
      agenda: "1. Intro, 2. Circuit building, 3. Coding",
      needs: "20 Arduinos, 40 LEDs, Breadboards"
    }
  ]);

  const handleAddMeeting = (newMeeting) => {
    setMeetings([newMeeting, ...meetings]);
    setPage('home');
  };

  const handleAddTechCard = (newCard) => {
    setTechCards([newCard, ...techCards]);
    setRefCounter(prev => prev + 1);
    setPage('home');
  };

  const handleDeleteMeeting = (id) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  const handleDeleteTechCard = (id) => {
    setTechCards(prev => prev.filter(tc => tc.id !== id));
  };

  const handleSaveMeetingNotes = (meetingId, html) => {
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, notes: html } : m));
  };

  const handleSaveMeetingAttendance = (meetingId, attendance) => {
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, attendance: { ...m.attendance, ...attendance } } : m));
  };

  return (
    <div className="apple-bg">
      <style>{`
        :root {
          --apple-blue: #0071e3;
          --google-blue: #4285f4;
          --ebec-navy: #1D355E;
          --ebec-gold: #FFC107;
          --off-white: #f5f5f7;
          --glass-bg: rgba(255, 255, 255, 0.75);
          --glass-border: rgba(255, 255, 255, 0.4);
          --shadow-premium: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          --system-font: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif;
        }

        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        
        body { margin: 0; font-family: var(--system-font); background: #000; overflow-x: hidden; }

        .apple-bg {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: #0c1a33;
          background-image: 
            radial-gradient(at 0% 0%, rgba(255, 193, 7, 0.4) 0px, transparent 65%),
            radial-gradient(at 100% 0%, rgba(0, 113, 227, 0.4) 0px, transparent 65%),
            radial-gradient(at 50% 100%, rgba(29, 53, 94, 0.8) 0px, transparent 75%);
          background-attachment: fixed;
          background-size: cover;
        }

        /* --- Dashboard Hero & Stats --- */
        .hero { margin-top: 2vh; text-align: center; width: 100%; padding-bottom: 60px; }
        .phrase-container { height: 140px; display: flex; align-items: center; justify-content: center; }
        .typing-display { font-size: 64px; font-weight: 800; letter-spacing: -3px; color: #fff; margin: 0; }
        .cursor { color: var(--ebec-gold); animation: blink 0.8s infinite; }
        .description { color: #fff; font-size: 22px; margin-bottom: 40px; }
        @keyframes blink { 50% { opacity: 0; } }

        .carousel-container { display: flex; align-items: center; gap: 30px; width: 100%; max-width: 900px; margin: 0 auto; justify-content: center; }
        .nav-arrow { background: rgba(255,255,255,0.1); border: none; color: #fff; width: 60px; height: 60px; border-radius: 50%; cursor: pointer; backdrop-filter: blur(10px); }
        .main-focus-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(60px); padding: 40px; border-radius: 48px; width: 440px; min-height: 320px; box-shadow: 0 50px 100px rgba(0,0,0,0.3); border: 1px solid rgba(255, 255, 255, 0.15); }
        .card-main-title { font-size: 36px; font-weight: 800; color: #fff; margin: 0; text-align: center; }
        .card-subtitle { font-size: 17px; color: #fff; opacity: 0.7; margin: 12px 0 32px 0; text-align: center; }
        .main-plus-btn { background: #fff; color: var(--ebec-navy); width: 80px; height: 80px; border-radius: 50%; border: none; cursor: pointer; display: block; margin: 0 auto; transition: 0.3s; font-size: 32px; font-weight: 300; }
        .main-plus-btn:hover { transform: scale(1.1); background: var(--ebec-gold); }

        .dot { width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.3); border: none; margin: 0 5px; cursor: pointer; }
        .dot.active { background: #fff; width: 32px; border-radius: 10px; }

        .quick-summary { display:flex; gap:16px; justify-content:center; margin-top:18px; max-width:900px; margin-left:auto; margin-right:auto; }
        .stat-card { background: rgba(255,255,255,0.06); border-radius:14px; padding:18px 22px; min-width:150px; color:#fff; text-align:center; box-shadow: 0 6px 20px rgba(0,0,0,0.18); border:1px solid rgba(255,255,255,0.04); }
        .stat-value { font-size:28px; font-weight:900; color:var(--ebec-gold); }
        .stat-label { font-size:13px; margin-top:6px; color:#dfe7ff; font-weight:800; }
        .stat-note { font-size:12px; color:rgba(255,255,255,0.6); margin-top:6px; }

        /* --- Management Sections --- */
        .mgmt-section { width: 100%; background: var(--off-white); padding: 80px 40px; border-radius: 60px 60px 0 0; display: flex; justify-content: center; }
        .mgmt-content { max-width: 1200px; width: 100%; }
        .mgmt-header-block { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
        .mgmt-heading { font-size: 32px; font-weight: 800; color: var(--ebec-navy); margin: 0; }
        .mgmt-sub { font-size: 18px; color: #666; margin: 5px 0 0 0; }
        .btn-icon-plus { background: var(--ebec-navy); color: #fff; border: none; padding: 14px 28px; border-radius: 100px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
        .btn-icon-plus:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(29, 53, 94, 0.2); }

        /* --- Card Lists --- */
        .meetings-list, .tech-cards-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; margin-top: 24px; }
        .meeting-card { background: #fff; border-radius: 24px; padding: 24px; display: flex; flex-direction: column; gap:16px; border: 1px solid rgba(0,0,0,0.05); transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        .meeting-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
        
        .meeting-main-info { display: flex; align-items: flex-start; gap: 16px; flex: 1; min-width: 0; }
        .meeting-date-pill { background: #f0f4f8; border-radius: 18px; padding: 12px; width: 64px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; }
        .meeting-date-pill.tech-pill { background: #fff8e1; }
        .m-day { font-size: 22px; font-weight: 900; color: var(--ebec-navy); }
        .m-month { font-size: 11px; font-weight: 800; color: var(--apple-blue); text-transform: uppercase; }
        
        .meeting-details { flex: 1; min-width: 0; }
        .meeting-details h3 { margin: 0; font-size: 19px; color: #1d1d1f; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .meeting-details p { margin: 6px 0 0 0; font-size: 14px; color: #666; }
        .meet-desc { color:#555; font-size:14px; line-height: 1.5; margin-top: 10px; }

        .avatar-list { display:flex; gap:8px; margin-top:12px; }
        .avatar { width:34px; height:34px; border-radius:10px; background:#f0f0f2; display:flex; align-items:center; justify-content:center; font-weight:800; color: #1d1d1f; font-size:11px; border: 1px solid rgba(0,0,0,0.05); }
        .theme-text { color: var(--apple-blue); font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 4px 0; }

        .card-actions-inline { display:flex; flex-wrap: wrap; gap:8px; margin-top: 12px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.04); }
        .action-btn { background: #f5f5f7; border: none; padding: 8px 14px; border-radius: 10px; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #555; cursor: pointer; transition: 0.2s; }
        .action-btn:hover { background: #e8e8ed; color: #000; }
        .action-btn.report { background: rgba(255, 193, 7, 0.1); color: #d68100; }
        .action-btn.danger { color: #ff3b30; background: rgba(255, 59, 48, 0.05); }
        .action-btn.danger:hover { background: #ff3b30; color: #fff; }

        .status-pill { padding: 4px 10px; border-radius: 100px; font-size: 10px; font-weight: 800; background: #eee; color: #888; text-transform: uppercase; }
        .status-pill.gold { background: var(--ebec-gold); color: #000; }

        .empty-state { text-align: center; padding: 60px; background: #fff; border-radius: 32px; border: 2px dashed rgba(0,0,0,0.05); grid-column: 1 / -1; }
        .empty-state p { font-size: 18px; color: #888; margin-bottom: 24px; font-weight: 600; }
        .cta { background: var(--apple-blue); color: #fff; border: none; padding: 14px 28px; border-radius: 100px; font-weight: 800; cursor: pointer; transition: 0.3s; }
        .cta:hover { transform: scale(1.05); box-shadow: 0 10px 20px rgba(0, 113, 227, 0.2); }

        .action-row { display: flex; gap: 16px; justify-content: center; }
        .mgmt-btn { border: none; padding: 16px 32px; border-radius: 100px; font-weight: 800; font-size: 16px; cursor: pointer; transition: 0.2s; }
        .mgmt-btn.primary { background: #000; color: #fff; }
        .mgmt-btn.secondary { background: #fff; color: #000; border: 2px solid #000; }
        .mgmt-btn:hover { transform: translateY(-3px); }

        /* --- Global Form Styles (Premium) --- */
        .form-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .premium-form {
          background: var(--glass-bg);
          width: 100%;
          max-width: 720px;
          height: auto;
          max-height: 90vh;
          border-radius: 36px;
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow-premium);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .form-header { padding: 32px 40px; display: flex; justify-content: space-between; align-items: flex-start; }
        .header-content { display: flex; flex-direction: column; }
        .header-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-dot.online { background: #34c759; box-shadow: 0 0 10px rgba(52, 199, 89, 0.5); }
        .meta-text { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #888; text-transform: uppercase; }
        .ref-tag { font-size: 11px; font-weight: 800; background: #000; color: #fff; padding: 4px 10px; border-radius: 100px; display: inline-block; }
        .form-header h2 { margin: 0; font-size: 32px; font-weight: 800; color: #1d1d1f; letter-spacing: -0.5px; }
        .close-btn { background: rgba(0,0,0,0.05); border: none; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; color: #555; font-size: 24px; line-height: 1; }
        .close-btn:hover { background: rgba(0,0,0,0.1); transform: rotate(90deg); color: #000; }

        .form-body { padding: 0 40px 40px 40px; overflow-y: auto; flex: 1; }
        .input-group-premium { margin-bottom: 24px; }
        .form-input-title { width: 100%; background: transparent; border: none; border-bottom: 2px solid rgba(0,0,0,0.05); padding: 12px 0; font-size: 36px; font-weight: 800; color: #1d1d1f; outline: none; transition: 0.3s; }
        .form-input-title:focus { border-color: var(--apple-blue); }
        .form-input-title::placeholder { color: rgba(0,0,0,0.15); }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .field-group { display: flex; flex-direction: column; gap: 8px; }
        .field-group label { font-size: 13px; font-weight: 700; color: #1d1d1f; margin-left: 12px; }
        .premium-input, .premium-textarea, .premium-select { background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; padding: 16px; font-size: 16px; color: #1d1d1f; outline: none; transition: all 0.3s ease; }
        .premium-input:focus, .premium-textarea:focus, .premium-select:focus { border-color: var(--apple-blue); box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1); background: #fff; }
        .gold-focus:focus { border-color: var(--ebec-gold); box-shadow: 0 0 0 4px rgba(255, 193, 7, 0.1); }
        .premium-textarea { height: 120px; resize: none; line-height: 1.5; }

        .form-section-premium { margin-top: 32px; padding-top: 32px; border-top: 1px solid rgba(0,0,0,0.05); }
        .section-label { font-size: 15px; font-weight: 800; color: #1d1d1f; display: block; margin-bottom: 16px; letter-spacing: -0.2px; }
        .segmented-control { display: flex; background: rgba(0,0,0,0.05); padding: 4px; border-radius: 14px; gap: 4px; }
        .segment-btn { flex: 1; border: none; background: transparent; padding: 10px; font-size: 14px; font-weight: 700; color: #888; border-radius: 10px; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
        .segment-btn.active { background: #fff; color: #1d1d1f; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

        .time-row, .time-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .datetime-input { display: flex; flex-direction: column; gap: 6px; }
        .input-label { font-size: 12px; font-weight: 700; color: #888; margin-left: 4px; }
        .datetime-input input { background: rgba(0,0,0,0.03); border: none; padding: 14px; border-radius: 12px; font-size: 14px; font-weight: 600; outline: none; }

        .switch-row { display: flex; justify-content: space-between; align-items: center; background: rgba(255,193,7,0.05); padding: 20px; border-radius: 20px; cursor: pointer; transition: 0.2s; }
        .switch-row:hover { background: rgba(255,193,7,0.1); }
        .switch-info label { font-size: 16px; font-weight: 800; display: block; }
        .switch-info p { font-size: 13px; color: #666; margin: 4px 0 0 0; }
        .ios-switch { width: 52px; height: 32px; background: #e9e9eb; border-radius: 100px; position: relative; transition: background 0.3s; }
        .ios-switch::before { content: ''; position: absolute; width: 28px; height: 28px; background: #fff; border-radius: 50%; top: 2px; left: 2px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .ios-switch.on { background: #34c759; }
        .ios-switch.on::before { transform: translateX(20px); }

        .form-footer-premium { padding: 32px 40px; background: rgba(255,255,255,0.4); backdrop-filter: blur(20px); display: flex; justify-content: flex-end; gap: 16px; border-top: 1px solid rgba(0,0,0,0.05); }
        .btn-tertiary { background: transparent; border: none; color: #555; font-size: 16px; font-weight: 700; cursor: pointer; padding: 12px 24px; }
        .btn-primary-premium { background: #000; color: #fff; border: none; padding: 14px 28px; border-radius: 16px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 8px 16px rgba(0,0,0,0.15); }
        .btn-primary-premium:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.2); }

        .modern-attendee-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; max-height: 280px; overflow-y: auto; padding-right: 10px; }
        .attendee-item { background: #fff; border: 1px solid rgba(0,0,0,0.05); padding: 12px; border-radius: 18px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all 0.2s; }
        .attendee-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .attendee-item.selected { border-color: var(--apple-blue); background: rgba(0, 113, 227, 0.04); }
        .member-avatar { width: 40px; height: 40px; border-radius: 14px; background: #f0f0f2; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: #1d1d1f; position: relative; }
        .selection-check { position: absolute; bottom: -4px; right: -4px; background: var(--apple-blue); color: #fff; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; opacity: 0; transform: scale(0.5); transition: 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
        .selected .selection-check { opacity: 1; transform: scale(1); }
        .member-info { display: flex; flex-direction: column; overflow: hidden; }
        .member-name { font-size: 14px; font-weight: 800; color: #1d1d1f; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
        .member-role { font-size: 11px; color: #888; font-weight: 600; }
        .pill-btn { background: rgba(0,0,0,0.05); border: none; padding: 8px 16px; border-radius: 100px; font-size: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; }
        .pill-btn:hover { background: #000; color: #fff; }

        .options-panel { background: rgba(0,0,0,0.03); border-radius: 24px; padding: 8px; display: flex; flex-direction: column; gap: 4px; }
        .option-row { display: flex; align-items: center; padding: 16px; border-radius: 18px; cursor: pointer; transition: 0.2s; }
        .option-row:hover { background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
        .option-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-right: 16px; }
        .option-icon.meet { background: rgba(52, 199, 89, 0.1); color: #28a745; }
        .option-icon.email { background: rgba(0, 113, 227, 0.1); color: #0071e3; }
        .option-content { flex: 1; }
        .option-title { display: block; font-size: 15px; font-weight: 800; color: #1d1d1f; }
        .option-desc { font-size: 12px; color: #666; }

        /* --- Archive & Detailed Lists --- */
        .dashboard-content { max-width: 1000px; width: 100%; margin: 40px auto; padding: 20px; }
        .glass-panel-wide { background: rgba(255,255,255,0.1); backdrop-filter: blur(40px); border-radius: 32px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
        .list-item { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 20px; margin-bottom: 12px; transition: 0.2s; }
        .list-item:hover { background: rgba(255,255,255,0.1); transform: translateX(10px); }
        .list-item .date { font-size: 13px; color: var(--ebec-gold); font-weight: 800; display: block; margin-bottom: 4px; }
        .list-item .meet-title { font-size: 18px; font-weight: 700; color: #fff; margin:0; }
        .list-item .tag { background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 100px; color: #fff; font-size: 11px; font-weight: 800; }

        /* --- Global Utilities --- */
        .glass-nav { background: rgba(255, 255, 255, 0.1) !important; border-color: rgba(255, 255, 255, 0.1) !important; }
        .nav-links span { color: #fff !important; }
        .fade-in { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .flex-between { display: flex; justify-content: space-between; }
        .items-center { align-items: center; }
        .mt-4 { margin-top: 16px; }
        .mt-6 { margin-top: 24px; }
        .mt-8 { margin-top: 32px; }
        .mt-10 { margin-top: 40px; }
        .mt-12 { margin-top: 48px; }
        .mb-0 { margin-bottom: 0; }
        .mb-4 { margin-bottom: 16px; }
        .pb-10 { padding-bottom: 40px; }
        .mt-3 { margin-top: 12px; }
        .w-full { width: 100%; }

        /* --- Identity Proof Page (Apple Bubble Theme) --- */
        .proof-overlay.bubble-theme { 
            position: fixed; inset: 0; 
            background: #0c1a33; 
            background: radial-gradient(circle at 20% 30%, rgba(0, 113, 227, 0.4) 0%, transparent 40%),
                        radial-gradient(circle at 80% 70%, rgba(255, 193, 7, 0.3) 0%, transparent 40%),
                        linear-gradient(135deg, #0c1a33 0%, #1D355E 100%);
            display: flex; align-items: center; justify-content: center; z-index: 20000; 
            overflow: hidden;
        }
        .bubble { position: absolute; border-radius: 50%; filter: blur(40px); opacity: 0.5; animation: float 15s infinite ease-in-out; }
        .bubble-1 { width: 300px; height: 300px; background: var(--apple-blue); top: -100px; left: -50px; }
        .bubble-2 { width: 250px; height: 250px; background: var(--ebec-gold); bottom: -50px; right: -50px; animation-delay: -5s; }
        .bubble-3 { width: 400px; height: 400px; background: rgba(29, 53, 94, 0.6); top: 50%; left: 60%; animation-delay: -2s; }
        @keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -50px); } }

        .bubble-card { 
            background: rgba(255, 255, 255, 0.1); 
            backdrop-filter: blur(40px); 
            padding: 60px; 
            border-radius: 60px; 
            width: 500px; 
            text-align: center; 
            border: 1px solid rgba(255, 255, 255, 0.15); 
            box-shadow: 0 40px 100px rgba(0,0,0,0.4);
            z-index: 10;
        }
        .proof-heading { color: #fff; font-size: 32px; font-weight: 800; margin-bottom: 12px; letter-spacing: -1px; }
        .proof-subtext { color: rgba(255, 255, 255, 0.7); font-size: 16px; margin-bottom: 40px; }
        .question-box label { color: #fff; font-size: 18px; font-weight: 600; display: block; margin-bottom: 15px; }
        .classy-input { 
            background: rgba(255, 255, 255, 0.1) !important; 
            border: 1px solid rgba(255, 255, 255, 0.2) !important; 
            color: #fff !important; 
            text-align: center; 
            font-size: 22px !important; 
            letter-spacing: 1px; 
            border-radius: 24px !important;
            padding: 20px !important;
        }
        .classy-input:focus { border-color: var(--ebec-gold) !important; background: rgba(255,255,255,0.15) !important; box-shadow: 0 0 20px rgba(255, 193, 7, 0.2) !important; }
        .classy-btn { background: #fff !important; color: #000 !important; font-size: 18px !important; padding: 18px !important; border-radius: 24px !important; }

        .error-message-sg { margin-top: 25px; padding: 20px; background: rgba(255, 59, 48, 0.15); border-radius: 20px; border: 1px solid rgba(255, 59, 48, 0.3); }
        .big-error { color: #ff3b30; font-size: 18px; font-weight: 900; margin: 0; text-transform: uppercase; }
        .small-error { color: rgba(255, 59, 48, 0.8); font-size: 14px; margin: 8px 0 0 0; font-weight: 600; }
        .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }

        /* --- Footer Styles (Matching Top) --- */
        .footer-premium { background: var(--ebec-navy); width: 100%; border-top: 1px solid rgba(255,255,255,0.05); }
        .footer-glass { 
            padding: 100px 40px 60px 40px; 
            background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.4));
            backdrop-filter: blur(10px);
        }
        .footer-content { max-width: 1200px; margin: 0 auto; }
        .footer-top { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 50px; }
        .footer-brand { display: flex; align-items: center; gap: 20px; }
        .small-logo { width: 50px; height: 50px; background: #fff !important; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .footer-logo-img { width: 80%; height: 80%; object-fit: contain; }
        .brand-name { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -1px; }
        .footer-links { display: flex; gap: 40px; }
        .footer-links span { font-size: 15px; color: rgba(255,255,255,0.6); cursor: pointer; transition: 0.3s; font-weight: 600; }
        .footer-links span:hover { color: var(--ebec-gold); }
        .footer-bottom { padding-top: 50px; display: flex; justify-content: space-between; align-items: center; }
        .footer-bottom p { font-size: 14px; color: rgba(255,255,255,0.4); font-weight: 500; }
        .social-dots { display: flex; gap: 12px; }
        .social-dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); }

        /* --- Header Adjustments --- */
        .logo-circle { width: 40px; height: 40px; background: #fff !important; overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 0 !important; cursor: pointer; border-radius: 50%; border: 2px solid rgba(255,255,255,0.1); }
        .header-logo { width: 90%; height: 90%; object-fit: contain; border-radius: 50%; }
        .sign-out-btn { background: #fff !important; color: #000 !important; border: 1px solid rgba(255,255,255,0.2) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: 0.2s; height: 40px; display: flex; align-items: center; }
        .sign-out-btn:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 8px 16px rgba(0,0,0,0.15); background: #f5f5f7 !important; }


      `}</style>

      <nav className="glass-nav">
        <div className="logo-circle" onClick={() => setPage('home')}>
          <img src={ebecLogo} alt="EBEC" className="header-logo" />
        </div>
        <div className="nav-links">
          <span onClick={() => setPage('home')}>Home</span>
          <span>Activities</span>
          <span>Attendance</span>
          <span onClick={() => setPage('archive')}>Archive</span>
        </div>
        <button className="sign-out-btn" onClick={() => setPage('proving-sg')}>Sign Out</button>
      </nav>

      {page === 'home' && (
        <Home
          setPage={setPage}
          refNum={currentRef}
          setRefNum={(val) => setRefCounter(parseInt(val) || refCounter)}
          meetings={meetings}
          techCards={techCards}
          onDeleteMeeting={handleDeleteMeeting}
          onDeleteTechCard={handleDeleteTechCard}
          onSaveMeetingNotes={handleSaveMeetingNotes}
          onSaveMeetingAttendance={handleSaveMeetingAttendance}
        />
      )}

      {page === 'new-meeting' && (
        <NewMeetingForm onCancel={() => setPage('home')} onSubmit={handleAddMeeting} />
      )}

      {page === 'new-tech-card' && (
        <NewTechnicalCardForm
          onCancel={() => setPage('home')}
          onSubmit={handleAddTechCard}
          currentRef={currentRef}
        />
      )}

      {page === 'archive' && <Archive />}

      {page === 'proving-sg' && (
        <SGProof onVerify={(success) => {
          if (success) {
            setPage('home');
          }
        }} />
      )}

      <Footer />
    </div>
  );
}
