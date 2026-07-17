import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Copy, Maximize2, Minimize2, Check, X } from 'lucide-react';

export default function MeetingQR({ meeting, onClose }) {
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const checkinUrl = `${window.location.origin}/checkin/${meeting.id}/${meeting.checkin_token}`;

  useEffect(() => {
    QRCode.toDataURL(checkinUrl, {
      width: fullscreen ? 320 : 220,
      margin: 2,
      color: { dark: '#1D355E', light: '#ffffff' }
    }).then(setQrUrl);
  }, [checkinUrl, fullscreen]);

  useEffect(() => {
    if (!fullscreen) return;
    const handler = (e) => { if (e.key === 'Escape') setFullscreen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fullscreen]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(checkinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (fullscreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10001,
        background: 'var(--ebec-navy)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }} onClick={() => setFullscreen(false)}>
        <button onClick={() => setFullscreen(false)} style={{
          position: 'absolute', top: 20, right: 20,
          background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
          width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
        }}>
          <Minimize2 size={20} />
        </button>
        {qrUrl && <img src={qrUrl} alt="QR Code" style={{ width: 280, height: 280, borderRadius: 16 }} />}
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 24, fontSize: 13 }}>Tap anywhere to close</p>
      </div>
    );
  }

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="premium-form" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, textAlign: 'center' }}>
        <div className="form-header" style={{ paddingBottom: 0 }}>
          <div className="header-content">
            <div className="header-meta">
              <span className="meta-text">CHECK-IN QR</span>
            </div>
            <h2 style={{ fontSize: 20 }}>{meeting.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="form-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            position: 'relative', cursor: 'pointer', borderRadius: 16, overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.06)',
          }} onClick={() => setFullscreen(true)}>
            {qrUrl ? (
              <img src={qrUrl} alt="Check-in QR" style={{ width: 220, height: 220, display: 'block' }} />
            ) : (
              <div style={{ width: 220, height: 220, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#999', fontSize: 13 }}>Generating...</span>
              </div>
            )}
            <div style={{
              position: 'absolute', bottom: 8, right: 8,
              background: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: '4px 8px',
              display: 'flex', alignItems: 'center', gap: 4, color: '#fff', fontSize: 10, fontWeight: 600,
            }}>
              <Maximize2 size={10} /> Fullscreen
            </div>
          </div>

          <div
            onClick={handleCopy}
            style={{
              marginTop: 20, width: '100%', background: '#f5f5f7', borderRadius: 12,
              padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer', transition: '0.2s', border: '1px solid rgba(0,0,0,0.04)',
            }}
          >
            <div style={{
              flex: 1, fontSize: 11, color: '#86868b', fontFamily: 'monospace',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left',
            }}>
              {checkinUrl}
            </div>
            <div style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
              color: copied ? '#34c759' : 'var(--apple-blue)', fontSize: 12, fontWeight: 600,
            }}>
              {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
            </div>
          </div>

          {copied && (
            <div style={{
              marginTop: 8, background: 'rgba(52, 199, 89, 0.1)', color: '#34c759',
              borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Check size={12} /> Link has been copied!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
