import { Connection, PublicKey } from "@solana/web3.js";
import { getRPCEndpoint } from "@/config/env";

/**
 * Market Data Service - Real-time price and market data from Jupiter and Birdeye
 */

export interface TokenMarketData {
  mint: string;
  
  // Price data
  price?: number;
  priceChange24h?: number;
  priceChange7d?: number;
  priceChange30d?: number;
  
  // Volume data
  volume24h?: number;
  volumeChange24h?: number;
  
  // Market data
  marketCap?: number;
  fdv?: number;
  liquidity?: number;
  
  // Holder data
  holders?: number;
  holdersChange24h?: number;
  
  // Trading data
  trades24h?: number;
  uniqueWallets24h?: number;
  
  // Source
  source: "jupiter" | "birdeye" | "coingecko" | "fallback";
  lastUpdated: number;
}

export interface TokenTransaction {
  signature: string;
  slot: number;
  blockTime?: number;
  type: "swap" | "transfer" | "mint" | "burn" | "create" | "unknown";
  
  // Transaction details
  from?: string;
  to?: string;
  amount?: string;
  amountUi?: number;
  
  // Swap specific
  tokenIn?: string;
  tokenOut?: string;
  amountIn?: string;
  amountOut?: string;
  
  // Program info
  program?: string;
  programName?: string;
  
  // Status
  success: boolean;
  error?: string;
}

/**
 * Fetch real-time price from Jupiter API
 */
export async function fetchJupiterPrice(mint: string): Promise<Partial<TokenMarketData>> {
  try {
    const response = await fetch(
      `https://price.jup.ag/v4/price?ids=${mint}`,
      { 
        cache: "no-store",
        headers: { "Accept": "application/json" }
      }
    );

    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.status}`);
    }

    const data = await response.json();
    const priceData = data.data?.[mint];

    if (!priceData) {
      return { source: "fallback", lastUpdated: Date.now() };
    }

    return {
      price: priceData.price,
      source: "jupiter",
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.warn("Failed to fetch Jupiter price:", error);
    return { source: "fallback", lastUpdated: Date.now() };
  }
}

/**
 * Fetch comprehensive market data from Birdeye API
 */
export async function fetchBirdeyeMarketData(mint: string): Promise<Partial<TokenMarketData>> {
  try {
    // Note: Birdeye requires API key for production
    // Using public endpoint with limitations
    const [priceResponse, overviewResponse] = await Promise.allSettled([
      fetch(`https://public-api.birdeye.so/public/price?address=${mint}`, {
        cache: "no-store",
        headers: { 
          "Accept": "application/json",
          "X-API-KEY": process.env.BIRDEYE_API_KEY || ""
        }
      }),
      fetch(`https://public-api.birdeye.so/defi/token_overview?address=${mint}`, {
        cache: "no-store",
        headers: { 
          "Accept": "application/json",
          "X-API-KEY": process.env.BIRDEYE_API_KEY || ""
        }
      })
    ]);

    const result: Partial<TokenMarketData> = {
      source: "birdeye",
      lastUpdated: Date.now(),
    };

    // Parse price data
    if (priceResponse.status === "fulfilled" && priceResponse.value.ok) {
      const priceData = await priceResponse.value.json();
      if (priceData.data) {
        result.price = priceData.data.value;
        result.priceChange24h = priceData.data.priceChange24h;
      }
    }

    // Parse overview data
    if (overviewResponse.status === "fulfilled" && overviewResponse.value.ok) {
      const overviewData = await overviewResponse.value.json();
      if (overviewData.data) {
        result.volume24h = overviewData.data.v24hUSD;
        result.volumeChange24h = overviewData.data.v24hChangePercent;
        result.liquidity = overviewData.data.liquidity;
        result.marketCap = overviewData.data.mc;
        result.holders = overviewData.data.holder;
        result.trades24h = overviewData.data.trade24h;
        result.uniqueWallets24h = overviewData.data.uniqueWallet24h;
      }
    }

    return result;
  } catch (error) {
    console.warn("Failed to fetch Birdeye market data:", error);
    return { source: "fallback", lastUpdated: Date.now() };
  }
}

/**
 * Fetch market data from CoinGecko (fallback)
 */
export async function fetchCoinGeckoData(coingeckoId: string): Promise<Partial<TokenMarketData>> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coingeckoId}?localization=false&tickers=false&community_data=false&developer_data=false`,
      { 
        cache: "force-cache",
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const marketData = data.market_data;

    if (!marketData) {
      return { source: "fallback", lastUpdated: Date.now() };
    }

    return {
      price: marketData.current_price?.usd,
      priceChange24h: marketData.price_change_percentage_24h,
      priceChange7d: marketData.price_change_percentage_7d,
      priceChange30d: marketData.price_change_percentage_30d,
      volume24h: marketData.total_volume?.usd,
      marketCap: marketData.market_cap?.usd,
      fdv: marketData.fully_diluted_valuation?.usd,
      source: "coingecko",
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.warn("Failed to fetch CoinGecko data:", error);
    return { source: "fallback", lastUpdated: Date.now() };
  }
}

/**
 * Fetch comprehensive market data from multiple sources
 */
export async function fetchTokenMarketData(params: {
  mint: string;
  coingeckoId?: string;
}): Promise<TokenMarketData> {
  const { mint, coingeckoId } = params;

  // Try Birdeye first (most comprehensive for Solana)
  const birdeyeData = await fetchBirdeyeMarketData(mint);
  
  // If Birdeye has good data, use it
  if (birdeyeData.price && birdeyeData.volume24h) {
    return {
      mint,
      ...birdeyeData,
    } as TokenMarketData;
  }

  // Try Jupiter for price
  const jupiterData = await fetchJupiterPrice(mint);
  
  // Try CoinGecko if we have an ID
  let coingeckoData: Partial<TokenMarketData> = {};
  if (coingeckoId) {
    coingeckoData = await fetchCoinGeckoData(coingeckoId);
  }

  // Merge data from all sources
  return {
    mint,
    price: coingeckoData.price || jupiterData.price,
    priceChange24h: coingeckoData.priceChange24h,
    priceChange7d: coingeckoData.priceChange7d,
    volume24h: coingeckoData.volume24h,
    marketCap: coingeckoData.marketCap,
    fdv: coingeckoData.fdv,
    source: coingeckoData.price ? "coingecko" : (jupiterData.price ? "jupiter" : "fallback"),
    lastUpdated: Date.now(),
  } as TokenMarketData;
}

/**
 * Parse transaction instruction to determine type
 */
function parseTransactionType(tx: any): TokenTransaction["type"] {
  try {
    const instructions = tx.transaction.message.instructions || [];
    
    for (const ix of instructions) {
      const programId = ix.programId?.toBase58() || "";
      
      // Check for common program patterns
      if (programId.includes("JUP") || programId.includes("Jupiter")) {
        return "swap";
      }
      if (programId.includes("Token")) {
        // Check instruction data for transfer/mint/burn
        const data = ix.data;
        if (data) {
          const firstByte = data[0];
          if (firstByte === 3) return "transfer";
          if (firstByte === 7) return "mint";
          if (firstByte === 8) return "burn";
        }
        return "transfer";
      }
    }
    
    return "unknown";
  } catch (error) {
    return "unknown";
  }
}

/**
 * Get program name from program ID
 */
function getProgramName(programId: string): string {
  const knownPrograms: Record<string, string> = {
    "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN": "Jupiter",
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA": "Token Program",
    "11111111111111111111111111111111": "System Program",
    "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM": "Serum DEX",
    "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": "Raydium",
    "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc": "Orca",
  };
  
  return knownPrograms[programId] || "Unknown";
}

/**
 * Fetch enhanced transaction history with proper parsing
 */
export async function fetchEnhancedTransactions(params: {
  address: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
  limit?: number;
}): Promise<TokenTransaction[]> {
  const { address, network = "mainnet-beta", limit = 20 } = params;

  try {
    const endpoint = getRPCEndpoint(network);
    const connection = new Connection(endpoint, { commitment: "confirmed" });
    const pubkey = new PublicKey(address);

    // Get recent signatures
    const signatures = await connection.getSignaturesForAddress(pubkey, {
      limit,
    });

    const transactions: TokenTransaction[] = [];

    // Fetch and parse transactions in batches
    const batchSize = 5;
    for (let i = 0; i < signatures.length; i += batchSize) {
      const batch = signatures.slice(i, i + batchSize);
      
      const txPromises = batch.map(async (sig) => {
        try {
          const tx = await connection.getTransaction(sig.signature, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
          });

          if (!tx) return null;

          const type = parseTransactionType(tx);
          const success = !tx.meta?.err;
          
          // Get program info from instructions
          const instructions = tx.transaction.message.instructions || [];
          const programIds = instructions.map(ix => ix.programId?.toBase58()).filter(Boolean);
          const firstProgramId = programIds[0] || "";
          
          // Parse SOL balance changes
          let from: string | undefined;
          let to: string | undefined;
          let amount: string | undefined;
          let amountUi: number | undefined;

          // Check SOL balance changes (preBalances vs postBalances)
          const preBalances = tx.meta?.preBalances || [];
          const postBalances = tx.meta?.postBalances || [];
          const accountKeys = tx.transaction.message.getAccountKeys();

          // Find the user's account index
          const userAccountIndex = accountKeys.staticAccountKeys.findIndex(
            key => key.toBase58() === address
          );

          if (userAccountIndex !== -1 && preBalances[userAccountIndex] !== undefined && postBalances[userAccountIndex] !== undefined) {
            const preBalance = preBalances[userAccountIndex];
            const postBalance = postBalances[userAccountIndex];
            const balanceChange = postBalance - preBalance;
            
            // Convert lamports to SOL
            const solChange = balanceChange / 1e9;
            
            if (Math.abs(solChange) > 0) {
              amountUi = solChange;
              amount = balanceChange.toString();
              
              // Determine from/to based on balance change
              if (balanceChange > 0) {
                // Received SOL
                to = address;
                // Try to find sender (first account that decreased balance)
                for (let i = 0; i < preBalances.length; i++) {
                  if (i !== userAccountIndex && preBalances[i] > postBalances[i]) {
                    from = accountKeys.staticAccountKeys[i]?.toBase58();
                    break;
                  }
                }
              } else {
                // Sent SOL
                from = address;
                // Try to find receiver (first account that increased balance)
                for (let i = 0; i < preBalances.length; i++) {
                  if (i !== userAccountIndex && postBalances[i] > preBalances[i]) {
                    to = accountKeys.staticAccountKeys[i]?.toBase58();
                    break;
                  }
                }
              }
            }
          }

          // If no SOL change, check token balances
          if (!amountUi || amountUi === 0) {
            const preTokenBalances = tx.meta?.preTokenBalances || [];
            const postTokenBalances = tx.meta?.postTokenBalances || [];
            
            // Find token balance changes for any account owned by the user
            for (const postToken of postTokenBalances) {
              const preToken = preTokenBalances.find(
                pre => pre.accountIndex === postToken.accountIndex
              );
              
              if (preToken && postToken) {
                const change = Number(postToken.uiTokenAmount.amount) - Number(preToken.uiTokenAmount.amount);
                
                if (Math.abs(change) > 0) {
                  amount = Math.abs(change).toString();
                  amountUi = change / Math.pow(10, postToken.uiTokenAmount.decimals);
                  
                  from = preToken.owner;
                  to = postToken.owner;
                  break;
                }
              }
            }
          }

          return {
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime || undefined,
            type,
            from,
            to,
            amount,
            amountUi,
            program: firstProgramId,
            programName: getProgramName(firstProgramId),
            success,
            error: tx.meta?.err ? JSON.stringify(tx.meta.err) : undefined,
          } as TokenTransaction;
        } catch (error) {
          console.warn(`Failed to parse transaction ${sig.signature}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.allSettled(txPromises);
      
      batchResults.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          transactions.push(result.value);
        }
      });
    }

    return transactions;

  } catch (error) {
    console.error("Failed to fetch enhanced transactions:", error);
    return [];
  }
}

/**
 * Calculate holder change over 24h
 */
export async function calculateHolderChange(
  currentHolders: number,
  mint: string
): Promise<number> {
  try {
    // In production, you'd query a database or historical API
    // For now, simulate with a random change
    // This should be replaced with actual historical data tracking
    const mockChange = (Math.random() - 0.5) * 5; // -2.5% to +2.5%
    return mockChange;
  } catch (error) {
    return 0;
  }
}