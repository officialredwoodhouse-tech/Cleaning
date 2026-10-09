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

  return (
    <section
      id="before-after"
      aria-labelledby="before-after-heading"
      className="py-24 md:py-32 bg-[#E9E6DF] border-y border-[#202421]/10"
    >
      <div className="max-w-[1360px] mx-auto px-6 md:px-10">
        {/* Header & Scene Selector */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.16em] text-[#153D32] mb-3">
              Visual Standard · Demonstration Imagery
            </p>
            <h2
              id="before-after-heading"
              className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-normal text-[#202421] leading-[1.12]"
            >
              The Difference Is in the Details.
            </h2>
            <p className="mt-4 text-base text-[#202421]/80 leading-relaxed">
              Drag the horizontal comparison divider to inspect how surface-appropriate detailing
              restores optical clarity to architectural glass, natural stone veining, and fine
              millwork.
            </p>
          </div>

          {/* Interactive Scene Switcher (Functional Segmented Buttons) */}
          <div
            role="tablist"
            aria-label="Select architectural space to compare"
            className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F7F5F0] border border-[#202421]/10 rounded-lg self-start"
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
                  className={`px-3.5 py-2 text-xs font-medium rounded transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#153D32] text-[#F7F5F0]'
                      : 'text-[#202421]/75 hover:text-[#202421] hover:bg-[#E9E6DF]/60'
                  }`}
                >
                  {scene.title.split('&')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Comparison Viewport */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 flex flex-col">
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onClick={(e) => updateSliderFromClientX(e.clientX)}
              className="relative w-full aspect-[16/10] rounded-lg overflow-hidden select-none border border-[#202421]/15 bg-[#202421] cursor-ew-resize touch-none"
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
                <div className="absolute inset-0 bg-[#E9E6DF]/20 mix-blend-screen" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#202421]/30 via-transparent to-[#E9E6DF]/25" />
              </div>

              {/* Top-left & Top-right Labels (Clean unboxed editorial overlays) */}
              <div className="absolute top-4 left-4 z-10 bg-[#202421]/80 backdrop-blur-sm text-[#F7F5F0] px-3 py-1.5 rounded text-xs font-medium tracking-wider pointer-events-none">
                Before · Pre-Service Surface Film
              </div>
              <div className="absolute top-4 right-4 z-10 bg-[#153D32]/90 backdrop-blur-sm text-[#F7F5F0] px-3 py-1.5 rounded text-xs font-medium tracking-wider pointer-events-none">
                After · Aurel Standard Detailing
              </div>

              {/* Draggable Vertical Handle Line */}
              <div
                className="absolute top-0 bottom-0 z-20 w-0.5 bg-[#F7F5F0] shadow-[0_0_12px_rgba(0,0,0,0.5)] pointer-events-none"
                style={{ left: `${sliderPercent}%` }}
              >
                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#153D32] border-2 border-[#C6A66B] text-[#F7F5F0] flex items-center justify-center shadow-md">
                  <MoveHorizontal className="w-5 h-5 text-[#C6A66B]" />
                </div>
              </div>
            </div>

            {/* Accessible Keyboard Slider & Quick Presets Bar */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F7F5F0] px-5 py-3.5 rounded-lg border border-[#202421]/10">
              <div className="flex items-center gap-3 flex-1">
                <label
                  htmlFor="before-after-range"
                  className="text-xs font-medium text-[#202421] whitespace-nowrap shrink-0"
                >
                  Comparison Position: <span className="font-mono-tabular">{sliderPercent}%</span>
                </label>
                <input
                  id="before-after-range"
                  type="range"
                  min={5}
                  max={95}
                  value={sliderPercent}
                  onChange={(e) => setSliderPercent(Number(e.target.value))}
                  aria-label="Adjust before and after image comparison divider"
                  className="w-full max-w-xs accent-[#153D32] cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#202421]/60 mr-1">View:</span>
                {[
                  { label: 'Mostly After (20%)', value: 20 },
                  { label: 'Split (50%)', value: 50 },
                  { label: 'Mostly Before (80%)', value: 80 },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setSliderPercent(preset.value)}
                    className={`px-2.5 py-1 rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      Math.abs(sliderPercent - preset.value) < 6
                        ? 'bg-[#153D32] text-[#F7F5F0] border-[#153D32]'
                        : 'bg-transparent text-[#202421]/80 border-[#202421]/20 hover:border-[#153D32]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Surface Notes & Transparency Disclosure */}
          <div className="lg:col-span-4 bg-[#F7F5F0] border border-[#202421]/10 rounded-lg p-7 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono-tabular text-[#153D32] mb-2">
                Scene 0{selectedSceneIndex + 1} / 0{COMPARISON_SCENES.length}
              </p>
              <h3 className="font-serif-display text-2xl font-medium text-[#202421]">
                {activeScene.title}
              </h3>
              <p className="text-xs text-[#202421]/65 mt-1 pb-5 border-b border-[#202421]/10">
                {activeScene.subtitle}
              </p>

              <div className="mt-5 space-y-5">
                <div>
                  <h4 className="text-xs font-semibold tracking-wider text-[#202421]/70 mb-2.5">
                    Pre-Service Conditions Addressed
                  </h4>
                  <ul className="space-y-2 text-sm text-[#202421]/80">
                    {activeScene.beforeNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-[#C6A66B] font-mono-tabular text-xs mt-1">—</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-[#202421]/10">
                  <h4 className="text-xs font-semibold tracking-wider text-[#153D32] mb-2.5">
                    Post-Detailing Standard
                  </h4>
                  <ul className="space-y-2 text-sm text-[#202421]">
                    {activeScene.afterNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#153D32] shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#202421]/10 text-xs text-[#202421]/65 leading-relaxed">
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
