import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  activePage: 'home' | 'book';
  onNavigateHomeSection: (sectionId: string) => void;
  onOpenBookPage: (preselectedService?: string, preselectedTier?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigateHomeSection,
  onOpenBookPage,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 36);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const solidHeader = isScrolled || activePage === 'book' || mobileMenuOpen;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (sectionId === 'book-now') {
      onOpenBookPage();
    } else {
      onNavigateHomeSection(sectionId);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-200 ${
        solidHeader
          ? 'bg-[var(--brand-canvas)]/95 backdrop-blur-md border-b border-[var(--brand-ink)]/10 text-[var(--brand-ink)]'
          : 'bg-transparent border-b border-[var(--brand-canvas)]/15 text-[var(--brand-canvas)]'
      }`}
    >
      <div className="max-w-[1360px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => handleNavClick(e, 'top')}
          className="font-serif-display text-xl md:text-2xl font-semibold tracking-[0.14em] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-accent)]"
        >
          AUREL CLEANING CO.
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-8 text-sm font-medium"
        >
          <a
            href="#top"
            onClick={(e) => handleNavClick(e, 'top')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
              activePage === 'home'
                ? 'border-[var(--brand-accent)]'
                : 'border-transparent hover:border-[var(--brand-accent)]/60'
            }`}
          >
            Home
          </a>
          <a
            href="#services"
            onClick={(e) => handleNavClick(e, 'services')}
            className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[var(--brand-accent)] transition-colors duration-150"
          >
            Services
          </a>
          <a
            href="#approach"
            onClick={(e) => handleNavClick(e, 'approach')}
            className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[var(--brand-accent)] transition-colors duration-150"
          >
            Our Approach
          </a>
          <a
            href="#california-map"
            onClick={(e) => handleNavClick(e, 'california-map')}
            className="whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[var(--brand-accent)] transition-colors duration-150"
          >
            California Map
          </a>
          <a
            href="#book-now"
            onClick={(e) => handleNavClick(e, 'book-now')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
              activePage === 'book'
                ? 'border-[var(--brand-accent)] font-semibold'
                : 'border-transparent hover:border-[var(--brand-accent)]'
            }`}
          >
            Book Now
          </a>
        </nav>

        {/* Zone 3: 1 Primary CTA + Mobile Menu Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenBookPage();
            }}
            className={`hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold tracking-[0.12em] rounded transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
              solidHeader
                ? 'bg-[var(--brand-primary)] text-[var(--brand-canvas)] hover:bg-[var(--brand-primary-hover)]'
                : 'bg-[var(--brand-canvas)] text-[var(--brand-primary)] hover:bg-[var(--brand-surface)]'
            }`}
          >
            Request a Quote
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden p-2.5 rounded focus-visible:outline-2 focus-visible:outline-[var(--brand-accent)] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[var(--brand-canvas)] border-b border-[var(--brand-ink)]/15 text-[var(--brand-ink)] px-6 py-6 shadow-lg">
          <nav className="flex flex-col space-y-4 text-base font-medium" aria-label="Mobile Navigation">
            <a
              href="#top"
              onClick={(e) => handleNavClick(e, 'top')}
              className="py-2 border-b border-[var(--brand-ink)]/10 flex items-center justify-between"
            >
              <span>Home</span>
            </a>
            <a
              href="#services"
              onClick={(e) => handleNavClick(e, 'services')}
              className="py-2 border-b border-[var(--brand-ink)]/10 flex items-center justify-between"
            >
              <span>Services</span>
            </a>
            <a
              href="#approach"
              onClick={(e) => handleNavClick(e, 'approach')}
              className="py-2 border-b border-[var(--brand-ink)]/10 flex items-center justify-between"
            >
              <span>Our Approach</span>
            </a>
            <a
              href="#about"
              onClick={(e) => handleNavClick(e, 'about')}
              className="py-2 border-b border-[var(--brand-ink)]/10 flex items-center justify-between"
            >
              <span>About Us</span>
            </a>
            <a
              href="#california-map"
              onClick={(e) => handleNavClick(e, 'california-map')}
              className="py-2 border-b border-[var(--brand-ink)]/10 flex items-center justify-between"
            >
              <span>California Service Map</span>
            </a>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, 'contact')}
              className="py-2 border-b border-[var(--brand-ink)]/10 flex items-center justify-between"
            >
              <span>Contact</span>
            </a>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBookPage();
                }}
                className="w-full py-3 px-5 bg-[var(--brand-primary)] text-[var(--brand-canvas)] text-sm font-semibold tracking-wider rounded text-center cursor-pointer"
              >
                Book Now / Request a Quote
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
