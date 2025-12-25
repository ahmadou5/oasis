import { NextResponse } from "next/server";
import { explorerSearch } from "@/lib/solana/explorerSearch";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const network = (searchParams.get("network") || "mainnet-beta") as
      | "mainnet-beta"
      | "testnet"
      | "devnet";

    if (!q) {
      return NextResponse.json(
        { error: "Missing query parameter 'q'" },
        { status: 400 }
      );
    }

    const result = await explorerSearch({ q, network });
    return NextResponse.json(result);
  } catch (error: any) {
    const details = String(error?.message || error);
    console.error("Error in /api/search:", details);
    return NextResponse.json(
      {
        error: "Search failed",
        details,
        hint:
          "This usually means the configured Solana RPC endpoint is unreachable/invalid. Check NEXT_PUBLIC_SOLANA_RPC_ENDPOINT(_MAINNET) and ensure it is an https:// URL.",
      },
      { status: 500 }
    );
  }
}
