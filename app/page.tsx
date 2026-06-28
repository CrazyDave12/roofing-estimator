"use client";

import { useState } from "react";
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <span className="font-bold text-gray-900 text-lg">RoofEstimate AI</span>
          </div>
          <span className="text-xs text-gray-400 hidden sm:block">Professional estimates in seconds</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">New Estimate</h2>
            <p className="text-gray-500 text-sm mt-1">
              Fill in the job details and get a full itemized proposal in seconds.
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <EstimateForm onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>
      </main>
    </div>
  );
}
