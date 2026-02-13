import React, { useState, useEffect, useRef } from 'react';
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
const Copy = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);
const ExternalLink = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
);
const Layout = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
);
const Edit3 = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
);
const Search = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const User = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
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
  { name: "Oumaima Boucekkine", role: "Vice President" },
  { name: "Berbaoui Ashref Abderrahmane", role: "Vice President" },
  { name: "Leena IKHLEF", role: "Secretary General" },
  { name: "Dorsaf Messaoudi", role: "Relations and Communications" },
  { name: "Maissa Lakel", role: "Relex department" },
  { name: "Khoumari Aya", role: "Co-Manager in Relex" },
  { name: "Mouhsine Abdelhakim Alouit", role: "Finance department" },
  { name: "Benzergua Djihene Chaimaa", role: "Finance & Legal Manager" },
  { name: "HACENE Serine Nour el Imane", role: "Finance & Legal Manager" },
  { name: "Youcef Belaib", role: "Co-manager Finance" },
  { name: "Takoua", role: "Co-design manager" },
  { name: "Maria Ines Raheb", role: "Design Co-manager" },
  { name: "Sara BENALI", role: "Design Co-manager" },
  { name: "BEKHEDDA Asma", role: "Co-ManagerDesign" },
  { name: "AMEZIANE Yani", role: "IT Manager" },
  { name: "Zineb Bouchaib", role: "Media & Marketing" },
  { name: "AHSATAL Imed Eddine", role: "Media & Marketing" },
  { name: "DJOUBANI Sarah", role: "Marketing Co-Manager" },
  { name: "Oussama Bouzaine", role: "HR" },
  { name: "Salah Badreddin", role: "HR Manager" },
  { name: "Sanna toutah", role: "Logistic Department" },
  { name: "Maroua Bouzira", role: "Events and logistics" },
  { name: "Mouhoun Cilia", role: "Events Logistics Co-manager" },
  { name: "Tazgart Kaouther", role: "Event Co-manager" },
  { name: "Wissal Oulem", role: "Project Manager" },
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
  const [searchQuery, setSearchQuery] = useState("");

  const toggleAttendee = (name) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(name)
        ? prev.attendees.filter(a => a !== name)
        : [...prev.attendees, name]
    }));
  };

  const teamList = EBEC_TEAM;

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
                <div className="premium-search-container mt-2">
                  <div className="search-icon-wrapper">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search name or role..."
                    className="cute-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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

const MeetingNotesModal = ({ meeting, onClose, onSave }) => {
  const editorRef = useRef(null);
  const exec = (cmd) => document.execCommand(cmd, false);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = meeting?.notes || "";
    }
  }, [meeting]);

  return (
    <div className="form-overlay fade-in">
      <div className="premium-form" style={{ maxWidth: 800 }}>
        <div className="form-header">
          <div className="header-content">
            <div className="header-meta"><span className="meta-text">SESSION SCRIPTER</span></div>
            <h2>Live Notes: {meeting?.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="form-body">
          <div className="flex gap-2 mb-4">
            <button className="status-tag present active" onClick={() => exec('bold')}>BOLD</button>
            <button className="status-tag late active" onClick={() => exec('italic')}>ITALIC</button>
            <button className="status-tag absent active" onClick={() => exec('underline')}>UNDERLINE</button>
          </div>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="notes-editor"
            style={{ minHeight: 400, padding: 24, background: '#fff', borderRadius: 24, border: '1px solid rgba(0,0,0,0.05)', fontSize: 16, outline: 'none' }}
          />
        </div>
        <div className="form-footer-premium">
          <button className="btn-tertiary" onClick={onClose}>Discard</button>
          <button className="btn-primary-premium ripple" onClick={() => {
            onSave(meeting.id, editorRef.current.innerHTML);
            onClose();
          }}>Save Meeting Notes</button>
        </div>
      </div>
    </div>
  );
};

const MeetingReportModal = ({ meeting, onClose, onSave }) => {
  const [reportData, setReportData] = useState(meeting?.report || { type: 'latex', content: '', fileName: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLatex = () => {
    setIsGenerating(true);

    // 1. Identify Attendees with Status
    const attendance = meeting?.attendance || {};
    const attendeeRows = EBEC_TEAM.map(m => {
      const status = attendance[m.name] || 'absent';
      const symbol = status === 'present' ? 'P' : (status === 'late' ? 'L' : 'A');
      return `${m.name} & ${m.role} & ${symbol} \\\\ \\hline`;
    }).join('\n');

    // 2. Advanced HTML to LaTeX Converter
    const htmlToLatex = (html) => {
      if (!html) return "No notes recorded.";
      let tex = html
        .replace(/<b[^>]*>(.*?)<\/b>/gi, '\\textbf{$1}')
        .replace(/<i[^>]*>(.*?)<\/i>/gi, '\\textit{$1}')
        .replace(/<u[^>]*>(.*?)<\/u>/gi, '\\underline{$1}')
        .replace(/<li[^>]*>(.*?)<\/li>/gi, '\\item $1\n')
        .replace(/<ul[^>]*>/gi, '\\begin{itemize}\n')
        .replace(/<\/ul>/gi, '\\end{itemize}\n')
        .replace(/<p[^>]*>/gi, '\n\n')
        .replace(/<\/p>/gi, '')
        .replace(/<br[^>]*>/gi, '\\\\ ')
        .replace(/&nbsp;/g, ' ')
        .replace(/<[^>]*>/g, ''); // Clean any remaining tags

      // Escape LaTeX special characters
      tex = tex.replace(/([&%$#_{}])/g, '\\$1');
      return tex;
    };

    const notesTex = htmlToLatex(meeting?.notes);

    // 3. High-Quality Professional Template
    const latex = `
\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{fancyhdr}
\\usepackage{tabularx}
\\usepackage{xcolor}
\\usepackage{titlesec}

% Professional Colors
\\definecolor{ebecblue}{HTML}{0071E3}
\\definecolor{ebecgold}{HTML}{EBEC00}

% Title Formatting
\\titleformat{\\section}{\\large\\bfseries\\color{ebecblue}}{}{0em}{}[\\titlerule]

% Header/Footer
\\pagestyle{fancy}
\\fancyhf{}
\\lhead{\\textbf{EBEC SECRETARIAT}}
\\rhead{Report: ${meeting.title}}
\\lfoot{EBEC Helper Admin}
\\rfoot{Page \\thepage}

\\begin{document}

% Branding and Title Header
\\begin{center}
    \\Huge \\textbf{\\color{ebecblue} EBEC} \\\\
    \\large \\textit{Board of European Students of Technology} \\\\
    \\vspace{0.5cm}
    \\Large \\textbf{Official Meeting Report} \\\\
    \\vspace{0.2cm}
    \\large ${meeting.title}
\\end{center}

\\vspace{1cm}

% Metadata Section
\\section*{Meeting Information}
\\begin{tabular}{ll}
    \\textbf{Date:} & ${meeting.date} \\\\
    \\textbf{Time:} & ${meeting.time} AM \\\\
    \\textbf{Project:} & EBEC Administrative Year 2026 \\\\
    \\textbf{Ref:} & EBEC-ADM-2026-${meeting.id.toString().slice(-4)}
\\end{tabular}

\\vspace{0.5cm}

% Smart Attendee Table
\\section*{Attendance Register}
\\begin{tabularx}{\\textwidth}{|X|l|c|}
    \\hline
    \\rowcolor{ebecblue!10} \\textbf{Name} & \\textbf{Role} & \\textbf{Status} \\\\ \\hline
    ${attendeeRows}
\\end{tabularx}
\\textit{\\small (P: Present, L: Late, A: Absent)}

\\vspace{0.5cm}

% Content from Scripter
\\section*{Discussions and Deliberations}
${notesTex}

\\vspace{1cm}

% Footer / Closing
\\vfill
\\begin{flushright}
    \\textbf{Authorized by:} \\\\
    Secretary General \\\\
    EBEC Secretariat 2026
\\end{flushright}

\\end{document}
    `.trim();

    setTimeout(() => {
      setReportData({ ...reportData, type: 'latex', content: latex, fileName: `EBEC_Report_${meeting.id}.tex` });
      setIsGenerating(false);
    }, 2000);
  };

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('reportFile', file);

    setIsUploading(true);
    try {
      const resp = await fetch('http://localhost:5000/api/upload-report', {
        method: 'POST',
        body: formData
      });
      const data = await resp.json();
      if (data.success) {
        setReportData({ ...reportData, type: 'pdf', fileName: data.fileName, fileUrl: data.fileUrl });
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed. Make sure the server is running.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="form-overlay fade-in">
      <div className="premium-form" style={{ maxWidth: 700 }}>
        <div className="form-header">
          <div className="header-content">
            <div className="header-meta"><span className="meta-text">REPORT CENTER</span></div>
            <h2>{meeting?.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="form-body">
          <p className="sub-text mb-8">Choose to upload an existing PDF or generate a professional LaTeX report using meeting notes.</p>

          <div className="mgmt-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".pdf"
              onChange={handleFileUpload}
            />
            <div
              className={`premium-card ${reportData.type === 'pdf' ? 'selected' : ''}`}
              style={{ cursor: 'pointer', border: reportData.type === 'pdf' ? '2px solid var(--apple-blue)' : '' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="option-icon email"><FileText size={20} /></div>
              <h4 className="mt-4">{isUploading ? 'Uploading...' : 'Upload PDF'}</h4>
              <p style={{ fontSize: 12 }}>{reportData.type === 'pdf' ? reportData.fileName : 'Attach existing report'}</p>
            </div>
            <div className={`premium-card ${reportData.type === 'latex' ? 'selected' : ''}`} style={{ cursor: 'pointer', border: reportData.type === 'latex' ? '2px solid var(--apple-blue)' : '' }} onClick={generateLatex}>
              <div className="option-icon meet"><Layout size={20} /></div>
              <h4 className="mt-4">{isGenerating ? 'Generating...' : 'Generate LaTeX'}</h4>
              <p style={{ fontSize: 12 }}>Create report from notes</p>
            </div>
          </div>

          {reportData.type === 'pdf' && reportData.fileUrl && (
            <div className="mt-6 p-4" style={{ background: 'rgba(0,113,227,0.05)', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileText size={20} color="var(--apple-blue)" />
                <span style={{ fontWeight: 600, fontSize: 14 }}>{reportData.fileName}</span>
              </div>
              <a
                href={`http://localhost:5000${reportData.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pill-btn"
                style={{ background: '#000', color: '#fff' }}
              >
                View PDF
              </a>
            </div>
          )}

          {reportData.content && (
            <div className="mt-8">
              <label className="section-label">Generated LaTeX Code</label>
              <textarea
                readOnly
                className="notes-editor w-full"
                style={{ height: 200, fontFamily: 'monospace', fontSize: 12, padding: 16, background: '#f5f5f7' }}
                value={reportData.content}
              />
              <button className="pill-btn mt-4" onClick={() => { navigator.clipboard.writeText(reportData.content); alert("LaTeX Copied!"); }}>Copy LaTeX</button>
            </div>
          )}

          {reportData.type === 'pdf' && reportData.fileUrl && (
            <div className="mt-8" style={{ height: '500px', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
              <iframe
                src={`http://localhost:5000${reportData.fileUrl}`}
                title="Report Viewer"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          )}
        </div>
        <div className="form-footer-premium">
          <button className="btn-tertiary" onClick={onClose}>Close</button>
          <button className="btn-primary-premium ripple" onClick={() => { onSave(meeting.id, reportData); onClose(); }}>Save & Sync Report</button>
        </div>
      </div>
    </div>
  );
};

// Attendance modal: show selected attendees and allow marking present/absent/late
const MeetingAttendanceModal = ({ meeting, onClose, onSave }) => {
  const initialList = meeting?.attendees || [];
  const [view, setView] = useState(meeting?.attendance && Object.keys(meeting.attendance).length > 0 ? "options" : "edit");
  const [searchQuery, setSearchQuery] = useState("");
  const [attendance, setAttendance] = useState(() => {
    const map = {};
    initialList.forEach(n => { map[n] = meeting?.attendance?.[n] || 'absent'; });
    return map;
  });

  useEffect(() => {
    const map = {};
    (meeting?.attendees || []).forEach(n => map[n] = meeting?.attendance?.[n] || 'absent');
    setAttendance(map);
  }, [meeting]);

  const setStatus = (name, status) => {
    setAttendance(prev => ({ ...prev, [name]: status }));
  };

  const copyAsText = () => {
    const getWithNameRole = (list) => list.map(name => {
      const teamMember = EBEC_TEAM.find(t => t.name === name);
      return teamMember ? `${name} (${teamMember.role})` : name;
    });

    const present = getWithNameRole(Object.entries(attendance).filter(([_, v]) => v === 'present').map(([k, _]) => k));
    const late = getWithNameRole(Object.entries(attendance).filter(([_, v]) => v === 'late').map(([k, _]) => k));
    const absent = getWithNameRole(Object.entries(attendance).filter(([_, v]) => v === 'absent').map(([k, _]) => k));

    const text = `Attendance — ${meeting.title}\nDate: ${meeting.date}\n\nPresent: ${present.join(', ') || 'None'}\nLate: ${late.join(', ') || 'None'}\nAbsent: ${absent.join(', ') || 'None'}`;
    navigator.clipboard.writeText(text);
    alert("Copied as plain text with roles!");
  };

  const copyAttendedOnly = () => {
    const list = Object.entries(attendance)
      .filter(([_, v]) => v === 'present' || v === 'late')
      .map(([name, s]) => {
        const teamMember = EBEC_TEAM.find(t => t.name === name);
        return `${name} — ${teamMember?.role || 'Member'} [${s === 'late' ? 'L' : 'P'}]`;
      });
    const text = `Attendees Only — ${meeting.title}\nDate: ${meeting.date}\n\n${list.join('\n') || 'No attendees recorded.'}`;
    navigator.clipboard.writeText(text);
    alert("Copied attended list (Names + Roles)!");
  };

  const copyAsSpreadsheet = () => {
    // Format optimized for Google Sheets: Name | Role | Date | P | L | A
    const rows = [["Full Name", "EBEC Role", "Meeting Date", "Present (P)", "Late (L)", "Absent (A)"]];
    const dateStr = meeting.date || new Date().toISOString().split('T')[0];

    Object.entries(attendance).forEach(([name, status]) => {
      const teamMember = EBEC_TEAM.find(t => t.name === name);
      const isP = status === 'present' ? '1' : '0';
      const isL = status === 'late' ? '1' : '0';
      const isA = status === 'absent' ? '1' : '0';

      rows.push([name, teamMember?.role || 'Member', dateStr, isP, isL, isA]);
    });

    const tsv = rows.map(r => r.join("\t")).join("\n");
    navigator.clipboard.writeText(tsv);
    alert("Copied for Google Sheets! (Columns: Name, Role, Date, P, L, A)");
  };

  return (
    <div className="form-overlay fade-in">
      <div className="premium-form" style={{ maxWidth: view === 'options' ? 540 : 800 }}>
        <div className="form-header">
          <div className="header-content">
            <div className="header-meta">
              <span className="meta-text">{view === 'options' ? 'ATTENDANCE ACTIONS' : 'QUICK ATTENDANCE'}</span>
            </div>
            <h2>{meeting?.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="form-body">
          {view === 'options' ? (
            <div className="options-panel">
              <div className="option-row" onClick={copyAsText}>
                <div className="option-icon email"><Clipboard size={20} /></div>
                <div className="option-content">
                  <span className="option-title">Copy as Plain Text</span>
                  <span className="option-desc">Formatted list for Discord/WhatsApp</span>
                </div>
                <Copy size={20} color="#888" />
              </div>
              <div className="option-row" onClick={copyAsSpreadsheet}>
                <div className="option-icon meet"><Layout size={20} /></div>
                <div className="option-content">
                  <span className="option-title">Copy for Spreadsheet</span>
                  <span className="option-desc">Export data in TSV format</span>
                </div>
                <ExternalLink size={20} color="#888" />
              </div>
              <div className="option-row" onClick={copyAttendedOnly}>
                <div className="option-icon" style={{ background: 'rgba(235, 236, 0, 0.1)', color: 'var(--ebec-gold)' }}><UserCheck size={20} /></div>
                <div className="option-content">
                  <span className="option-title">Copy Attended Only</span>
                  <span className="option-desc">Names + Roles of who actually came</span>
                </div>
                <Copy size={20} color="#888" />
              </div>

              <div className="option-row" onClick={() => setView('edit')}>
                <div className="option-icon" style={{ background: '#f5f5f7', color: '#1d1d1f' }}><Edit3 size={20} /></div>
                <div className="option-content">
                  <span className="option-title">Edit Attendance</span>
                  <span className="option-desc">Modify details or mark late arrivals</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-between items-center mb-6">
                <div>
                  <label className="section-label mb-0">Member Status</label>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#888' }}>Tap status to toggle state.</p>
                </div>
                <div className="action-row">
                  <button className="pill-btn" onClick={() => {
                    const all = {}; (meeting?.attendees || []).forEach(n => all[n] = 'present'); setAttendance(all);
                  }}>All Present</button>
                  <button className="pill-btn" style={{ background: 'rgba(255,193,7,0.1)', color: '#d68100' }} onClick={() => {
                    const all = {}; (meeting?.attendees || []).forEach(n => all[n] = 'late'); setAttendance(all);
                  }}>All Late</button>
                </div>
              </div>

              <div className="premium-search-container mb-6" style={{ maxWidth: '300px' }}>
                <div className="search-icon-wrapper">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <input
                  type="text"
                  placeholder="Search attendee..."
                  className="cute-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="modern-attendee-grid" style={{ maxHeight: '450px' }}>
                {(meeting?.attendees || []).filter(name => {
                  const member = EBEC_TEAM.find(t => t.name === name);
                  return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (member && member.role.toLowerCase().includes(searchQuery.toLowerCase()));
                }).sort((a, b) => {
                  const indexA = EBEC_TEAM.findIndex(t => t.name === a);
                  const indexB = EBEC_TEAM.findIndex(t => t.name === b);
                  return indexA - indexB;
                }).map(name => {
                  const status = attendance[name];
                  const cycleStatus = (e) => {
                    if (e.target.tagName === 'BUTTON') return;
                    const states = ['absent', 'present', 'late'];
                    const nextIndex = (states.indexOf(status) + 1) % states.length;
                    setStatus(name, states[nextIndex]);
                  };

                  return (
                    <div
                      key={name}
                      className={`attendee-item status-${status}`}
                      onClick={cycleStatus}
                    >
                      <div className="member-avatar">
                        {getInitials(name)}
                        <div className="selection-check" style={{
                          background: status === 'late' ? 'var(--ebec-gold)' : status === 'present' ? '#34c759' : '#888',
                          opacity: status === 'absent' ? 0 : 1,
                          transform: status === 'absent' ? 'scale(0.5)' : 'scale(1) translateY(38px) translateX(4px)'
                        }}>
                          {status === 'absent' ? null : <Check size={12} />}
                        </div>
                      </div>
                      <div className="member-info">
                        <span className="member-name">{name}</span>
                        <div className="attendance-toggles mt-2">
                          {['present', 'late', 'absent'].map(s => (
                            <button
                              key={s}
                              className={`status-tag ${status === s ? 'active' : ''} ${s}`}
                              onClick={(e) => { e.stopPropagation(); setStatus(name, s); }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="form-footer-premium">
          <button className="btn-tertiary" onClick={onClose}>Discard</button>
          <button className="btn-primary-premium ripple" onClick={() => { onSave(meeting.id, attendance); onClose(); }}>
            {view === 'options' ? 'Close Panel' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditMeetingModal = ({ meeting, onCancel, onSubmit }) => {
  const [formData, setFormData] = useState({
    ...meeting,
    attendees: meeting.attendees || []
  });
  const [searchQuery, setSearchQuery] = useState("");

  const toggleAttendee = (name) => {
    setFormData(prev => ({
      ...prev,
      attendees: (prev.attendees || []).includes(name)
        ? prev.attendees.filter(a => a !== name)
        : [...(prev.attendees || []), name]
    }));
  };

  const teamList = EBEC_TEAM;

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
            <input
              type="text"
              className="form-input-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              autoFocus
            />
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
            <textarea
              className="premium-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-section-premium mt-8">
            <div className="flex-between items-center mb-4">
              <div className="section-info">
                <label className="section-label mb-0">Rework Attendance List</label>
                <div className="premium-search-container mt-2">
                  <div className="search-icon-wrapper"><Search size={14} /></div>
                  <input
                    type="text"
                    placeholder="Search name or role..."
                    className="cute-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
                <div
                  key={member.name}
                  className={`attendee-item ${formData.attendees?.includes(member.name) ? 'selected' : ''}`}
                  onClick={() => toggleAttendee(member.name)}
                >
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
};

const Home = ({ setPage, refNum, setRefNum, meetings, techCards, onDeleteMeeting, onUpdateMeeting, onDeleteTechCard, onSaveMeetingNotes, onSaveMeetingAttendance, onSaveMeetingReport }) => {
  const [meetingSearch, setMeetingSearch] = useState("");
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
  const [openReportFor, setOpenReportFor] = useState(null);
  const [editMeeting, setEditMeeting] = useState(null);

  const openNotes = (id) => setOpenNotesFor(id);
  const openAttendance = (id) => setOpenAttendanceFor(id);
  const openReport = (id) => setOpenReportFor(id);
  const openEdit = (m) => setEditMeeting(m);

  return (
    <>
      <div className="hero fade-in">
        <div className="phrase-container">
          <h1 className="typing-display">
            {displayText}<span className="cursor">|</span>
          </h1>
        </div>

        <p className="description">What's on the mind of the SG today?</p>

        <div className="carousel-carousel-container">
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
              <button className="quick-btn" onClick={() => setPage('new-meeting')}>
                <Plus size={18} /> New Meeting
              </button>
              <button className="quick-btn secondary" onClick={() => setPage('new-tech-card')}>
                <Plus size={18} /> New Card
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="mgmt-section">
        <div className="mgmt-content">
          <div className="mgmt-header-block flex-between" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <h2 className="mgmt-heading" style={{ margin: 0 }}>My meetings</h2>
              <div className="premium-search-container" style={{ minWidth: 320 }}>
                <div className="search-icon-wrapper">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search meetings by name or date (YYYY-MM-DD)..."
                  className="cute-search-input"
                  style={{ width: '100%' }}
                  value={meetingSearch}
                  onChange={(e) => setMeetingSearch(e.target.value)}
                />
              </div>
            </div>
            <button className="btn-icon-plus" onClick={() => setPage('new-meeting')}>
              <Plus size={18} /> Create New Meeting
            </button>
          </div>

          <div className="mgmt-grid">
            {meetings.length === 0 ? (
              <div className="empty-state">
                <p>No meetings scheduled yet.</p>
                <button className="cta" onClick={() => setPage('new-meeting')}>Create first meeting</button>
              </div>
            ) : (
              [...meetings]
                .filter(m =>
                  m.title.toLowerCase().includes(meetingSearch.toLowerCase()) ||
                  m.date.includes(meetingSearch)
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date)).map((m, idx) => {
                  const dateObj = new Date(m.date);
                  const month = dateObj.toLocaleString('en-US', { month: 'short' });
                  const day = m.date?.split('-')[2] || '--';
                  const isGold = idx % 2 !== 0;

                  return (
                    <div className="premium-card fade-in" key={m.id}>
                      {m.attendance && Object.keys(m.attendance).length > 0 && (
                        <div className="status-badge-floating pulsate">Attendance Taken</div>
                      )}

                      <div className={`date-visual-square ${isGold ? 'gold-theme' : ''}`}>
                        <span className="dv-month">{month}</span>
                        <span className="dv-day">{day}</span>
                        <span className="dv-time">{m.time} AM</span>
                      </div>

                      <div className="card-info-block">
                        <h3>{m.title}</h3>
                        <p>{m.description?.slice(0, 60) || 'Official board gathering'}</p>
                      </div>

                      <div className="stats-summary-row">
                        <div className="stat-item" title="Attendees">
                          <UserCheck size={16} /> <span>{Object.values(m.attendance || {}).filter(s => s === 'present' || s === 'late').length}</span>
                        </div>
                        <div className="stat-item" title="Notes">
                          <Clipboard size={16} /> <span>{m.notes ? 'Saved' : '0'}</span>
                        </div>
                        <div className="stat-item" title="Report Status">
                          <FileText size={16} /> <span>{m.report ? (m.report.type === 'pdf' ? 'PDF' : 'LaTeX') : '0'}</span>
                        </div>
                      </div>

                      <div className="premium-card-footer">
                        <button className="footer-action-btn" onClick={() => openAttendance(m.id)}>
                          <UserCheck size={16} />
                          {m.attendance ? 'Verify' : 'Take'}
                        </button>
                        <button className="footer-action-btn" onClick={() => openNotes(m.id)}>
                          <Clipboard size={16} />
                        </button>
                        <button className="footer-action-btn" onClick={() => openEdit(m)}>
                          <Edit3 size={16} />
                        </button>
                        <button className="footer-action-btn report" onClick={() => openReport(m.id)}>
                          <FileText size={16} /> Report
                        </button>
                        <button className="footer-delete-btn" onClick={() => {
                          if (window.confirm(`Delete meeting?`)) onDeleteMeeting(m.id);
                        }}>
                          <Trash size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* Technical Card Tracking Section */}
          <div className="mgmt-header-block flex-between mt-12" style={{ alignItems: 'center' }}>
            <div>
              <h2 className="mgmt-heading">Technical Logistics</h2>
              <p className="mgmt-sub">Manage activity references and materials</p>
            </div>
            <button className="btn-icon-plus" onClick={() => setPage('new-tech-card')}>
              <Plus size={18} /> Create New Card
            </button>
          </div>

          <div className="mgmt-grid">
            {techCards.length === 0 ? (
              <div className="empty-state">
                <p>No technical cards active.</p>
                <button className="cta" onClick={() => setPage('new-tech-card')}>Create first card</button>
              </div>
            ) : (
              techCards.map((tc, idx) => {
                const isGoldTheme = idx % 2 === 0;
                return (
                  <div className="premium-card fade-in" key={tc.id}>
                    <div className={`date-visual-square ${isGoldTheme ? 'gold-theme' : ''}`}>
                      <span className="dv-month">REF</span>
                      <span className="dv-day" style={{ fontSize: '42px' }}>{tc.reference.split('/')[0]}</span>
                      <span className="dv-time">EBEC • 2026</span>
                    </div>

                    <div className="card-info-block">
                      <h3>{tc.title}</h3>
                      <p>{tc.theme} • {tc.duration}</p>
                    </div>

                    <div className="stats-summary-row">
                      <div className="stat-item" title="Sponsor">
                        <Package size={16} /> <span>{tc.isSponsored ? tc.sponsorName : 'General'}</span>
                      </div>
                      <div className="stat-item" title="Agenda">
                        <Clipboard size={16} /> <span>{tc.agenda ? 'Ready' : 'Draft'}</span>
                      </div>
                    </div>

                    <div className="premium-card-footer">
                      <button className="footer-action-btn" onClick={() => alert(`Agenda: ${tc.agenda}`)}>
                        <Clipboard size={16} /> Agenda
                      </button>
                      <button className="footer-action-btn" onClick={() => alert(`Logistics: ${tc.needs}`)}>
                        <Package size={16} /> Materials
                      </button>
                      <button className="footer-action-btn report" onClick={() => alert(`Reference Doc: ${tc.reference}`)}>
                        <FileText size={16} />
                      </button>
                      <button className="footer-delete-btn" onClick={() => {
                        if (window.confirm(`Remove this technical card?`)) onDeleteTechCard(tc.id);
                      }}>
                        <Trash size={20} />
                      </button>
                    </div>
                  </div>
                );
              })
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

      {openReportFor && (
        <MeetingReportModal
          meeting={meetings.find(m => m.id === openReportFor)}
          onClose={() => setOpenReportFor(null)}
          onSave={onSaveMeetingReport}
        />
      )}

      {editMeeting && (
        <EditMeetingModal
          meeting={editMeeting}
          onCancel={() => setEditMeeting(null)}
          onSubmit={(data) => {
            onUpdateMeeting(data);
            setEditMeeting(null);
          }}
        />
      )}
    </>
  );
};
        </>
        );
};

const AttendancePredictor = ({ meetings }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const [duration, setDuration] = useState(2);
  const [predictions, setPredictions] = useState(null);

  const predict = () => {
    if (!date) return alert("Please select a date first!");

    const results = EBEC_TEAM.map(member => {
      const history = meetings.filter(m => m.attendance && m.attendance[member.name]);
      const presentCount = history.filter(m => m.attendance[member.name] === 'present' || m.attendance[member.name] === 'late').length;

      let probability = history.length > 0 ? (presentCount / history.length) * 100 : 75; // Base prob or fallback

      // Time Heuristic: Late night or early morning usually lower attendance
      const hour = parseInt(time.split(":")[0]);
      if (hour < 10) probability -= 10;
      if (hour > 20) probability -= 5;

      // Duration Heuristic: Long meetings (Diva fatigue)
      if (duration > 3) probability -= 15;

      // Confidence Heuristic: More data = More confidence
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
                  <div style={{ height: '100%', width: `${p.probability}%`, background: p.probability > 70 ? '#34c759' : (p.probability > 40 ? 'var(--ebec-gold)' : '#ff3b30'), transition: 's 0.8s ease-out' }}></div>
                </div>
                <div className="mt-2" style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>Confidence: {p.confidence}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Archive = ({ meetings = [], onUpdateMeeting }) => {
  const [editMeeting, setEditMeeting] = useState(null);
  const totalMeetings = meetings.length;
  const completedWithAttendance = meetings.filter(m => m.attendance && Object.keys(m.attendance).length > 0);

  // Calculate Avg Attendance
  let totalCap = 0;
  let totalAttended = 0;
  completedWithAttendance.forEach(m => {
    totalCap += m.attendees.length;
    totalAttended += Object.values(m.attendance).filter(s => s === 'present' || s === 'late').length;
  });
  const avgAttendance = totalCap > 0 ? Math.round((totalAttended / totalCap) * 100) : 0;

  // Find Star Attendee (Diva)
  const attendanceCounts = {};
  completedWithAttendance.forEach(m => {
    Object.entries(m.attendance).forEach(([name, status]) => {
      if (status === 'present' || status === 'late') {
        attendanceCounts[name] = (attendanceCounts[name] || 0) + 1;
      }
    });
  });
  const starMember = Object.entries(attendanceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

  return (
    <div className="dashboard-content fade-in">
      <h2 className="section-title" style={{ color: '#fff', fontSize: '32px', marginBottom: '20px' }}>Secretariat Hub</h2>

      {/* Secretariat Analytics Suite */}
      <div className="mgmt-grid mb-12" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 60 }}>
        <div className="premium-card" style={{ padding: 24, textAlign: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="stat-label" style={{ color: 'var(--ebec-gold)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Total Meetings</span>
          <div className="stat-value" style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>{totalMeetings}</div>
        </div>
        <div className="premium-card" style={{ padding: 24, textAlign: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="stat-label" style={{ color: 'var(--apple-blue)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Avg Engagement</span>
          <div className="stat-value" style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>{avgAttendance}%</div>
        </div>
        <div className="premium-card" style={{ padding: 24, textAlign: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="stat-label" style={{ color: '#34c759', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Diva of the Month</span>
          <div className="stat-value" style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 10 }}>{starMember}</div>
        </div>
      </div>

      <AttendancePredictor meetings={meetings} />

      <div className="glass-panel-wide" style={{ marginTop: 60 }}>
        <p style={{ opacity: 0.8, color: '#fff', marginBottom: '20px', fontWeight: 600 }}>Historical Secretariat Records</p>
        <div className="archive-list" style={{ display: 'grid', gap: 12 }}>
          {meetings.length === 0 ? (
            <p style={{ color: '#fff', opacity: 0.5 }}>No meetings in archive.</p>
          ) : (
            [...meetings].sort((a, b) => new Date(b.date) - new Date(a.date)).map((m) => (
              <div className="list-item" key={m.id} style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 15px', borderRadius: 12, textAlign: 'center', minWidth: 60 }}>
                    <span style={{ fontSize: 10, color: 'var(--ebec-gold)', display: 'block' }}>{new Date(m.date).toLocaleString('en-US', { month: 'short' })}</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{m.date.split('-')[2]}</span>
                  </div>
                  <div>
                    <p className="meet-title" style={{ fontSize: 18, fontWeight: 700 }}>{m.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        {Object.values(m.attendance || {}).filter(s => s === 'present' || s === 'late').length} Attendees • EBEC-ADM-2026-{m.id.toString().slice(-4)}
                      </span>
                      <button
                        onClick={() => setEditMeeting(m)}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Edit3 size={10} /> Edit Info
                      </button>
                    </div>
                  </div>
                </div>
                <div className="tag" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}>Archived</div>
              </div>
            ))
          )}
        </div>
      </div>

      {editMeeting && (
        <EditMeetingModal
          meeting={editMeeting}
          onCancel={() => setEditMeeting(null)}
          onSubmit={(data) => {
            onUpdateMeeting(data);
            setEditMeeting(null);
          }}
        />
      )}
    </div>
  );
};

const AttendanceTracking = ({ meetings }) => {
  const attendedMeetings = meetings.filter(m => m.attendance && Object.keys(m.attendance).length > 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="dashboard-content fade-in" style={{ maxWidth: '95vw' }}>
      <div className="flex-between items-center mb-8">
        <div>
          <h2 className="section-title" style={{ color: '#fff', fontSize: '36px', margin: 0 }}>Secretariat Attendance Portal</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>Bird's eye view of EBEC engagement across all sync sessions.</p>
        </div>
        <div className="stat-card" style={{ background: 'rgba(52, 199, 89, 0.1)', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
          <div className="stat-value" style={{ color: '#34c759' }}>{attendedMeetings.length}</div>
          <div className="stat-label">Tracked Sessions</div>
        </div>
      </div>

      <div className="glass-panel-wide" style={{ padding: 0, overflow: 'hidden', borderRadius: 40 }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="attendance-table">
            <thead>
              <tr>
                <th className="sticky-col">TEAM MEMBER</th>
                {attendedMeetings.map(m => (
                  <th key={m.id}>
                    <div style={{ fontSize: 10, opacity: 0.6 }}>{m.date}</div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{m.title.slice(0, 15)}{m.title.length > 15 ? '...' : ''}</div>
                  </th>
                ))}
                <th style={{ background: 'rgba(255,193,7,0.1)', color: 'var(--ebec-gold)' }}>ENGAGEMENT</th>
              </tr>
            </thead>
            <tbody>
              {EBEC_TEAM.map(member => {
                let meetingsInvited = 0;
                let attendedCount = 0;

                return (
                  <tr key={member.name}>
                    <td className="sticky-col">
                      <div style={{ fontWeight: 800 }}>{member.name}</div>
                      <div style={{ fontSize: 10, opacity: 0.5 }}>{member.role}</div>
                    </td>
                    {attendedMeetings.map(m => {
                      const status = m.attendance?.[member.name];
                      const isOfficiallyInvited = (m.attendees || []).includes(member.name);
                      const hasAttendanceRecord = status === 'present' || status === 'late' || status === 'absent';

                      const isInvited = isOfficiallyInvited || hasAttendanceRecord;

                      if (isInvited) meetingsInvited++;

                      const displayStatus = status || (isOfficiallyInvited ? 'absent' : null);
                      if (isInvited && (displayStatus === 'present' || displayStatus === 'late')) attendedCount++;

                      return (
                        <td key={m.id} style={{ textAlign: 'center' }}>
                          {isInvited ? (
                            <div className={`status-dot-cell ${displayStatus || 'absent'}`}>
                              {displayStatus === 'present' ? 'P' : (displayStatus === 'late' ? 'L' : 'A')}
                            </div>
                          ) : (
                            <span style={{ opacity: 0.2 }}>-</span>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center', fontWeight: 900, fontSize: 16 }}>
                      {meetingsInvited > 0 ? Math.round((attendedCount / meetingsInvited) * 100) : 0}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

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
          <p>© 2026 EBEC Secretary General Leena IKHLEF. Built for Excellence.</p>
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

const API_URL = "http://localhost:5000/api";

export default function App() {
  const [page, setPage] = useState('home');
  const [refCounter, setRefCounter] = useState(1);
  const currentRef = `${String(refCounter).padStart(2, '0')}/26`;

  const [meetings, setMeetings] = useState([]);
  const [techCards, setTechCards] = useState([]);

  // Load initial data
  useEffect(() => {
    fetch(`${API_URL}/data`)
      .then(res => res.json())
      .then(data => {
        setMeetings(data.meetings || []);
        setTechCards(data.techCards || []);
        setRefCounter(data.refCounter || 1);
      });
  }, []);

  const handleAddMeeting = (newMeeting) => {
    fetch(`${API_URL}/meetings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMeeting)
    })
      .then(res => res.json())
      .then(saved => {
        setMeetings([saved, ...meetings]);
        setPage('home');
      });
  };

  const handleAddTechCard = (newCard) => {
    fetch(`${API_URL}/tech-cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCard)
    })
      .then(res => res.json())
      .then(saved => {
        setTechCards([saved, ...techCards]);
        setRefCounter(prev => prev + 1);
        setPage('home');
      });
  };

  const handleDeleteMeeting = (id) => {
    fetch(`${API_URL}/meetings/${id}`, { method: "DELETE" })
      .then(() => {
        setMeetings(prev => prev.filter(m => m.id !== id));
        console.log("Deleted from database successfully");
      });
  };

  const handleDeleteTechCard = (id) => {
    fetch(`${API_URL}/tech-cards/${id}`, { method: "DELETE" })
      .then(() => {
        setTechCards(prev => prev.filter(tc => tc.id !== id));
        console.log("Deleted from database successfully");
      });
  };

  const handleUpdateMeeting = (updatedMeeting) => {
    fetch(`${API_URL}/meetings/${updatedMeeting.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedMeeting)
    })
      .then(res => res.json())
      .then(saved => {
        setMeetings(prev => prev.map(m => m.id === saved.id ? saved : m));
      });
  };

  const handleSaveMeetingReport = (meetingId, report) => {
    fetch(`${API_URL}/meetings/${meetingId}/report`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report })
    })
      .then(() => setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, report } : m)));
  };

  const handleSaveMeetingNotes = (meetingId, html) => {
    fetch(`${API_URL}/meetings/${meetingId}/notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: html })
    })
      .then(() => setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, notes: html } : m)));
  };

  const handleSaveMeetingAttendance = (meetingId, attendance) => {
    fetch(`${API_URL}/meetings/${meetingId}/attendance`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendance })
    })
      .then(() => setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, attendance: { ...m.attendance, ...attendance } } : m)));
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
        .mgmt-section { width: 100%; background: #fff; padding: 100px 40px; border-radius: 64px 64px 0 0; display: flex; justify-content: center; }
        .mgmt-content { max-width: 1300px; width: 100%; }
        .mgmt-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
            gap: 20px; 
            margin-top: 32px;
        }

        .premium-card {
            background: #fff;
            border: 1px solid rgba(0,0,0,0.04);
            border-radius: 28px;
            padding: 18px;
            display: flex;
            flex-direction: column;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            box-shadow: 0 4px 12px rgba(0,0,0,0.01);
        }
        .premium-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 30px 60px rgba(0,0,0,0.06);
            border-color: rgba(0,113,227,0.1);
        }

        .date-visual-square {
            width: 100%;
            aspect-ratio: 1.2;
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #fff;
            margin-bottom: 20px;
            background: var(--apple-blue);
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 20px rgba(0, 113, 227, 0.1);
        }
        .date-visual-square.gold-theme {
            background: var(--ebec-gold);
            color: #000;
            box-shadow: 0 10px 20px rgba(255, 193, 7, 0.1);
        }

        .dv-month { font-size: 14px; font-weight: 700; opacity: 0.8; text-transform: uppercase; letter-spacing: 2px; }
        .dv-day { font-size: 52px; font-weight: 900; line-height: 1; margin: 2px 0; letter-spacing: -3px; }
        .dv-time { font-size: 11px; font-weight: 700; opacity: 0.9; text-transform: uppercase; letter-spacing: 1.5px; }

        .card-info-block { margin-bottom: 16px; }
        .card-info-block h3 { font-size: 20px; font-weight: 800; color: #1d1d1f; margin: 0; letter-spacing: -0.5px; }
        .card-info-block p { font-size: 13.5px; color: #666; margin: 6px 0 0 0; font-weight: 500; }

        .stats-summary-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            color: #888;
            border-bottom: 1px solid rgba(0,0,0,0.03);
            margin-bottom: 16px;
        }
        .stat-item { display: flex; align-items: center; gap: 6px; }
        .stat-item span { font-size: 12px; font-weight: 700; color: #555; }

        .premium-card-footer {
            display: flex;
            gap: 8px;
            margin-top: auto;
            align-items: center;
        }
        .footer-action-btn {
            flex: 1;
            background: rgba(0,0,0,0.03);
            border: 1px solid rgba(0,0,0,0.02);
            padding: 10px 8px;
            border-radius: 14px;
            font-size: 11px;
            font-weight: 800;
            color: #1d1d1f;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            cursor: pointer;
            transition: 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            white-space: nowrap;
        }
        .footer-action-btn:hover {
            background: #fff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            border-color: rgba(0,113,227,0.2);
        }
        .footer-action-btn.report {
            background: rgba(0, 113, 227, 0.05);
            color: var(--apple-blue);
        }
        .footer-delete-btn {
            width: 42px;
            height: 42px;
            border-radius: 14px;
            background: #fff5f5;
            color: #ff3b30;
            border: 1px solid rgba(255, 59, 48, 0.1);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.3s;
            flex-shrink: 0;
        }
        .footer-delete-btn:hover {
            background: #ff3b30;
            color: #fff;
            transform: scale(1.1);
        }

        /* --- Custom Designed Buttons --- */
        .btn-icon-plus, .quick-btn {
            background: linear-gradient(135deg, #0071e3 0%, #00c6fb 100%);
            color: #fff;
            border: none;
            padding: 12px 24px;
            border-radius: 18px;
            font-weight: 800;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 10px 30px rgba(0, 113, 227, 0.25);
        }
        .btn-icon-plus:hover, .quick-btn:hover {
            transform: translateY(-4px) scale(1.03);
            box-shadow: 0 20px 40px rgba(0, 113, 227, 0.35);
        }
        .quick-btn.secondary {
            background: linear-gradient(135deg, #1D355E 0%, #2a4b82 100%);
            box-shadow: 0 10px 30px rgba(29, 53, 94, 0.25);
        }
        .quick-btn.secondary:hover {
            box-shadow: 0 20px 40px rgba(29, 53, 94, 0.35);
        }

        .status-badge-floating {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 8px 16px;
            border-radius: 100px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            box-shadow: 0 10px 20px rgba(0,0,0,0.06);
            color: var(--ebec-gold);
            z-index: 2;
        }

        .mgmt-tabs { display: flex; align-items: center; gap: 32px; color: #999; font-weight: 600; font-size: 15px; }
        .tab-btn { background: none; border: none; padding: 0; color: inherit; font: inherit; cursor: pointer; display: flex; align-items: center; gap: 8px; position: relative; padding-bottom: 8px; }
        .tab-btn.active { color: #1d1d1f; }
        .tab-btn.active::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; background: #6366f1; border-radius: 50%; }
        .tab-count { background: rgba(0,0,0,0.05); padding: 2px 8px; border-radius: 100px; font-size: 11px; }
        .tab-btn.active .tab-count { background: rgba(99, 102, 241, 0.1); color: #6366f1; }

        .empty-state { text-align: center; padding: 60px; background: #fff; border-radius: 32px; border: 2px dashed rgba(0,0,0,0.05); grid-column: 1 / -1; }
        .empty-state p { font-size: 18px; color: #888; margin-bottom: 24px; font-weight: 600; }
        .cta { background: var(--apple-blue); color: #fff; border: none; padding: 14px 28px; border-radius: 100px; font-weight: 800; cursor: pointer; transition: 0.3s; }
        .cta:hover { transform: scale(1.05); box-shadow: 0 10px 20px rgba(0, 113, 227, 0.2); }

        .action-row { display: flex; gap: 16px; justify-content: center; }
        .mgmt-btn { border: none; padding: 16px 32px; border-radius: 100px; font-weight: 800; font-size: 16px; cursor: pointer; transition: 0.2s; }
        .mgmt-btn.primary { background: #000; color: #fff; }
        .mgmt-btn.secondary { background: #fff; color: #000; border: 2px solid #000; }
        .mgmt-btn:hover { transform: translateY(-3px); }

        .pulsate { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }

        .attendance-toggles { display: flex; gap: 4px; }
        .status-tag { border: 1px solid rgba(0,0,0,0.05); background: transparent; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; cursor: pointer; transition: 0.2s; color: #888; }
        .status-tag.present.active { background: #34c759; color: #fff; border-color: #34c759; }
        .status-tag.late.active { background: var(--ebec-gold); color: #000; border-color: var(--ebec-gold); }
        .status-tag.absent.active { background: #ff3b30; color: #fff; border-color: #ff3b30; }

        .premium-search-container { position: relative; display: flex; align-items: center; }
        .search-icon-wrapper { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #888; pointer-events: none; }
        .cute-search-input { background: rgba(0,0,0,0.04); border: 1.5px solid transparent; border-radius: 14px; padding: 10px 14px 10px 38px; font-size: 13px; font-weight: 600; color: #1d1d1f; outline: none; transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1); min-width: 240px; }
        .cute-search-input:focus { background: #fff; border-color: var(--apple-blue); box-shadow: 0 4px 12px rgba(0, 113, 227, 0.08); width: 280px; }
        .cute-search-input::placeholder { color: #aaa; }

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
        .datetime-input input, .premium-input-small { 
          background: rgba(0,0,0,0.04); 
          border: 1px solid rgba(0,0,0,0.05); 
          padding: 14px 18px; 
          border-radius: 14px; 
          font-size: 14px; 
          font-weight: 700; 
          outline: none; 
          color: #1d1d1f;
          font-family: var(--system-font);
          transition: 0.2s;
        }
        .datetime-input input:focus, .premium-input-small:focus {
          background: #fff;
          border-color: var(--apple-blue);
          box-shadow: 0 4px 12px rgba(0, 113, 227, 0.08);
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator,
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(0.4);
          transition: 0.2s;
        }
        input[type="date"]:hover::-webkit-calendar-picker-indicator { filter: invert(0); }

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

        .modern-attendee-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-height: 480px; overflow-y: auto; padding: 20px; background: rgba(0,0,0,0.015); border-radius: 32px; }
        .attendee-item { background: #fff; border: 1.5px solid rgba(0,0,0,0.03); padding: 20px; border-radius: 28px; display: flex; align-items: center; gap: 20px; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 4px 12px rgba(0,0,0,0.01); }
        .attendee-item:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
        
        .attendee-item.status-present { 
            background: rgba(52, 199, 89, 0.04); 
            border-color: rgba(52, 199, 89, 0.4); 
            box-shadow: 0 10px 30px rgba(52, 199, 89, 0.08);
        }
        .attendee-item.status-late { 
            background: rgba(255, 193, 7, 0.06); 
            border-color: rgba(255, 193, 7, 0.4); 
            box-shadow: 0 10px 30px rgba(255, 193, 7, 0.1);
        }
        .attendee-item.status-absent {
            opacity: 0.8;
        }

        .member-avatar { width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(135deg, #f0f0f2, #e5e5e7); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; color: #1d1d1f; position: relative; border: 2px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.03); flex-shrink: 0; transition: transform 0.3s; }
        .attendee-item:active .member-avatar { transform: scale(0.9); }
        .selection-check { position: absolute; -top: 8px; -right: 8px; background: #34c759; color: #fff; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #fff; display: flex; align-items: center; justify-content: center; opacity: 0; transform: scale(0.5); transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 2; box-shadow: 0 4px 10px rgba(52, 199, 89, 0.2); }
        .selected .selection-check { opacity: 1; transform: scale(1) translateY(38px) translateX(4px); }
        .member-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
        .member-name { font-size: 13.5px; font-weight: 700; color: #1d1d1f; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; letter-spacing: -0.2px; }
        .member-role { font-size: 11px; color: #999; font-weight: 600; margin-top: 1px; text-transform: uppercase; letter-spacing: 0.3px; }
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
        .nav-links span { color: #fff !important; cursor: pointer; transition: 0.3s; }
        .nav-links span:hover { color: var(--ebec-gold) !important; }
        .nav-links span.active { color: var(--ebec-gold) !important; font-weight: 800; text-shadow: 0 0 10px rgba(255, 193, 7, 0.3); }
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

        /* --- Attendance Table Matrix --- */
        .attendance-table { width: 100%; border-collapse: collapse; background: transparent; color: #fff; }
        .attendance-table th, .attendance-table td { padding: 20px; border: 1px solid rgba(255,255,255,0.05); white-space: nowrap; }
        .attendance-table th { background: rgba(255,255,255,0.05); text-align: left; }
        .attendance-table tr:hover td { background: rgba(255,255,255,0.02); }
        .attendance-table tr:hover .sticky-col { background: #162444 !important; }
        .sticky-col { position: sticky; left: 0; background: #0c1a33; z-index: 10; border-right: 2px solid rgba(255,255,255,0.1) !important; transition: background 0.2s; }
        
        .status-dot-cell { width: 32px; height: 32px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; }
        .status-dot-cell.present { background: rgba(52, 199, 89, 0.2); color: #34c759; border: 1px solid rgba(52, 199, 89, 0.3); }
        .status-dot-cell.late { background: rgba(255, 193, 7, 0.2); color: var(--ebec-gold); border: 1px solid rgba(255, 193, 7, 0.3); }
        .status-dot-cell.absent { background: rgba(255, 59, 48, 0.2); color: #ff3b30; border: 1px solid rgba(255, 59, 48, 0.3); }

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
          <span className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}>Home</span>
          <span>Activities</span>
          <span className={page === 'attendance-tracking' ? 'active' : ''} onClick={() => setPage('attendance-tracking')}>Attendance</span>
          <span className={page === 'archive' ? 'active' : ''} onClick={() => setPage('archive')}>Archive</span>
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
          onUpdateMeeting={handleUpdateMeeting}
          onDeleteTechCard={handleDeleteTechCard}
          onSaveMeetingNotes={handleSaveMeetingNotes}
          onSaveMeetingAttendance={handleSaveMeetingAttendance}
          onSaveMeetingReport={handleSaveMeetingReport}
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

      {page === 'archive' && <Archive meetings={meetings} onUpdateMeeting={handleUpdateMeeting} />}

      {page === 'attendance-tracking' && <AttendanceTracking meetings={meetings} />}

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
