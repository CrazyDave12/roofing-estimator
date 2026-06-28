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

const CATEGORY_ICONS: Record<string, string> = {
  "Tear-Off & Disposal": "🏚️",
  "Decking": "🪵",
  "Underlayment & Ice Shield": "🛡️",
  "Materials": "🏗️",
  "Labor": "👷",
  "Flashing & Penetrations": "🔩",
  "Permit & Fees": "📋",
  "Extras": "➕",
};

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
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      {/* Top action bar */}
      <div className="max-w-4xl mx-auto mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800">
              ← New Estimate
            </button>
          )}
          {isDemo && (
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
              DEMO — Sample Proposal
            </span>
          )}
          <span className="text-slate-500 text-sm">Proposal #{data.proposalNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing((e) => !e)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              editing
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-700 border-slate-300 hover:border-slate-500"
            }`}
          >
            {editing ? "✓ Done Editing" : "✏️ Edit"}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm"
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
              "⬇ Download PDF"
            )}
          </button>
        </div>
      </div>

      {/* Document */}
      <div
        id="proposal-doc"
        className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="bg-slate-900 px-8 py-7 flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white text-xl font-black">
                R
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight">{data.company.name}</p>
                <p className="text-slate-400 text-xs">{data.company.license}</p>
              </div>
            </div>
            <div className="text-slate-400 text-sm space-y-0.5">
              <p>{data.company.phone}</p>
              <p>{data.company.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-orange-400 font-bold text-xs uppercase tracking-widest mb-1">Roofing Proposal</p>
            <p className="text-white text-2xl font-black">#{data.proposalNumber}</p>
            <div className="mt-3 text-slate-400 text-xs space-y-1">
              <p>Issued: <span className="text-slate-300">{data.issuedDate}</span></p>
              <p>Valid until: <span className="text-orange-400 font-semibold">{data.validUntil}</span></p>
            </div>
          </div>
        </div>

        {/* Client + Job summary strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-slate-100">
          <div className="px-8 py-5 border-r border-slate-100">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Prepared For</p>
            <p className="text-slate-900 font-bold text-lg">{data.client.name}</p>
            <p className="text-slate-600 text-sm">{data.client.address}</p>
            <p className="text-slate-600 text-sm">{data.client.city}</p>
          </div>
          <div className="px-8 py-5 bg-slate-50">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Job Summary</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-slate-500">Roof area</span>
              <span className="text-slate-800 font-medium">{data.job.squareFootage.toLocaleString()} sq ft</span>
              <span className="text-slate-500">Pitch</span>
              <span className="text-slate-800 font-medium">{data.job.pitch}</span>
              <span className="text-slate-500">Stories</span>
              <span className="text-slate-800 font-medium">{data.job.stories}</span>
              <span className="text-slate-500">Existing layers</span>
              <span className="text-slate-800 font-medium">{data.job.existingLayers}</span>
              <span className="text-slate-500">Timeline</span>
              <span className="text-slate-800 font-medium">{data.job.timeline}</span>
              <span className="text-slate-500">Est. start</span>
              <span className="text-slate-800 font-medium">{data.job.startDate}</span>
            </div>
          </div>
        </div>

        {/* Google Solar verification card */}
        {data.solarVerification && (
          <div className="mx-8 mt-5 bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-blue-700 font-bold text-xs uppercase tracking-widest">☀️ Roof Data — Verified by Google Solar API</span>
              <span className="ml-auto text-blue-400 text-xs">Imagery: {data.solarVerification.imageryDate}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
                <p className="text-lg font-black text-blue-700">{data.solarVerification.totalRoofAreaFt2.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Roof sq ft (sloped)</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
                <p className="text-lg font-black text-blue-700">{data.solarVerification.dominantPitch}</p>
                <p className="text-xs text-gray-500">Dominant pitch</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
                <p className="text-lg font-black text-blue-700">{data.solarVerification.facets}</p>
                <p className="text-xs text-gray-500">Roof segments</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
                <p className="text-lg font-black text-blue-700">{data.solarVerification.maxSunshineHoursPerYear.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Sunshine hrs/yr</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.solarVerification.segments.map((seg, i) => {
                const dirs = ["N","NE","E","SE","S","SW","W","NW"];
                const dir = dirs[Math.round(seg.azimuthDegrees / 45) % 8];
                return (
                  <span key={i} className="bg-white border border-blue-100 text-xs text-gray-600 px-2 py-1 rounded-md">
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

        {/* Material callout */}
        <div className="mx-8 my-5 bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="text-2xl">🏗️</span>
          <div>
            <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">Selected Material</p>
            <p className="text-slate-800 font-semibold text-sm">{data.job.material}</p>
          </div>
        </div>

        {/* Line Items */}
        <div className="px-8 pb-2">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Cost Breakdown</p>
          <div className="space-y-4">
            {grouped.map(({ cat, rows }) => (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{CATEGORY_ICONS[cat] ?? "•"}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{cat}</span>
                </div>
                <div className="rounded-xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-left">
                    <tbody>
                      {rows.map((item, idx) => (
                        <tr
                          key={item.id}
                          className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"} group`}
                        >
                          <td className="py-2.5 px-4 text-sm text-slate-700 w-full">
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
                          <td className="py-2.5 px-3 text-sm text-slate-500 whitespace-nowrap text-right">
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
                          <td className="py-2.5 px-3 text-sm text-slate-500 whitespace-nowrap text-right">
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
                          <td className="py-2.5 px-4 text-sm font-bold text-slate-800 whitespace-nowrap text-right">
                            ${fmt(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {rest.map((item) => (
              <div key={item.id} className="flex justify-between text-sm border-b border-slate-100 py-2 px-1">
                <span className="text-slate-700">{item.description}</span>
                <span className="font-bold text-slate-800">${fmt(item.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end px-8 py-6">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span>${fmt(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>
                  Discount{" "}
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
            <div className="flex justify-between items-center pt-3 border-t-2 border-slate-900">
              <span className="font-black text-slate-900 text-lg">Total</span>
              <span className="font-black text-slate-900 text-2xl">${fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* Scope of Work */}
        <div className="mx-8 mb-6 bg-slate-50 rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Scope of Work</p>
          {editing ? (
            <textarea
              className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              rows={5}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
            />
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed">{scope}</p>
          )}
        </div>

        {/* Warranties */}
        <div className="mx-8 mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Warranties Included</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.warranties.map((w) => (
              <div key={w.label} className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-xs font-bold text-emerald-700 mb-1">{w.label}</p>
                <p className="text-sm text-slate-700">{w.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Terms */}
        <div className="mx-8 mb-6 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">Payment Terms</p>
          <p className="text-sm text-slate-700">{data.paymentTerms}</p>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="mx-8 mb-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">Important Notes</p>
            <p className="text-sm text-slate-700">{data.notes}</p>
          </div>
        )}

        {/* Signature area */}
        <div className="mx-8 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Authorized By</p>
            <div className="border-b-2 border-slate-300 h-10 mb-1" />
            <p className="text-xs text-slate-400">{data.company.name} — Contractor</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Accepted By</p>
            <div className="border-b-2 border-slate-300 h-10 mb-1" />
            <p className="text-xs text-slate-400">{data.client.name} — Date</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-slate-400 text-xs">
            This proposal is valid for 30 days from issue date. Prices subject to change after expiration.
          </p>
          <p className="text-slate-500 text-xs">{data.proposalNumber}</p>
        </div>
      </div>
    </div>
  );
}
