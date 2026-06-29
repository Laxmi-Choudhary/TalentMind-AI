import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Brain, ArrowRight } from 'lucide-react';
import { queryAssistant, fetchSuggestions } from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function Insights() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState([
    { role: 'bot', text: 'Hi Sarah. I am TalentMind, your AI recruiting assistant. You can ask me to find candidates using natural language, like "Find me a senior React developer in FinTech".' }
  ]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSuggestions().then(r => setSuggestions(r.data.suggestions || []));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleSend = async (textToSubmit) => {
    const q = textToSubmit || query;
    if (!q.trim()) return;

    setChat(prev => [...prev, { role: 'user', text: q }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await queryAssistant(q);
      const data = res.data;
      
      setChat(prev => [...prev, { 
        role: 'bot', 
        text: data.response,
        candidates: data.candidates 
      }]);
    } catch (e) {
      setChat(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error processing your query.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Talent Intelligence</h1>
          <p className="page-desc">Conversational AI for candidate discovery</p>
        </div>

        <div className="assistant-panel">
          <div className="assistant-header">
            <div className="assistant-icon">
              <Sparkles size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Ask TalentMind</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Natural Language Search</div>
            </div>
          </div>
          
          <div className="assistant-messages" style={{ height: 400, maxHeight: 'none' }}>
            {chat.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-bubble" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                
                {/* Render tiny candidate cards if returned */}
                {msg.candidates?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                    {msg.candidates.slice(0, 3).map(c => (
                      <div 
                        key={c.id} 
                        className="card" 
                        style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-elevated)' }}
                        onClick={() => navigate(`/candidates/${c.id}`)}
                      >
                        <div className="avatar" style={{ background: c.avatar_color, width: 32, height: 32, fontSize: 12 }}>
                          {c.avatar_initials}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.title} • {c.years_experience}y</div>
                        </div>
                        <ArrowRight size={14} color="var(--primary-400)" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="message bot">
                <div className="message-bubble" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="assistant-input-area">
            <input 
              className="assistant-input"
              placeholder="E.g. Find senior backend engineers with AWS experience..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button className="btn btn-primary btn-icon" onClick={() => handleSend()}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 60 }}>
        <div className="card-glass" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
            <Brain size={18} color="var(--primary-400)" /> Example Queries
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {suggestions.map((s, i) => (
              <div 
                key={i} 
                className="kg-node" 
                style={{ alignSelf: 'flex-start', padding: '8px 16px', background: 'rgba(99,102,241,0.05)' }}
                onClick={() => handleSend(s)}
              >
                "{s}"
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 8 }}>How it works</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            The conversational assistant uses natural language processing to extract intent, required skills, industry domains, and seniority levels from your query. 
            It then searches the intelligence graph and ranks results by candidate engagement, ensuring you see the most active and relevant talent first.
          </p>
        </div>
      </div>
    </div>
  );
}
