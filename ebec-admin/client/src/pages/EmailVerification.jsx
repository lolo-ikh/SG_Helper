import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';

  return (
    <div className="auth-container">
      <div className="auth-card fade-in" style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(0,113,227,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Mail size={32} style={{ color: '#0071e3' }} />
        </div>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Check Your Inbox</h1>
        <p className="auth-subtext" style={{ marginBottom: 8 }}>
          We've sent a verification link to:
        </p>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 24, wordBreak: 'break-all' }}>
          {email}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 32, lineHeight: 1.6 }}>
          Click the link in the email to verify your account, then come back and sign in.
          Check your spam folder if you don't see it.
        </p>
        <button className="auth-btn" onClick={() => navigate('/')}>
          Back to Sign In
        </button>
        <div style={{ marginTop: 16 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={14} /> Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
