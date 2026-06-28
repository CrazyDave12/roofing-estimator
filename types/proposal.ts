export interface ProposalLineItem {
  id: string;
  category: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface ProposalData {
  proposalNumber: string;
  issuedDate: string;
  validUntil: string;

  company: {
    name: string;
    phone: string;
    email: string;
    license: string;
  };

  client: {
    name: string;
    address: string;
    city: string;
  };

  job: {
    squareFootage: number;
    pitch: string;
    stories: string;
    material: string;
    existingLayers: number;
    deckingCondition: string;
    timeline: string;
    startDate: string;
  };

  lineItems: ProposalLineItem[];
  scopeOfWork: string;

  warranties: {
    label: string;
    detail: string;
  }[];

  subtotal: number;
  discount: number;
  discountType: "percent" | "flat";
  total: number;

  paymentTerms: string;
  notes: string;

  solarVerification?: {
    imageryDate: string;
    totalRoofAreaFt2: number;
    groundAreaFt2: number;
    dominantPitch: string;
    facets: number;
    maxSunshineHoursPerYear: number;
    segments: { areaFt2: number; pitchDegrees: number; azimuthDegrees: number }[];
  };
}
