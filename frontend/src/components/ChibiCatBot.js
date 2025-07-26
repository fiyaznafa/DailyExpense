import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import chibiCatImg from '../assets/chibi-cat.png';

const chibiCatAvatar = (
  <img
    src={chibiCatImg}
    alt="Chibi Cat"
    style={{ width: 36, height: 36, marginRight: 8, borderRadius: '50%', background: '#fff' }}
  />
);

const initialMessages = [
  { from: 'cat', text: 'Meow! I am Chibi, your expense buddy. Ask me anything about your spending or how to use the app! 🐱' }
];

const faqAnswers = [
  { q: /how.*add.*expense/i, a: 'Click the "Add Expense" button in the top menu, fill out the form, and hit save! 📝' },
  { q: /export.*data|download.*csv|export.*csv/i, a: 'Go to the details page and use the Export CSV button at the bottom! 📊' },
  { q: /delete.*expense/i, a: 'On the details page, click the Delete button next to the expense you want to remove. 🗑️' },
  { q: /edit.*expense/i, a: 'On the details page, click Edit next to the expense, make your changes, and save! ✏️' },
  { q: /top.*category|biggest.*expense/i, a: 'Check your dashboard for the Top Category and Insights cards! Want a summary? Just ask me!' },
  { q: /help|what.*can.*you.*do/i, a: 'I can answer questions about using the app and give you simple spending analysis. Try asking: "How much did I spend this month?" or "What is my top category?"' },
  { q: /cat.*fact/i, a: 'Did you know? A group of cats is called a clowder! 🐾' },
];

function getRuleBasedAnswer(question, expenses = []) {
  const q = question.trim().toLowerCase();
  // Top category/biggest category analysis (always try real data first)
  if (/top.*category|biggest.*category/.test(q)) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const catTotals = {};
    expenses.forEach(e => {
      const d = new Date(e.date);
      if (d.getMonth() + 1 === month && d.getFullYear() === year) {
        catTotals[e.category] = (catTotals[e.category] || 0) + (parseFloat(e.amount) || 0);
      }
    });
    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
    if (topCat) {
      return `Your top category this month is "${topCat[0]}" with ₹${topCat[1].toLocaleString('en-IN', { minimumFractionDigits: 2 })}! 🏆`;
    } else {
      return "I couldn't find any expenses for this month!";
    }
  }
  // Simple analysis
  if (/how much.*spend.*month|total.*month/i.test(q)) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const total = expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      })
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    return `You spent ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} this month! 🐾`;
  }
  // FAQ
  for (const { q: regex, a } of faqAnswers) {
    if (regex.test(q)) return a;
  }
  if (/cat.*fact/i.test(q)) {
    return 'Did you know? Cats have five toes on their front paws, but only four on the back! 🐾';
  }
  // Default
  return "Meow? I didn't understand that. Try asking about your spending, or type 'help'!";
}

const ChibiCatBot = ({ expenses = [] }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [waiting, setWaiting] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  // Accessibility: Close on Esc
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(msgs => [...msgs, userMsg]);
    setWaiting(true);
    setTimeout(() => {
      const answer = getRuleBasedAnswer(input, expenses);
      setMessages(msgs => [...msgs, { from: 'cat', text: answer }]);
      setWaiting(false);
    }, 600 + Math.random() * 600);
    setInput('');
    inputRef.current && inputRef.current.focus();
  };

  return (
    <div>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 2000,
            background: '#fff',
            border: '2px solid #007bff',
            borderRadius: '50%',
            width: 64,
            height: 64,
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
          }}
          title="Ask Chibi Cat!"
          aria-label="Open Chibi Cat bot"
        >
          <img
            src={chibiCatImg}
            alt="Chibi Cat"
            style={{ width: 36, height: 36, borderRadius: '50%' }}
          />
        </button>
      )}
      {/* Chat Widget */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 2000,
            width: 340,
            maxWidth: '90vw',
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Inter, Roboto, Arial, sans-serif',
            maxHeight: '70vh',
          }}
        >
          {/* Header (sticky) */}
          <div style={{ background: '#007bff', color: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 2 }}>
            <span style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 18 }}>
              {chibiCatAvatar} Chibi Cat
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', outline: 'none' }}
              title="Close"
              aria-label="Close Chibi Cat bot"
              tabIndex={0}
              onFocus={e => e.target.style.outline = '2px solid #fff'}
              onBlur={e => e.target.style.outline = 'none'}
            >
              <FaTimes />
            </button>
          </div>
          {/* Messages */}
          <div ref={chatRef} style={{ flex: 1, padding: 16, background: '#f8fafc', overflowY: 'auto', minHeight: 180 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 10
              }}>
                {msg.from === 'cat' && <span style={{ fontSize: 28, marginRight: 8 }}>🐾</span>}
                <span style={{
                  background: msg.from === 'user' ? '#007bff' : '#fff',
                  color: msg.from === 'user' ? '#fff' : '#333',
                  borderRadius: 12,
                  padding: '8px 14px',
                  maxWidth: 220,
                  fontSize: 15,
                  boxShadow: msg.from === 'user' ? '0 1px 4px rgba(0,123,255,0.08)' : '0 1px 4px rgba(0,0,0,0.06)',
                  marginLeft: msg.from === 'user' ? 0 : 8,
                  marginRight: msg.from === 'user' ? 8 : 0,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-line',
                }}>{msg.text}</span>
              </div>
            ))}
            {waiting && (
              <div style={{ display: 'flex', alignItems: 'center', color: '#888', fontSize: 15, marginLeft: 8 }}>
                <span style={{ fontSize: 22, marginRight: 6 }}>🐾</span>Chibi is thinking...
              </div>
            )}
          </div>
          {/* Input (sticky at bottom) */}
          <div style={{ display: 'flex', borderTop: '1px solid #eee', background: '#fff', padding: 10, position: 'sticky', bottom: 0, zIndex: 2 }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Ask me anything!"
              style={{
                flex: 1,
                border: '1px solid #ccc',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 15,
                outline: 'none',
                marginRight: 8
              }}
              disabled={waiting}
              aria-label="Type your message"
            />
            <button
              onClick={handleSend}
              disabled={waiting || !input.trim()}
              style={{
                background: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 17,
                cursor: waiting || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 36
              }}
              title="Send"
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChibiCatBot; 