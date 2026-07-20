import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatBullets, formatNumbered } from '../../utils/helpers';
import Toast from '../../components/Toast';

export default function TechCardEdit({ card: propCard, onCancel, onUpdate }) {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const id = propCard?.id || routeId;
  const [card, setCard] = useState(propCard || null);
  const [formData, setFormData] = useState(propCard || {});
  const [externalInput, setExternalInput] = useState({ name: "", email: "", phone: "", isStudent: true, school: "", year: "", studentId: "", nationalId: "" });
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (propCard) {
      setCard(propCard);
      setFormData({ ...propCard });
      return;
    }
    async function loadCard() {
      const { data } = await supabase.from('tech_cards').select('*').eq('id', routeId).single();
      if (data) { setCard(data); setFormData({ ...data }); }
    }
    loadCard();
  }, [routeId, propCard]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const addExternal = () => {
    if (!externalInput.name) return;
    setFormData({ ...formData, externalAttendees: [...(formData.externalAttendees || []), { ...externalInput, id: Date.now() }] });
    setExternalInput({ name: "", email: "", phone: "", isStudent: true, school: "", year: "", studentId: "", nationalId: "" });
    setShowGuestForm(false);
  };

  const removeExternal = (gid) => {
    setFormData({ ...formData, externalAttendees: formData.externalAttendees.filter(g => g.id !== gid) });
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "School", "Year", "Student ID"];
    const rows = (formData.externalAttendees || []).map(g => [
      `"${g.name || ''}"`, `"${g.email || ''}"`, `"${g.phone || ''}"`, `"${g.school || ''}"`, `"${g.year || ''}"`, `"${g.studentId || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `technical-card-guests.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdate = async (syncDoc = false) => {
    setIsSaving(true);
    if (syncDoc) {
      try {
        const dateObj = new Date(formData.startTime || Date.now());
        const dateEndObj = new Date(formData.endTime || Date.now());
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const payload = {
          ref_num: formData.reference, date_write: new Date().toLocaleDateString('en-GB'),
          type: formData.activityType || 'scientific', title: formData.title,
          place_name: formData.location || "TBD", is_inside: formData.isIndoor,
          day_name: days[dateObj.getDay()], date_activity: dateObj.toLocaleDateString('en-GB'),
          time_from: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          time_to: dateEndObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          target_group: formData.attendeeType, coordination: "",
          objectives: formatBullets(formData.objectives), themes: formData.theme,
          needs: formatNumbered(formData.needs), agenda: formatBullets(formData.agenda),
          is_sponsored: formData.isSponsored
        };
        const res = await fetch("https://script.google.com/macros/s/AKfycbyehjXK9isbudF-O6JIRIo3Wx0KZpnKENSKJcPYlybi_79UubGsH7dJXUNnKsqQAcwGZw/exec", {
          method: "POST", body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.status === 'success' && data.url) {
          setFormData(prev => ({ ...prev, docUrl: data.url }));
          showNotification('✓ Google Doc Updated!');
          window.open(data.url, '_blank');
        }
      } catch (e) { showNotification('⚠️ Sync Failed', 'error'); }
    }

    const { id: cardId, ...updateData } = { ...formData, id: parseInt(id) };
    const { error } = await supabase.from('tech_cards').update(updateData).eq('id', id);
    if (!error) {
      showNotification('✓ Changes Saved');
      if (onUpdate) {
        onUpdate({ ...formData, id: parseInt(id) }, () => {
          setTimeout(() => onCancel && onCancel(), 800);
        });
      }
    }
    setIsSaving(false);
  };

  if (!card) return <div className="dashboard-content fade-in"><p style={{ color: '#fff' }}>Loading...</p></div>;

  return (
    <div className="dashboard-content fade-in" style={{ maxWidth: 950 }}>
      <Toast message={notification?.message} type={notification?.type} onDone={() => setNotification(null)} />
      <div className="premium-form" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="form-header" style={{ flexShrink: 0 }}>
          <div className="header-content">
            <div className="header-meta" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="ref-tag" style={{ background: '#0071e3', color: '#fff' }}>{formData.reference}</span>
              <span className="meta-text">EDIT TECHNICAL CARD</span>
            </div>
            <h2 style={{ margin: '8px 0 0 0' }}>{formData.title}</h2>
          </div>
          <button className="close-btn" onClick={() => onCancel ? onCancel() : navigate(-1)}>×</button>
        </div>

        <div className="edit-tab-bar" style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(0,0,0,0.05)', flexShrink: 0 }}>
          {[{ id: 'basic', label: 'Basic Info' }, { id: 'details', label: 'Activity Details' }, { id: 'content', label: 'Content' }, { id: 'guests', label: 'Guests' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: activeTab === tab.id ? '#fff' : 'transparent',
              border: activeTab === tab.id ? '2px solid #0071e3' : '2px solid transparent',
              padding: '10px 16px', borderRadius: '12px 12px 0 0', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', color: activeTab === tab.id ? '#0071e3' : '#888', transition: '0.2s', flexShrink: 0
            }}>{tab.label}</button>
          ))}
        </div>

        <div className="edit-content" style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'basic' && (
            <>
              <div className="input-group-premium mb-8">
                <label className="section-label">Activity Title</label>
                <input className="form-input-title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="field-group mb-8" style={{ background: 'rgba(0, 113, 227, 0.05)', padding: 16, borderRadius: 12, border: '2px solid #0071e3' }}>
                <label style={{ fontWeight: 700, color: '#0071e3' }}>Reference Number (Edit this)</label>
                <input className="premium-input" value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} placeholder="e.g., 01/26" style={{ marginTop: 8, fontWeight: 700, fontSize: 16 }} />
              </div>
              <div className="form-grid mb-8">
                <div className="field-group"><label>Location / Venue</label><input className="premium-input" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} /></div>
                <div className="field-group"><label>Domain / Theme</label><input className="premium-input" value={formData.theme || ''} onChange={e => setFormData({ ...formData, theme: e.target.value })} /></div>
              </div>
              <div className="form-grid mt-4 mb-8">
                <div className="field-group">
                  <label>Duration</label>
                  <select className="premium-input" value={formData.duration || 'One Day'} onChange={e => setFormData({ ...formData, duration: e.target.value })}>
                    <option value="Hours">Hours</option><option value="One Day">One Day</option><option value="Multi-Day">Multi-Day</option>
                  </select>
                </div>
                <div className="field-group">
                  <label>Activity Type</label>
                  <select className="premium-input" value={formData.activityType || 'scientific'} onChange={e => setFormData({ ...formData, activityType: e.target.value })}>
                    <option value="scientific">Scientific</option><option value="cultural">Cultural</option><option value="sport">Sport</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="section-label">Indoor / Outdoor</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{formData.isIndoor ? 'Indoor' : 'Outdoor'}</span>
                  <div className={`ios-switch ${formData.isIndoor ? 'on' : ''}`} onClick={() => setFormData({ ...formData, isIndoor: !formData.isIndoor })}></div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'details' && (
            <>
              <div className="mb-8">
                <label className="section-label" style={{ marginBottom: 16 }}>Target Audience</label>
                <div className="segmented-control">
                  {[{ value: "School", label: "School Only" }, { value: "Outside", label: "External" }, { value: "Mixed", label: "Mixed" }].map(type => (
                    <button key={type.value} className={`segment-btn ${formData.attendeeType === type.value ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, attendeeType: type.value })}>{type.label}</button>
                  ))}
                </div>
              </div>
              <div className="mb-8">
                <label className="section-label" style={{ marginBottom: 16 }}>Sponsorship</label>
                <div className="switch-row" onClick={() => setFormData({ ...formData, isSponsored: !formData.isSponsored })} style={{ background: 'rgba(255,193,7,0.05)', padding: '16px 20px' }}>
                  <span style={{ fontWeight: 700 }}>Is this sponsored?</span>
                  <div className={`ios-switch ${formData.isSponsored ? 'on' : ''}`}></div>
                </div>
                {formData.isSponsored && (
                  <div style={{ marginTop: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#888' }}>Sponsor Name</label>
                    <input className="premium-input" value={formData.sponsorName || ''} onChange={e => setFormData({ ...formData, sponsorName: e.target.value })} placeholder="Official Sponsor Name" style={{ marginTop: 8 }} />
                  </div>
                )}
              </div>
              <div className="field-group">
                <label>Google Doc URL</label>
                <input className="premium-input" value={formData.docUrl || ''} onChange={e => setFormData({ ...formData, docUrl: e.target.value })} placeholder="Paste Google Doc link..." />
                {formData.docUrl && <button className="pill-btn" onClick={() => window.open(formData.docUrl, '_blank')} style={{ marginTop: 8 }}>Open Doc</button>}
              </div>
            </>
          )}

          {activeTab === 'content' && (
            <>
              <div className="field-group mb-8"><label className="section-label">Objectives</label><textarea className="premium-textarea" value={formData.objectives || ''} onChange={e => setFormData({ ...formData, objectives: e.target.value })} style={{ height: 100 }} /></div>
              <div className="field-group mb-8"><label className="section-label">Agenda</label><textarea className="premium-textarea" value={formData.agenda || ''} onChange={e => setFormData({ ...formData, agenda: e.target.value })} style={{ height: 100 }} /></div>
              <div className="field-group"><label className="section-label">Needs & Logistics</label><textarea className="premium-textarea" value={formData.needs || ''} onChange={e => setFormData({ ...formData, needs: e.target.value })} style={{ height: 100 }} /></div>
            </>
          )}

          {activeTab === 'guests' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>External Attendees ({formData.externalAttendees?.length || 0})</h3>
                <button className="pill-btn mini" onClick={() => setShowGuestForm(true)}>+ Add Guest</button>
              </div>
              {showGuestForm && (
                <div className="guest-data-form fade-in mb-8">
                  <div className="form-grid compact">
                    <input placeholder="Full Name*" value={externalInput.name} onChange={e => setExternalInput({ ...externalInput, name: e.target.value })} className="premium-input-small" />
                    <input placeholder="Email" value={externalInput.email} onChange={e => setExternalInput({ ...externalInput, email: e.target.value })} className="premium-input-small" />
                    <input placeholder="Phone" value={externalInput.phone} onChange={e => setExternalInput({ ...externalInput, phone: e.target.value })} className="premium-input-small" />
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button className="btn-tertiary mini" onClick={() => setShowGuestForm(false)}>Cancel</button>
                    <button className="btn-primary-premium ripple mini" onClick={addExternal}>Add Guest</button>
                  </div>
                </div>
              )}
              <div className="guest-scroller-premium" style={{ maxHeight: 350 }}>
                {(formData.externalAttendees || []).length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#888', padding: '40px 20px' }}>No guests added yet.</p>
                ) : (
                  formData.externalAttendees.map(g => (
                    <div key={g.id} className="guest-log-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', borderRadius: 12, marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f' }}>{g.name}</div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{g.email || 'No email'}</div>
                      </div>
                      <button className="delete-guest" onClick={() => removeExternal(g.id)} style={{ background: '#ff3b30', color: '#fff' }}><Trash size={12} /></button>
                    </div>
                  ))
                )}
              </div>
              {(formData.externalAttendees || []).length > 0 && (
                <button className="pill-btn" onClick={exportToCSV} style={{ marginTop: 16, width: '100%' }}>Export as CSV</button>
              )}
            </>
          )}
        </div>

        <div className="form-footer-premium" style={{ flexShrink: 0, borderTop: '1px solid rgba(0,0,0,0.05)', justifyContent: 'space-between' }}>
          <div><button className="btn-tertiary" onClick={() => onCancel ? onCancel() : navigate(-1)} disabled={isSaving}>Discard Changes</button></div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-apple-light ripple" disabled={isSaving} onClick={() => handleUpdate(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(52, 199, 89, 0.1)', color: '#34c759', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
              Update Google Doc & Save
            </button>
            <button className="btn-primary-premium ripple" disabled={isSaving} onClick={() => handleUpdate(false)}>
              {isSaving ? 'Saving...' : 'Simple Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { default as EditTechnicalCardModal } from './TechCardEdit';
