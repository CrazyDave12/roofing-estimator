import { NextRequest, NextResponse } from "next/server";
import { fetchSolarRoofData } from "@/lib/solar";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "Missing address param" }, { status: 400 });
  }

  try {
    const data = await fetchSolarRoofData(address);
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Solar lookup failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
