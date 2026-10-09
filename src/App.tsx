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
  Instagram,
  Mail,
  MapPin,
  Palette,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  AGENCY_SHOWCASE_ITEMS,
  AgencyShowcaseItem,
  APPROACH_STEPS,
  BRAND_IMAGES,
  BUSINESS_CONTACT_PLACEHOLDERS,
  FAQ_ITEMS,
  FEATURED_PROPERTIES,
  FeaturedPropertyItem,
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

type LuxuryThemeId = 'midnight' | 'espresso' | 'coastal' | 'forest';

const LUXURY_THEMES: {
  id: LuxuryThemeId;
  name: string;
  swatchPrimary: string;
  swatchAccent: string;
  swatchCanvas: string;
}[] = [
  {
    id: 'midnight',
    name: 'Pacific Midnight & Bronze',
    swatchPrimary: '#141D2B',
    swatchAccent: '#B88655',
    swatchCanvas: '#FAF8F5',
  },
  {
    id: 'espresso',
    name: 'Montecito Espresso & Gold',
    swatchPrimary: '#261C17',
    swatchAccent: '#C89D66',
    swatchCanvas: '#FAF7F2',
  },
  {
    id: 'coastal',
    name: 'Malibu Coastal Slate',
    swatchPrimary: '#1B3644',
    swatchAccent: '#C4A47C',
    swatchCanvas: '#F8F9FA',
  },
  {
    id: 'forest',
    name: 'Heritage Forest & Champagne',
    swatchPrimary: '#153D32',
    swatchAccent: '#C6A66B',
    swatchCanvas: '#F7F5F0',
  },
];

export default function App() {
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  // Active luxury color theme
  const [activeTheme, setActiveTheme] = useState<LuxuryThemeId>(() => {
    try {
      const saved = localStorage.getItem('aurel_color_theme_v1') as LuxuryThemeId | null;
      if (saved && ['midnight', 'espresso', 'coastal', 'forest'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'midnight';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    try {
      localStorage.setItem('aurel_color_theme_v1', activeTheme);
    } catch {
      // ignore
    }
  }, [activeTheme]);

  // Page routing state ('home' vs dedicated 'book' page) synced with URL query param ?page=book
  const [activePage, setActivePage] = useState<'home' | 'book'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') === 'book' ? 'book' : 'home';
  });

  // Pre-selected parameters passed to the Quote / Book Now engine
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);
  const [preselectedTier, setPreselectedTier] = useState<string | undefined>(undefined);
  const [preselectedLocation, setPreselectedLocation] = useState<string | undefined>(undefined);

  // Interactive states for Hero Photo Switcher, Agency Lookbook Filter, Services Filter, Modals, Testimonials, and FAQs
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [lookbookFilter, setLookbookFilter] = useState<'all' | 'team-dress' | 'tools-kit'>('all');
  const [activeLookbookModal, setActiveLookbookModal] = useState<AgencyShowcaseItem | null>(null);
  const [serviceFilter, setServiceFilter] = useState<
    'all' | 'residential' | 'commercial' | 'specialty'
  >('all');
  const [activeServiceModal, setActiveServiceModal] = useState<ServiceItem | null>(null);
  const [propertyFilter, setPropertyFilter] = useState<
    'all' | 'estate' | 'coastal-penthouse' | 'commercial-studio'
  >('all');
  const [activePropertyModal, setActivePropertyModal] = useState<FeaturedPropertyItem | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [openFaqId, setOpenFaqId] = useState<string>(FAQ_ITEMS[0].id);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  const heroShowcases = [
    {
      id: 'team-portrait',
      tabLabel: 'Our Team',
      kicker: 'About Us · Single Group Portrait',
      title: 'The Aurel California Specialist Team',
      caption:
        'Our coordinated four-specialist California team in tailored midnight-navy collared shirts and slate aprons with wooden surface caddies.',
      image: BRAND_IMAGES.teamUniformPhotoshoot,
    },
    {
      id: 'tools-arsenal',
      tabLabel: 'HEPA & Tools',
      kicker: 'Complete Equipment Arsenal',
      title: 'HEPA H14 Vacuums, Brass Squeegees & Sprays',
      caption:
        'Commercial stainless HEPA H14 filtration canisters, walnut bottle carriers, solid brass squeegees, and color-coded waffle microfiber.',
      image: BRAND_IMAGES.agencyEquipmentArsenal,
    },
    {
      id: 'surface-caddy',
      tabLabel: 'Surface Kit',
      kicker: 'Hand-Carried Detailing Tools',
      title: 'Bespoke Room-by-Room Surface Caddy',
      caption:
        'Compartmented caddies stocked with pH-neutral stone and wood formulations in amber glass and natural horsehair detailing brushes.',
      image: BRAND_IMAGES.cleaningToolsKit,
    },
    {
      id: 'california-estates',
      tabLabel: 'Properties',
      kicker: 'Signature California Portfolio',
      title: 'Private Estates, Penthouses & Studios',
      caption:
        'Tailored architectural surface care across Beverly Hills, Malibu, San Francisco, Montecito, and Bel Air.',
      image: BRAND_IMAGES.beverlyHillsVilla,
    },
  ];
  const activeHeroShowcase = heroShowcases[heroSlideIndex] || heroShowcases[0];

  const filteredLookbookItems =
    lookbookFilter === 'all'
      ? AGENCY_SHOWCASE_ITEMS
      : AGENCY_SHOWCASE_ITEMS.filter((item) => item.category === lookbookFilter);

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

  // Sync California service-area SEO meta viewport & description tags dynamically
  useEffect(() => {
    const homeDescription =
      'Luxury residential and commercial cleaning in California — serving Beverly Hills, Malibu, San Francisco, Montecito, and Newport Beach. Request a custom quote.';
    const bookDescription =
      'Book luxury residential, deep cleaning, post-construction, or commercial property care across Beverly Hills, Malibu, San Francisco, Montecito, and Orange County.';

    const targetDescription = activePage === 'book' ? bookDescription : homeDescription;

    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover'
    );

    const setMetaContent = (selector: string, attrName: 'name' | 'property', attrValue: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaContent('meta[name="description"]', 'name', 'description', targetDescription);
    setMetaContent('meta[property="og:description"]', 'property', 'og:description', targetDescription);
    setMetaContent('meta[name="twitter:description"]', 'name', 'twitter:description', targetDescription);
  }, [activePage]);

  const openBookNowPage = (service?: string, tier?: string, location?: string) => {
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

  const filteredProperties =
    propertyFilter === 'all'
      ? FEATURED_PROPERTIES
      : FEATURED_PROPERTIES.filter((p) => p.category === propertyFilter);

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
      <div
        id="top"
        className="min-h-screen flex flex-col bg-[var(--brand-canvas)] text-[var(--brand-ink)] transition-colors duration-200"
      >
        {/* Top-level Google Maps Platform Demo Quota Banner */}
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
              className="relative min-h-[92vh] flex items-center pt-28 pb-16 overflow-hidden bg-[var(--brand-primary)]"
            >
              {/* Full-width High-Resolution Photograph of an Immaculate Luxury Residence */}
              <div className="absolute inset-0 z-0">
                <ResilientImage
                  src={BRAND_IMAGES.heroPenthouse}
                  alt="Immaculate sunlit California luxury residence with floor-to-ceiling windows, honed marble, and wide-plank oak flooring"
                  loading="eager"
                  className="w-full h-full object-cover object-center"
                />
                {/* Measured Scrim Overlay for WCAG AA Contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-primary)]/95 via-[var(--brand-primary)]/82 to-[var(--brand-primary)]/45" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-primary)]/90 via-transparent to-[var(--brand-ink)]/35" />
              </div>

              <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                  {/* Left 7 Columns: Editorial Headline & CTAs */}
                  <div className="lg:col-span-7">
                    {/* Quiet Unboxed Eyebrow */}
                    <motion.p
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="text-xs sm:text-sm font-medium tracking-[0.18em] text-[var(--brand-accent)] mb-5"
                    >
                      Premium Residential & Commercial Cleaning Agency · California
                    </motion.p>

                    {/* Main Editorial Headline */}
                    <motion.h1
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className="font-serif-display text-4xl sm:text-6xl lg:text-[60px] font-normal text-[var(--brand-canvas)] leading-[1.06] tracking-wide"
                    >
                      Luxury Begins With a Space That Feels Perfect.
                    </motion.h1>

                    {/* Supporting Copy */}
                    <motion.p
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.65, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-6 text-base sm:text-lg text-[var(--brand-canvas)]/90 leading-relaxed max-w-2xl"
                    >
                      Exceptional cleaning for exceptional spaces. Experience meticulous attention
                      to detail, uniformed specialist teams, bespoke surface tools, and standards
                      designed around your lifestyle.
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
                        className="px-7 py-4 bg-[var(--brand-accent)] text-[var(--brand-ink)] text-xs font-semibold tracking-[0.14em] rounded hover:bg-[var(--brand-accent-hover)] transition-colors flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <span>Book Your Cleaning</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <a
                        href="#about"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateToHomeSection('about');
                        }}
                        className="px-7 py-4 bg-transparent border border-[var(--brand-canvas)]/40 text-[var(--brand-canvas)] text-xs font-semibold tracking-[0.14em] rounded hover:border-[var(--brand-canvas)] hover:bg-[var(--brand-canvas)]/10 transition-colors whitespace-nowrap shrink-0"
                      >
                        Our Team & Tools Lookbook
                      </a>

                      <a
                        href={BUSINESS_CONTACT_PLACEHOLDERS.mailtoHref}
                        className="px-5 py-4 bg-[var(--brand-canvas)]/10 border border-[var(--brand-canvas)]/30 text-[var(--brand-canvas)] text-xs font-semibold tracking-[0.12em] rounded hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                      >
                        <Mail className="w-4 h-4 text-[var(--brand-accent)]" />
                        <span>Email Us</span>
                      </a>

                      <a
                        href={BUSINESS_CONTACT_PLACEHOLDERS.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-4 bg-[var(--brand-canvas)]/10 border border-[var(--brand-canvas)]/30 text-[var(--brand-canvas)] text-xs font-semibold tracking-[0.12em] rounded hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                      >
                        <Instagram className="w-4 h-4 text-[var(--brand-accent)]" />
                        <span>Connect on Instagram</span>
                      </a>
                    </motion.div>

                    {/* Three Compact Trust Indicators */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.7, delay: 0.34 }}
                      className="mt-10 pt-6 border-t border-[var(--brand-canvas)]/20 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-[var(--brand-surface)]/90"
                    >
                      <span>Uniformed Specialist Teams</span>
                      <span aria-hidden="true" className="text-[var(--brand-accent)]">
                        ·
                      </span>
                      <span>HEPA H14 & Bespoke Surface Tools</span>
                      <span aria-hidden="true" className="text-[var(--brand-accent)]">
                        ·
                      </span>
                      <span>Serving California Estates & Offices</span>
                    </motion.div>
                  </div>

                  {/* Right 5 Columns: Crisp Unobstructed Agency Team, Dress Shoot & Tools Showcase Card */}
                  <div className="lg:col-span-5">
                    <div className="bg-[var(--brand-canvas)] text-[var(--brand-ink)] rounded-lg border border-[var(--brand-accent)]/40 overflow-hidden shadow-2xl">
                      {/* Segmented Switcher Tabs */}
                      <div
                        role="tablist"
                        aria-label="Preview our cleaning team, uniform dress shoot, and tools"
                        className="grid grid-cols-4 gap-1 p-1.5 bg-[var(--brand-surface)] border-b border-[var(--brand-ink)]/10"
                      >
                        {heroShowcases.map((slide, idx) => {
                          const isSelected = idx === heroSlideIndex;
                          return (
                            <button
                              key={slide.id}
                              role="tab"
                              aria-selected={isSelected}
                              type="button"
                              onClick={() => setHeroSlideIndex(idx)}
                              className={`py-2 px-2 text-[11px] font-semibold rounded transition-colors cursor-pointer whitespace-nowrap truncate ${
                                isSelected
                                  ? 'bg-[var(--brand-primary)] text-[var(--brand-canvas)]'
                                  : 'text-[var(--brand-ink)]/75 hover:text-[var(--brand-ink)]'
                              }`}
                            >
                              {slide.tabLabel}
                            </button>
                          );
                        })}
                      </div>

                      {/* Un-darkened High-Clarity Photo Viewport */}
                      <div className="relative aspect-[4/3] bg-[var(--brand-ink)] overflow-hidden">
                        <ResilientImage
                          src={activeHeroShowcase.image}
                          alt={activeHeroShowcase.caption}
                          loading="eager"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      {/* Caption & Quick Link to Full 8-Photo Lookbook */}
                      <div className="p-5 bg-[var(--brand-canvas)]">
                        <p className="text-[11px] font-mono-tabular text-[var(--brand-primary)]">
                          0{heroSlideIndex + 1} / 0{heroShowcases.length} · {activeHeroShowcase.kicker}
                        </p>
                        <h2 className="font-serif-display text-xl font-semibold text-[var(--brand-ink)] mt-0.5">
                          {activeHeroShowcase.title}
                        </h2>
                        <p className="text-xs text-[var(--brand-ink)]/75 mt-1.5 leading-relaxed">
                          {activeHeroShowcase.caption}
                        </p>
                        <div className="mt-4 pt-3 border-t border-[var(--brand-ink)]/10 flex items-center justify-between gap-2">
                          <a
                            href="#about"
                            onClick={(e) => {
                              e.preventDefault();
                              navigateToHomeSection('about');
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-primary)] hover:text-[var(--brand-ink)] transition-colors whitespace-nowrap shrink-0"
                          >
                            <span>View Team Group Photo & Tools</span>
                            <ArrowDown className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                          </a>
                          <button
                            type="button"
                            onClick={() =>
                              setHeroSlideIndex((prev) => (prev + 1) % heroShowcases.length)
                            }
                            className="text-xs font-medium text-[var(--brand-ink)]/70 hover:text-[var(--brand-primary)] underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
                          >
                            Next Photo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtle Scroll Indicator & Interactive Color Palette Bar */}
                <div className="mt-10 md:mt-12 flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--brand-surface)]/75">
                  <a
                    href="#about"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToHomeSection('about');
                    }}
                    className="inline-flex items-center gap-2 hover:text-[var(--brand-canvas)] transition-colors"
                  >
                    <span>Explore About Us, Uniform Dress Shoot & Tools Below</span>
                    <ArrowDown className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                  </a>

                  {/* Curated California Color Palette Switcher */}
                  <div className="flex flex-wrap items-center gap-2 bg-[var(--brand-ink)]/45 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-[var(--brand-canvas)]/15">
                    <Palette className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                    <span className="text-[11px] text-[var(--brand-canvas)]/80 mr-1">
                      Palette:
                    </span>
                    {LUXURY_THEMES.map((theme) => {
                      const isCurrent = activeTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setActiveTheme(theme.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            isCurrent
                              ? 'bg-[var(--brand-canvas)] text-[var(--brand-ink)]'
                              : 'text-[var(--brand-canvas)]/75 hover:text-[var(--brand-canvas)]'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/40 shrink-0"
                            style={{ backgroundColor: theme.swatchPrimary }}
                          />
                          <span>{theme.name.split('&')[0].trim()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* 5. TRUST AND CREDIBILITY STRIP */}
            <section
              id="credibility-strip"
              aria-label="Core Service commitments"
              className="bg-[var(--brand-surface)] border-b border-[var(--brand-ink)]/10 py-12 md:py-16"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:divide-x lg:divide-[var(--brand-ink)]/10">
                  {TRUST_INDICATORS.map((item, idx) => (
                    <div key={item.title} className={idx > 0 ? 'lg:pl-8' : ''}>
                      <p className="text-xs font-mono-tabular text-[var(--brand-primary)] mb-2">
                        0{idx + 1}
                      </p>
                      <h2 className="font-serif-display text-xl font-semibold text-[var(--brand-ink)]">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-xs sm:text-sm text-[var(--brand-ink)]/75 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 6. ABOUT US: SINGLE TEAM GROUP PHOTO, UNIFORM STANDARD & PROFESSIONAL CLEANING TOOLS */}
            <section
              id="about"
              aria-labelledby="about-agency-heading"
              className="py-24 md:py-32 bg-[var(--brand-canvas)] border-b border-[var(--brand-ink)]/10"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                {/* Editorial Section Header + Interactive Lookbook Filter */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
                  <div className="max-w-2xl">
                    <p className="text-xs font-medium tracking-[0.16em] text-[var(--brand-primary)] mb-3">
                      About Our Agency · Our Team & Surface-Care Tools
                    </p>
                    <h2
                      id="about-agency-heading"
                      className="font-serif-display text-3xl sm:text-5xl font-normal text-[var(--brand-ink)] leading-[1.1]"
                    >
                      Dressed for Discretion. Equipped for Precision.
                    </h2>
                    <p className="mt-4 text-base text-[var(--brand-ink)]/80 leading-relaxed">
                      Aurel Cleaning Co. operates with the poise of a private hospitality team. Meet
                      our coordinated California specialist team in a single group portrait and
                      explore the professional HEPA H14 and surface-care equipment we bring to every
                      property.
                    </p>
                  </div>

                  {/* Interactive Filter Tabs for the Consolidated 3-Item Agency Lookbook */}
                  <div
                    role="tablist"
                    aria-label="Filter agency team group photo and equipment kits"
                    className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[var(--brand-surface)] border border-[var(--brand-ink)]/10 rounded-lg self-start"
                  >
                    {[
                      { id: 'all', label: 'All (3)' },
                      { id: 'team-dress', label: 'Team Group Photo (1)' },
                      { id: 'tools-kit', label: 'Cleaning Tools & HEPA (2)' },
                    ].map((tab) => {
                      const active = lookbookFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          role="tab"
                          aria-selected={active}
                          type="button"
                          onClick={() =>
                            setLookbookFilter(tab.id as 'all' | 'team-dress' | 'tools-kit')
                          }
                          className={`px-3.5 py-2 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            active
                              ? 'bg-[var(--brand-primary)] text-[var(--brand-canvas)]'
                              : 'text-[var(--brand-ink)]/75 hover:text-[var(--brand-ink)]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Consolidated 3-Card Agency Lookbook Grid: 1 Team Group Photo + 2 Equipment Kits */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14">
                  {filteredLookbookItems.map((item) => (
                    <article
                      key={item.id}
                      className="group bg-[var(--brand-surface)]/55 border border-[var(--brand-ink)]/10 rounded-lg overflow-hidden flex flex-col justify-between transition-colors hover:border-[var(--brand-primary)]/40"
                    >
                      <div>
                        <div className="aspect-[16/10] overflow-hidden bg-[var(--brand-ink)]">
                          <ResilientImage
                            src={item.image}
                            alt={item.imageAlt}
                            fallbackTitle={item.title}
                            lazyObserver
                            blurUp
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          />
                        </div>
                        <div className="p-6 md:p-7">
                          <p className="text-[11px] font-mono-tabular text-[var(--brand-primary)]">
                            {item.number} · {item.categoryLabel}
                          </p>
                          <h3 className="font-serif-display text-2xl font-semibold text-[var(--brand-ink)] mt-1">
                            {item.title}
                          </h3>
                          <p className="mt-2.5 text-xs sm:text-sm text-[var(--brand-ink)]/80 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="px-6 md:px-7 pb-6 pt-4 border-t border-[var(--brand-ink)]/10 flex flex-col justify-between gap-4">
                        <ul className="space-y-1.5 text-xs text-[var(--brand-ink)]/75">
                          {item.specs.map((spec, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[var(--brand-accent)] font-mono-tabular">·</span>
                              <span>{spec}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          onClick={() => setActiveLookbookModal(item)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-primary)] hover:text-[var(--brand-ink)] transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start"
                        >
                          <span>Inspect Photo & Specs</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Unified Dress & Equipment Code Bar (Zero Extra Worker Photos) */}
                <div className="bg-[var(--brand-surface)] border border-[var(--brand-ink)]/10 rounded-lg p-6 md:p-8 mb-20">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-4">
                      <p className="text-xs font-mono-tabular text-[var(--brand-primary)]">
                        The Aurel Dress & Equipment Standard
                      </p>
                      <h3 className="font-serif-display text-2xl sm:text-3xl font-medium text-[var(--brand-ink)] mt-1">
                        Coordinated Presentation on Every Visit
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-[var(--brand-ink)]/75 leading-relaxed">
                        Every specialist in our group portrait follows a strict hospitality dress and
                        equipment protocol designed for luxury interiors.
                      </p>
                    </div>

                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="flex items-start gap-2.5 text-xs text-[var(--brand-ink)]/85">
                        <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[var(--brand-ink)]">
                            Tailored Uniform & Apron
                          </p>
                          <p className="mt-1 text-[var(--brand-ink)]/75 leading-relaxed">
                            Midnight-navy collared shirts and scratch-free slate linen aprons with no
                            exposed metal hardware.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs text-[var(--brand-ink)]/85">
                        <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[var(--brand-ink)]">
                            Gloves & Indoor Footwear
                          </p>
                          <p className="mt-1 text-[var(--brand-ink)]/75 leading-relaxed">
                            Surface-protective detailing gloves and dedicated non-marking indoor
                            soft-sole shoes.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs text-[var(--brand-ink)]/85">
                        <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[var(--brand-ink)]">
                            HEPA H14 & Surface Caddies
                          </p>
                          <p className="mt-1 text-[var(--brand-ink)]/75 leading-relaxed">
                            Whisper-quiet stainless HEPA vacuums, solid brass squeegees, and
                            pH-neutral stone/wood sprays.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Why Choose Us Two-Column Split (Architectural Suite Photo — No Individual Workers) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch pt-12 border-t border-[var(--brand-ink)]/10">
                  {/* Left: Large Vertical Architectural Interior Photograph */}
                  <div className="lg:col-span-5 flex flex-col">
                    <div className="relative rounded-lg overflow-hidden border border-[var(--brand-ink)]/15 flex-1 min-h-[440px] bg-[var(--brand-ink)]">
                      <ResilientImage
                        src={BRAND_IMAGES.marbleSuite}
                        alt="Spotless luxury master bathroom and dressing suite with bookmatched Calacatta marble vanity, frameless glass shower, and limestone floor"
                        lazyObserver
                        blurUp
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[var(--brand-ink)]/90 via-[var(--brand-ink)]/50 to-transparent p-6 text-[var(--brand-canvas)]">
                        <p className="font-serif-display text-xl">
                          Discreet Stewardship for Private & Commercial Properties
                        </p>
                        <p className="text-xs text-[var(--brand-surface)]/80 mt-1">
                          Every surface treated according to its material composition.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Five Reasons to Choose Aurel Cleaning Co. */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium tracking-[0.16em] text-[var(--brand-primary)] mb-3">
                        Why Choose Aurel
                      </p>
                      <h3 className="font-serif-display text-3xl sm:text-5xl font-normal text-[var(--brand-ink)] leading-[1.1]">
                        Considered Service. Impeccable Attention.
                      </h3>
                    </div>

                    <div className="mt-8 divide-y divide-[var(--brand-ink)]/12 border-y border-[var(--brand-ink)]/12">
                      {WHY_CHOOSE_REASONS.map((reason) => (
                        <div
                          key={reason.number}
                          className="py-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-8"
                        >
                          <div className="flex items-baseline gap-3 sm:w-2/5 shrink-0">
                            <span className="font-mono-tabular text-xs text-[var(--brand-primary)]">
                              {reason.number}.
                            </span>
                            <h4 className="font-serif-display text-xl sm:text-2xl font-medium text-[var(--brand-ink)]">
                              {reason.title}
                            </h4>
                          </div>
                          <p className="text-sm sm:text-base text-[var(--brand-ink)]/80 leading-relaxed sm:w-3/5">
                            {reason.description}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                      <p className="text-xs text-[var(--brand-ink)]/65">
                        Custom protocols available for fine art residences, designer showrooms, and
                        private estates.
                      </p>
                      <button
                        type="button"
                        onClick={() => openBookNowPage()}
                        className="px-5 py-3 bg-[var(--brand-primary)] text-[var(--brand-canvas)] text-xs font-semibold tracking-[0.12em] rounded hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Schedule a Consultation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. SERVICES SECTION */}
            <section
              id="services"
              aria-labelledby="services-heading"
              className="py-24 md:py-32 bg-[var(--brand-canvas)]"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
                  <div className="max-w-2xl">
                    <p className="text-xs font-medium tracking-[0.16em] text-[var(--brand-primary)] mb-3">
                      Our Services
                    </p>
                    <h2
                      id="services-heading"
                      className="font-serif-display text-3xl sm:text-5xl font-normal text-[var(--brand-ink)] leading-[1.1]"
                    >
                      Thoughtful Care for Every Kind of Space.
                    </h2>
                    <p className="mt-4 text-base text-[var(--brand-ink)]/80 leading-relaxed">
                      From the comfort of your home to the professionalism of your workplace, every
                      service is delivered with care, precision, and attention to the details that
                      matter.
                    </p>
                  </div>

                  {/* Interactive Filter Bar */}
                  <div
                    role="tablist"
                    aria-label="Filter cleaning services by category"
                    className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[var(--brand-surface)] border border-[var(--brand-ink)]/10 rounded-lg self-start"
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
                              ? 'bg-[var(--brand-primary)] text-[var(--brand-canvas)]'
                              : 'text-[var(--brand-ink)]/75 hover:text-[var(--brand-ink)]'
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
                      } group bg-[var(--brand-surface)]/55 border border-[var(--brand-ink)]/10 rounded-lg overflow-hidden flex flex-col justify-between transition-colors hover:border-[var(--brand-primary)]/40`}
                    >
                      <div>
                        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--brand-ink)]">
                          <ResilientImage
                            src={service.image}
                            alt={service.imageAlt}
                            fallbackTitle={service.title}
                            lazyObserver
                            blurUp
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          />
                        </div>

                        <div className="p-7 md:p-8">
                          <div className="flex items-center gap-2 text-xs text-[var(--brand-primary)] font-mono-tabular mb-2">
                            <span>{service.number}.</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-sans capitalize">{service.category} Care</span>
                          </div>

                          <h3 className="font-serif-display text-2xl sm:text-3xl font-medium text-[var(--brand-ink)]">
                            {service.title}
                          </h3>

                          <p className="mt-3 text-sm sm:text-base text-[var(--brand-ink)]/80 leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      <div className="px-7 md:px-8 pb-7 pt-4 border-t border-[var(--brand-ink)]/10 flex flex-wrap items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => setActiveServiceModal(service)}
                          className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[var(--brand-primary)] hover:text-[var(--brand-ink)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <span>{service.ctaLabel}</span>
                          <ArrowUpRight className="w-4 h-4 text-[var(--brand-accent)]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openBookNowPage(service.id)}
                          className="text-xs font-medium text-[var(--brand-ink)]/70 hover:text-[var(--brand-primary)] underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          Book This Service
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* 7B. SIGNATURE CALIFORNIA PROPERTIES & ESTATES WE SERVE */}
            <section
              id="properties"
              aria-labelledby="properties-heading"
              className="py-24 md:py-32 bg-[var(--brand-surface)] border-y border-[var(--brand-ink)]/10"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
                  <div className="max-w-2xl">
                    <p className="text-xs font-medium tracking-[0.16em] text-[var(--brand-primary)] mb-3">
                      California Portfolio · Properties We Care For
                    </p>
                    <h2
                      id="properties-heading"
                      className="font-serif-display text-3xl sm:text-5xl font-normal text-[var(--brand-ink)] leading-[1.1]"
                    >
                      Representative Estates, Penthouses & Studios.
                    </h2>
                    <p className="mt-4 text-base text-[var(--brand-ink)]/80 leading-relaxed">
                      Explore how our uniformed teams and surface-specific equipment care for
                      distinctive residential and commercial properties across Beverly Hills,
                      Malibu, San Francisco, Montecito, and Bel Air.
                    </p>
                  </div>

                  {/* Interactive Filter Bar for Properties */}
                  <div
                    role="tablist"
                    aria-label="Filter California properties by architectural category"
                    className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[var(--brand-canvas)] border border-[var(--brand-ink)]/10 rounded-lg self-start"
                  >
                    {[
                      { id: 'all', label: 'All Properties (6)' },
                      { id: 'estate', label: 'Private Estates & Villas' },
                      { id: 'coastal-penthouse', label: 'Coastal & Penthouses' },
                      { id: 'commercial-studio', label: 'Commercial Studios' },
                    ].map((tab) => {
                      const active = propertyFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          role="tab"
                          aria-selected={active}
                          type="button"
                          onClick={() =>
                            setPropertyFilter(
                              tab.id as
                                | 'all'
                                | 'estate'
                                | 'coastal-penthouse'
                                | 'commercial-studio'
                            )
                          }
                          className={`px-3.5 py-2 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            active
                              ? 'bg-[var(--brand-primary)] text-[var(--brand-canvas)]'
                              : 'text-[var(--brand-ink)]/75 hover:text-[var(--brand-ink)]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Editorial Properties Grid with IntersectionObserver Lazy Loading & Blur-Up */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {filteredProperties.map((property) => (
                    <article
                      key={property.id}
                      className={`${
                        propertyFilter === 'all' ? property.colSpanClass : 'lg:col-span-6'
                      } group bg-[var(--brand-canvas)] border border-[var(--brand-ink)]/10 rounded-lg overflow-hidden flex flex-col justify-between transition-colors hover:border-[var(--brand-primary)]/40`}
                    >
                      <div>
                        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--brand-ink)]">
                          <ResilientImage
                            src={property.image}
                            alt={property.imageAlt}
                            fallbackTitle={property.title}
                            lazyObserver
                            blurUp
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          />
                        </div>

                        <div className="p-7 md:p-8">
                          {/* Quiet Unboxed Metadata */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--brand-primary)] font-mono-tabular mb-2">
                            <span>{property.number}.</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-sans font-semibold">{property.location}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-sans text-[var(--brand-ink)]/70">
                              {property.dimensions}
                            </span>
                          </div>

                          <h3 className="font-serif-display text-2xl sm:text-3xl font-medium text-[var(--brand-ink)]">
                            {property.title}
                          </h3>

                          <p className="mt-3 text-sm sm:text-base text-[var(--brand-ink)]/80 leading-relaxed">
                            {property.summary}
                          </p>

                          {/* Architectural Materials & Care Cadence */}
                          <div className="mt-5 pt-5 border-t border-[var(--brand-ink)]/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="font-semibold text-[var(--brand-ink)] mb-1.5">
                                Architectural Surfaces
                              </p>
                              <ul className="space-y-1 text-[var(--brand-ink)]/75">
                                {property.architecturalMaterials.map((mat, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-[var(--brand-accent)]">·</span>
                                    <span>{mat}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <p className="font-semibold text-[var(--brand-ink)] mb-1.5">
                                Aurel Care Protocol
                              </p>
                              <ul className="space-y-1 text-[var(--brand-ink)]/75">
                                {property.careProtocolHighlights.map((prot, i) => (
                                  <li key={i} className="flex items-start gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                                    <span>{prot}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-7 md:px-8 pb-7 pt-4 border-t border-[var(--brand-ink)]/10 flex flex-wrap items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => setActivePropertyModal(property)}
                          className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[var(--brand-primary)] hover:text-[var(--brand-ink)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <span>Inspect Property Protocol</span>
                          <ArrowUpRight className="w-4 h-4 text-[var(--brand-accent)]" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openBookNowPage(
                              property.recommendedService,
                              property.recommendedTier,
                              property.location
                            )
                          }
                          className="text-xs font-medium text-[var(--brand-ink)]/70 hover:text-[var(--brand-primary)] underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          Book Similar Property Care
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* 8. SIGNATURE BRAND STATEMENT */}
            <section
              aria-labelledby="signature-statement-heading"
              className="py-24 md:py-32 bg-[var(--brand-primary)] text-[var(--brand-canvas)]"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-7">
                    <p className="text-xs font-medium tracking-[0.18em] text-[var(--brand-accent)] mb-4">
                      Aurel Philosophy
                    </p>
                    <h2
                      id="signature-statement-heading"
                      className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-normal text-[var(--brand-canvas)] leading-[1.08] tracking-wide"
                    >
                      Clean Is the Standard. Exceptional Is the Difference.
                    </h2>
                    <p className="mt-6 text-base sm:text-lg text-[var(--brand-surface)]/90 leading-relaxed max-w-2xl">
                      We believe a truly clean space is about more than appearances. It is about
                      comfort, confidence, and the quiet satisfaction of knowing every detail has
                      been considered.
                    </p>
                    <div className="mt-8 pt-6 border-t border-[var(--brand-canvas)]/15 flex flex-wrap items-center gap-6 text-xs text-[var(--brand-surface)]/80">
                      <span>Private Estates & Penthouses</span>
                      <span aria-hidden="true" className="text-[var(--brand-accent)]">
                        ·
                      </span>
                      <span>Architectural Studios & Executive Offices</span>
                      <span aria-hidden="true" className="text-[var(--brand-accent)]">
                        ·
                      </span>
                      <span>Bespoke California Scheduling</span>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="rounded-lg overflow-hidden border border-[var(--brand-accent)]/30 aspect-[16/10] bg-[var(--brand-ink)]">
                      <ResilientImage
                        src={BRAND_IMAGES.agencyEquipmentArsenal}
                        alt="Complete professional cleaning agency equipment arsenal with stainless HEPA vacuum, walnut bottle caddy, brass squeegees, and horsehair brushes"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 9. OUR APPROACH */}
            <section
              id="approach"
              aria-labelledby="approach-heading"
              className="py-24 md:py-32 bg-[var(--brand-canvas)] border-b border-[var(--brand-ink)]/10"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="max-w-2xl mb-16">
                  <p className="text-xs font-medium tracking-[0.16em] text-[var(--brand-primary)] mb-3">
                    The Aurel Standard
                  </p>
                  <h2
                    id="approach-heading"
                    className="font-serif-display text-3xl sm:text-5xl font-normal text-[var(--brand-ink)] leading-[1.1]"
                  >
                    A Considered Approach to Every Detail.
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {APPROACH_STEPS.map((stepItem) => (
                    <div
                      key={stepItem.number}
                      className="pt-6 border-t border-[var(--brand-ink)]/20 flex flex-col justify-between"
                    >
                      <div>
                        <span className="font-mono-tabular text-sm font-medium text-[var(--brand-primary)]">
                          {stepItem.number} —
                        </span>
                        <h3 className="font-serif-display text-2xl font-medium text-[var(--brand-ink)] mt-3">
                          {stepItem.title}
                        </h3>
                        <p className="mt-3 text-sm sm:text-base text-[var(--brand-ink)]/85 leading-relaxed">
                          {stepItem.description}
                        </p>
                      </div>
                      <p className="mt-5 pt-4 border-t border-[var(--brand-ink)]/10 text-xs text-[var(--brand-ink)]/65 leading-relaxed">
                        {stepItem.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 10. BEFORE-AND-AFTER EXPERIENCE */}
            <BeforeAfterSlider />

            {/* CALIFORNIA SERVICE AREA INTERACTIVE MAP SECTION */}
            <section
              id="california-map"
              aria-labelledby="california-map-heading"
              className="py-24 md:py-32 bg-[var(--brand-canvas)] border-b border-[var(--brand-ink)]/10"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                  <div className="max-w-2xl">
                    <p className="text-xs font-medium tracking-[0.16em] text-[var(--brand-primary)] mb-3">
                      Based in California · Service Corridors
                    </p>
                    <h2
                      id="california-map-heading"
                      className="font-serif-display text-3xl sm:text-5xl font-normal text-[var(--brand-ink)] leading-[1.1]"
                    >
                      Serving California’s Premier Residential & Commercial Addresses.
                    </h2>
                    <p className="mt-4 text-base text-[var(--brand-ink)]/80 leading-relaxed">
                      Explore our active California service regions below or search your property
                      address to verify coverage and begin a tailored quote on our Book Now page.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openBookNowPage()}
                    className="px-6 py-3.5 bg-[var(--brand-primary)] text-[var(--brand-canvas)] text-xs font-semibold tracking-[0.12em] rounded hover:bg-[var(--brand-primary-hover)] transition-colors flex items-center gap-2 self-start lg:self-auto cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <MapPin className="w-4 h-4 text-[var(--brand-accent)]" />
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
              className="py-24 md:py-32 bg-[var(--brand-surface)] border-b border-[var(--brand-ink)]/10"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                  <div>
                    <p className="text-xs font-medium tracking-[0.16em] text-[var(--brand-primary)] mb-3">
                      Client Perspectives · Development Placeholders
                    </p>
                    <h2
                      id="testimonials-heading"
                      className="font-serif-display text-3xl sm:text-5xl font-normal text-[var(--brand-ink)] leading-[1.1]"
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
                      className="p-3 rounded border border-[var(--brand-ink)]/20 text-[var(--brand-ink)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-canvas)] transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono-tabular text-[var(--brand-ink)]/70 px-2">
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
                      className="p-3 rounded border border-[var(--brand-ink)]/20 text-[var(--brand-ink)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-canvas)] transition-colors cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Active Testimonial Card */}
                <div className="bg-[var(--brand-canvas)] border border-[var(--brand-ink)]/10 rounded-lg p-8 sm:p-12 md:p-16">
                  <blockquote className="font-serif-display text-2xl sm:text-3xl lg:text-4xl font-normal text-[var(--brand-ink)] leading-[1.3] max-w-4xl">
                    “{currentTestimonial.quote}”
                  </blockquote>

                  <div className="mt-8 pt-6 border-t border-[var(--brand-ink)]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--brand-ink)]">
                      <span className="font-semibold">{currentTestimonial.authorInitials}</span>
                      <span aria-hidden="true" className="text-[var(--brand-accent)]">
                        ·
                      </span>
                      <span className="text-[var(--brand-ink)]/75">
                        {currentTestimonial.locationRegion}
                      </span>
                      <span aria-hidden="true" className="text-[var(--brand-accent)]">
                        ·
                      </span>
                      <span className="text-[var(--brand-primary)] font-medium">
                        {currentTestimonial.serviceCategory}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--brand-ink)]/55">
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
              className="py-24 md:py-32 bg-[var(--brand-canvas)] border-b border-[var(--brand-ink)]/10"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="max-w-2xl mb-14">
                  <p className="text-xs font-medium tracking-[0.16em] text-[var(--brand-primary)] mb-3">
                    Service Plans & Custom Quotes
                  </p>
                  <h2
                    id="pricing-heading"
                    className="font-serif-display text-3xl sm:text-5xl font-normal text-[var(--brand-ink)] leading-[1.1]"
                  >
                    Your Space. Your Requirements. Your Quote.
                  </h2>
                  <p className="mt-4 text-base text-[var(--brand-ink)]/80 leading-relaxed">
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
                            ? 'bg-[var(--brand-primary)] text-[var(--brand-canvas)] border-[var(--brand-primary)]'
                            : 'bg-[var(--brand-surface)]/55 text-[var(--brand-ink)] border-[var(--brand-ink)]/12'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 text-xs font-mono-tabular mb-3">
                            <span
                              className={
                                isFeatured
                                  ? 'text-[var(--brand-accent)]'
                                  : 'text-[var(--brand-primary)]'
                              }
                            >
                              Plan 0{idx + 1}
                            </span>
                            <span>Request a Quote</span>
                          </div>

                          <h3 className="font-serif-display text-3xl font-normal">{tier.name}</h3>
                          <p
                            className={`text-xs mt-1 ${
                              isFeatured
                                ? 'text-[var(--brand-accent)]'
                                : 'text-[var(--brand-primary)]'
                            }`}
                          >
                            {tier.tagline}
                          </p>

                          <p
                            className={`mt-4 text-sm leading-relaxed ${
                              isFeatured
                                ? 'text-[var(--brand-surface)]/90'
                                : 'text-[var(--brand-ink)]/80'
                            }`}
                          >
                            {tier.description}
                          </p>

                          <div
                            className={`mt-6 pt-6 border-t ${
                              isFeatured
                                ? 'border-[var(--brand-canvas)]/15'
                                : 'border-[var(--brand-ink)]/10'
                            }`}
                          >
                            <p
                              className={`text-xs font-semibold tracking-wider mb-3 ${
                                isFeatured
                                  ? 'text-[var(--brand-surface)]'
                                  : 'text-[var(--brand-ink)]'
                              }`}
                            >
                              Key Scope Highlights
                            </p>
                            <ul className="space-y-2.5 text-xs sm:text-sm">
                              {tier.includedFocus.map((point, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                  <Check
                                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                                      isFeatured
                                        ? 'text-[var(--brand-accent)]'
                                        : 'text-[var(--brand-primary)]'
                                    }`}
                                  />
                                  <span
                                    className={
                                      isFeatured
                                        ? 'text-[var(--brand-canvas)]/90'
                                        : 'text-[var(--brand-ink)]/85'
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
                              isFeatured
                                ? 'text-[var(--brand-surface)]/75'
                                : 'text-[var(--brand-ink)]/65'
                            }`}
                          >
                            Ideal for: {tier.idealFor}
                          </p>
                          <button
                            type="button"
                            onClick={() => openBookNowPage(undefined, tier.name)}
                            className={`w-full py-3.5 px-5 text-xs font-semibold tracking-[0.12em] rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                              isFeatured
                                ? 'bg-[var(--brand-accent)] text-[var(--brand-ink)] hover:bg-[var(--brand-accent-hover)]'
                                : 'bg-[var(--brand-primary)] text-[var(--brand-canvas)] hover:bg-[var(--brand-primary-hover)]'
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
              className="py-24 md:py-32 bg-[var(--brand-surface)]"
            >
              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
                  <div className="max-w-2xl">
                    <p className="text-xs font-medium tracking-[0.16em] text-[var(--brand-primary)] mb-3">
                      Interactive Quote Request
                    </p>
                    <h2
                      id="quote-section-heading"
                      className="font-serif-display text-3xl sm:text-5xl font-normal text-[var(--brand-ink)] leading-[1.1]"
                    >
                      Begin Your Personalized Cleaning Proposal.
                    </h2>
                    <p className="mt-3 text-base text-[var(--brand-ink)]/80 leading-relaxed">
                      Share your service requirements below, or open our full-page California
                      booking view.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openBookNowPage()}
                    className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[var(--brand-primary)] hover:text-[var(--brand-ink)] underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
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
              itemScope
              itemType="https://schema.org/FAQPage"
              className="py-24 md:py-32 bg-[var(--brand-canvas)]"
            >
              {/* JSON-LD FAQPage Structured Data for Search Engine Visibility */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: FAQ_ITEMS.map((faq) => ({
                      '@type': 'Question',
                      name: faq.question,
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: faq.answer,
                      },
                    })),
                  }),
                }}
              />

              <div className="max-w-[1360px] mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-5">
                    <p className="text-xs font-medium tracking-[0.16em] text-[var(--brand-primary)] mb-3">
                      Frequently Asked Questions
                    </p>
                    <h2
                      id="faq-heading"
                      className="font-serif-display text-3xl sm:text-5xl font-normal text-[var(--brand-ink)] leading-[1.1]"
                    >
                      Everything You Need to Know.
                    </h2>
                    <p className="mt-4 text-sm sm:text-base text-[var(--brand-ink)]/75 leading-relaxed">
                      Have a specific question regarding architectural finishes, estate access, or
                      commercial scheduling in California? Reach out to our Client Concierge or
                      request a tailored quote.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openBookNowPage()}
                        className="px-6 py-3.5 bg-[var(--brand-primary)] text-[var(--brand-canvas)] text-xs font-semibold tracking-[0.12em] rounded hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Request a Personalized Quote
                      </button>

                      <a
                        href={BUSINESS_CONTACT_PLACEHOLDERS.mailtoHref}
                        className="px-4 py-3.5 bg-[var(--brand-surface)] border border-[var(--brand-ink)]/15 text-[var(--brand-ink)] text-xs font-semibold tracking-[0.1em] rounded hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                      >
                        <Mail className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                        <span>Email Us</span>
                      </a>

                      <a
                        href={BUSINESS_CONTACT_PLACEHOLDERS.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3.5 bg-[var(--brand-surface)] border border-[var(--brand-ink)]/15 text-[var(--brand-ink)] text-xs font-semibold tracking-[0.1em] rounded hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                      >
                        <Instagram className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                        <span>Connect on Instagram</span>
                      </a>
                    </div>
                  </div>

                  <div className="lg:col-span-7 divide-y divide-[var(--brand-ink)]/12 border-y border-[var(--brand-ink)]/12">
                    {FAQ_ITEMS.map((faq) => {
                      const isOpen = openFaqId === faq.id;
                      return (
                        <div
                          key={faq.id}
                          itemScope
                          itemProp="mainEntity"
                          itemType="https://schema.org/Question"
                          className="py-5"
                        >
                          <h3>
                            <button
                              type="button"
                              aria-expanded={isOpen}
                              aria-controls={`faq-panel-${faq.id}`}
                              onClick={() => setOpenFaqId(isOpen ? '' : faq.id)}
                              className="w-full text-left flex items-center justify-between gap-4 font-serif-display text-xl sm:text-2xl font-medium text-[var(--brand-ink)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
                            >
                              <span itemProp="name">{faq.question}</span>
                              <ChevronDown
                                className={`w-5 h-5 text-[var(--brand-primary)] shrink-0 transition-transform duration-200 ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                          </h3>
                          <div
                            id={`faq-panel-${faq.id}`}
                            role="region"
                            itemScope
                            itemProp="acceptedAnswer"
                            itemType="https://schema.org/Answer"
                            hidden={!isOpen}
                            className={
                              isOpen
                                ? 'mt-3 pr-8 text-sm sm:text-base text-[var(--brand-ink)]/80 leading-relaxed'
                                : 'hidden'
                            }
                          >
                            <p itemProp="text">{faq.answer}</p>
                          </div>
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
              className="relative py-24 md:py-32 bg-[var(--brand-primary)] text-[var(--brand-canvas)] overflow-hidden"
            >
              <div className="absolute inset-0 z-0 opacity-25">
                <ResilientImage
                  src={BRAND_IMAGES.malibuOceanfront}
                  alt="Spotless Malibu oceanfront luxury residence with frameless coastal windows"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[var(--brand-primary)]/80" />
              </div>

              <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-10 text-center">
                <p className="text-xs font-medium tracking-[0.18em] text-[var(--brand-accent)] mb-4">
                  Aurel Cleaning Co. · California
                </p>
                <h2
                  id="final-cta-heading"
                  className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-normal text-[var(--brand-canvas)] max-w-3xl mx-auto leading-[1.08]"
                >
                  Come Home to a Higher Standard.
                </h2>
                <p className="mt-5 text-base sm:text-lg text-[var(--brand-surface)]/90 max-w-xl mx-auto leading-relaxed">
                  Let us take care of the details, so you can enjoy the space around you.
                </p>

                <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => openBookNowPage()}
                    className="px-7 py-4 bg-[var(--brand-accent)] text-[var(--brand-ink)] text-xs font-semibold tracking-[0.14em] rounded hover:bg-[var(--brand-accent-hover)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Request Your Quote
                  </button>
                  <a
                    href={BUSINESS_CONTACT_PLACEHOLDERS.mailtoHref}
                    className="px-6 py-4 bg-transparent border border-[var(--brand-canvas)]/40 text-[var(--brand-canvas)] text-xs font-semibold tracking-[0.14em] rounded hover:border-[var(--brand-canvas)] hover:bg-[var(--brand-canvas)]/10 transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <Mail className="w-4 h-4 text-[var(--brand-accent)]" />
                    <span>Email Us</span>
                  </a>
                  <a
                    href={BUSINESS_CONTACT_PLACEHOLDERS.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-4 bg-transparent border border-[var(--brand-canvas)]/40 text-[var(--brand-canvas)] text-xs font-semibold tracking-[0.14em] rounded hover:border-[var(--brand-canvas)] hover:bg-[var(--brand-canvas)]/10 transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <Instagram className="w-4 h-4 text-[var(--brand-accent)]" />
                    <span>Connect on Instagram</span>
                  </a>
                </div>
              </div>
            </section>
          </main>
        )}

        {/* 16. FOOTER */}
        <footer
          id="contact"
          className="bg-[var(--brand-primary)] text-[var(--brand-canvas)] border-t border-[var(--brand-canvas)]/15 pt-16 pb-12"
        >
          <div className="max-w-[1360px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-14 border-b border-[var(--brand-canvas)]/15">
              {/* Brand & Tagline */}
              <div className="lg:col-span-4">
                <a
                  href="#top"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToHomeSection('top');
                  }}
                  className="font-serif-display text-2xl font-semibold tracking-[0.14em] text-[var(--brand-canvas)]"
                >
                  AUREL CLEANING CO.
                </a>
                <p className="font-serif-display italic text-lg text-[var(--brand-accent)] mt-2">
                  “Exceptional Spaces. Impeccable Standards.”
                </p>
                <p className="mt-4 text-xs text-[var(--brand-surface)]/75 leading-relaxed max-w-sm">
                  Bespoke residential, deep cleaning, move-in/move-out, post-construction, and
                  commercial property care across California.
                </p>

                {/* Palette Switcher in Footer */}
                <div className="mt-6 pt-5 border-t border-[var(--brand-canvas)]/10">
                  <p className="text-[11px] font-semibold tracking-wider text-[var(--brand-accent)] mb-2.5">
                    Brand Color Atmosphere
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {LUXURY_THEMES.map((theme) => {
                      const isCurrent = activeTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setActiveTheme(theme.id)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
                            isCurrent
                              ? 'bg-[var(--brand-canvas)] text-[var(--brand-ink)] border-[var(--brand-canvas)] font-semibold'
                              : 'bg-transparent text-[var(--brand-surface)]/80 border-[var(--brand-canvas)]/20 hover:border-[var(--brand-canvas)]/60'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/20"
                            style={{ backgroundColor: theme.swatchPrimary }}
                          />
                          <span>{theme.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="lg:col-span-2">
                <h3 className="text-xs font-semibold tracking-[0.14em] text-[var(--brand-accent)] mb-4">
                  Navigation
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[var(--brand-surface)]/85">
                  <li>
                    <a
                      href="#top"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToHomeSection('top');
                      }}
                      className="hover:text-[var(--brand-accent)] transition-colors"
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
                      className="hover:text-[var(--brand-accent)] transition-colors"
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
                      className="hover:text-[var(--brand-accent)] transition-colors"
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
                      className="hover:text-[var(--brand-accent)] transition-colors"
                    >
                      About Us & Team
                    </a>
                  </li>
                  <li>
                    <a
                      href="#california-map"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToHomeSection('california-map');
                      }}
                      className="hover:text-[var(--brand-accent)] transition-colors"
                    >
                      California Map
                    </a>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openBookNowPage()}
                      className="hover:text-[var(--brand-accent)] transition-colors cursor-pointer"
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
                      className="hover:text-[var(--brand-accent)] transition-colors"
                    >
                      FAQs
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact Details */}
              <div className="lg:col-span-3">
                <h3 className="text-xs font-semibold tracking-[0.14em] text-[var(--brand-accent)] mb-4">
                  California Concierge Contact
                </h3>
                <dl className="space-y-3 text-xs text-[var(--brand-surface)]/85">
                  <div>
                    <dt className="text-[var(--brand-surface)]/55">Service Area</dt>
                    <dd className="mt-0.5">{BUSINESS_CONTACT_PLACEHOLDERS.serviceAreaDisplay}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--brand-surface)]/55">Electronic Mail</dt>
                    <dd className="mt-0.5 font-mono-tabular">
                      {BUSINESS_CONTACT_PLACEHOLDERS.emailDisplay}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--brand-surface)]/55">Direct Telephone</dt>
                    <dd className="mt-0.5">{BUSINESS_CONTACT_PLACEHOLDERS.phoneDisplay}</dd>
                  </div>
                </dl>

                {/* Direct Email Us & Connect on Instagram Buttons in Footer */}
                <div className="mt-5 pt-4 border-t border-[var(--brand-canvas)]/15 flex flex-col sm:flex-row lg:flex-col gap-2.5">
                  <a
                    href={BUSINESS_CONTACT_PLACEHOLDERS.mailtoHref}
                    className="py-2.5 px-4 bg-[var(--brand-accent)] text-[var(--brand-ink)] text-xs font-semibold tracking-wider rounded hover:bg-[var(--brand-accent-hover)] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Us</span>
                  </a>
                  <a
                    href={BUSINESS_CONTACT_PLACEHOLDERS.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 bg-[var(--brand-canvas)]/10 border border-[var(--brand-canvas)]/30 text-[var(--brand-canvas)] text-xs font-semibold tracking-wider rounded hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <Instagram className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                    <span>Connect on Instagram</span>
                  </a>
                </div>
              </div>

              {/* Private Client Advisories / Mailing List */}
              <div className="lg:col-span-3">
                <h3 className="text-xs font-semibold tracking-[0.14em] text-[var(--brand-accent)] mb-4">
                  Seasonal Property Care Notes
                </h3>
                <p className="text-xs text-[var(--brand-surface)]/75 leading-relaxed mb-4">
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
                    className="px-3.5 py-2.5 bg-[var(--brand-canvas)]/10 border border-[var(--brand-canvas)]/25 rounded text-xs text-[var(--brand-canvas)] placeholder:text-[var(--brand-surface)]/50 focus:outline-none focus:border-[var(--brand-accent)]"
                  />
                  <button
                    type="submit"
                    className="py-2.5 px-4 bg-[var(--brand-accent)] text-[var(--brand-ink)] text-xs font-semibold tracking-wider rounded hover:bg-[var(--brand-accent-hover)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
                {newsletterStatus && (
                  <p className="mt-2 text-xs text-[var(--brand-accent)]" role="status">
                    {newsletterStatus}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Copyright & Legal Links */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--brand-surface)]/65">
              <p>© {new Date().getFullYear()} AUREL CLEANING CO. All rights reserved.</p>
              <div className="flex flex-wrap items-center gap-6">
                <button
                  type="button"
                  onClick={() => setLegalModal('privacy')}
                  className="hover:text-[var(--brand-canvas)] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => setLegalModal('terms')}
                  className="hover:text-[var(--brand-canvas)] transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        </footer>

        {/* AGENCY LOOKBOOK PHOTO & EQUIPMENT SPECIFICATION MODAL */}
        {activeLookbookModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lookbook-modal-title"
            className="fixed inset-0 z-50 bg-[var(--brand-ink)]/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          >
            <div className="bg-[var(--brand-canvas)] text-[var(--brand-ink)] border border-[var(--brand-ink)]/20 rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl">
              <div className="relative aspect-[16/10] bg-[var(--brand-ink)]">
                <ResilientImage
                  src={activeLookbookModal.image}
                  alt={activeLookbookModal.imageAlt}
                  loading="eager"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setActiveLookbookModal(null)}
                  aria-label="Close lookbook photo details"
                  className="absolute top-4 right-4 z-20 p-2 bg-[var(--brand-ink)]/80 text-[var(--brand-canvas)] rounded-full hover:bg-[var(--brand-primary)] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <p className="text-xs font-mono-tabular text-[var(--brand-primary)]">
                  Lookbook {activeLookbookModal.number} · {activeLookbookModal.categoryLabel}
                </p>
                <h3
                  id="lookbook-modal-title"
                  className="font-serif-display text-3xl font-medium text-[var(--brand-ink)] mt-1"
                >
                  {activeLookbookModal.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--brand-ink)]/80 leading-relaxed">
                  {activeLookbookModal.description}
                </p>

                <div className="mt-6 pt-5 border-t border-[var(--brand-ink)]/10">
                  <h4 className="text-xs font-semibold tracking-wider text-[var(--brand-primary)] mb-3">
                    Agency Uniform & Equipment Standards
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-[var(--brand-ink)]/85">
                    {activeLookbookModal.specs.map((spec, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveLookbookModal(null)}
                    className="px-4 py-2.5 border border-[var(--brand-ink)]/25 text-xs font-medium rounded hover:border-[var(--brand-ink)] cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveLookbookModal(null);
                      openBookNowPage();
                    }}
                    className="px-6 py-2.5 bg-[var(--brand-primary)] text-[var(--brand-canvas)] text-xs font-semibold tracking-wider rounded hover:bg-[var(--brand-primary-hover)] cursor-pointer"
                  >
                    Book Our Uniformed Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROPERTY CARE PROTOCOL MODAL */}
        {activePropertyModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="property-modal-title"
            className="fixed inset-0 z-50 bg-[var(--brand-ink)]/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          >
            <div className="bg-[var(--brand-canvas)] text-[var(--brand-ink)] border border-[var(--brand-ink)]/20 rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl">
              <div className="relative h-56 bg-[var(--brand-ink)]">
                <ResilientImage
                  src={activePropertyModal.image}
                  alt={activePropertyModal.imageAlt}
                  loading="eager"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setActivePropertyModal(null)}
                  aria-label="Close property protocol details"
                  className="absolute top-4 right-4 z-20 p-2 bg-[var(--brand-ink)]/80 text-[var(--brand-canvas)] rounded-full hover:bg-[var(--brand-primary)] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular text-[var(--brand-primary)]">
                  <span>Property {activePropertyModal.number}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-sans font-semibold">{activePropertyModal.location}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-sans text-[var(--brand-ink)]/70">
                    {activePropertyModal.dimensions}
                  </span>
                </div>

                <h3
                  id="property-modal-title"
                  className="font-serif-display text-3xl font-medium text-[var(--brand-ink)] mt-1"
                >
                  {activePropertyModal.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--brand-ink)]/80 leading-relaxed">
                  {activePropertyModal.summary}
                </p>

                <div className="mt-6 pt-5 border-t border-[var(--brand-ink)]/10 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-semibold tracking-wider text-[var(--brand-primary)] mb-2.5">
                      Architectural Surfaces Treated
                    </h4>
                    <ul className="space-y-2 text-xs text-[var(--brand-ink)]/85">
                      {activePropertyModal.architecturalMaterials.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[var(--brand-accent)] font-mono-tabular">·</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold tracking-wider text-[var(--brand-primary)] mb-2.5">
                      Assigned Care Protocol ({activePropertyModal.cadence})
                    </h4>
                    <ul className="space-y-2 text-xs text-[var(--brand-ink)]/85">
                      {activePropertyModal.careProtocolHighlights.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActivePropertyModal(null)}
                    className="px-4 py-2.5 border border-[var(--brand-ink)]/25 text-xs font-medium rounded hover:border-[var(--brand-ink)] cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const prop = activePropertyModal;
                      setActivePropertyModal(null);
                      openBookNowPage(
                        prop.recommendedService,
                        prop.recommendedTier,
                        prop.location
                      );
                    }}
                    className="px-6 py-2.5 bg-[var(--brand-primary)] text-[var(--brand-canvas)] text-xs font-semibold tracking-wider rounded hover:bg-[var(--brand-primary-hover)] cursor-pointer"
                  >
                    Request Quote for Similar Property
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SERVICE SPECIFICATION MODAL */}
        {activeServiceModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
            className="fixed inset-0 z-50 bg-[var(--brand-ink)]/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          >
            <div className="bg-[var(--brand-canvas)] text-[var(--brand-ink)] border border-[var(--brand-ink)]/20 rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl">
              <div className="relative h-52 bg-[var(--brand-ink)]">
                <ResilientImage
                  src={activeServiceModal.image}
                  alt={activeServiceModal.imageAlt}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setActiveServiceModal(null)}
                  aria-label="Close service details"
                  className="absolute top-4 right-4 p-2 bg-[var(--brand-ink)]/80 text-[var(--brand-canvas)] rounded-full hover:bg-[var(--brand-primary)] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 sm:p-8">
                <p className="text-xs font-mono-tabular text-[var(--brand-primary)]">
                  Service {activeServiceModal.number} · {activeServiceModal.category}
                </p>
                <h3
                  id="service-modal-title"
                  className="font-serif-display text-3xl font-medium text-[var(--brand-ink)] mt-1"
                >
                  {activeServiceModal.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--brand-ink)]/80 leading-relaxed">
                  {activeServiceModal.description}
                </p>

                <div className="mt-6 pt-5 border-t border-[var(--brand-ink)]/10">
                  <h4 className="text-xs font-semibold tracking-wider text-[var(--brand-primary)] mb-3">
                    Standard Scope Considerations
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-[var(--brand-ink)]/85">
                    {activeServiceModal.scopeHighlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 p-4 bg-[var(--brand-surface)] rounded text-xs text-[var(--brand-ink)]/80">
                  <strong>Architectural Surface Protocol:</strong>{' '}
                  {activeServiceModal.surfaceCareNotes}
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveServiceModal(null)}
                    className="px-4 py-2.5 border border-[var(--brand-ink)]/25 text-xs font-medium rounded hover:border-[var(--brand-ink)] cursor-pointer"
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
                    className="px-6 py-2.5 bg-[var(--brand-primary)] text-[var(--brand-canvas)] text-xs font-semibold tracking-wider rounded hover:bg-[var(--brand-primary-hover)] cursor-pointer"
                  >
                    Request a Quote for This Service
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRIVACY POLICY & TERMS OF SERVICE MODAL */}
        {legalModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
            className="fixed inset-0 z-50 bg-[var(--brand-ink)]/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          >
            <div className="bg-[var(--brand-canvas)] text-[var(--brand-ink)] border border-[var(--brand-ink)]/20 rounded-lg max-w-xl w-full p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--brand-ink)]/10">
                <h3 id="legal-modal-title" className="font-serif-display text-2xl font-medium">
                  {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h3>
                <button
                  type="button"
                  onClick={() => setLegalModal(null)}
                  aria-label="Close modal"
                  className="p-1.5 text-[var(--brand-ink)]/70 hover:text-[var(--brand-ink)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs sm:text-sm text-[var(--brand-ink)]/80 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
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
                        className="underline text-[var(--brand-primary)]"
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
                        className="underline text-[var(--brand-primary)]"
                      >
                        Google Maps/Google Earth Additional Terms of Service
                      </a>
                      .
                    </p>
                  </>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--brand-ink)]/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => setLegalModal(null)}
                  className="px-5 py-2.5 bg-[var(--brand-primary)] text-[var(--brand-canvas)] text-xs font-semibold rounded cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIVE CONCIGE CHAT INTEGRATION */}
        <LiveConciergeChat
          onOpenBookPage={() => openBookNowPage()}
          onNavigateSection={navigateToHomeSection}
        />
      </div>
    </APIProvider>
  );
}
