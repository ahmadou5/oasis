import { Connection, PublicKey } from "@solana/web3.js";
import { getRPCEndpoint } from "@/config/env";

/**
 * SNS (Solana Name Service) Domain Resolution
 * Resolves .sol domains to addresses and vice versa
 */

// SNS Program ID
const SNS_PROGRAM_ID = new PublicKey("namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX");

// TLD (Top Level Domain) for .sol
const SOL_TLD_AUTHORITY = new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx");

// Name registry state offset
const HASH_PREFIX = "SPL Name Service";

interface SNSDomain {
  domain: string;
  address: string;
  owner?: string;
}

interface SNSResolveResult {
  domain?: string;
  address: string;
  hasDomain: boolean;
}

/**
 * Derive the name account public key from a domain name
 */
function getDomainKey(domain: string): PublicKey {
  // Remove .sol if present
  const cleanDomain = domain.replace(".sol", "");
  
  // Hash the domain name
  const hashedName = hashDomainName(cleanDomain);
  
  // Derive PDA
  const [nameAccount] = PublicKey.findProgramAddressSync(
    [hashedName, SOL_TLD_AUTHORITY.toBuffer()],
    SNS_PROGRAM_ID
  );
  
  return nameAccount;
}

/**
 * Hash domain name for SNS lookup
 */
function hashDomainName(domain: string): Buffer {
  const input = HASH_PREFIX + domain;
  const buffer = Buffer.from(input, "utf8");
  
  // Simple hash (in production, use proper SNS hashing)
  return buffer.slice(0, 32);
}

/**
 * Resolve a .sol domain to an address
 */
export async function resolveDomain(params: {
  domain: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
}): Promise<string | null> {
  const { domain, network = "mainnet-beta" } = params;
  
  try {
    const endpoint = getRPCEndpoint(network);
    const connection = new Connection(endpoint, { commitment: "confirmed" });
    
    // Get the domain account
    const domainKey = getDomainKey(domain);
    const accountInfo = await connection.getAccountInfo(domainKey);
    
    if (!accountInfo) {
      return null;
    }
    
    // Parse the owner from the account data
    // SNS stores the owner at offset 32
    const owner = new PublicKey(accountInfo.data.slice(32, 64));
    
    return owner.toBase58();
  } catch (error) {
    console.error("Error resolving domain:", error);
    return null;
  }
}

/**
 * Reverse lookup: Get domain(s) for an address
 * Note: This is a simplified version. Production should use SNS SDK or indexer.
 */
export async function reverseLookup(params: {
  address: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
}): Promise<string | null> {
  const { address, network = "mainnet-beta" } = params;
  
  try {
    // In production, use SNS SDK's getAllDomains or query an indexer
    // For now, we'll return null and recommend using the official SNS SDK
    
    // TODO: Implement proper reverse lookup using:
    // 1. SNS SDK: @bonfida/spl-name-service
    // 2. Or query from an indexer/API
    
    return null;
  } catch (error) {
    console.error("Error reverse lookup:", error);
    return null;
  }
}

/**
 * Get primary domain for an address using Bonfida API
 */
export async function getPrimaryDomain(params: {
  address: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
}): Promise<string | null> {
  const { address, network = "mainnet-beta" } = params;
  
  if (network !== "mainnet-beta") {
    return null; // Bonfida API only works on mainnet
  }
  
  try {
    // Use Bonfida's public API for reverse lookup
    const response = await fetch(
      `https://sns-sdk-proxy.bonfida.workers.dev/favorite-domain/${address}`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    // Check if we got a valid domain
    if (data && data.result && typeof data.result === "string") {
      // Filter out error messages
      if (data.result.includes("Invalid") || data.result.includes("Error")) {
        return null;
      }
      
      // Add .sol if not present
      const domain = data.result.endsWith(".sol") ? data.result : data.result + ".sol";
      return domain;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching primary domain:", error);
    return null;
  }
}

/**
 * Get all domains for an address using Bonfida API
 */
export async function getAllDomains(params: {
  address: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
}): Promise<string[]> {
  const { address, network = "mainnet-beta" } = params;
  
  if (network !== "mainnet-beta") {
    return [];
  }
  
  try {
    const response = await fetch(
      `https://sns-sdk-proxy.bonfida.workers.dev/domains/${address}`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (Array.isArray(data.result)) {
      // Filter out any error messages and add .sol extension
      return data.result
        .filter((domain: string) => !domain.includes("Invalid") && !domain.includes("Error"))
        .map((domain: string) => domain.endsWith(".sol") ? domain : domain + ".sol");
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching all domains:", error);
    return [];
  }
}

/**
 * Extended domain information
 */
export interface DomainInfo {
  domain: string;
  isPrimary: boolean;
  createdAt?: number;
}

/**
 * Get detailed domain information for an address
 */
export async function getDomainDetails(params: {
  address: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
}): Promise<DomainInfo[]> {
  const { address, network = "mainnet-beta" } = params;
  
  try {
    // Get all domains
    const domains = await getAllDomains({ address, network });
    
    // Get primary domain
    const primaryDomain = await getPrimaryDomain({ address, network });
    
    // Map to domain info
    const domainInfos: DomainInfo[] = domains.map(domain => ({
      domain,
      isPrimary: domain === primaryDomain,
    }));
    
    return domainInfos;
  } catch (error) {
    console.error("Error fetching domain details:", error);
    return [];
  }
}

/**
 * Resolve address to domain (tries primary domain first)
 */
export async function resolveAddressToDomain(params: {
  address: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
}): Promise<SNSResolveResult> {
  const { address, network = "mainnet-beta" } = params;
  
  try {
    // Try to get primary domain
    const primaryDomain = await getPrimaryDomain({ address, network });
    
    return {
      domain: primaryDomain || undefined,
      address,
      hasDomain: !!primaryDomain,
    };
  } catch (error) {
    console.error("Error resolving address to domain:", error);
    return {
      address,
      hasDomain: false,
    };
  }
}

/**
 * Check if a string is a valid .sol domain
 */
export function isValidDomain(input: string): boolean {
  return /^[a-z0-9-]+\.sol$/i.test(input);
}

/**
 * Format domain for display
 */
export function formatDomain(domain: string): string {
  if (!domain) return "";
  
  // Ensure .sol extension
  if (!domain.endsWith(".sol")) {
    return domain + ".sol";
  }
  
  return domain;
}
