import { useState } from 'react';
import ebecLogo from '../assets/EBEC.jfif';

export default function Footer() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <footer
      className="footer-premium"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      style={{
        '--x': `${pos.x}px`,
        '--y': `${pos.y}px`
      }}
    >
      <div className="footer-glass">
        <div className="footer-content">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="logo-circle small-logo">
                <img src={ebecLogo} alt="Logo" className="footer-logo-img" />
              </div>
              <span className="brand-name">EBEC Admin Hub</span>
            </div>
            <div className="footer-links">
              <span>Help Center</span>
              <span>Privacy Policy</span>
              <span>Contact Tech Team</span>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Leena IKHLEF. All rights reserved.</p>
            <div className="social-dots">
              <div className="social-dot"></div>
              <div className="social-dot"></div>
              <div className="social-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
