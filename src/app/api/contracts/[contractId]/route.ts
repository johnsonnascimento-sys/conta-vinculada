import { NextResponse } from "next/server";
import { getContractDetail } from "@/features/contracts/queries";

interface RouteProps {
  params: Promise<{ contractId: string }>;
}

export async function GET(_: Request, { params }: RouteProps) {
  const { contractId } = await params;
  const detail = await getContractDetail(contractId);

  if (!detail) {
    return NextResponse.json({ message: "Contrato não encontrado." }, { status: 404 });
  }

  return NextResponse.json(detail);
}
