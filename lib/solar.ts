const GOOGLE_API_KEY = process.env.SOLAR_API_KEY!;

export interface RoofSegment {
  pitchDegrees: number;
  azimuthDegrees: number;
  areaM2: number;
  areaFt2: number;
  sunshineHours: number;
}

export interface SolarRoofData {
  address: string;
  lat: number;
  lng: number;
  totalRoofAreaFt2: number;
  groundAreaFt2: number;
  dominantPitchDegrees: number;
  dominantPitch: string;
  facets: number;
  maxSunshineHoursPerYear: number;
  imageryDate: string;
  segments: RoofSegment[];
}

function degreesToRoofingPitch(degrees: number): string {
  const rise = Math.tan((degrees * Math.PI) / 180) * 12;
  const rounded = Math.round(rise);
  if (rounded <= 4) return "4/12";
  if (rounded === 5) return "5/12";
  if (rounded === 6) return "6/12";
  if (rounded === 7) return "7/12";
  if (rounded === 8) return "8/12";
  if (rounded === 9) return "9/12";
  if (rounded === 10) return "10/12";
  if (rounded === 11) return "11/12";
  return "12/12+";
}

async function geocode(address: string): Promise<{ lat: number; lng: number; formatted: string }> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.results?.length) throw new Error("Address not found");
  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng, formatted: data.results[0].formatted_address };
}

export async function fetchSolarRoofData(address: string): Promise<SolarRoofData> {
  const geo = await geocode(address);

  const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${geo.lat}&location.longitude=${geo.lng}&requiredQuality=LOW&key=${GOOGLE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Google Solar API error");
  }
  const data = await res.json();

  const sp = data.solarPotential;
  const M2_TO_FT2 = 10.7639;

  const segments: RoofSegment[] = (sp.roofSegmentStats ?? []).map((seg: any) => ({
    pitchDegrees: seg.pitchDegrees,
    azimuthDegrees: seg.azimuthDegrees,
    areaM2: seg.stats.areaMeters2,
    areaFt2: Math.round(seg.stats.areaMeters2 * M2_TO_FT2),
    sunshineHours: Math.round(seg.stats.sunshineQuantiles?.[5] ?? 0),
  }));

  // Dominant pitch = segment with largest area
  const largest = segments.reduce((a, b) => (a.areaFt2 > b.areaFt2 ? a : b));

  const d = data.imageryDate;
  const imageryDate = `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;

  return {
    address: geo.formatted,
    lat: geo.lat,
    lng: geo.lng,
    totalRoofAreaFt2: Math.round(sp.wholeRoofStats.areaMeters2 * M2_TO_FT2),
    groundAreaFt2: Math.round(sp.wholeRoofStats.groundAreaMeters2 * M2_TO_FT2),
    dominantPitchDegrees: largest.pitchDegrees,
    dominantPitch: degreesToRoofingPitch(largest.pitchDegrees),
    facets: segments.length,
    maxSunshineHoursPerYear: Math.round(sp.maxSunshineHoursPerYear),
    imageryDate,
    segments,
  };
}
