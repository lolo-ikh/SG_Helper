import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { searchDocuments } from '../utils/ebeccoSearch';
import { generateRagAnswer } from '../utils/ebeccoRag';

const WELCOME_MSG = { role: 'assistant', content: "Hi! I'm EBECO, your EBEC knowledge assistant. Ask me anything about our meetings, reports, or documents." };

export default function EbeccoChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(false);
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
        setMessages(prev => [...prev, { role: 'assistant', content: answer, sources: results.slice(0, 3) }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Please try again." }]);
    }

    setLoading(false);
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
                  <div className="ebecco-msg-text"><Markdown>{msg.content}</Markdown></div>
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
    </>
  );
}
