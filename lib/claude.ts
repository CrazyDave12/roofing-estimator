import Anthropic from "@anthropic-ai/sdk";
import { EstimateFormData, LineItem } from "@/types/estimate";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MATERIAL_LABELS: Record<string, string> = {
  "asphalt-3tab": "Asphalt 3-Tab Shingles",
  "asphalt-architectural": "Architectural Shingles",
  "asphalt-premium": "Premium Asphalt Shingles",
  "metal-corrugated": "Corrugated Metal Roofing",
  "metal-standing-seam": "Standing Seam Metal Roofing",
  tile: "Tile Roofing",
  "tpo-flat": "TPO Flat Roofing",
};

const CONDITION_LABELS: Record<string, string> = {
  good: "Good",
  fair: "Fair",
  poor: "Poor / Damaged",
};

function buildPrompt(form: EstimateFormData): string {
  const squares = (form.squareFootage / 100).toFixed(1);
  return `You are an expert roofing estimator. Generate a detailed, accurate roofing estimate in valid JSON only — no markdown, no explanation, just raw JSON.

PROJECT DETAILS:
- Client: ${form.clientName}
- Address: ${form.address}
- Roof area: ${form.squareFootage} sq ft (${squares} squares)
- Roof pitch: ${form.pitch}
- Number of facets/planes: ${form.facets}
- Existing layers: ${form.layers} (all must be torn off)
- Roof age: ${form.roofAge} years
- Material selected: ${MATERIAL_LABELS[form.material]}
- Decking condition: ${CONDITION_LABELS[form.deckingCondition]}
- Flashing condition: ${CONDITION_LABELS[form.flashingCondition]}
- Skylights: ${form.skylights}
- Chimneys: ${form.chimneys}
- Pipe vents: ${form.pipeVents}
- Building stories: ${form.stories}
- Obstructions: ${form.obstructions || "None"}
- Gutter replacement: ${form.gutterReplacement ? "Yes" : "No"}
- Fascia repair: ${form.fasciaRepair ? "Yes" : "No"}
- Contractor notes: ${form.notes || "None"}

PRICING CONTEXT (2025 US averages):
- Asphalt 3-tab: $3.50–$4.70/sq ft installed
- Architectural shingles: $4.10–$5.60/sq ft installed
- Premium asphalt: $4.40–$6.00/sq ft installed
- Metal corrugated: $6–$9/sq ft installed
- Standing seam metal: $18–$25/sq ft installed
- Tile: $14–$25/sq ft installed
- TPO flat: $5–$9/sq ft installed
- Tear-off (1 layer): $1.00–$1.50/sq ft; add $0.50/sq ft per extra layer
- Decking replacement: $2.00–$3.50/sq ft
- Pitch multiplier: pitches 8/12+ add 15–25% to labor
- Skylight flashing: $150–$350 each
- Chimney flashing: $200–$500 each
- Pipe boot: $25–$75 each
- Multi-story surcharge: 2-story +15%, 3+ story +30% on labor
- Gutters (aluminum): $8–$12 per linear ft (estimate ~2.5x perimeter of roof area)
- Fascia board replacement: $6–$12 per linear ft
- Disposal/dump fee: $150–$400 per load (estimate 1 load per 20 squares)
- Permit: $150–$500 typical

INSTRUCTIONS:
1. Calculate realistic line items broken out by category.
2. Use pitch, layers, decking condition, and stories to adjust labor pricing.
3. If decking is "poor", add a decking replacement line item for ~15–25% of the roof area.
4. Return ONLY this exact JSON structure:

{
  "lineItems": [
    {
      "id": "unique-string",
      "category": "Tear-Off & Disposal",
      "description": "Tear off and dispose of existing ${form.layers} layer(s) of roofing",
      "qty": 0,
      "unit": "sq ft",
      "unitPrice": 0,
      "total": 0
    }
  ],
  "scopeOfWork": "One paragraph describing the full scope.",
  "timeline": "X–Y days",
  "notes": "Any important caveats or conditions the contractor should communicate to the homeowner."
}

Categories to use: "Tear-Off & Disposal", "Decking", "Underlayment & Ice Shield", "Materials", "Labor", "Flashing & Penetrations", "Extras", "Permit & Fees"
All monetary values must be numbers (not strings). Round to 2 decimal places. Make line item totals = qty * unitPrice.`;
}

export interface ClaudeEstimateResult {
  lineItems: LineItem[];
  scopeOfWork: string;
  timeline: string;
  notes: string;
}

export async function generateEstimate(form: EstimateFormData): Promise<ClaudeEstimateResult> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: buildPrompt(form) }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = JSON.parse(cleaned) as ClaudeEstimateResult;
  return parsed;
}
