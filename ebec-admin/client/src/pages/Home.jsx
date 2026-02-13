import React, { useState, useEffect } from 'react';

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
  if(!name) return '';
  const parts = name.split(' ').filter(Boolean);
  if(parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
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

  return (
    <div className="form-overlay fade-in">
      <div className="google-style-form tech-card-form">
        <div className="form-header">
          <div>
            <h2>New Technical Card</h2>
            <span className="ref-badge">REF: {formData.reference}</span>
          </div>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <div className="form-body">
          <input 
            type="text" 
            placeholder="Activity Title" 
            className="form-input-title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          
          <input 
            type="text" 
            placeholder="Activity Theme (e.g., Sustainability, AI, Engineering)" 
            className="form-input-full"
            value={formData.theme}
            onChange={(e) => setFormData({...formData, theme: e.target.value})}
          />

          <div className="form-section">
            <label className="section-label">Duration & Time</label>
            <div className="duration-toggle">
              {["Hours", "One Day", "Multi-Day"].map(d => (
                <button 
                  key={d} 
                  className={`toggle-btn ${formData.duration === d ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, duration: d})}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="form-row mt-2">
              <div className="input-group">
                <span>Start</span>
                <input type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
              </div>
              <div className="input-group">
                <span>End</span>
                <input type="datetime-local" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="input-block">
              <label>Objectives</label>
              <textarea placeholder="Key goals..." value={formData.objectives} onChange={(e) => setFormData({...formData, objectives: e.target.value})} />
            </div>
            <div className="input-block">
              <label>Activity Agenda</label>
              <textarea placeholder="Step by step timeline..." value={formData.agenda} onChange={(e) => setFormData({...formData, agenda: e.target.value})} />
            </div>
          </div>

          <div className="form-section">
            <label className="section-label">Sponsorship</label>
            <div className="toggle-item" onClick={() => setFormData({...formData, isSponsored: !formData.isSponsored})}>
              <div className={`toggle-switch ${formData.isSponsored ? 'on' : ''}`}></div>
              <span>Is this activity sponsored?</span>
            </div>
            {formData.isSponsored && (
              <input 
                type="text" 
                placeholder="Name of Sponsor" 
                className="form-input-full mt-2"
                value={formData.sponsorName}
                onChange={(e) => setFormData({...formData, sponsorName: e.target.value})}
              />
            )}
          </div>

          <div className="form-section">
            <label className="section-label">Activity Needs</label>
            <textarea 
              placeholder="Materials, Logistics, Technical requirements..." 
              className="form-textarea"
              value={formData.needs}
              onChange={(e) => setFormData({...formData, needs: e.target.value})}
            />
          </div>

          <div className="form-section">
            <label className="section-label">Attendance Tracking</label>
            <select 
              className="form-input-full" 
              value={formData.attendeeType} 
              onChange={(e) => setFormData({...formData, attendeeType: e.target.value})}
            >
              <option value="School">Internal Only (School)</option>
              <option value="Outside">External Only (Outside)</option>
              <option value="Mixed">Mixed (Internal + External)</option>
            </select>

            {(formData.attendeeType === 'Outside' || formData.attendeeType === 'Mixed') && (
              <div className="external-list-builder mt-2">
                <p className="sub-hint">Add External Guests / Speakers</p>
                <div className="add-external-row">
                  <input placeholder="Name" value={externalInput.name} onChange={e => setExternalInput({...externalInput, name: e.target.value})} />
                  <input placeholder="Info/Institution" value={externalInput.info} onChange={e => setExternalInput({...externalInput, info: e.target.value})} />
                  <button onClick={addExternal}><Plus size={16}/></button>
                </div>
                <div className="guest-pills">
                  {formData.externalAttendees.map(g => (
                    <span key={g.id} className="guest-pill">{g.name} <small>({g.info})</small></span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-footer">
          <button className="btn-form-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-form-primary" onClick={() => {
            if(!formData.title) return alert("Title required");
            onSubmit({...formData, id: Date.now()});
          }}>Save Technical Card</button>
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
      <div className="google-style-form meeting-form">
        <div className="form-header">
          <h2>New Meeting</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <div className="form-body">
          <input 
            type="text" 
            placeholder="Add title" 
            className="form-input-title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          
          <div className="form-row">
            <input 
              type="date" 
              className="form-input-half"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
            <input 
              type="time" 
              className="form-input-half"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
            />
          </div>

          <textarea 
            placeholder="Add description or notes" 
            className="form-textarea"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />

          <div className="attendee-section">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <label>Add Attendees ({formData.attendees.length} selected)</label>
              <div style={{display:'flex', gap:8}}>
                <button className="quick-btn" onClick={() => setFormData({...formData, attendees: sortedTeam.map(t=>t.name)})}>Select All EBEC</button>
                <button className="quick-btn secondary" onClick={() => setFormData({...formData, attendees: []})}>Clear</button>
              </div>
            </div>
            <div className="attendee-grid">
              {sortedTeam.map(member => (
                <div 
                  key={member.name} 
                  className={`attendee-pill ${formData.attendees.includes(member.name) ? 'active' : ''}`}
                  onClick={() => toggleAttendee(member.name)}
                >
                  <div className="check-circle">
                    {formData.attendees.includes(member.name) && <Check />}
                  </div>
                  <div className="pill-text">
                    <span className="pill-name">{member.name}</span>
                    <span className="pill-role">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-toggles">
            <div className="toggle-item" onClick={() => setFormData({...formData, useMeet: !formData.useMeet})}>
              <div className={`toggle-switch ${formData.useMeet ? 'on' : ''}`}></div>
              <Video size={18} />
              <span>Add Google Meet video conferencing</span>
            </div>
            <div className="toggle-item" onClick={() => setFormData({...formData, sendEmail: !formData.sendEmail})}>
              <div className={`toggle-switch ${formData.sendEmail ? 'on' : ''}`}></div>
              <Mail size={18} />
              <span>Send email invitation to attendees</span>
            </div>
          </div>
        </div>

        <div className="form-footer">
          <button className="btn-form-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-form-primary" onClick={() => {
            if(!formData.title) return alert("Title required");
            onSubmit({...formData, id: Date.now()});
          }}>Save Meeting</button>
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
      <div className="google-style-form" style={{maxWidth:800}}>
        <div className="form-header">
          <h3>Notes — {meeting?.title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="form-body">
          <div style={{display:'flex', gap:8}}>
            <button className="quick-btn" onClick={() => exec('bold')}><b>B</b></button>
            <button className="quick-btn" onClick={() => exec('italic')}><i>I</i></button>
            <button className="quick-btn" onClick={() => exec('underline')}><u>U</u></button>
          </div>

          <div
            contentEditable
            suppressContentEditableWarning
            onInput={(e)=> setHtml(e.currentTarget.innerHTML)}
            className="notes-editor"
            style={{minHeight:220, padding:12, border:'1px solid #eee', borderRadius:10, marginTop:8}}
            dangerouslySetInnerHTML={{__html: html}}
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
    const map = {}; (meeting?.attendees || []).forEach(n=> map[n] = meeting?.attendance?.[n] || false);
    setAttendance(map);
  }, [meeting]);

  const togglePresent = (name) => {
    setAttendance(prev => ({...prev, [name]: !prev[name]}));
  };

  return (
    <div className="form-overlay">
      <div className="google-style-form" style={{maxWidth:700}}>
        <div className="form-header">
          <h3>Attendance — {meeting?.title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="form-body">
          <p className="sub-hint">Toggle present attendees and save.</p>
          <div style={{display:'flex', gap:8, marginBottom:8}}>
            <button className="quick-btn" onClick={() => {
              const all = {};
              (meeting?.attendees || []).forEach(n=> all[n] = true);
              setAttendance(all);
            }}>Mark All Present</button>
            <button className="quick-btn secondary" onClick={() => {
              const none = {};
              (meeting?.attendees || []).forEach(n=> none[n] = false);
              setAttendance(none);
            }}>Clear</button>
          </div>

          <div style={{display:'grid', gap:8, maxHeight:320, overflow:'auto'}}>
            {(meeting?.attendees || []).map(name => (
              <label key={name} className="attendee-pill" style={{justifyContent:'space-between'}}>
                <div style={{display:'flex', gap:8, alignItems:'center'}}>
                  <div style={{width:28, height:28, borderRadius:6, background:'#f5f5f7', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    {attendance[name] ? <Check /> : <span style={{opacity:0.4}}>—</span>}
                  </div>
                  <div>
                    <div style={{fontWeight:700}}>{name}</div>
                    <div style={{fontSize:12, color:'#666'}}>{(EBEC_TEAM.find(t=>t.name===name)?.role) || ''}</div>
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
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12}}>
                    <div className="meeting-main-info">
                      <div className="meeting-date-pill">
                        <span className="m-day">{m.date?.split('-')[2] || '--'}</span>
                        <span className="m-month">{m.date?.split('-')[1] || '??'}</span>
                      </div>
                      <div className="meeting-details">
                        <h3>{m.title}</h3>
                        <p>{m.time} • {m.attendees.length} Attendees {m.attendance ? `• ${Object.values(m.attendance).filter(Boolean).length} present` : ''}</p>
                        { (m.description || m.notes) && <p className="meet-desc">{(m.description || '').slice(0,140)}{m.notes ? ' — (notes saved)' : ''}</p> }
                        <div className="avatar-list">
                          { (m.attendees || []).slice(0,4).map(a => (
                            <div className="avatar" title={a} key={a}>{getInitials(a)}</div>
                          )) }
                          { (m.attendees || []).length > 4 && <div className="avatar">+{(m.attendees || []).length - 4}</div> }
                        </div>
                      </div>
                    </div>

                    <div style={{display:'flex', flexDirection:'column', gap:8}} className="meeting-actions">
                      <div style={{display:'flex', gap:8}}>
                        <button className="action-btn" onClick={() => openAttendance(m.id)} title="Attendance"><UserCheck size={16} /></button>
                        <button className="action-btn" onClick={() => openNotes(m.id)} title="Notes"><Clipboard size={16} /></button>
                        <button className="action-btn report" onClick={() => alert(`Report for ${m.title}`)} title="Report"><FileText size={16} /></button>
                      </div>
                      <button className="action-btn danger" onClick={() => {
                        if(window.confirm(`Delete meeting \"${m.title}\"? This cannot be undone.`)) {
                          onDeleteMeeting && onDeleteMeeting(m.id);
                        }
                      }} title="Delete"><Trash size={14} /></button>
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
                  <div style={{display:'flex', justifyContent:'space-between', gap:12}}>
                    <div className="meeting-main-info">
                      <div className="meeting-date-pill tech-pill">
                        <Hash size={16} />
                        <span className="m-month" style={{fontSize: '9px'}}>{tc.reference}</span>
                      </div>
                      <div className="meeting-details">
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          <h3 style={{margin:0}}>{tc.title}</h3>
                          <span className={`status-pill ${tc.isSponsored ? 'gold' : ''}`}>
                            {tc.isSponsored ? 'Sponsored' : 'General'}
                          </span>
                        </div>
                        <p className="theme-text">Theme: {tc.theme} • {tc.duration}</p>
                        <div className="meet-desc">{tc.agenda?.slice(0,120)}</div>
                      </div>
                    </div>

                    <div style={{display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end'}} className="meeting-actions">
                      <div style={{display:'flex', gap:8}}>
                        <button className="action-btn" onClick={() => alert(`Reviewing agenda for: ${tc.agenda}`)} title="Agenda"><Clipboard size={16} /></button>
                        <button className="action-btn" onClick={() => alert(`Resources needed: ${tc.needs}`)} title="Needs"><Package size={16} /></button>
                        <button className="action-btn report" onClick={() => alert(`Reference Doc for ${tc.reference}`)} title="Full Doc"><FileText size={16} /></button>
                      </div>
                      <button className="action-btn danger" onClick={() => {
                        if(window.confirm(`Delete technical card \"${tc.title}\"? This cannot be undone.`)) {
                          onDeleteTechCard && onDeleteTechCard(tc.id);
                        }
                      }} title="Delete"><Trash size={14} /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="action-row" style={{marginTop: '40px'}}>
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
    <h2 className="section-title" style={{color: '#fff', fontSize: '32px', marginBottom: '20px'}}>Meeting Archive</h2>
    <div className="glass-panel-wide">
      <p style={{opacity: 0.8, color: '#fff', marginBottom: '20px'}}>Historical records synced from drive...</p>
      {[1,2,3,4,5,6].map((i) => (
        <div className="list-item" key={i}>
          <div>
            <span className="date">Feb {10-i}, 2026</span>
            <p className="meet-title">Executive Board Sync Session {i}</p>
          </div>
          <span className="tag">#EBEC-2026-ADM-02{i}</span>
        </div>
      ))}
    </div>
  </div>
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
    setMeetings(prev => prev.map(m => m.id === meetingId ? {...m, notes: html} : m));
  };

  const handleSaveMeetingAttendance = (meetingId, attendance) => {
    setMeetings(prev => prev.map(m => m.id === meetingId ? {...m, attendance: {...m.attendance, ...attendance}} : m));
  };

  return (
    <div className="apple-bg">
      <style>{`
        :root {
          --ebec-navy: #1D355E;
          --ebec-gold: #FFC107;
          --ebec-blue: #007AFF;
          --glass-ultra: rgba(255, 255, 255, 0.25);
          --system-font: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
          --off-white: #f5f5f7;
        }

        * { box-sizing: border-box; }
        
        body, html {
          margin: 0;
          padding: 0;
          min-height: 100%;
          overflow-y: auto; 
          overflow-x: hidden;
          font-family: var(--system-font);
        }

        .apple-bg {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: #0c1a33;
          background-image: 
            radial-gradient(at 0% 0%, rgba(255, 193, 7, 0.9) 0px, transparent 65%),
            radial-gradient(at 100% 0%, rgba(0, 122, 255, 0.7) 0px, transparent 65%),
            radial-gradient(at 50% 100%, rgba(29, 53, 94, 0.8) 0px, transparent 75%);
          background-attachment: fixed;
          background-size: cover;
        }

        .glass-nav {
          background: var(--glass-ultra);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          padding: 6px 10px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 20px;
          z-index: 2000;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: sticky;
          top: 20px;
          margin-top: 20px;
        }

        .logo-circle {
          width: 38px; height: 38px; background: #fff; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }

        .nav-links span {
          font-size: 14px; font-weight: 600; color: #fff; margin: 0 15px;
          cursor: pointer; transition: 0.2s;
        }

        .sign-out-btn {
          background: #fff; color: var(--ebec-navy); border: none;
          padding: 10px 22px; border-radius: 100px; font-size: 13px; font-weight: 700;
          cursor: pointer;
        }

        .hero { margin-top: 2vh; text-align: center; width: 100%; padding-bottom: 60px; }
        .phrase-container { height: 140px; display: flex; align-items: center; justify-content: center; }
        .typing-display { font-size: 64px; font-weight: 800; letter-spacing: -3px; color: #fff; margin: 0; }
        .cursor { color: var(--ebec-gold); animation: blink 0.8s infinite; }
        .description { color: #fff; font-size: 22px; margin-bottom: 40px; }

        .carousel-container { display: flex; align-items: center; gap: 30px; width: 100%; max-width: 900px; margin: 0 auto; justify-content: center; }
        .nav-arrow { background: var(--glass-ultra); border: none; color: #fff; width: 60px; height: 60px; border-radius: 50%; cursor: pointer; }
        .main-focus-card { background: var(--glass-ultra); backdrop-filter: blur(60px); padding: 60px; border-radius: 56px; width: 600px; min-height: 400px; box-shadow: 0 50px 100px rgba(0,0,0,0.3); border: 1px solid rgba(255, 255, 255, 0.15); }
        .card-main-title { font-size: 48px; font-weight: 800; color: #fff; margin: 0; }
        .card-subtitle { font-size: 20px; color: #fff; opacity: 0.7; margin: 15px 0 40px 0; }
        .main-plus-btn { background: #fff; color: var(--ebec-navy); width: 100px; height: 100px; border-radius: 50%; border: none; cursor: pointer; display: block; margin: 0 auto; transition: 0.3s; }
        .main-plus-btn:hover { transform: scale(1.1); background: var(--ebec-gold); }

        .dot { width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.3); border: none; margin: 0 5px; cursor: pointer; }
        .dot.active { background: #fff; width: 32px; border-radius: 10px; }

        /* Quick summary under hero */
        .quick-summary { display:flex; gap:16px; justify-content:center; margin-top:18px; max-width:900px; margin-left:auto; margin-right:auto; }
        .stat-card { background: rgba(255,255,255,0.06); border-radius:14px; padding:18px 22px; min-width:150px; color:#fff; text-align:center; box-shadow: 0 6px 20px rgba(0,0,0,0.18); border:1px solid rgba(255,255,255,0.04); }
        .stat-value { font-size:28px; font-weight:900; color:var(--ebec-gold); }
        .stat-label { font-size:13px; margin-top:6px; color:#dfe7ff; font-weight:800; }
        .stat-note { font-size:12px; color:rgba(255,255,255,0.6); margin-top:6px; }
        .action-card { background: linear-gradient(135deg, rgba(255,193,7,0.14), rgba(0,122,255,0.06)); }
        .quick-actions { display:flex; gap:8px; justify-content:center; margin-top:10px; }
        .quick-btn { background: #fff; color: var(--ebec-navy); border: none; padding:8px 12px; border-radius: 10px; font-weight:700; cursor:pointer; }
        .quick-btn.secondary { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.12); }

        .mgmt-section { width: 100%; background: var(--off-white); padding: 80px 20px; border-radius: 60px 60px 0 0; display: flex; justify-content: center; }
        .mgmt-content { max-width: 1000px; width: 100%; }
        .mgmt-heading { font-size: 32px; font-weight: 800; color: var(--ebec-navy); margin: 0; }
        .mgmt-sub { font-size: 18px; color: #666; margin: 5px 0 0 0; }
        .btn-icon-plus { background: var(--ebec-navy); color: #fff; border: none; padding: 12px 24px; border-radius: 100px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }

        /* Grid layout for cards */
        .meetings-list, .tech-cards-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-top: 20px; }
        .meeting-card { background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%); border-radius: 16px; padding: 18px; display: flex; flex-direction: column; gap:12px; border: 1px solid #f0f3f6; transition: transform 0.18s, box-shadow 0.18s; }
        .meeting-card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(15,30,60,0.06); }
        
        .meeting-main-info { display: flex; align-items: flex-start; gap: 16px; }
        .meeting-date-pill { background: #f0f4f8; border-radius: 16px; padding: 10px; width: 60px; display: flex; flex-direction: column; align-items: center; }
        .meeting-date-pill.tech-pill { background: #fff8e1; color: #f57f17; }
        .m-day { font-size: 20px; font-weight: 800; color: var(--ebec-navy); }
        .m-month { font-size: 11px; font-weight: 700; color: var(--ebec-blue); text-transform: uppercase; }
        
        .meeting-details h3 { margin: 0; font-size: 18px; color: #1f2a37; font-weight: 800; }
        .meeting-details p { margin: 6px 0 0 0; font-size: 13px; color: #6b7684; }
        .meet-desc { margin:8px 0 0 0; color:#556; font-size:13px; }

        .avatar-list { display:flex; gap:8px; margin-top:10px; }
        .avatar { width:36px; height:36px; border-radius:10px; background:#eef4ff; display:flex; align-items:center; justify-content:center; font-weight:800; color: #0b3a8a; font-size:12px; border: 1px solid rgba(11,58,138,0.06); }
        .theme-text { color: var(--ebec-blue) !important; font-weight: 600; }

        .status-pill { padding: 4px 10px; border-radius: 100px; font-size: 10px; font-weight: 800; background: #eee; color: #888; text-transform: uppercase; }
        .status-pill.gold { background: var(--ebec-gold); color: #000; }

        .action-btn { background: #f7fafc; border: none; padding: 8px 12px; border-radius: 10px; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #2f3b47; cursor: pointer; transition: 0.12s; border: 1px solid #eef3f6; }
        .action-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
        .action-btn.report { background: rgba(255, 193, 7, 0.1); color: #d68100; }
        .action-btn.danger { background: #fff7f7; color: #9b2c2c; border: 1px solid #ffe6e6; }
        .action-btn.danger:hover { box-shadow: 0 8px 22px rgba(155,44,44,0.06); transform: translateY(-3px); }

        /* Improved focus states and form polish */
        .form-input-full:focus, .form-input-title:focus, .form-textarea:focus, .form-input-half:focus { outline: none; box-shadow: 0 6px 18px rgba(0,122,255,0.12); border-color: rgba(0,122,255,0.6); }
        .form-input-title::placeholder { color: rgba(0,0,0,0.25); }

        /* Attendee grid improvements */
        .attendee-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; max-height: 240px; overflow: auto; padding-right: 6px; }
        .attendee-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
        .attendee-pill { background:#fff; border-radius: 10px; padding:10px; display:flex; gap:12px; cursor:pointer; align-items:center; border:1px solid #f4f6f9; transition:0.12s; }
        .attendee-pill:hover { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(0,0,0,0.06); }
        .attendee-pill.active { background: linear-gradient(90deg, rgba(0,122,255,0.06), rgba(29,53,94,0.02)); border-color: rgba(0,122,255,0.08); }
        .attendee-pill .check-circle { width:26px; height:26px; }
        .attendee-pill .pill-text { display:flex; flex-direction:column; }
        .pill-name { font-size:15px; font-weight:800; color:#1f2a37; }
        .pill-role { font-size:12px; color:#94a0ad; margin-top:4px; font-weight:600; }

        /* Empty state CTA */
        .empty-state { padding: 40px; text-align: center; color: #aaa; border: 2px dashed #eee; border-radius: 20px; display:flex; flex-direction:column; gap:12px; align-items:center; }
        .empty-state .cta { background: var(--ebec-navy); color:#fff; padding:10px 16px; border-radius:12px; border:none; font-weight:800; cursor:pointer; }
        
        /* New Tech Form Styles */
        .tech-card-form { max-width: 800px !important; }
        .ref-badge { background: var(--ebec-navy); color: #fff; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; margin-top: 8px; display: inline-block; }
        .form-section { border-top: 1px solid #f0f0f0; padding-top: 20px; }
        .section-label { font-weight: 800; color: #333; display: block; margin-bottom: 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
        .duration-toggle { display: flex; gap: 10px; }
        .toggle-btn { flex: 1; padding: 10px; border-radius: 12px; border: 1px solid #ddd; background: #fff; cursor: pointer; font-weight: 600; color: #777; transition: 0.2s; }
        .toggle-btn.active { background: var(--ebec-navy); color: #fff; border-color: var(--ebec-navy); }
        .input-group { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .input-group span { font-size: 12px; color: #888; font-weight: 600; }
        .input-group input { padding: 10px; border: 1px solid #ddd; border-radius: 10px; }
        .input-block { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .input-block label { font-size: 13px; font-weight: 700; color: #555; }
        .input-block textarea { height: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 12px; outline: none; }
        
        .external-list-builder { background: #f9f9f9; padding: 15px; border-radius: 16px; }
        .sub-hint { font-size: 12px; color: #888; margin-bottom: 10px; font-weight: 600; }
        .add-external-row { display: flex; gap: 8px; margin-bottom: 15px; }
        .add-external-row input { flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; }
        .add-external-row button { background: var(--ebec-blue); color: #fff; border: none; width: 36px; border-radius: 8px; cursor: pointer; }
        .guest-pills { display: flex; flex-wrap: wrap; gap: 6px; }
        .guest-pill { background: #fff; border: 1px solid #eee; padding: 4px 10px; border-radius: 100px; font-size: 12px; color: #555; }

        .empty-state { padding: 40px; text-align: center; color: #aaa; border: 2px dashed #eee; border-radius: 20px; }
        .mt-12 { margin-top: 48px; }
        .mt-2 { margin-top: 8px; }
        .flex-row { display: flex; }
        .items-center { align-items: center; }
        .gap-2 { gap: 8px; }

        .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); z-index: 5000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .google-style-form { background: #fff; width: 100%; max-width: 650px; border-radius: 28px; display: flex; flex-direction: column; overflow: hidden; max-height: 90vh; }
        .form-header { padding: 24px 32px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
        .form-body { padding: 36px; overflow-y: auto; display: flex; flex-direction: column; gap: 28px; }
        .form-input-title { font-size: 28px; border: none; border-bottom: 2px solid #eee; padding-bottom: 10px; font-weight: 700; outline: none; }
        .form-input-full { padding: 12px 16px; border: 1px solid #eee; border-radius: 12px; font-size: 15px; }
        .form-textarea { padding: 14px 16px; border: 1px solid #eee; border-radius: 12px; height: 220px; font-family: inherit; resize: vertical; }
        .google-style-form.meeting-form .form-textarea { height: 240px; }
        .form-row { display: flex; gap: 15px; }
        .form-footer { padding: 24px 32px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 15px; }

        .toggle-item { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .toggle-switch { width: 36px; height: 20px; background: #ccc; border-radius: 20px; position: relative; transition: 0.3s; }
        .toggle-switch::after { content: ''; position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: 0.3s; }
        .toggle-switch.on { background: var(--ebec-navy); }
        .toggle-switch.on::after { left: 18px; }

        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 50% { opacity: 0; } }

        /* Notes editor styles */
        .notes-editor { background: #fff; min-height: 300px; max-height: 480px; overflow:auto; }
        .close-btn { background: transparent; border: none; font-size: 26px; cursor: pointer; color:#333; }

        /* Form buttons - clean, modern */
        .btn-form-primary { background: var(--ebec-navy); color: #fff; border: none; padding: 12px 20px; border-radius: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 12px 30px rgba(29,53,94,0.08); transition: transform .12s, box-shadow .12s; }
        .btn-form-primary:hover { transform: translateY(-3px); box-shadow: 0 18px 40px rgba(29,53,94,0.12); }
        .btn-form-secondary { background: transparent; color: #555; border: 1px solid #f0f2f5; padding: 10px 16px; border-radius: 12px; font-weight: 700; cursor: pointer; }

        .quick-btn { background: #f7f8fa; color: #223; border: 1px solid #eef2f6; padding:8px 12px; border-radius:12px; font-weight:800; cursor:pointer; box-shadow: 0 6px 18px rgba(20,30,50,0.04); }
        .quick-btn.secondary { background: transparent; color:#556; border:1px solid #eef2f6; }
        .meet-desc { color: #666; margin-top:6px; font-size:13px; max-width:560px; }

        /* Attendee section spacing and card look */
        .attendee-section { margin-top: 12px; padding: 14px; background: #fff; border-radius: 12px; border: 1px solid #f3f5f7; box-shadow: 0 6px 18px rgba(30,40,60,0.04); }
        .attendee-section > .attendee-grid { margin-top: 10px; padding-top: 6px; }

        /* spacing between sections */
        .form-section + .attendee-section, .attendee-section + .form-section { margin-top: 18px; }
      `}</style>

      <nav className="glass-nav">
        <div className="logo-circle">
            <span style={{fontSize: '10px', fontWeight: 'bold', color: 'var(--ebec-navy)'}}>EBEC</span>
        </div>
        <div className="nav-links">
          <span onClick={() => setPage('home')}>Home</span>
          <span>Activities</span>
          <span>Attendance</span>
          <span onClick={() => setPage('archive')}>Archive</span>
        </div>
        <button className="sign-out-btn">SG Profile</button>
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
    </div>
  );
}