import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Hash, ChevronLeft, ChevronRight, UserCheck, Clipboard, FileText, Trash, Edit3, Archive as ArchiveIcon, Search, Copy, ExternalLink, QrCode } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { getPhrasesForUser, getRoleLabel } from '../utils/rolePhrases';
import Toast from '../components/Toast';
import NotesEditor from './Meetings/NotesEditor';
import AttendanceModal from './Meetings/AttendanceModal';
import ReportGenerator from './Meetings/ReportGenerator';
import MeetingQR from './Meetings/MeetingQR';
import EditMeetingModal from './Dashboard/EditMeetingModal';
import EditTechnicalCardModal from './TechCards/TechCardEdit';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, isVP, isApproved } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [techCards, setTechCards] = useState([]);
  const [refCounter, setRefCounter] = useState(1);
  const [meetingSearch, setMeetingSearch] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [activeCard, setActiveCard] = useState(0);
  const [notification, setNotification] = useState(null);
  const [openNotesFor, setOpenNotesFor] = useState(null);
  const [openAttendanceFor, setOpenAttendanceFor] = useState(null);
  const [openReportFor, setOpenReportFor] = useState(null);
  const [editMeeting, setEditMeeting] = useState(null);
  const [editTechCard, setEditTechCard] = useState(null);
  const [openQRFor, setOpenQRFor] = useState(null);
  const [judgments, setJudgments] = useState([]);
  const [phrases, setPhrases] = useState([]);
  const [roleLabel, setRoleLabel] = useState('Team Member');

  const VP_EMAIL = 'leena.ikhlef@ensia.edu.dz';
  const currentRef = `${String(refCounter).padStart(2, '0')}/26`;

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    async function loadData() {
      try {
        let managerRole = null;
        let managerDepartment = null;
        if (user?.email) {
          const { data: managerData } = await supabase
            .from('managers')
            .select('role, department')
            .eq('email', user.email)
            .eq('season', '2026-2027')
            .limit(1);
          if (managerData && managerData.length > 0) {
            managerRole = managerData[0].role;
            managerDepartment = managerData[0].department;
          }
        }
        const resolvedPhrases = getPhrasesForUser({
          profileRole: profile?.role,
          managerRole,
          managerDepartment,
          email: user?.email,
          vpEmail: VP_EMAIL
        });
        setPhrases(resolvedPhrases);
        setRoleLabel(getRoleLabel({ profileRole: profile?.role, managerRole, managerDepartment }));

        const { data: meetingsData } = await supabase
          .from('meetings')
          .select('*')
          .eq('season', '2026-2027')
          .order('id', { ascending: false });

        const { data: techCardsData } = await supabase
          .from('tech_cards')
          .select('*')
          .order('id', { ascending: false });

        setMeetings(meetingsData || []);

        const allCards = techCardsData || [];
        const archived = allCards.filter(tc => {
          if (!tc.reference) return false;
          const num = parseInt(tc.reference.split('/')[0]) || 0;
          return num < 8 && !tc.isArchived;
        });
        for (const tc of archived) {
          await supabase.from('tech_cards').update({ isArchived: true }).eq('id', tc.id);
        }
        const updatedCards = allCards.map(tc => {
          if (archived.find(a => a.id === tc.id)) return { ...tc, isArchived: true };
          return tc;
        });
        setTechCards(updatedCards.filter(tc => {
          if (!tc.reference) return true;
          const num = parseInt(tc.reference.split('/')[0]) || 0;
          return num >= 8;
        }));

        const occupiedRefs = updatedCards
          .map(tc => { if (!tc.reference) return 0; return parseInt(tc.reference.split('/')[0]) || 0; })
          .filter(n => n >= 8);
        let nextRef = 8;
        while (occupiedRefs.includes(nextRef)) nextRef++;
        setRefCounter(nextRef);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    }
    loadData();
  }, [user, profile]);

  useEffect(() => {
    if (isVP) {
      supabase
        .from('sg_judgments')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data }) => setJudgments(data || []));
    }
  }, [isVP]);

  useEffect(() => {
    if (phrases.length === 0) return;
    const handleTyping = () => {
      const currentPhrase = phrases[phraseIndex % phrases.length];
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
  }, [displayText, isDeleting, phraseIndex, phrases]);

  const handleDeleteMeeting = async (id) => {
    const { error } = await supabase.from('meetings').delete().eq('id', id);
    if (!error) setMeetings(prev => prev.filter(m => m.id !== id));
  };

  const handleUpdateMeeting = async (updatedMeeting) => {
    const { id, ...updateData } = updatedMeeting;
    const { data, error } = await supabase.from('meetings').update(updateData).eq('id', id).select();
    if (!error && data && data.length > 0) {
      setMeetings(prev => prev.map(m => m.id === data[0].id ? data[0] : m));
    }
  };

  const handleDeleteTechCard = async (id) => {
    const { error } = await supabase.from('tech_cards').delete().eq('id', id);
    if (!error) {
      const updatedCards = techCards.filter(tc => tc.id !== id);
      setTechCards(updatedCards);
      const occupiedRefs = updatedCards
        .map(tc => { if (!tc.reference) return 0; return parseInt(tc.reference.split('/')[0]) || 0; })
        .filter(n => n >= 8);
      let nextRef = 8;
      while (occupiedRefs.includes(nextRef)) nextRef++;
      setRefCounter(nextRef);
    }
  };

  const handleArchiveTechCard = async (id) => {
    const { data, error } = await supabase.from('tech_cards').update({ isArchived: true }).eq('id', id).select();
    if (!error && data && data.length > 0) {
      setTechCards(prev => prev.map(tc => tc.id === id ? data[0] : tc));
    }
  };

  const handleUpdateTechCard = async (updatedCard) => {
    const { id, ...updateData } = updatedCard;
    const { data, error } = await supabase.from('tech_cards').update(updateData).eq('id', id).select();
    if (!error && data && data.length > 0) {
      const saved = data[0];
      const updatedCards = techCards.map(tc => tc.id === saved.id ? saved : tc);
      setTechCards(updatedCards);
      const occupiedRefs = updatedCards
        .map(tc => { if (!tc.reference) return 0; return parseInt(tc.reference.split('/')[0]) || 0; })
        .filter(n => n >= 8);
      let nextRef = 8;
      while (occupiedRefs.includes(nextRef)) nextRef++;
      setRefCounter(nextRef);
    }
  };

  const handleSaveMeetingNotes = async (meetingId, html) => {
    const { data, error } = await supabase.from('meetings').update({ notes: html }).eq('id', meetingId).select();
    if (!error && data && data.length > 0) {
      setMeetings(prev => prev.map(m => m.id === meetingId ? data[0] : m));
    }
  };

  const handleSaveMeetingAttendance = async (meetingId, attendance) => {
    const { data, error } = await supabase.from('meetings').update({ attendance }).eq('id', meetingId).select();
    if (!error && data && data.length > 0) {
      setMeetings(prev => prev.map(m => m.id === meetingId ? data[0] : m));
    }
  };

  const handleSaveMeetingReport = async (meetingId, report) => {
    const { data, error } = await supabase.from('meetings').update({ report }).eq('id', meetingId).select();
    if (!error && data && data.length > 0) {
      setMeetings(prev => prev.map(m => m.id === meetingId ? data[0] : m));
    }
  };

  const allCards = [
    ...(isApproved ? [
      { title: "Add New Meeting", subtitle: "Sync with board members", icon: <Plus size={48} />, action: () => navigate('/meetings/new') },
      { title: "Add Technical Card", subtitle: "Update logistics & materials", icon: <Plus size={48} />, action: () => navigate('/techcards/new') },
      { title: "Reference Tracker", subtitle: `Next Ref: #${currentRef}`, icon: <Hash size={48} />, action: () => { const val = prompt("Update Reference Number Basis (e.g. 01):", refCounter.toString()); if (val) setRefCounter(parseInt(val) || refCounter); } },
    ] : []),
    { title: "See Archive", subtitle: "View past documentation", icon: <ArchiveIcon size={48} />, action: () => navigate('/archive') }
  ];
  const cards = allCards;

  const nextCard = () => setActiveCard((prev) => (prev + 1) % cards.length);
  const prevCard = () => setActiveCard((prev) => (prev - 1 + cards.length) % cards.length);


  return (
    <>
      <Toast message={notification?.message} type={notification?.type} onDone={() => setNotification(null)} />

      {!user && (
        <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 100 }}>
          <button onClick={() => navigate('/')} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', padding: '8px 16px', borderRadius: 12, cursor: 'pointer',
            fontSize: 12, fontWeight: 600, backdropFilter: 'blur(12px)',
          }}>Sign In</button>
        </div>
      )}

      <div className="hero fade-in">
        <div className="phrase-container">
          <h1 className="typing-display">
            {displayText || (phrases.length > 0 ? '' : 'Welcome')}<span className="cursor">|</span>
          </h1>
        </div>
      </div>

      <p className="description">{roleLabel ? `${roleLabel} — What's on the mind today?` : "What's on the mind of the team today?"}</p>

      <div className="carousel-container">
        <button className="nav-arrow" onClick={prevCard}><ChevronLeft size={32} /></button>
        <div className="main-focus-card">
          <div className="card-content-wrap card-anim" key={activeCard}>
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
          <button key={idx} className={`dot ${activeCard === idx ? 'active' : ''}`} onClick={() => setActiveCard(idx)} />
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
          {isApproved && (
          <div className="quick-actions">
            <button className="quick-btn" onClick={() => navigate('/meetings/new')}>
              <Plus size={14} /> New Meeting
            </button>
            <button className="quick-btn secondary" onClick={() => navigate('/techcards/new')}>
              <Plus size={14} /> New Card
            </button>
          </div>
          )}
        </div>
      </div>

      <section className="mgmt-section">
        <div className="mgmt-content">
          <div className="mgmt-header-block flex-between" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <h2 className="mgmt-heading" style={{ margin: 0 }}>My meetings</h2>
              <div className="premium-search-container" style={{ minWidth: 320 }}>
                <div className="search-icon-wrapper"><Search size={14} /></div>
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
            {isVP && (
            <button className="btn-icon-plus" onClick={() => navigate('/meetings/new')}>
              <Plus size={14} /> Create New Meeting
            </button>
            )}
          </div>

          <div className="mgmt-grid">
            {meetings.length === 0 ? (
              <div className="empty-state">
                <p>No meetings scheduled yet.</p>
                <button className="cta" onClick={() => navigate('/meetings/new')}>Create first meeting</button>
              </div>
            ) : (
              [...meetings]
                .filter(m => m.title.toLowerCase().includes(meetingSearch.toLowerCase()) || m.date.includes(meetingSearch))
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((m, idx) => {
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
                          <UserCheck size={12} /> <span>{Object.values(m.attendance || {}).filter(s => s === 'present' || s === 'late').length}</span>
                        </div>
                        <div className="stat-item" title="Notes">
                          <Clipboard size={12} /> <span>{m.notes ? 'Saved' : '0'}</span>
                        </div>
                        <div className="stat-item" title="Report Status">
                          <FileText size={12} /> <span>{m.report ? (m.report.type === 'pdf' ? 'PDF' : 'LaTeX') : '0'}</span>
                        </div>
                      </div>
                      <div className="premium-card-footer">
                        {isApproved && (
                        <>
                        <button className="footer-action-btn" title="Attendance" onClick={() => setOpenAttendanceFor(m.id)}>
                          <UserCheck size={12} />
                        </button>
                        <button className="footer-action-btn" title="Meeting Notes" onClick={() => setOpenNotesFor(m.id)}>
                          <Clipboard size={12} />
                        </button>
                        <button className="footer-action-btn" title="Edit Meeting" onClick={() => setEditMeeting(m)}>
                          <Edit3 size={12} />
                        </button>
                        <button className="footer-action-btn report" title="Meeting Report" onClick={() => setOpenReportFor(m.id)}>
                          <FileText size={12} />
                        </button>
                        {m.checkin_token && (
                        <button className="footer-action-btn" title="Check-in QR" onClick={() => setOpenQRFor(m)}>
                          <QrCode size={12} />
                        </button>
                        )}
                        <button className="footer-delete-btn" title="Delete Meeting" onClick={() => {
                          if (window.confirm(`Delete meeting?`)) handleDeleteMeeting(m.id);
                        }}>
                          <Trash size={16} />
                        </button>
                        </>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          <div className="mgmt-header-block flex-between mt-12" style={{ alignItems: 'center' }}>
            <div>
              <h2 className="mgmt-heading">Technical Logistics</h2>
              <p className="mgmt-sub">Manage activity references and materials</p>
            </div>
            {isVP && (
            <button className="btn-icon-plus" onClick={() => navigate('/techcards/new')}>
              <Plus size={14} /> Create New Card
            </button>
            )}
          </div>

          <div className="mgmt-grid">
            {techCards.filter(tc => !tc.isArchived).length === 0 ? (
              <div className="empty-state">
                <p>No active technical cards for 2026.</p>
                <button className="cta" onClick={() => navigate('/techcards/new')}>Create 01/26 Card</button>
              </div>
            ) : (
              techCards.filter(tc => !tc.isArchived).map((tc, idx) => {
                const isGoldTheme = idx % 2 === 0;
                return (
                  <div className="premium-card fade-in" key={tc.id}>
                    <div className={`date-visual-square ${isGoldTheme ? 'gold-theme' : ''}`}>
                      <span className="dv-month">LOGISTICS</span>
                      <span className="dv-day" style={{ fontSize: '38px', letterSpacing: '-1px' }}>{tc.reference}</span>
                      <span className="dv-time">EBEC • 2026</span>
                    </div>
                    <div className="card-info-block">
                      <div className="flex-between items-center mb-1">
                        <span style={{ fontSize: 9, fontWeight: 900, background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>{tc.duration}</span>
                        {tc.isSponsored && <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--ebec-gold)', textTransform: 'uppercase' }}>Sponsored</span>}
                      </div>
                      <h3>{tc.title}</h3>
                      <p>{tc.theme} • {tc.attendeeType} Access {tc.location && <span style={{ opacity: 0.8 }}>• {tc.location}</span>}</p>
                    </div>
                    <div className="stats-summary-row">
                      <div className="stat-item" title="External Guests">
                        <UserCheck size={12} /> <span>{tc.externalAttendees?.length || 0} Guests</span>
                      </div>
                      <div className="stat-item" title="Agenda Status">
                        <Clipboard size={12} /> <span>{tc.agenda ? 'Built' : 'Draft'}</span>
                      </div>
                    </div>
                    <div className="premium-card-footer">
                      <button className="footer-action-btn" title="Copy All Card Info" onClick={(e) => {
                        e.stopPropagation();
                        const info = `Technical Card: ${tc.reference}\n\nTitle: ${tc.title}\nTheme: ${tc.theme}\nDuration: ${tc.duration}\nLocation: ${tc.location || 'Not specified'}\nAttendee Type: ${tc.attendeeType}\n\nObjectives:\n${tc.objectives || 'N/A'}\n\nAgenda:\n${tc.agenda || 'N/A'}\n\nNeeds & Logistics:\n${tc.needs || 'N/A'}\n\nExternal Guests: ${tc.externalAttendees?.length || 0}\n${tc.externalAttendees?.map(g => `- ${g.name} (${g.email || 'No email'})`).join('\n') || ''}\n\nSponsored: ${tc.isSponsored ? 'Yes - ' + (tc.sponsorName || 'N/A') : 'No'}\n\nGoogle Doc: ${tc.docUrl || 'Not linked'}`;
                        navigator.clipboard.writeText(info).then(() => showNotification('✓ Copied to clipboard!')).catch(() => showNotification('Failed to copy', 'error'));
                      }} style={{ background: 'rgba(255, 193, 7, 0.1)', color: '#FFC107' }}>
                        <Copy size={14} />
                      </button>
                      {tc.docUrl ? (
                        <button className="footer-action-btn" title="Open Google Doc" onClick={(e) => { e.stopPropagation(); window.open(tc.docUrl, '_blank', 'noopener,noreferrer'); }} style={{ background: 'rgba(52, 199, 89, 0.1)', color: '#34c759' }}>
                          <FileText size={14} />
                        </button>
                      ) : (
                        <button className="footer-action-btn" title="Create Google Doc" onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const payload = {
                              ref_num: tc.reference, date_write: new Date().toLocaleDateString('en-GB'),
                              type: tc.activityType || 'scientific', title: tc.title,
                              place_name: tc.location || "TBD", is_inside: tc.isIndoor,
                              day_name: '', date_activity: tc.startTime ? new Date(tc.startTime).toLocaleDateString('en-GB') : '',
                              time_from: '', time_to: '', target_group: tc.attendeeType || 'School', coordination: "",
                              objectives: tc.objectives || '', themes: tc.theme || '',
                              needs: tc.needs || '', agenda: tc.agenda || '', is_sponsored: tc.isSponsored || false
                            };
                            const res = await fetch("https://script.google.com/macros/s/AKfycbyehjXK9isbudF-O6JIRIo3Wx0KZpnKENSKJcPYlybi_79UubGsH7dJXUNnKsqQAcwGZw/exec", {
                              method: "POST", body: JSON.stringify(payload)
                            });
                            const data = await res.json();
                            if (data.status === 'success' && data.url) {
                              await supabase.from('tech_cards').update({ docUrl: data.url }).eq('id', tc.id);
                              setTechCards(prev => prev.map(c => c.id === tc.id ? { ...c, docUrl: data.url } : c));
                              window.open(data.url, '_blank');
                              showNotification('✓ Google Doc created!');
                            } else {
                              showNotification('⚠️ Google Doc creation failed', 'error');
                            }
                          } catch (err) {
                            showNotification('⚠️ Failed to connect to Google Script', 'error');
                          }
                        }} style={{ background: 'rgba(52, 199, 89, 0.1)', color: '#34c759' }}>
                          <FileText size={14} />
                        </button>
                      )}
                      {isVP && (
                      <>
                      <button className="footer-action-btn" title="Edit Card" onClick={(e) => { e.stopPropagation(); setEditTechCard(tc); }} style={{ background: 'rgba(0, 113, 227, 0.1)', color: '#0071e3' }}>
                        <Edit3 size={14} />
                      </button>
                      <button className="footer-delete-btn" title="Delete" onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`PERMANENTLY DELETE "${tc.title}"?`)) {
                          handleDeleteTechCard(tc.id);
                          showNotification('Card deleted permanently', 'error');
                        }
                      }}>
                        <Trash size={16} />
                      </button>
                      </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="action-row" style={{ marginTop: '40px' }}>
            <button className="mgmt-btn secondary">Sync Google Drive</button>
            <button className="mgmt-btn primary" onClick={() => navigate('/archive')}>Full Archive</button>
          </div>

          {isVP && (
            <div className="judgment-board-container mt-12">
              <div className="flex-between items-center mb-8" style={{ flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 className="mgmt-heading" style={{ color: '#1d1d1f' }}>The Judgment Board</h2>
                  <p className="mgmt-sub">The truth revealed. Who is loyal and who is not?</p>
                </div>
                <div style={{ background: '#000', color: '#fff', padding: '10px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>
                  VP EXCLUSIVE ACCESS
                </div>
              </div>
              <div className="mgmt-grid judgment-grid">
                <div className="judgment-column">
                  <h3 style={{ color: '#ff3b30', fontSize: '14px', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Traitors (Said you are annoying)</h3>
                  {judgments.filter(j => j.judgment === 'annoying').length === 0 ? (
                    <p style={{ color: '#888', fontSize: '13px' }}>Clear skies. No traitors detected... yet.</p>
                  ) : (
                    judgments.filter(j => j.judgment === 'annoying').map(j => (
                      <div key={j.id} className="list-item" style={{ background: '#fff5f5', border: '1px solid rgba(255, 59, 48, 0.1)' }}>
                        <div className="member-avatar" style={{ background: '#ff3b30', color: '#fff' }}>{j.name.split(' ').map(n => n[0]).join('')}</div>
                        <div className="member-info">
                          <span className="member-name" style={{ color: '#ff3b30' }}>{j.name}</span>
                          <span className="member-role">{j.role}</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#ff3b30', fontWeight: '800' }}>TREASON</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="judgment-column">
                  <h3 style={{ color: '#34c759', fontSize: '14px', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Loyalists (Said you are amazing)</h3>
                  {judgments.filter(j => j.judgment === 'amazing').length === 0 ? (
                    <p style={{ color: '#888', fontSize: '13px' }}>Nobody has confessed their love today.</p>
                  ) : (
                    judgments.filter(j => j.judgment === 'amazing').map(j => (
                      <div key={j.id} className="list-item" style={{ background: '#f5fff5', border: '1px solid rgba(52, 199, 89, 0.1)' }}>
                        <div className="member-avatar" style={{ background: '#34c759', color: '#fff' }}>{j.name.split(' ').map(n => n[0]).join('')}</div>
                        <div className="member-info">
                          <span className="member-name" style={{ color: '#34c759' }}>{j.name}</span>
                          <span className="member-role">{j.role}</span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#34c759', fontWeight: '800' }}>LOYAL</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {openNotesFor && (
        <NotesEditor
          meeting={meetings.find(m => m.id === openNotesFor)}
          onClose={() => setOpenNotesFor(null)}
          onSave={handleSaveMeetingNotes}
        />
      )}

      {openAttendanceFor && (
        <AttendanceModal
          meeting={meetings.find(m => m.id === openAttendanceFor)}
          onClose={() => setOpenAttendanceFor(null)}
          onSave={handleSaveMeetingAttendance}
        />
      )}

      {openReportFor && (
        <ReportGenerator
          meeting={meetings.find(m => m.id === openReportFor)}
          onClose={() => setOpenReportFor(null)}
          onSave={handleSaveMeetingReport}
        />
      )}

      {openQRFor && (
        <MeetingQR meeting={openQRFor} onClose={() => setOpenQRFor(null)} />
      )}

      {editMeeting && (
        <EditMeetingModal
          meeting={editMeeting}
          onCancel={() => setEditMeeting(null)}
          onSubmit={(data) => { handleUpdateMeeting(data); setEditMeeting(null); }}
        />
      )}

      {editTechCard && (
        <EditTechnicalCardModal
          card={editTechCard}
          onCancel={() => setEditTechCard(null)}
          onUpdate={(updatedData, onComplete) => {
            handleUpdateTechCard(updatedData);
            if (onComplete) {
              setTimeout(() => { onComplete(); setEditTechCard(null); }, 1000);
            }
          }}
        />
      )}
    </>
  );
}
