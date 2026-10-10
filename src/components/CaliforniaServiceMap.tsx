import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AdvancedMarker,
  InfoWindow,
  Map,
  Pin,
  useAdvancedMarkerRef,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { ArrowRight, Compass, MapPin, Search } from 'lucide-react';
import { CALIFORNIA_REGIONS, CaliforniaRegionQuery } from '../data/siteContent';

interface VerifiedMapPlace {
  displayName: string;
  formattedAddress: string;
  location: google.maps.LatLngLiteral;
  regionNote?: string;
}

interface CaliforniaServiceMapProps {
  onSelectLocationForBooking: (formattedAddress: string, regionLabel?: string) => void;
  compact?: boolean;
}

function checkAndDispatchQuotaError(err: unknown) {
  const msg = String(err || '');
  if (
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('QuotaExceededError') ||
    msg.includes('OverQuotaMapError') ||
    msg.includes('429')
  ) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
}

export const CaliforniaServiceMap: React.FC<CaliforniaServiceMapProps> = ({
  onSelectLocationForBooking,
  compact = false,
}) => {
  const map = useMap();
  const placesLib = useMapsLibrary('places');

  const [selectedRegion, setSelectedRegion] = useState<CaliforniaRegionQuery>(
    CALIFORNIA_REGIONS[0]
  );
  const [verifiedPlace, setVerifiedPlace] = useState<VerifiedMapPlace | null>(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState<boolean>(true);
  const [isSearchingRegion, setIsSearchingRegion] = useState<boolean>(false);

  // Address Autocomplete state (Places API New)
  const [searchInput, setSearchInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const [markerRef, marker] = useAdvancedMarkerRef();

  // Resolve a California region using live Places API (New) searchByText
  const resolveCaliforniaRegion = useCallback(
    async (regionItem: CaliforniaRegionQuery) => {
      if (!placesLib) return;
      setIsSearchingRegion(true);
      try {
        const { Place } = placesLib;
        const result = await Place.searchByText({
          textQuery: regionItem.searchQuery,
          fields: ['displayName', 'formattedAddress', 'location', 'viewport'],
          region: 'us',
        });

        const topPlace = result?.places?.[0];
        if (topPlace && topPlace.location) {
          const lat = topPlace.location.lat();
          const lng = topPlace.location.lng();
          setVerifiedPlace({
            displayName: topPlace.displayName || regionItem.label,
            formattedAddress: topPlace.formattedAddress || regionItem.searchQuery,
            location: { lat, lng },
            regionNote: regionItem.serviceNote,
          });
          setInfoWindowOpen(true);

          if (map) {
            if (topPlace.viewport) {
              map.fitBounds(topPlace.viewport);
            } else {
              map.panTo({ lat, lng });
              map.setZoom(12);
            }
          }
        }
      } catch (err) {
        console.error('Error resolving California region via Places API (New):', err);
        checkAndDispatchQuotaError(err);
      } finally {
        setIsSearchingRegion(false);
      }
    },
    [placesLib, map]
  );

  // Trigger initial California region lookup once Places library is ready
  useEffect(() => {
    if (placesLib) {
      void resolveCaliforniaRegion(selectedRegion);
    }
  }, [placesLib, selectedRegion, resolveCaliforniaRegion]);

  // Fetch live AutocompleteSuggestions when user types a California address
  useEffect(() => {
    if (!placesLib) return;
    const trimmed = searchInput.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      return;
    }

    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    let cancelled = false;
    setIsLoadingSuggestions(true);

    const timer = setTimeout(() => {
      AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: `${trimmed}, California`,
        sessionToken: sessionTokenRef.current || undefined,
        region: 'us',
      })
        .then((res: { suggestions: google.maps.places.AutocompleteSuggestion[] }) => {
          if (!cancelled) {
            setSuggestions(res?.suggestions || []);
            setIsLoadingSuggestions(false);
          }
        })
        .catch((err: unknown) => {
          console.error('Error fetching California address suggestions:', err);
          checkAndDispatchQuotaError(err);
          if (!cancelled) {
            setIsLoadingSuggestions(false);
          }
        });
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [placesLib, searchInput]);

  const handleSelectSuggestion = async (
    suggestion: google.maps.places.AutocompleteSuggestion
  ) => {
    if (!placesLib || !suggestion.placePrediction) return;
    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'viewport'],
      });

      // Reset session token after fetchFields per Google Maps Platform billing best practices
      sessionTokenRef.current = null;
      setSuggestions([]);
      setSearchInput('');

      if (place.location) {
        const lat = place.location.lat();
        const lng = place.location.lng();
        setVerifiedPlace({
          displayName: place.displayName || 'Verified California Property',
          formattedAddress: place.formattedAddress || '',
          location: { lat, lng },
          regionNote:
            'Custom California location verified via Google Maps Platform. Eligible for tailored residential or commercial property care.',
        });
        setInfoWindowOpen(true);

        if (map) {
          if (place.viewport) {
            map.fitBounds(place.viewport);
          } else {
            map.panTo({ lat, lng });
            map.setZoom(14);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching selected California place fields:', err);
      checkAndDispatchQuotaError(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      {/* Left Column: California Regions & Live Address Verifier */}
      <div className="lg:col-span-5 bg-[var(--brand-canvas)] border border-[var(--brand-ink)]/10 rounded-lg p-6 md:p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-[var(--brand-ink)]/10">
            <span className="text-xs font-medium tracking-[0.14em] text-[var(--brand-primary)]">
              California Service Corridors
            </span>
            <span className="text-xs font-mono-tabular text-[var(--brand-ink)]/60">
              {CALIFORNIA_REGIONS.length} Active Regions
            </span>
          </div>

          {/* Search any California Address or Postcode */}
          <div className="mt-5 relative">
            <label
              htmlFor="ca-address-search"
              className="block text-xs font-semibold tracking-wider text-[var(--brand-ink)]/80 mb-2"
            >
              Verify Your California Address or Community
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--brand-ink)]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="ca-address-search"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search e.g. Bel Air, Atherton, 90210, Carmel..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[var(--brand-ink)]/20 rounded text-sm text-[var(--brand-ink)] placeholder:text-[var(--brand-ink)]/45 focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            {isLoadingSuggestions && (
              <p className="text-xs text-[var(--brand-ink)]/60 mt-1.5">
                Searching California locations via Google Maps...
              </p>
            )}

            {suggestions.length > 0 && (
              <ul
                role="listbox"
                aria-label="California address suggestions"
                className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-[var(--brand-ink)]/15 rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-[var(--brand-ink)]/10"
              >
                {suggestions.map((suggestion, index) => {
                  const text = suggestion.placePrediction?.text?.text || 'California Location';
                  return (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => void handleSelectSuggestion(suggestion)}
                        className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-[var(--brand-ink)] hover:bg-[var(--brand-canvas)] flex items-center gap-2.5 cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                        <span className="truncate">{text}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Curated California Regions Selector */}
          <div className="mt-6">
            <p className="text-xs font-semibold tracking-wider text-[var(--brand-ink)]/70 mb-3">
              Select a California Service Corridor
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-[260px] sm:max-h-[300px] overflow-y-auto pr-1">
              {CALIFORNIA_REGIONS.map((region) => {
                const isSelected = selectedRegion.id === region.id;
                return (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setSelectedRegion(region)}
                    className={`w-full min-h-[52px] text-left p-3 rounded border transition-all duration-150 cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[var(--brand-primary)] text-[var(--brand-canvas)] border-[var(--brand-primary)]'
                        : 'bg-white/70 text-[var(--brand-ink)] border-[var(--brand-ink)]/10 hover:border-[var(--brand-primary)]/50'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{region.label}</p>
                      <p
                        className={`text-xs mt-0.5 line-clamp-1 ${
                          isSelected ? 'text-[var(--brand-surface)]/80' : 'text-[var(--brand-ink)]/60'
                        }`}
                      >
                        {region.regionGroup} · {region.serviceNote}
                      </p>
                    </div>
                    <Compass
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isSelected ? 'text-[var(--brand-accent)]' : 'text-[var(--brand-primary)]/60'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Verified Location Summary & Book CTA */}
        {verifiedPlace && (
          <div className="mt-6 pt-5 border-t border-[var(--brand-ink)]/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[var(--brand-primary)]">
                  Active Google Maps Selection
                </p>
                <p className="font-serif-display text-xl font-semibold text-[var(--brand-ink)] mt-0.5">
                  {verifiedPlace.displayName}
                </p>
                <p className="text-xs text-[var(--brand-ink)]/70 mt-0.5">
                  {verifiedPlace.formattedAddress}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onSelectLocationForBooking(
                  verifiedPlace.formattedAddress,
                  verifiedPlace.displayName
                )
              }
              className="mt-4 w-full min-h-[48px] py-3 px-4 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-canvas)] text-xs font-semibold tracking-[0.12em] rounded flex items-center justify-center gap-2 transition-colors cursor-pointer truncate"
            >
              <span className="truncate">Book Cleaning in {verifiedPlace.displayName}</span>
              <ArrowRight className="w-4 h-4 text-[var(--brand-accent)] shrink-0" />
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Interactive Google Map with AdvancedMarker & InfoWindow */}
      <div
        className={`lg:col-span-7 relative rounded-lg overflow-hidden border border-[var(--brand-ink)]/15 bg-[var(--brand-surface)] ${
          compact
            ? 'h-[310px] sm:h-[420px]'
            : 'h-[340px] sm:h-[480px] lg:h-auto lg:min-h-[540px]'
        }`}
      >
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={{ lat: 36.7783, lng: -119.4179 }}
          defaultZoom={6}
          gestureHandling="cooperative"
          disableDefaultUI={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full"
        >
          {verifiedPlace && (
            <>
              <AdvancedMarker
                ref={markerRef}
                position={verifiedPlace.location}
                title={verifiedPlace.displayName}
                onClick={() => setInfoWindowOpen(true)}
              >
                <Pin
                  background="#141D2B"
                  borderColor="#B88655"
                  glyphColor="#B88655"
                  scale={1.3}
                />
              </AdvancedMarker>

              {infoWindowOpen && marker && (
                <InfoWindow
                  anchor={marker}
                  maxWidth={280}
                  onCloseClick={() => setInfoWindowOpen(false)}
                >
                  <div className="p-1 text-[var(--brand-ink)]">
                    <p className="text-[11px] font-semibold tracking-wider text-[var(--brand-primary)]">
                      Aurel California Service Area
                    </p>
                    <h4 className="font-serif-display text-lg font-semibold text-[var(--brand-ink)] mt-0.5">
                      {verifiedPlace.displayName}
                    </h4>
                    <p className="text-xs text-[var(--brand-ink)]/75 mt-1">
                      {verifiedPlace.formattedAddress}
                    </p>
                    {verifiedPlace.regionNote && (
                      <p className="text-xs text-[var(--brand-ink)]/70 mt-1.5 leading-relaxed">
                        {verifiedPlace.regionNote}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        onSelectLocationForBooking(
                          verifiedPlace.formattedAddress,
                          verifiedPlace.displayName
                        )
                      }
                      className="mt-3 w-full py-2 px-3 bg-[var(--brand-primary)] text-[var(--brand-canvas)] text-xs font-medium rounded hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
                    >
                      Book Now for This Area
                    </button>
                  </div>
                </InfoWindow>
              )}
            </>
          )}
        </Map>

        {isSearchingRegion && (
          <div className="absolute top-4 left-4 bg-[var(--brand-canvas)]/95 backdrop-blur-sm border border-[var(--brand-ink)]/10 px-3.5 py-2 rounded text-xs font-medium text-[var(--brand-primary)] shadow-sm">
            Locating California service corridor...
          </div>
        )}
      </div>
    </div>
  );
};
