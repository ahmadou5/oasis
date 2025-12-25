import { NextResponse } from "next/server";
import { fetchAccountDetails } from "@/lib/solana/accountDetails";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { pubkey: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const network = (searchParams.get("network") || "mainnet-beta") as
      | "mainnet-beta"
      | "testnet"
      | "devnet";

    const pubkey = params.pubkey;
    if (!pubkey) {
      return NextResponse.json({ error: "Missing pubkey" }, { status: 400 });
    }

    const data = await fetchAccountDetails({ pubkey, network });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in /api/account/[pubkey]:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch account", details: error?.message },
      { status: 500 }
    );
  }
}
