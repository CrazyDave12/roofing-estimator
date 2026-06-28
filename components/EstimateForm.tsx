"use client";

import { useState } from "react";
import { EstimateFormData, RoofMaterial, RoofPitch, Stories, Condition } from "@/types/estimate";

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

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-gray-700 mb-1">{children}</label>;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full mt-4 mb-1">
      <h3 className="text-xs font-bold uppercase tracking-widest text-orange-600 border-b border-orange-100 pb-1">
        {children}
      </h3>
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        {...props}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
      />
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
      <select
        {...props}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
      >
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
    <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 bg-white">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-orange-500" : "bg-gray-300"
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

export default function EstimateForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<EstimateFormData>(empty);

  function set<K extends keyof EstimateFormData>(key: K, value: EstimateFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
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
    <form onSubmit={handleSubmit} className="space-y-2">
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
        <Input
          label="Property Address"
          type="text"
          placeholder="123 Main St, Dallas TX 75201"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          required
        />

        <SectionHeader>Roof Measurements</SectionHeader>
        <Input
          label="Square Footage (roof area)"
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

        <SectionHeader>Additional Notes</SectionHeader>
        <div className="col-span-full">
          <Label>Notes for the AI Estimator</Label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
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
        className="w-full mt-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 px-6 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Generating Estimate...
          </>
        ) : (
          "Generate Estimate with AI →"
        )}
      </button>
    </form>
  );
}
