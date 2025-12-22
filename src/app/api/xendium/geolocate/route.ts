import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface GeoResult {
  ip: string;
  lat: number;
  lon: number;
  city?: string;
  country?: string;
  countryCode?: string;
}

interface IpApiResponse {
  status: string;
  query: string;
  lat?: number;
  lon?: number;
  city?: string;
  country?: string;
  countryCode?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ips: string[] = body.ips ?? [];

    if (ips.length === 0) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    // ip-api.com allows batch requests (up to 100)
    const batchSize = 100;
    const batches: string[][] = [];
    for (let i = 0; i < ips.length; i += batchSize) {
      batches.push(ips.slice(i, i + batchSize));
    }

    const allResults: GeoResult[] = [];

    for (const batch of batches) {
      const response = await fetch(
        "http://ip-api.com/batch?fields=status,query,lat,lon,city,country,countryCode",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(batch),
        }
      );

      if (!response.ok) {
        console.error("ip-api batch request failed:", response.status);
        continue;
      }

      const data: IpApiResponse[] = await response.json();
      for (const item of data) {
        if (
          item.status === "success" &&
          item.lat !== undefined &&
          item.lon !== undefined
        ) {
          allResults.push({
            ip: item.query,
            lat: item.lat,
            lon: item.lon,
            city: item.city,
            country: item.country,
            countryCode: item.countryCode,
          });
        }
      }
    }

    return NextResponse.json({ results: allResults }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Geolocation failed";
    return NextResponse.json({ error: message, results: [] }, { status: 500 });
  }
}
