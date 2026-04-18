import { NextResponse } from "next/server";
import { getContractsOverview } from "@/features/contracts/queries";

export async function GET() {
  return NextResponse.json(await getContractsOverview());
}
