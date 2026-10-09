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
          className="px-4 py-3 bg-[#153D32] text-[#F7F5F0] border border-[#C6A66B]/40 rounded-lg shadow-lg hover:bg-[#102E26] transition-colors flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <MessageSquare className="w-4 h-4 text-[#C6A66B]" />
          <span className="text-xs font-semibold tracking-[0.1em]">Client Concierge</span>
        </button>
      ) : (
        <div
          role="dialog"
          aria-label="Aurel California Client Concierge Desk"
          className="w-[340px] sm:w-[380px] bg-[#F7F5F0] border border-[#202421]/20 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[540px]"
        >
          {/* Header */}
          <div className="bg-[#153D32] text-[#F7F5F0] px-5 py-4 flex items-center justify-between gap-3 border-b border-[#C6A66B]/25">
            <div>
              <p className="font-serif-display text-lg font-medium tracking-wide text-[#F7F5F0]">
                Aurel Client Concierge
              </p>
              <p className="text-[11px] text-[#E9E6DF]/75">
                California Residential & Commercial Desk
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Concierge Chat"
              className="p-1.5 text-[#E9E6DF]/80 hover:text-[#F7F5F0] rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="p-4 space-y-3.5 overflow-y-auto flex-1 max-h-[310px] bg-[#F7F5F0]">
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
                      ? 'bg-[#153D32] text-[#F7F5F0]'
                      : 'bg-white border border-[#202421]/10 text-[#202421]'
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
                      className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#153D32] hover:underline cursor-pointer"
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
                      className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#153D32] hover:underline cursor-pointer"
                    >
                      <span>Explore California Map</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-[#202421]/50 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Quick Inquiry Prompts */}
          <div className="px-4 py-2.5 bg-[#E9E6DF]/70 border-t border-[#202421]/10 flex items-center gap-1.5 overflow-x-auto">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendMessage(prompt)}
                className="px-2.5 py-1 bg-white border border-[#202421]/15 rounded text-[11px] text-[#202421] hover:border-[#153D32] whitespace-nowrap shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-white border-t border-[#202421]/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about services, areas, or quotes..."
              aria-label="Message California Client Concierge"
              className="flex-1 px-3 py-2 text-xs text-[#202421] bg-[#F7F5F0] border border-[#202421]/15 rounded focus:outline-none focus:border-[#153D32]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              aria-label="Send message"
              className="p-2 bg-[#153D32] text-[#F7F5F0] rounded hover:bg-[#102E26] disabled:opacity-50 transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-[#C6A66B]" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
