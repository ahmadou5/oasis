import { Connection, PublicKey } from "@solana/web3.js";
import { getRPCEndpoint } from "@/config/env";

/**
 * Comprehensive account type classification for intelligent routing
 * This is the senior engineer solution for account type detection
 */

export type SolanaAccountType = 
  | "user_wallet"          // Regular user wallet (System Program owned)
  | "token_mint"           // SPL Token mint account
  | "token_account"        // SPL Token account (holds tokens)
  | "stake_account"        // Native Solana stake account
  | "validator_identity"   // Validator identity account
  | "validator_vote"       // Validator vote account
  | "program_account"      // Executable program/smart contract
  | "program_data"         // Program data account (upgradeable programs)
  | "nft_mint"            // NFT mint (token with 0 decimals, supply 1)
  | "multisig_account"     // Multisig wallet account
  | "unknown"             // Unclassified account type

export type AccountClassificationResult = {
  accountType: SolanaAccountType;
  confidence: number; // 0-1 confidence score
  routePath: string; // Suggested route path
  metadata?: {
    // Additional context for routing decisions
    isExecutable?: boolean;
    owner?: string;
    dataSize?: number;
    tokenInfo?: {
      decimals?: number;
      supply?: string;
      isNft?: boolean;
    };
    validatorInfo?: {
      isActive?: boolean;
      commission?: number;
      activatedStake?: string;
    };
  };
};

// Well-known program IDs for classification
const KNOWN_PROGRAMS = {
  SYSTEM: "11111111111111111111111111111111",
  STAKE: "Stake11111111111111111111111111111111111111",
  TOKEN: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  TOKEN_2022: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
  VOTE: "Vote111111111111111111111111111111111111111",
  CONFIG: "Config1111111111111111111111111111111111111",
  BPF_LOADER: "BPFLoaderUpgradeab1e11111111111111111111111",
  BPF_LOADER_DEPRECATED: "BPFLoader1111111111111111111111111111111111",
  BPF_LOADER_UPGRADEABLE: "BPFLoaderUpgradeab1e11111111111111111111111",
  METAPLEX_TOKEN_METADATA: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  ASSOCIATED_TOKEN: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  MEMO: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
  SERUM_DEX_V3: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  RAYDIUM_AMM_V4: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
  ORCA_WHIRLPOOL: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
} as const;

// NFT detection patterns
const NFT_INDICATORS = {
  MAX_NAME_LENGTH: 32,
  MAX_SYMBOL_LENGTH: 10,
  TYPICAL_URI_PATTERNS: [
    "arweave.net",
    "ipfs.io",
    "gateway.pinata.cloud",
    "metadata.json",
    ".json"
  ]
};

/**
 * Advanced account classifier that determines the type of Solana account
 * and suggests the appropriate route for the user interface
 */
export async function classifyAccount(params: {
  address: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
  rpcEndpoint?: string;
}): Promise<AccountClassificationResult> {
  const { address, network = "mainnet-beta", rpcEndpoint } = params;

  // Input validation
  let pubkey: PublicKey;
  try {
    pubkey = new PublicKey(address);
  } catch (error) {
    return {
      accountType: "unknown",
      confidence: 0,
      routePath: `/account/${address}`,
      metadata: {}
    };
  }

  const endpoint = rpcEndpoint ?? getRPCEndpoint(network);
  const connection = new Connection(endpoint, { commitment: "confirmed" });

  try {
    // Get parsed account info for detailed analysis
    const parsedAccountInfo = await connection.getParsedAccountInfo(pubkey, "confirmed");
    const accountInfo = parsedAccountInfo.value;

    if (!accountInfo) {
      return {
        accountType: "unknown",
        confidence: 0.1,
        routePath: `/account/${address}`,
        metadata: {}
      };
    }

    const owner = accountInfo.owner.toBase58();
    const lamports = accountInfo.lamports;
    const executable = accountInfo.executable;
    const data = accountInfo.data as any;

    // Start classification logic
    let accountType: SolanaAccountType = "unknown";
    let confidence = 0.5;
    let routePath = `/account/${address}`;
    let metadata: AccountClassificationResult["metadata"] = {
      isExecutable: executable,
      owner,
      dataSize: typeof data === "object" && data?.length ? data.length : 0,
    };

    // 1. Executable programs
    if (executable) {
      accountType = "program_account";
      confidence = 0.9;
      routePath = `/program/${address}`;
      
      // Check if it's an upgradeable program
      if (owner === KNOWN_PROGRAMS.BPF_LOADER_UPGRADEABLE) {
        confidence = 0.95;
        // Check if this is the program data account
        try {
          const programDataAddress = await getProgramDataAddress(pubkey);
          if (programDataAddress) {
            accountType = "program_data";
            routePath = `/program/${address}`;
          }
        } catch (e) {
          // Continue with regular program classification
        }
      }

      return { accountType, confidence, routePath, metadata };
    }

    // 2. System Program owned accounts (user wallets)
    if (owner === KNOWN_PROGRAMS.SYSTEM) {
      accountType = "user_wallet";
      confidence = 0.8;
      routePath = `/account/${address}`;

      // Higher confidence if account has SOL balance
      if (lamports > 0) {
        confidence = 0.9;
      }

      return { accountType, confidence, routePath, metadata };
    }

    // 3. Stake Program owned accounts
    if (owner === KNOWN_PROGRAMS.STAKE) {
      accountType = "stake_account";
      confidence = 0.95;
      routePath = `/stake/${address}`;
      
      // Extract stake account metadata
      if (data?.parsed) {
        const stakeInfo = data.parsed.info;
        metadata.stakeInfo = {
          state: data.parsed.type,
          staker: stakeInfo?.meta?.authorized?.staker,
          withdrawer: stakeInfo?.meta?.authorized?.withdrawer,
          voter: stakeInfo?.stake?.delegation?.voter,
        };
      }

      return { accountType, confidence, routePath, metadata };
    }

    // 4. Vote Program owned accounts (validators)
    if (owner === KNOWN_PROGRAMS.VOTE) {
      // Determine if this is validator identity or vote account
      try {
        const voteAccountInfo = await connection.getVoteAccounts();
        const isActiveValidator = voteAccountInfo.current.some(v => v.votePubkey === address) ||
                                 voteAccountInfo.delinquent.some(v => v.votePubkey === address);
        
        if (isActiveValidator) {
          accountType = "validator_vote";
          confidence = 0.98;
          routePath = `/validator/${address}`;
          
          const validatorInfo = [...voteAccountInfo.current, ...voteAccountInfo.delinquent]
            .find(v => v.votePubkey === address);
          
          if (validatorInfo) {
            metadata.validatorInfo = {
              isActive: voteAccountInfo.current.some(v => v.votePubkey === address),
              commission: validatorInfo.commission,
              activatedStake: validatorInfo.activatedStake.toString(),
            };
          }
        } else {
          accountType = "validator_identity";
          confidence = 0.85;
          routePath = `/validator/${address}`;
        }
      } catch (error) {
        accountType = "validator_vote";
        confidence = 0.7;
        routePath = `/validator/${address}`;
      }

      return { accountType, confidence, routePath, metadata };
    }

    // 5. SPL Token Program owned accounts
    if (owner === KNOWN_PROGRAMS.TOKEN || owner === KNOWN_PROGRAMS.TOKEN_2022) {
      if (data?.parsed?.type === "mint") {
        const mintInfo = data.parsed.info;
        const decimals = mintInfo?.decimals ?? 0;
        const supply = mintInfo?.supply ?? "0";
        
        // NFT detection heuristics
        const isNft = decimals === 0 && supply === "1";
        
        if (isNft) {
          accountType = "nft_mint";
          confidence = 0.9;
          routePath = `/nft/${address}`;
        } else {
          accountType = "token_mint";
          confidence = 0.95;
          routePath = `/token/${address}`;
        }

        metadata.tokenInfo = {
          decimals,
          supply,
          isNft,
        };

        // Try to get metadata for additional NFT confirmation
        if (isNft) {
          try {
            const metadataAccount = await getTokenMetadata(connection, pubkey);
            if (metadataAccount) {
              confidence = 0.98;
              metadata.nftMetadata = metadataAccount;
            }
          } catch (e) {
            // Metadata fetch failed, but still likely an NFT
          }
        }

        return { accountType, confidence, routePath, metadata };
      
      } else if (data?.parsed?.type === "account") {
        accountType = "token_account";
        confidence = 0.9;
        routePath = `/account/${address}`;

        const tokenInfo = data.parsed.info;
        metadata.tokenInfo = {
          mint: tokenInfo?.mint,
          owner: tokenInfo?.owner,
          amount: tokenInfo?.tokenAmount?.uiAmountString,
        };

        return { accountType, confidence, routePath, metadata };
      }
    }

    // 6. Additional program-specific classifications
    // Check for other well-known programs and their account types
    const programSpecificResult = await classifyProgramSpecificAccount(connection, pubkey, owner, data);
    if (programSpecificResult) {
      return programSpecificResult;
    }

    // 7. Fallback classification based on data patterns
    const fallbackResult = classifyByDataPatterns(pubkey, accountInfo);
    if (fallbackResult.confidence > 0.3) {
      return fallbackResult;
    }

    // Default unknown account
    return {
      accountType: "unknown",
      confidence: 0.1,
      routePath: `/account/${address}`,
      metadata
    };

  } catch (error) {
    console.error("Error classifying account:", error);
    return {
      accountType: "unknown",
      confidence: 0,
      routePath: `/account/${address}`,
      metadata: { error: (error as Error).message }
    };
  }
}

/**
 * Get the program data address for an upgradeable program
 */
async function getProgramDataAddress(programId: PublicKey): Promise<PublicKey | null> {
  try {
    const [programDataAddress] = PublicKey.findProgramAddressSync(
      [programId.toBuffer()],
      new PublicKey(KNOWN_PROGRAMS.BPF_LOADER_UPGRADEABLE)
    );
    return programDataAddress;
  } catch {
    return null;
  }
}

/**
 * Get token metadata for potential NFTs
 */
async function getTokenMetadata(connection: Connection, mint: PublicKey) {
  try {
    const metadataProgramId = new PublicKey(KNOWN_PROGRAMS.METAPLEX_TOKEN_METADATA);
    const [metadataAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("metadata"), metadataProgramId.toBuffer(), mint.toBuffer()],
      metadataProgramId
    );

    const accountInfo = await connection.getAccountInfo(metadataAddress);
    if (accountInfo) {
      // Basic metadata parsing (simplified)
      return {
        address: metadataAddress.toBase58(),
        exists: true,
      };
    }
  } catch {
    // Metadata doesn't exist or failed to fetch
  }
  return null;
}

/**
 * Classify accounts owned by specific programs
 */
async function classifyProgramSpecificAccount(
  connection: Connection,
  pubkey: PublicKey,
  owner: string,
  data: any
): Promise<AccountClassificationResult | null> {
  // Add specific program account classifications here
  
  // Multisig detection (common patterns)
  if (data && typeof data === "object" && data.length > 0) {
    // Check for common multisig program patterns
    // This is a simplified check - would need specific program analysis
    const commonMultisigPrograms = [
      "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", // Serum
      "SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvQT5ZqaB", // Squads
    ];

    if (commonMultisigPrograms.includes(owner)) {
      return {
        accountType: "multisig_account",
        confidence: 0.8,
        routePath: `/multisig/${pubkey.toBase58()}`,
        metadata: { owner }
      };
    }
  }

  return null;
}

/**
 * Classify based on data patterns when program owner doesn't give clear indication
 */
function classifyByDataPatterns(
  pubkey: PublicKey,
  accountInfo: any
): AccountClassificationResult {
  const address = pubkey.toBase58();
  const dataSize = accountInfo.data?.length || 0;

  // Pattern-based classification
  if (dataSize === 0) {
    return {
      accountType: "user_wallet",
      confidence: 0.3,
      routePath: `/account/${address}`,
      metadata: { dataSize }
    };
  }

  // Large data accounts are likely programs or program data
  if (dataSize > 10000) {
    return {
      accountType: "program_data",
      confidence: 0.4,
      routePath: `/program/${address}`,
      metadata: { dataSize }
    };
  }

  return {
    accountType: "unknown",
    confidence: 0.2,
    routePath: `/account/${address}`,
    metadata: { dataSize }
  };
}

/**
 * Smart router that determines the best route for an address
 * UNIFIED APPROACH: All accounts route to /account/{address} except validators
 * This is the main function to use in your search components
 */
export async function getSmartRoute(params: {
  address: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
  fallbackRoute?: string;
}): Promise<{
  route: string;
  accountType: SolanaAccountType;
  confidence: number;
  shouldRedirect: boolean;
}> {
  const { address, network, fallbackRoute = `/account/${address}` } = params;

  try {
    const classification = await classifyAccount({ address, network });
    
    // Unified routing: everything goes to /account except validators
    let route = `/account/${address}`;
    if (classification.accountType === "validator_identity" || 
        classification.accountType === "validator_vote") {
      route = `/validator/${address}`;
    }
    
    // Only redirect if confidence is high enough
    const shouldRedirect = classification.confidence >= 0.7;
    
    return {
      route: shouldRedirect ? route : fallbackRoute,
      accountType: classification.accountType,
      confidence: classification.confidence,
      shouldRedirect
    };
  } catch (error) {
    console.error("Smart routing failed:", error);
    return {
      route: fallbackRoute,
      accountType: "unknown",
      confidence: 0,
      shouldRedirect: false
    };
  }
}

/**
 * Batch classify multiple addresses (useful for search results)
 */
export async function batchClassifyAccounts(params: {
  addresses: string[];
  network?: "mainnet-beta" | "testnet" | "devnet";
}): Promise<Map<string, AccountClassificationResult>> {
  const { addresses, network } = params;
  const results = new Map<string, AccountClassificationResult>();

  // Process in batches to avoid RPC rate limits
  const batchSize = 10;
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (address) => {
      const result = await classifyAccount({ address, network });
      return [address, result] as const;
    });

    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result) => {
      if (result.status === "fulfilled") {
        const [address, classification] = result.value;
        results.set(address, classification);
      }
    });
  }

  return results;
}