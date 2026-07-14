import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, ExternalLink } from 'lucide-react';
import Markdown from 'react-markdown';
import { searchDocuments } from '../utils/ebeccoSearch';
import { generateRagAnswer } from '../utils/ebeccoRag';
import { supabase } from '../lib/supabase';

const WELCOME_MSG = { role: 'assistant', content: "Hi! I'm EBECO, your EBEC knowledge assistant. Ask me anything about our meetings, reports, or documents." };

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
  const parts = content.split(/(\(Source\s*(?::\s*"[^"]*")?\))/g);
  const sourceMap = {};
  if (sources) {
    sources.forEach((s, i) => {
      const label = `(Source: "${s.document_title}")`;
      sourceMap[label] = i + 1;
    });
  }
  return (
    <Markdown
      components={{
        p: ({ children }) => <p>{children}</p>,
      }}
    >
      {parts.map((part, i) => {
        const match = part.match(/^\(Source\s*(?::\s*"([^"]*)")?\)$/);
        if (match) {
          const title = match[1] || '';
          let idx = sourceMap[part];
          if (!idx && sources) {
            const found = sources.findIndex(s => s.document_title === title);
            if (found >= 0) idx = found + 1;
          }
          if (!idx) idx = 1;
          return <InlineSource key={i} index={idx} title={title} sources={sources} onOpenPdf={onOpenPdf} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </Markdown>
  );
}

export default function EbeccoChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(false);
  const [pdfViewer, setPdfViewer] = useState(null);
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

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const results = await searchDocuments(q, 5);
      if (results.length === 0) {
        setMessages(prev => [...prev, { role: 'assistant', content: "I searched through all uploaded documents but couldn't find anything related to your question. Make sure you've uploaded documents on the EBECO Documents page, and try rephrasing your question." }]);
      } else {
        const answer = await generateRagAnswer(q, results);
        setMessages(prev => [...prev, { role: 'assistant', content: answer, sources: results.slice(0, 5) }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Please try again." }]);
    }

    setLoading(false);
  };

  const openPdf = async (source) => {
    try {
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
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}>
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
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="ebecco-sources">
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Sources</div>
                      {msg.sources.map((s, j) => (
                        <div key={j} style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                          {s.document_title} (p.{s.page_number || '?'})
                        </div>
                      ))}
                    </div>
                  )}
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
      )}

      {pdfViewer && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setPdfViewer(null)}>
          <div style={{
            background: '#1a1a1a', borderRadius: 16, width: '100%', maxWidth: 900,
            height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdfViewer.title}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Page {pdfViewer.page || '?'}</div>
              </div>
              <button onClick={() => setPdfViewer(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <iframe src={`${pdfViewer.url}#page=${pdfViewer.page || 1}`} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Viewer" />
            </div>
            {pdfViewer.chunkContent && (
              <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', maxHeight: 100, overflowY: 'auto' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Referenced content</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{pdfViewer.chunkContent.substring(0, 300)}{pdfViewer.chunkContent.length > 300 ? '...' : ''}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
