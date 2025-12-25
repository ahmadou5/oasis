import { classifyAccount, getSmartRoute, type SolanaAccountType } from "./accountClassifier";

/**
 * Smart Router Service - Routes addresses to appropriate pages based on account type
 * Senior Engineer Solution for Intelligent Address Routing
 */

export interface SmartRouteResult {
  route: string;
  accountType: SolanaAccountType;
  confidence: number;
  shouldRedirect: boolean;
  displayName: string;
  icon: string;
  description: string;
}

/**
 * Get display information for each account type
 */
function getAccountTypeDisplayInfo(accountType: SolanaAccountType): {
  displayName: string;
  icon: string;
  description: string;
} {
  const displayInfo = {
    user_wallet: {
      displayName: "Wallet",
      icon: "👤",
      description: "Regular user wallet account"
    },
    token_mint: {
      displayName: "Token",
      icon: "🪙",
      description: "SPL token mint"
    },
    token_account: {
      displayName: "Token Account",
      icon: "💰",
      description: "SPL token account"
    },
    stake_account: {
      displayName: "Stake Account",
      icon: "🔒",
      description: "Native stake account"
    },
    validator_identity: {
      displayName: "Validator",
      icon: "⚡",
      description: "Validator identity"
    },
    validator_vote: {
      displayName: "Validator",
      icon: "🗳️",
      description: "Validator vote account"
    },
    program_account: {
      displayName: "Program",
      icon: "⚙️",
      description: "Executable program"
    },
    program_data: {
      displayName: "Program Data",
      icon: "📊",
      description: "Program data account"
    },
    nft_mint: {
      displayName: "NFT",
      icon: "🖼️",
      description: "Non-fungible token"
    },
    multisig_account: {
      displayName: "Multisig",
      icon: "🔐",
      description: "Multisig wallet"
    },
    unknown: {
      displayName: "Account",
      icon: "❓",
      description: "Unknown account type"
    }
  } as const;

  return displayInfo[accountType] || displayInfo.unknown;
}

/**
 * Enhanced smart routing with display information
 */
export async function getEnhancedSmartRoute(params: {
  address: string;
  network?: "mainnet-beta" | "testnet" | "devnet";
}): Promise<SmartRouteResult> {
  const { address, network } = params;

  try {
    const smartRoute = await getSmartRoute({ address, network });
    const displayInfo = getAccountTypeDisplayInfo(smartRoute.accountType);

    return {
      ...smartRoute,
      ...displayInfo
    };
  } catch (error) {
    console.error("Enhanced smart routing failed:", error);
    const fallbackInfo = getAccountTypeDisplayInfo("unknown");
    
    return {
      route: `/account/${address}`,
      accountType: "unknown",
      confidence: 0,
      shouldRedirect: false,
      ...fallbackInfo
    };
  }
}

/**
 * Route mapping for different account types
 * UNIFIED APPROACH: All account types route to /account/{address}
 * The account page will detect the type and render the appropriate view
 */
export const ROUTE_MAPPINGS = {
  // All account types route to the unified account page
  user_wallet: (address: string) => `/account/${address}`,
  token_mint: (address: string) => `/account/${address}`,
  token_account: (address: string) => `/account/${address}`,
  nft_mint: (address: string) => `/account/${address}`,
  stake_account: (address: string) => `/account/${address}`,
  
  // Validators have their own specialized page (existing)
  validator_identity: (address: string) => `/validator/${address}`,
  validator_vote: (address: string) => `/validator/${address}`,
  
  // Programs can have specialized view in account page
  program_account: (address: string) => `/account/${address}`,
  program_data: (address: string) => `/account/${address}`,
  
  // Multisig
  multisig_account: (address: string) => `/account/${address}`,
  
  // Fallback
  unknown: (address: string) => `/account/${address}`
} as const;

/**
 * Get route for a specific account type
 */
export function getRouteForAccountType(
  accountType: SolanaAccountType,
  address: string
): string {
  const routeFunc = ROUTE_MAPPINGS[accountType] || ROUTE_MAPPINGS.unknown;
  return routeFunc(address);
}

/**
 * Check if we have a dedicated page for the account type
 * With unified approach, only validators have separate pages
 */
export function hasSpecializedPage(accountType: SolanaAccountType): boolean {
  const specializedTypes: SolanaAccountType[] = [
    "validator_identity",
    "validator_vote"
  ];
  
  return specializedTypes.includes(accountType);
}

/**
 * Check if account type should render a specialized view within /account page
 */
export function hasSpecializedView(accountType: SolanaAccountType): boolean {
  const specializedViewTypes: SolanaAccountType[] = [
    "token_mint",
    "nft_mint",
    "stake_account",
    "program_account",
    "program_data"
  ];
  
  return specializedViewTypes.includes(accountType);
}

/**
 * Get search suggestions based on account classification
 */
export function getSearchSuggestions(accountType: SolanaAccountType): {
  title: string;
  actions: Array<{
    label: string;
    description: string;
    route?: string;
  }>;
} {
  switch (accountType) {
    case "user_wallet":
      return {
        title: "Wallet Actions",
        actions: [
          { label: "View Balance", description: "See SOL and token balances" },
          { label: "Transaction History", description: "View recent transactions" },
          { label: "Stake Accounts", description: "View associated stake accounts" },
        ]
      };
      
    case "validator_identity":
    case "validator_vote":
      return {
        title: "Validator Actions", 
        actions: [
          { label: "Performance", description: "View validator performance metrics" },
          { label: "Commission", description: "Check commission rates" },
          { label: "Delegators", description: "See who delegates to this validator" },
        ]
      };
      
    case "stake_account":
      return {
        title: "Stake Account Actions",
        actions: [
          { label: "Delegation Info", description: "View delegation details" },
          { label: "Rewards", description: "Check earning history" },
          { label: "Withdraw", description: "Manage stake withdrawal" },
        ]
      };
      
    case "token_mint":
      return {
        title: "Token Actions",
        actions: [
          { label: "Token Info", description: "View token metadata" },
          { label: "Holders", description: "See top token holders" },
          { label: "Transfers", description: "View recent transfers" },
        ]
      };
      
    case "nft_mint":
      return {
        title: "NFT Actions",
        actions: [
          { label: "Metadata", description: "View NFT details and image" },
          { label: "Owner", description: "See current owner" },
          { label: "History", description: "View transfer history" },
        ]
      };
      
    case "program_account":
      return {
        title: "Program Actions",
        actions: [
          { label: "Program Info", description: "View program details" },
          { label: "Accounts", description: "See program-owned accounts" },
          { label: "Usage", description: "View program usage statistics" },
        ]
      };
      
    default:
      return {
        title: "Account Actions",
        actions: [
          { label: "View Details", description: "See account information" },
          { label: "Transactions", description: "View transaction history" },
        ]
      };
  }
}

/**
 * Navigation helper for the UI
 */
export function navigateToAccount(address: string, network?: "mainnet-beta" | "testnet" | "devnet") {
  return getEnhancedSmartRoute({ address, network });
}

/**
 * Batch process multiple addresses for search results
 */
export async function batchProcessSearchResults(
  addresses: string[],
  network?: "mainnet-beta" | "testnet" | "devnet"
): Promise<Map<string, SmartRouteResult>> {
  const results = new Map<string, SmartRouteResult>();
  
  // Process in smaller batches to avoid overwhelming RPC
  const batchSize = 5;
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (address) => {
      const result = await getEnhancedSmartRoute({ address, network });
      return [address, result] as const;
    });

    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result) => {
      if (result.status === "fulfilled") {
        const [address, smartRoute] = result.value;
        results.set(address, smartRoute);
      }
    });
    
    // Small delay between batches to be nice to RPC
    if (i + batchSize < addresses.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}