import React, { useCallback, useRef, useState } from 'react';
import { MoveHorizontal, Check } from 'lucide-react';
import { COMPARISON_SCENES } from '../data/siteContent';
import { ResilientImage } from './ResilientImage';

export const BeforeAfterSlider: React.FC = () => {
  const [selectedSceneIndex, setSelectedSceneIndex] = useState(0);
  const [sliderPercent, setSliderPercent] = useState(52);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeScene = COMPARISON_SCENES[selectedSceneIndex];

  const updateSliderFromClientX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = Math.round((x / rect.width) * 100);
    setSliderPercent(Math.max(5, Math.min(95, percentage)));
  }, []);

  const handlePointerDown = () => {
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches && e.touches.length > 0) {
      updateSliderFromClientX(e.touches[0].clientX);
    }
  };

  return (
    <section
      id="before-after"
      aria-labelledby="before-after-heading"
      className="py-16 sm:py-24 md:py-32 bg-[var(--brand-surface)] border-y border-[var(--brand-ink)]/10"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-10">
        {/* Header & Scene Selector */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.16em] text-[var(--brand-primary)] mb-3">
              Visual Standard · Demonstration Imagery
            </p>
            <h2
              id="before-after-heading"
              className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-normal text-[var(--brand-ink)] leading-[1.12]"
            >
              The Difference Is in the Details.
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[var(--brand-ink)]/80 leading-relaxed">
              Drag the horizontal comparison divider to inspect how surface-appropriate detailing
              restores optical clarity to architectural glass, natural stone veining, and fine
              millwork.
            </p>
          </div>

          {/* Interactive Scene Switcher (Horizontally swipeable on mobile, 44px touch targets) */}
          <div
            role="tablist"
            aria-label="Select architectural space to compare"
            className="flex flex-nowrap sm:flex-wrap items-center gap-1.5 p-1.5 bg-[var(--brand-canvas)] border border-[var(--brand-ink)]/10 rounded-lg self-start w-full sm:w-auto overflow-x-auto no-scrollbar"
          >
            {COMPARISON_SCENES.map((scene, idx) => {
              const isSelected = idx === selectedSceneIndex;
              return (
                <button
                  key={scene.id}
                  role="tab"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => setSelectedSceneIndex(idx)}
                  className={`px-3.5 min-h-[42px] text-xs font-medium rounded transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--brand-primary)] text-[var(--brand-canvas)]'
                      : 'text-[var(--brand-ink)]/75 hover:text-[var(--brand-ink)] hover:bg-[var(--brand-surface)]/60'
                  }`}
                >
                  {scene.title.split('&')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Comparison Viewport */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          <div className="lg:col-span-8 flex flex-col">
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onTouchMove={handleTouchMove}
              onClick={(e) => updateSliderFromClientX(e.clientX)}
              className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-lg overflow-hidden select-none border border-[var(--brand-ink)]/15 bg-[var(--brand-ink)] cursor-ew-resize touch-pan-y"
            >
              {/* Base Layer: AFTER (Immaculate Detailed State) */}
              <ResilientImage
                src={activeScene.image}
                alt={`After detailing: ${activeScene.imageAlt}`}
                fallbackTitle={activeScene.title}
                className="w-full h-full object-cover pointer-events-none"
              />

              {/* Clipped Overlay Layer: BEFORE (Simulated Pre-Service Surface Haze & Dullness) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPercent}% 0 0)` }}
              >
                <ResilientImage
                  src={activeScene.image}
                  alt={`Before detailing simulation: ${activeScene.imageAlt}`}
                  fallbackTitle={activeScene.title}
                  className="w-full h-full object-cover filter brightness-[0.82] contrast-[0.84] saturate-[0.68] blur-[0.8px] sepia-[0.14]"
                />
                {/* Subtle mineral/dust film simulation layer */}
                <div className="absolute inset-0 bg-[var(--brand-surface)]/20 mix-blend-screen" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--brand-ink)]/30 via-transparent to-[var(--brand-surface)]/25" />
              </div>

              {/* Top-left & Top-right Labels (Compact on mobile so they never collide) */}
              <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-10 bg-[var(--brand-ink)]/85 backdrop-blur-sm text-[var(--brand-canvas)] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded text-[10px] sm:text-xs font-medium tracking-wider pointer-events-none">
                <span className="sm:hidden">Before</span>
                <span className="hidden sm:inline">Before · Pre-Service Surface Film</span>
              </div>
              <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-10 bg-[var(--brand-primary)]/90 backdrop-blur-sm text-[var(--brand-canvas)] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded text-[10px] sm:text-xs font-medium tracking-wider pointer-events-none">
                <span className="sm:hidden">After · Aurel</span>
                <span className="hidden sm:inline">After · Aurel Standard Detailing</span>
              </div>

              {/* Draggable Vertical Handle Line */}
              <div
                className="absolute top-0 bottom-0 z-20 w-0.5 bg-[var(--brand-canvas)] shadow-[0_0_12px_rgba(0,0,0,0.5)] pointer-events-none"
                style={{ left: `${sliderPercent}%` }}
              >
                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[var(--brand-primary)] border-2 border-[var(--brand-accent)] text-[var(--brand-canvas)] flex items-center justify-center shadow-md">
                  <MoveHorizontal className="w-5 h-5 text-[var(--brand-accent)]" />
                </div>
              </div>
            </div>

            {/* Accessible Keyboard Slider & Quick Presets Bar */}
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-[var(--brand-canvas)] px-4 sm:px-5 py-3.5 rounded-lg border border-[var(--brand-ink)]/10">
              <div className="flex items-center gap-3 flex-1">
                <label
                  htmlFor="before-after-range"
                  className="text-xs font-medium text-[var(--brand-ink)] whitespace-nowrap shrink-0"
                >
                  Comparison: <span className="font-mono-tabular">{sliderPercent}%</span>
                </label>
                <input
                  id="before-after-range"
                  type="range"
                  min={5}
                  max={95}
                  value={sliderPercent}
                  onChange={(e) => setSliderPercent(Number(e.target.value))}
                  aria-label="Adjust before and after image comparison divider"
                  className="w-full sm:max-w-xs h-6 accent-[var(--brand-primary)] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2 text-xs w-full sm:w-auto">
                {[
                  { label: 'After (20%)', value: 20 },
                  { label: 'Split (50%)', value: 50 },
                  { label: 'Before (80%)', value: 80 },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setSliderPercent(preset.value)}
                    className={`min-h-[40px] px-2.5 py-1.5 rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 text-center ${
                      Math.abs(sliderPercent - preset.value) < 6
                        ? 'bg-[var(--brand-primary)] text-[var(--brand-canvas)] border-[var(--brand-primary)] font-semibold'
                        : 'bg-transparent text-[var(--brand-ink)]/80 border-[var(--brand-ink)]/20 hover:border-[var(--brand-primary)]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Surface Notes & Transparency Disclosure */}
          <div className="lg:col-span-4 bg-[var(--brand-canvas)] border border-[var(--brand-ink)]/10 rounded-lg p-7 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono-tabular text-[var(--brand-primary)] mb-2">
                Scene 0{selectedSceneIndex + 1} / 0{COMPARISON_SCENES.length}
              </p>
              <h3 className="font-serif-display text-2xl font-medium text-[var(--brand-ink)]">
                {activeScene.title}
              </h3>
              <p className="text-xs text-[var(--brand-ink)]/65 mt-1 pb-5 border-b border-[var(--brand-ink)]/10">
                {activeScene.subtitle}
              </p>

              <div className="mt-5 space-y-5">
                <div>
                  <h4 className="text-xs font-semibold tracking-wider text-[var(--brand-ink)]/70 mb-2.5">
                    Pre-Service Conditions Addressed
                  </h4>
                  <ul className="space-y-2 text-sm text-[var(--brand-ink)]/80">
                    {activeScene.beforeNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-[var(--brand-accent)] font-mono-tabular text-xs mt-1">
                          —
                        </span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-[var(--brand-ink)]/10">
                  <h4 className="text-xs font-semibold tracking-wider text-[var(--brand-primary)] mb-2.5">
                    Post-Detailing Standard
                  </h4>
                  <ul className="space-y-2 text-sm text-[var(--brand-ink)]">
                    {activeScene.afterNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--brand-ink)]/10 text-xs text-[var(--brand-ink)]/65 leading-relaxed">
              <strong>Disclosure:</strong> This interactive comparison uses demonstration imagery to
              illustrate surface clarity and light reflection goals. Replace asset paths in{' '}
              <code className="font-mono-tabular text-[11px]">src/data/siteContent.ts</code> with
              verified client property photography as authorized.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
