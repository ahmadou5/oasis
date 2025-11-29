import { buildSolanaBeachURL, ENV, getSolanaBeachHeaders } from "@/config/env";
import axios from "axios";
import { NextResponse } from "next/server";

interface SolanaBeachValidatorResponse {
  votePubkey: string;
  nodePubkey: string;
  commission: number;
  lastVote: number;
  delinquent: boolean;
  name: string;
  iconUrl: string;
  website: string;
  details: string;
  version: string;
  continent: string;
  country: string;
  region: string;
  city: string;
  asn: number;
  asnOrganization: string;
}

// NOTE: Based on your error log, your folder is likely named [address] (lowercase)
// So we should type params as { address: string }
export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    // Await params if you are on Next.js 15 (optional but good practice),
    // otherwise direct destructuring is fine in older versions.
    const { address } = params;

    // Validate that address exists before making the call
    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is missing" },
        { status: 400 }
      );
    }

    const response = await axios.get<SolanaBeachValidatorResponse>(
      buildSolanaBeachURL(ENV.SOLANA_BEACH.ENDPOINTS.VALIDATOR_DETAIL(address)),
      { headers: getSolanaBeachHeaders() }
    );

    return NextResponse.json({ response: response.data });
  } catch (error: any) {
    // 1. Log the error so you can see what went wrong in your terminal
    console.error("API Error:", error.message || error);

    // 2. THIS WAS MISSING: You must return a response even if it fails
    return NextResponse.json(
      { error: "Failed to fetch validator data", details: error.message },
      { status: 500 }
    );
  }
}
