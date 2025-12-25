import { Connection, PublicKey } from "@solana/web3.js";
import { getRPCEndpoint } from "@/config/env";

export interface TokenMintDetails {
  address: string;
  found: boolean;
  network: "mainnet-beta" | "testnet" | "devnet";
  
  // Mint Information
  mintAuthority?: string | null;
  supply?: string;
  decimals?: number;
  isInitialized?: boolean;
  freezeAuthority?: string | null;
  
  // Token Metadata (if available)
  metadata?: {
    name?: string;
    symbol?: string;
    uri?: string;
    image?: string;
    description?: string;
  };
  
  // Statistics
  holders?: number;
  isNft?: boolean;
  
  // Top Holders
  topHolders?: Array<{
    address: string;
    amount: string;
    uiAmount: number;
    percentage: number;
  }>;
  
  // Recent Transfers
  recentTransfers?: Array<{
    signature: string;
    slot: number;
    blockTime?: number;
    from?: string;
    to?: string;
    amount: string;
    uiAmount: number;
  }>;
}

const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOKEN_2022_PROGRAM = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

function lamportsToSol(lamports: number) {
  return lamports / 1_000_000_000;
}

export async function fetchTokenDetails(params: {
  address: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
  rpcEndpoint?: string;
}): Promise<TokenMintDetails> {
  const network = params.network ?? "mainnet-beta";
  const endpoint = params.rpcEndpoint ?? getRPCEndpoint(network);
  const connection = new Connection(endpoint, { commitment: "confirmed" });

  let mintKey: PublicKey;
  try {
    mintKey = new PublicKey(params.address);
  } catch {
    return {
      address: params.address,
      found: false,
      network,
    };
  }

  try {
    // Get parsed mint account info
    const mintAccountInfo = await connection.getParsedAccountInfo(mintKey, "confirmed");
    const mintAccount = mintAccountInfo.value;

    if (!mintAccount) {
      return {
        address: mintKey.toBase58(),
        found: false,
        network,
      };
    }

    const owner = mintAccount.owner.toBase58();
    
    // Verify this is actually a token mint
    if (owner !== TOKEN_PROGRAM && owner !== TOKEN_2022_PROGRAM) {
      return {
        address: mintKey.toBase58(),
        found: false,
        network,
      };
    }

    const parsedData = mintAccount.data as any;
    const mintInfo = parsedData?.parsed?.info;

    if (!mintInfo || parsedData?.parsed?.type !== "mint") {
      return {
        address: mintKey.toBase58(),
        found: false,
        network,
      };
    }

    const decimals = mintInfo.decimals;
    const supply = mintInfo.supply;
    const mintAuthority = mintInfo.mintAuthority;
    const freezeAuthority = mintInfo.freezeAuthority;
    const isInitialized = mintInfo.isInitialized;

    // Determine if this is an NFT
    const isNft = decimals === 0 && supply === "1";

    const baseDetails: TokenMintDetails = {
      address: mintKey.toBase58(),
      found: true,
      network,
      mintAuthority,
      supply,
      decimals,
      isInitialized,
      freezeAuthority,
      isNft,
    };

    // Get metadata if available
    try {
      const metadata = await fetchTokenMetadata(connection, mintKey);
      if (metadata) {
        baseDetails.metadata = metadata;
      }
    } catch (error) {
      console.warn("Failed to fetch token metadata:", error);
    }

    // Get token accounts (for holder count and top holders)
    try {
      const tokenAccounts = await getTokenAccounts(connection, mintKey, decimals);
      if (tokenAccounts) {
        baseDetails.holders = tokenAccounts.length;
        baseDetails.topHolders = tokenAccounts
          .sort((a, b) => b.uiAmount - a.uiAmount)
          .slice(0, 10);
      }
    } catch (error) {
      console.warn("Failed to fetch token accounts:", error);
    }

    // Get recent transfers (signatures)
    try {
      const recentTransfers = await getRecentTransfers(connection, mintKey);
      baseDetails.recentTransfers = recentTransfers;
    } catch (error) {
      console.warn("Failed to fetch recent transfers:", error);
    }

    return baseDetails;

  } catch (error) {
    console.error("Error fetching token details:", error);
    return {
      address: mintKey.toBase58(),
      found: false,
      network,
    };
  }
}

async function fetchTokenMetadata(
  connection: Connection,
  mint: PublicKey
): Promise<TokenMintDetails["metadata"] | null> {
  try {
    const [metadataAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      METADATA_PROGRAM_ID
    );

    const accountInfo = await connection.getAccountInfo(metadataAddress);
    if (!accountInfo) return null;

    // Parse metadata (simplified - in production you'd use Metaplex SDK)
    const data = accountInfo.data;
    
    // This is a simplified parser - for production use @metaplex-foundation/mpl-token-metadata
    let offset = 1; // Skip first byte (discriminator)
    
    // Skip update authority (32 bytes)
    offset += 32;
    
    // Skip mint (32 bytes)
    offset += 32;
    
    // Parse name
    const nameLength = data.readUInt32LE(offset);
    offset += 4;
    const name = data.slice(offset, offset + nameLength).toString('utf8').replace(/\0/g, '').trim();
    offset += nameLength;
    
    // Parse symbol
    const symbolLength = data.readUInt32LE(offset);
    offset += 4;
    const symbol = data.slice(offset, offset + symbolLength).toString('utf8').replace(/\0/g, '').trim();
    offset += symbolLength;
    
    // Parse URI
    const uriLength = data.readUInt32LE(offset);
    offset += 4;
    const uri = data.slice(offset, offset + uriLength).toString('utf8').replace(/\0/g, '').trim();

    // Try to fetch off-chain metadata
    let image, description;
    if (uri) {
      try {
        const response = await fetch(uri);
        if (response.ok) {
          const offChainMetadata = await response.json();
          image = offChainMetadata.image;
          description = offChainMetadata.description;
        }
      } catch (error) {
        console.warn("Failed to fetch off-chain metadata:", error);
      }
    }

    return {
      name: name || undefined,
      symbol: symbol || undefined,
      uri: uri || undefined,
      image,
      description,
    };

  } catch (error) {
    console.warn("Error parsing metadata:", error);
    return null;
  }
}

async function getTokenAccounts(
  connection: Connection,
  mint: PublicKey,
  decimals: number
): Promise<TokenMintDetails["topHolders"]> {
  try {
    const accounts = await connection.getParsedProgramAccounts(
      new PublicKey(TOKEN_PROGRAM),
      {
        filters: [
          {
            dataSize: 165, // Token account data size
          },
          {
            memcmp: {
              offset: 0,
              bytes: mint.toBase58(),
            },
          },
        ],
      }
    );

    const holders: NonNullable<TokenMintDetails["topHolders"]> = [];

    for (const account of accounts) {
      const parsed = (account.account.data as any)?.parsed;
      const info = parsed?.info;
      
      if (info && info.tokenAmount) {
        const amount = info.tokenAmount.amount;
        const uiAmount = Number(info.tokenAmount.uiAmount);
        
        if (uiAmount > 0) {
          holders.push({
            address: account.pubkey.toBase58(),
            amount,
            uiAmount,
            percentage: 0, // Will calculate after getting total
          });
        }
      }
    }

    // Calculate percentages
    const totalSupply = holders.reduce((sum, holder) => sum + holder.uiAmount, 0);
    if (totalSupply > 0) {
      holders.forEach(holder => {
        holder.percentage = (holder.uiAmount / totalSupply) * 100;
      });
    }

    return holders;

  } catch (error) {
    console.warn("Error fetching token accounts:", error);
    return [];
  }
}

async function getRecentTransfers(
  connection: Connection,
  mint: PublicKey
): Promise<TokenMintDetails["recentTransfers"]> {
  try {
    const signatures = await connection.getSignaturesForAddress(mint, {
      limit: 10,
    });

    const transfers: NonNullable<TokenMintDetails["recentTransfers"]> = [];

    for (const sig of signatures) {
      try {
        const tx = await connection.getTransaction(sig.signature, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        });

        if (tx) {
          // Parse transaction for token transfers (simplified)
          transfers.push({
            signature: sig.signature,
            slot: sig.slot,
            blockTime: sig.blockTime || undefined,
            from: "Unknown", // Would need to parse transaction details
            to: "Unknown",
            amount: "0",
            uiAmount: 0,
          });
        }
      } catch (error) {
        console.warn("Failed to parse transaction:", error);
      }
    }

    return transfers;

  } catch (error) {
    console.warn("Error fetching recent transfers:", error);
    return [];
  }
}