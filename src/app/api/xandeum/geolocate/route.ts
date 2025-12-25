import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface GeoResult {
  ip: string;
  lat: number;
  lon: number;
  city?: string;
  country?: string;
  countryCode?: string;
}

const IP_V4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

function isValidIpv4(ip: string): boolean {
  if (!IP_V4_REGEX.test(ip)) return false;
  const parts = ip.split(".").map((n) => Number(n));
  return parts.length === 4 && parts.every((n) => Number.isFinite(n) && n >= 0 && n <= 255);
}

const normalizeCountryCode = (code?: string) =>
  (code || "").trim().toUpperCase() || undefined;

const normalizeCountryName = (name?: string, code?: string) => {
  const trimmed = (name || "").trim();
  const cc = normalizeCountryCode(code);

  // Keep UI-friendly names consistent
  if (cc === "US" && (!trimmed || trimmed === "United States")) return "USA";
  if (cc === "GB" && (!trimmed || trimmed === "United Kingdom")) return "United Kingdom";

  return trimmed || undefined;
};

async function fetchJsonWithTimeout(url: string, timeoutMs: number, headers?: Record<string, string>) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      headers,
      cache: "no-store",
      signal: controller.signal,
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function geolocateViaIpapi(ip: string): Promise<GeoResult | null> {
  const data = await fetchJsonWithTimeout(`https://ipapi.co/${ip}/json/`, 5000, {
    "User-Agent": "Stakeit/1.0 (xandeum-geolocate)",
  });
  if (!data) return null;

  const lat =
    typeof data.latitude === "number"
      ? data.latitude
      : typeof data.latitude === "string"
        ? Number(data.latitude)
        : undefined;
  const lon =
    typeof data.longitude === "number"
      ? data.longitude
      : typeof data.longitude === "string"
        ? Number(data.longitude)
        : undefined;

  if (lat === undefined || lon === undefined || Number.isNaN(lat) || Number.isNaN(lon)) return null;

  const countryCode = normalizeCountryCode(data.country_code);
  const country = normalizeCountryName(data.country_name, countryCode);

  return {
    ip,
    lat,
    lon,
    city: typeof data.city === "string" ? data.city : undefined,
    country,
    countryCode,
  };
}

async function geolocateViaIpwhois(ip: string): Promise<GeoResult | null> {
  // Fallback provider (free, HTTPS)
  const data = await fetchJsonWithTimeout(`https://ipwho.is/${ip}`, 5000);
  if (!data || data.success === false) return null;

  const lat = typeof data.latitude === "number" ? data.latitude : undefined;
  const lon = typeof data.longitude === "number" ? data.longitude : undefined;
  if (lat === undefined || lon === undefined) return null;

  const countryCode = normalizeCountryCode(data.country_code);
  const country = normalizeCountryName(data.country, countryCode);

  return {
    ip,
    lat,
    lon,
    city: typeof data.city === "string" ? data.city : undefined,
    country,
    countryCode,
  };
}

async function fetchOne(ip: string): Promise<GeoResult | null> {
  if (!isValidIpv4(ip)) return null;

  // Try primary then fallback
  return (await geolocateViaIpapi(ip)) ?? (await geolocateViaIpwhois(ip));
}

async function handleGeolocate(ips: string[]) {
  const uniqueIps = Array.from(new Set((ips || []).filter((v) => typeof v === "string")));

  if (uniqueIps.length === 0) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  // Basic concurrency limiter to avoid hammering providers
  const concurrency = 15;
  const results: GeoResult[] = [];

  for (let i = 0; i < uniqueIps.length; i += concurrency) {
    const chunk = uniqueIps.slice(i, i + concurrency);
    const settled = await Promise.allSettled(chunk.map(fetchOne));
    for (const s of settled) {
      if (s.status === "fulfilled" && s.value) results.push(s.value);
    }
  }

  return NextResponse.json({ results }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const ips: string[] = Array.isArray(body?.ips) ? body.ips : [];
    return await handleGeolocate(ips);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Geolocation failed";
    // IMPORTANT: return 200 so upstream callers can continue without hard-failing
    return NextResponse.json({ error: message, results: [] }, { status: 200 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // support: ?ips=1.1.1.1,8.8.8.8 OR repeated ?ips=...
    const ipsParam = searchParams.getAll("ips");
    const ips = ipsParam
      .flatMap((v) => v.split(","))
      .map((v) => v.trim())
      .filter(Boolean);

    return await handleGeolocate(ips);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Geolocation failed";
    return NextResponse.json({ error: message, results: [] }, { status: 200 });
  }
}
