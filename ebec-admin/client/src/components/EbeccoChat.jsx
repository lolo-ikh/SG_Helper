import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, ExternalLink, ThumbsUp, ThumbsDown } from 'lucide-react';
import Markdown from 'react-markdown';
import { searchDocuments } from '../utils/ebeccoSearch';
import { generateRagAnswer } from '../utils/ebeccoRag';
import { isAmbiguousQuery, reformulateQuery, expandQuery } from '../utils/ebeccoReformulate';
import { isActionIntent, detectToolCall, handleToolExecution, sendEmailViaApi, resolveMeetingAttendeeEmails } from '../utils/intentHandler';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import ActionCard from './ActionCard';
import EmailPreview from './EmailPreview';

const WELCOME_MSG = { role: 'assistant', content: "Hi! I'm EBECO, your EBEC (Ensia Business and Entrepreneurship Club) knowledge assistant built by Leena Ikhlef. I can answer questions about meetings, team roles, events, and any uploaded documents. Click source badges [1] [2] to view the original PDFs." };

function InlineSource({ index, title, sources, onOpenPdf }) {
  const [hover, setHover] = useState(false);
  const src = sources?.[index - 1];
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => src && onOpenPdf(src)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 20, height: 20, borderRadius: 6, fontSize: 10, fontWeight: 700,
          background: 'rgba(0,113,227,0.2)', color: '#0071e3', cursor: src ? 'pointer' : 'default',
          verticalAlign: 'middle', marginLeft: 2, marginRight: 2, transition: '0.15s',
        }}
      >
        {index}
      </span>
      {hover && src && (
        <span style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(30,30,30,0.95)', color: '#fff', padding: '6px 10px', borderRadius: 8,
          fontSize: 10, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', marginBottom: 4,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {src.document_title} (p.{src.page_number || '?'})
          <ExternalLink size={9} style={{ opacity: 0.5 }} />
        </span>
      )}
    </span>
  );
}

function SourceMarkdown({ content, sources, onOpenPdf }) {
  const titleToIndex = {};
  if (sources) {
    sources.forEach((s, i) => { titleToIndex[s.document_title] = i + 1; });
  }

  return <Markdown components={{
    p: ({ children }) => <p>{replaceSourcesInChildren(children, titleToIndex, sources, onOpenPdf)}</p>,
    li: ({ children }) => <li>{replaceSourcesInChildren(children, titleToIndex, sources, onOpenPdf)}</li>,
    li: ({ children, ...props }) => <li {...props}>{replaceSourcesInChildren(children, titleToIndex, sources, onOpenPdf)}</li>,
    td: ({ children }) => <td>{replaceSourcesInChildren(children, titleToIndex, sources, onOpenPdf)}</td>,
    th: ({ children }) => <th>{replaceSourcesInChildren(children, titleToIndex, sources, onOpenPdf)}</th>,
  }}>{content}</Markdown>;
}

function replaceSourcesInChildren(children, titleToIndex, sources, onOpenPdf) {
  if (!children) return children;
  if (typeof children === 'string') {
    const SOURCE_RE = /[\[(]Source\s*\d*\s*:\s*"([^"]*)"[^\])]*[\])]|[\[(]Source\s*\d+[\])]/g;
    if (!SOURCE_RE.test(children)) return children;
    SOURCE_RE.lastIndex = 0;
    const parts = [];
    let lastIdx = 0;
    let m;
    while ((m = SOURCE_RE.exec(children)) !== null) {
      if (m.index > lastIdx) parts.push(children.slice(lastIdx, m.index));
      const title = m[1] || null;
      const idx = title ? (titleToIndex[title] || 1) : 1;
      parts.push(<InlineSource key={`s${m.index}`} index={idx} sources={sources} onOpenPdf={onOpenPdf} />);
      lastIdx = m.index + m[0].length;
    }
    if (lastIdx < children.length) parts.push(children.slice(lastIdx));
    return parts;
  }
  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === 'string') {
        const SOURCE_RE = /[\[(]Source\s*\d*\s*:\s*"([^"]*)"[^\])]*[\])]|[\[(]Source\s*\d+[\])]/g;
        if (!SOURCE_RE.test(child)) return child;
        SOURCE_RE.lastIndex = 0;
        const parts = [];
        let lastIdx = 0;
        let m;
        while ((m = SOURCE_RE.exec(child)) !== null) {
          if (m.index > lastIdx) parts.push(child.slice(lastIdx, m.index));
          const title = m[1] || null;
          const idx = title ? (titleToIndex[title] || 1) : 1;
          parts.push(<InlineSource key={`s${i}-${m.index}`} index={idx} sources={sources} onOpenPdf={onOpenPdf} />);
          lastIdx = m.index + m[0].length;
        }
        if (lastIdx < child.length) parts.push(child.slice(lastIdx));
        return parts;
      }
      if (child?.props?.children) {
        return { ...child, props: { ...child.props, children: replaceSourcesInChildren(child.props.children, titleToIndex, sources, onOpenPdf) } };
      }
      return child;
    });
  }
  if (children?.props?.children) {
    return { ...children, props: { ...children.props, children: replaceSourcesInChildren(children.props.children, titleToIndex, sources, onOpenPdf) } };
  }
  return children;
}

function FeedbackButtons({ query, answerSummary, chunkIds }) {
  const [active, setActive] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!query) return;
    supabase.rpc('get_answer_feedback', { p_query: query })
      .then(({ data }) => { if (data && data[0]) setActive(data[0].action); })
      .catch(() => {});
  }, [query]);

  const toggle = async (action) => {
    if (saving) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('toggle_answer_feedback', {
        p_query: query,
        p_action: action,
        p_answer_summary: answerSummary?.substring(0, 500) || null,
        p_chunk_ids: chunkIds || [],
      });
      if (!error) {
        setActive(data === 'removed' ? null : action);
        console.log(`[EBECO] Feedback: ${data} (${action})`);
      }
    } catch (err) {
      console.warn('[EBECO] Feedback failed:', err.message);
    }
    setSaving(false);
  };

  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 6, opacity: 0.5 }}>
      <button onClick={() => toggle('like')} disabled={saving} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex',
        color: active === 'like' ? '#34c759' : 'rgba(255,255,255,0.4)', transition: '0.15s',
      }}><ThumbsUp size={12} fill={active === 'like' ? '#34c759' : 'none'} /></button>
      <button onClick={() => toggle('dislike')} disabled={saving} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex',
        color: active === 'dislike' ? '#ff3b30' : 'rgba(255,255,255,0.4)', transition: '0.15s',
      }}><ThumbsDown size={12} fill={active === 'dislike' ? '#ff3b30' : 'none'} /></button>
    </div>
  );
}

export default function EbeccoChat() {
  const { isLeader } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(false);
  const [pdfViewer, setPdfViewer] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setUnread(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open && messages.length > 1) setUnread(true);
  }, [messages.length, open]);

  const BOT_SUBJECT = /(?:\s+(?:you|ebecco|ebec\s*o|ebec|ebeco|the\s+bot|the\s+chatbot|the\s+assistant)\s*$)/i;
  const IDENTITY_RE = /^(?:(?:who|what)\s+(?:are|is)\s+(?:you|ebecco|ebec|the\s+bot|the\s+chatbot|the\s+assistant)\s*[?!.]*$|who\s+(?:made|created)\s+you\s*[?!.]*$|what\s+(?:is|are)\s+ebecco\s*[?!.]*$|what\s+can\s+you\s+do\s*[?!.]*$|how\s+(?:do\s+i|to)\s+(?:login|log\s*in|sign\s*in|access)\s*[?!.]*$)/i;
  const GREETING_RE = /^(?:hi|hello|hey|yo|sup|good\s+(?:morning|afternoon|evening)|thanks|thank\s+you|bye|goodbye)\s*[!.?]*$/i;

  const IDENTITY_STOP = new Set(['the','a','an','is','are','was','were','be','have','has','had','do','does','did','will','would','can','could','i','me','my','we','our','you','your','he','him','his','she','her','it','its','they','them','their','what','which','who','whom','where','when','why','how','in','on','at','to','for','of','with','by','from','as','through','during','before','after','above','between','out','off','over','under','again','then','once','that','this','these','those','and','but','or','not','so','if','tell','about','know','about','think']);

  const isIdentityQuery = (q) => {
    const lower = q.toLowerCase().trim();
    const stripped = lower.replace(/[?!.,]/g, '').trim();
    if (IDENTITY_RE.test(stripped)) return true;
    if (GREETING_RE.test(lower)) return true;
    if (['ebecco', 'ebec o', 'ebec', 'ebeco'].includes(stripped)) return true;
    return false;
  };

  const isBroadQuery = (q) => {
    const words = q.replace(/[^a-zA-Z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !IDENTITY_STOP.has(w.toLowerCase()));
    return words.length <= 2;
  };

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (isIdentityQuery(q)) {
        const answer = await generateRagAnswer(q, []);
        setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
      } else if (isActionIntent(q) && isLeader) {
        const toolCall = await detectToolCall(q, messages);
        if (toolCall) {
          if (toolCall.tool === 'send_email') {
            const { recipients: resolved, meeting } = await resolveMeetingAttendeeEmails(q.toLowerCase());
            if (resolved.length > 0) {
              toolCall.args.recipients = resolved.map(r => r.name);
              toolCall._resolvedRecipients = resolved;
              if (meeting) {
                toolCall._meetingContext = meeting;
                toolCall.args.extra_context = (toolCall.args.extra_context || '') +
                  `\n\nMeeting: "${meeting.title}" on ${meeting.date} at ${meeting.time || 'TBD'}.${meeting.description ? ' ' + meeting.description : ''}`;
              }
            }
          }
          setPendingAction({ toolCall, userMessage: q });
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: toolCall.tool === 'create_tech_card'
              ? `I'll create the tech card for you. The ref number will be auto-assigned. Please confirm:`
              : `I'll ${toolCall.tool.replace(/_/g, ' ')} for you. Please confirm:`,
            actionCard: true,
          }]);
        } else {
          let searchQuery = q;
          if (isAmbiguousQuery(q)) {
            searchQuery = await reformulateQuery(q, messages);
          } else if (isBroadQuery(q)) {
            searchQuery = await expandQuery(q);
          }
          const searchLimit = isBroadQuery(q) ? 15 : 5;
          const results = await searchDocuments(searchQuery, searchLimit);
          const answer = await generateRagAnswer(searchQuery, results);
          setMessages(prev => [...prev, { role: 'assistant', content: answer, sources: results.length > 0 ? results.slice(0, 5) : undefined }]);
        }
      } else {
        let searchQuery = q;
        if (isAmbiguousQuery(q)) {
          searchQuery = await reformulateQuery(q, messages);
        } else if (isBroadQuery(q)) {
          searchQuery = await expandQuery(q);
        }
        const searchLimit = isBroadQuery(q) ? 15 : 5;
        const results = await searchDocuments(searchQuery, searchLimit);
        const answer = await generateRagAnswer(searchQuery, results);
        setMessages(prev => [...prev, { role: 'assistant', content: answer, sources: results.length > 0 ? results.slice(0, 5) : undefined }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Please try again." }]);
    }

    setLoading(false);
  };

  const handleConfirmAction = async (toolCall) => {
    const userMessage = pendingAction?.userMessage || '';
    const result = await handleToolExecution(toolCall, { isLeader }, userMessage);

    if (result.error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${result.error}` }]);
      setPendingAction(null);
      return;
    }

    if (result.type === 'email_preview') {
      setPendingAction({ ...pendingAction, emailData: result });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Here\'s the email I composed:',
        emailPreview: result,
      }]);
      return;
    }

    setMessages(prev => [...prev, { role: 'assistant', content: result.message || 'Done!' }]);
    setPendingAction(null);
  };

  const handleSendEmail = async (emailPayload) => {
    try {
      await sendEmailViaApi(emailPayload.to, emailPayload.subject, emailPayload.body);
      setMessages(prev => [...prev, { role: 'assistant', content: `Email sent to ${emailPayload.to.length} recipient(s).` }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Email failed: ${err.message}` }]);
    }
    setPendingAction(null);
  };

  const handleCancelAction = () => {
    setMessages(prev => [...prev, { role: 'assistant', content: 'Cancelled.' }]);
    setPendingAction(null);
  };

  const openPdf = async (source) => {
    try {
      if (source.chunk_id) {
        supabase.from('ebecco_feedback').insert({
          chunk_id: source.chunk_id,
          query: messages[messages.length - 1]?.content || '',
          action: 'click',
        }).then(({ error }) => { if (error) console.warn('[EBECO] Feedback log failed:', error.message); });
      }
      const { data: doc } = await supabase.from('ebecco_documents').select('file_path').eq('id', source.document_id).single();
      if (!doc) return;
      const { data } = await supabase.storage.from('ebecco-docs').createSignedUrl(doc.file_path, 3600);
      if (data?.signedUrl) {
        setPdfViewer({ url: data.signedUrl, title: source.document_title, page: source.page_number, chunkContent: source.chunk_content });
      }
    } catch (err) {
      console.warn('[EBECO] Failed to open PDF:', err.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="ebecco-fab"
        aria-label="Toggle EBECO chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && unread && <span className="ebecco-unread-dot" />}
      </button>

      {open && (
        <div className="ebecco-chat-layout">
          <div className="ebecco-chat-window">
            <div className="ebecco-chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ background: 'rgba(0,113,227,0.2)', borderRadius: 8, padding: 6 }}>
                  <Bot size={16} style={{ color: '#0071e3' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>EBECO</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>EBEC Knowledge Assistant</div>
                </div>
              </div>
              <button onClick={() => { setOpen(false); setPdfViewer(null); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}>
                <X size={16} />
              </button>
            </div>

            <div className="ebecco-chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`ebecco-msg ebecco-msg-${msg.role}`}>
                  <div className="ebecco-msg-avatar">
                    {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                  </div>
                  <div className="ebecco-msg-bubble">
                    <div className="ebecco-msg-text">
                      {msg.role === 'assistant' && msg.sources ? (
                        <SourceMarkdown content={msg.content} sources={msg.sources} onOpenPdf={openPdf} />
                      ) : (
                        <Markdown>{msg.content}</Markdown>
                      )}
                    </div>
                    {msg.actionCard && pendingAction && !pendingAction.emailData && (
                      <ActionCard
                        toolCall={pendingAction.toolCall}
                        onConfirm={handleConfirmAction}
                        onCancel={handleCancelAction}
                      />
                    )}
                    {msg.emailPreview && (
                      <EmailPreview
                        emailData={msg.emailPreview}
                        onSend={handleSendEmail}
                        onCancel={handleCancelAction}
                      />
                    )}
                    {msg.sources && msg.sources.length > 0 && (() => {
                      const seen = new Set();
                      const deduped = msg.sources.filter(s => {
                        const key = `${s.document_id}:${s.page_number}`;
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                      });
                      return (
                        <div className="ebecco-sources">
                          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Sources</div>
                          {deduped.map((s, j) => (
                            <div key={j} onClick={() => openPdf(s)} style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                              onMouseEnter={e => e.target.style.color = '#0071e3'}
                              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>
                              {s.document_title} (p.{s.page_number || '?'})
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                    {msg.role === 'assistant' && i > 0 && (() => {
                      const prevUser = [...messages].reverse().find((m, idx) => m.role === 'user' && messages.indexOf(m) < i);
                      const query = prevUser?.content || '';
                      const chunkIds = (msg.sources || []).map(s => s.chunk_id).filter(Boolean);
                      return <FeedbackButtons query={query} answerSummary={msg.content} chunkIds={chunkIds} />;
                    })()}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="ebecco-msg ebecco-msg-assistant">
                  <div className="ebecco-msg-avatar"><Bot size={14} /></div>
                  <div className="ebecco-msg-bubble">
                    <Loader2 size={16} className="ebecco-spinner" /> Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="ebecco-chat-input">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about meetings, reports..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button onClick={handleSend} disabled={loading || !input.trim()}>
                <Send size={16} />
              </button>
            </div>
          </div>

          {pdfViewer && (
            <div className="ebecco-pdf-panel">
              <div className="ebecco-pdf-header">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdfViewer.title}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Page {pdfViewer.page || '?'}</div>
                </div>
                <button onClick={() => setPdfViewer(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                  <X size={16} />
                </button>
              </div>
              <iframe src={`${pdfViewer.url}#page=${pdfViewer.page || 1}`} style={{ flex: 1, width: '100%', border: 'none' }} title="PDF Viewer" />
              {pdfViewer.chunkContent && (
                <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', maxHeight: 80, overflowY: 'auto', flexShrink: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>Referenced</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{pdfViewer.chunkContent.substring(0, 200)}{pdfViewer.chunkContent.length > 200 ? '...' : ''}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
