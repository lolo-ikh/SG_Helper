import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function MeetingQR({ meeting, onClose }) {
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const checkinUrl = `${window.location.origin}/checkin/${meeting.id}/${meeting.checkin_token}`;

  useEffect(() => {
    QRCode.toDataURL(checkinUrl, {
      width: 256,
      margin: 2,
      color: { dark: '#1D355E', light: '#ffffff' }
    }).then(setQrUrl);
  }, [checkinUrl]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(checkinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="premium-form" onClick={e => e.stopPropagation()} style={{ maxWidth: 380, textAlign: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Check-in QR Code</h2>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>{meeting.title}</p>

        {qrUrl ? (
          <img src={qrUrl} alt="Check-in QR" style={{ width: 200, height: 200, borderRadius: 12, marginBottom: 16 }} />
        ) : (
          <div style={{ width: 200, height: 200, margin: '0 auto 16px', background: '#f0f0f0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#999' }}>Generating...</span>
          </div>
        )}

        <div style={{ background: '#f5f5f7', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 11, color: '#666', wordBreak: 'break-all', fontFamily: 'monospace' }}>
          {checkinUrl}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="cta" style={{ flex: 1 }} onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button className="cta secondary" style={{ flex: 1 }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
