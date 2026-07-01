"use client";

import { useState } from "react";
import Link from "next/link";
import EstimateForm from "@/components/EstimateForm";
import ProposalView from "@/components/ProposalView";
import { EstimateFormData } from "@/types/estimate";
import { ProposalData } from "@/types/proposal";

export default function Home() {
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(form: EstimateFormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to generate proposal.");
      const data = (await res.json()) as ProposalData;
      setProposal(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (proposal) {
    return <ProposalView data={proposal} onBack={() => setProposal(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      {/* Nav */}
      <header className="bg-[#0f172a] px-6 py-4 sticky top-0 z-20 border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg shadow-orange-500/30">
              R
            </div>
            <span className="font-bold text-white text-base tracking-tight">RoofEstimate AI</span>
          </div>
          <Link
            href="/demo"
            className="text-xs font-semibold text-slate-400 hover:text-orange-400 transition-colors flex items-center gap-1"
          >
            View Sample Proposal <span className="text-orange-500">→</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-[#0f172a] px-6 pt-14 pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            ☀ Google Solar Verified · AI-Powered
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.1] tracking-tight mb-5">
            Professional Roofing<br />
            Proposals in <span className="text-orange-500">30 Seconds</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Enter the job details, we pull satellite roof measurements, generate a full itemized estimate, and export a client-ready PDF.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            {[
              "Satellite-verified sq footage",
              "Full line-item breakdown",
              "Editable before download",
              "Instant PDF export",
            ].map((feat) => (
              <span key={feat} className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                {feat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form card floats up over hero */}
      <div className="max-w-2xl mx-auto px-4 -mt-12 pb-20">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-100 overflow-hidden">
          {/* Form header */}
          <div className="bg-slate-50 border-b border-slate-100 px-7 py-5 flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-900 text-xl tracking-tight">New Estimate</h2>
              <p className="text-slate-500 text-sm mt-0.5">Takes about 2 minutes · Results are instant</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              AI Ready
            </div>
          </div>

          <div className="p-7">
            <EstimateForm onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
