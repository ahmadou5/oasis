import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/config/env";
import { NodeLocation } from "@/types";

// Types for API responses
interface PNodeAPIResponse {
  success: boolean;
  data?: XandeumNodeWithMetrics[];
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    count: number;
    timestamp: string;
    cacheHit?: boolean;
    totalNodes?: number;
    onlineNodes?: number;
    avgUptime?: number;
  };
}

interface XandeumNode {
  address: string;
  is_public: boolean;
  last_seen_timestamp: number;
  pubkey: string;
  rpc_port: number;
  storage_committed: number;
  storage_usage_percent: number;
  storage_used: number;
  uptime: number;
  version: string;
}

interface XandeumNodeWithMetrics extends XandeumNode {
  isOnline: boolean;
  lastSeenDate: string;
  storageUtilization: string;
  uptimeHours: number;
  uptimeDays: number;
  storageCapacityGB: number;
  storageUsedMB: number;
  versionDisplayName: string;
  healthScore: number;
  location?: NodeLocation;
}

interface QueryParams {
  limit?: number;
  offset?: number;
  status?: "active" | "inactive" | "all";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Simple in-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
}

interface GeolocationCacheEntry {
  location: NodeLocation;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const geolocationCache = new Map<string, GeolocationCacheEntry>();

// Geolocation cache TTL: 24 hours (longer than regular cache)
const GEO_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Error types
enum PNodeErrorCode {
  CONNECTION_FAILED = "CONNECTION_FAILED",
  TIMEOUT = "TIMEOUT",
  INVALID_RESPONSE = "INVALID_RESPONSE",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

// Validation helper
function validateQueryParams(searchParams: URLSearchParams): QueryParams {
  const params: QueryParams = {};

  // Validate limit (default: 100, max: 1000)
  const limit = searchParams.get("limit");
  if (limit) {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      throw new Error("Limit must be a number between 1 and 1000");
    }
    params.limit = limitNum;
  }

  // Validate offset
  const offset = searchParams.get("offset");
  if (offset) {
    const offsetNum = parseInt(offset, 10);
    if (isNaN(offsetNum) || offsetNum < 0) {
      throw new Error("Offset must be a non-negative number");
    }
    params.offset = offsetNum;
  }

  // Validate status
  const status = searchParams.get('status');
  if (status && !['online', 'offline', 'public', 'private', 'all'].includes(status)) {
    throw new Error('Status must be one of: online, offline, public, private, all');
  }
  params.status = status as 'active' | 'inactive' | 'all';

  // Validate sortBy and sortOrder
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");

  if (sortBy) {
    const validSortFields = [
      'address', 'pubkey', 'uptime', 'storage_usage_percent', 
      'storage_used', 'storage_committed', 'last_seen_timestamp', 
      'version', 'rpc_port', 'is_public'
    ];
    if (!validSortFields.includes(sortBy)) {
      throw new Error(`SortBy must be one of: ${validSortFields.join(', ')}`);
    }
    params.sortBy = sortBy;
  }

  if (sortOrder && !["asc", "desc"].includes(sortOrder)) {
    throw new Error('SortOrder must be either "asc" or "desc"');
  }
  params.sortOrder = sortOrder as "asc" | "desc";

  return params;
}

// Geolocation cache helpers
function getCachedGeolocation(ip: string): NodeLocation | null {
  const entry = geolocationCache.get(ip);
  if (!entry) return null;
  
  const isExpired = Date.now() - entry.timestamp > GEO_CACHE_TTL_MS;
  if (isExpired) {
    geolocationCache.delete(ip);
    return null;
  }
  
  return entry.location;
}

function setCachedGeolocation(ip: string, location: NodeLocation): void {
  geolocationCache.set(ip, {
    location,
    timestamp: Date.now(),
  });
}

// Helper to create standardized NodeLocation object
function createNodeLocation(lat: number, lon: number, city?: string, country?: string, countryCode?: string): NodeLocation {
  return {
    latitude: lat,
    longitude: lon,
    city,
    country,
    countryCode,
    // Helper properties for different component formats
    coordinates: [lon, lat], // [longitude, latitude] for maps
    lat: lat, // alias for latitude
    lng: lon, // alias for longitude
  };
}

// Geolocation helper with caching
async function fetchGeolocationData(ips: string[], request?: NextRequest): Promise<Map<string, NodeLocation>> {
  if (ips.length === 0) return new Map();
  
  const locationMap = new Map<string, NodeLocation>();
  const uncachedIps: string[] = [];
  
  // Check cache first
  ips.forEach(ip => {
    const cached = getCachedGeolocation(ip);
    if (cached) {
      locationMap.set(ip, cached);
    } else {
      uncachedIps.push(ip);
    }
  });
  
  // Fetch uncached IPs
  if (uncachedIps.length === 0) {
    console.log(`Geolocation: All ${ips.length} IPs served from cache`);
    return locationMap;
  }
  
  console.log(`Geolocation: ${locationMap.size} from cache, fetching ${uncachedIps.length} IPs`);
  
  try {
    // Get the base URL from the request
    let baseUrl = '';
    if (request) {
      const url = new URL(request.url);
      baseUrl = `${url.protocol}//${url.host}`;
    } else {
      // Fallback for development
      baseUrl = 'http://localhost:3002';
    }
    
    const response = await fetch(`${baseUrl}/api/xendium/geolocate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ips: uncachedIps }),
    });
    
    if (!response.ok) {
      console.error('Geolocation fetch failed:', response.status);
      return locationMap;
    }
    
    const data = await response.json();
    
    if (data.results && Array.isArray(data.results)) {
      data.results.forEach((result: any) => {
        const location = createNodeLocation(
          result.lat,
          result.lon,
          result.city,
          result.country,
          result.countryCode
        );
        
        locationMap.set(result.ip, location);
        setCachedGeolocation(result.ip, location);
      });
    }
    
    return locationMap;
  } catch (error) {
    console.error('Error fetching geolocation data:', error);
    return locationMap;
  }
}

// Helper to extract IP from node address
function extractIpFromAddress(address: string): string | null {
  // Handle various address formats like "ip:port" or just "ip"
  try {
    const parts = address.split(':');
    const ip = parts[0];
    
    // Basic IP validation (IPv4)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(ip)) {
      const octets = ip.split('.').map(Number);
      if (octets.every(octet => octet >= 0 && octet <= 255)) {
        return ip;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

// Cache helper
function getCachedData(key: string): any | null {
  if (!ENV.FEATURES.ENABLE_XENDIUM_CACHE) return null;

  const entry = cache.get(key);
  if (!entry) return null;

  const isExpired =
    Date.now() - entry.timestamp > ENV.XENDIUM.CACHE_TTL_SECONDS * 1000;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCachedData(key: string, data: any): void {
  if (!ENV.FEATURES.ENABLE_XENDIUM_CACHE) return;

  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

// Retry helper
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = ENV.XENDIUM.MAX_RETRIES,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, attempt - 1))
      );
    }
  }
  throw new Error("Maximum retries exceeded");
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let cacheHit = false;

  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    let queryParams: QueryParams;

    try {
      queryParams = validateQueryParams(searchParams);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: PNodeErrorCode.VALIDATION_ERROR,
            message:
              validationError instanceof Error
                ? validationError.message
                : "Invalid parameters",
          },
        } as PNodeAPIResponse,
        { status: 400 }
      );
    }

    // Generate cache key
    const cacheKey = `pnodes:${JSON.stringify(queryParams)}`;

    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      cacheHit = true;
      console.log("Cache hit for PNodes data");
      return NextResponse.json({
        success: true,
        data: cachedData,
        metadata: {
          count: cachedData.length,
          timestamp: new Date().toISOString(),
          cacheHit: true,
        },
      } as PNodeAPIResponse);
    }

    // Fetch fresh data with retry mechanism
    const pods = await withRetry(async () => {
      const { PrpcClient } = await import("xandeum-prpc");
      const client = new PrpcClient(ENV.XENDIUM.PRPC_HOST);

      // Set timeout for the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Request timeout")),
          ENV.XENDIUM.TIMEOUT_MS
        );
      });

      const dataPromise = client.getPodsWithStats();

      return await Promise.race([dataPromise, timeoutPromise]);
    });

    if (!pods || !(pods as any).pods || !Array.isArray((pods as any).pods)) {
      throw new Error("Invalid response structure from Xendium service");
    }

    // Extract unique IP addresses from node addresses
    const rawNodes = (pods as any).pods as XandeumNode[];
    const nodeIps: string[] = [];
    const ipToNodeMap = new Map<string, XandeumNode[]>();
    
    rawNodes.forEach(node => {
      const ip = extractIpFromAddress(node.address);
      if (ip) {
        if (!nodeIps.includes(ip)) {
          nodeIps.push(ip);
        }
        if (!ipToNodeMap.has(ip)) {
          ipToNodeMap.set(ip, []);
        }
        ipToNodeMap.get(ip)!.push(node);
      }
    });

    // Fetch geolocation data for all unique IPs
    const locationMap = await fetchGeolocationData(nodeIps, request);

    // Process and enhance the raw data with computed metrics and location
    const enhancedData: XandeumNodeWithMetrics[] = rawNodes.map((node: XandeumNode) => {
      const now = Date.now();
      const lastSeenMs = node.last_seen_timestamp * 1000;
      const isOnline = (now - lastSeenMs) < 300000; // Online if seen within 5 minutes
      
      // Get location data for this node's IP
      const ip = extractIpFromAddress(node.address);
      const location = ip ? locationMap.get(ip) : undefined;
      
      return {
        ...node,
        isOnline,
        lastSeenDate: new Date(lastSeenMs).toISOString(),
        storageUtilization: `${(node.storage_usage_percent * 100).toFixed(2)}%`,
        uptimeHours: Math.floor(node.uptime / 3600),
        uptimeDays: Math.floor(node.uptime / 86400),
        storageCapacityGB: Math.round(node.storage_committed / (1024 * 1024 * 1024) * 100) / 100,
        storageUsedMB: Math.round(node.storage_used / (1024 * 1024) * 100) / 100,
        versionDisplayName: node.version.replace(/^0\.8\.0-trynet\./, 'v').substring(0, 20),
        healthScore: Math.min(100, Math.round(
          (isOnline ? 30 : 0) + // Online bonus
          (node.is_public ? 10 : 0) + // Public node bonus  
          Math.min(40, node.uptime / 86400) + // Uptime score (max 40 points for 40+ days)
          Math.min(20, (1 - node.storage_usage_percent) * 20) // Storage availability (max 20 points)
        )),
        location
      };
    });

    let processedData = enhancedData;

    // Apply filtering based on query parameters
    if (queryParams.status && queryParams.status !== "all") {
      processedData = processedData.filter((node) => {
        switch (queryParams.status) {
          case 'active': return node.isOnline;
          default: return !node.isOnline;
        }
      });
    }

    // Apply sorting
    if (queryParams.sortBy) {
      const sortField = queryParams.sortBy;
      const sortOrder = queryParams.sortOrder || "desc";

      processedData.sort((a: any, b: any) => {
        const aValue = a[sortField] ?? 0;
        const bValue = b[sortField] ?? 0;

        if (typeof aValue === "string") {
          return sortOrder === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      });
    }

    // Apply pagination
    if (queryParams.offset || queryParams.limit) {
      const offset = queryParams.offset || 0;
      const limit = queryParams.limit || 100;
      processedData = processedData.slice(offset, offset + limit);
    }

    // Cache the processed data
    setCachedData(cacheKey, processedData);

    // Calculate aggregate statistics
    const totalNodes = enhancedData.length;
    const onlineNodes = enhancedData.filter(node => node.isOnline).length;
    const avgUptime = enhancedData.reduce((sum, node) => sum + node.uptimeDays, 0) / totalNodes;

    const processingTime = Date.now() - startTime;
    console.log(
      `PNodes data fetched successfully in ${processingTime}ms (cache: ${cacheHit})`
    );

    return NextResponse.json({
      success: true,
      data: processedData,
      metadata: {
        count: processedData.length,
        timestamp: new Date().toISOString(),
        cacheHit,
        totalNodes,
        onlineNodes,
        avgUptime: Math.round(avgUptime * 100) / 100,
      },
    } as PNodeAPIResponse);
  } catch (error) {
    const processingTime = Date.now() - startTime;

    // Determine error type and code
    let errorCode = PNodeErrorCode.INTERNAL_ERROR;
    let statusCode = 500;
    let errorMessage = "An unexpected error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;

      if (
        error.message.includes("timeout") ||
        error.message.includes("Request timeout")
      ) {
        errorCode = PNodeErrorCode.TIMEOUT;
        statusCode = 504;
      } else if (
        error.message.includes("connection") ||
        error.message.includes("ECONNREFUSED")
      ) {
        errorCode = PNodeErrorCode.CONNECTION_FAILED;
        statusCode = 503;
      } else if (error.message.includes("Invalid response")) {
        errorCode = PNodeErrorCode.INVALID_RESPONSE;
        statusCode = 502;
      }
    }

    console.error("PNodes API error:", {
      error: errorMessage,
      code: errorCode,
      processingTime,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          details: ENV.FEATURES.ENABLE_DEBUG
            ? {
                processingTime,
                timestamp: new Date().toISOString(),
              }
            : undefined,
        },
      } as PNodeAPIResponse,
      { status: statusCode }
    );
  }
}
