import { NextResponse } from "next/server";
import { fetchStakeDetails } from "@/lib/solana/stakeDetails";

export const dynamic = "force-dynamic";

/**
 * API endpoint for stake account details
 * Usage: GET /api/stake/[address]?network=mainnet-beta
 */
export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const network = (searchParams.get("network") || "mainnet-beta") as
      | "mainnet-beta"
      | "testnet"
      | "devnet";

    const address = params.address;
    if (!address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }

    const data = await fetchStakeDetails({ address, network });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in /api/stake/[address]:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch stake details", details: error?.message },
      { status: 500 }
    );
  }
}