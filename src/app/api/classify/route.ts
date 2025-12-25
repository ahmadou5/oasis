import { NextResponse } from "next/server";
import { getEnhancedSmartRoute } from "@/lib/solana/smartRouter";

export const dynamic = "force-dynamic";

/**
 * API endpoint for account classification and smart routing
 * Usage: GET /api/classify?address=<ADDRESS>&network=<NETWORK>
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address")?.trim();
    const network = (searchParams.get("network") || "mainnet-beta") as
      | "mainnet-beta"
      | "testnet"
      | "devnet";

    if (!address) {
      return NextResponse.json(
        { error: "Missing address parameter" },
        { status: 400 }
      );
    }

    const result = await getEnhancedSmartRoute({ address, network });
    return NextResponse.json(result);
  } catch (error: any) {
    const details = String(error?.message || error);
    console.error("Error in /api/classify:", details);
    
    return NextResponse.json(
      {
        error: "Classification failed",
        details,
        hint: "This usually means the RPC endpoint is unreachable or the address is invalid."
      },
      { status: 500 }
    );
  }
}