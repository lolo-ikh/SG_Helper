import { useState } from 'react';
import { Send, Edit3, X, Loader2, Check } from 'lucide-react';

export default function EmailPreview({ emailData, onSend, onCancel }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(emailData.body);

  const handleSend = async () => {
    setSending(true);
    try {
      await onSend({
        to: emailData.recipients.map(r => r.email),
        subject: emailData.subject,
        body,
      });
      setSent(true);
    } catch (err) {
      console.warn('[EmailPreview] Send failed:', err.message);
    }
    setSending(false);
  };

  if (sent) {
    return (
      <div className="email-preview">
        <div className="email-preview-sent">
          <Check size={16} />
          <span>Email sent to {emailData.recipients.length} recipient(s)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="email-preview">
      <div className="email-preview-header">
        <div className="email-preview-icon">📧</div>
        <div className="email-preview-meta">
          <div className="email-preview-subject">{emailData.subject}</div>
          <div className="email-preview-to">
            To: {emailData.recipients.map(r => r.name || r.email).join(', ')}
          </div>
        </div>
      </div>

      <div className="email-preview-body">
        {editing ? (
          <textarea
            className="email-preview-editor"
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={10}
          />
        ) : (
          <div className="email-preview-text">{body}</div>
        )}
      </div>

      <div className="email-preview-actions">
        <button className="email-preview-send" onClick={handleSend} disabled={sending}>
          {sending ? <Loader2 size={12} className="ebecco-spinner" /> : <Send size={12} />}
          {sending ? 'Sending...' : 'Send Email'}
        </button>
        <button className="email-preview-edit" onClick={() => setEditing(!editing)}>
          <Edit3 size={12} />
          {editing ? 'Done Editing' : 'Edit'}
        </button>
        <button className="email-preview-cancel" onClick={onCancel} disabled={sending}>
          <X size={12} />
          Cancel
        </button>
      </div>
    </div>
  );
}
