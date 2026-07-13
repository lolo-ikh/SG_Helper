import { useState, useEffect } from 'react';
import { Check, Search, Copy, ExternalLink, Layout, Edit3, Clipboard, UserCheck } from 'lucide-react';
import { getInitials } from '../../utils/helpers';
import { LEGACY_2025_TEAM } from '../../utils/legacyData';
import { supabase } from '../../lib/supabase';

export default function AttendanceModal({ meeting, onClose, onSave }) {
  const [teamList, setTeamList] = useState(LEGACY_2025_TEAM);
  const initialList = meeting?.attendees || [];
  const [view, setView] = useState(meeting?.attendance && Object.keys(meeting.attendance).length > 0 ? "options" : "edit");
  const [searchQuery, setSearchQuery] = useState("");
  const [attendance, setAttendance] = useState(() => {
    const map = {};
    initialList.forEach(n => { map[n] = meeting?.attendance?.[n] || 'absent'; });
    return map;
  });

  useEffect(() => {
    async function loadTeam() {
      const { data } = await supabase.from('managers').select('name, role').eq('is_active', true);
      if (data && data.length > 0) setTeamList(data.map(m => ({ name: m.name, role: m.role })));
    }
    loadTeam();
  }, []);

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
      const teamMember = teamList.find(t => t.name === name);
      return teamMember ? `${name} (${teamMember.role})` : name;
    });
    const present = getWithNameRole(Object.entries(attendance).filter(([, v]) => v === 'present').map(([k]) => k));
    const late = getWithNameRole(Object.entries(attendance).filter(([, v]) => v === 'late').map(([k]) => k));
    const absent = getWithNameRole(Object.entries(attendance).filter(([, v]) => v === 'absent').map(([k]) => k));
    const text = `Attendance — ${meeting.title}\nDate: ${meeting.date}\n\nPresent: ${present.join(', ') || 'None'}\nLate: ${late.join(', ') || 'None'}\nAbsent: ${absent.join(', ') || 'None'}`;
    navigator.clipboard.writeText(text);
    alert("Copied as plain text with roles!");
  };

  const copyAttendedOnly = () => {
    const list = Object.entries(attendance)
      .filter(([, v]) => v === 'present' || v === 'late')
      .map(([name, s]) => {
        const teamMember = teamList.find(t => t.name === name);
        return `${name} — ${teamMember?.role || 'Member'} [${s === 'late' ? 'L' : 'P'}]`;
      });
    const text = `Attendees Only — ${meeting.title}\nDate: ${meeting.date}\n\n${list.join('\n') || 'No attendees recorded.'}`;
    navigator.clipboard.writeText(text);
    alert("Copied attended list (Names + Roles)!");
  };

  const copyAsSpreadsheet = () => {
    const rows = [["Full Name", "EBEC Role", "Meeting Date", "Present (P)", "Late (L)", "Absent (A)"]];
    const dateStr = meeting.date || new Date().toISOString().split('T')[0];
    Object.entries(attendance).forEach(([name, status]) => {
      const teamMember = teamList.find(t => t.name === name);
      rows.push([name, teamMember?.role || 'Member', dateStr, status === 'present' ? '1' : '0', status === 'late' ? '1' : '0', status === 'absent' ? '1' : '0']);
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
                <div className="search-icon-wrapper"><Search size={14} /></div>
                <input type="text" placeholder="Search attendee..." className="cute-search-input"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>

              <div className="modern-attendee-grid" style={{ maxHeight: '450px' }}>
                {(meeting?.attendees || []).filter(name => {
                  const member = teamList.find(t => t.name === name);
                  return name.toLowerCase().includes(searchQuery.toLowerCase()) || (member && member.role.toLowerCase().includes(searchQuery.toLowerCase()));
                }).sort((a, b) => {
                  const indexA = teamList.findIndex(t => t.name === a);
                  const indexB = teamList.findIndex(t => t.name === b);
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
                    <div key={name} className={`attendee-item status-${status}`} onClick={cycleStatus}>
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
                            <button key={s} className={`status-tag ${status === s ? 'active' : ''} ${s}`}
                              onClick={(e) => { e.stopPropagation(); setStatus(name, s); }}>
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
}
