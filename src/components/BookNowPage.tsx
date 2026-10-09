import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, MapPin, Shield } from 'lucide-react';
import {
  QuoteBookingEngine,
  SubmittedQuoteRecord,
} from './QuoteBookingEngine';
import { CaliforniaServiceMap } from './CaliforniaServiceMap';
import { SERVICE_PLAN_TIERS } from '../data/siteContent';

interface BookNowPageProps {
  initialService?: string;
  initialPlanTier?: string;
  initialLocation?: string;
  onBackToHome: () => void;
}

export const BookNowPage: React.FC<BookNowPageProps> = ({
  initialService,
  initialPlanTier,
  initialLocation,
  onBackToHome,
}) => {
  const [selectedMapLocation, setSelectedMapLocation] = useState<string | undefined>(
    initialLocation
  );
  const [recentQuotes, setRecentQuotes] = useState<SubmittedQuoteRecord[]>([]);

  useEffect(() => {
    if (initialLocation) {
      setSelectedMapLocation(initialLocation);
    }
  }, [initialLocation]);

  const fetchRecentQuotes = async () => {
    try {
      const res = await fetch('/api/quotes');
      if (res.ok) {
        const data = await res.json();
        setRecentQuotes(data.quotes || []);
      }
    } catch {
      // ignore fetch error
    }
  };

  useEffect(() => {
    void fetchRecentQuotes();
  }, []);

  const handleSelectFromMap = (formattedAddress: string) => {
    setSelectedMapLocation(formattedAddress);
    const formEl = document.getElementById('book-now-engine');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-20 bg-[var(--brand-canvas)] min-h-screen">
      {/* Top Banner */}
      <section className="bg-[var(--brand-primary)] text-[var(--brand-canvas)] py-16 md:py-20 border-b border-[var(--brand-accent)]/20">
        <div className="max-w-[1360px] mx-auto px-6 md:px-10">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-[var(--brand-accent)] hover:text-[var(--brand-canvas)] transition-colors mb-6 cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Main Residence Overview</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <p className="text-xs font-medium tracking-[0.16em] text-[var(--brand-surface)]/80 mb-3">
                Book Now · California Private & Commercial Concierge
              </p>
              <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-normal text-[var(--brand-canvas)] leading-[1.08]">
                Your Space. Your Requirements. Your Quote.
              </h1>
            </div>
            <div className="lg:col-span-4">
              <p className="text-sm sm:text-base text-[var(--brand-surface)]/85 leading-relaxed">
                Complete our four-step specification below to request a personalized cleaning quote
                or property walkthrough anywhere across our California service corridors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Booking Engine + Concierge Sidebar */}
      <section id="book-now-engine" className="py-16 md:py-24">
        <div className="max-w-[1360px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left 8 Columns: 4-Step Interactive Booking Form */}
            <div className="lg:col-span-8">
              <QuoteBookingEngine
                initialService={initialService}
                initialPlanTier={initialPlanTier}
                initialLocation={selectedMapLocation}
                onSubmissionSuccess={() => {
                  void fetchRecentQuotes();
                }}
              />
            </div>

            {/* Right 4 Columns: Care Plan Guide & Concierge Process */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-[var(--brand-surface)] border border-[var(--brand-ink)]/10 rounded-lg p-6 md:p-7">
                <p className="text-xs font-semibold tracking-[0.14em] text-[var(--brand-primary)] mb-2">
                  Service Plan Categories
                </p>
                <h2 className="font-serif-display text-2xl font-medium text-[var(--brand-ink)]">
                  Tailored Around Your Property
                </h2>
                <p className="text-xs text-[var(--brand-ink)]/70 mt-1.5 leading-relaxed">
                  Cleaning costs depend on property size, architectural finishes, condition, and
                  frequency. Choose the care level that aligns with your goals:
                </p>

                <div className="mt-5 space-y-4 divide-y divide-[var(--brand-ink)]/10">
                  {SERVICE_PLAN_TIERS.map((tier) => (
                    <div key={tier.id} className="pt-4 first:pt-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-serif-display text-lg font-semibold text-[var(--brand-ink)]">
                          {tier.name}
                        </h3>
                        <span className="text-xs font-medium text-[var(--brand-primary)]">
                          Request a Quote
                        </span>
                      </div>
                      <p className="text-xs text-[var(--brand-ink)]/75 mt-1">{tier.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--brand-canvas)] border border-[var(--brand-ink)]/15 rounded-lg p-6 md:p-7">
                <h2 className="font-serif-display text-xl font-semibold text-[var(--brand-ink)]">
                  What Happens After You Submit
                </h2>
                <ul className="mt-4 space-y-3.5 text-xs text-[var(--brand-ink)]/80 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="font-mono-tabular font-semibold text-[var(--brand-primary)]">
                      01.
                    </span>
                    <span>
                      <strong>Dossier Review:</strong> Our California Concierge reviews your
                      property dimensions, surface notes, and requested schedule.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono-tabular font-semibold text-[var(--brand-primary)]">
                      02.
                    </span>
                    <span>
                      <strong>Tailored Proposal:</strong> We follow up via your preferred contact
                      method with a clear scope and custom quote—or arrange a brief walkthrough for
                      larger estates.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono-tabular font-semibold text-[var(--brand-primary)]">
                      03.
                    </span>
                    <span>
                      <strong>Confirmed Appointment:</strong> Once approved, your date and
                      specialist team are reserved.
                    </span>
                  </li>
                </ul>

                <div className="mt-6 pt-5 border-t border-[var(--brand-ink)]/10 space-y-2.5 text-xs text-[var(--brand-ink)]/70">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                    <span>Serving Southern, Central & Northern California</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                    <span>Discreet Morning, Afternoon & After-Hours Windows</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                    <span>Respectful Care for Fine Stone, Wood & Architectural Glass</span>
                  </div>
                </div>
              </div>

              {recentQuotes.length > 0 && (
                <div className="bg-white border border-[var(--brand-ink)]/15 rounded-lg p-6">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-xs font-semibold tracking-wider text-[var(--brand-primary)]">
                      Recorded Quote Dossiers
                    </h3>
                    <span className="text-xs font-mono-tabular text-[var(--brand-ink)]/60">
                      {recentQuotes.length} Saved
                    </span>
                  </div>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {recentQuotes.slice(0, 4).map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded bg-[var(--brand-canvas)] border border-[var(--brand-ink)]/10 text-xs"
                      >
                        <div className="flex items-center justify-between font-mono-tabular text-[11px] text-[var(--brand-primary)]">
                          <span>{q.referenceCode}</span>
                          <span>{q.preferredDate}</span>
                        </div>
                        <p className="font-medium text-[var(--brand-ink)] mt-1">
                          {q.serviceType} · {q.planTier}
                        </p>
                        <p className="text-[var(--brand-ink)]/65 truncate mt-0.5">{q.location}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Interactive California Coverage Map on Book Now Page */}
      <section className="py-16 md:py-24 bg-[var(--brand-surface)] border-t border-[var(--brand-ink)]/10">
        <div className="max-w-[1360px] mx-auto px-6 md:px-10">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-medium tracking-[0.16em] text-[var(--brand-primary)] mb-2">
              California Coverage Verification
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-normal text-[var(--brand-ink)]">
              Select Your California Community on the Map.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[var(--brand-ink)]/75 leading-relaxed">
              Click any California service corridor or search your property address below to verify
              coverage and automatically populate your location into the booking engine above.
            </p>
          </div>

          <CaliforniaServiceMap
            compact
            onSelectLocationForBooking={(formattedAddress) =>
              handleSelectFromMap(formattedAddress)
            }
          />
        </div>
      </section>
    </div>
  );
};
