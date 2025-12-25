import { NextResponse } from "next/server";
import { fetchAccountOverview } from "@/lib/solana/accountOverview";

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

    const data = await fetchAccountOverview({
      pubkey,
      network,
      txLimit: 25,
      stakeTxLimit: 25,
      maxStakeAccounts: 10,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(
      "Error in /api/explorer/account/[pubkey]:",
      error?.message || error
    );
    return NextResponse.json(
      { error: "Failed to fetch account overview", details: error?.message },
      { status: 500 }
    );
  }
}
