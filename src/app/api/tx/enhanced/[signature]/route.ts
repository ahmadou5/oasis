import { NextResponse } from "next/server";
import { fetchTransactionDetails } from "@/lib/solana/txDetailsParser";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { signature: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const network = (searchParams.get("network") || "mainnet-beta") as
      | "mainnet-beta"
      | "testnet"
      | "devnet";

    const signature = params.signature;
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const data = await fetchTransactionDetails({ signature, network });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in /api/tx/enhanced/[signature]:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch transaction", details: error?.message },
      { status: 500 }
    );
  }
}
