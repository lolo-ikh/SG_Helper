import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, UserCheck, Clipboard, FileText, Edit3, Trash } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Toast from '../../components/Toast';
import AttendanceModal from './AttendanceModal';
import NotesEditor from './NotesEditor';
import ReportGenerator from './ReportGenerator';

export default function MeetingsPage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [search, setSearch] = useState("");
  const [openNotesFor, setOpenNotesFor] = useState(null);
  const [openAttendanceFor, setOpenAttendanceFor] = useState(null);
  const [openReportFor, setOpenReportFor] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('meetings').select('*').eq('season', '2026-2027').order('id', { ascending: false });
      setMeetings(data || []);
    }
    load();
  }, []);

  const handleDelete = async (id) => {
    const { error } = await supabase.from('meetings').delete().eq('id', id);
    if (!error) setMeetings(prev => prev.filter(m => m.id !== id));
  };

  const handleSaveNotes = async (meetingId, html) => {
    const { data } = await supabase.from('meetings').update({ notes: html }).eq('id', meetingId).select();
    if (data && data[0]) setMeetings(prev => prev.map(m => m.id === meetingId ? data[0] : m));
  };

  const handleSaveAttendance = async (meetingId, attendance) => {
    const { data } = await supabase.from('meetings').update({ attendance }).eq('id', meetingId).select();
    if (data && data[0]) setMeetings(prev => prev.map(m => m.id === meetingId ? data[0] : m));
  };

  const handleSaveReport = async (meetingId, report) => {
    const { data } = await supabase.from('meetings').update({ report }).eq('id', meetingId).select();
    if (data && data[0]) setMeetings(prev => prev.map(m => m.id === meetingId ? data[0] : m));
  };

  const filtered = [...meetings]
    .filter(m => m.title.toLowerCase().includes(search.toLowerCase()) || m.date.includes(search))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="dashboard-content fade-in" style={{ maxWidth: 1200 }}>
      <Toast message={notification?.message} type={notification?.type} onDone={() => setNotification(null)} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Meetings</h1>
          <p className="page-subtitle">All sync sessions and board meetings</p>
        </div>
        <button className="btn-icon-plus" onClick={() => navigate('/meetings/new')}>
          <Plus size={14} /> New Meeting
        </button>
      </div>

      <div className="premium-search-container" style={{ width: 400, marginBottom: 40 }}>
        <div className="search-icon-wrapper"><Search size={14} /></div>
        <input type="text" placeholder="Search meetings..." className="cute-search-input" style={{ width: '100%' }}
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="mgmt-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No meetings found.</p>
            <button className="cta" onClick={() => navigate('/meetings/new')}>Create first meeting</button>
          </div>
        ) : (
          filtered.map((m, idx) => {
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
                  <div className="stat-item"><UserCheck size={12} /> <span>{Object.values(m.attendance || {}).filter(s => s === 'present' || s === 'late').length}</span></div>
                  <div className="stat-item"><Clipboard size={12} /> <span>{m.notes ? 'Saved' : '0'}</span></div>
                  <div className="stat-item"><FileText size={12} /> <span>{m.report ? (m.report.type === 'pdf' ? 'PDF' : 'LaTeX') : '0'}</span></div>
                </div>
                <div className="premium-card-footer">
                  <button className="footer-action-btn" onClick={() => setOpenAttendanceFor(m.id)}><UserCheck size={12} /></button>
                  <button className="footer-action-btn" onClick={() => setOpenNotesFor(m.id)}><Clipboard size={12} /></button>
                  <button className="footer-action-btn" onClick={() => navigate(`/meetings/${m.id}/edit`)}><Edit3 size={12} /></button>
                  <button className="footer-action-btn report" onClick={() => setOpenReportFor(m.id)}><FileText size={12} /></button>
                  <button className="footer-delete-btn" onClick={() => { if (window.confirm('Delete meeting?')) handleDelete(m.id); }}><Trash size={16} /></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {openNotesFor && <NotesEditor meeting={meetings.find(m => m.id === openNotesFor)} onClose={() => setOpenNotesFor(null)} onSave={handleSaveNotes} />}
      {openAttendanceFor && <AttendanceModal meeting={meetings.find(m => m.id === openAttendanceFor)} onClose={() => setOpenAttendanceFor(null)} onSave={handleSaveAttendance} />}
      {openReportFor && <ReportGenerator meeting={meetings.find(m => m.id === openReportFor)} onClose={() => setOpenReportFor(null)} onSave={handleSaveReport} />}
    </div>
  );
}
