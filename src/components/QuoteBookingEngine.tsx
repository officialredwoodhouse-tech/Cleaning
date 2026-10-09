import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Download,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { SERVICE_PLAN_TIERS } from '../data/siteContent';

export interface QuoteFormData {
  serviceType: string;
  planTier: string;
  propertyType: string;
  propertySize: string;
  bedrooms: string;
  bathrooms: string;
  frequency: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  californiaRegion: string;
  additionalRequirements: string;
  fullName: string;
  email: string;
  phone: string;
  additionalMessage: string;
  websiteUrlHoneypot: string;
}

export interface SubmittedQuoteRecord {
  id: string;
  referenceCode: string;
  createdAt: string;
  status: 'received_by_server' | 'forwarded_to_crm';
  crmConfigured: boolean;
  serviceType: string;
  planTier: string;
  propertyType: string;
  propertySize: string;
  bedrooms: string;
  bathrooms: string;
  frequency: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  californiaRegion?: string;
  additionalRequirements: string;
  fullName: string;
  email: string;
  phone: string;
  additionalMessage: string;
}

interface QuoteBookingEngineProps {
  initialService?: string;
  initialPlanTier?: string;
  initialLocation?: string;
  onSubmissionSuccess?: (record: SubmittedQuoteRecord) => void;
}

const STORAGE_KEY = 'aurel_cleaning_quote_draft_v1';

const SERVICE_OPTIONS = [
  {
    value: 'Residential Cleaning',
    label: 'Residential Cleaning',
    subtitle: 'Private residences, luxury apartments, and penthouses',
  },
  {
    value: 'Deep Cleaning',
    label: 'Deep Cleaning',
    subtitle: 'Comprehensive refresh for overlooked details and hard-to-reach areas',
  },
  {
    value: 'Move-In / Move-Out Cleaning',
    label: 'Move-In / Move-Out Cleaning',
    subtitle: 'Detailed preparation for property handovers and moving transitions',
  },
  {
    value: 'Commercial Cleaning',
    label: 'Commercial Cleaning',
    subtitle: 'Executive offices, design studios, galleries, and boutique retail',
  },
  {
    value: 'Post-Construction Cleaning',
    label: 'Post-Construction Cleaning',
    subtitle: 'Careful removal of renovation dust and residue',
  },
  {
    value: 'Recurring Cleaning',
    label: 'Recurring Cleaning',
    subtitle: 'Ongoing weekly, bi-weekly, or custom property maintenance',
  },
  {
    value: 'Other',
    label: 'Other / Bespoke Request',
    subtitle: 'Multi-property estates, private events, or specialized surface care',
  },
];

const PROPERTY_TYPES = [
  'Private Residence / Estate',
  'Luxury Apartment / Penthouse',
  'Townhouse / Villa',
  'Executive Office / Studio',
  'Retail Gallery / Showroom',
  'Boutique Hospitality Property',
];

const PROPERTY_SIZES = [
  'Under 2,000 sq. ft.',
  '2,000 – 3,500 sq. ft.',
  '3,500 – 6,000 sq. ft.',
  '6,000 – 10,000 sq. ft.',
  '10,000+ sq. ft. / Estate',
];

const FREQUENCIES = [
  'One-Time / Single Appointment',
  'Weekly Maintenance',
  'Bi-Weekly (Every 2 Weeks)',
  'Monthly Refresh',
  'Custom / Multi-Day Stewardship',
];

const TIME_WINDOWS = [
  'Morning (8:30 AM – 12:00 PM)',
  'Afternoon (12:30 PM – 4:30 PM)',
  'Evening / After-Hours (Commercial)',
  'Flexible / Coordinate with Concierge',
];

const SURFACE_REQUIREMENT_CHIPS = [
  'Honed Marble / Natural Stone',
  'Unlacquered Brass / Fine Metals',
  'Wide-Plank Hardwood Floors',
  'Floor-to-Ceiling Architectural Glass',
  'Fragrance-Free / Hypoallergenic Supplies',
  'Use Client-Provided Products On-Site',
];

function getDefaultDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
}

const DEFAULT_FORM_DATA: QuoteFormData = {
  serviceType: 'Residential Cleaning',
  planTier: 'Signature Clean',
  propertyType: 'Private Residence / Estate',
  propertySize: '3,500 – 6,000 sq. ft.',
  bedrooms: '4 Bedrooms',
  bathrooms: '4.5 Bathrooms',
  frequency: 'Bi-Weekly (Every 2 Weeks)',
  preferredDate: getDefaultDateString(),
  preferredTime: 'Morning (8:30 AM – 12:00 PM)',
  location: '',
  californiaRegion: 'California',
  additionalRequirements: '',
  fullName: '',
  email: '',
  phone: '',
  additionalMessage: '',
  websiteUrlHoneypot: '',
};

export const QuoteBookingEngine: React.FC<QuoteBookingEngineProps> = ({
  initialService,
  initialPlanTier,
  initialLocation,
  onSubmissionSuccess,
}) => {
  const placesLib = useMapsLibrary('places');

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<QuoteFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_FORM_DATA, ...parsed };
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_FORM_DATA;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedRecord, setSubmittedRecord] = useState<SubmittedQuoteRecord | null>(null);
  const [serverNote, setServerNote] = useState<string>('');

  // Places Autocomplete state for Step 3 Location input
  const [addressSuggestions, setAddressSuggestions] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  // Sync external pre-selections when provided
  useEffect(() => {
    if (initialService) {
      const normalized =
        initialService === 'Luxury Residential Cleaning'
          ? 'Residential Cleaning'
          : initialService;
      setFormData((prev) => ({ ...prev, serviceType: normalized }));
    }
  }, [initialService]);

  useEffect(() => {
    if (initialPlanTier) {
      setFormData((prev) => ({ ...prev, planTier: initialPlanTier }));
    }
  }, [initialPlanTier]);

  useEffect(() => {
    if (initialLocation) {
      setFormData((prev) => ({ ...prev, location: initialLocation }));
    }
  }, [initialLocation]);

  // Persist draft to localStorage to prevent accidental data loss
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // ignore storage errors
    }
  }, [formData]);

  // Step 3 California Location Autocomplete using Places API (New)
  useEffect(() => {
    if (!placesLib || step !== 3 || !showSuggestions) return;
    const query = formData.location.trim();
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: query.toLowerCase().includes('ca') ? query : `${query}, CA`,
        sessionToken: sessionTokenRef.current || undefined,
        region: 'us',
      })
        .then((res: { suggestions: google.maps.places.AutocompleteSuggestion[] }) => {
          if (!cancelled) {
            setAddressSuggestions(res?.suggestions || []);
          }
        })
        .catch((err: unknown) => {
          const msg = String(err || '');
          if (
            msg.includes('OVER_QUERY_LIMIT') ||
            msg.includes('RESOURCE_EXHAUSTED') ||
            msg.includes('QuotaExceededError') ||
            msg.includes('429')
          ) {
            window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          }
        });
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [placesLib, formData.location, step, showSuggestions]);

  const handleSelectAddressSuggestion = async (
    suggestion: google.maps.places.AutocompleteSuggestion
  ) => {
    if (!placesLib || !suggestion.placePrediction) return;
    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress'],
      });
      const formatted =
        place.formattedAddress || suggestion.placePrediction.text?.text || '';
      setFormData((prev) => ({ ...prev, location: formatted }));
      setErrors((prev) => ({ ...prev, location: '' }));
      setAddressSuggestions([]);
      setShowSuggestions(false);
      sessionTokenRef.current = null;
    } catch (err) {
      const fallbackText = suggestion.placePrediction.text?.text || '';
      if (fallbackText) {
        setFormData((prev) => ({ ...prev, location: fallbackText }));
      }
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const updateField = <K extends keyof QuoteFormData>(key: K, value: QuoteFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const toggleSurfaceRequirement = (chip: string) => {
    const current = formData.additionalRequirements;
    if (current.includes(chip)) {
      const updated = current
        .split(', ')
        .filter((item) => item.trim() !== chip && item.trim() !== '')
        .join(', ');
      updateField('additionalRequirements', updated);
    } else {
      const updated = current.trim() ? `${current.trim()}, ${chip}` : chip;
      updateField('additionalRequirements', updated);
    }
  };

  const validateStep = (targetStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (targetStep === 1) {
      if (!formData.serviceType.trim()) {
        newErrors.serviceType = 'Please select a primary cleaning service.';
      }
    } else if (targetStep === 2) {
      if (!formData.propertyType.trim()) {
        newErrors.propertyType = 'Please select your property type.';
      }
      if (!formData.propertySize.trim()) {
        newErrors.propertySize = 'Please select an approximate property size.';
      }
      if (!formData.frequency.trim()) {
        newErrors.frequency = 'Please choose a preferred cleaning frequency.';
      }
    } else if (targetStep === 3) {
      if (!formData.preferredDate.trim()) {
        newErrors.preferredDate = 'Please select a preferred target date.';
      }
      if (!formData.preferredTime.trim()) {
        newErrors.preferredTime = 'Please select a preferred time window.';
      }
      if (!formData.location.trim() || formData.location.trim().length < 3) {
        newErrors.location = 'Please enter your California city, address, or ZIP code.';
      }
    } else if (targetStep === 4) {
      if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
        newErrors.fullName = 'Please enter your full name.';
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      }
      const phoneClean = formData.phone.replace(/[^\d+]/g, '');
      if (!formData.phone.trim() || phoneClean.length < 7) {
        newErrors.phone = 'Please enter a valid contact phone number.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to submit quote request.');
      }

      setSubmittedRecord(data.submission);
      setServerNote(data.note || '');
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      if (onSubmissionSuccess) {
        onSubmissionSuccess(data.submission);
      }
    } catch (err: any) {
      setSubmitError(
        err?.message || 'An unexpected error occurred while submitting your quote request.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadDossier = () => {
    if (!submittedRecord) return;
    const content = [
      'AUREL CLEANING CO. — CALIFORNIA CLIENT QUOTE DOSSIER',
      'Exceptional Spaces. Impeccable Standards.',
      '------------------------------------------------------------',
      `Reference Code:        ${submittedRecord.referenceCode}`,
      `Submitted Timestamp:   ${new Date(submittedRecord.createdAt).toLocaleString()}`,
      `Submission Status:     ${
        submittedRecord.crmConfigured
          ? 'Verified & Forwarded to Concierge CRM'
          : 'Logged in Local Server Datastore (/api/quotes)'
      }`,
      '',
      '1. SERVICE & PLAN SELECTION',
      `Primary Service:       ${submittedRecord.serviceType}`,
      `Care Plan Category:    ${submittedRecord.planTier}`,
      '',
      '2. PROPERTY SPECIFICATION',
      `Property Type:         ${submittedRecord.propertyType}`,
      `Approximate Size:      ${submittedRecord.propertySize}`,
      `Bedrooms / Bathrooms:  ${submittedRecord.bedrooms} · ${submittedRecord.bathrooms}`,
      `Preferred Frequency:   ${submittedRecord.frequency}`,
      '',
      '3. SCHEDULING & CALIFORNIA LOCATION',
      `Preferred Date:        ${submittedRecord.preferredDate}`,
      `Preferred Time Window: ${submittedRecord.preferredTime}`,
      `California Location:   ${submittedRecord.location}`,
      `Surface & Care Notes:  ${submittedRecord.additionalRequirements || 'Standard Luxury Protocol'}`,
      '',
      '4. CLIENT CONTACT DETAILS',
      `Client Name:           ${submittedRecord.fullName}`,
      `Email Address:         ${submittedRecord.email}`,
      `Phone Number:          ${submittedRecord.phone}`,
      `Additional Message:    ${submittedRecord.additionalMessage || 'None provided'}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${submittedRecord.referenceCode}-Aurel-Quote-Dossier.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (submittedRecord) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-[#F7F5F0] border border-[#153D32]/25 rounded-lg p-8 md:p-12 text-[#202421]"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#202421]/10">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-[#153D32]">
              Quote Request Recorded · California Concierge Desk
            </p>
            <h3 className="font-serif-display text-3xl md:text-4xl font-normal text-[#202421] mt-1">
              Thank You, {submittedRecord.fullName}.
            </h3>
          </div>
          <div className="bg-[#153D32] text-[#F7F5F0] px-4 py-2.5 rounded text-left md:text-right">
            <span className="block text-[10px] tracking-widest text-[#E9E6DF]/75">
              Reference Dossier
            </span>
            <span className="font-mono-tabular text-base font-medium text-[#C6A66B]">
              {submittedRecord.referenceCode}
            </span>
          </div>
        </div>

        <p className="mt-6 text-base text-[#202421]/85 leading-relaxed max-w-2xl">
          Your property specifications and preferred schedule have been recorded on our server. A
          California Client Advisor will review your requirements and prepare a tailored proposal
          for your space.
        </p>

        {/* Summary Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-[#E9E6DF]/60 rounded-lg border border-[#202421]/10">
          <div>
            <p className="text-xs text-[#202421]/60">Selected Service & Tier</p>
            <p className="text-sm font-semibold text-[#202421] mt-1">
              {submittedRecord.serviceType}
            </p>
            <p className="text-xs text-[#153D32] mt-0.5">{submittedRecord.planTier}</p>
          </div>
          <div>
            <p className="text-xs text-[#202421]/60">Property Profile</p>
            <p className="text-sm font-semibold text-[#202421] mt-1">
              {submittedRecord.propertyType}
            </p>
            <p className="text-xs text-[#202421]/75 mt-0.5 font-mono-tabular">
              {submittedRecord.propertySize} · {submittedRecord.frequency}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#202421]/60">Requested Schedule</p>
            <p className="text-sm font-semibold text-[#202421] mt-1 font-mono-tabular">
              {submittedRecord.preferredDate}
            </p>
            <p className="text-xs text-[#202421]/75 mt-0.5">{submittedRecord.preferredTime}</p>
          </div>
          <div>
            <p className="text-xs text-[#202421]/60">California Location</p>
            <p className="text-sm font-semibold text-[#202421] mt-1">
              {submittedRecord.location}
            </p>
            <p className="text-xs text-[#202421]/75 mt-0.5">{submittedRecord.email}</p>
          </div>
        </div>

        {/* Transparent Backend / CRM Integration Status Notice */}
        <div className="mt-6 p-4 bg-white/80 border border-[#202421]/10 rounded text-xs text-[#202421]/75 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-[#153D32] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#202421]">Backend Integration Status: </span>
            {serverNote}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleDownloadDossier}
            className="px-5 py-3 bg-[#153D32] text-[#F7F5F0] text-xs font-semibold tracking-[0.12em] rounded hover:bg-[#102E26] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4 text-[#C6A66B]" />
            <span>Download Quote Dossier (.txt)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSubmittedRecord(null);
              setStep(1);
            }}
            className="px-5 py-3 bg-transparent border border-[#202421]/25 text-[#202421] text-xs font-semibold tracking-[0.12em] rounded hover:border-[#153D32] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Submit Another Property Request
          </button>
        </div>
      </div>
    );
  }

  const isCommercial = formData.serviceType === 'Commercial Cleaning';

  return (
    <div className="bg-[#F7F5F0] border border-[#202421]/15 rounded-lg p-6 sm:p-8 md:p-10">
      {/* Step Progress Header */}
      <div className="pb-6 border-b border-[#202421]/10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <span className="text-xs font-mono-tabular font-medium text-[#153D32]">
            Step 0{step} of 04
          </span>
          <span className="text-xs text-[#202421]/60">
            Draft automatically saved · California Properties
          </span>
        </div>

        {/* 4-Step Interactive Progress Indicators */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4" role="list" aria-label="Quote request steps">
          {[
            { num: 1, title: 'Select Service' },
            { num: 2, title: 'Property Details' },
            { num: 3, title: 'Preferences' },
            { num: 4, title: 'Contact Info' },
          ].map((item) => {
            const isActive = step === item.num;
            const isCompleted = step > item.num;
            return (
              <button
                key={item.num}
                type="button"
                onClick={() => {
                  if (item.num < step || validateStep(step)) {
                    setStep(item.num);
                  }
                }}
                className={`text-left pt-2.5 border-t-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#153D32] text-[#153D32]'
                    : isCompleted
                    ? 'border-[#C6A66B] text-[#202421]'
                    : 'border-[#202421]/15 text-[#202421]/45'
                }`}
              >
                <span className="block text-[11px] font-mono-tabular">0{item.num}</span>
                <span className="block text-xs sm:text-sm font-medium truncate mt-0.5">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8">
        {/* Honeypot Spam Trap (Hidden from screen readers and visual users) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="websiteUrlHoneypot">Website</label>
          <input
            id="websiteUrlHoneypot"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={formData.websiteUrlHoneypot}
            onChange={(e) => updateField('websiteUrlHoneypot', e.target.value)}
          />
        </div>

        {/* STEP 1: SELECT YOUR SERVICE */}
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h3 className="font-serif-display text-2xl sm:text-3xl font-normal text-[#202421]">
                01. Select Your Service
              </h3>
              <p className="text-sm text-[#202421]/70 mt-1">
                Choose the primary cleaning service and care tier best suited to your property.
              </p>

              {errors.serviceType && (
                <p role="alert" className="mt-3 text-xs font-medium text-red-700">
                  {errors.serviceType}
                </p>
              )}

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {SERVICE_OPTIONS.map((option) => {
                  const selected = formData.serviceType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField('serviceType', option.value)}
                      aria-pressed={selected}
                      className={`text-left p-4 rounded-lg border transition-all duration-150 cursor-pointer flex items-start justify-between gap-3 ${
                        selected
                          ? 'bg-[#153D32] text-[#F7F5F0] border-[#153D32]'
                          : 'bg-white text-[#202421] border-[#202421]/15 hover:border-[#153D32]/60'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold">{option.label}</p>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            selected ? 'text-[#E9E6DF]/85' : 'text-[#202421]/65'
                          }`}
                        >
                          {option.subtitle}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          selected
                            ? 'border-[#C6A66B] bg-[#C6A66B] text-[#153D32]'
                            : 'border-[#202421]/30'
                        }`}
                      >
                        {selected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Service Plan Tier Selection */}
            <div className="pt-6 border-t border-[#202421]/10">
              <label className="block text-xs font-semibold tracking-wider text-[#202421]/80 mb-3">
                Preferred Service Plan Category
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {SERVICE_PLAN_TIERS.map((tier) => {
                  const isSelected = formData.planTier === tier.name;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => updateField('planTier', tier.name)}
                      className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E9E6DF] border-[#153D32] ring-1 ring-[#153D32]'
                          : 'bg-white border-[#202421]/15 hover:border-[#153D32]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-serif-display text-lg font-semibold text-[#202421]">
                          {tier.name}
                        </span>
                        {isSelected && (
                          <span className="text-xs font-medium text-[#153D32]">Selected</span>
                        )}
                      </div>
                      <p className="text-xs text-[#202421]/70 mt-1">{tier.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TELL US ABOUT YOUR PROPERTY */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif-display text-2xl sm:text-3xl font-normal text-[#202421]">
                02. Tell Us About Your Property
              </h3>
              <p className="text-sm text-[#202421]/70 mt-1">
                Property dimensions and layout help us allocate the right specialist team and time
                window.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Type */}
              <div>
                <label
                  htmlFor="quote-property-type"
                  className="block text-xs font-semibold tracking-wider text-[#202421] mb-2"
                >
                  Property Type *
                </label>
                <select
                  id="quote-property-type"
                  value={formData.propertyType}
                  onChange={(e) => updateField('propertyType', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#202421]/20 rounded text-sm text-[#202421] focus:outline-none focus:border-[#153D32]"
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.propertyType && (
                  <p role="alert" className="mt-1.5 text-xs text-red-700">
                    {errors.propertyType}
                  </p>
                )}
              </div>

              {/* Approximate Property Size */}
              <div>
                <label
                  htmlFor="quote-property-size"
                  className="block text-xs font-semibold tracking-wider text-[#202421] mb-2"
                >
                  Approximate Property Size *
                </label>
                <select
                  id="quote-property-size"
                  value={formData.propertySize}
                  onChange={(e) => updateField('propertySize', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#202421]/20 rounded text-sm text-[#202421] focus:outline-none focus:border-[#153D32]"
                >
                  {PROPERTY_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                {errors.propertySize && (
                  <p role="alert" className="mt-1.5 text-xs text-red-700">
                    {errors.propertySize}
                  </p>
                )}
              </div>

              {/* Number of Bedrooms (if applicable) */}
              <div>
                <label
                  htmlFor="quote-bedrooms"
                  className="block text-xs font-semibold tracking-wider text-[#202421] mb-2"
                >
                  {isCommercial ? 'Executive Suites / Rooms (Optional)' : 'Number of Bedrooms (If Applicable)'}
                </label>
                <select
                  id="quote-bedrooms"
                  value={formData.bedrooms}
                  onChange={(e) => updateField('bedrooms', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#202421]/20 rounded text-sm text-[#202421] focus:outline-none focus:border-[#153D32]"
                >
                  <option value="Not applicable (Commercial)">Not applicable (Commercial / Open Plan)</option>
                  <option value="1 – 2 Bedrooms">1 – 2 Bedrooms</option>
                  <option value="3 Bedrooms">3 Bedrooms</option>
                  <option value="4 Bedrooms">4 Bedrooms</option>
                  <option value="5 Bedrooms">5 Bedrooms</option>
                  <option value="6+ Bedrooms / Estate">6+ Bedrooms / Estate</option>
                </select>
              </div>

              {/* Number of Bathrooms (if applicable) */}
              <div>
                <label
                  htmlFor="quote-bathrooms"
                  className="block text-xs font-semibold tracking-wider text-[#202421] mb-2"
                >
                  Number of Bathrooms / Restrooms
                </label>
                <select
                  id="quote-bathrooms"
                  value={formData.bathrooms}
                  onChange={(e) => updateField('bathrooms', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-[#202421]/20 rounded text-sm text-[#202421] focus:outline-none focus:border-[#153D32]"
                >
                  <option value="1 – 2 Bathrooms">1 – 2 Bathrooms</option>
                  <option value="2.5 – 3.5 Bathrooms">2.5 – 3.5 Bathrooms</option>
                  <option value="4.5 Bathrooms">4.5 Bathrooms</option>
                  <option value="5 – 6 Bathrooms">5 – 6 Bathrooms</option>
                  <option value="7+ Bathrooms / Estate">7+ Bathrooms / Estate</option>
                </select>
              </div>
            </div>

            {/* Preferred Cleaning Frequency */}
            <div className="pt-2">
              <label className="block text-xs font-semibold tracking-wider text-[#202421] mb-2.5">
                Preferred Cleaning Frequency *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {FREQUENCIES.map((freq) => {
                  const selected = formData.frequency === freq;
                  return (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => updateField('frequency', freq)}
                      className={`px-4 py-3 rounded border text-left text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#153D32] text-[#F7F5F0] border-[#153D32]'
                          : 'bg-white text-[#202421] border-[#202421]/20 hover:border-[#153D32]'
                      }`}
                    >
                      {freq}
                    </button>
                  );
                })}
              </div>
              {errors.frequency && (
                <p role="alert" className="mt-1.5 text-xs text-red-700">
                  {errors.frequency}
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: CHOOSE YOUR PREFERENCES */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif-display text-2xl sm:text-3xl font-normal text-[#202421]">
                03. Choose Your Preferences
              </h3>
              <p className="text-sm text-[#202421]/70 mt-1">
                Specify your preferred date, California location, and any architectural surface
                notes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preferred Date */}
              <div>
                <label
                  htmlFor="quote-preferred-date"
                  className="block text-xs font-semibold tracking-wider text-[#202421] mb-2"
                >
                  Preferred Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#202421]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="quote-preferred-date"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.preferredDate}
                    onChange={(e) => updateField('preferredDate', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#202421]/20 rounded text-sm text-[#202421] font-mono-tabular focus:outline-none focus:border-[#153D32]"
                  />
                </div>
                {errors.preferredDate && (
                  <p role="alert" className="mt-1.5 text-xs text-red-700">
                    {errors.preferredDate}
                  </p>
                )}
              </div>

              {/* Preferred Time Window */}
              <div>
                <label
                  htmlFor="quote-preferred-time"
                  className="block text-xs font-semibold tracking-wider text-[#202421] mb-2"
                >
                  Preferred Arrival Window *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-[#202421]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="quote-preferred-time"
                    value={formData.preferredTime}
                    onChange={(e) => updateField('preferredTime', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#202421]/20 rounded text-sm text-[#202421] focus:outline-none focus:border-[#153D32]"
                  >
                    {TIME_WINDOWS.map((tw) => (
                      <option key={tw} value={tw}>
                        {tw}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.preferredTime && (
                  <p role="alert" className="mt-1.5 text-xs text-red-700">
                    {errors.preferredTime}
                  </p>
                )}
              </div>
            </div>

            {/* California Location or Postcode with Google Places Autocomplete */}
            <div className="relative">
              <label
                htmlFor="quote-location"
                className="block text-xs font-semibold tracking-wider text-[#202421] mb-2"
              >
                California Location, Neighborhood, or ZIP Code *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#153D32] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="quote-location"
                  type="text"
                  value={formData.location}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setShowSuggestions(true);
                    updateField('location', e.target.value);
                  }}
                  placeholder="Start typing your California address, community, or ZIP (e.g. Beverly Hills, 90210, Palo Alto)..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#202421]/20 rounded text-sm text-[#202421] placeholder:text-[#202421]/45 focus:outline-none focus:border-[#153D32]"
                />
              </div>
              {errors.location && (
                <p role="alert" className="mt-1.5 text-xs text-red-700">
                  {errors.location}
                </p>
              )}

              {showSuggestions && addressSuggestions.length > 0 && (
                <ul
                  role="listbox"
                  aria-label="Suggested California addresses"
                  className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-[#202421]/15 rounded-lg shadow-lg max-h-52 overflow-y-auto divide-y divide-[#202421]/10"
                >
                  {addressSuggestions.map((s, idx) => {
                    const label = s.placePrediction?.text?.text || '';
                    return (
                      <li key={idx}>
                        <button
                          type="button"
                          onClick={() => void handleSelectAddressSuggestion(s)}
                          className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-[#202421] hover:bg-[#F7F5F0] flex items-center gap-2.5 cursor-pointer"
                        >
                          <MapPin className="w-4 h-4 text-[#153D32] shrink-0" />
                          <span className="truncate">{label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Additional Requirements & Surface Notes */}
            <div>
              <label
                htmlFor="quote-requirements"
                className="block text-xs font-semibold tracking-wider text-[#202421] mb-2"
              >
                Architectural Surfaces & Additional Requirements (Optional)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {SURFACE_REQUIREMENT_CHIPS.map((chip) => {
                  const active = formData.additionalRequirements.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleSurfaceRequirement(chip)}
                      className={`px-3 py-1.5 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[#153D32] text-[#F7F5F0] border-[#153D32]'
                          : 'bg-white text-[#202421]/80 border-[#202421]/20 hover:border-[#153D32]'
                      }`}
                    >
                      {active ? `✓ ${chip}` : `+ ${chip}`}
                    </button>
                  );
                })}
              </div>
              <textarea
                id="quote-requirements"
                rows={3}
                value={formData.additionalRequirements}
                onChange={(e) => updateField('additionalRequirements', e.target.value)}
                placeholder="Note any delicate surfaces, guest suite preparations, gate access instructions, or preferred cleaning supplies..."
                className="w-full px-4 py-3 bg-white border border-[#202421]/20 rounded text-sm text-[#202421] placeholder:text-[#202421]/45 focus:outline-none focus:border-[#153D32]"
              />
            </div>
          </div>
        )}

        {/* STEP 4: CONTACT INFORMATION */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif-display text-2xl sm:text-3xl font-normal text-[#202421]">
                04. Contact Information
              </h3>
              <p className="text-sm text-[#202421]/70 mt-1">
                Provide your preferred contact details so our California Concierge team can deliver
                your personalized quote.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="quote-fullname"
                  className="block text-xs font-semibold tracking-wider text-[#202421] mb-2"
                >
                  Full Name *
                </label>
                <input
                  id="quote-fullname"
                  type="text"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="e.g. Evelyn Vance"
                  className="w-full px-4 py-3 bg-white border border-[#202421]/20 rounded text-sm text-[#202421] focus:outline-none focus:border-[#153D32]"
                />
                {errors.fullName && (
                  <p role="alert" className="mt-1.5 text-xs text-red-700">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="quote-email"
                  className="block text-xs font-semibold tracking-wider text-[#202421] mb-2"
                >
                  Email Address *
                </label>
                <input
                  id="quote-email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-3 bg-white border border-[#202421]/20 rounded text-sm text-[#202421] focus:outline-none focus:border-[#153D32]"
                />
                {errors.email && (
                  <p role="alert" className="mt-1.5 text-xs text-red-700">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="quote-phone"
                  className="block text-xs font-semibold tracking-wider text-[#202421] mb-2"
                >
                  Phone Number *
                </label>
                <input
                  id="quote-phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="(310) 555-0192"
                  className="w-full px-4 py-3 bg-white border border-[#202421]/20 rounded text-sm text-[#202421] font-mono-tabular focus:outline-none focus:border-[#153D32]"
                />
                {errors.phone && (
                  <p role="alert" className="mt-1.5 text-xs text-red-700">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="quote-message"
                className="block text-xs font-semibold tracking-wider text-[#202421] mb-2"
              >
                Additional Message or Walkthrough Preferences (Optional)
              </label>
              <textarea
                id="quote-message"
                rows={3}
                value={formData.additionalMessage}
                onChange={(e) => updateField('additionalMessage', e.target.value)}
                placeholder="Share any preferred contact hours, estate manager contact details, or questions for our team..."
                className="w-full px-4 py-3 bg-white border border-[#202421]/20 rounded text-sm text-[#202421] focus:outline-none focus:border-[#153D32]"
              />
            </div>

            {/* Live Pre-Submission Review Box */}
            <div className="p-4 bg-[#E9E6DF]/70 rounded border border-[#202421]/10 text-xs text-[#202421]/80 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-[#153D32]">Selected Scope:</span>{' '}
                {formData.serviceType} ({formData.planTier}) · {formData.propertyType} (
                {formData.propertySize})
              </div>
              <div className="font-mono-tabular">
                {formData.preferredDate} · {formData.location || 'California'}
              </div>
            </div>

            {submitError && (
              <div
                role="alert"
                className="p-4 bg-red-50 border border-red-200 rounded text-xs text-red-800"
              >
                {submitError}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-[#202421]/10 flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-3 bg-transparent border border-[#202421]/25 text-[#202421] text-xs font-semibold tracking-[0.12em] rounded hover:border-[#202421] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>
          ) : (
            <div className="text-xs text-[#202421]/60">
              Final pricing depends on property scope and requested service.
            </div>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-3.5 bg-[#153D32] text-[#F7F5F0] text-xs font-semibold tracking-[0.12em] rounded hover:bg-[#102E26] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 text-[#C6A66B]" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3.5 bg-[#153D32] text-[#F7F5F0] text-xs font-semibold tracking-[0.14em] rounded hover:bg-[#102E26] disabled:opacity-60 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{isSubmitting ? 'Submitting Request...' : 'Request My Quote'}</span>
              <ArrowRight className="w-4 h-4 text-[#C6A66B]" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
