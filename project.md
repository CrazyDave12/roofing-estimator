# RoofEstimate AI

## What It Is
A white-label roofing estimate tool for contractors. The roofer fills out a detailed job form (address, sq footage, pitch, material, condition, penetrations, etc.), sends it to the Claude AI API, and receives a fully itemized estimate in seconds. The roofer can then edit every line item, adjust the discount, rewrite the scope of work, and download a professional PDF to hand or email to the homeowner.

## Client
No specific client — white-label product David can resell/license to roofing contractors.

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Anthropic Claude API (claude-sonnet-4-6) — estimate generation
- jsPDF + html2canvas — client-side PDF export
- Deployed on Vercel, repo on GitHub

## File Structure
```
roofing-estimator/
├── app/
│   ├── page.tsx               ← Main page (form + estimate views)
│   └── api/generate/route.ts  ← POST: form → Claude → estimate JSON
├── components/
│   ├── EstimateForm.tsx        ← Detailed input form (11 sections)
│   ├── EstimateResult.tsx      ← Editable estimate + totals + PDF button
│   └── LineItem.tsx            ← Editable table row
├── lib/
│   ├── claude.ts              ← Anthropic SDK client + prompt builder
│   └── pdf.ts                 ← html2canvas → jsPDF download
├── types/
│   └── estimate.ts            ← All TypeScript interfaces
└── .env.local                 ← ANTHROPIC_API_KEY (not committed)
```

## Key Decisions
- Single-page app (form → estimate in one view) for speed — no routing needed
- Claude returns structured JSON; API route adds subtotal/total before returning to client
- PDF is generated client-side from the live DOM using html2canvas, so edits are always captured
- Line items grouped by category (Tear-Off, Decking, Materials, Labor, etc.) with inline editing
- Discount supports both % and flat $ modes

## Environment Variables
- `ANTHROPIC_API_KEY` — get from console.anthropic.com

## Links
- GitHub: https://github.com/CrazyDave12/roofing-estimator
- Vercel: https://roofing-estimator-fawn.vercel.app
