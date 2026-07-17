import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Clipboard, UserCheck, Calendar, MapPin, Clock, ExternalLink, Copy, Check, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Toast from '../../components/Toast';

export default function ArchivePage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [techCards, setTechCards] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('2025-2026');
  const [expandedSection, setExpandedSection] = useState('meetings');
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMeeting, setViewMeeting] = useState(null);
  const [viewTechCard, setViewTechCard] = useState(null);
  const [copied, setCopied] = useState(false);

  const seasons = ['2026-2027', '2025-2026'];

  useEffect(() => {
    async function loadData() {
      const { data: m, error: me } = await supabase.from('meetings').select('*').order('date', { ascending: false });
      const { data: tc, error: te } = await supabase.from('tech_cards').select('*').order('id', { ascending: false });
      if (me) console.error('Archive meetings fetch error:', me.message);
      if (te) console.error('Archive tech_cards fetch error:', te.message);
      console.log('Archive loaded:', { meetings: m?.length, techCards: tc?.length, sampleMeeting: m?.[0], sampleCard: tc?.[0] });
      setMeetings(m || []);
      setTechCards(tc || []);
    }
    loadData();
  }, []);

  const showNotification = (msg, type = 'success') => { setNotification({ msg, type }); setTimeout(() => setNotification(null), 3000); };

  const filteredMeetings = meetings.filter(m => {
    const s = m.season || '2025-2026';
    const matchSeason = selectedSeason === '2025-2026' ? (s === '2025-2026' || s === '2025') : s === selectedSeason;
    return matchSeason && (m.title?.toLowerCase().includes(searchTerm.toLowerCase()) || m.date?.includes(searchTerm));
  });
  const filteredCards = techCards.filter(c => {
    const s = c.season || '2025-2026';
    const matchSeason = selectedSeason === '2025-2026' ? (s === '2025-2026' || s === '2025') : s === selectedSeason;
    return matchSeason && (c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || c.reference?.toLowerCase().includes(searchTerm));
  });

  const getAttendanceSummary = (attendance) => {
    if (!attendance || Object.keys(attendance).length === 0) return null;
    const present = Object.values(attendance).filter(s => s === 'present').length;
    const late = Object.values(attendance).filter(s => s === 'late').length;
    const total = Object.keys(attendance).length;
    return { present, late, total };
  };

  return (
    <div className="dashboard-content fade-in">
      <Toast message={notification?.msg} type={notification?.type} onDone={() => setNotification(null)} />

      <div className="glass-panel-wide" style={{ textAlign: 'center', marginBottom: 24, position: 'relative' }}>
        <button onClick={() => navigate('/dashboard')} style={{ position: 'absolute', left: 24, top: 24, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: 13, fontWeight: 700, transition: '0.2s' }}
          onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}>
          <ArrowLeft size={16} /> Back
        </button>
        <h2 style={{ color: '#fff', fontSize: 28, marginBottom: 10 }}>Mandate Archive</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 auto' }}>Browse all meetings, notes, reports, and technical cards across seasons.</p>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
        <div className="season-tabs">
          {seasons.map(s => (
            <button key={s} className={`season-tab ${selectedSeason === s ? 'active' : ''}`} onClick={() => setSelectedSeason(s)}>
                  {s === '2025-2026' ? '2025-2026 (Archived)' : `Mandate ${s}`}
            </button>
          ))}
        </div>
        <div className="premium-search-container" style={{ width: 320 }}>
          <div className="search-icon-wrapper"><Search size={14} /></div>
          <input type="text" placeholder="Search by title, date, or reference..." className="cute-search-input" style={{ width: '100%' }}
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button className={`pill-btn ${expandedSection === 'meetings' ? '' : 'secondary'}`} onClick={() => setExpandedSection('meetings')}>
          Meetings ({filteredMeetings.length})
        </button>
        <button className={`pill-btn ${expandedSection === 'cards' ? '' : 'secondary'}`} onClick={() => setExpandedSection('cards')}>
          Tech Cards ({filteredCards.length})
        </button>
      </div>

      {expandedSection === 'meetings' && (
        <div className="mgmt-grid">
          {filteredMeetings.length === 0 ? (
            <div className="archive-empty-state" style={{ gridColumn: '1 / -1' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>No meetings found for this season.</p>
            </div>
          ) : filteredMeetings.map(m => {
            const stats = getAttendanceSummary(m.attendance);
            const hasNotes = m.notes && m.notes.replace(/<[^>]*>/g, '').trim().length > 0;
            const hasReport = m.report && (m.report.fileUrl || m.report.content);
            return (
              <div key={m.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 14, cursor: 'pointer' }}
                onClick={() => setViewMeeting(m)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ebec-gold)', letterSpacing: 0.5 }}>{m.date || 'No date'}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{m.time || ''}</span>
                    </div>
                    <h4 style={{ margin: 0, fontSize: 16, color: '#fff', fontWeight: 700 }}>{m.title}</h4>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                      {m.reference || 'N/A'} {m.venue ? `• ${m.venue}` : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {hasNotes && (
                      <span title="Has notes" style={{ background: 'rgba(0,113,227,0.15)', color: '#0071e3', padding: '3px 8px', borderRadius: 8, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clipboard size={10} /> NOTES
                      </span>
                    )}
                    {hasReport && (
                      <span title="Has report" style={{ background: 'rgba(52,199,89,0.15)', color: '#34c759', padding: '3px 8px', borderRadius: 8, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FileText size={10} /> REPORT
                      </span>
                    )}
                  </div>
                </div>
                {stats && (
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                    <span><UserCheck size={11} style={{ verticalAlign: -1 }} /> {stats.present + stats.late}/{stats.total} attended</span>
                    <span>{m.description ? m.description.slice(0, 40) + (m.description.length > 40 ? '...' : '') : ''}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {expandedSection === 'cards' && (
        <div className="mgmt-grid">
          {filteredCards.length === 0 ? (
            <div className="archive-empty-state" style={{ gridColumn: '1 / -1' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>No tech cards found for this season.</p>
            </div>
          ) : filteredCards.map(tc => (
            <div key={tc.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 14, cursor: 'pointer' }}
              onClick={() => setViewTechCard(tc)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ebec-gold)' }}>{tc.reference}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{tc.activityType || tc.duration}</span>
                    {tc.isSponsored && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ebec-gold)' }}>SPONSORED</span>}
                  </div>
                  <h4 style={{ margin: 0, fontSize: 16, color: '#fff', fontWeight: 700 }}>{tc.title}</h4>
                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                    {tc.theme} {tc.location ? `• ${tc.location}` : ''} {tc.attendeeType ? `• ${tc.attendeeType}` : ''}
                  </p>
                </div>
                {tc.docUrl && (
                  <button className="pill-btn mini" style={{ flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); window.open(tc.docUrl, '_blank'); }}>
                    <ExternalLink size={10} />
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                <span>{tc.duration}</span>
                {tc.externalAttendees?.length > 0 && <span>{tc.externalAttendees.length} guests</span>}
                {tc.isIndoor !== undefined && <span>{tc.isIndoor ? 'Indoor' : 'Outdoor'}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMeeting && (
        <MeetingDetailModal meeting={viewMeeting} onClose={() => setViewMeeting(null)} showNotification={showNotification} />
      )}

      {viewTechCard && (
        <TechCardDetailModal card={viewTechCard} onClose={() => setViewTechCard(null)} />
      )}
    </div>
  );
}

function MeetingDetailModal({ meeting, onClose, showNotification }) {
  const m = meeting;
  const stats = (() => {
    if (!m.attendance || Object.keys(m.attendance).length === 0) return null;
    const entries = Object.entries(m.attendance);
    return {
      present: entries.filter(([, s]) => s === 'present'),
      late: entries.filter(([, s]) => s === 'late'),
      absent: entries.filter(([, s]) => s === 'absent'),
      total: entries.length
    };
  })();

  return (
    <div className="form-overlay fade-in" onClick={onClose}>
      <div className="premium-form" style={{ maxWidth: 750, width: '100%', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <div className="header-content">
            <div className="header-meta">
              <span className="meta-text">MEETING RECORD • {m.reference || 'N/A'}</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 24 }}>{m.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="form-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={14} style={{ color: 'var(--ebec-gold)' }} />
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{m.date || 'No date'}</span>
            </div>
            {m.time && (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={14} style={{ color: '#0071e3' }} />
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{m.time}</span>
              </div>
            )}
            {m.venue && (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={14} style={{ color: '#34c759' }} />
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{m.venue}</span>
              </div>
            )}
          </div>

          {m.description && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{m.description}</p>
            </div>
          )}

          {stats && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 800, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Attendance</h4>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(52,199,89,0.15)', color: '#34c759', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Present: {stats.present.length}</span>
                <span style={{ background: 'rgba(255,193,7,0.15)', color: '#ffc107', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Late: {stats.late.length}</span>
                <span style={{ background: 'rgba(255,59,48,0.15)', color: '#ff3b30', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Absent: {stats.absent.length}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16 }}>
                {stats.present.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#34c759', textTransform: 'uppercase' }}>Present</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {stats.present.map(([name]) => <span key={name} style={{ background: 'rgba(52,199,89,0.1)', color: '#34c759', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{name}</span>)}
                    </div>
                  </div>
                )}
                {stats.late.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#ffc107', textTransform: 'uppercase' }}>Late</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {stats.late.map(([name]) => <span key={name} style={{ background: 'rgba(255,193,7,0.1)', color: '#ffc107', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{name}</span>)}
                    </div>
                  </div>
                )}
                {stats.absent.length > 0 && (
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#ff3b30', textTransform: 'uppercase' }}>Absent</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {stats.absent.map(([name]) => <span key={name} style={{ background: 'rgba(255,59,48,0.1)', color: '#ff3b30', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{name}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {m.notes && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clipboard size={14} /> Meeting Notes
              </h4>
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, fontSize: 15, lineHeight: 1.7, color: '#1d1d1f' }}
                dangerouslySetInnerHTML={{ __html: m.notes }} />
            </div>
          )}

          {m.report && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={14} /> Report
              </h4>
              {m.report.fileUrl ? (
                <a href={m.report.fileUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(52,199,89,0.1)', color: '#34c759', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  <ExternalLink size={14} /> Open Report PDF ({m.report.fileName || 'download'})
                </a>
              ) : m.report.content ? (
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, position: 'relative' }}>
                  <CopyButton text={m.report.content} showNotification={showNotification} />
                  <pre style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', maxHeight: 300, overflowY: 'auto' }}>
                    {m.report.content}
                  </pre>
                </div>
              ) : null}
            </div>
          )}

          {!m.notes && !m.report && (
            <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 40 }}>No notes or reports recorded for this meeting.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TechCardDetailModal({ card, onClose }) {
  const tc = card;
  return (
    <div className="form-overlay fade-in" onClick={onClose}>
      <div className="premium-form" style={{ maxWidth: 700, width: '100%', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <div className="header-content">
            <div className="header-meta">
              <span className="meta-text">TECHNICAL CARD • {tc.reference}</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 24 }}>{tc.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="form-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            {tc.activityType && <span className="pill-btn mini">{tc.activityType}</span>}
            {tc.duration && <span className="pill-btn mini">{tc.duration}</span>}
            {tc.isIndoor !== undefined && <span className="pill-btn mini">{tc.isIndoor ? 'Indoor' : 'Outdoor'}</span>}
            {tc.attendeeType && <span className="pill-btn mini">{tc.attendeeType}</span>}
            {tc.isSponsored && <span className="pill-btn mini" style={{ background: 'rgba(255,193,7,0.2)', color: '#ffc107' }}>Sponsored{tc.sponsorName ? ` — ${tc.sponsorName}` : ''}</span>}
          </div>

          {tc.theme && (
            <InfoBlock label="Theme" value={tc.theme} />
          )}
          {tc.location && (
            <InfoBlock label="Location" value={tc.location} />
          )}
          {tc.objectives && (
            <InfoBlock label="Objectives" value={tc.objectives} />
          )}
          {tc.agenda && (
            <InfoBlock label="Agenda" value={tc.agenda} />
          )}
          {tc.needs && (
            <InfoBlock label="Needs & Logistics" value={tc.needs} />
          )}

          {tc.externalAttendees && tc.externalAttendees.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>External Guests ({tc.externalAttendees.length})</h4>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16 }}>
                {tc.externalAttendees.map((g, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < tc.externalAttendees.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{g.name}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{g.email || 'No email'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tc.docUrl && (
            <a href={tc.docUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,113,227,0.1)', color: '#0071e3', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              <ExternalLink size={14} /> Open Google Doc
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h4 style={{ color: '#fff', fontSize: 14, fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</h4>
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, fontSize: 14, lineHeight: 1.7, color: '#1d1d1f', whiteSpace: 'pre-wrap' }}>
        {value}
      </div>
    </div>
  );
}

function CopyButton({ text, showNotification }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        if (showNotification) showNotification('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      });
    }} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#666' }}>
      {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
    </button>
  );
}
