import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, ChevronDown, Bot } from 'lucide-react';
import { clsx } from 'clsx';
import { useSettings } from '../../context/SettingsContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: Date;
}

const MOCK_RESPONSES: Record<string, string> = {
  default: "I'm analyzing your financial data. How can I assist you today?",
  document: "I found 3 relevant documents matching your query. Would you like me to summarize them?",
  report: "Your Q3 report shows a 12% increase in processed invoices. Shall I generate a detailed breakdown?",
  bank: "I've identified 7 transactions that need manual review. Would you like to start the matching process?",
  help: "I can help you with document classification, bank reconciliation, report generation, and financial analysis. What would you like to do?",
};

function getMockResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('document') || lower.includes('invoice')) return MOCK_RESPONSES.document;
  if (lower.includes('report') || lower.includes('summary')) return MOCK_RESPONSES.report;
  if (lower.includes('bank') || lower.includes('match') || lower.includes('transaction')) return MOCK_RESPONSES.bank;
  if (lower.includes('help') || lower.includes('what')) return MOCK_RESPONSES.help;
  return MOCK_RESPONSES.default;
}

export const AICompanion: React.FC = () => {
  const { aiCompanionEnabled } = useSettings();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hello! I'm your TAJ Finance AI assistant. How can I help you today?",
      ts: new Date(),
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  if (!aiCompanionEnabled) return null;

  const handleSend = () => {
    const text = input.trim();
    if (!text || thinking) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, ts: new Date() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getMockResponse(text),
        ts: new Date(),
      };
      setMessages((m) => [...m, aiMsg]);
      setThinking(false);
    }, 900 + Math.random() * 600);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 shadow-float text-white flex items-center justify-center hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2"
          aria-label="Open AI Assistant"
        >
          <Sparkles size={20} />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 flex flex-col bg-white border border-border rounded-2xl shadow-float overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 6rem)' }}>
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-white">
            <div className="flex items-center gap-2">
              <Bot size={16} />
              <span className="text-sm font-semibold">AI Assistant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0" style={{ maxHeight: 340 }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={clsx(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={clsx(
                    'max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-gold-500 text-white rounded-br-sm'
                      : 'bg-gray-100 text-ink-primary rounded-bl-sm'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-xl rounded-bl-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-ink-muted animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything…"
              rows={1}
              className="flex-1 resize-none rounded-lg border border-border px-3 py-2 text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all"
              style={{ maxHeight: 80 }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || thinking}
              className="p-2 rounded-lg bg-gold-500 text-white hover:bg-gold-600 disabled:opacity-40 transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
