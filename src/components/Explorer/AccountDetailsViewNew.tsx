"use client";

import { useState, useEffect } from "react";
import { Copy, ExternalLink, RefreshCw, Check, Coins } from "lucide-react";
import type { AccountOverview } from "@/lib/solana/accountOverview";
import { formatDistanceToNow } from "date-fns";
import { fetchUserTokenHoldings, type TokenHolding } from "@/lib/solana/tokenMetadata";

interface CopyState {
  [key: string]: boolean;
}

function formatTime(blockTime?: number | null) {
  if (!blockTime) return "Unknown";
  try {
    return formatDistanceToNow(new Date(blockTime * 1000), { addSuffix: true });
  } catch {
    return "Unknown";
  }
}

function formatFullTime(blockTime?: number | null) {
  if (!blockTime) return "Unknown";
  try {
    return new Date(blockTime * 1000).toISOString().replace('T', ' ').replace('.000Z', ' UTC');
  } catch {
    return "Unknown";
  }
}

function truncateHash(hash: string, startChars = 8, endChars = 8) {
  if (hash.length <= startChars + endChars + 3) return hash;
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}

function formatDataSize(bytes?: number) {
  if (!bytes) return "0 bytes";
  if (bytes < 1024) return `${bytes} bytes`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function AccountDetailsViewNew({ data }: { data: AccountOverview }) {
  const [activeTab, setActiveTab] = useState<"history" | "tokens" | "domains">("history");
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStates({ ...copyStates, [key]: true });
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh - in real app this would reload data
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Fetch token holdings when tokens tab is active
  useEffect(() => {
    if (activeTab === "tokens" && tokenHoldings.length === 0 && !loadingTokens) {
      loadTokenHoldings();
    }
  }, [activeTab]);

  const loadTokenHoldings = async () => {
    setLoadingTokens(true);
    try {
      const holdings = await fetchUserTokenHoldings({
        walletAddress: data.pubkey,
        network: data.network,
      });
      setTokenHoldings(holdings);
    } catch (error) {
      console.error("Failed to load token holdings:", error);
    } finally {
      setLoadingTokens(false);
    }
  };

  const CopyButton = ({ text, copyKey, className = "" }: { text: string; copyKey: string; className?: string }) => (
    <button
      onClick={() => handleCopy(text, copyKey)}
      className={`p-1 rounded hover:bg-gray-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50 ${className}`}
      title="Copy to clipboard"
      aria-label={`Copy ${copyKey} to clipboard`}
    >
      {copyStates[copyKey] ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <Copy className="h-4 w-4 text-gray-400 hover:text-white" />
      )}
    </button>
  );

  const ExternalLinkButton = ({ href, className = "" }: { href: string; className?: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`p-1 rounded hover:bg-gray-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50 ${className}`}
      title="Open in new tab"
      aria-label="Open in new tab"
    >
      <ExternalLink className="h-4 w-4 text-gray-400 hover:text-emerald-400" />
    </a>
  );

  if (!data.found) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="text-center">
          <div className="text-red-400 text-lg font-semibold">Account Not Found</div>
          <div className="text-gray-400 mt-2">
            The account <span className="font-mono text-sm break-all">{data.pubkey}</span> does not exist on {data.network}.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="space-y-4">
          {/* Address Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div className="text-gray-400 text-sm font-medium">Address</div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-white text-sm break-all max-w-full sm:max-w-md truncate">
                {data.pubkey}
              </span>
              <CopyButton text={data.pubkey} copyKey="address" />
            </div>
          </div>

          {/* Balance Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div className="text-gray-400 text-sm font-medium">Balance (SOL)</div>
            <div className="text-white font-semibold">
              {typeof data.sol === "number" 
                ? `${data.sol.toLocaleString(undefined, { maximumFractionDigits: 9 })} SOL`
                : "-"
              }
            </div>
          </div>

          {/* Allocated Data Size Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div className="text-gray-400 text-sm font-medium">Allocated Data Size</div>
            <div className="text-white">
              {formatDataSize(data.dataLength)}
            </div>
          </div>

          {/* Assigned Program Id Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div className="text-gray-400 text-sm font-medium">Assigned Program Id</div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-emerald-400 text-sm break-all max-w-full sm:max-w-md truncate">
                {data.owner || "-"}
              </span>
              {data.owner && (
                <>
                  <CopyButton text={data.owner} copyKey="owner" />
                  <ExternalLinkButton href={`/account/${data.owner}`} />
                </>
              )}
            </div>
          </div>

          {/* Executable Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div className="text-gray-400 text-sm font-medium">Executable</div>
            <div className="text-white">
              {data.executable ? "Yes" : "No"}
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-700">
          {[
            { id: "history", label: "History" },
            { id: "tokens", label: "Tokens" },
            { id: "domains", label: "Domains" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 text-sm font-medium transition-colors duration-200 relative focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50 ${
                activeTab === tab.id
                  ? "text-emerald-400 border-b-2 border-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "history" && (
            <div>
              {/* Transaction History Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-lg font-semibold">Transaction History</h3>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
                  title="Refresh transactions"
                >
                  <RefreshCw className={`h-4 w-4 text-gray-400 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Transaction Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Transaction Signature</th>
                      <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Block</th>
                      <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Age</th>
                      <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Timestamp</th>
                      <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.walletSignatures ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      (data.walletSignatures ?? []).map((tx, index) => (
                        <tr 
                          key={tx.signature}
                          className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors duration-150 ${
                            index % 2 === 0 ? "bg-gray-900/20" : "bg-transparent"
                          }`}
                        >
                          {/* Transaction Signature */}
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <a
                                href={`/tx/${tx.signature}`}
                                className="font-mono text-sm text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
                              >
                                {truncateHash(tx.signature, 8, 8)}
                              </a>
                              <CopyButton text={tx.signature} copyKey={`tx-${tx.signature}`} />
                            </div>
                          </td>

                          {/* Block */}
                          <td className="py-3 px-2">
                            <a
                              href={`https://explorer.solana.com/block/${tx.slot}?cluster=${data.network}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
                            >
                              {tx.slot.toLocaleString()}
                            </a>
                          </td>

                          {/* Age */}
                          <td className="py-3 px-2 text-gray-300 text-sm">
                            {formatTime(tx.blockTime)}
                          </td>

                          {/* Timestamp */}
                          <td className="py-3 px-2 text-gray-300 text-sm font-mono">
                            {formatFullTime(tx.blockTime)}
                          </td>

                          {/* Result */}
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              tx.err
                                ? "bg-red-900/30 text-red-400 border border-red-800/50"
                                : "bg-emerald-900/30 text-emerald-400 border border-emerald-800/50"
                            }`}>
                              {tx.err ? "Failed" : "Success"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "tokens" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-lg font-semibold">Token Holdings</h3>
                <button
                  onClick={loadTokenHoldings}
                  disabled={loadingTokens}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
                  title="Refresh tokens"
                >
                  <RefreshCw className={`h-4 w-4 text-gray-400 ${loadingTokens ? "animate-spin" : ""}`} />
                </button>
              </div>

              {loadingTokens ? (
                <div className="text-center py-8 text-gray-400">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-emerald-400" />
                  <div>Loading token holdings...</div>
                </div>
              ) : tokenHoldings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Coins className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <div>No token holdings found</div>
                  <div className="text-sm mt-1">This wallet doesn't hold any SPL tokens</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {tokenHoldings.map((holding) => {
                    const metadata = holding.metadata;
                    const hasMetadata = metadata && (metadata.name || metadata.symbol);

                    return (
                      <div 
                        key={holding.tokenAccount} 
                        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {/* Token Logo */}
                          <div className="flex-shrink-0">
                            {metadata?.logoURI ? (
                              <img
                                src={metadata.logoURI}
                                alt={metadata.name || "Token"}
                                className="w-12 h-12 rounded-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling!.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${metadata?.logoURI ? 'hidden' : ''}`}>
                              <Coins className="w-6 h-6 text-white" />
                            </div>
                          </div>

                          {/* Token Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="text-white font-semibold text-lg">
                                {metadata?.name || "Unknown Token"}
                              </div>
                              {metadata?.symbol && (
                                <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs font-medium">
                                  {metadata.symbol}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <a
                                href={`/account/${holding.mint}`}
                                className="text-emerald-400 hover:text-emerald-300 font-mono"
                              >
                                {truncateHash(holding.mint, 4, 4)}
                              </a>
                              <CopyButton text={holding.mint} copyKey={`mint-${holding.mint}`} />
                            </div>

                            {metadata?.description && (
                              <div className="text-gray-400 text-xs mt-1 line-clamp-1">
                                {metadata.description}
                              </div>
                            )}
                          </div>

                          {/* Token Balance */}
                          <div className="text-right">
                            <div className="text-white text-xl font-bold">
                              {holding.uiAmount.toLocaleString(undefined, {
                                maximumFractionDigits: holding.decimals > 6 ? 6 : holding.decimals
                              })}
                            </div>
                            <div className="text-gray-400 text-xs mt-1">
                              {metadata?.symbol || "tokens"}
                            </div>
                            {metadata?.source && (
                              <div className="text-gray-500 text-xs mt-1">
                                {metadata.source === "metaplex" && "📝 On-chain"}
                                {metadata.source === "token-registry" && "✓ Verified"}
                                {metadata.source === "off-chain" && "🌐 Metadata"}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Additional Links */}
                        {(metadata?.website || metadata?.twitter) && (
                          <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-3 text-xs">
                            {metadata.website && (
                              <a
                                href={metadata.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Website
                              </a>
                            )}
                            {metadata.twitter && (
                              <a
                                href={metadata.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Twitter
                              </a>
                            )}
                            {metadata.coingeckoId && (
                              <a
                                href={`https://www.coingecko.com/en/coins/${metadata.coingeckoId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                CoinGecko
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "domains" && (
            <div>
              <h3 className="text-white text-lg font-semibold mb-6">Domains</h3>
              <div className="text-center py-8 text-gray-500">
                Domain information not available
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}