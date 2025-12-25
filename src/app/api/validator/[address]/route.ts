import { NextResponse } from "next/server";
import { getStakeWizValidatorByAddress } from "@/lib/services/stakewizValidators.service";

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

    const validator = await getStakeWizValidatorByAddress(address);

    if (!validator) {
      return NextResponse.json(
        { error: "Validator not found" },
        { status: 404 }
      );
    }

    // Keep the existing response wrapper used by older code paths
    return NextResponse.json({ response: validator });
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
