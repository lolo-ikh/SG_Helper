import { useState } from 'react';

export default function SGProof({ onVerify, onBack }) {
  const [answer, setAnswer] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = () => {
    if (answer.toLowerCase().trim() === 'momtaz') {
      onVerify(true);
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 3000);
    }
  };

  return (
    <div className="proof-overlay bubble-theme fade-in">
      <div className="bubble bubble-1"></div>
      <div className="bubble bubble-2"></div>
      <div className="bubble bubble-3"></div>

      <div className={`glass-card-proof bubble-card ${isError ? 'shake' : ''}`}>
        <h2 className="proof-heading">Are you the SG of EBEC?</h2>
        <p className="proof-subtext">Proof that & gain access to the Secretary Portal.</p>

        <div className="question-box">
          <label>What is the famous word that the SG says?</label>
          <div className="input-field-wrapper mt-4">
            <input
              type="text"
              placeholder="Your answer..."
              className="premium-input proof-input classy-input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>
        </div>

        {isError && (
          <div className="error-message-sg fade-in">
            <p className="big-error">YOU ARE NOOOT THE SG!!!!</p>
            <p className="small-error">Why do you want to access the EBEC SG panel??</p>
          </div>
        )}

        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="classy-btn" onClick={handleSubmit}>Verify Identity</button>
          <button className="btn-tertiary" onClick={onBack} style={{ color: '#fff', fontSize: '14px' }}>Back to Selection</button>
        </div>
      </div>
    </div>
  );
}
