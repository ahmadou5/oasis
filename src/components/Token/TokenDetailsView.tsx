"use client";

import { useState, useEffect } from "react";
import { 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Check,
  Coins,
  Users,
  TrendingUp,
  Activity,
  Image as ImageIcon,
  Globe,
  Info,
  Twitter,
  MessageCircle
} from "lucide-react";
import type { TokenMintDetails } from "@/lib/solana/tokenDetails";
import { fetchTokenMetadata, type TokenMetadata } from "@/lib/solana/tokenMetadata";

interface CopyState {
  [key: string]: boolean;
}

function formatNumber(num: number, decimals = 2): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
  return num.toLocaleString(undefined, { maximumFractionDigits: decimals });
}

function truncateAddress(address: string, start = 4, end = 4): string {
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function TokenDetailsView({ data }: { data: TokenMintDetails }) {
  const [activeTab, setActiveTab] = useState<"overview" | "holders" | "transfers">("overview");
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const [enrichedMetadata, setEnrichedMetadata] = useState<TokenMetadata | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  // Fetch rich metadata on mount
  useEffect(() => {
    async function loadMetadata() {
      try {
        const metadata = await fetchTokenMetadata({ 
          mint: data.address,
          network: data.network 
        });
        setEnrichedMetadata(metadata);
      } catch (error) {
        console.error("Failed to load token metadata:", error);
      } finally {
        setLoadingMetadata(false);
      }
    }
    loadMetadata();
  }, [data.address, data.network]);

  // Merge metadata from props and fetched data
  const displayMetadata = enrichedMetadata || data.metadata || {};

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

  const CopyButton = ({ text, copyKey, className = "" }: { text: string; copyKey: string; className?: string }) => (
    <button
      onClick={() => handleCopy(text, copyKey)}
      className={`p-1 rounded hover:bg-gray-700/50 transition-colors duration-200 ${className}`}
      title="Copy to clipboard"
    >
      {copyStates[copyKey] ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <Copy className="h-4 w-4 text-gray-400 hover:text-white" />
      )}
    </button>
  );

  if (!data.found) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="text-center">
          <div className="text-red-400 text-lg font-semibold">Token Not Found</div>
          <div className="text-gray-400 mt-2">
            The token mint <span className="font-mono text-sm break-all">{data.address}</span> does not exist on {data.network}.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Token Overview Card */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="flex items-start gap-4">
          {/* Token Image/Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-2xl relative">
            {displayMetadata?.logoURI ? (
              <img 
                src={displayMetadata.logoURI} 
                alt={displayMetadata?.name || "Token"} 
                className="w-full h-full rounded-xl object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling!.classList.remove('hidden');
                }}
              />
            ) : null}
            <Coins className={`w-10 h-10 text-white ${displayMetadata?.logoURI ? 'hidden' : ''}`} />
            
            {/* Loading indicator */}
            {loadingMetadata && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Token Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-2xl font-bold text-white">
                {displayMetadata?.name || "Unknown Token"}
              </h2>
              {displayMetadata?.symbol && (
                <span className="px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-sm font-medium">
                  {displayMetadata.symbol}
                </span>
              )}
              {data.isNft && (
                <span className="px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full text-sm font-medium">
                  NFT
                </span>
              )}
              {enrichedMetadata?.source && (
                <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs">
                  {enrichedMetadata.source === "metaplex" && "📝 On-chain Metadata"}
                  {enrichedMetadata.source === "token-registry" && "✓ Verified Token"}
                  {enrichedMetadata.source === "off-chain" && "🌐 Off-chain Metadata"}
                  {enrichedMetadata.source === "fallback" && "⚠️ Limited Data"}
                </span>
              )}
            </div>

            {displayMetadata?.description && (
              <p className="text-gray-300 text-sm mb-4 max-w-2xl">
                {displayMetadata.description}
              </p>
            )}

            {/* Social Links */}
            {(displayMetadata?.website || displayMetadata?.twitter || displayMetadata?.telegram) && (
              <div className="flex items-center gap-3 mb-4">
                {displayMetadata.website && (
                  <a
                    href={displayMetadata.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
                {displayMetadata.twitter && (
                  <a
                    href={displayMetadata.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                )}
                {displayMetadata.telegram && (
                  <a
                    href={displayMetadata.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Telegram
                  </a>
                )}
                {displayMetadata.coingeckoId && (
                  <a
                    href={`https://www.coingecko.com/en/coins/${displayMetadata.coingeckoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-yellow-400 hover:text-yellow-300"
                  >
                    <TrendingUp className="w-4 h-4" />
                    CoinGecko
                  </a>
                )}
              </div>
            )}

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Total Supply</div>
                <div className="text-white font-semibold">
                  {(enrichedMetadata?.supply || data.supply) && (enrichedMetadata?.decimals || data.decimals) !== undefined 
                    ? formatNumber(Number(enrichedMetadata?.supply || data.supply) / Math.pow(10, enrichedMetadata?.decimals || data.decimals || 0))
                    : "-"
                  }
                </div>
              </div>
              <div>
                <div className="text-gray-400">Decimals</div>
                <div className="text-white font-semibold">{enrichedMetadata?.decimals ?? data.decimals ?? "-"}</div>
              </div>
              <div>
                <div className="text-gray-400">Holders</div>
                <div className="text-white font-semibold">{data.holders ? formatNumber(data.holders) : "-"}</div>
              </div>
              <div>
                <div className="text-gray-400">Status</div>
                <div className="text-emerald-400 font-semibold">
                  {data.isInitialized ? "Initialized" : "Not Initialized"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Token Address */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Token Address</div>
              <div className="text-white font-mono text-sm break-all">{data.address}</div>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton text={data.address} copyKey="address" />
              <a
                href={`https://explorer.solana.com/address/${data.address}?cluster=${data.network}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-gray-700/50 transition-colors"
                title="View on Solana Explorer"
              >
                <ExternalLink className="h-4 w-4 text-gray-400 hover:text-emerald-400" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Authorities */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Authorities</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">Mint Authority</div>
              <div className="flex items-center gap-2">
                {data.mintAuthority ? (
                  <>
                    <span className="text-white font-mono text-sm">
                      {truncateAddress(data.mintAuthority)}
                    </span>
                    <CopyButton text={data.mintAuthority} copyKey="mintAuth" />
                  </>
                ) : (
                  <span className="text-red-400 text-sm">Disabled</span>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">Freeze Authority</div>
              <div className="flex items-center gap-2">
                {data.freezeAuthority ? (
                  <>
                    <span className="text-white font-mono text-sm">
                      {truncateAddress(data.freezeAuthority)}
                    </span>
                    <CopyButton text={data.freezeAuthority} copyKey="freezeAuth" />
                  </>
                ) : (
                  <span className="text-red-400 text-sm">Disabled</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-700">
          {[
            { id: "overview", label: "Overview", icon: Info },
            { id: "holders", label: "Top Holders", icon: Users },
            { id: "transfers", label: "Recent Transfers", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? "text-emerald-400 border-b-2 border-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {(displayMetadata?.metadataUri || data.metadata?.uri) && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Metadata URI</h4>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a
                      href={displayMetadata?.metadataUri || data.metadata?.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 text-sm break-all"
                    >
                      {displayMetadata?.metadataUri || data.metadata?.uri}
                    </a>
                  </div>
                </div>
              )}

              {displayMetadata?.updateAuthority && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Update Authority</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-mono text-sm break-all">
                      {displayMetadata.updateAuthority}
                    </span>
                    <CopyButton text={displayMetadata.updateAuthority} copyKey="updateAuth" />
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-white font-semibold mb-4">Token Statistics</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-400 text-sm">Supply</span>
                    </div>
                    <div className="text-white text-lg font-semibold">
                      {data.supply && data.decimals !== undefined 
                        ? formatNumber(Number(data.supply) / Math.pow(10, data.decimals))
                        : "-"
                      }
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      <span className="text-gray-400 text-sm">Holders</span>
                    </div>
                    <div className="text-white text-lg font-semibold">
                      {data.holders ? formatNumber(data.holders) : "-"}
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-5 h-5 text-purple-400" />
                      <span className="text-gray-400 text-sm">Type</span>
                    </div>
                    <div className="text-white text-lg font-semibold">
                      {data.isNft ? "NFT" : "Fungible"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "holders" && (
            <div>
              <h4 className="text-white font-semibold mb-4">Top Token Holders</h4>
              {(data.topHolders ?? []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No holder data available
                </div>
              ) : (
                <div className="space-y-3">
                  {(data.topHolders ?? []).map((holder, index) => (
                    <div
                      key={holder.address}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-mono text-sm">
                            {truncateAddress(holder.address, 6, 6)}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {holder.percentage.toFixed(2)}% of total supply
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          {formatNumber(holder.uiAmount)}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {holder.amount} raw
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "transfers" && (
            <div>
              <h4 className="text-white font-semibold mb-4">Recent Transfers</h4>
              {(data.recentTransfers ?? []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No recent transfers found
                </div>
              ) : (
                <div className="space-y-3">
                  {(data.recentTransfers ?? []).map((transfer) => (
                    <div
                      key={transfer.signature}
                      className="p-4 bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <a
                            href={`/tx/${transfer.signature}`}
                            className="text-emerald-400 hover:text-emerald-300 font-mono text-sm"
                          >
                            {truncateAddress(transfer.signature, 8, 8)}
                          </a>
                        </div>
                        <div className="text-gray-400 text-xs">
                          Slot {transfer.slot.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-white">
                        Amount: {formatNumber(transfer.uiAmount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}