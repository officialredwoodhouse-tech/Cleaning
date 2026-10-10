import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';

export type OpsPersonaId = 'concierge' | 'surfaces' | 'operations';
export type OpsSpeedMode = 'standard' | 'fast';

interface ChatMessage {
  id: string;
  sender: 'concierge' | 'client';
  text: string;
  timestamp: string;
  personaLabel?: string;
  modelBadge?: string;
  isError?: boolean;
  suggestedAction?:
    | 'open_book_page'
    | 'view_map'
    | 'view_services'
    | 'view_properties'
    | null;
}

interface LiveConciergeChatProps {
  onOpenBookPage: () => void;
  onNavigateSection: (sectionId: string) => void;
}

const OPS_PERSONAS: {
  id: OpsPersonaId;
  label: string;
  subtitle: string;
  welcome: string;
  prompts: string[];
}[] = [
  {
    id: 'concierge',
    label: 'Concierge Desk',
    subtitle: 'Services, California Areas & Custom Quotes',
    welcome:
      'Hello, I am Ops — your Aurel California Client Concierge. How may I assist with your residence, penthouse, or commercial property today?',
    prompts: [
      'Which California areas do you serve?',
      'How do you tailor cleaning quotes?',
      'Tell me about Signature vs Bespoke Care',
      'What happens after I submit a booking?',
    ],
  },
  {
    id: 'surfaces',
    label: 'Surface Specialist',
    subtitle: 'Calacatta Marble, Oak, Glass & HEPA H14',
    welcome:
      'Hello, I am Ops (Surface & Material Specialist). Ask me how our uniformed teams care for honed Calacatta marble, travertine, bleached oak, or oceanfront glass.',
    prompts: [
      'How do you clean honed Calacatta marble?',
      'How do you remove Pacific salt mist on glass?',
      'What is in your HEPA H14 & surface caddy?',
      'Are your products safe for oiled walnut & brass?',
    ],
  },
  {
    id: 'operations',
    label: 'Estate & Studio Ops',
    subtitle: 'Multi-Day Stewardship, Handovers & Commercial',
    welcome:
      'Hello, I am Ops (Estate & Commercial Operations). I can help plan multi-specialist team deployments, after-hours studio care, or post-construction handovers.',
    prompts: [
      'How do post-construction handovers work?',
      'After-hours commercial office & studio schedules?',
      'Can you coordinate with our estate manager?',
      'What is your team uniform & dress protocol?',
    ],
  },
];

export const LiveConciergeChat: React.FC<LiveConciergeChatProps> = ({
  onOpenBookPage,
  onNavigateSection,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [persona, setPersona] = useState<OpsPersonaId>('concierge');
  const [speedMode, setSpeedMode] = useState<OpsSpeedMode>('standard');
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const activePersonaConfig =
    OPS_PERSONAS.find((p) => p.id === persona) || OPS_PERSONAS[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'concierge',
      text: OPS_PERSONAS[0].welcome,
      timestamp: 'Ops · Online',
      personaLabel: OPS_PERSONAS[0].label,
      suggestedAction: 'open_book_page',
    },
  ]);

  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSending, isOpen]);

  const handlePersonaChange = (nextPersona: OpsPersonaId) => {
    setPersona(nextPersona);
    const nextConfig =
      OPS_PERSONAS.find((p) => p.id === nextPersona) || OPS_PERSONAS[0];
    setMessages((prev) => [
      ...prev,
      {
        id: `persona-switch-${Date.now()}`,
        sender: 'concierge',
        text: nextConfig.welcome,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        personaLabel: nextConfig.label,
        suggestedAction: null,
      },
    ]);
  };

  const handleResetConversation = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'concierge',
        text: activePersonaConfig.welcome,
        timestamp: 'Ops · New Thread',
        personaLabel: activePersonaConfig.label,
        suggestedAction: 'open_book_page',
      },
    ]);
  };

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isSending) return;

    const clientMsg: ChatMessage = {
      id: `client-${Date.now()}`,
      sender: 'client',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Capture multi-turn conversation history prior to this message
    const historyPayload = messages
      .filter((m) => !m.isError)
      .map((m) => ({
        role: m.sender === 'client' ? ('user' as const) : ('model' as const),
        text: m.text,
      }));

    setMessages((prev) => [...prev, clientMsg]);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
          persona,
          speedMode,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ops-error-${Date.now()}`,
            sender: 'concierge',
            text:
              data.error ||
              'Ops is temporarily unavailable. Please try again or proceed to our Book Now page.',
            timestamp: 'Ops Notice',
            personaLabel: activePersonaConfig.label,
            isError: true,
            suggestedAction: 'open_book_page',
          },
        ]);
        return;
      }

      const conciergeMsg: ChatMessage = {
        id: `concierge-${Date.now()}`,
        sender: 'concierge',
        text:
          data.reply ||
          'Thank you for your inquiry. We invite you to request a tailored proposal on our Book Now page.',
        timestamp: data.timestamp || 'Just now',
        personaLabel: activePersonaConfig.label,
        modelBadge: speedMode === 'fast' ? 'Fast' : 'Flash',
        suggestedAction: data.suggestedAction || 'open_book_page',
      };
      setMessages((prev) => [...prev, conciergeMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `concierge-fallback-${Date.now()}`,
          sender: 'concierge',
          text: 'Ops could not reach the server right now. Please try again or open our Book Now page to share your property specifications.',
          timestamp: 'Just now',
          personaLabel: activePersonaConfig.label,
          isError: true,
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
          aria-label="Open Ops Gemini AI Concierge Chat"
          className="px-4 py-3 bg-[var(--brand-primary)] text-[var(--brand-canvas)] border border-[var(--brand-accent)]/40 rounded-lg shadow-lg hover:bg-[var(--brand-primary-hover)] transition-colors flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <MessageSquare className="w-4 h-4 text-[var(--brand-accent)]" />
          <span className="text-xs font-semibold tracking-[0.1em]">Ops · AI Concierge</span>
        </button>
      ) : (
        <div
          role="dialog"
          aria-label="Ops — Aurel Multi-Turn Gemini Concierge"
          className="w-[350px] sm:w-[410px] bg-[var(--brand-canvas)] border border-[var(--brand-ink)]/20 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[600px]"
        >
          {/* Header */}
          <div className="bg-[var(--brand-primary)] text-[var(--brand-canvas)] px-4 py-3.5 border-b border-[var(--brand-accent)]/25">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--brand-accent)] shrink-0" />
                <div>
                  <p className="font-serif-display text-lg font-semibold tracking-wide text-[var(--brand-canvas)] leading-tight">
                    Ops — AI Concierge
                  </p>
                  <p className="text-[11px] text-[var(--brand-surface)]/75">
                    {activePersonaConfig.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Speed Mode Toggle: Standard (gemini-3.8-flash) vs Fast (gemini-3.1-flash-lite) */}
                <button
                  type="button"
                  onClick={() =>
                    setSpeedMode((prev) => (prev === 'standard' ? 'fast' : 'standard'))
                  }
                  title={
                    speedMode === 'fast'
                      ? 'Fast Mode (gemini-3.1-flash-lite)'
                      : 'Standard Mode (gemini-3.8-flash)'
                  }
                  className={`px-2 py-1 rounded text-[10px] font-mono-tabular flex items-center gap-1 border transition-colors cursor-pointer ${
                    speedMode === 'fast'
                      ? 'bg-[var(--brand-accent)] text-[var(--brand-ink)] border-[var(--brand-accent)] font-semibold'
                      : 'bg-transparent text-[var(--brand-surface)]/85 border-[var(--brand-canvas)]/25 hover:border-[var(--brand-canvas)]/60'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>{speedMode === 'fast' ? 'Fast' : 'Standard'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetConversation}
                  title="Reset conversation history"
                  aria-label="Reset conversation history"
                  className="p-1.5 text-[var(--brand-surface)]/80 hover:text-[var(--brand-canvas)] rounded cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Ops Chat"
                  className="p-1.5 text-[var(--brand-surface)]/80 hover:text-[var(--brand-canvas)] rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Role / System Instruction Switcher */}
            <div
              role="tablist"
              aria-label="Select Ops specialist role"
              className="mt-3 grid grid-cols-3 gap-1 bg-[var(--brand-ink)]/35 p-1 rounded"
            >
              {OPS_PERSONAS.map((role) => {
                const isSelected = role.id === persona;
                return (
                  <button
                    key={role.id}
                    role="tab"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => handlePersonaChange(role.id)}
                    className={`py-1.5 px-2 rounded text-[11px] font-medium transition-colors cursor-pointer truncate ${
                      isSelected
                        ? 'bg-[var(--brand-canvas)] text-[var(--brand-ink)] font-semibold'
                        : 'text-[var(--brand-surface)]/80 hover:text-[var(--brand-canvas)]'
                    }`}
                  >
                    {role.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Multi-Turn Messages Thread */}
          <div className="p-4 space-y-3.5 overflow-y-auto flex-1 max-h-[320px] bg-[var(--brand-canvas)]">
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
                      : msg.isError
                      ? 'bg-amber-50 border border-amber-300 text-amber-950'
                      : 'bg-white border border-[var(--brand-ink)]/10 text-[var(--brand-ink)]'
                  }`}
                >
                  {msg.sender === 'concierge' && msg.personaLabel && (
                    <p className="text-[10px] font-mono-tabular font-semibold text-[var(--brand-primary)] mb-1">
                      Ops · {msg.personaLabel}
                    </p>
                  )}
                  <p className="whitespace-pre-line">{msg.text}</p>

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

                  {msg.sender === 'concierge' && msg.suggestedAction === 'view_services' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onNavigateSection('services');
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--brand-primary)] hover:underline cursor-pointer"
                    >
                      <span>View Services</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  {msg.sender === 'concierge' && msg.suggestedAction === 'view_properties' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onNavigateSection('properties');
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--brand-primary)] hover:underline cursor-pointer"
                    >
                      <span>View California Properties</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-[var(--brand-ink)]/50 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isSending && (
              <div className="flex items-start">
                <div className="bg-white border border-[var(--brand-ink)]/10 text-[var(--brand-ink)]/75 px-3.5 py-2.5 rounded-lg text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse" />
                  <span>Ops is composing a response...</span>
                </div>
              </div>
            )}

            <div ref={threadEndRef} />
          </div>

          {/* Role-Specific Quick Inquiry Prompts */}
          <div className="px-4 py-2 bg-[var(--brand-surface)]/70 border-t border-[var(--brand-ink)]/10 flex items-center gap-1.5 overflow-x-auto">
            {activePersonaConfig.prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={isSending}
                onClick={() => void sendMessage(prompt)}
                className="px-2.5 py-1 bg-white border border-[var(--brand-ink)]/15 rounded text-[11px] text-[var(--brand-ink)] hover:border-[var(--brand-primary)] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
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
              placeholder={`Message Ops (${activePersonaConfig.label})...`}
              aria-label="Message Ops AI Concierge"
              className="flex-1 px-3 py-2 text-xs text-[var(--brand-ink)] bg-[var(--brand-canvas)] border border-[var(--brand-ink)]/15 rounded focus:outline-none focus:border-[var(--brand-primary)]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              aria-label="Send message to Ops"
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

