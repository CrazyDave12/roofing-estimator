import { NextRequest, NextResponse } from "next/server";
import { EstimateFormData } from "@/types/estimate";

// WEBHOOK_URL: swap this for the real webhook once you have it.
// Falls back to the built-in simulation route when not set.
const WEBHOOK_URL = process.env.WEBHOOK_URL;

export async function POST(req: NextRequest) {
  try {
    const form = (await req.json()) as EstimateFormData;

    if (!form.address || !form.squareFootage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const target = WEBHOOK_URL ?? new URL("/api/webhook-sim", req.url).toString();

    const upstream = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error("Webhook error:", text);
      return NextResponse.json({ error: "Webhook failed to generate proposal" }, { status: 502 });
    }

    const proposal = await upstream.json();
    return NextResponse.json(proposal);
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Failed to generate proposal" }, { status: 500 });
  }
}
