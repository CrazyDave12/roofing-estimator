export type RoofPitch = "4/12" | "5/12" | "6/12" | "7/12" | "8/12" | "9/12" | "10/12" | "11/12" | "12/12+";
export type RoofMaterial =
  | "asphalt-3tab"
  | "asphalt-architectural"
  | "asphalt-premium"
  | "metal-corrugated"
  | "metal-standing-seam"
  | "tile"
  | "tpo-flat";
export type Condition = "good" | "fair" | "poor";
export type Stories = "1" | "2" | "3+";

export interface EstimateFormData {
  // Client
  clientName: string;
  address: string;

  // Measurements
  squareFootage: number;
  pitch: RoofPitch;
  facets: number;

  // Existing roof
  layers: number;
  roofAge: number;

  // Material
  material: RoofMaterial;

  // Condition
  deckingCondition: Condition;
  flashingCondition: Condition;

  // Penetrations
  skylights: number;
  chimneys: number;
  pipeVents: number;

  // Accessibility
  stories: Stories;
  obstructions: string;

  // Extras
  gutterReplacement: boolean;
  fasciaRepair: boolean;

  // Notes
  notes: string;
}

export interface LineItem {
  id: string;
  category: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface EstimateData {
  lineItems: LineItem[];
  scopeOfWork: string;
  timeline: string;
  notes: string;
  subtotal: number;
  discount: number;
  discountType: "percent" | "flat";
  total: number;
  generatedAt: string;
  formData: EstimateFormData;
}
