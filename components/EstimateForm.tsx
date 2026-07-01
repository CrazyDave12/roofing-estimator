"use client";

import { useState } from "react";
import { EstimateFormData, RoofMaterial, RoofPitch, Stories, Condition } from "@/types/estimate";
import { SolarRoofData } from "@/lib/solar";

const PITCHES: RoofPitch[] = ["4/12", "5/12", "6/12", "7/12", "8/12", "9/12", "10/12", "11/12", "12/12+"];
const MATERIALS: { value: RoofMaterial; label: string }[] = [
  { value: "asphalt-3tab", label: "Asphalt 3-Tab Shingles" },
  { value: "asphalt-architectural", label: "Architectural Shingles (most common)" },
  { value: "asphalt-premium", label: "Premium Asphalt Shingles" },
  { value: "metal-corrugated", label: "Metal — Corrugated" },
  { value: "metal-standing-seam", label: "Metal — Standing Seam" },
  { value: "tile", label: "Tile" },
  { value: "tpo-flat", label: "TPO / Flat Roof" },
];

const empty: EstimateFormData = {
  clientName: "",
  address: "",
  squareFootage: 0,
  pitch: "6/12",
  facets: 2,
  layers: 1,
  roofAge: 0,
  material: "asphalt-architectural",
  deckingCondition: "good",
  flashingCondition: "good",
  skylights: 0,
  chimneys: 0,
  pipeVents: 0,
  stories: "1",
  obstructions: "",
  gutterReplacement: false,
  fasciaRepair: false,
  notes: "",
};

interface Props {
  onSubmit: (data: EstimateFormData) => void;
  loading: boolean;
}

const inputClass =
  "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-colors";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
      {children}
    </label>
  );
}

let sectionCount = 0;
function SectionHeader({ children }: { children: React.ReactNode }) {
  sectionCount++;
  const n = sectionCount;
  return (
    <div className="col-span-full mt-6 mb-2 flex items-center gap-3">
      <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
        {n}
      </span>
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700">{children}</h3>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label>{label}</Label>
      <input {...props} className={inputClass} />
    </div>
  );
}

function Select<T extends string>({
  label,
  options,
  ...props
}: {
  label: string;
  options: { value: T; label: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <Label>{label}</Label>
      <select {...props} className={inputClass}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between border border-slate-200 rounded-xl px-4 py-3 bg-white">
      <span className="text-sm text-slate-700 font-medium">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-orange-500" : "bg-slate-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function azimuthLabel(deg: number): string {
  if (deg >= 337.5 || deg < 22.5) return "N";
  if (deg < 67.5) return "NE";
  if (deg < 112.5) return "E";
  if (deg < 157.5) return "SE";
  if (deg < 202.5) return "S";
  if (deg < 247.5) return "SW";
  if (deg < 292.5) return "W";
  return "NW";
}

export default function EstimateForm({ onSubmit, loading }: Props) {
  sectionCount = 0;
  const [form, setForm] = useState<EstimateFormData>(empty);
  const [solarData, setSolarData] = useState<SolarRoofData | null>(null);
  const [solarLoading, setSolarLoading] = useState(false);
  const [solarError, setSolarError] = useState<string | null>(null);

  function set<K extends keyof EstimateFormData>(key: K, value: EstimateFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function fetchSolar() {
    if (!form.address.trim()) {
      setSolarError("Enter the property address first.");
      return;
    }
    setSolarLoading(true);
    setSolarError(null);
    try {
      const res = await fetch(`/api/solar-lookup?address=${encodeURIComponent(form.address)}`);
      if (!res.ok) throw new Error((await res.json()).error ?? "Solar lookup failed");
      const data: SolarRoofData = await res.json();
      setSolarData(data);
      setForm((prev) => ({
        ...prev,
        squareFootage: data.totalRoofAreaFt2,
        pitch: data.dominantPitch as RoofPitch,
        facets: data.facets,
        address: data.address,
      }));
    } catch (e) {
      setSolarError(e instanceof Error ? e.message : "Solar lookup failed");
    } finally {
      setSolarLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ ...form, solarData } as EstimateFormData & { solarData?: SolarRoofData });
  }

  const conditionOptions: { value: Condition; label: string }[] = [
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor / Damaged" },
  ];

  const storiesOptions: { value: Stories; label: string }[] = [
    { value: "1", label: "1 Story" },
    { value: "2", label: "2 Stories" },
    { value: "3+", label: "3+ Stories" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SectionHeader>Client Info</SectionHeader>
        <Input
          label="Client Name"
          type="text"
          placeholder="John Smith"
          value={form.clientName}
          onChange={(e) => set("clientName", e.target.value)}
          required
        />

        {/* Address + Solar lookup */}
        <div className="col-span-full">
          <Label>Property Address</Label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="123 Main St, Dallas TX 75201"
              value={form.address}
              onChange={(e) => { set("address", e.target.value); setSolarData(null); }}
              required
              className={inputClass + " flex-1"}
            />
            <button
              type="button"
              onClick={fetchSolar}
              disabled={solarLoading}
              className="flex items-center gap-2 bg-[#0f172a] hover:bg-slate-700 disabled:bg-slate-300 text-white text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap transition-colors border border-slate-700"
            >
              {solarLoading ? (
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <span className="text-orange-400">☀</span>
              )}
              {solarLoading ? "Looking up..." : "Auto-fill from Solar"}
            </button>
          </div>
          {solarError && <p className="text-red-500 text-xs mt-1.5">{solarError}</p>}
        </div>

        {/* Solar verification card — dark */}
        {solarData && (
          <div className="col-span-full bg-[#0f172a] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-orange-400 text-sm">☀</span>
                <span className="text-orange-400 font-bold text-xs uppercase tracking-widest">Google Solar — Roof Verified</span>
              </div>
              <span className="text-slate-500 text-xs">Imagery: {solarData.imageryDate}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { val: solarData.totalRoofAreaFt2.toLocaleString(), label: "Roof sq ft" },
                { val: solarData.dominantPitch, label: "Dominant pitch" },
                { val: solarData.facets, label: "Roof facets" },
                { val: solarData.maxSunshineHoursPerYear.toLocaleString(), label: "Sunshine hrs/yr" },
              ].map(({ val, label }) => (
                <div key={label} className="bg-slate-800 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-white">{val}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wide">Roof segments</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {solarData.segments.map((seg, i) => (
                <span key={i} className="bg-slate-800 border border-slate-700 text-xs text-slate-300 px-2.5 py-1.5 rounded-lg">
                  {seg.areaFt2.toLocaleString()} ft² · {seg.pitchDegrees.toFixed(1)}° · {azimuthLabel(seg.azimuthDegrees)}
                </span>
              ))}
            </div>
            <p className="text-xs text-emerald-400 font-medium">Sq footage, pitch, and facet count auto-filled from satellite data.</p>
          </div>
        )}

        <SectionHeader>Roof Measurements</SectionHeader>
        <Input
          label="Square Footage (sloped roof area)"
          type="number"
          min={100}
          placeholder="2400"
          value={form.squareFootage || ""}
          onChange={(e) => set("squareFootage", Number(e.target.value))}
          required
        />
        <Select
          label="Roof Pitch"
          options={PITCHES.map((p) => ({ value: p, label: p }))}
          value={form.pitch}
          onChange={(e) => set("pitch", e.target.value as RoofPitch)}
        />
        <Input
          label="Number of Facets / Planes"
          type="number"
          min={1}
          max={20}
          placeholder="2"
          value={form.facets || ""}
          onChange={(e) => set("facets", Number(e.target.value))}
        />

        <SectionHeader>Existing Roof</SectionHeader>
        <Input
          label="Number of Existing Layers"
          type="number"
          min={1}
          max={5}
          placeholder="1"
          value={form.layers || ""}
          onChange={(e) => set("layers", Number(e.target.value))}
        />
        <Input
          label="Estimated Roof Age (years)"
          type="number"
          min={0}
          placeholder="15"
          value={form.roofAge || ""}
          onChange={(e) => set("roofAge", Number(e.target.value))}
        />

        <SectionHeader>New Material</SectionHeader>
        <div className="col-span-full">
          <Select
            label="Roofing Material"
            options={MATERIALS}
            value={form.material}
            onChange={(e) => set("material", e.target.value as RoofMaterial)}
          />
        </div>

        <SectionHeader>Condition Assessment</SectionHeader>
        <Select
          label="Decking Condition"
          options={conditionOptions}
          value={form.deckingCondition}
          onChange={(e) => set("deckingCondition", e.target.value as Condition)}
        />
        <Select
          label="Flashing Condition"
          options={conditionOptions}
          value={form.flashingCondition}
          onChange={(e) => set("flashingCondition", e.target.value as Condition)}
        />

        <SectionHeader>Penetrations</SectionHeader>
        <Input
          label="Skylights"
          type="number"
          min={0}
          placeholder="0"
          value={form.skylights || ""}
          onChange={(e) => set("skylights", Number(e.target.value))}
        />
        <Input
          label="Chimneys"
          type="number"
          min={0}
          placeholder="0"
          value={form.chimneys || ""}
          onChange={(e) => set("chimneys", Number(e.target.value))}
        />
        <Input
          label="Pipe / Plumbing Vents"
          type="number"
          min={0}
          placeholder="0"
          value={form.pipeVents || ""}
          onChange={(e) => set("pipeVents", Number(e.target.value))}
        />

        <SectionHeader>Accessibility</SectionHeader>
        <Select
          label="Building Stories"
          options={storiesOptions}
          value={form.stories}
          onChange={(e) => set("stories", e.target.value as Stories)}
        />
        <Input
          label="Obstructions (trees, patio, etc.)"
          type="text"
          placeholder="None"
          value={form.obstructions}
          onChange={(e) => set("obstructions", e.target.value)}
        />

        <SectionHeader>Add-Ons</SectionHeader>
        <Toggle
          label="Gutter Replacement"
          checked={form.gutterReplacement}
          onChange={(v) => set("gutterReplacement", v)}
        />
        <Toggle
          label="Fascia Board Repair"
          checked={form.fasciaRepair}
          onChange={(v) => set("fasciaRepair", v)}
        />

        <SectionHeader>Notes</SectionHeader>
        <div className="col-span-full">
          <Label>Notes for the Estimator</Label>
          <textarea
            className={inputClass + " resize-none"}
            rows={3}
            placeholder="Any special conditions, storm damage, customer requests..."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-black py-3.5 px-6 rounded-2xl text-base transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Generating Estimate...
          </>
        ) : (
          "Generate Estimate →"
        )}
      </button>
    </form>
  );
}
