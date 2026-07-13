import { useState, useEffect } from 'react';
import { Plus, Trash, Edit, Search, UserCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { LEGACY_2025_TEAM } from '../../utils/legacyData';
import ManagerForm from './ManagerForm';
import Toast from '../../components/Toast';

const SEASONS = ['2025', '2026-2027'];
const SEASON_LABELS = { '2025': '2025-2026', '2026-2027': '2026-2027' };

const LEGACY_ROLE_DEPT_MAP = {
  'Relex department': { role: 'Manager', department: 'Relex' },
  'Co-Manager in Relex': { role: 'Co-Manager', department: 'Relex' },
  'Finance & Legal department': { role: 'Manager', department: 'Finance & Legal' },
  'Finance & Legal Manager': { role: 'Manager', department: 'Finance & Legal' },
  'Co-manager Finance': { role: 'Co-Manager', department: 'Finance & Legal' },
  'Co-design manager': { role: 'Co-Manager', department: 'Design' },
  'Design Co-manager': { role: 'Co-Manager', department: 'Design' },
  'Co-ManagerDesign': { role: 'Co-Manager', department: 'Design' },
  'IT Manager': { role: 'Manager', department: 'IT' },
  'Media & Marketing': { role: 'Manager', department: 'Media & Marketing' },
  'Marketing Co-Manager': { role: 'Co-Manager', department: 'Media & Marketing' },
  'HR': { role: 'Manager', department: 'HR' },
  'HR Manager': { role: 'Manager', department: 'HR' },
  'Logistic Department': { role: 'Manager', department: 'Logistics' },
  'Events and logistics': { role: 'Manager', department: 'Events' },
  'Events Logistics Co-manager': { role: 'Co-Manager', department: 'Events' },
  'Event Co-manager': { role: 'Co-Manager', department: 'Events' },
  'Events Co-manager': { role: 'Co-Manager', department: 'Events' },
  'Project Manager': { role: 'Manager', department: 'Events' },
};

function mapLegacyRole(rawRole) {
  if (LEGACY_ROLE_DEPT_MAP[rawRole]) return LEGACY_ROLE_DEPT_MAP[rawRole];
  const lower = rawRole.toLowerCase();
  if (lower.includes('president')) return { role: rawRole.includes('Vice') ? 'Vice President' : 'President', department: '' };
  if (lower.includes('secretary')) return { role: 'Secretary General', department: '' };
  return { role: 'Manager', department: 'General' };
}

async function seedLegacyTeam() {
  const { data: existing, error: checkErr } = await supabase.from('managers').select('id').eq('season', '2025').limit(1);
  if (checkErr) { console.error('[SEED] Check failed:', checkErr.message); return false; }
  if (existing && existing.length > 0) return false;
  const rows = LEGACY_2025_TEAM.map(m => {
    const mapped = mapLegacyRole(m.role);
    return { name: m.name, role: mapped.role, department: mapped.department, season: '2025', is_active: false };
  });
  const { error } = await supabase.from('managers').insert(rows);
  if (error) {
    console.error('[SEED] Bulk insert failed:', error.message, '— trying one-by-one...');
    let inserted = 0;
    for (const row of rows) {
      const { error: singleErr } = await supabase.from('managers').insert([row]);
      if (!singleErr) inserted++;
      else console.warn('[SEED] Skip', row.name, ':', singleErr.message);
    }
    console.log('[SEED] Inserted', inserted, 'of', rows.length, 'legacy managers individually');
    return inserted > 0;
  }
  console.log('[SEED] Inserted', rows.length, 'legacy managers for 2025-2026');
  return true;
}

export default function ManagersPage() {
  const { isVP } = useAuth();
  const [managers, setManagers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('all');

  const fetchManagers = async () => {
    setLoading(true);
    let query = supabase.from('managers').select('*');
    if (seasonFilter !== 'all') {
      query = query.eq('season', seasonFilter);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,role.ilike.%${search}%,department.ilike.%${search}%`);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) console.error('Fetch managers failed:', error.message);
    let result = data || [];
    if (result.length === 0 && seasonFilter === '2025' && !search) {
      result = LEGACY_2025_TEAM.map((m, i) => {
        const mapped = mapLegacyRole(m.role);
        return { id: `legacy-${i}`, name: m.name, role: mapped.role, department: mapped.department, season: '2025', is_active: false, email: '' };
      });
    }
    setManagers(result);
    setLoading(false);
  };

  useEffect(() => {
    seedLegacyTeam().then(seeded => { if (seeded) fetchManagers(); });
  }, []);

  useEffect(() => { fetchManagers(); }, [seasonFilter]);

  useEffect(() => {
    async function loadMeetings() {
      const { data } = await supabase.from('meetings').select('attendance').order('date', { ascending: false });
      setMeetings(data || []);
    }
    loadMeetings();
  }, []);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = async (formData) => {
    if (!editData) {
      const { data: existing, error: checkErr } = await supabase.from('managers')
        .select('id').eq('name', formData.name).eq('season', formData.season).limit(1);
      if (checkErr) {
        console.error('[MANAGERS] Duplicate check failed:', checkErr.message);
        showNotification('DB error: the "managers" table may not exist. Run the SQL migration first.', 'error');
        return;
      }
      if (existing && existing.length > 0) {
        showNotification('A manager with this name already exists in this season.', 'error');
        return;
      }
    }
    if (editData) {
      const { error } = await supabase.from('managers').update(formData).eq('id', editData.id);
      if (error) { console.error('[MANAGERS] Update failed:', error.message); showNotification('Update failed: ' + error.message, 'error'); return; }
      showNotification('Manager updated');
    } else {
      const { error } = await supabase.from('managers').insert([formData]);
      if (error) { console.error('[MANAGERS] Insert failed:', error.message); showNotification('Insert failed: ' + error.message, 'error'); return; }
      showNotification('Manager added');
    }
    fetchManagers();
    setShowForm(false);
    setEditData(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this manager permanently?')) return;
    const { error } = await supabase.from('managers').delete().eq('id', id);
    if (error) { showNotification('Failed: ' + error.message, 'error'); return; }
    showNotification('Manager removed');
    fetchManagers();
  };

  const handleToggleActive = async (id, currentActive) => {
    const { error } = await supabase.from('managers').update({ is_active: !currentActive }).eq('id', id);
    if (!error) { fetchManagers(); }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAttendanceFor = (name) => {
    let attended = 0;
    let invited = 0;
    meetings.forEach(m => {
      if (!m.attendance) return;
      const status = m.attendance[name];
      const isInvited = status !== undefined || Object.keys(m.attendance).length > 0;
      if (isInvited) {
        invited++;
        if (status === 'present' || status === 'late') attended++;
      }
    });
    return invited > 0 ? Math.round((attended / invited) * 100) : 0;
  };

  return (
    <>
    <div className="dashboard-content fade-in" style={{ maxWidth: 1100 }}>
      <Toast message={notification?.msg} type={notification?.type} onDone={() => setNotification(null)} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Manager Panel</h1>
          <p className="page-subtitle">Manage team members across seasons. Create, edit, or remove managers.</p>
        </div>
        {isVP && (
          <button className="btn-primary-premium ripple" onClick={() => { setEditData(null); setShowForm(true); }}>
            <Plus size={16} style={{ marginRight: 8, display: 'inline' }} /> Add Manager
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div className="season-tabs">
          <button className={`season-tab ${seasonFilter === 'all' ? 'active' : ''}`} onClick={() => setSeasonFilter('all')}>All Seasons</button>
          {SEASONS.map(s => (
            <button key={s} className={`season-tab ${seasonFilter === s ? 'active' : ''}`} onClick={() => setSeasonFilter(s)}>{SEASON_LABELS[s]}</button>
          ))}
        </div>
        <div className="premium-search-container">
          <div className="search-icon-wrapper"><Search size={14} /></div>
          <input
            type="text"
            placeholder="Search by name, role, department..."
            className="cute-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchManagers()}
          />
        </div>
      </div>

      <div className="glass-panel-wide" style={{ padding: 30 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: 40 }}>Loading managers...</p>
        ) : managers.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: 40 }}>No managers found. Click "Add Manager" to create one.</p>
        ) : (
          <div className="manager-grid">
            {managers.map(m => (
              <div key={m.id} className="manager-card">
                <div className="avatar">{getInitials(m.name)}</div>
                <div className="info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <h4>{m.name}</h4>
                    <span className={`manager-season-badge ${m.is_active ? 'active' : 'archived'}`}>
                      {m.is_active ? 'Active' : 'Archived'}
                    </span>
                  </div>
                  <p>{m.role} {m.department ? `• ${m.department}` : ''}</p>
                  <p style={{ opacity: 0.4 }}>{m.email || 'No email'} • {SEASON_LABELS[m.season] || m.season}</p>
                  {meetings.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <UserCheck size={10} style={{ color: 'var(--ebec-gold)' }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ebec-gold)' }}>
                        {getAttendanceFor(m.name)}% attendance
                      </span>
                    </div>
                  )}
                </div>
                {isVP && (
                  <div className="actions">
                    <button title="Edit" onClick={() => { setEditData(m); setShowForm(true); }}>
                      <Edit size={12} />
                    </button>
                    <button title={m.is_active ? 'Deactivate' : 'Activate'} onClick={() => handleToggleActive(m.id, m.is_active)}>
                      {m.is_active ? '🔵' : '⚪'}
                    </button>
                    <button className="danger" title="Delete" onClick={() => handleDelete(m.id)}>
                      <Trash size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    {showForm && (
      <ManagerForm
        editData={editData}
        onSave={handleSave}
        onClose={() => { setShowForm(false); setEditData(null); }}
      />
    )}
    </>
  );
}
