import React, { useState } from 'react';
import { ArrowRight, MessageSquare, Send, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'concierge' | 'client';
  text: string;
  timestamp: string;
  suggestedAction?: 'open_book_page' | 'view_map' | 'view_services' | null;
}

interface LiveConciergeChatProps {
  onOpenBookPage: () => void;
  onNavigateSection: (sectionId: string) => void;
}

const QUICK_PROMPTS = [
  'Which California areas do you serve?',
  'How are cleaning quotes calculated?',
  'Care for marble & natural stone?',
  'Commercial studio & office schedules?',
];

export const LiveConciergeChat: React.FC<LiveConciergeChatProps> = ({
  onOpenBookPage,
  onNavigateSection,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'concierge',
      text: 'Welcome to Aurel Cleaning Co. How may our California Client Concierge assist with your residence or commercial property today?',
      timestamp: 'Concierge Desk',
      suggestedAction: 'open_book_page',
    },
  ]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isSending) return;

    const clientMsg: ChatMessage = {
      id: `client-${Date.now()}`,
      sender: 'client',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, clientMsg]);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      const conciergeMsg: ChatMessage = {
        id: `concierge-${Date.now()}`,
        sender: 'concierge',
        text:
          data.reply ||
          'Thank you for your inquiry. We invite you to request a tailored proposal on our Book Now page.',
        timestamp: data.timestamp || 'Just now',
        suggestedAction: data.suggestedAction || 'open_book_page',
      };
      setMessages((prev) => [...prev, conciergeMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `concierge-fallback-${Date.now()}`,
          sender: 'concierge',
          text: 'Our Concierge Desk is ready to prepare your custom quote. Please proceed to our Book Now page to share your property details.',
          timestamp: 'Just now',
          suggestedAction: 'open_book_page',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open California Client Concierge Chat"
          className="px-4 py-3 bg-[var(--brand-primary)] text-[var(--brand-canvas)] border border-[var(--brand-accent)]/40 rounded-lg shadow-lg hover:bg-[var(--brand-primary-hover)] transition-colors flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <MessageSquare className="w-4 h-4 text-[var(--brand-accent)]" />
          <span className="text-xs font-semibold tracking-[0.1em]">Client Concierge</span>
        </button>
      ) : (
        <div
          role="dialog"
          aria-label="Aurel California Client Concierge Desk"
          className="w-[340px] sm:w-[380px] bg-[var(--brand-canvas)] border border-[var(--brand-ink)]/20 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[540px]"
        >
          {/* Header */}
          <div className="bg-[var(--brand-primary)] text-[var(--brand-canvas)] px-5 py-4 flex items-center justify-between gap-3 border-b border-[var(--brand-accent)]/25">
            <div>
              <p className="font-serif-display text-lg font-medium tracking-wide text-[var(--brand-canvas)]">
                Aurel Client Concierge
              </p>
              <p className="text-[11px] text-[var(--brand-surface)]/75">
                California Residential & Commercial Desk
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Concierge Chat"
              className="p-1.5 text-[var(--brand-surface)]/80 hover:text-[var(--brand-canvas)] rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="p-4 space-y-3.5 overflow-y-auto flex-1 max-h-[310px] bg-[var(--brand-canvas)]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'client' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] px-3.5 py-2.5 rounded-lg text-xs leading-relaxed ${
                    msg.sender === 'client'
                      ? 'bg-[var(--brand-primary)] text-[var(--brand-canvas)]'
                      : 'bg-white border border-[var(--brand-ink)]/10 text-[var(--brand-ink)]'
                  }`}
                >
                  <p>{msg.text}</p>

                  {msg.sender === 'concierge' && msg.suggestedAction === 'open_book_page' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onOpenBookPage();
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--brand-primary)] hover:underline cursor-pointer"
                    >
                      <span>Open Book Now Page</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  {msg.sender === 'concierge' && msg.suggestedAction === 'view_map' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onNavigateSection('california-map');
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--brand-primary)] hover:underline cursor-pointer"
                    >
                      <span>Explore California Map</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-[var(--brand-ink)]/50 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Inquiry Prompts */}
          <div className="px-4 py-2.5 bg-[var(--brand-surface)]/70 border-t border-[var(--brand-ink)]/10 flex items-center gap-1.5 overflow-x-auto">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendMessage(prompt)}
                className="px-2.5 py-1 bg-white border border-[var(--brand-ink)]/15 rounded text-[11px] text-[var(--brand-ink)] hover:border-[var(--brand-primary)] whitespace-nowrap shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-white border-t border-[var(--brand-ink)]/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about services, areas, or quotes..."
              aria-label="Message California Client Concierge"
              className="flex-1 px-3 py-2 text-xs text-[var(--brand-ink)] bg-[var(--brand-canvas)] border border-[var(--brand-ink)]/15 rounded focus:outline-none focus:border-[var(--brand-primary)]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              aria-label="Send message"
              className="p-2 bg-[var(--brand-primary)] text-[var(--brand-canvas)] rounded hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
