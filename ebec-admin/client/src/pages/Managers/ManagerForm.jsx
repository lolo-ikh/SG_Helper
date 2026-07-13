import { useState, useEffect } from 'react';

const DEPARTMENTS = ['Finance & Legal', 'Relex', 'Design', 'IT', 'Media & Marketing', 'HR', 'Logistics', 'Events', 'General'];
const ROLES = ['President', 'Vice President', 'Secretary General', 'Manager', 'Co-Manager', 'Department Head', 'Member'];
const SEASONS = ['2025', '2026-2027'];
const SEASON_LABELS = { '2025': '2025-2026', '2026-2027': '2026-2027' };

export default function ManagerForm({ editData, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'Member', department: '', season: '2026-2027', is_active: true
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        email: editData.email || '',
        role: editData.role || 'Member',
        department: editData.department || '',
        season: editData.season || '2026-2027',
        is_active: editData.is_active !== false,
      });
    }
  }, [editData]);

  return (
    <div className="form-overlay fade-in" onClick={onClose}>
      <div className="premium-form" style={{ maxWidth: 520, width: '100%', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <div className="header-content">
            <div className="header-meta">
              <span className="meta-text">{editData ? 'EDIT MANAGER' : 'NEW MANAGER'}</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 28 }}>{editData ? 'Edit Manager' : 'Add New Manager'}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="form-body">
          <div className="field-group mb-8">
            <label className="section-label">Full Name *</label>
            <input className="premium-input" value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Amine Yani" autoFocus />
          </div>

          <div className="field-group mb-8">
            <label className="section-label">Email</label>
            <input className="premium-input" type="email" value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com" />
          </div>

          <div className="form-grid mb-8" style={{ gap: 20 }}>
            <div className="field-group">
              <label className="section-label">Role *</label>
              <select className="premium-input" value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label className="section-label">Department</label>
              <select className="premium-input" value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid mb-8" style={{ gap: 20 }}>
            <div className="field-group">
              <label className="section-label">Season *</label>
              <select className="premium-input" value={formData.season}
                onChange={e => setFormData({ ...formData, season: e.target.value })}>
                {SEASONS.map(s => <option key={s} value={s}>{SEASON_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label className="section-label">Status</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{formData.is_active ? 'Active' : 'Archived'}</span>
                <div className={`ios-switch ${formData.is_active ? 'on' : ''}`}
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-footer-premium">
          <button className="btn-tertiary" onClick={onClose}>Cancel</button>
          <button className="btn-primary-premium ripple" onClick={() => {
            if (!formData.name.trim()) return;
            onSave(formData);
          }}>
            {editData ? 'Update Manager' : 'Add Manager'}
          </button>
        </div>
      </div>
    </div>
  );
}
