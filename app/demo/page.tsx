import ProposalView from "@/components/ProposalView";
import { ProposalData } from "@/types/proposal";

// Real roof data for 102 Bartlett Drive, North Wales PA 19454
// fetched from Google Solar API (imagery date: 2022-09-19)
const DEMO: ProposalData = {
  proposalNumber: "PRE-2025-0847",
  issuedDate: "June 28, 2025",
  validUntil: "July 28, 2025",

  company: {
    name: "Peak Ridge Roofing Co.",
    phone: "(215) 555-0192",
    email: "estimates@peakridgeroofing.com",
    license: "PA-HIC #PA124831",
  },

  client: {
    name: "Robert & Linda Bartlett",
    address: "102 Bartlett Drive",
    city: "North Wales, PA 19454",
  },

  job: {
    squareFootage: 3960,   // from Google Solar API: 367.65 m² × 10.7639
    pitch: "5/12",         // dominant segment: 22.13° ≈ 5/12
    stories: "2",
    material: "Owens Corning Duration® Architectural Shingles — Estate Gray",
    existingLayers: 1,
    deckingCondition: "Fair — minor wear along valleys",
    timeline: "2–3 days",
    startDate: "Within 5–7 business days of acceptance",
  },

  lineItems: [
    {
      id: "1",
      category: "Tear-Off & Disposal",
      description: "Remove and dispose of existing single-layer shingle roof",
      qty: 3960,
      unit: "sq ft",
      unitPrice: 1.1,
      total: 4356,
    },
    {
      id: "2",
      category: "Decking",
      description: "Replace deteriorated decking boards — valley areas (approx. 317 sq ft)",
      qty: 317,
      unit: "sq ft",
      unitPrice: 3.0,
      total: 951,
    },
    {
      id: "3",
      category: "Underlayment & Ice Shield",
      description: "Synthetic felt underlayment — full roof",
      qty: 3960,
      unit: "sq ft",
      unitPrice: 0.7,
      total: 2772,
    },
    {
      id: "4",
      category: "Underlayment & Ice Shield",
      description: "Ice & water shield — eaves and all valleys (PA code req.)",
      qty: 476,
      unit: "sq ft",
      unitPrice: 1.5,
      total: 714,
    },
    {
      id: "5",
      category: "Materials",
      description: "Owens Corning Duration® Architectural Shingles (130 mph wind rated)",
      qty: 3960,
      unit: "sq ft",
      unitPrice: 2.3,
      total: 9108,
    },
    {
      id: "6",
      category: "Materials",
      description: "Ridge cap shingles — hip and ridge lines",
      qty: 252,
      unit: "lin ft",
      unitPrice: 2.0,
      total: 504,
    },
    {
      id: "7",
      category: "Materials",
      description: "Aluminum drip edge — all eaves and rakes",
      qty: 280,
      unit: "lin ft",
      unitPrice: 2.0,
      total: 560,
    },
    {
      id: "8",
      category: "Labor",
      description: "Roofing installation — full re-roof (2-story multiplier applied)",
      qty: 3960,
      unit: "sq ft",
      unitPrice: 1.61,
      total: 6376,
    },
    {
      id: "9",
      category: "Flashing & Penetrations",
      description: "Chimney counter-flashing — step and cap (1 chimney)",
      qty: 1,
      unit: "ea",
      unitPrice: 450,
      total: 450,
    },
    {
      id: "10",
      category: "Flashing & Penetrations",
      description: "Pipe boot vents — rubber collar replacement",
      qty: 4,
      unit: "ea",
      unitPrice: 60,
      total: 240,
    },
    {
      id: "11",
      category: "Permit & Fees",
      description: "Montgomery County building permit",
      qty: 1,
      unit: "ea",
      unitPrice: 350,
      total: 350,
    },
    {
      id: "12",
      category: "Permit & Fees",
      description: "Haul-away and landfill disposal — 2 loads",
      qty: 2,
      unit: "load",
      unitPrice: 280,
      total: 560,
    },
  ],

  scopeOfWork:
    "Peak Ridge Roofing Co. will perform a complete tear-off and replacement of the existing single-layer shingle roof at 102 Bartlett Drive. Google Solar satellite imagery (Sept. 2022) confirms a 5-segment roof spanning 3,960 sq ft of sloped surface area. Work includes removal and disposal of all existing material, replacement of approximately 317 sq ft of deteriorated decking along the valley areas, installation of full synthetic underlayment with ice and water shield at all eaves and valleys per PA code requirements, and installation of Owens Corning Duration® architectural shingles with matching ridge caps. All step flashing, chimney counter-flashing, and pipe boot vents will be replaced. Jobsite will be cleaned daily with a magnetic sweep performed upon completion.",

  warranties: [
    { label: "Manufacturer — Shingles", detail: "Owens Corning Platinum Protection Limited Lifetime Warranty" },
    { label: "Manufacturer — Wind", detail: "130 mph limited wind warranty (registered to homeowner)" },
    { label: "Workmanship", detail: "10-year contractor workmanship warranty — Peak Ridge Roofing" },
  ],

  subtotal: 26941,
  discount: 941,
  discountType: "flat",
  total: 26000,

  paymentTerms: "50% deposit due at contract signing. Remaining 50% due upon completion.",
  notes:
    "Roof measurements verified via Google Solar API satellite imagery (2022-09-19). Final invoice reflects actual materials used. Any additional decking damage found during tear-off will be documented and communicated before proceeding at $3.00/sq ft.",

  // Real data from Google Solar API
  solarVerification: {
    imageryDate: "2022-09-19",
    totalRoofAreaFt2: 3960,
    groundAreaFt2: 3634,
    dominantPitch: "5/12",
    facets: 5,
    maxSunshineHoursPerYear: 1506,
    segments: [
      { areaFt2: 1560, pitchDegrees: 22.13, azimuthDegrees: 45.6 },
      { areaFt2: 634,  pitchDegrees: 22.34, azimuthDegrees: 225.3 },
      { areaFt2: 615,  pitchDegrees: 23.88, azimuthDegrees: 232.4 },
      { areaFt2: 321,  pitchDegrees: 21.97, azimuthDegrees: 221.9 },
      { areaFt2: 243,  pitchDegrees: 20.43, azimuthDegrees: 42.0 },
    ],
  },
};

export default function DemoPage() {
  return <ProposalView data={DEMO} isDemo />;
}
