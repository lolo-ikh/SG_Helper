import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserCheck, Clipboard, FileText, Edit3, Archive as ArchiveIcon, Trash, Copy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Toast from '../../components/Toast';

export default function TechCardsPage() {
  const navigate = useNavigate();
  const [techCards, setTechCards] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('tech_cards').select('*').order('id', { ascending: false });
      setTechCards(data || []);
    }
    load();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('tech_cards').delete().eq('id', id);
    if (!error) setTechCards(prev => prev.filter(tc => tc.id !== id));
  };

  const handleArchive = async (id) => {
    const { data, error } = await supabase.from('tech_cards').update({ isArchived: true }).eq('id', id).select();
    if (!error && data && data[0]) {
      setTechCards(prev => prev.map(tc => tc.id === id ? data[0] : tc));
      showNotification('✓ Card archived');
    }
  };

  const activeCards = techCards.filter(tc => !tc.isArchived);

  return (
    <div className="dashboard-content fade-in" style={{ maxWidth: 1200 }}>
      <Toast message={notification?.message} type={notification?.type} onDone={() => setNotification(null)} />

      <div className="page-header">
        <div>
          <h1 className="page-title">Technical Cards</h1>
          <p className="page-subtitle">{activeCards.length} active cards • {techCards.length} total</p>
        </div>
        <button className="btn-icon-plus" onClick={() => navigate('/techcards/new')}>
          <Plus size={14} /> New Card
        </button>
      </div>

      <div className="mgmt-grid">
        {activeCards.length === 0 ? (
          <div className="empty-state">
            <p>No active technical cards.</p>
            <button className="cta" onClick={() => navigate('/techcards/new')}>Create first card</button>
          </div>
        ) : (
          activeCards.map((tc, idx) => {
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
                  <div className="stat-item"><UserCheck size={12} /> <span>{tc.externalAttendees?.length || 0} Guests</span></div>
                  <div className="stat-item"><Clipboard size={12} /> <span>{tc.agenda ? 'Built' : 'Draft'}</span></div>
                </div>
                <div className="premium-card-footer">
                  <button className="footer-action-btn" title="Copy Info" onClick={(e) => {
                    e.stopPropagation();
                    const info = `Technical Card: ${tc.reference}\n\nTitle: ${tc.title}\nTheme: ${tc.theme}\nDuration: ${tc.duration}\nLocation: ${tc.location || 'N/A'}\nAttendee Type: ${tc.attendeeType}\n\nObjectives:\n${tc.objectives || 'N/A'}\n\nAgenda:\n${tc.agenda || 'N/A'}\n\nNeeds:\n${tc.needs || 'N/A'}\n\nExternal Guests: ${tc.externalAttendees?.length || 0}\n\nSponsored: ${tc.isSponsored ? 'Yes - ' + (tc.sponsorName || 'N/A') : 'No'}\n\nGoogle Doc: ${tc.docUrl || 'Not linked'}`;
                    navigator.clipboard.writeText(info).then(() => showNotification('✓ Copied!'));
                  }} style={{ background: 'rgba(255, 193, 7, 0.1)', color: '#FFC107' }}><Copy size={14} /></button>
                  {tc.docUrl ? (
                    <button className="footer-action-btn" onClick={(e) => { e.stopPropagation(); window.open(tc.docUrl, '_blank'); }} style={{ background: 'rgba(52, 199, 89, 0.1)', color: '#34c759' }}><FileText size={14} /></button>
                  ) : (
                    <button className="footer-action-btn" style={{ opacity: 0.3 }}><FileText size={14} /></button>
                  )}
                  <button className="footer-action-btn" onClick={(e) => { e.stopPropagation(); navigate(`/techcards/${tc.id}/edit`); }} style={{ background: 'rgba(0, 113, 227, 0.1)', color: '#0071e3' }}><Edit3 size={14} /></button>
                  <button className="footer-action-btn" onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Archive "${tc.title}"?`)) handleArchive(tc.id);
                  }} style={{ background: 'rgba(102, 107, 128, 0.1)', color: '#666b80' }}><ArchiveIcon size={14} /></button>
                  <button className="footer-delete-btn" onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`PERMANENTLY DELETE "${tc.title}"?`)) handleDelete(tc.id);
                  }}><Trash size={16} /></button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
