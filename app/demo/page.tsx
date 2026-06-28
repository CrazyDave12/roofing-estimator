import ProposalView from "@/components/ProposalView";
import { ProposalData } from "@/types/proposal";

const DEMO: ProposalData = {
  proposalNumber: "PRE-2025-0847",
  issuedDate: "June 28, 2025",
  validUntil: "July 28, 2025",

  company: {
    name: "Peak Ridge Roofing Co.",
    phone: "(512) 844-7200",
    email: "estimates@peakridgeroofing.com",
    license: "TX-ROC #48821",
  },

  client: {
    name: "Michael & Sarah Johnson",
    address: "4821 Maplewood Drive",
    city: "Austin, TX 78745",
  },

  job: {
    squareFootage: 2600,
    pitch: "6/12",
    stories: "2",
    material: "Owens Corning Duration® Architectural Shingles — Shasta White",
    existingLayers: 2,
    deckingCondition: "Fair — minor soft spots along north valley",
    timeline: "2–3 days",
    startDate: "Within 5–7 business days of acceptance",
  },

  lineItems: [
    {
      id: "1",
      category: "Tear-Off & Disposal",
      description: "Remove and dispose of 2 existing shingle layers",
      qty: 2600,
      unit: "sq ft",
      unitPrice: 1.4,
      total: 3640,
    },
    {
      id: "2",
      category: "Decking",
      description: "Replace damaged decking boards — north valley (approx. 160 sq ft)",
      qty: 160,
      unit: "sq ft",
      unitPrice: 3.0,
      total: 480,
    },
    {
      id: "3",
      category: "Underlayment & Ice Shield",
      description: "Synthetic felt underlayment — full roof",
      qty: 2600,
      unit: "sq ft",
      unitPrice: 0.7,
      total: 1820,
    },
    {
      id: "4",
      category: "Underlayment & Ice Shield",
      description: "Ice & water shield — eaves and valleys",
      qty: 300,
      unit: "sq ft",
      unitPrice: 1.5,
      total: 450,
    },
    {
      id: "5",
      category: "Materials",
      description: "Owens Corning Duration® Architectural Shingles (130 mph wind warranty)",
      qty: 2600,
      unit: "sq ft",
      unitPrice: 2.3,
      total: 5980,
    },
    {
      id: "6",
      category: "Materials",
      description: "Ridge cap shingles — hip and ridge",
      qty: 190,
      unit: "lin ft",
      unitPrice: 2.0,
      total: 380,
    },
    {
      id: "7",
      category: "Materials",
      description: "Aluminum drip edge — all eaves and rakes",
      qty: 210,
      unit: "lin ft",
      unitPrice: 2.0,
      total: 420,
    },
    {
      id: "8",
      category: "Labor",
      description: "Roofing installation — full re-roof",
      qty: 2600,
      unit: "sq ft",
      unitPrice: 1.4,
      total: 3640,
    },
    {
      id: "9",
      category: "Flashing & Penetrations",
      description: "Chimney counter-flashing — step and cap",
      qty: 1,
      unit: "chimney",
      unitPrice: 450,
      total: 450,
    },
    {
      id: "10",
      category: "Flashing & Penetrations",
      description: "Pipe boot vents — rubber collar replacement",
      qty: 3,
      unit: "ea",
      unitPrice: 60,
      total: 180,
    },
    {
      id: "11",
      category: "Permit & Fees",
      description: "City of Austin building permit",
      qty: 1,
      unit: "ea",
      unitPrice: 350,
      total: 350,
    },
    {
      id: "12",
      category: "Permit & Fees",
      description: "Haul-away and landfill disposal fee",
      qty: 1,
      unit: "load",
      unitPrice: 280,
      total: 280,
    },
  ],

  scopeOfWork:
    "Peak Ridge Roofing Co. will perform a complete tear-off and replacement of the existing two-layer shingle roof at 4821 Maplewood Drive. Work includes removal and disposal of all existing roofing material, replacement of approximately 160 sq ft of damaged roof decking along the north valley, installation of full synthetic underlayment with ice and water shield at all eaves and valley areas, and installation of Owens Corning Duration® architectural shingles with matching ridge caps. All step flashing, chimney counter-flashing, and pipe boot vents will be replaced. Site will be cleaned daily and a magnetic sweep will be performed at job completion.",

  warranties: [
    { label: "Manufacturer — Shingles", detail: "Owens Corning Platinum Protection Limited Lifetime Warranty" },
    { label: "Manufacturer — Wind", detail: "130 mph limited wind warranty (registered to homeowner)" },
    { label: "Workmanship", detail: "10-year contractor workmanship warranty — Peak Ridge Roofing" },
  ],

  subtotal: 18070,
  discount: 570,
  discountType: "flat",
  total: 17500,

  paymentTerms: "50% deposit due at contract signing. Remaining 50% due upon completion.",
  notes:
    "Price is based on measurements provided. Final invoice will reflect actual materials used. Any additional decking damage discovered during tear-off will be charged at $3.00/sq ft and communicated to homeowner before proceeding.",
};

export default function DemoPage() {
  return <ProposalView data={DEMO} isDemo />;
}
