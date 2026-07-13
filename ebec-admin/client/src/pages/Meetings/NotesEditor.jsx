import { useRef, useEffect } from 'react';

export default function NotesEditor({ meeting, onClose, onSave }) {
  const editorRef = useRef(null);
  const exec = (cmd) => document.execCommand(cmd, false);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = meeting?.notes || "";
    }
  }, [meeting]);

  return (
    <div className="form-overlay fade-in">
      <div className="premium-form" style={{ maxWidth: 800 }}>
        <div className="form-header">
          <div className="header-content">
            <div className="header-meta"><span className="meta-text">SESSION SCRIPTER</span></div>
            <h2>Live Notes: {meeting?.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="form-body">
          <div className="flex gap-2 mb-4">
            <button className="status-tag present active" onClick={() => exec('bold')}>BOLD</button>
            <button className="status-tag late active" onClick={() => exec('italic')}>ITALIC</button>
            <button className="status-tag absent active" onClick={() => exec('underline')}>UNDERLINE</button>
          </div>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="notes-editor notes-editor-area"
            style={{ padding: 24, background: '#fff', borderRadius: 24, border: '1px solid rgba(0,0,0,0.05)', fontSize: 16, outline: 'none' }}
          />
        </div>
        <div className="form-footer-premium">
          <button className="btn-tertiary" onClick={onClose}>Discard</button>
          <button className="btn-primary-premium ripple" onClick={() => {
            onSave(meeting.id, editorRef.current.innerHTML);
            onClose();
          }}>Save Meeting Notes</button>
        </div>
      </div>
    </div>
  );
}
