import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Landing() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const trimmedEmail = email.trim().toLowerCase();
        const APPROVED_EMAILS = ['leena.ikhlef@ensia.edu.dz'];

        if (!APPROVED_EMAILS.includes(trimmedEmail)) {
          setError('This email is not pre-approved. Ask the VP to add you first.');
          setLoading(false);
          return;
        }

        await signUp(trimmedEmail, password, fullName);
        navigate('/verify-email', { state: { email: trimmedEmail } });
      } else {
        await signIn(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <h1>EBEC Admin Hub</h1>
        <p className="auth-subtext">
          {isSignUp ? 'Create your account to get started' : 'Welcome back. Sign in to your workspace.'}
        </p>

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <input
              type="text"
              className="auth-input"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            className="auth-input"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="auth-error">{error}</div>
          )}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="auth-toggle">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', display: 'block', marginBottom: '10px' }}>
            Or continue without account
          </span>
          <button
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              width: '100%'
            }}
            onClick={() => navigate('/dashboard')}
          >
            EBEC Manager View
          </button>
        </div>
      </div>
    </div>
  );
}
