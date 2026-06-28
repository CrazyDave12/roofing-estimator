import { NextRequest, NextResponse } from "next/server";
import { EstimateFormData } from "@/types/estimate";
import { ProposalData } from "@/types/proposal";

const MATERIAL_LABELS: Record<string, string> = {
  "asphalt-3tab": "Asphalt 3-Tab Shingles",
  "asphalt-architectural": "Architectural Shingles",
  "asphalt-premium": "Premium Asphalt Shingles",
  "metal-corrugated": "Corrugated Metal Roofing",
  "metal-standing-seam": "Standing Seam Metal Roofing",
  tile: "Tile Roofing",
  "tpo-flat": "TPO / Flat Roofing",
};

const MATERIAL_PRICE: Record<string, number> = {
  "asphalt-3tab": 1.9,
  "asphalt-architectural": 2.3,
  "asphalt-premium": 2.8,
  "metal-corrugated": 4.5,
  "metal-standing-seam": 12.0,
  tile: 9.0,
  "tpo-flat": 3.5,
};

const LABOR_PRICE: Record<string, number> = {
  "asphalt-3tab": 1.2,
  "asphalt-architectural": 1.4,
  "asphalt-premium": 1.5,
  "metal-corrugated": 2.5,
  "metal-standing-seam": 5.5,
  tile: 5.0,
  "tpo-flat": 2.0,
};

function pitchMultiplier(pitch: string): number {
  const n = parseInt(pitch);
  if (n >= 10) return 1.25;
  if (n >= 8) return 1.15;
  return 1.0;
}

function storiesMultiplier(stories: string): number {
  if (stories === "3+") return 1.3;
  if (stories === "2") return 1.15;
  return 1.0;
}

function today() {
  return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function thirtyDaysOut() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function propNum() {
  return `PRE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 8999)}`;
}

export async function POST(req: NextRequest) {
  const form = (await req.json()) as EstimateFormData;

  const sqft = form.squareFootage;
  const pitch = pitchMultiplier(form.pitch);
  const stories = storiesMultiplier(form.stories);
  const matPrice = MATERIAL_PRICE[form.material] ?? 2.3;
  const laborBase = LABOR_PRICE[form.material] ?? 1.4;
  const laborPrice = laborBase * pitch * stories;

  const tearOffBase = 1.1 + (form.layers - 1) * 0.5;
  const tearOffTotal = Math.round(sqft * tearOffBase);

  const deckingQty = form.deckingCondition === "poor" ? Math.round(sqft * 0.2) : form.deckingCondition === "fair" ? Math.round(sqft * 0.08) : 0;
  const deckingTotal = deckingQty * 3.0;

  const underlayTotal = Math.round(sqft * 0.7);
  const iceShieldQty = Math.round(sqft * 0.12);
  const iceShieldTotal = Math.round(iceShieldQty * 1.5);

  const matTotal = Math.round(sqft * matPrice);
  const ridgeQty = Math.round(Math.sqrt(sqft) * 2.2);
  const ridgeTotal = Math.round(ridgeQty * 2.0);
  const dripQty = Math.round(Math.sqrt(sqft) * 2.5);
  const dripTotal = Math.round(dripQty * 2.0);

  const laborTotal = Math.round(sqft * laborPrice);

  const skylightTotal = form.skylights * 250;
  const chimneyTotal = form.chimneys * 450;
  const ventTotal = form.pipeVents * 60;

  const loadsNeeded = Math.ceil(sqft / 2000);
  const disposalTotal = loadsNeeded * 280;
  const permitTotal = 350;

  const gutterLinFt = Math.round(Math.sqrt(sqft) * 4);
  const gutterTotal = form.gutterReplacement ? Math.round(gutterLinFt * 10) : 0;
  const fasciaLinFt = Math.round(Math.sqrt(sqft) * 3);
  const fasciaTotal = form.fasciaRepair ? Math.round(fasciaLinFt * 8) : 0;

  const id = (n: number) => `li-${n}`;

  const lineItems = [
    { id: id(1), category: "Tear-Off & Disposal", description: `Remove and dispose of ${form.layers} existing shingle layer${form.layers > 1 ? "s" : ""}`, qty: sqft, unit: "sq ft", unitPrice: tearOffBase, total: tearOffTotal },
    ...(deckingQty > 0 ? [{ id: id(2), category: "Decking", description: "Replace damaged/deteriorated roof decking", qty: deckingQty, unit: "sq ft", unitPrice: 3.0, total: deckingTotal }] : []),
    { id: id(3), category: "Underlayment & Ice Shield", description: "Synthetic felt underlayment — full roof", qty: sqft, unit: "sq ft", unitPrice: 0.7, total: underlayTotal },
    { id: id(4), category: "Underlayment & Ice Shield", description: "Ice & water shield — eaves and valleys", qty: iceShieldQty, unit: "sq ft", unitPrice: 1.5, total: iceShieldTotal },
    { id: id(5), category: "Materials", description: MATERIAL_LABELS[form.material] ?? "Roofing material", qty: sqft, unit: "sq ft", unitPrice: matPrice, total: matTotal },
    { id: id(6), category: "Materials", description: "Ridge cap — hip and ridge lines", qty: ridgeQty, unit: "lin ft", unitPrice: 2.0, total: ridgeTotal },
    { id: id(7), category: "Materials", description: "Aluminum drip edge — eaves and rakes", qty: dripQty, unit: "lin ft", unitPrice: 2.0, total: dripTotal },
    { id: id(8), category: "Labor", description: `Roofing installation — ${MATERIAL_LABELS[form.material] ?? "full re-roof"}`, qty: sqft, unit: "sq ft", unitPrice: Number(laborPrice.toFixed(2)), total: laborTotal },
    ...(form.skylights > 0 ? [{ id: id(9), category: "Flashing & Penetrations", description: "Skylight flashing — step and counter-flash", qty: form.skylights, unit: "ea", unitPrice: 250, total: skylightTotal }] : []),
    ...(form.chimneys > 0 ? [{ id: id(10), category: "Flashing & Penetrations", description: "Chimney counter-flashing — step and cap", qty: form.chimneys, unit: "ea", unitPrice: 450, total: chimneyTotal }] : []),
    ...(form.pipeVents > 0 ? [{ id: id(11), category: "Flashing & Penetrations", description: "Pipe boot vents — rubber collar replacement", qty: form.pipeVents, unit: "ea", unitPrice: 60, total: ventTotal }] : []),
    { id: id(12), category: "Permit & Fees", description: "Building permit", qty: 1, unit: "ea", unitPrice: permitTotal, total: permitTotal },
    { id: id(13), category: "Permit & Fees", description: `Haul-away & disposal — ${loadsNeeded} load${loadsNeeded > 1 ? "s" : ""}`, qty: loadsNeeded, unit: "load", unitPrice: 280, total: disposalTotal },
    ...(gutterTotal > 0 ? [{ id: id(14), category: "Extras", description: "Gutter replacement — aluminum gutters", qty: gutterLinFt, unit: "lin ft", unitPrice: 10, total: gutterTotal }] : []),
    ...(fasciaTotal > 0 ? [{ id: id(15), category: "Extras", description: "Fascia board repair / replacement", qty: fasciaLinFt, unit: "lin ft", unitPrice: 8, total: fasciaTotal }] : []),
  ].filter((i) => i.total > 0);

  const subtotal = lineItems.reduce((s, i) => s + i.total, 0);
  const discount = Math.round(subtotal * 0.02);
  const total = subtotal - discount;

  const isMetal = form.material.startsWith("metal");
  const isTile = form.material === "tile";

  const proposal: ProposalData = {
    proposalNumber: propNum(),
    issuedDate: today(),
    validUntil: thirtyDaysOut(),

    company: {
      name: "Your Roofing Company",
      phone: "(555) 000-0000",
      email: "estimates@yourcompany.com",
      license: "License #00000",
    },

    client: {
      name: form.clientName || "Homeowner",
      address: form.address,
      city: "",
    },

    job: {
      squareFootage: sqft,
      pitch: form.pitch,
      stories: form.stories,
      material: MATERIAL_LABELS[form.material] ?? form.material,
      existingLayers: form.layers,
      deckingCondition: `${form.deckingCondition.charAt(0).toUpperCase() + form.deckingCondition.slice(1)}`,
      timeline: isMetal || isTile ? "3–5 days" : "1–2 days",
      startDate: "Within 5–7 business days of acceptance",
    },

    lineItems,
    scopeOfWork: `We will perform a complete tear-off and replacement of the existing ${form.layers}-layer roof at ${form.address}. All existing shingles and underlayment will be removed and disposed of. ${deckingQty > 0 ? `Damaged decking (approx. ${deckingQty} sq ft) will be replaced. ` : ""}New synthetic underlayment and ice & water shield will be installed at all eaves and valleys. ${MATERIAL_LABELS[form.material]} will be installed to manufacturer specifications. All flashing, vents, and penetrations will be replaced or re-flashed. The jobsite will be cleaned daily and a magnetic sweep performed at completion.`,

    warranties: [
      { label: "Manufacturer — Material", detail: `Limited lifetime warranty on ${MATERIAL_LABELS[form.material]}` },
      { label: "Manufacturer — Wind", detail: "130 mph limited wind warranty (registered to homeowner)" },
      { label: "Workmanship", detail: "5-year contractor workmanship warranty" },
    ],

    subtotal,
    discount,
    discountType: "flat",
    total,

    paymentTerms: "50% deposit due at contract signing. Remaining 50% due upon job completion.",
    notes: form.notes || "Estimate based on measurements provided. Any additional damage discovered during tear-off will be documented and communicated to homeowner before proceeding.",
  };

  return NextResponse.json(proposal);
}
