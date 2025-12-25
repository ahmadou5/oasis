"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton, SkeletonText } from "@/components/Skeleton";
import type { AccountOverview } from "@/lib/solana/accountOverview";
import { AccountDetailsViewNew } from "@/components/Explorer/AccountDetailsViewNew";
import { EnhancedWalletView } from "@/components/Wallet/EnhancedWalletView";
import { EnhancedProgramView } from "@/components/Program/EnhancedProgramView";
import { classifyAccount, type SolanaAccountType } from "@/lib/solana/accountClassifier";
import { TokenDetailsView } from "@/components/Token/TokenDetailsView";
import { EnhancedTokenView } from "@/components/Token/EnhancedTokenView";
import { StakeDetailsView } from "@/components/Stake/StakeDetailsView";
import type { TokenMintDetails } from "@/lib/solana/tokenDetails";
import type { StakeAccountDetails } from "@/lib/solana/stakeDetails";
import { fetchTokenDetails } from "@/lib/solana/tokenDetails";
import { fetchStakeDetails } from "@/lib/solana/stakeDetails";
import { fetchTokenMetadata, type TokenMetadata } from "@/lib/solana/tokenMetadata";
import { 
  Wallet, 
  Coins, 
  Shield, 
  Settings, 
  Image as ImageIcon,
  Users,
  AlertCircle,
  Copy,
  Check
} from "lucide-react";
import { resolveAddressToDomain, type SNSResolveResult } from "@/lib/solana/snsResolver";

// Get appropriate icon for account type
function getAccountTypeIcon(accountType: SolanaAccountType) {
  const iconMap = {
    user_wallet: <Wallet className="w-6 h-6" />,
    token_mint: <Coins className="w-6 h-6" />,
    token_account: <Wallet className="w-6 h-6" />,
    stake_account: <Shield className="w-6 h-6" />,
    nft_mint: <ImageIcon className="w-6 h-6" />,
    program_account: <Settings className="w-6 h-6" />,
    program_data: <Settings className="w-6 h-6" />,
    multisig_account: <Users className="w-6 h-6" />,
    validator_identity: <Shield className="w-6 h-6" />,
    validator_vote: <Shield className="w-6 h-6" />,
    unknown: <AlertCircle className="w-6 h-6" />,
  };
  return iconMap[accountType] || iconMap.unknown;
}

// Get title for account type
function getAccountTypeTitle(accountType: SolanaAccountType) {
  const titleMap = {
    user_wallet: "Wallet Account",
    token_mint: "Token Mint",
    token_account: "Token Account",
    stake_account: "Stake Account",
    nft_mint: "NFT",
    program_account: "Program",
    program_data: "Program Data",
    multisig_account: "Multisig Account",
    validator_identity: "Validator Identity",
    validator_vote: "Validator Vote Account",
    unknown: "Account",
  };
  return titleMap[accountType] || "Account";
}

export default function AccountPage() {
  const params = useParams<{ pubkey: string }>();
  const pubkey = params.pubkey;

  const [data, setData] = useState<AccountOverview | null>(null);
  const [accountType, setAccountType] = useState<SolanaAccountType>("unknown");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<TokenMintDetails | null>(null);
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata | null>(null);
  const [stakeData, setStakeData] = useState<StakeAccountDetails | null>(null);
  const [snsDomain, setSnsDomain] = useState<string | null>(null);
  const [loadingDomain, setLoadingDomain] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Classify the account type first
        const classification = await classifyAccount({ 
          address: pubkey,
          network: "mainnet-beta" 
        });
        
        if (!cancelled) {
          setAccountType(classification.accountType);
        }

        // Fetch SNS domain for wallet accounts
        if (classification.accountType === "user_wallet") {
          setLoadingDomain(true);
          try {
            const snsResult = await resolveAddressToDomain({ 
              address: pubkey,
              network: "mainnet-beta" 
            });
            if (!cancelled && snsResult.hasDomain && snsResult.domain) {
              setSnsDomain(snsResult.domain);
            }
          } catch (err) {
            console.error("Failed to resolve SNS domain:", err);
          } finally {
            if (!cancelled) setLoadingDomain(false);
          }
        }

        // Fetch appropriate data based on account type
        if (classification.accountType === "token_mint" || classification.accountType === "nft_mint") {
          // Fetch token-specific data
          const [tokenDetails, metadata] = await Promise.all([
            fetchTokenDetails({ address: pubkey, network: "mainnet-beta" }),
            fetchTokenMetadata({ mint: pubkey, network: "mainnet-beta" })
          ]);
          
          if (!cancelled) {
            setTokenData(tokenDetails);
            setTokenMetadata(metadata);
            // Also set basic data for fallback
            const res = await fetch(
              `/api/explorer/account/${encodeURIComponent(pubkey)}`,
              { cache: "no-store" }
            );
            if (res.ok) {
              const json = (await res.json()) as AccountOverview;
              setData(json);
            }
          }
        } else if (classification.accountType === "stake_account") {
          // Fetch stake-specific data
          const stakeDetails = await fetchStakeDetails({ 
            address: pubkey, 
            network: "mainnet-beta" 
          });
          if (!cancelled) {
            setStakeData(stakeDetails);
            // Also set basic data for fallback
            const res = await fetch(
              `/api/explorer/account/${encodeURIComponent(pubkey)}`,
              { cache: "no-store" }
            );
            if (res.ok) {
              const json = (await res.json()) as AccountOverview;
              setData(json);
            }
          }
        } else {
          // Fetch standard account data
          const res = await fetch(
            `/api/explorer/account/${encodeURIComponent(pubkey)}`,
            { cache: "no-store" }
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = (await res.json()) as AccountOverview;
          if (!cancelled) setData(json);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load account");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (pubkey) load();
    return () => {
      cancelled = true;
    };
  }, [pubkey]);

  // Render appropriate view based on account type
  const renderAccountView = () => {
    // For token mints, use enhanced token view
    if ((accountType === "token_mint" || accountType === "nft_mint") && tokenData) {
      return <EnhancedTokenView data={tokenData} metadata={tokenMetadata || undefined} />;
    }

    // For stake accounts, use fetched stake data
    if (accountType === "stake_account" && stakeData) {
      return <StakeDetailsView data={stakeData} />;
    }

    // For user wallets, use enhanced wallet view
    if (accountType === "user_wallet" && data) {
      return <EnhancedWalletView data={data} />;
    }

    // For programs, use enhanced program view
    if ((accountType === "program_account" || accountType === "program_data") && data) {
      return <EnhancedProgramView data={data} />;
    }

    // Default: render standard account view for other types
    if (data) {
      return <AccountDetailsViewNew data={data} />;
    }

    return null;
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(pubkey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
            {getAccountTypeIcon(accountType)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {getAccountTypeTitle(accountType)}
              </h1>
              {snsDomain && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-700/50 rounded-lg">
                  <span className="text-purple-300 font-semibold text-sm">{snsDomain}</span>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                </div>
              )}
              {loadingDomain && (
                <div className="px-3 py-1 bg-gray-800 rounded-lg">
                  <span className="text-gray-400 text-xs">Loading domain...</span>
                </div>
              )}
            </div>
            
            {/* Address Display */}
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                {pubkey}
              </p>
              <button
                onClick={handleCopyAddress}
                className="p-1 rounded hover:bg-gray-800 transition-colors"
                title="Copy address"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500 hover:text-gray-300" />
                )}
              </button>
            </div>

            {accountType !== "unknown" && (
              <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">
                Detected account type: {accountType.replace(/_/g, " ")}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        {loading && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
              <Skeleton width="w-1/3" height="h-6" />
              <div className="mt-4 grid gap-3">
                <Skeleton height="h-10" />
                <SkeletonText lines={5} />
              </div>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
            <div className="text-red-400 text-lg font-semibold">Error</div>
            <div className="text-red-300 mt-2">{error}</div>
          </div>
        )}

        {!loading && !error && data && renderAccountView()}
      </div>
    </div>
  );
}
