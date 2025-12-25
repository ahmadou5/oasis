import { AxiosRequestHeaders, AxiosHeaders } from "axios";

// Environment configuration for Stakeit app
export const ENV = {
  // Solana Network Configuration
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  SOLANA: {
    RPC_ENDPOINT:
      process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT ||
      "https://api.mainnet-beta.solana.com",
    NETWORK: (process.env.NEXT_PUBLIC_SOLANA_NETWORK || "mainnet-beta") as
      | "mainnet-beta"
      | "testnet"
      | "devnet",

    // Alternative endpoints for failover
    RPC_ENDPOINTS: {
      MAINNET:
        process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT_MAINNET ||
        "https://api.mainnet-beta.solana.com",
      TESTNET:
        process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT_TESTNET ||
        "https://api.testnet.solana.com",
      DEVNET:
        process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT_DEVNET ||
        "https://api.devnet.solana.com",
    },
  },

  // Solana Beach API Configuration
  SOLANA_BEACH: {
    API_KEY: process.env.NEXT_PUBLIC_SOLANA_BEACH_API_KEY || "",
    BASE_URL:
      process.env.NEXT_PUBLIC_SOLANA_BEACH_API_URL ||
      "https://api.solanaview.com/v2",

    // API endpoints
    ENDPOINTS: {
      VALIDATORS: "/validator-list",
      VALIDATOR_DETAIL: (address: string) => `/validator/${address}`,
      VALIDATOR_EPOCHS: (address: string, limit = 30) =>
        `/validator/${address}/epochs?limit=${limit}`,
      VALIDATOR_STAKE_HISTORY: (address: string, limit = 30) =>
        `/validator/${address}/stake-history?limit=${limit}`,
      VALIDATOR_SUCCESS_RATE_HISTORY: (address: string, limit = 30) =>
        `/validator/${address}/success-rate-history?limit=${limit}`,
      NETWORK_STATS: "/latest-blockhash",
      VALIDATOR_BLOCK_REWARDS_: (address: string, limit = 30) =>
        `/validator/${address}/block-rewards-history?limit=${limit}`,
      VALIDATOR_STAKE_ACCOUNTS_HISTORY: (votePubkey: string, limit: number) =>
        `/validator/${votePubkey}/stake-accounts-history?limit=${limit}`,
      EPOCH_INFO: (limit: number) => `/epoch-info?limit=${limit}`,
    },
  },

  // Application Configuration
  APP: {
    NAME: "Stakeit",
    VERSION: "1.0.0",
    DESCRIPTION: "Decentralized Solana staking application",
  },

  // Xandeum Configuration
  XENDIUM: {
    PRPC_HOST: process.env.XENDIUM_PRPC_HOST || "192.190.136.36",
    PRPC_PORT: parseInt(process.env.XENDIUM_PRPC_PORT || "50051"),
    TIMEOUT_MS: parseInt(process.env.XENDIUM_TIMEOUT_MS || "30000"),
    CACHE_TTL_SECONDS: parseInt(process.env.XENDIUM_CACHE_TTL || "300"), // 5 minutes
    MAX_RETRIES: parseInt(process.env.XENDIUM_MAX_RETRIES || "3"),
  },

  // Feature Flags
  FEATURES: {
    ENABLE_DEBUG: process.env.NODE_ENV === "development",
    ENABLE_ANALYTICS: !!process.env.NEXT_PUBLIC_GA_ID,
    ENABLE_SENTRY: !!process.env.SENTRY_DSN,
    ENABLE_XENDIUM_CACHE: process.env.ENABLE_XENDIUM_CACHE !== "false",

    // Recent blocks: prefer Geyser gRPC (server-side) when available.
    // Note: this is a server-side flag, not NEXT_PUBLIC.
    ENABLE_GEYSER_RECENT_BLOCKS: process.env.ENABLE_GEYSER_RECENT_BLOCKS === "true",
  },
} as const;

// Helper function to get the appropriate RPC endpoint
function normalizeRpcUrl(url: string | undefined): string {
  const u = (url || "").trim();
  if (!u) return "";
  // Allow http(s) only. (Solana web3 uses fetch; ws(s) URLs will fail.)
  if (!/^https?:\/\//i.test(u)) return "";
  return u;
}

// Helper function to get the appropriate RPC endpoint
export function getRPCEndpoint(network?: string): string {
  const targetNetwork = network || ENV.SOLANA.NETWORK;

  const pick =
    targetNetwork === "mainnet-beta"
      ? ENV.SOLANA.RPC_ENDPOINTS.MAINNET
      : targetNetwork === "testnet"
        ? ENV.SOLANA.RPC_ENDPOINTS.TESTNET
        : targetNetwork === "devnet"
          ? ENV.SOLANA.RPC_ENDPOINTS.DEVNET
          : ENV.SOLANA.RPC_ENDPOINT;

  return (
    normalizeRpcUrl(pick) ||
    // hard fallback
    (targetNetwork === "testnet"
      ? "https://api.testnet.solana.com"
      : targetNetwork === "devnet"
        ? "https://api.devnet.solana.com"
        : "https://api.mainnet-beta.solana.com")
  );
}

/**
 * RPC failover list (best-effort). Ordered from most-preferred to least.
 * Useful when an RPC provider intermittently fails or blocks requests.
 */
export function getRPCFailoverEndpoints(
  network?: string
): Array<{ label: string; url: string }> {
  const targetNetwork = network || ENV.SOLANA.NETWORK;

  // Prefer the network-specific endpoint first. For mainnet-beta, this is
  // ENV.SOLANA.RPC_ENDPOINTS.MAINNET (as requested).
  const primary =
    targetNetwork === "mainnet-beta"
      ? ENV.SOLANA.RPC_ENDPOINTS.MAINNET
      : targetNetwork === "testnet"
        ? ENV.SOLANA.RPC_ENDPOINTS.TESTNET
        : targetNetwork === "devnet"
          ? ENV.SOLANA.RPC_ENDPOINTS.DEVNET
          : ENV.SOLANA.RPC_ENDPOINT;

  const candidates: Array<{ label: string; url: string | undefined }> = [
    { label: "primary", url: primary },
    { label: "configured", url: getRPCEndpoint(targetNetwork) },
    { label: "mainnet", url: ENV.SOLANA.RPC_ENDPOINTS.MAINNET },
    { label: "testnet", url: ENV.SOLANA.RPC_ENDPOINTS.TESTNET },
    { label: "devnet", url: ENV.SOLANA.RPC_ENDPOINTS.DEVNET },
    { label: "default", url: ENV.SOLANA.RPC_ENDPOINT },
  ];

  // Network-specific public fallback.
  if (targetNetwork === "testnet") {
    candidates.push({ label: "solana-public", url: "https://api.testnet.solana.com" });
  } else if (targetNetwork === "devnet") {
    candidates.push({ label: "solana-public", url: "https://api.devnet.solana.com" });
  } else {
    candidates.push({ label: "solana-public", url: "https://api.mainnet-beta.solana.com" });
    candidates.push({ label: "ankr", url: "https://rpc.ankr.com/solana" });
  }

  const seen = new Set<string>();
  const out: Array<{ label: string; url: string }> = [];
  for (const c of candidates) {
    const u = normalizeRpcUrl(c.url);
    if (!u) continue;
    if (seen.has(u)) continue;
    seen.add(u);
    out.push({ label: c.label, url: u });
  }
  return out;
}

// Helper function to get Solana Beach API headers
export function getSolanaBeachHeaders(): AxiosRequestHeaders {
  const headers = new AxiosHeaders({
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": `${ENV.APP.NAME}/${ENV.APP.VERSION}`,
  });

  if (ENV.SOLANA_BEACH.API_KEY) {
    headers.set("Authorization", `Bearer ${ENV.SOLANA_BEACH.API_KEY}`);
  }

  return headers as AxiosRequestHeaders;
}

// Helper function to build Solana Beach API URLs
export function buildSolanaBeachURL(endpoint: string): string {
  return `${ENV.SOLANA_BEACH.BASE_URL}${endpoint}`;
}

///Ac1beBKixfNdrTAac7GRaTsJTxLyvgGvJjvy4qQfvyfc/block-rewards-history
