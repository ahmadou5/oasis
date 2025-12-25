import { Connection, PublicKey } from "@solana/web3.js";
import { getRPCEndpoint } from "@/config/env";

/**
 * Comprehensive Token Metadata Service
 * Fetches token metadata from multiple sources:
 * 1. On-chain Metaplex metadata
 * 2. Token Registry (Solana token list)
 * 3. Off-chain metadata URIs
 */

export interface TokenMetadata {
  mint: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  logoURI?: string;
  description?: string;
  
  // Extended metadata
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  coingeckoId?: string;
  
  // On-chain metadata
  updateAuthority?: string;
  metadataUri?: string;
  
  // Token stats
  supply?: string;
  holders?: number;
  
  // Source of metadata
  source: "metaplex" | "token-registry" | "off-chain" | "fallback";
}

export interface TokenHolding {
  mint: string;
  tokenAccount: string;
  balance: string;
  decimals: number;
  uiAmount: number;
  
  // Rich metadata
  metadata?: TokenMetadata;
}

const METAPLEX_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

// Popular token registry (subset - in production use full token list)
const WELL_KNOWN_TOKENS: Record<string, Omit<TokenMetadata, "mint" | "source">> = {
  // SOL (wrapped)
  "So11111111111111111111111111111111111111112": {
    name: "Wrapped SOL",
    symbol: "SOL",
    decimals: 9,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
    description: "Wrapped Solana native token",
    website: "https://solana.com",
    coingeckoId: "solana",
  },
  // USDC
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    description: "USD Coin stablecurrency",
    website: "https://www.centre.io/",
    coingeckoId: "usd-coin",
  },
  // USDT
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": {
    name: "USDT",
    symbol: "USDT",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png",
    description: "Tether USD stablecurrency",
    website: "https://tether.to/",
    coingeckoId: "tether",
  },
  // Bonk
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263": {
    name: "Bonk",
    symbol: "BONK",
    decimals: 5,
    logoURI: "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I",
    description: "The First Solana Dog Coin",
    website: "https://bonkcoin.com/",
    twitter: "https://twitter.com/bonk_inu",
    coingeckoId: "bonk",
  },
  // JUP
  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN": {
    name: "Jupiter",
    symbol: "JUP",
    decimals: 6,
    logoURI: "https://static.jup.ag/jup/icon.png",
    description: "Jupiter Exchange Token",
    website: "https://jup.ag/",
    twitter: "https://twitter.com/JupiterExchange",
    coingeckoId: "jupiter-exchange-solana",
  },
};

/**
 * Get metadata PDA for a mint
 */
function getMetadataPDA(mint: PublicKey): PublicKey {
  const [metadata] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METAPLEX_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    METAPLEX_PROGRAM_ID
  );
  return metadata;
}

/**
 * Parse Metaplex metadata account data (simplified)
 */
function parseMetaplexMetadata(data: Buffer): Partial<TokenMetadata> {
  try {
    let offset = 1; // Skip first byte (key)

    // Update authority (32 bytes)
    const updateAuthority = new PublicKey(data.slice(offset, offset + 32)).toBase58();
    offset += 32;

    // Mint (32 bytes)
    offset += 32;

    // Parse name (4 byte length + string)
    const nameLength = data.readUInt32LE(offset);
    offset += 4;
    const nameBuffer = data.slice(offset, offset + nameLength);
    const name = nameBuffer.toString("utf8").replace(/\0/g, "").trim();
    offset += nameLength;

    // Parse symbol (4 byte length + string)
    const symbolLength = data.readUInt32LE(offset);
    offset += 4;
    const symbolBuffer = data.slice(offset, offset + symbolLength);
    const symbol = symbolBuffer.toString("utf8").replace(/\0/g, "").trim();
    offset += symbolLength;

    // Parse URI (4 byte length + string)
    const uriLength = data.readUInt32LE(offset);
    offset += 4;
    const uriBuffer = data.slice(offset, offset + uriLength);
    const uri = uriBuffer.toString("utf8").replace(/\0/g, "").trim();

    return {
      name: name || undefined,
      symbol: symbol || undefined,
      metadataUri: uri || undefined,
      updateAuthority,
    };
  } catch (error) {
    console.warn("Failed to parse Metaplex metadata:", error);
    return {};
  }
}

/**
 * Fetch off-chain metadata from URI
 */
async function fetchOffChainMetadata(uri: string): Promise<Partial<TokenMetadata>> {
  try {
    // Handle different URI formats
    let fetchUrl = uri;
    
    // Convert IPFS URIs
    if (uri.startsWith("ipfs://")) {
      fetchUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(fetchUrl, {
      signal: controller.signal,
      headers: { "Accept": "application/json" },
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      name: data.name,
      symbol: data.symbol,
      description: data.description,
      logoURI: data.image || data.logo,
      website: data.external_url || data.website,
      twitter: data.twitter,
      telegram: data.telegram,
      discord: data.discord,
    };
  } catch (error) {
    console.warn("Failed to fetch off-chain metadata:", error);
    return {};
  }
}

/**
 * Fetch comprehensive token metadata from all sources
 */
export async function fetchTokenMetadata(params: {
  mint: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
  rpcEndpoint?: string;
}): Promise<TokenMetadata> {
  const { mint, network = "mainnet-beta", rpcEndpoint } = params;

  const baseMetadata: TokenMetadata = {
    mint,
    source: "fallback",
  };

  try {
    const mintKey = new PublicKey(mint);
    const endpoint = rpcEndpoint ?? getRPCEndpoint(network);
    const connection = new Connection(endpoint, { commitment: "confirmed" });

    // 1. Check well-known tokens first (fastest)
    if (WELL_KNOWN_TOKENS[mint]) {
      return {
        ...WELL_KNOWN_TOKENS[mint],
        mint,
        source: "token-registry",
      };
    }

    // 2. Get mint account info for decimals
    const mintInfo = await connection.getParsedAccountInfo(mintKey);
    const parsedMint = (mintInfo.value?.data as any)?.parsed;
    if (parsedMint?.info?.decimals !== undefined) {
      baseMetadata.decimals = parsedMint.info.decimals;
      baseMetadata.supply = parsedMint.info.supply;
    }

    // 3. Try to fetch Metaplex metadata
    try {
      const metadataPDA = getMetadataPDA(mintKey);
      const metadataAccount = await connection.getAccountInfo(metadataPDA);

      if (metadataAccount) {
        const onChainMetadata = parseMetaplexMetadata(metadataAccount.data);
        Object.assign(baseMetadata, onChainMetadata);
        baseMetadata.source = "metaplex";

        // 4. If we have a metadata URI, fetch off-chain data
        if (onChainMetadata.metadataUri) {
          const offChainMetadata = await fetchOffChainMetadata(onChainMetadata.metadataUri);
          Object.assign(baseMetadata, offChainMetadata);
          
          // Use off-chain data if available
          if (offChainMetadata.name || offChainMetadata.logoURI) {
            baseMetadata.source = "off-chain";
          }
        }
      }
    } catch (error) {
      console.warn("Metaplex metadata not available:", error);
    }

    // 5. Fallback to Solana Token List API (if previous methods failed)
    if (!baseMetadata.name && network === "mainnet-beta") {
      try {
        const tokenListResponse = await fetch(
          "https://token.jup.ag/strict",
          { cache: "force-cache" }
        );
        if (tokenListResponse.ok) {
          const tokenList = await tokenListResponse.json();
          const tokenInfo = tokenList.find((t: any) => t.address === mint);
          
          if (tokenInfo) {
            baseMetadata.name = tokenInfo.name;
            baseMetadata.symbol = tokenInfo.symbol;
            baseMetadata.decimals = tokenInfo.decimals;
            baseMetadata.logoURI = tokenInfo.logoURI;
            baseMetadata.source = "token-registry";
          }
        }
      } catch (error) {
        console.warn("Failed to fetch from token registry:", error);
      }
    }

    return baseMetadata;

  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return baseMetadata;
  }
}

/**
 * Fetch metadata for multiple tokens (batch)
 */
export async function batchFetchTokenMetadata(params: {
  mints: string[];
  network?: "mainnet-beta" | "testnet" | "devnet";
  rpcEndpoint?: string;
}): Promise<Map<string, TokenMetadata>> {
  const { mints, network, rpcEndpoint } = params;
  const results = new Map<string, TokenMetadata>();

  // Process in smaller batches to avoid overwhelming the RPC
  const batchSize = 10;
  for (let i = 0; i < mints.length; i += batchSize) {
    const batch = mints.slice(i, i + batchSize);

    const batchPromises = batch.map(async (mint) => {
      const metadata = await fetchTokenMetadata({ mint, network, rpcEndpoint });
      return [mint, metadata] as const;
    });

    const batchResults = await Promise.allSettled(batchPromises);

    batchResults.forEach((result) => {
      if (result.status === "fulfilled") {
        const [mint, metadata] = result.value;
        results.set(mint, metadata);
      }
    });

    // Small delay between batches
    if (i + batchSize < mints.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Get user's token holdings with rich metadata
 */
export async function fetchUserTokenHoldings(params: {
  walletAddress: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
  rpcEndpoint?: string;
}): Promise<TokenHolding[]> {
  const { walletAddress, network = "mainnet-beta", rpcEndpoint } = params;

  try {
    const walletKey = new PublicKey(walletAddress);
    const endpoint = rpcEndpoint ?? getRPCEndpoint(network);
    const connection = new Connection(endpoint, { commitment: "confirmed" });

    // Get all token accounts for this wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    const holdings: TokenHolding[] = [];
    const mintsToFetch: string[] = [];

    // Extract basic token info
    for (const account of tokenAccounts.value) {
      const parsed = account.account.data.parsed;
      const info = parsed?.info;

      if (info && info.tokenAmount) {
        const mint = info.mint;
        const uiAmount = Number(info.tokenAmount.uiAmount);

        // Only include tokens with balance > 0
        if (uiAmount > 0) {
          holdings.push({
            mint,
            tokenAccount: account.pubkey.toBase58(),
            balance: info.tokenAmount.amount,
            decimals: info.tokenAmount.decimals,
            uiAmount,
          });
          mintsToFetch.push(mint);
        }
      }
    }

    // Fetch metadata for all tokens
    const metadataMap = await batchFetchTokenMetadata({
      mints: mintsToFetch,
      network,
      rpcEndpoint,
    });

    // Attach metadata to holdings
    holdings.forEach((holding) => {
      const metadata = metadataMap.get(holding.mint);
      if (metadata) {
        holding.metadata = metadata;
      }
    });

    // Sort by USD value (if available) or by balance
    holdings.sort((a, b) => b.uiAmount - a.uiAmount);

    return holdings;

  } catch (error) {
    console.error("Error fetching user token holdings:", error);
    return [];
  }
}

/**
 * Get token metadata with price info from Jupiter API
 */
export async function fetchTokenWithPrice(mint: string): Promise<TokenMetadata & { price?: number; priceChange24h?: number }> {
  const metadata = await fetchTokenMetadata({ mint });

  try {
    // Try to get price from Jupiter API
    const priceResponse = await fetch(
      `https://price.jup.ag/v4/price?ids=${mint}`,
      { cache: "no-store" }
    );

    if (priceResponse.ok) {
      const priceData = await priceResponse.json();
      const tokenPrice = priceData.data?.[mint];

      if (tokenPrice) {
        return {
          ...metadata,
          price: tokenPrice.price,
          priceChange24h: tokenPrice.priceChange24h,
        };
      }
    }
  } catch (error) {
    console.warn("Failed to fetch token price:", error);
  }

  return metadata;
}