import { NextRequest, NextResponse } from "next/server";
import { generateEstimate } from "@/lib/claude";
import { EstimateFormData } from "@/types/estimate";

export async function POST(req: NextRequest) {
  try {
    const form = (await req.json()) as EstimateFormData;

    if (!form.address || !form.squareFootage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await generateEstimate(form);

    const subtotal = result.lineItems.reduce((sum, item) => sum + item.total, 0);

    return NextResponse.json({
      ...result,
      subtotal,
      discount: 0,
      discountType: "percent",
      total: subtotal,
      generatedAt: new Date().toISOString(),
      formData: form,
    });
  } catch (err) {
    console.error("Estimate generation error:", err);
    return NextResponse.json({ error: "Failed to generate estimate" }, { status: 500 });
  }
}
