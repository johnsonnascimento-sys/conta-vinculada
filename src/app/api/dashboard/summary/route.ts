import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/features/dashboard/queries";

export async function GET() {
  return NextResponse.json(await getDashboardSummary());
}
