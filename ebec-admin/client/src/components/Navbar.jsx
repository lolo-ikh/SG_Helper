import { useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ebecLogo from '../assets/EBEC.jfif';

export default function Navbar() {
  const { user, isVP, signOut } = useAuth();
  const navigate = useNavigate();
  const navRef = useRef(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="glass-nav" ref={navRef}>
      <NavLink to="/dashboard">
        <div className="logo-circle">
          <img src={ebecLogo} alt="EBEC" className="header-logo" />
        </div>
      </NavLink>
      <div className="nav-links">
        <NavLink to="/dashboard" end>
          {({ isActive }) => (
            <span className={isActive ? 'active' : ''}>Home</span>
          )}
        </NavLink>
        <NavLink to="/meetings">
          {({ isActive }) => (
            <span className={isActive ? 'active' : ''}>Meetings</span>
          )}
        </NavLink>
        <NavLink to="/activities">
          {({ isActive }) => (
            <span className={isActive ? 'active' : ''}>Activities</span>
          )}
        </NavLink>
        <NavLink to="/attendance">
          {({ isActive }) => (
            <span className={isActive ? 'active' : ''}>Attendance</span>
          )}
        </NavLink>
        {isVP && (
          <NavLink to="/managers">
            {({ isActive }) => (
              <span className={isActive ? 'active' : ''}>Managers</span>
            )}
          </NavLink>
        )}
        <NavLink to="/archive">
          {({ isActive }) => (
            <span className={isActive ? 'active' : ''}>Archive</span>
          )}
        </NavLink>
        <NavLink to="/ebecco">
          {({ isActive }) => (
            <span className={isActive ? 'active' : ''}>EBECO</span>
          )}
        </NavLink>
      </div>
      {user ? (
        <button className="sign-out-btn" onClick={handleLogout}>Sign Out</button>
      ) : (
        <button className="sign-out-btn" onClick={() => navigate('/')}>Sign In</button>
      )}
    </nav>
  );
}
