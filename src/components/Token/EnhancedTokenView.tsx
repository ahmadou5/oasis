"use client";

import { useState, useEffect } from "react";
import { 
  Copy, 
  ExternalLink, 
  Check,
  Star,
  Globe,
  Twitter,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Database,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react";
import type { TokenMintDetails } from "@/lib/solana/tokenDetails";
import type { TokenMetadata } from "@/lib/solana/tokenMetadata";
import { 
  fetchTokenMarketData, 
  fetchEnhancedTransactions,
  calculateHolderChange,
  type TokenMarketData,
  type TokenTransaction
} from "@/lib/solana/marketData";
import { 
  formatLargeNumber, 
  formatCurrency, 
  formatPercentage, 
  formatAddress,
  formatRelativeTime,
  formatFullTimestamp,
  getChangeColor,
  getChangeBgColor
} from "@/utils/tokenFormatters";

interface CopyState {
  [key: string]: boolean;
}

type TabType = "markets" | "history" | "holders" | "metadata";

interface EnhancedTokenViewProps {
  data: TokenMintDetails;
  metadata?: TokenMetadata;
}

export function EnhancedTokenView({ data, metadata }: EnhancedTokenViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("history");
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const [showJson, setShowJson] = useState(false);
  const [marketData, setMarketData] = useState<TokenMarketData | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [loadingTx, setLoadingTx] = useState(false);

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

  const CopyButton = ({ text, copyKey }: { text: string; copyKey: string }) => (
    <button
      onClick={() => handleCopy(text, copyKey)}
      className="p-1 rounded hover:bg-gray-700/50 transition-colors"
      title="Copy to clipboard"
    >
      {copyStates[copyKey] ? (
        <Check className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-gray-500 hover:text-gray-300" />
      )}
    </button>
  );

  const displayMetadata = metadata || data.metadata || {};

  // Fetch real market data
  useEffect(() => {
    async function loadMarketData() {
      try {
        setLoadingMarket(true);
        const market = await fetchTokenMarketData({
          mint: data.address,
          coingeckoId: displayMetadata?.coingeckoId,
        });
        setMarketData(market);
      } catch (error) {
        console.error("Failed to load market data:", error);
      } finally {
        setLoadingMarket(false);
      }
    }

    if (data.address) {
      loadMarketData();
    }
  }, [data.address, displayMetadata?.coingeckoId]);

  // Fetch enhanced transactions
  useEffect(() => {
    async function loadTransactions() {
      if (activeTab !== "history") return;
      
      try {
        setLoadingTx(true);
        const txs = await fetchEnhancedTransactions({
          address: data.address,
          network: data.network,
          limit: 20,
        });
        setTransactions(txs);
      } catch (error) {
        console.error("Failed to load transactions:", error);
      } finally {
        setLoadingTx(false);
      }
    }

    if (data.address && activeTab === "history") {
      loadTransactions();
    }
  }, [data.address, data.network, activeTab]);

  // Calculate holder change
  const [holderChange, setHolderChange] = useState<number>(0);
  useEffect(() => {
    async function calcChange() {
      if (data.holders) {
        const change = await calculateHolderChange(data.holders, data.address);
        setHolderChange(change);
      }
    }
    calcChange();
  }, [data.holders, data.address]);

  if (!data.found) {
    return (
      <div className="bg-[#0d0d0d] border border-gray-800 rounded-xl p-6">
        <div className="text-center">
          <div className="text-red-400 text-lg font-semibold">Token Not Found</div>
          <div className="text-gray-400 mt-2">
            The token mint <span className="font-mono text-sm">{data.address}</span> does not exist.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Token Header */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          {/* Token Identity */}
          <div className="flex items-center gap-4">
            {/* Token Logo */}
            <div className="relative">
              {displayMetadata?.logoURI ? (
                <img 
                  src={displayMetadata.logoURI} 
                  alt={displayMetadata?.name || "Token"}
                  className="w-16 h-16 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling!.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center ${displayMetadata?.logoURI ? 'hidden' : ''}`}>
                <span className="text-white text-xl font-bold">
                  {displayMetadata?.symbol?.[0] || "?"}
                </span>
              </div>
            </div>

            {/* Token Info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">
                  {displayMetadata?.symbol || "TOKEN"}
                </h1>
                {metadata?.source === "token-registry" && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                  <Star className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400">{displayMetadata?.name || "Unknown Token"}</span>
                {data.isNft && (
                  <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 rounded text-xs font-medium">
                    NFT
                  </span>
                )}
                {displayMetadata?.coingeckoId && (
                  <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">
                    RANK #-
                  </span>
                )}
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-2 mt-2">
                {displayMetadata?.website && (
                  <a
                    href={displayMetadata.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                    title="Website"
                  >
                    <Globe className="w-4 h-4 text-gray-400" />
                  </a>
                )}
                {displayMetadata?.twitter && (
                  <a
                    href={displayMetadata.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                    title="Twitter"
                  >
                    <Twitter className="w-4 h-4 text-gray-400" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 text-xs uppercase">Supply</div>
              <div className="text-white font-semibold">
                {data.supply && data.decimals !== undefined 
                  ? formatLargeNumber(Number(data.supply) / Math.pow(10, data.decimals))
                  : "-"
                }
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">Market Cap</div>
              <div className="text-white font-semibold">
                {loadingMarket ? (
                  <RefreshCw className="w-4 h-4 animate-spin inline" />
                ) : (
                  formatCurrency(marketData?.marketCap)
                )}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">Liquidity</div>
              <div className="text-white font-semibold">
                {loadingMarket ? (
                  <RefreshCw className="w-4 h-4 animate-spin inline" />
                ) : (
                  formatCurrency(marketData?.liquidity)
                )}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase">FDV</div>
              <div className="text-white font-semibold">
                {loadingMarket ? (
                  <RefreshCw className="w-4 h-4 animate-spin inline" />
                ) : (
                  formatCurrency(marketData?.fdv)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Chart Section */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Price Card */}
          <div className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs uppercase">Price</span>
              {marketData?.priceChange24h !== undefined && (
                <span className={`text-xs font-medium flex items-center gap-1 ${getChangeColor(marketData.priceChange24h)}`}>
                  {marketData.priceChange24h > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatPercentage(marketData.priceChange24h)}
                </span>
              )}
            </div>
            <div className="text-white text-2xl font-bold">
              {loadingMarket ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : marketData?.price ? (
                formatCurrency(marketData.price, marketData.price < 0.01 ? 6 : 2)
              ) : (
                <span className="text-gray-600">$-</span>
              )}
            </div>
            <div className="text-gray-500 text-xs mt-1">
              {marketData?.source && `via ${marketData.source}`}
            </div>
          </div>

          {/* Holders Card */}
          <div className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs uppercase">Holders</span>
              {holderChange !== 0 && (
                <span className={`text-xs font-medium flex items-center gap-1 ${getChangeColor(holderChange)}`}>
                  {holderChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {formatPercentage(holderChange)}
                </span>
              )}
            </div>
            <div className="text-white text-2xl font-bold">
              {marketData?.holders ? formatLargeNumber(marketData.holders, 1) : 
               data.holders ? formatLargeNumber(data.holders, 1) : 
               <span className="text-gray-600">-</span>
              }
            </div>
            <div className="text-gray-500 text-xs mt-1">24h</div>
          </div>

          {/* Volume Card */}
          <div className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs uppercase">24H Volume</span>
              {marketData?.volumeChange24h !== undefined && (
                <span className={`text-xs font-medium flex items-center gap-1 ${getChangeColor(marketData.volumeChange24h)}`}>
                  {marketData.volumeChange24h > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {formatPercentage(marketData.volumeChange24h)}
                </span>
              )}
            </div>
            <div className="text-white text-2xl font-bold">
              {loadingMarket ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : marketData?.volume24h ? (
                formatCurrency(marketData.volume24h)
              ) : (
                <span className="text-gray-600">$-</span>
              )}
            </div>
            <div className="text-gray-500 text-xs mt-1">24h</div>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-4 h-64 flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <div className="text-gray-500 text-sm">Price chart coming soon</div>
            <div className="text-gray-600 text-xs mt-1">Integration with price APIs pending</div>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800">
          {[
            { id: "markets", label: "MARKETS", icon: TrendingUp },
            { id: "history", label: "HISTORY", icon: Activity },
            { id: "holders", label: "HOLDERS", icon: Users },
            { id: "metadata", label: "METADATA", icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-red-500 bg-[#0d0d0d]"
                  : "text-gray-400 hover:text-white hover:bg-[#0d0d0d]/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "markets" && <MarketsTab data={data} />}
          {activeTab === "history" && (
            <HistoryTab 
              data={data} 
              transactions={transactions} 
              loading={loadingTx} 
            />
          )}
          {activeTab === "holders" && <HoldersTab data={data} />}
          {activeTab === "metadata" && (
            <MetadataTab 
              data={data} 
              metadata={displayMetadata}
              showJson={showJson}
              setShowJson={setShowJson}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Markets Tab Component
function MarketsTab({ data }: { data: TokenMintDetails }) {
  return (
    <div>
      <h3 className="text-white text-lg font-semibold mb-4">Top Markets</h3>
      <div className="text-center py-12">
        <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <div className="text-gray-400">Markets data coming soon</div>
        <div className="text-gray-600 text-sm mt-1">
          Integration with DEX aggregators pending
        </div>
      </div>
    </div>
  );
}

// History Tab Component (Transaction History)
function HistoryTab({ 
  data, 
  transactions, 
  loading 
}: { 
  data: TokenMintDetails;
  transactions: TokenTransaction[];
  loading: boolean;
}) {
  const getTypeDisplay = (type: TokenTransaction["type"]) => {
    const displays = {
      swap: { label: "Swap", color: "text-blue-400" },
      transfer: { label: "Transfer", color: "text-gray-300" },
      mint: { label: "Mint", color: "text-green-400" },
      burn: { label: "Burn", color: "text-red-400" },
      create: { label: "Create", color: "text-purple-400" },
      unknown: { label: "Unknown", color: "text-gray-500" },
    };
    return displays[type] || displays.unknown;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">Account Transactions</h3>
        {loading && (
          <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 text-gray-600 mx-auto mb-3 animate-spin" />
          <div className="text-gray-400">Loading transactions...</div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400">No transactions found</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="pb-3 text-gray-500 text-xs uppercase font-medium">Type</th>
                <th className="pb-3 text-gray-500 text-xs uppercase font-medium">Info</th>
                <th className="pb-3 text-gray-500 text-xs uppercase font-medium">Time</th>
                <th className="pb-3 text-gray-500 text-xs uppercase font-medium">Program</th>
                <th className="pb-3 text-gray-500 text-xs uppercase font-medium">Signature</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const typeDisplay = getTypeDisplay(tx.type);
                return (
                  <tr key={tx.signature} className="border-b border-gray-800/50 hover:bg-[#0d0d0d] transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-500" />
                        <span className={`text-sm font-medium ${typeDisplay.color}`}>
                          {typeDisplay.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      {tx.amountUi !== undefined && tx.amountUi !== 0 ? (
                        <span className={`text-sm font-mono ${tx.amountUi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.amountUi > 0 ? '+' : ''}{tx.amountUi.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-3 text-gray-400 text-sm">
                      {formatRelativeTime(tx.blockTime)}
                    </td>
                    <td className="py-3">
                      {tx.programName ? (
                        <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                          {tx.programName}
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/tx/${tx.signature}`}
                          className="text-gray-400 hover:text-white font-mono text-sm"
                        >
                          {formatAddress(tx.signature, 6, 6)}
                        </a>
                        <button
                          onClick={() => navigator.clipboard.writeText(tx.signature)}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Copy className="w-3 h-3 text-gray-600 hover:text-gray-400" />
                        </button>
                        {!tx.success && (
                          <span className="text-xs px-2 py-0.5 bg-red-900/30 text-red-400 rounded">
                            Failed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Holders Tab Component
function HoldersTab({ data }: { data: TokenMintDetails }) {
  const holders = data.topHolders || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">
          Top Holders {holders.length > 0 && `(${formatLargeNumber(data.holders || 0)} total)`}
        </h3>
      </div>

      {holders.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400">No holder data available</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="pb-3 text-gray-500 text-xs uppercase font-medium">#</th>
                <th className="pb-3 text-gray-500 text-xs uppercase font-medium">Account</th>
                <th className="pb-3 text-gray-500 text-xs uppercase font-medium">Quantity</th>
                <th className="pb-3 text-gray-500 text-xs uppercase font-medium">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {holders.map((holder, index) => (
                <tr key={holder.address} className="border-b border-gray-800/50 hover:bg-[#0d0d0d] transition-colors">
                  <td className="py-3 text-gray-400 text-sm">{index + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/account/${holder.address}`}
                        className="text-gray-300 hover:text-white font-mono text-sm"
                      >
                        {formatAddress(holder.address, 6, 6)}
                      </a>
                      <Copy className="w-3 h-3 text-gray-600 cursor-pointer hover:text-gray-400" />
                    </div>
                  </td>
                  <td className="py-3 text-white text-sm font-medium">
                    {formatLargeNumber(holder.uiAmount)}
                  </td>
                  <td className="py-3 text-gray-400 text-sm">
                    {holder.percentage.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Metadata Tab Component
function MetadataTab({ 
  data, 
  metadata, 
  showJson, 
  setShowJson 
}: { 
  data: TokenMintDetails; 
  metadata: any;
  showJson: boolean;
  setShowJson: (show: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <div>
        <h3 className="text-white text-lg font-semibold mb-4">Overview</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500 mb-1">Name</div>
            <div className="text-white">{metadata?.name || "Unknown"}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Symbol</div>
            <div className="text-white">{metadata?.symbol || "N/A"}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Network</div>
            <div className="text-white capitalize">{data.network}</div>
          </div>
          <div>
            <div className="text-gray-500 mb-1">Decimals</div>
            <div className="text-white">{data.decimals ?? "N/A"}</div>
          </div>
        </div>
      </div>

      {/* Token Authorities */}
      <div>
        <h3 className="text-white text-lg font-semibold mb-4">Token Authority</h3>
        <div className="space-y-3">
          <div>
            <div className="text-gray-500 text-sm mb-1">Mint Authority</div>
            <div className="flex items-center gap-2 bg-[#0d0d0d] p-3 rounded-lg">
              {data.mintAuthority ? (
                <>
                  <span className="text-white font-mono text-sm">{formatAddress(data.mintAuthority)}</span>
                  <Copy className="w-3 h-3 text-gray-600 cursor-pointer hover:text-gray-400" />
                  <ExternalLink className="w-3 h-3 text-gray-600 cursor-pointer hover:text-gray-400" />
                </>
              ) : (
                <span className="text-red-400 text-sm">Disabled</span>
              )}
            </div>
          </div>

          <div>
            <div className="text-gray-500 text-sm mb-1">Freeze Authority</div>
            <div className="flex items-center gap-2 bg-[#0d0d0d] p-3 rounded-lg">
              {data.freezeAuthority ? (
                <>
                  <span className="text-white font-mono text-sm">{formatAddress(data.freezeAuthority)}</span>
                  <Copy className="w-3 h-3 text-gray-600 cursor-pointer hover:text-gray-400" />
                  <ExternalLink className="w-3 h-3 text-gray-600 cursor-pointer hover:text-gray-400" />
                </>
              ) : (
                <span className="text-red-400 text-sm">Disabled</span>
              )}
            </div>
          </div>

          <div>
            <div className="text-gray-500 text-sm mb-1">Total Supply</div>
            <div className="bg-[#0d0d0d] p-3 rounded-lg">
              <span className="text-white text-lg font-bold">
                {data.supply && data.decimals !== undefined 
                  ? formatLargeNumber(Number(data.supply) / Math.pow(10, data.decimals))
                  : "-"
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* JSON Metadata */}
      {metadata && (
        <div>
          <button
            onClick={() => setShowJson(!showJson)}
            className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm mb-3"
          >
            {showJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showJson ? "Hide" : "Show"} JSON Metadata
          </button>
          
          {showJson && (
            <pre className="bg-[#0d0d0d] p-4 rounded-lg text-xs text-gray-300 overflow-x-auto border border-gray-800">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}