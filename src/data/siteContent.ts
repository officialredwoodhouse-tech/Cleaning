import heroPenthouseImg from '../assets/images/hero_luxury_penthouse_1791553702051.jpg';
import residentialKitchenImg from '../assets/images/service_residential_kitchen_1791553713789.jpg';
import commercialAtelierImg from '../assets/images/service_commercial_atelier_1791553727175.jpg';
import marbleSuiteImg from '../assets/images/comparison_marble_suite_1791553750538.jpg';
import teamUniformPhotoshootImg from '../assets/images/team_uniform_photoshoot_1791558176985.jpg';
import cleaningToolsKitImg from '../assets/images/cleaning_tools_kit_1791558190744.jpg';
import agencyEquipmentArsenalImg from '../assets/images/agency_equipment_arsenal_1791558784491.jpg';
import beverlyHillsVillaImg from '../assets/images/property_beverly_hills_villa_1791560311793.jpg';
import malibuOceanfrontImg from '../assets/images/property_malibu_oceanfront_1791560323217.jpg';

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  category: 'residential' | 'commercial' | 'specialty';
  description: string;
  ctaLabel: string;
  image: string;
  imageAlt: string;
  aspectClass: string;
  colSpanClass: string;
  scopeHighlights: string[];
  surfaceCareNotes: string;
}

export interface AgencyShowcaseItem {
  id: string;
  number: string;
  category: 'team-dress' | 'tools-kit';
  categoryLabel: string;
  title: string;
  description: string;
  specs: string[];
  image: string;
  imageAlt: string;
  aspectClass?: string;
}

export interface ApproachStep {
  number: string;
  title: string;
  description: string;
  detail: string;
}

export interface WhyChooseReason {
  number: string;
  title: string;
  description: string;
}

export interface ComparisonScene {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  beforeNotes: string[];
  afterNotes: string[];
}

export interface PlaceholderTestimonial {
  id: string;
  quote: string;
  authorInitials: string;
  locationRegion: string;
  serviceCategory: string;
  isPlaceholder: true;
}

export interface ServicePlanTier {
  id: string;
  name: string;
  tagline: string;
  description: string;
  idealFor: string;
  includedFocus: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface CaliforniaRegionQuery {
  id: string;
  label: string;
  regionGroup: 'Southern California' | 'Northern California' | 'Central Coast';
  searchQuery: string;
  serviceNote: string;
}

export interface FeaturedPropertyItem {
  id: string;
  number: string;
  title: string;
  location: string;
  category: 'estate' | 'coastal-penthouse' | 'commercial-studio';
  categoryLabel: string;
  dimensions: string;
  cadence: string;
  summary: string;
  architecturalMaterials: string[];
  careProtocolHighlights: string[];
  recommendedService: string;
  recommendedTier: string;
  image: string;
  imageAlt: string;
  colSpanClass: string;
}

export const BRAND_IMAGES = {
  heroPenthouse: heroPenthouseImg,
  residentialKitchen: residentialKitchenImg,
  commercialAtelier: commercialAtelierImg,
  marbleSuite: marbleSuiteImg,
  teamUniformPhotoshoot: teamUniformPhotoshootImg,
  cleaningToolsKit: cleaningToolsKitImg,
  agencyEquipmentArsenal: agencyEquipmentArsenalImg,
  beverlyHillsVilla: beverlyHillsVillaImg,
  malibuOceanfront: malibuOceanfrontImg,
};

export const FEATURED_PROPERTIES: FeaturedPropertyItem[] = [
  {
    id: 'beverly-hills-pavilion-villa',
    number: '01',
    title: 'Trousdale Estates Indoor-Outdoor Villa',
    location: 'Beverly Hills, CA',
    category: 'estate',
    categoryLabel: 'Private Architectural Estate',
    dimensions: '7,800 sq ft · 6 Bedrooms · 8 Baths',
    cadence: 'Twice-Weekly Bespoke Stewardship',
    summary:
      'An expansive indoor-outdoor architectural pavilion featuring motorized pocket glass sliders, honed limestone terraces, and a bookmatched travertine hearth overlooking Los Angeles.',
    architecturalMaterials: [
      'Honed continuous interior-exterior limestone flooring',
      'Vein-cut travertine fireplace feature wall & cedar soffits',
      '22-foot motorized pocket glass walls & recessed bronze tracks',
    ],
    careProtocolHighlights: [
      '3-specialist uniformed crew with HEPA H14 parquet filtration',
      'Deionized water & solid brass squeegee detailing for panoramic glass sliders',
      'Vacuuming and debris extraction along flush indoor-outdoor floor tracks',
    ],
    recommendedService: 'Luxury Residential Cleaning',
    recommendedTier: 'Bespoke Property Care',
    image: BRAND_IMAGES.beverlyHillsVilla,
    imageAlt:
      'Modern Beverly Hills luxury villa indoor-outdoor living pavilion with floor-to-ceiling glass sliders, limestone floors, travertine fireplace, and zero-edge pool',
    colSpanClass: 'lg:col-span-7',
  },
  {
    id: 'malibu-carbon-beach-residence',
    number: '02',
    title: 'Carbon Beach Oceanfront Glass Residence',
    location: 'Malibu, CA',
    category: 'coastal-penthouse',
    categoryLabel: 'Coastal Oceanfront Residence',
    dimensions: '5,400 sq ft · 4 Bedrooms · 5.5 Baths',
    cadence: 'Weekly Coastal Glass & Oak Care',
    summary:
      'A sunlit oceanfront residence exposed to Pacific salt air, crafted with bleached wide-plank European oak, custom hand-troweled plaster walls, and frameless coastal glazing.',
    architecturalMaterials: [
      'Bleached wide-plank European oak flooring & dining millwork',
      'Frameless marine-grade oceanfront glass balustrades & sliders',
      'Hand-troweled mineral plaster walls & unlacquered brass hardware',
    ],
    careProtocolHighlights: [
      'Weekly Pacific salt-mist removal on interior & terrace glass walls',
      'Moisture-controlled pH-neutral conditioning for bleached oak planks',
      'Dry horsehair brush dusting of textured mineral plaster reveals',
    ],
    recommendedService: 'Recurring Cleaning',
    recommendedTier: 'Signature Clean',
    image: BRAND_IMAGES.malibuOceanfront,
    imageAlt:
      'Malibu oceanfront luxury residence with frameless glass windows overlooking the Pacific Ocean, bleached oak floors, and sculptural oak dining table',
    colSpanClass: 'lg:col-span-5',
  },
  {
    id: 'pacific-heights-penthouse',
    number: '03',
    title: 'Pacific Heights Full-Floor Penthouse',
    location: 'San Francisco, CA',
    category: 'coastal-penthouse',
    categoryLabel: 'Full-Floor Urban Penthouse',
    dimensions: '4,600 sq ft · 4 Bedrooms · 4.5 Baths',
    cadence: 'Weekly Residential Care',
    summary:
      'A collector’s sky residence combining museum-grade art lighting, honed marble gallery floors, and floor-to-ceiling bay-view windows requiring low-moisture, zero-static detailing.',
    architecturalMaterials: [
      'Honed Calacatta marble gallery floors & hearth surrounds',
      'Custom architectural lighting coves & fine art wall reveals',
      'Bespoke linen upholstery & oiled walnut library shelving',
    ],
    careProtocolHighlights: [
      'Anti-static microfiber and soft goat/horsehair brush detailing near artwork',
      'Two-stage pH-neutral spray and dry buffing for honed marble floors',
      'Whisper-quiet commercial HEPA H14 vacuuming across rugs and drapery',
    ],
    recommendedService: 'Luxury Residential Cleaning',
    recommendedTier: 'Signature Clean',
    image: BRAND_IMAGES.heroPenthouse,
    imageAlt:
      'Luxury penthouse living room with floor-to-ceiling windows, golden morning sunlight, honed marble, and wide-plank oak flooring',
    colSpanClass: 'lg:col-span-5',
  },
  {
    id: 'montecito-culinary-estate',
    number: '04',
    title: 'Montecito Sanctuary & Culinary Estate',
    location: 'Montecito, CA',
    category: 'estate',
    categoryLabel: 'Private Sanctuary & Guest Compound',
    dimensions: '6,800 sq ft · 5 Bedrooms · 7 Baths',
    cadence: 'Weekly + Pre-Arrival Deep Refresh',
    summary:
      'Designed around entertaining and seasonal retreats, centered on a monolithic Calacatta waterfall kitchen island, custom walnut cabinetry, and spa bath suites.',
    architecturalMaterials: [
      'Bookmatched Calacatta marble waterfall island & backsplash',
      'Quarter-sawn American walnut cabinetry & integrated wine columns',
      'Brushed champagne brass plumbing fixtures & limestone bath suites',
    ],
    careProtocolHighlights: [
      'Non-acidic stone degreasing and dry-buff clarity restoration on kitchen marble',
      'Interior detailing of Sub-Zero/Wolf appliances and wine storage glass',
      'Turnkey guest-suite linen alignment and spa wet-room descaling',
    ],
    recommendedService: 'Deep Cleaning',
    recommendedTier: 'Bespoke Property Care',
    image: BRAND_IMAGES.residentialKitchen,
    imageAlt:
      'Contemporary luxury kitchen with a honed Calacatta marble waterfall island, bespoke warm walnut cabinetry, and brushed brass fixtures',
    colSpanClass: 'lg:col-span-7',
  },
  {
    id: 'westside-architectural-atelier',
    number: '05',
    title: 'Westside Executive Atelier & Design Showroom',
    location: 'West Hollywood / Beverly Hills, CA',
    category: 'commercial-studio',
    categoryLabel: 'Commercial Studio & Executive Suite',
    dimensions: '6,500 sq ft · 3 Boardrooms · Gallery Lounge',
    cadence: 'Daily After-Hours Commercial Care',
    summary:
      'A private family office and architectural design studio where client reception lounges, travertine conference tables, and full-height glass partitions require daily showroom readiness.',
    architecturalMaterials: [
      '18-foot monolithic travertine boardroom table',
      'Full-height acoustic bronze-framed glass partitions',
      'Polished stone gallery floors & private hospitality pantry',
    ],
    careProtocolHighlights: [
      'Evening uniformed commercial team with rolling multi-compartment caddies',
      'Optical fingerprint removal across all interior glass walls and entry doors',
      'Sanitization of executive workstations, stone conference surfaces, and restrooms',
    ],
    recommendedService: 'Commercial Cleaning',
    recommendedTier: 'Signature Clean',
    image: BRAND_IMAGES.commercialAtelier,
    imageAlt:
      'Pristine luxury corporate executive suite and architectural studio with travertine conference table and floor-to-ceiling glass partitions',
    colSpanClass: 'lg:col-span-6',
  },
  {
    id: 'bel-air-marble-spa-wing',
    number: '06',
    title: 'Bel Air Newly Remodeled Spa & Dressing Wing',
    location: 'Bel Air, Los Angeles, CA',
    category: 'estate',
    categoryLabel: 'Post-Construction & Estate Care',
    dimensions: '9,200 sq ft · 7 Bedrooms · 10 Baths',
    cadence: 'Post-Construction Handover + Weekly Care',
    summary:
      'Following an 18-month architectural renovation, our specialists executed multi-stage HEPA fine-dust extraction across custom dressing rooms and bookmatched marble wet rooms.',
    architecturalMaterials: [
      'Floor-to-ceiling bookmatched Calacatta marble vanity & wet room',
      'Frameless starphire glass steam shower enclosures',
      'Custom illuminated wardrobe millwork & limestone slab floors',
    ],
    careProtocolHighlights: [
      '3-phase HEPA H14 fine drywall and millwork dust extraction inside all cabinetry',
      'Zero-scratch removal of contractor protective films on glass and brass fixtures',
      'Ongoing weekly mineral-spot prevention across steam showers and vanities',
    ],
    recommendedService: 'Post-Construction Cleaning',
    recommendedTier: 'Bespoke Property Care',
    image: BRAND_IMAGES.marbleSuite,
    imageAlt:
      'Spotless luxury master bathroom and dressing suite with bookmatched Calacatta marble vanity, frameless glass shower, and limestone floor',
    colSpanClass: 'lg:col-span-6',
  },
];

export const AGENCY_SHOWCASE_ITEMS: AgencyShowcaseItem[] = [
  {
    id: 'our-team-portrait',
    number: '01',
    category: 'team-dress',
    categoryLabel: 'Our Uniformed Team (Group Portrait)',
    title: 'The Aurel California Specialist Team',
    description:
      'Our residential and commercial specialists arrive as a coordinated team—dressed in tailored midnight-navy collared shirts, scratch-free slate linen aprons, indoor soft-sole shoes, and protective detailing gloves.',
    specs: [
      'Coordinated multi-specialist California team',
      'Tailored navy collared shirts & scratch-free slate aprons',
      'Dedicated indoor-only footwear & protective gloves',
    ],
    image: BRAND_IMAGES.teamUniformPhotoshoot,
    imageAlt:
      'Aurel Cleaning Co. group photo of four uniformed specialists standing in a sunlit California residence holding wooden cleaning caddies',
    aspectClass: 'aspect-[16/10]',
  },
  {
    id: 'equipment-arsenal',
    number: '02',
    category: 'tools-kit',
    categoryLabel: 'Complete Equipment Arsenal',
    title: 'HEPA H14 Vacuums, Brass Squeegees & Dispensers',
    description:
      'Our complete on-site equipment kit: commercial stainless HEPA H14 canister vacuums, walnut-and-leather bottle carriers with brass triggers, solid brass squeegees, and color-coded waffle microfiber.',
    specs: [
      'Whisper-quiet stainless HEPA H14 filtration canisters',
      'Brass-trigger amber glass pH-neutral spray system',
      'Sanitized, color-coded waffle-weave microfiber stacks',
    ],
    image: BRAND_IMAGES.agencyEquipmentArsenal,
    imageAlt:
      'Complete professional cleaning agency equipment arsenal on a travertine bench featuring a stainless HEPA vacuum, walnut bottle caddy, brass squeegees, brushes, and microfiber stacks',
    aspectClass: 'aspect-[16/10]',
  },
  {
    id: 'curated-tools-kit',
    number: '03',
    category: 'tools-kit',
    categoryLabel: 'Hand-Carried Detailing Tools',
    title: 'Bespoke Room-by-Room Surface Caddy',
    description:
      'Each specialist carries an organized compartmented caddy stocked with pH-neutral stone and wood formulations, natural horsehair dusting brushes, and precision reveal tools.',
    specs: [
      'Natural horsehair & boar-bristle detail brushes',
      'pH-neutral solutions safe for honed marble & oiled oak',
      'Solid brass squeegees with soft medical-grade rubber',
    ],
    image: BRAND_IMAGES.cleaningToolsKit,
    imageAlt:
      'Professional luxury cleaning kit with canvas caddy, amber glass spray bottles, rolled microfiber cloths, horsehair brushes, and brass squeegee',
    aspectClass: 'aspect-[4/3]',
  },
];

export const TRUST_INDICATORS = [
  {
    title: 'Tailored Cleaning Solutions',
    description:
      'Every service scope is structured around the architectural layout, natural materials, and priorities of your property.',
  },
  {
    title: 'Uniformed Specialist Teams',
    description:
      'Impeccably presented professionals in tailored attire, indoor footwear, and protective detailing gloves.',
  },
  {
    title: 'Bespoke Tools & HEPA Systems',
    description:
      'Equipped with pH-neutral formulations, horsehair brushes, brass squeegees, and HEPA H14 filtration.',
  },
  {
    title: 'Residential & Commercial Expertise',
    description:
      'Dedicated California teams serving private estates, penthouses, architectural studios, galleries, and executive suites.',
  },
];

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'Luxury Residential Cleaning',
    number: '01',
    title: 'Luxury Residential Cleaning',
    category: 'residential',
    description:
      'Exceptional care for private residences, apartments, and premium homes. We help maintain the beauty, comfort, and cleanliness of your personal space.',
    ctaLabel: 'Explore Residential Cleaning',
    image: BRAND_IMAGES.heroPenthouse,
    imageAlt:
      'Immaculate luxury penthouse living room with floor-to-ceiling windows, natural sunlight, honed marble, and wide-plank oak flooring',
    aspectClass: 'aspect-[16/10]',
    colSpanClass: 'lg:col-span-7',
    scopeHighlights: [
      'Careful hand-wiping of natural stone countertops, islands, and bespoke cabinetry',
      'Sanitization and polishing of luxury bath suites, frameless glass, and fixtures',
      'Microfiber dust removal across art frames, sculptural lighting, and architectural reveals',
      'Hardwood, limestone, and travertine floor care with pH-neutral surface protocols',
    ],
    surfaceCareNotes:
      'Formulated for porous natural stones (Calacatta, Carrara, travertine), oiled wide-plank oak, and delicate metal finishes.',
  },
  {
    id: 'Deep Cleaning',
    number: '02',
    title: 'Deep Cleaning',
    category: 'residential',
    description:
      'A comprehensive cleaning service focused on overlooked details, hard-to-reach areas, and the spaces that benefit from a more thorough refresh.',
    ctaLabel: 'Explore Deep Cleaning',
    image: BRAND_IMAGES.residentialKitchen,
    imageAlt:
      'Spotless contemporary luxury kitchen with honed Calacatta marble waterfall island, walnut cabinetry, and brushed brass fixtures',
    aspectClass: 'aspect-[4/3]',
    colSpanClass: 'lg:col-span-5',
    scopeHighlights: [
      'Detailed restoration of baseboards, door reveals, window tracks, and air diffusers',
      'Deep descaling and clarity treatment for spa glass enclosures and stone wet rooms',
      'Interior cabinet, pantry, and wardrobe shelf detailing upon request',
      'Under-furniture floor care and upholstery vacuuming with HEPA filtration',
    ],
    surfaceCareNotes:
      'Ideal as a seasonal reset, pre-event preparation, or foundational first visit prior to recurring maintenance.',
  },
  {
    id: 'Move-In / Move-Out Cleaning',
    number: '03',
    title: 'Move-In & Move-Out Cleaning',
    category: 'specialty',
    description:
      'Prepare a property for its next chapter with a detailed cleaning service designed for moving transitions, property handovers, and fresh beginnings.',
    ctaLabel: 'Explore Moving Services',
    image: BRAND_IMAGES.beverlyHillsVilla,
    imageAlt:
      'Immaculate Beverly Hills indoor-outdoor luxury villa prepared for a residential property handover',
    aspectClass: 'aspect-[4/3]',
    colSpanClass: 'lg:col-span-5',
    scopeHighlights: [
      'Complete interior sanitization of empty custom wardrobes, drawers, and built-ins',
      'Appliance interior detailing for luxury refrigeration, wine columns, and ovens',
      'Full architectural glass, sliding door track, and terrace threshold cleaning',
      'Walkthrough-ready presentation for real estate handovers and incoming homeowners',
    ],
    surfaceCareNotes:
      'Coordinated directly with homeowners, estate managers, or California luxury real estate advisors.',
  },
  {
    id: 'Commercial Cleaning',
    number: '04',
    title: 'Commercial Cleaning',
    category: 'commercial',
    description:
      'Professional cleaning solutions for offices, studios, retail spaces, and commercial environments that deserve a polished appearance.',
    ctaLabel: 'Explore Commercial Cleaning',
    image: BRAND_IMAGES.commercialAtelier,
    imageAlt:
      'Pristine executive boardroom and architectural design studio with travertine conference table and glass partitions',
    aspectClass: 'aspect-[16/10]',
    colSpanClass: 'lg:col-span-7',
    scopeHighlights: [
      'Immaculate presentation for client reception lounges, boardrooms, and private showrooms',
      'Streak-free maintenance of architectural glass partitions and display vitrines',
      'Discreet touchpoint sanitization across workstations, kitchens, and private restrooms',
      'Flexible after-hours, early-morning, or daytime porter scheduling',
    ],
    surfaceCareNotes:
      'Tailored for boutique hotels, family offices, design ateliers, private clinics, and luxury retail galleries.',
  },
  {
    id: 'Post-Construction Cleaning',
    number: '05',
    title: 'Post-Construction Cleaning',
    category: 'specialty',
    description:
      'Bring newly renovated or constructed spaces closer to completion with careful removal of appropriate construction dust and residue.',
    ctaLabel: 'Explore Post-Construction Cleaning',
    image: BRAND_IMAGES.agencyEquipmentArsenal,
    imageAlt:
      'Commercial stainless HEPA H14 vacuum system, walnut spray bottle carrier, brass squeegees, and horsehair detailing brushes',
    aspectClass: 'aspect-[4/3]',
    colSpanClass: 'lg:col-span-6',
    scopeHighlights: [
      'Multi-stage HEPA H14 vacuuming and microfiber capture of fine drywall and millwork dust',
      'Careful removal of protective film residue from windows, hardware, and fixtures',
      'Detailed cleaning of recessed lighting coves, cabinetry interiors, and stone ledges',
      'Final turn-key detailing ahead of interior designer styling and client move-in',
    ],
    surfaceCareNotes:
      'Executed with non-abrasive tools to protect newly installed stone, fresh lacquer, and custom glazing.',
  },
  {
    id: 'Recurring Cleaning',
    number: '06',
    title: 'Recurring Maintenance Cleaning',
    category: 'residential',
    description:
      'Enjoy a consistently maintained space with a cleaning schedule tailored to your property, preferences, and routine.',
    ctaLabel: 'Explore Maintenance Plans',
    image: BRAND_IMAGES.malibuOceanfront,
    imageAlt:
      'Consistently maintained Malibu oceanfront residence with wide-plank bleached oak flooring and frameless coastal glass',
    aspectClass: 'aspect-[4/3]',
    colSpanClass: 'lg:col-span-6',
    scopeHighlights: [
      'Weekly, bi-weekly, or multi-day-per-week scheduled property care',
      'Custom room-by-room priority rotation maintained in your property profile',
      'Consistent attention to linens, guest suites, kitchens, and outdoor-adjacent thresholds',
      'Seamless schedule adjustments for travel, houseguests, or private entertaining',
    ],
    surfaceCareNotes:
      'Designed to preserve long-term material integrity and effortless daily living across your residence.',
  },
];

export const APPROACH_STEPS: ApproachStep[] = [
  {
    number: '01',
    title: 'Understand Your Space',
    description:
      'We begin by understanding your property, priorities, cleaning requirements, and preferred schedule.',
    detail:
      'Architectural finishes, square footage, household preferences, and access instructions are documented with care.',
  },
  {
    number: '02',
    title: 'Create Your Plan',
    description: 'We recommend an appropriate service plan based on the needs of your space.',
    detail:
      'Whether a single seasonal refresh or ongoing weekly stewardship, your scope is clearly defined before service begins.',
  },
  {
    number: '03',
    title: 'Clean With Precision',
    description:
      'Our service focuses on consistency, care, and the details that contribute to a polished result.',
    detail:
      'Each room is addressed systematically using surface-appropriate methods for stone, wood, glass, and metalwork.',
  },
  {
    number: '04',
    title: 'Maintain the Standard',
    description:
      'For recurring clients, we help establish a practical schedule to keep spaces consistently maintained.',
    detail:
      'Your preferences remain on file so every subsequent visit reflects the exact standard your property expects.',
  },
];

export const WHY_CHOOSE_REASONS: WhyChooseReason[] = [
  {
    number: '01',
    title: 'Attention to Detail',
    description:
      'A thoughtful approach to the small details that influence the overall feel of a space.',
  },
  {
    number: '02',
    title: 'Personalized Cleaning Plans',
    description: 'Services shaped around your property, preferences, and priorities.',
  },
  {
    number: '03',
    title: 'Professional Presentation',
    description:
      'A polished service experience from the first inquiry to the final walkthrough.',
  },
  {
    number: '04',
    title: 'Flexible Scheduling',
    description:
      'Cleaning arrangements designed to accommodate your routine and requirements.',
  },
  {
    number: '05',
    title: 'Respect for Your Space',
    description:
      'Careful handling of furnishings, surfaces, and the environment entrusted to us.',
  },
];

export const COMPARISON_SCENES: ComparisonScene[] = [
  {
    id: 'marble-suite',
    title: 'Master Marble Bath & Dressing Suite',
    subtitle: 'Mineral Haze Removal & Stone Clarity Restoration (Demonstration Imagery)',
    image: BRAND_IMAGES.marbleSuite,
    imageAlt:
      'Demonstration comparison of a luxury Calacatta marble bathroom before and after professional detailing',
    beforeNotes: [
      'Water spotting and soap film dulling frameless shower glass',
      'Surface dust and residue muting the natural veining of honed marble',
      'Fingerprints and water marks on brushed brass plumbing fixtures',
    ],
    afterNotes: [
      'Crystal-clear, streak-free architectural glass enclosure',
      'Clean, pH-balanced finish across bookmatched marble vanity and limestone floors',
      'Spotless, dry-buffed champagne brass fixtures and aligned bath linens',
    ],
  },
  {
    id: 'calacatta-kitchen',
    title: 'Calacatta Waterfall Kitchen & Millwork',
    subtitle: 'Culinary Surface Detailing & Cabinetry Care (Demonstration Imagery)',
    image: BRAND_IMAGES.residentialKitchen,
    imageAlt: 'Demonstration comparison of a contemporary luxury kitchen before and after detailing',
    beforeNotes: [
      'Cooking film and dullness across the marble waterfall island',
      'Smudges around integrated walnut cabinetry pulls and oven glass',
      'Everyday dust settling along pendant glass cones and open shelving',
    ],
    afterNotes: [
      'Luminous, residue-free stone island ready for entertaining',
      'Conditioned, smudge-free walnut millwork and polished brass hardware',
      'Clear glass pendant shades and meticulously ordered countertop surfaces',
    ],
  },
  {
    id: 'executive-atelier',
    title: 'Executive Travertine Boardroom & Studio',
    subtitle: 'Commercial Presentation & Glass Partition Care (Demonstration Imagery)',
    image: BRAND_IMAGES.commercialAtelier,
    imageAlt:
      'Demonstration comparison of an executive boardroom before and after commercial cleaning',
    beforeNotes: [
      'Handprints on full-height bronze-framed glass partitions',
      'Dust accumulation across travertine conference surfaces and architectural models',
      'Foot traffic marks dulling the polished stone floor',
    ],
    afterNotes: [
      'Optically clear interior glass walls and spotless window mullions',
      'Immaculate travertine table and dust-free display plinths',
      'Even, reflective floor finish prepared for client presentations',
    ],
  },
];

/**
 * DEVELOPMENT PLACEHOLDER TESTIMONIALS
 * Note for publication: Replace these placeholder entries with verified customer reviews
 * and approved client initials before publishing to production.
 */
export const PLACEHOLDER_TESTIMONIALS: PlaceholderTestimonial[] = [
  {
    id: 'placeholder-1',
    quote:
      'The level of care shown toward our honed limestone floors and custom millwork was immediately apparent. Walking into the residence after each visit feels calm, orderly, and effortlessly maintained.',
    authorInitials: 'M. & E. V. (Placeholder Review)',
    locationRegion: 'Beverly Hills, CA',
    serviceCategory: 'Recurring Residential Care',
    isPlaceholder: true,
  },
  {
    id: 'placeholder-2',
    quote:
      'Prior to a private client exhibition at our design studio, the team handled our glass partitions, travertine tables, and lighting fixtures with remarkable precision and discretion.',
    authorInitials: 'S. L., Principal (Placeholder Review)',
    locationRegion: 'San Francisco, CA',
    serviceCategory: 'Commercial Studio Care',
    isPlaceholder: true,
  },
  {
    id: 'placeholder-3',
    quote:
      'Following a six-month architectural remodel, their post-construction detailing removed the fine dust from every reveal, cabinet interior, and window track so we could move in comfortably.',
    authorInitials: 'R. K. (Placeholder Review)',
    locationRegion: 'Montecito, CA',
    serviceCategory: 'Post-Construction Detailing',
    isPlaceholder: true,
  },
];

export const SERVICE_PLAN_TIERS: ServicePlanTier[] = [
  {
    id: 'Essential Care',
    name: 'Essential Care',
    tagline: 'Consistent Upkeep & Poised Presentation',
    description: 'Designed for regular upkeep and general cleaning.',
    idealFor:
      'Apartments, pied-à-terre residences, and well-maintained homes seeking dependable recurring care.',
    includedFocus: [
      'Systematic surface dusting and microfiber care across all living and sleeping quarters',
      'Kitchen countertop, sink, and appliance exterior detailing',
      'Bathroom sanitization, mirror polishing, and glass care',
      'Vacuuming and surface-appropriate floor maintenance',
    ],
  },
  {
    id: 'Signature Clean',
    name: 'Signature Clean',
    tagline: 'Comprehensive Detailing & Architectural Care',
    description: 'Designed for a more comprehensive cleaning experience.',
    idealFor:
      'Primary luxury residences, seasonal refreshes, move transitions, and executive commercial spaces.',
    includedFocus: [
      'Everything in Essential Care plus deep attention to baseboards, reveals, and fixtures',
      'Delicate natural stone, marble, and custom millwork surface protocols',
      'Interior glass, sliding door tracks, and high-touch hardware detailing',
      'Tailored room-by-room priority checklist customized to your property',
    ],
  },
  {
    id: 'Bespoke Property Care',
    name: 'Bespoke Property Care',
    tagline: 'Custom Protocols for Estates & Multi-Space Portfolios',
    description:
      'Designed for larger homes, premium properties, and customized cleaning requirements.',
    idealFor:
      'Private estates, penthouses, post-construction handovers, galleries, and multi-property management.',
    includedFocus: [
      'Custom-scoped service plan built from a dedicated property walkthrough',
      'Multi-specialist scheduling or multi-day-per-week recurring stewardship',
      'Coordination with estate managers, interior designers, or real estate advisors',
      'Specialized post-renovation, pre-event, or guest-arrival preparation',
    ],
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'What cleaning services do you offer?',
    answer:
      'We provide Luxury Residential Cleaning, Deep Cleaning, Move-In and Move-Out Cleaning, Commercial Cleaning for offices and studios, Post-Construction Cleaning, and Recurring Maintenance Cleaning across select California markets.',
  },
  {
    id: 'faq-2',
    question: 'How do you calculate cleaning costs?',
    answer:
      'Because every property differs in architectural layout, square footage, surface materials, current condition, and service frequency, we do not use arbitrary flat prices. We prepare a personalized quote after reviewing your property details through our quote form or consultation.',
  },
  {
    id: 'faq-3',
    question: 'Can I schedule recurring cleaning?',
    answer:
      'Yes. We offer recurring maintenance schedules—including weekly, bi-weekly, monthly, or custom multi-day arrangements—tailored to your routine and property requirements.',
  },
  {
    id: 'faq-4',
    question: 'Do I need to provide cleaning supplies?',
    answer:
      'We can bring professional equipment and cleaning supplies suited to residential and commercial interiors, or we can gladly use specific products and surface treatments that you prefer to keep on-site for your stone, wood, or specialty finishes. Simply note your preference when requesting your quote.',
  },
  {
    id: 'faq-5',
    question: 'Can I request a deep clean before moving into a property?',
    answer:
      'Absolutely. Our Move-In & Move-Out Cleaning and Deep Cleaning services are specifically designed for property handovers, pre-occupancy preparation, and real estate transitions while cabinetry and rooms are clear.',
  },
  {
    id: 'faq-6',
    question: 'How should I prepare my home before a cleaning appointment?',
    answer:
      'To allow our team to focus entirely on detailed surface care, we recommend securing personal valuables or sensitive documents and sharing any entry instructions, parking notes, or surface sensitivities in advance.',
  },
  {
    id: 'faq-7',
    question: 'Do you clean commercial properties?',
    answer:
      'Yes. We serve executive offices, architectural and creative studios, boutique retail spaces, showrooms, and commercial environments that require a polished, discreet presentation.',
  },
  {
    id: 'faq-8',
    question: 'How can I request a personalized quote?',
    answer:
      'You can request a personalized quote at any time using our interactive Book Now page or the multi-step quote form on this site. Select your service, describe your property, and choose your preferred dates to receive a tailored proposal.',
  },
];

export const CALIFORNIA_REGIONS: CaliforniaRegionQuery[] = [
  {
    id: 'beverly-hills',
    label: 'Beverly Hills & Westside',
    regionGroup: 'Southern California',
    searchQuery: 'Beverly Hills, CA, USA',
    serviceNote:
      'Private estates, Bel Air, Holmby Hills, Brentwood, and West Hollywood residences & studios.',
  },
  {
    id: 'malibu-pacific',
    label: 'Malibu & Pacific Palisades',
    regionGroup: 'Southern California',
    searchQuery: 'Malibu, CA, USA',
    serviceNote:
      'Coastal architectural homes, oceanfront glass care, and seasonal residence preparation.',
  },
  {
    id: 'newport-coast',
    label: 'Newport Beach & Coastal Orange County',
    regionGroup: 'Southern California',
    searchQuery: 'Newport Beach, CA, USA',
    serviceNote:
      'Newport Coast, Corona del Mar, and Laguna Beach luxury homes and executive suites.',
  },
  {
    id: 'la-jolla',
    label: 'La Jolla & Rancho Santa Fe',
    regionGroup: 'Southern California',
    searchQuery: 'La Jolla, CA, USA',
    serviceNote:
      'Coastal estates, Del Mar residences, and private commercial offices across North San Diego.',
  },
  {
    id: 'santa-barbara',
    label: 'Santa Barbara & Montecito',
    regionGroup: 'Central Coast',
    searchQuery: 'Montecito, CA, USA',
    serviceNote: 'Historic estates, sanctuary retreats, and turnkey guest-arrival property care.',
  },
  {
    id: 'san-francisco',
    label: 'San Francisco & Marin County',
    regionGroup: 'Northern California',
    searchQuery: 'Pacific Heights, San Francisco, CA, USA',
    serviceNote:
      'Pacific Heights, Presidio Heights, Russian Hill penthouses, and Sausalito/Tiburon homes.',
  },
  {
    id: 'silicon-valley',
    label: 'Palo Alto, Atherton & Silicon Valley',
    regionGroup: 'Northern California',
    searchQuery: 'Palo Alto, CA, USA',
    serviceNote:
      'Atherton, Woodside, Los Altos Hills private compounds and venture/family office suites.',
  },
  {
    id: 'napa-valley',
    label: 'Napa Valley & St. Helena',
    regionGroup: 'Northern California',
    searchQuery: 'St. Helena, CA, USA',
    serviceNote:
      'Wine country estates, private tasting hospitality spaces, and second-home maintenance.',
  },
];

export const BUSINESS_CONTACT_PLACEHOLDERS = {
  phoneDisplay: '[Phone: Configure verified business phone prior to publication]',
  emailDisplay: 'concierge@aurelcleaning.example',
  mailtoHref:
    'mailto:concierge@aurelcleaning.example?subject=Aurel%20Cleaning%20Co.%20%E2%80%94%20California%20Property%20Inquiry',
  instagramUrl: 'https://www.instagram.com/aurelcleaningco',
  instagramHandle: '@aurelcleaningco',
  serviceAreaDisplay:
    'California — Beverly Hills, Malibu, San Francisco, Montecito, Newport Beach & La Jolla',
  officeNote: 'Appointments & Property Walkthroughs by Prior Arrangement Across California',
};
