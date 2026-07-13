import { useState, useEffect } from 'react';
import { Search, UserCheck, Trash } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LEGACY_2025_TEAM } from '../../utils/legacyData';

const SEASONS = ['2025', '2026-2027'];
const SEASON_LABELS = { '2025': '2025-2026', '2026-2027': '2026-2027' };

export default function AttendancePortal() {
  const [teamList, setTeamList] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeason, setSelectedSeason] = useState('2025');

  useEffect(() => {
    async function loadData() {
      const isArchived = selectedSeason === '2025';

      let teamQuery = supabase.from('managers').select('name, role, season');
      if (isArchived) {
        teamQuery = teamQuery.or('season.eq.2025,season.is.null');
      } else {
        teamQuery = teamQuery.eq('season', selectedSeason);
      }
      const { data: teamData, error: teamErr } = await teamQuery;
      let mapped;
      if (teamErr || !teamData || teamData.length === 0) {
        mapped = isArchived ? LEGACY_2025_TEAM : [];
      } else {
        mapped = teamData.map(m => ({ name: m.name, role: m.role }));
      }
      setTeamList(mapped);

      let meetingQuery = supabase.from('meetings').select('*').order('date', { ascending: false });
      if (!isArchived) {
        meetingQuery = meetingQuery.eq('season', selectedSeason);
      }
      const { data: meetingData, error: meetingErr } = await meetingQuery;
      if (meetingErr) {
        console.error('[ATTENDANCE] Meetings query failed:', meetingErr.message);
        setMeetings([]);
      } else {
        setMeetings((meetingData || []).filter(m => m.attendance && Object.keys(m.attendance).length > 0));
      }
    }
    loadData();
  }, [selectedSeason]);

  const neverAbsent = [];
  const neverAttended = [];

  teamList.forEach(member => {
    let invitations = 0;
    let attendances = 0;
    let absences = 0;

    meetings.forEach(m => {
      const status = m.attendance?.[member.name];
      const isInvited = (m.attendees || []).includes(member.name) || (status && status !== 'absent');
      if (isInvited) {
        invitations++;
        if (status === 'present' || status === 'late') attendances++;
        if (status === 'absent' || !status) absences++;
      }
    });

    if (invitations > 0) {
      if (absences === 0) neverAbsent.push(member);
      if (attendances === 0) neverAttended.push(member);
    }
  });

  return (
    <div className="dashboard-content fade-in" style={{ maxWidth: '95vw' }}>
      <div className="flex-between items-center mb-8">
        <div>
          <h2 className="section-title" style={{ color: '#fff', margin: 0 }}>Secretariat Attendance Portal</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>Bird's eye view of EBEC engagement across all sync sessions.</p>
        </div>
        <div className="stat-card" style={{ background: 'rgba(52, 199, 89, 0.1)', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
          <div className="stat-value" style={{ color: '#34c759' }}>{meetings.length}</div>
          <div className="stat-label">Tracked Sessions</div>
        </div>
      </div>

      <div className="season-tabs" style={{ marginBottom: 32 }}>
        {SEASONS.map(s => (
          <button key={s} className={`season-tab ${selectedSeason === s ? 'active' : ''}`}
            onClick={() => setSelectedSeason(s)}>{SEASON_LABELS[s]}</button>
        ))}
      </div>

      <div className="mgmt-grid mb-10">
        <div className="premium-card" style={{ background: 'rgba(52, 199, 89, 0.05)', border: '1px solid rgba(52, 199, 89, 0.14)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ background: '#34c759', color: '#fff', borderRadius: 8, padding: 6 }}><UserCheck size={16} /></div>
            <h3 style={{ margin: 0, color: '#fff', fontSize: 16 }}>The Elites (Never Absent)</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {neverAbsent.length > 0 ? neverAbsent.map(m => (
              <span key={m.name} className="pill-btn mini" style={{ background: 'rgba(52, 199, 89, 0.2)', color: '#34c759', border: 'none', fontSize: 11 }}>{m.name}</span>
            )) : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No perfect records yet.</span>}
          </div>
        </div>

        <div className="premium-card" style={{ background: 'rgba(255, 59, 48, 0.05)', border: '1px solid rgba(255, 59, 48, 0.14)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ background: '#ff3b30', color: '#fff', borderRadius: 8, padding: 6 }}><Trash size={16} /></div>
            <h3 style={{ margin: 0, color: '#fff', fontSize: 16 }}>Critical (Never Attended)</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {neverAttended.length > 0 ? neverAttended.map(m => (
              <span key={m.name} className="pill-btn mini" style={{ background: 'rgba(255, 59, 48, 0.2)', color: '#ff3b30', border: 'none', fontSize: 11 }}>{m.name}</span>
            )) : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>All members have attended at least once!</span>}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32, marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ color: '#fff', opacity: 0.8, fontWeight: 700, margin: 0, fontSize: 18 }}>Raw Attendance Ledger</p>
        <div className="premium-search-container" style={{ maxWidth: 350, width: '100%' }}>
          <div className="search-icon-wrapper"><Search size={14} /></div>
          <input type="text" placeholder="Filter member by name or role..." className="cute-search-input"
            style={{ width: '100%' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="glass-panel-wide" style={{ padding: 0, overflow: 'hidden', borderRadius: 40 }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="attendance-table">
            <thead>
              <tr>
                <th className="sticky-col">TEAM MEMBER</th>
                {meetings.map(m => (
                  <th key={m.id}>
                    <div style={{ fontSize: 10, opacity: 0.6 }}>{m.date}</div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{m.title.slice(0, 15)}{m.title.length > 15 ? '...' : ''}</div>
                  </th>
                ))}
                <th style={{ background: 'rgba(255,193,7,0.1)', color: 'var(--ebec-gold)' }}>ENGAGEMENT</th>
              </tr>
            </thead>
            <tbody>
              {teamList.filter(m =>
                m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.role.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(member => {
                let meetingsInvited = 0;
                let attendedCount = 0;

                return (
                  <tr key={member.name}>
                    <td className="sticky-col">
                      <div style={{ fontWeight: 800 }}>{member.name}</div>
                      <div style={{ fontSize: 10, opacity: 0.5 }}>{member.role}</div>
                    </td>
                    {meetings.map(m => {
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
}
