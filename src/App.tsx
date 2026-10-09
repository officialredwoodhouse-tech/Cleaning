/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  MapPin,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  APPROACH_STEPS,
  BRAND_IMAGES,
  BUSINESS_CONTACT_PLACEHOLDERS,
  FAQ_ITEMS,
  PLACEHOLDER_TESTIMONIALS,
  SERVICE_PLAN_TIERS,
  SERVICES_LIST,
  ServiceItem,
  TRUST_INDICATORS,
  WHY_CHOOSE_REASONS,
} from './data/siteContent';
import { Navbar } from './components/Navbar';
import { ResilientImage } from './components/ResilientImage';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { CaliforniaServiceMap } from './components/CaliforniaServiceMap';
import { QuoteBookingEngine } from './components/QuoteBookingEngine';
import { BookNowPage } from './components/BookNowPage';
import { LiveConciergeChat } from './components/LiveConciergeChat';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export default function App() {
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  // Page routing state ('home' vs dedicated 'book' page) synced with URL query param ?page=book
  const [activePage, setActivePage] = useState<'home' | 'book'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') === 'book' ? 'book' : 'home';
  });

  // Pre-selected parameters passed to the Quote / Book Now engine
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);
  const [preselectedTier, setPreselectedTier] = useState<string | undefined>(undefined);
  const [preselectedLocation, setPreselectedLocation] = useState<string | undefined>(undefined);

  // Interactive states for Services Filter, Service Modal, Testimonials, FAQ Accordion, and Legal Modals
  const [serviceFilter, setServiceFilter] = useState<'all' | 'residential' | 'commercial' | 'specialty'>('all');
  const [activeServiceModal, setActiveServiceModal] = useState<ServiceItem | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [openFaqId, setOpenFaqId] = useState<string>(FAQ_ITEMS[0].id);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);

  // Listen for Google Maps Platform quota events at top-level application root
  useEffect(() => {
    const handleQuotaExceeded = () => {
      setGmpQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  // Sync browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActivePage(params.get('page') === 'book' ? 'book' : 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openBookNowPage = (
    service?: string,
    tier?: string,
    location?: string
  ) => {
    if (service) setPreselectedService(service);
    if (tier) setPreselectedTier(tier);
    if (location) setPreselectedLocation(location);

    const url = new URL(window.location.href);
    url.searchParams.set('page', 'book');
    window.history.pushState({}, '', url.toString());
    setActivePage('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHomeSection = (sectionId: string) => {
    if (activePage !== 'home') {
      const url = new URL(window.location.href);
      url.searchParams.delete('page');
      window.history.pushState({}, '', url.toString());
      setActivePage('home');
      setTimeout(() => {
        if (sectionId === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const el = document.getElementById(sectionId);
          el?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
    } else {
      if (sectionId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const filteredServices =
    serviceFilter === 'all'
      ? SERVICES_LIST
      : SERVICES_LIST.filter((s) => s.category === serviceFilter);

  const currentTestimonial = PLACEHOLDER_TESTIMONIALS[testimonialIndex];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus(null);
    if (!newsletterEmail.trim()) return;
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewsletterStatus(data.message || 'Subscribed to Aurel Private Client Advisories.');
        setNewsletterEmail('');
      } else {
        setNewsletterStatus(data.error || 'Please enter a valid email address.');
      }
    } catch {
      setNewsletterStatus('Unable to subscribe right now. Please try again shortly.');
    }
  };

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <div id="top" className="min-h-screen flex flex-col bg-[#F7F5F0] text-[#202421]">
        {/* Top-level Google Maps Platform Demo Quota Banner (Required by GMP Skill Section 8 Case A) */}
        {gmpQuotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* 3. WEBSITE NAVIGATION */}
        <Navbar
          activePage={activePage}
          onNavigateHomeSection={navigateToHomeSection}
          onOpenBookPage={(svc, tier) => openBookNowPage(svc, tier)}
        />

        {/* DEDICATED BOOK NOW PAGE VIEW */}
        {activePage === 'book' ? (
          <main className="flex-1">
            <BookNowPage
              initialService={preselectedService}
              initialPlanTier={preselectedTier}
              initialLocation={preselectedLocation}
              onBackToHome={() => navigateToHomeSection('top')}
            />
          </main>
        ) : (
          /* MAIN EDITORIAL HOMEPAGE VIEW */
          <main className="flex-1">
            {/* 4. HERO SECTION */}
            <section
              aria-label="Hero Introduction"
              className="relative min-h-[92vh] flex items-center pt-24 pb-16 overflow-hidden bg-[#153D32]"
            >
              {/* Full-width High-Resolution Architectural Photograph */}
              <div className="absolute inset-0 z-0">
                <motion.div
                  initial={{ scale: 1.03, opacity: 0.85 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full"
                >
                  <ResilientImage
                    src={BRAND_IMAGES.heroPenthouse}
                    alt="Sunlit luxury California penthouse living room with floor-to-ceiling windows, honed marble fireplace, and wide-plank oak flooring"
                    loading="eager"
                    className="w-full h-full object-cover object-center"
                  />
                </motion.div>
                {/* Measured Scrim Overlay for WCAG AA Contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#153D32]/92 via-[#153D32]/75 to-[#153D32]/35" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#153D32]/85 via-transparent to-[#202421]/35" />
              </div>

              <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-10 w-full">
                <div className="max-w-3xl">
                  {/* Quiet Unboxed Eyebrow */}
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="text-xs sm:text-sm font-medium tracking-[0.18em] text-[#C6A66B] mb-5"
                  >
                    Premium Residential & Commercial Cleaning · California
                  </motion.p>

                  {/* Main Editorial Headline */}
                  <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="font-serif-display text-4xl sm:text-6xl lg:text-[64px] font-normal text-[#F7F5F0] leading-[1.06] tracking-wide"
                  >
                    Luxury Begins With a Space That Feels Perfect.
                  </motion.h1>

                  {/* Supporting Copy */}
                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-6 text-base sm:text-lg text-[#F7F5F0]/90 leading-relaxed max-w-2xl"
                  >
                    Exceptional cleaning for exceptional spaces. Experience meticulous attention to
                    detail, personalized service, and standards designed around your lifestyle.
                  </motion.p>

                  {/* Primary & Secondary CTAs */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-9 flex flex-wrap items-center gap-4"
                  >
                    <button
                      type="button"
                      onClick={() => openBookNowPage()}
                      className="px-7 py-4 bg-[#C6A66B] text-[#202421] text-xs font-semibold tracking-[0.14em] rounded hover:bg-[#d4b67d] transition-colors flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>Book Your Cleaning</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <a
                      href="#services"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToHomeSection('services');
                      }}
                      className="px-7 py-4 bg-transparent border border-[#F7F5F0]/40 text-[#F7F5F0] text-xs font-semibold tracking-[0.14em] rounded hover:border-[#F7F5F0] hover:bg-[#F7F5F0]/10 transition-colors whitespace-nowrap shrink-0"
                    >
                      Explore Our Services
                    </a>
                  </motion.div>

                  {/* Three Compact Trust Indicators (Zero-Pill Unboxed Metadata with Separator) */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.34 }}
                    className="mt-10 pt-6 border-t border-[#F7F5F0]/20 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-[#E9E6DF]/90"
                  >
                    <span>Meticulous Attention to Detail</span>
                    <span aria-hidden="true" className="text-[#C6A66B]">
                      ·
                    </span>
                    <span>Tailored Cleaning Plans</span>
                    <span aria-hidden="true" className="text-[#C6A66B]">
                      ·
                    </span>
                    <span>Professional Service Across California</span>
                  </motion.div>
                </div>

                {/* Subtle Scroll Indicator */}
                <div className="mt-12 md:mt-16 flex items-center justify-between text-xs text-[#E9E6DF]/70">
                  <a
                    href="#credibility-strip"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToHomeSection('credibility-strip');
                    }}
                    className="inline-flex items-center gap-2 hover:text-[#F7F5F0] transition-colors"
                  >
                    <span>Discover The Aurel Standard</span>
                    <ArrowDown className="w-3.5 h-3.5 text-[#C6A66B]" />
                  </a>
                  <span className="hidden sm:inline font-mono-tabular">
                    Beverly Hills · San Francisco · Montecito · Newport Beach
                  </span>
                </div>
              </div>
            </section>

            {/* 5. TRUST AND CREDIBILITY STRIP */}
            <section
              id="credibility-strip"
              aria-label="Core Service commitments"
              className="bg-[#E9E6DF] border-b border-[#202421]/10 py-12 md:py-16"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:divide-x lg:divide-[#202421]/10">
                  {TRUST_INDICATORS.map((item, idx) => (
                    <div key={item.title} className={idx > 0 ? 'lg:pl-8' : ''}>
                      <p className="text-xs font-mono-tabular text-[#153D32] mb-2">
                        0{idx + 1}
                      </p>
                      <h2 className="font-serif-display text-xl font-semibold text-[#202421]">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-xs sm:text-sm text-[#202421]/75 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 6. SERVICES SECTION */}
            <section
              id="services"
              aria-labelledby="services-heading"
              className="py-24 md:py-32 bg-[#F7F5F0]"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
                  <div className="max-w-2xl">
                    <p className="text-xs font-medium tracking-[0.16em] text-[#153D32] mb-3">
                      Our Services
                    </p>
                    <h2
                      id="services-heading"
                      className="font-serif-display text-3xl sm:text-5xl font-normal text-[#202421] leading-[1.1]"
                    >
                      Thoughtful Care for Every Kind of Space.
                    </h2>
                    <p className="mt-4 text-base text-[#202421]/80 leading-relaxed">
                      From the comfort of your home to the professionalism of your workplace, every
                      service is delivered with care, precision, and attention to the details that
                      matter.
                    </p>
                  </div>

                  {/* Interactive Filter Bar (Functional Segmented Buttons) */}
                  <div
                    role="tablist"
                    aria-label="Filter cleaning services by category"
                    className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#E9E6DF] border border-[#202421]/10 rounded-lg self-start"
                  >
                    {[
                      { id: 'all', label: 'All Services (6)' },
                      { id: 'residential', label: 'Residential' },
                      { id: 'commercial', label: 'Commercial' },
                      { id: 'specialty', label: 'Transitions & Post-Build' },
                    ].map((tab) => {
                      const active = serviceFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          role="tab"
                          aria-selected={active}
                          type="button"
                          onClick={() =>
                            setServiceFilter(
                              tab.id as 'all' | 'residential' | 'commercial' | 'specialty'
                            )
                          }
                          className={`px-3.5 py-2 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            active
                              ? 'bg-[#153D32] text-[#F7F5F0]'
                              : 'text-[#202421]/75 hover:text-[#202421]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Editorial Image-Led Services Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {filteredServices.map((service) => (
                    <article
                      key={service.id}
                      className={`${
                        serviceFilter === 'all' ? service.colSpanClass : 'lg:col-span-6'
                      } group bg-[#E9E6DF]/55 border border-[#202421]/10 rounded-lg overflow-hidden flex flex-col justify-between transition-colors hover:border-[#153D32]/40`}
                    >
                      <div>
                        <div className="relative aspect-[16/10] overflow-hidden bg-[#202421]">
                          <ResilientImage
                            src={service.image}
                            alt={service.imageAlt}
                            fallbackTitle={service.title}
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          />
                        </div>

                        <div className="p-7 md:p-8">
                          <div className="flex items-center gap-2 text-xs text-[#153D32] font-mono-tabular mb-2">
                            <span>{service.number}.</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-sans capitalize">{service.category} Care</span>
                          </div>

                          <h3 className="font-serif-display text-2xl sm:text-3xl font-medium text-[#202421]">
                            {service.title}
                          </h3>

                          <p className="mt-3 text-sm sm:text-base text-[#202421]/80 leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      <div className="px-7 md:px-8 pb-7 pt-4 border-t border-[#202421]/10 flex flex-wrap items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => setActiveServiceModal(service)}
                          className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#153D32] hover:text-[#202421] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <span>{service.ctaLabel}</span>
                          <ArrowUpRight className="w-4 h-4 text-[#C6A66B]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openBookNowPage(service.id)}
                          className="text-xs font-medium text-[#202421]/70 hover:text-[#153D32] underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          Book This Service
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* 7. SIGNATURE BRAND STATEMENT */}
            <section
              aria-labelledby="signature-statement-heading"
              className="py-24 md:py-32 bg-[#153D32] text-[#F7F5F0]"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-7">
                    <p className="text-xs font-medium tracking-[0.18em] text-[#C6A66B] mb-4">
                      Aurel Philosophy
                    </p>
                    <h2
                      id="signature-statement-heading"
                      className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-normal text-[#F7F5F0] leading-[1.08] tracking-wide"
                    >
                      Clean Is the Standard. Exceptional Is the Difference.
                    </h2>
                    <p className="mt-6 text-base sm:text-lg text-[#E9E6DF]/90 leading-relaxed max-w-2xl">
                      We believe a truly clean space is about more than appearances. It is about
                      comfort, confidence, and the quiet satisfaction of knowing every detail has
                      been considered.
                    </p>
                    <div className="mt-8 pt-6 border-t border-[#F7F5F0]/15 flex flex-wrap items-center gap-6 text-xs text-[#E9E6DF]/80">
                      <span>Private Estates & Penthouses</span>
                      <span aria-hidden="true" className="text-[#C6A66B]">
                        ·
                      </span>
                      <span>Architectural Studios & Executive Offices</span>
                      <span aria-hidden="true" className="text-[#C6A66B]">
                        ·
                      </span>
                      <span>Bespoke California Scheduling</span>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="rounded-lg overflow-hidden border border-[#C6A66B]/30 aspect-[4/3] bg-[#202421]">
                      <ResilientImage
                        src={BRAND_IMAGES.residentialKitchen}
                        alt="Immaculate luxury interior kitchen with natural light and honed stone countertops"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. OUR APPROACH */}
            <section
              id="approach"
              aria-labelledby="approach-heading"
              className="py-24 md:py-32 bg-[#F7F5F0] border-b border-[#202421]/10"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="max-w-2xl mb-16">
                  <p className="text-xs font-medium tracking-[0.16em] text-[#153D32] mb-3">
                    The Aurel Standard
                  </p>
                  <h2
                    id="approach-heading"
                    className="font-serif-display text-3xl sm:text-5xl font-normal text-[#202421] leading-[1.1]"
                  >
                    A Considered Approach to Every Detail.
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {APPROACH_STEPS.map((stepItem) => (
                    <div
                      key={stepItem.number}
                      className="pt-6 border-t border-[#202421]/20 flex flex-col justify-between"
                    >
                      <div>
                        <span className="font-mono-tabular text-sm font-medium text-[#153D32]">
                          {stepItem.number} —
                        </span>
                        <h3 className="font-serif-display text-2xl font-medium text-[#202421] mt-3">
                          {stepItem.title}
                        </h3>
                        <p className="mt-3 text-sm sm:text-base text-[#202421]/85 leading-relaxed">
                          {stepItem.description}
                        </p>
                      </div>
                      <p className="mt-5 pt-4 border-t border-[#202421]/10 text-xs text-[#202421]/65 leading-relaxed">
                        {stepItem.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 9. WHY CHOOSE US */}
            <section
              id="about"
              aria-labelledby="why-choose-heading"
              className="py-24 md:py-32 bg-[#F7F5F0]"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
                  {/* Left: Large Vertical Editorial Photograph */}
                  <div className="lg:col-span-5 flex flex-col">
                    <div className="relative rounded-lg overflow-hidden border border-[#202421]/15 flex-1 min-h-[440px] bg-[#202421]">
                      <ResilientImage
                        src={BRAND_IMAGES.specialistCare}
                        alt="Professional luxury housekeeping specialist in a tailored forest-green apron carefully detailing a honed marble console table"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#202421]/90 via-[#202421]/50 to-transparent p-6 text-[#F7F5F0]">
                        <p className="font-serif-display text-xl">
                          Discreet Stewardship for Private & Commercial Properties
                        </p>
                        <p className="text-xs text-[#E9E6DF]/80 mt-1">
                          Every surface treated according to its material composition.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Five Reasons to Choose Aurel Cleaning Co. */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium tracking-[0.16em] text-[#153D32] mb-3">
                        Why Choose Aurel
                      </p>
                      <h2
                        id="why-choose-heading"
                        className="font-serif-display text-3xl sm:text-5xl font-normal text-[#202421] leading-[1.1]"
                      >
                        Considered Service. Impeccable Attention.
                      </h2>
                    </div>

                    <div className="mt-8 divide-y divide-[#202421]/12 border-y border-[#202421]/12">
                      {WHY_CHOOSE_REASONS.map((reason) => (
                        <div
                          key={reason.number}
                          className="py-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-8"
                        >
                          <div className="flex items-baseline gap-3 sm:w-2/5 shrink-0">
                            <span className="font-mono-tabular text-xs text-[#153D32]">
                              {reason.number}.
                            </span>
                            <h3 className="font-serif-display text-xl sm:text-2xl font-medium text-[#202421]">
                              {reason.title}
                            </h3>
                          </div>
                          <p className="text-sm sm:text-base text-[#202421]/80 leading-relaxed sm:w-3/5">
                            {reason.description}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                      <p className="text-xs text-[#202421]/65">
                        Custom protocols available for fine art residences, designer showrooms, and
                        private estates.
                      </p>
                      <button
                        type="button"
                        onClick={() => openBookNowPage()}
                        className="px-5 py-3 bg-[#153D32] text-[#F7F5F0] text-xs font-semibold tracking-[0.12em] rounded hover:bg-[#102E26] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Schedule a Consultation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 10. BEFORE-AND-AFTER EXPERIENCE */}
            <BeforeAfterSlider />

            {/* CALIFORNIA SERVICE AREA INTERACTIVE MAP SECTION */}
            <section
              id="california-map"
              aria-labelledby="california-map-heading"
              className="py-24 md:py-32 bg-[#F7F5F0] border-b border-[#202421]/10"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                  <div className="max-w-2xl">
                    <p className="text-xs font-medium tracking-[0.16em] text-[#153D32] mb-3">
                      Based in California · Service Corridors
                    </p>
                    <h2
                      id="california-map-heading"
                      className="font-serif-display text-3xl sm:text-5xl font-normal text-[#202421] leading-[1.1]"
                    >
                      Serving California’s Premier Residential & Commercial Addresses.
                    </h2>
                    <p className="mt-4 text-base text-[#202421]/80 leading-relaxed">
                      Explore our active California service regions below or search your property
                      address to verify coverage and begin a tailored quote on our Book Now page.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openBookNowPage()}
                    className="px-6 py-3.5 bg-[#153D32] text-[#F7F5F0] text-xs font-semibold tracking-[0.12em] rounded hover:bg-[#102E26] transition-colors flex items-center gap-2 self-start lg:self-auto cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <MapPin className="w-4 h-4 text-[#C6A66B]" />
                    <span>Open Dedicated Book Now Page</span>
                  </button>
                </div>

                <CaliforniaServiceMap
                  onSelectLocationForBooking={(formattedAddress) => {
                    openBookNowPage(undefined, undefined, formattedAddress);
                  }}
                />
              </div>
            </section>

            {/* 11. TESTIMONIALS CAROUSEL */}
            <section
              aria-labelledby="testimonials-heading"
              className="py-24 md:py-32 bg-[#E9E6DF] border-b border-[#202421]/10"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                  <div>
                    <p className="text-xs font-medium tracking-[0.16em] text-[#153D32] mb-3">
                      Client Perspectives · Development Placeholders
                    </p>
                    <h2
                      id="testimonials-heading"
                      className="font-serif-display text-3xl sm:text-5xl font-normal text-[#202421] leading-[1.1]"
                    >
                      A Standard Worth Coming Back To.
                    </h2>
                  </div>

                  {/* Understated Carousel Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setTestimonialIndex((prev) =>
                          prev === 0 ? PLACEHOLDER_TESTIMONIALS.length - 1 : prev - 1
                        )
                      }
                      aria-label="Previous testimonial"
                      className="p-3 rounded border border-[#202421]/20 text-[#202421] hover:border-[#153D32] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono-tabular text-[#202421]/70 px-2">
                      0{testimonialIndex + 1} / 0{PLACEHOLDER_TESTIMONIALS.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setTestimonialIndex((prev) =>
                          prev === PLACEHOLDER_TESTIMONIALS.length - 1 ? 0 : prev + 1
                        )
                      }
                      aria-label="Next testimonial"
                      className="p-3 rounded border border-[#202421]/20 text-[#202421] hover:border-[#153D32] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Active Testimonial Card */}
                <div className="bg-[#F7F5F0] border border-[#202421]/10 rounded-lg p-8 sm:p-12 md:p-16">
                  <blockquote className="font-serif-display text-2xl sm:text-3xl lg:text-4xl font-normal text-[#202421] leading-[1.3] max-w-4xl">
                    “{currentTestimonial.quote}”
                  </blockquote>

                  <div className="mt-8 pt-6 border-t border-[#202421]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-[#202421]">
                      <span className="font-semibold">{currentTestimonial.authorInitials}</span>
                      <span aria-hidden="true" className="text-[#C6A66B]">
                        ·
                      </span>
                      <span className="text-[#202421]/75">{currentTestimonial.locationRegion}</span>
                      <span aria-hidden="true" className="text-[#C6A66B]">
                        ·
                      </span>
                      <span className="text-[#153D32] font-medium">
                        {currentTestimonial.serviceCategory}
                      </span>
                    </div>

                    <p className="text-xs text-[#202421]/55">
                      [Placeholder testimonial for layout preview — replace with verified client
                      reviews before publication]
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 12. PRICING AND QUOTE SECTION */}
            <section
              id="pricing"
              aria-labelledby="pricing-heading"
              className="py-24 md:py-32 bg-[#F7F5F0] border-b border-[#202421]/10"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="max-w-2xl mb-14">
                  <p className="text-xs font-medium tracking-[0.16em] text-[#153D32] mb-3">
                    Service Plans & Custom Quotes
                  </p>
                  <h2
                    id="pricing-heading"
                    className="font-serif-display text-3xl sm:text-5xl font-normal text-[#202421] leading-[1.1]"
                  >
                    Your Space. Your Requirements. Your Quote.
                  </h2>
                  <p className="mt-4 text-base text-[#202421]/80 leading-relaxed">
                    Final pricing depends on your property size, architectural finishes, current
                    condition, and service frequency. Select the service plan category that matches
                    your requirements to request a personalized proposal.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                  {SERVICE_PLAN_TIERS.map((tier, idx) => {
                    const isFeatured = idx === 1;
                    return (
                      <div
                        key={tier.id}
                        className={`rounded-lg p-8 flex flex-col justify-between border ${
                          isFeatured
                            ? 'bg-[#153D32] text-[#F7F5F0] border-[#153D32]'
                            : 'bg-[#E9E6DF]/55 text-[#202421] border-[#202421]/12'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 text-xs font-mono-tabular mb-3">
                            <span className={isFeatured ? 'text-[#C6A66B]' : 'text-[#153D32]'}>
                              Plan 0{idx + 1}
                            </span>
                            <span>Request a Quote</span>
                          </div>

                          <h3 className="font-serif-display text-3xl font-normal">{tier.name}</h3>
                          <p
                            className={`text-xs mt-1 ${
                              isFeatured ? 'text-[#C6A66B]' : 'text-[#153D32]'
                            }`}
                          >
                            {tier.tagline}
                          </p>

                          <p
                            className={`mt-4 text-sm leading-relaxed ${
                              isFeatured ? 'text-[#E9E6DF]/90' : 'text-[#202421]/80'
                            }`}
                          >
                            {tier.description}
                          </p>

                          <div
                            className={`mt-6 pt-6 border-t ${
                              isFeatured ? 'border-[#F7F5F0]/15' : 'border-[#202421]/10'
                            }`}
                          >
                            <p
                              className={`text-xs font-semibold tracking-wider mb-3 ${
                                isFeatured ? 'text-[#E9E6DF]' : 'text-[#202421]'
                              }`}
                            >
                              Key Scope Highlights
                            </p>
                            <ul className="space-y-2.5 text-xs sm:text-sm">
                              {tier.includedFocus.map((point, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                  <Check
                                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                                      isFeatured ? 'text-[#C6A66B]' : 'text-[#153D32]'
                                    }`}
                                  />
                                  <span
                                    className={
                                      isFeatured ? 'text-[#F7F5F0]/90' : 'text-[#202421]/85'
                                    }
                                  >
                                    {point}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-current/10">
                          <p
                            className={`text-xs mb-4 ${
                              isFeatured ? 'text-[#E9E6DF]/75' : 'text-[#202421]/65'
                            }`}
                          >
                            Ideal for: {tier.idealFor}
                          </p>
                          <button
                            type="button"
                            onClick={() => openBookNowPage(undefined, tier.name)}
                            className={`w-full py-3.5 px-5 text-xs font-semibold tracking-[0.12em] rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                              isFeatured
                                ? 'bg-[#C6A66B] text-[#202421] hover:bg-[#d4b67d]'
                                : 'bg-[#153D32] text-[#F7F5F0] hover:bg-[#102E26]'
                            }`}
                          >
                            Get Your Personalized Quote
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 13. INTERACTIVE QUOTE FORM SECTION */}
            <section
              id="quote"
              aria-labelledby="quote-section-heading"
              className="py-24 md:py-32 bg-[#E9E6DF]"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
                  <div className="max-w-2xl">
                    <p className="text-xs font-medium tracking-[0.16em] text-[#153D32] mb-3">
                      Interactive Quote Request
                    </p>
                    <h2
                      id="quote-section-heading"
                      className="font-serif-display text-3xl sm:text-5xl font-normal text-[#202421] leading-[1.1]"
                    >
                      Begin Your Personalized Cleaning Proposal.
                    </h2>
                    <p className="mt-3 text-base text-[#202421]/80 leading-relaxed">
                      Share your service requirements below, or open our full-page California
                      booking view.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openBookNowPage()}
                    className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#153D32] hover:text-[#202421] underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Switch to Full-Screen Book Now Page</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                <QuoteBookingEngine
                  initialService={preselectedService}
                  initialPlanTier={preselectedTier}
                  initialLocation={preselectedLocation}
                />
              </div>
            </section>

            {/* 14. FREQUENTLY ASKED QUESTIONS */}
            <section
              id="faq"
              aria-labelledby="faq-heading"
              className="py-24 md:py-32 bg-[#F7F5F0]"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-5">
                    <p className="text-xs font-medium tracking-[0.16em] text-[#153D32] mb-3">
                      Frequently Asked Questions
                    </p>
                    <h2
                      id="faq-heading"
                      className="font-serif-display text-3xl sm:text-5xl font-normal text-[#202421] leading-[1.1]"
                    >
                      Everything You Need to Know.
                    </h2>
                    <p className="mt-4 text-sm sm:text-base text-[#202421]/75 leading-relaxed">
                      Have a specific question regarding architectural finishes, estate access, or
                      commercial scheduling in California? Reach out to our Client Concierge or
                      request a tailored quote.
                    </p>
                    <button
                      type="button"
                      onClick={() => openBookNowPage()}
                      className="mt-8 px-6 py-3.5 bg-[#153D32] text-[#F7F5F0] text-xs font-semibold tracking-[0.12em] rounded hover:bg-[#102E26] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Request a Personalized Quote
                    </button>
                  </div>

                  <div className="lg:col-span-7 divide-y divide-[#202421]/12 border-y border-[#202421]/12">
                    {FAQ_ITEMS.map((faq) => {
                      const isOpen = openFaqId === faq.id;
                      return (
                        <div key={faq.id} className="py-5">
                          <h3>
                            <button
                              type="button"
                              aria-expanded={isOpen}
                              aria-controls={`faq-panel-${faq.id}`}
                              onClick={() => setOpenFaqId(isOpen ? '' : faq.id)}
                              className="w-full text-left flex items-center justify-between gap-4 font-serif-display text-xl sm:text-2xl font-medium text-[#202421] hover:text-[#153D32] transition-colors cursor-pointer"
                            >
                              <span>{faq.question}</span>
                              <ChevronDown
                                className={`w-5 h-5 text-[#153D32] shrink-0 transition-transform duration-200 ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                          </h3>
                          {isOpen && (
                            <div
                              id={`faq-panel-${faq.id}`}
                              role="region"
                              className="mt-3 pr-8 text-sm sm:text-base text-[#202421]/80 leading-relaxed"
                            >
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* 15. FINAL CALL-TO-ACTION SECTION */}
            <section
              aria-labelledby="final-cta-heading"
              className="relative py-24 md:py-32 bg-[#153D32] text-[#F7F5F0] overflow-hidden"
            >
              <div className="absolute inset-0 z-0 opacity-25">
                <ResilientImage
                  src={BRAND_IMAGES.heroPenthouse}
                  alt="Contemporary California luxury residence"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#153D32]/80" />
              </div>

              <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-10 text-center">
                <p className="text-xs font-medium tracking-[0.18em] text-[#C6A66B] mb-4">
                  Aurel Cleaning Co. · California
                </p>
                <h2
                  id="final-cta-heading"
                  className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-normal text-[#F7F5F0] max-w-3xl mx-auto leading-[1.08]"
                >
                  Come Home to a Higher Standard.
                </h2>
                <p className="mt-5 text-base sm:text-lg text-[#E9E6DF]/90 max-w-xl mx-auto leading-relaxed">
                  Let us take care of the details, so you can enjoy the space around you.
                </p>

                <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => openBookNowPage()}
                    className="px-7 py-4 bg-[#C6A66B] text-[#202421] text-xs font-semibold tracking-[0.14em] rounded hover:bg-[#d4b67d] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Request Your Quote
                  </button>
                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToHomeSection('contact');
                    }}
                    className="px-7 py-4 bg-transparent border border-[#F7F5F0]/40 text-[#F7F5F0] text-xs font-semibold tracking-[0.14em] rounded hover:border-[#F7F5F0] hover:bg-[#F7F5F0]/10 transition-colors whitespace-nowrap shrink-0"
                  >
                    Contact Our Team
                  </a>
                </div>
              </div>
            </section>
          </main>
        )}

        {/* 16. FOOTER */}
        <footer
          id="contact"
          className="bg-[#153D32] text-[#F7F5F0] border-t border-[#F7F5F0]/15 pt-16 pb-12"
        >
          <div className="max-w-[1360px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-14 border-b border-[#F7F5F0]/15">
              {/* Brand & Tagline */}
              <div className="lg:col-span-4">
                <a
                  href="#top"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToHomeSection('top');
                  }}
                  className="font-serif-display text-2xl font-semibold tracking-[0.14em] text-[#F7F5F0]"
                >
                  AUREL CLEANING CO.
                </a>
                <p className="font-serif-display italic text-lg text-[#C6A66B] mt-2">
                  “Exceptional Spaces. Impeccable Standards.”
                </p>
                <p className="mt-4 text-xs text-[#E9E6DF]/75 leading-relaxed max-w-sm">
                  Bespoke residential, deep cleaning, move-in/move-out, post-construction, and
                  commercial property care across California.
                </p>
              </div>

              {/* Navigation Links */}
              <div className="lg:col-span-2">
                <h3 className="text-xs font-semibold tracking-[0.14em] text-[#C6A66B] mb-4">
                  Navigation
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[#E9E6DF]/85">
                  <li>
                    <a
                      href="#top"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToHomeSection('top');
                      }}
                      className="hover:text-[#C6A66B] transition-colors"
                    >
                      Home
                    </a>
                  </li>
                  <li>
                    <a
                      href="#services"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToHomeSection('services');
                      }}
                      className="hover:text-[#C6A66B] transition-colors"
                    >
                      Services
                    </a>
                  </li>
                  <li>
                    <a
                      href="#approach"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToHomeSection('approach');
                      }}
                      className="hover:text-[#C6A66B] transition-colors"
                    >
                      Our Approach
                    </a>
                  </li>
                  <li>
                    <a
                      href="#about"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToHomeSection('about');
                      }}
                      className="hover:text-[#C6A66B] transition-colors"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#california-map"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToHomeSection('california-map');
                      }}
                      className="hover:text-[#C6A66B] transition-colors"
                    >
                      California Map
                    </a>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openBookNowPage()}
                      className="hover:text-[#C6A66B] transition-colors cursor-pointer"
                    >
                      Book Now
                    </button>
                  </li>
                  <li>
                    <a
                      href="#faq"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToHomeSection('faq');
                      }}
                      className="hover:text-[#C6A66B] transition-colors"
                    >
                      FAQs
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact Details (Placeholders where unverified) */}
              <div className="lg:col-span-3">
                <h3 className="text-xs font-semibold tracking-[0.14em] text-[#C6A66B] mb-4">
                  California Concierge Contact
                </h3>
                <dl className="space-y-3 text-xs text-[#E9E6DF]/85">
                  <div>
                    <dt className="text-[#E9E6DF]/55">Service Area</dt>
                    <dd className="mt-0.5">{BUSINESS_CONTACT_PLACEHOLDERS.serviceAreaDisplay}</dd>
                  </div>
                  <div>
                    <dt className="text-[#E9E6DF]/55">Electronic Mail</dt>
                    <dd className="mt-0.5 font-mono-tabular">
                      {BUSINESS_CONTACT_PLACEHOLDERS.emailDisplay}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#E9E6DF]/55">Direct Telephone</dt>
                    <dd className="mt-0.5">{BUSINESS_CONTACT_PLACEHOLDERS.phoneDisplay}</dd>
                  </div>
                  <div className="pt-2">
                    <span className="text-[11px] text-[#E9E6DF]/60">
                      Social Profiles: [Instagram · Facebook · LinkedIn — Configure verified URLs in
                      siteContent.ts]
                    </span>
                  </div>
                </dl>
              </div>

              {/* Private Client Advisories / Mailing List */}
              <div className="lg:col-span-3">
                <h3 className="text-xs font-semibold tracking-[0.14em] text-[#C6A66B] mb-4">
                  Seasonal Property Care Notes
                </h3>
                <p className="text-xs text-[#E9E6DF]/75 leading-relaxed mb-4">
                  Optional mailing list for seasonal California property maintenance schedules and
                  stone/wood care advisories.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2.5">
                  <label htmlFor="footer-newsletter" className="sr-only">
                    Email address for seasonal property care notes
                  </label>
                  <input
                    id="footer-newsletter"
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="px-3.5 py-2.5 bg-[#F7F5F0]/10 border border-[#F7F5F0]/25 rounded text-xs text-[#F7F5F0] placeholder:text-[#E9E6DF]/50 focus:outline-none focus:border-[#C6A66B]"
                  />
                  <button
                    type="submit"
                    className="py-2.5 px-4 bg-[#C6A66B] text-[#202421] text-xs font-semibold tracking-wider rounded hover:bg-[#d4b67d] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
                {newsletterStatus && (
                  <p className="mt-2 text-xs text-[#C6A66B]" role="status">
                    {newsletterStatus}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Copyright & Legal Links */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E9E6DF]/65">
              <p>
                © {new Date().getFullYear()} AUREL CLEANING CO. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <button
                  type="button"
                  onClick={() => setLegalModal('privacy')}
                  className="hover:text-[#F7F5F0] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => setLegalModal('terms')}
                  className="hover:text-[#F7F5F0] transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        </footer>

        {/* SERVICE SPECIFICATION MODAL */}
        {activeServiceModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
            className="fixed inset-0 z-50 bg-[#202421]/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          >
            <div className="bg-[#F7F5F0] text-[#202421] border border-[#202421]/20 rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl">
              <div className="relative h-52 bg-[#202421]">
                <ResilientImage
                  src={activeServiceModal.image}
                  alt={activeServiceModal.imageAlt}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setActiveServiceModal(null)}
                  aria-label="Close service details"
                  className="absolute top-4 right-4 p-2 bg-[#202421]/80 text-[#F7F5F0] rounded-full hover:bg-[#153D32] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <p className="text-xs font-mono-tabular text-[#153D32]">
                  Service {activeServiceModal.number} · {activeServiceModal.category}
                </p>
                <h3
                  id="service-modal-title"
                  className="font-serif-display text-3xl font-medium text-[#202421] mt-1"
                >
                  {activeServiceModal.title}
                </h3>
                <p className="mt-2 text-sm text-[#202421]/80 leading-relaxed">
                  {activeServiceModal.description}
                </p>

                <div className="mt-6 pt-5 border-t border-[#202421]/10">
                  <h4 className="text-xs font-semibold tracking-wider text-[#153D32] mb-3">
                    Standard Scope Considerations
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#202421]/85">
                    {activeServiceModal.scopeHighlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#153D32] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 p-4 bg-[#E9E6DF] rounded text-xs text-[#202421]/80">
                  <strong>Architectural Surface Protocol:</strong>{' '}
                  {activeServiceModal.surfaceCareNotes}
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveServiceModal(null)}
                    className="px-4 py-2.5 border border-[#202421]/25 text-xs font-medium rounded hover:border-[#202421] cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const chosen = activeServiceModal.id;
                      setActiveServiceModal(null);
                      openBookNowPage(chosen);
                    }}
                    className="px-6 py-2.5 bg-[#153D32] text-[#F7F5F0] text-xs font-semibold tracking-wider rounded hover:bg-[#102E26] cursor-pointer"
                  >
                    Request a Quote for This Service
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRIVACY POLICY & TERMS OF SERVICE MODAL (Includes Google Maps Platform End User Terms disclosure) */}
        {legalModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
            className="fixed inset-0 z-50 bg-[#202421]/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          >
            <div className="bg-[#F7F5F0] text-[#202421] border border-[#202421]/20 rounded-lg max-w-xl w-full p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#202421]/10">
                <h3 id="legal-modal-title" className="font-serif-display text-2xl font-medium">
                  {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h3>
                <button
                  type="button"
                  onClick={() => setLegalModal(null)}
                  aria-label="Close modal"
                  className="p-1.5 text-[#202421]/70 hover:text-[#202421] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs sm:text-sm text-[#202421]/80 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
                {legalModal === 'privacy' ? (
                  <>
                    <p>
                      Aurel Cleaning Co. respects the privacy and discretion of our residential and
                      commercial clients. Information submitted through our Quote Request and Book
                      Now forms is used solely to prepare your cleaning proposal and coordinate
                      requested property services.
                    </p>
                    <p>
                      <strong>Location & Mapping Services:</strong> Our California Service Area Map
                      and address verification features integrate Google Maps Platform services. Use
                      of Google Maps features is subject to the{' '}
                      <a
                        href="https://policies.google.com/privacy?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-[#153D32]"
                      >
                        Google Privacy Policy
                      </a>
                      .
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      All cleaning proposals provided through this website are tailored estimates
                      based on client-submitted property details. Final service scopes and pricing
                      are confirmed prior to your appointment or property walkthrough.
                    </p>
                    <p>
                      <strong>Google Maps Platform Terms:</strong> This application integrates
                      Google Maps features and content. Use of Google Maps features is subject to
                      the then-current{' '}
                      <a
                        href="https://maps.google.com/help/terms_maps/?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-[#153D32]"
                      >
                        Google Maps/Google Earth Additional Terms of Service
                      </a>
                      .
                    </p>
                  </>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#202421]/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => setLegalModal(null)}
                  className="px-5 py-2.5 bg-[#153D32] text-[#F7F5F0] text-xs font-semibold rounded cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIVE CONCIERGE CHAT INTEGRATION */}
        <LiveConciergeChat
          onOpenBookPage={() => openBookNowPage()}
          onNavigateSection={navigateToHomeSection}
        />
      </div>
    </APIProvider>
  );
}
