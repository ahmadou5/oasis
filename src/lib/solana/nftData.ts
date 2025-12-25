import { Connection, PublicKey } from "@solana/web3.js";
import { getRPCEndpoint } from "@/config/env";

/**
 * NFT Data Service - Fetch NFT metadata and holdings
 */

export interface NFTMetadata {
  mint: string;
  name: string;
  symbol?: string;
  image?: string;
  description?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  collection?: {
    name: string;
    family?: string;
  };
  creators?: Array<{
    address: string;
    verified: boolean;
    share: number;
  }>;
}

export interface NFTHolding {
  mint: string;
  tokenAccount: string;
  metadata: NFTMetadata;
}

const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

/**
 * Get metadata PDA for a mint
 */
function getMetadataPDA(mint: PublicKey): PublicKey {
  const [metadata] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );
  return metadata;
}

/**
 * Parse Metaplex metadata from account data
 */
function parseMetaplexMetadata(data: Buffer): Partial<NFTMetadata> & { uri?: string } {
  try {
    let offset = 1; // Skip key

    // Update authority (32 bytes)
    offset += 32;

    // Mint (32 bytes)
    offset += 32;

    // Name
    const nameLength = data.readUInt32LE(offset);
    offset += 4;
    const name = data.slice(offset, offset + nameLength).toString("utf8").replace(/\0/g, "").trim();
    offset += nameLength;

    // Symbol
    const symbolLength = data.readUInt32LE(offset);
    offset += 4;
    const symbol = data.slice(offset, offset + symbolLength).toString("utf8").replace(/\0/g, "").trim();
    offset += symbolLength;

    // URI
    const uriLength = data.readUInt32LE(offset);
    offset += 4;
    const uri = data.slice(offset, offset + uriLength).toString("utf8").replace(/\0/g, "").trim();

    return {
      name: name || undefined,
      symbol: symbol || undefined,
      uri: uri || undefined,
    };
  } catch (error) {
    console.warn("Failed to parse Metaplex metadata:", error);
    return {};
  }
}

/**
 * Fetch off-chain metadata from URI
 */
async function fetchOffChainMetadata(uri: string): Promise<Partial<NFTMetadata>> {
  try {
    let fetchUrl = uri;

    // Convert IPFS URIs
    if (uri.startsWith("ipfs://")) {
      fetchUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(fetchUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
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
      image: data.image,
      attributes: data.attributes,
      collection: data.collection,
      creators: data.properties?.creators,
    };
  } catch (error) {
    console.warn("Failed to fetch off-chain metadata:", error);
    return {};
  }
}

/**
 * Fetch NFT metadata for a single mint
 */
export async function fetchNFTMetadata(params: {
  mint: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
}): Promise<NFTMetadata> {
  const { mint, network = "mainnet-beta" } = params;

  try {
    const mintKey = new PublicKey(mint);
    const endpoint = getRPCEndpoint(network);
    const connection = new Connection(endpoint, { commitment: "confirmed" });

    // Get metadata PDA
    const metadataPDA = getMetadataPDA(mintKey);
    const metadataAccount = await connection.getAccountInfo(metadataPDA);

    if (!metadataAccount) {
      return {
        mint,
        name: `NFT ${mint.slice(0, 8)}`,
        image: undefined,
      };
    }

    // Parse on-chain metadata
    const onChainMetadata = parseMetaplexMetadata(metadataAccount.data);

    // Fetch off-chain metadata if URI is available
    let offChainMetadata: Partial<NFTMetadata> = {};
    if (onChainMetadata.uri) {
      offChainMetadata = await fetchOffChainMetadata(onChainMetadata.uri);
    }

    return {
      mint,
      name: offChainMetadata.name || onChainMetadata.name || `NFT ${mint.slice(0, 8)}`,
      symbol: offChainMetadata.symbol || onChainMetadata.symbol,
      image: offChainMetadata.image,
      description: offChainMetadata.description,
      attributes: offChainMetadata.attributes,
      collection: offChainMetadata.collection,
      creators: offChainMetadata.creators,
    };
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    return {
      mint,
      name: `NFT ${mint.slice(0, 8)}`,
      image: undefined,
    };
  }
}

/**
 * Fetch all NFTs owned by a wallet
 */
export async function fetchWalletNFTs(params: {
  walletAddress: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
}): Promise<NFTHolding[]> {
  const { walletAddress, network = "mainnet-beta" } = params;

  try {
    const walletKey = new PublicKey(walletAddress);
    const endpoint = getRPCEndpoint(network);
    const connection = new Connection(endpoint, { commitment: "confirmed" });

    // Get all token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletKey, {
      programId: new PublicKey(TOKEN_PROGRAM),
    });

    const nftHoldings: NFTHolding[] = [];
    const nftMints: string[] = [];

    // Filter for NFTs (amount = 1, decimals = 0)
    for (const account of tokenAccounts.value) {
      const parsed = account.account.data.parsed;
      const info = parsed?.info;

      if (
        info &&
        info.tokenAmount &&
        info.tokenAmount.decimals === 0 &&
        info.tokenAmount.amount === "1"
      ) {
        nftMints.push(info.mint);
        nftHoldings.push({
          mint: info.mint,
          tokenAccount: account.pubkey.toBase58(),
          metadata: {
            mint: info.mint,
            name: `NFT ${info.mint.slice(0, 8)}`,
          },
        });
      }
    }

    // Fetch metadata for all NFTs (in batches)
    const batchSize = 5;
    for (let i = 0; i < nftMints.length; i += batchSize) {
      const batch = nftMints.slice(i, i + batchSize);

      const metadataPromises = batch.map((mint) =>
        fetchNFTMetadata({ mint, network }).catch((error) => {
          console.error(`Failed to fetch metadata for ${mint}:`, error);
          return {
            mint,
            name: `NFT ${mint.slice(0, 8)}`,
          };
        })
      );

      const batchMetadata = await Promise.all(metadataPromises);

      // Update holdings with metadata
      batchMetadata.forEach((metadata, index) => {
        const mintAddress = batch[index];
        const holding = nftHoldings.find((h) => h.mint === mintAddress);
        if (holding) {
          holding.metadata = metadata;
        }
      });

      // Small delay between batches
      if (i + batchSize < nftMints.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return nftHoldings;
  } catch (error) {
    console.error("Error fetching wallet NFTs:", error);
    return [];
  }
}