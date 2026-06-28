"use client";

import { useState, useCallback } from "react";
import { EstimateData, LineItem as LineItemType } from "@/types/estimate";
import LineItem from "./LineItem";
import { downloadEstimateAsPDF } from "@/lib/pdf";

interface Props {
  estimate: EstimateData;
  onBack: () => void;
}

const CATEGORIES = [
  "Tear-Off & Disposal",
  "Decking",
  "Underlayment & Ice Shield",
  "Materials",
  "Labor",
  "Flashing & Penetrations",
  "Extras",
  "Permit & Fees",
];

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function EstimateResult({ estimate, onBack }: Props) {
  const [items, setItems] = useState<LineItemType[]>(estimate.lineItems);
  const [scope, setScope] = useState(estimate.scopeOfWork);
  const [notes, setNotes] = useState(estimate.notes);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"percent" | "flat">("percent");
  const [downloading, setDownloading] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const discountAmount = discountType === "percent" ? subtotal * (discount / 100) : discount;
  const total = Math.max(0, subtotal - discountAmount);

  function updateItem(updated: LineItemType) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function addItem() {
    const newItem: LineItemType = {
      id: `custom-${Date.now()}`,
      category: "Extras",
      description: "New line item",
      qty: 1,
      unit: "ea",
      unitPrice: 0,
      total: 0,
    };
    setItems((prev) => [...prev, newItem]);
  }

  async function handleDownload() {
    setDownloading(true);
    await downloadEstimateAsPDF("pdf-target", `estimate-${estimate.formData.clientName.replace(/\s+/g, "-")}.pdf`);
    setDownloading(false);
  }

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    rows: items.filter((i) => i.category === cat),
  })).filter((g) => g.rows.length > 0);

  const uncategorized = items.filter((i) => !CATEGORIES.includes(i.category));

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
          ← New Estimate
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          {downloading ? "Generating PDF..." : "⬇ Download PDF"}
        </button>
      </div>

      {/* PDF Target — this is what gets captured */}
      <div
        id="pdf-target"
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6 font-sans"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Roofing Estimate</h1>
            <p className="text-gray-500 text-sm mt-1">
              Generated {new Date(estimate.generatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="text-right text-sm text-gray-700">
            <p className="font-semibold text-base">{estimate.formData.clientName}</p>
            <p>{estimate.formData.address}</p>
            <p className="mt-1 text-gray-500">Timeline: {estimate.timeline}</p>
          </div>
        </div>

        {/* Line Items */}
        <div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-2 px-2 w-36">Category</th>
                  <th className="py-2 px-2">Description</th>
                  <th className="py-2 px-2 text-right w-20">Qty</th>
                  <th className="py-2 px-2 w-16">Unit</th>
                  <th className="py-2 px-2 text-right w-24">Unit Price</th>
                  <th className="py-2 px-2 text-right w-24">Total</th>
                  <th className="py-2 px-1 w-8" />
                </tr>
              </thead>
              <tbody>
                {grouped.map((g) => (
                  <>
                    <tr key={g.category + "-header"} className="bg-orange-50">
                      <td colSpan={7} className="py-1 px-2 text-xs font-bold text-orange-700 uppercase tracking-wider">
                        {g.category}
                      </td>
                    </tr>
                    {g.rows.map((item) => (
                      <LineItem key={item.id} item={item} onChange={updateItem} onDelete={deleteItem} />
                    ))}
                  </>
                ))}
                {uncategorized.map((item) => (
                  <LineItem key={item.id} item={item} onChange={updateItem} onDelete={deleteItem} />
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addItem}
            className="mt-3 text-sm text-orange-500 hover:text-orange-700 font-medium flex items-center gap-1"
          >
            + Add Line Item
          </button>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${fmt(subtotal)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 flex-1">Discount</span>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "percent" | "flat")}
                className="border border-gray-300 rounded px-1 py-0.5 text-xs"
              >
                <option value="percent">%</option>
                <option value="flat">$</option>
              </select>
              <input
                type="number"
                min={0}
                step={discountType === "percent" ? 1 : 50}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-0.5 w-20 text-right text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${fmt(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-200 pt-2 mt-2">
              <span>Total</span>
              <span>${fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* Scope of Work */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">Scope of Work</h2>
          <textarea
            className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            rows={4}
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          />
        </div>

        {/* Notes */}
        {notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-1">Important Notes</h2>
            <textarea
              className="w-full text-sm text-amber-900 bg-transparent border-none focus:outline-none resize-none"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-xs text-gray-400 border-t border-gray-100 pt-4 text-center">
          This estimate is valid for 30 days. Prices subject to change based on final measurements and material costs.
        </div>
      </div>
    </div>
  );
}
