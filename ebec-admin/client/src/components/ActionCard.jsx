import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';

const TOOL_LABELS = {
  create_meeting: { icon: '📅', verb: 'Create meeting' },
  update_meeting: { icon: '✏️', verb: 'Update meeting' },
  delete_meeting: { icon: '🗑️', verb: 'Delete meeting' },
  create_tech_card: { icon: '📋', verb: 'Create tech card' },
  generate_report: { icon: '📊', verb: 'Generate report' },
  list_meetings: { icon: '📋', verb: 'List meetings' },
  get_attendance: { icon: '📊', verb: 'Get attendance' },
  list_tech_cards: { icon: '📋', verb: 'List tech cards' },
  list_managers: { icon: '👥', verb: 'List managers' },
};

export default function ActionCard({ toolCall, onConfirm, onCancel }) {
  const [executing, setExecuting] = useState(false);
  const meta = TOOL_LABELS[toolCall.tool] || { icon: '⚡', verb: toolCall.tool };

  const summary = Object.entries(toolCall.args)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}: ${v.join(', ')}`;
      if (typeof v === 'object') return `${k}: ${JSON.stringify(v)}`;
      return `${k}: ${v}`;
    })
    .join('\n');

  const handleConfirm = async () => {
    setExecuting(true);
    await onConfirm(toolCall);
    setExecuting(false);
  };

  return (
    <div className="action-card">
      <div className="action-card-header">
        <span>{meta.icon}</span>
        <span>{meta.verb}</span>
      </div>
      {summary && <div className="action-card-details">{summary}</div>}
      <div className="action-card-actions">
        <button className="action-card-confirm" onClick={handleConfirm} disabled={executing}>
          {executing ? <Loader2 size={12} className="ebecco-spinner" /> : <Check size={12} />}
          {executing ? 'Executing...' : 'Confirm'}
        </button>
        <button className="action-card-cancel" onClick={onCancel} disabled={executing}>
          <X size={12} />
          Cancel
        </button>
      </div>
    </div>
  );
}
