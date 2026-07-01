"use client";

import { useState } from "react";
import { ProposalData, ProposalLineItem } from "@/types/proposal";
import { downloadEstimateAsPDF } from "@/lib/pdf";
import RoofVisualization from "./RoofVisualization";

interface Props {
  data: ProposalData;
  isDemo?: boolean;
  onBack?: () => void;
}

const CATEGORIES = [
  "Tear-Off & Disposal",
  "Decking",
  "Underlayment & Ice Shield",
  "Materials",
  "Labor",
  "Flashing & Penetrations",
  "Permit & Fees",
  "Extras",
];

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ProposalView({ data, isDemo, onBack }: Props) {
  const [items, setItems] = useState<ProposalLineItem[]>(data.lineItems);
  const [scope, setScope] = useState(data.scopeOfWork);
  const [discount, setDiscount] = useState(data.discount);
  const [downloading, setDownloading] = useState(false);
  const [editing, setEditing] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const discountAmount = data.discountType === "percent" ? subtotal * (discount / 100) : discount;
  const total = Math.max(0, subtotal - discountAmount);

  function updateItem(id: string, field: keyof ProposalLineItem, raw: string) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const value = ["qty", "unitPrice", "total"].includes(field) ? Number(raw) : raw;
        const updated = { ...item, [field]: value };
        if (field === "qty" || field === "unitPrice") {
          updated.total = Number(updated.qty) * Number(updated.unitPrice);
        }
        return updated;
      })
    );
  }

  async function handleDownload() {
    setEditing(false);
    await new Promise((r) => setTimeout(r, 100));
    setDownloading(true);
    await downloadEstimateAsPDF(
      "proposal-doc",
      `proposal-${data.client.name.replace(/\s+/g, "-")}-${data.proposalNumber}.pdf`
    );
    setDownloading(false);
  }

  const grouped = CATEGORIES.map((cat) => ({
    cat,
    rows: items.filter((i) => i.category === cat),
  })).filter((g) => g.rows.length > 0);

  const rest = items.filter((i) => !CATEGORIES.includes(i.category));

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-8 px-4">
      {/* Top action bar */}
      <div className="max-w-4xl mx-auto mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors">
              ← New Estimate
            </button>
          )}
          {isDemo && (
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
              DEMO — Sample Proposal
            </span>
          )}
          <span className="text-slate-400 text-sm">#{data.proposalNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing((e) => !e)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              editing
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
            }`}
          >
            {editing ? "Done Editing" : "Edit"}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 shadow-md shadow-orange-500/20"
          >
            {downloading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating...
              </>
            ) : (
              "Download PDF"
            )}
          </button>
        </div>
      </div>

      {/* Document */}
      <div
        id="proposal-doc"
        className="max-w-4xl mx-auto bg-white shadow-2xl shadow-slate-900/10 rounded-2xl overflow-hidden font-sans"
      >
        {/* Dark header */}
        <div className="bg-[#0f172a] px-8 py-7 flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-orange-500/30">
                R
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight">{data.company.name}</p>
                <p className="text-slate-500 text-xs">{data.company.license}</p>
              </div>
            </div>
            <div className="text-slate-400 text-sm space-y-0.5">
              <p>{data.company.phone}</p>
              <p>{data.company.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-orange-400 font-bold text-xs uppercase tracking-widest mb-1">Roofing Proposal</p>
            <p className="text-white text-3xl font-black">#{data.proposalNumber}</p>
            <div className="mt-3 text-slate-400 text-xs space-y-1">
              <p>Issued: <span className="text-slate-300">{data.issuedDate}</span></p>
              <p>Valid until: <span className="text-orange-400 font-semibold">{data.validUntil}</span></p>
            </div>
          </div>
        </div>

        {/* Client + Job summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-slate-100">
          <div className="px-8 py-6 border-r border-slate-100">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Prepared For</p>
            <p className="text-slate-900 font-bold text-lg leading-tight">{data.client.name}</p>
            <p className="text-slate-500 text-sm mt-1">{data.client.address}</p>
            {data.client.city && <p className="text-slate-500 text-sm">{data.client.city}</p>}
          </div>
          <div className="px-8 py-6 bg-slate-50/50">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Job Summary</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <span className="text-slate-400">Roof area</span>
              <span className="text-slate-800 font-semibold">{data.job.squareFootage.toLocaleString()} sq ft</span>
              <span className="text-slate-400">Pitch</span>
              <span className="text-slate-800 font-semibold">{data.job.pitch}</span>
              <span className="text-slate-400">Stories</span>
              <span className="text-slate-800 font-semibold">{data.job.stories}</span>
              <span className="text-slate-400">Existing layers</span>
              <span className="text-slate-800 font-semibold">{data.job.existingLayers}</span>
              <span className="text-slate-400">Timeline</span>
              <span className="text-slate-800 font-semibold">{data.job.timeline}</span>
              <span className="text-slate-400">Est. start</span>
              <span className="text-slate-800 font-semibold">{data.job.startDate}</span>
            </div>
          </div>
        </div>

        {/* Google Solar verification card — dark */}
        {data.solarVerification && (
          <div className="mx-8 mt-6 bg-[#0f172a] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-orange-400 text-sm">☀</span>
                <span className="text-orange-400 font-bold text-xs uppercase tracking-widest">Roof Verified by Google Solar API</span>
              </div>
              <span className="text-slate-500 text-xs">Imagery: {data.solarVerification.imageryDate}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { val: data.solarVerification.totalRoofAreaFt2.toLocaleString(), label: "Roof sq ft" },
                { val: data.solarVerification.dominantPitch, label: "Dominant pitch" },
                { val: data.solarVerification.facets, label: "Roof segments" },
                { val: data.solarVerification.maxSunshineHoursPerYear.toLocaleString(), label: "Sunshine hrs/yr" },
              ].map(({ val, label }) => (
                <div key={label} className="bg-slate-800 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-white">{val}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.solarVerification.segments.map((seg, i) => {
                const dirs = ["N","NE","E","SE","S","SW","W","NW"];
                const dir = dirs[Math.round(seg.azimuthDegrees / 45) % 8];
                return (
                  <span key={i} className="bg-slate-800 border border-slate-700 text-xs text-slate-300 px-2.5 py-1.5 rounded-lg">
                    {seg.areaFt2.toLocaleString()} ft² · {seg.pitchDegrees.toFixed(1)}° · {dir}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Isometric roof visualization */}
        {data.solarVerification && (
          <RoofVisualization
            segments={data.solarVerification.segments}
            stories={parseInt(data.job.stories) || 2}
          />
        )}

        {/* Material callout — clean */}
        <div className="mx-8 my-5 flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4">
          <div className="w-9 h-9 bg-[#0f172a] rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Selected Material</p>
            <p className="text-slate-900 font-bold text-sm">{data.job.material}</p>
          </div>
        </div>

        {/* Line Items */}
        <div className="px-8 pb-2">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Cost Breakdown</p>
          <div className="rounded-2xl border border-slate-100 overflow-hidden">
            {grouped.map(({ cat, rows }, gi) => (
              <div key={cat}>
                {/* Category header row — dark */}
                <div className={`flex items-center gap-3 px-5 py-2.5 ${gi > 0 ? "border-t border-slate-700" : ""} bg-[#0f172a]`}>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">{cat}</span>
                </div>
                <table className="w-full text-left">
                  <tbody>
                    {rows.map((item) => (
                      <tr key={item.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-5 text-sm text-slate-700 w-full">
                          {editing ? (
                            <input
                              className="w-full bg-transparent border-b border-orange-300 focus:outline-none text-sm"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, "description", e.target.value)}
                            />
                          ) : (
                            item.description
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-400 whitespace-nowrap text-right">
                          {editing ? (
                            <input
                              type="number"
                              className="w-16 bg-transparent border-b border-orange-300 focus:outline-none text-right text-sm"
                              value={item.qty}
                              onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                            />
                          ) : (
                            item.qty.toLocaleString()
                          )}{" "}
                          {item.unit}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-400 whitespace-nowrap text-right">
                          {editing ? (
                            <>
                              $
                              <input
                                type="number"
                                step="0.01"
                                className="w-16 bg-transparent border-b border-orange-300 focus:outline-none text-right text-sm"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                              />
                            </>
                          ) : (
                            `$${fmt(item.unitPrice)}`
                          )}
                          /unit
                        </td>
                        <td className="py-3 px-5 text-sm font-bold text-slate-900 whitespace-nowrap text-right">
                          ${fmt(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            {rest.map((item) => (
              <div key={item.id} className="flex justify-between text-sm border-t border-slate-100 py-3 px-5">
                <span className="text-slate-700">{item.description}</span>
                <span className="font-bold text-slate-900">${fmt(item.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end px-8 py-6">
          <div className="w-72 space-y-2.5">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Subtotal</span>
              <span className="text-slate-600">${fmt(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span className="flex items-center gap-1">
                  Discount
                  {editing && (
                    <input
                      type="number"
                      min={0}
                      className="w-16 border-b border-emerald-400 bg-transparent text-right focus:outline-none text-sm ml-1"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                  )}
                </span>
                <span>-${fmt(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t-2 border-[#0f172a]">
              <span className="font-black text-slate-900 text-base">Total</span>
              <span className="font-black text-orange-500 text-3xl">${fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* Scope of Work */}
        <div className="mx-8 mb-6 bg-slate-50 rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Scope of Work</p>
          {editing ? (
            <textarea
              className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 resize-none transition-colors"
              rows={5}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
            />
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed">{scope}</p>
          )}
        </div>

        {/* Warranties — dark slate cards */}
        <div className="mx-8 mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Warranties Included</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.warranties.map((w) => (
              <div key={w.label} className="bg-[#0f172a] rounded-2xl p-4">
                <p className="text-xs font-bold text-orange-400 uppercase tracking-wide mb-1.5">{w.label}</p>
                <p className="text-sm text-slate-300 leading-snug">{w.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Terms — clean, no card */}
        <div className="mx-8 mb-6 border-t border-slate-100 pt-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Payment Terms</p>
          <p className="text-sm text-slate-600">{data.paymentTerms}</p>
        </div>

        {/* Notes — dark card */}
        {data.notes && (
          <div className="mx-8 mb-6 bg-[#0f172a] rounded-2xl px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Important Notes</p>
            <p className="text-sm text-slate-300 leading-relaxed">{data.notes}</p>
          </div>
        )}

        {/* Signature area */}
        <div className="mx-8 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Authorized By</p>
            <div className="border-b-2 border-slate-200 h-10 mb-2" />
            <p className="text-xs text-slate-400">{data.company.name} — Contractor</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Accepted By</p>
            <div className="border-b-2 border-slate-200 h-10 mb-2" />
            <p className="text-xs text-slate-400">{data.client.name} — Date</p>
          </div>
        </div>

        {/* Dark footer */}
        <div className="bg-[#0f172a] px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-slate-500 text-xs">
            This proposal is valid for 30 days from issue date. Prices subject to change after expiration.
          </p>
          <p className="text-slate-600 text-xs">#{data.proposalNumber}</p>
        </div>
      </div>
    </div>
  );
}
