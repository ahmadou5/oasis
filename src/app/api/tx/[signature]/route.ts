import { NextResponse } from "next/server";
import { fetchTxDetails } from "@/lib/solana/txDetails";

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

    const data = await fetchTxDetails({ signature, network });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in /api/tx/[signature]:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch transaction", details: error?.message },
      { status: 500 }
    );
  }
}
