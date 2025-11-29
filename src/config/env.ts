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

  // Feature Flags
  FEATURES: {
    ENABLE_DEBUG: process.env.NODE_ENV === "development",
    ENABLE_ANALYTICS: !!process.env.NEXT_PUBLIC_GA_ID,
    ENABLE_SENTRY: !!process.env.SENTRY_DSN,
  },
} as const;

// Helper function to get the appropriate RPC endpoint
export function getRPCEndpoint(network?: string): string {
  const targetNetwork = network || ENV.SOLANA.NETWORK;

  switch (targetNetwork) {
    case "mainnet-beta":
      return ENV.SOLANA.RPC_ENDPOINTS.MAINNET;
    case "testnet":
      return ENV.SOLANA.RPC_ENDPOINTS.TESTNET;
    case "devnet":
      return ENV.SOLANA.RPC_ENDPOINTS.DEVNET;
    default:
      return ENV.SOLANA.RPC_ENDPOINT;
  }
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
