"use client";

import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  Share2,
  Info,
  List,
  Send,
  Coins,
  TrendingUp,
  Image as ImageIcon,
  Target,
  Grid3x3,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
} from "lucide-react";
import type { AccountOverview } from "@/lib/solana/accountOverview";
import {
  fetchUserTokenHoldings,
  type TokenHolding,
} from "@/lib/solana/tokenMetadata";
import {
  fetchEnhancedTransactions,
  type TokenTransaction,
} from "@/lib/solana/marketData";
import { fetchWalletNFTs, type NFTHolding } from "@/lib/solana/nftData";
import {
  resolveAddressToDomain,
  getDomainDetails,
  type DomainInfo,
} from "@/lib/solana/snsResolver";
import {
  fetchStakeAccounts,
  type StakeAccount,
} from "@/lib/solana/stakeAccounts";
import {
  formatLargeNumber,
  formatCurrency,
  formatPercentage,
  formatAddress,
  formatRelativeTime,
  formatFullTimestamp,
  getChangeColor,
} from "@/utils/tokenFormatters";

interface CopyState {
  [key: string]: boolean;
}

type TabType =
  | "history"
  | "transfers"
  | "tokens"
  | "nfts"
  | "domains"
  | "positions"
  | "stake"
  | "heatmap";

interface EnhancedWalletViewProps {
  data: AccountOverview;
}

export function EnhancedWalletView({ data }: EnhancedWalletViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("history");
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [nftHoldings, setNftHoldings] = useState<NFTHolding[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [loadingTx, setLoadingTx] = useState(false);
  const [loadingNfts, setLoadingNfts] = useState(false);
  const [hideAdmin, setHideAdmin] = useState(false);
  const [hideSpam, setHideSpam] = useState(false);
  const [showZero, setShowZero] = useState(false);
  const [nftView, setNftView] = useState<"grid" | "list">("grid");
  const [historyPage, setHistoryPage] = useState(1);
  const [transfersPage, setTransfersPage] = useState(1);
  const [tokensPage, setTokensPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [snsDomain, setSnsDomain] = useState<string | null>(null);
  const [loadingDomain, setLoadingDomain] = useState(false);
  const [domains, setDomains] = useState<DomainInfo[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [stakeAccounts, setStakeAccounts] = useState<StakeAccount[]>([]);
  const [loadingStake, setLoadingStake] = useState(false);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStates({ ...copyStates, [key]: true });
      setTimeout(() => {
        setCopyStates((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const CopyButton = ({ text, copyKey }: { text: string; copyKey: string }) => (
    <button
      onClick={() => handleCopy(text, copyKey)}
      className="p-1.5 rounded hover:bg-gray-800 transition-colors"
      title="Copy to clipboard"
    >
      {copyStates[copyKey] ? (
        <Check className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-gray-500 hover:text-gray-300" />
      )}
    </button>
  );

  // Load token holdings
  useEffect(() => {
    async function loadTokens() {
      if (activeTab !== "tokens") return;
      setLoadingTokens(true);
      try {
        const holdings = await fetchUserTokenHoldings({
          walletAddress: data.pubkey,
          network: data.network,
        });
        setTokenHoldings(holdings);
      } catch (error) {
        console.error("Failed to load tokens:", error);
      } finally {
        setLoadingTokens(false);
      }
    }
    loadTokens();
  }, [activeTab, data.pubkey, data.network]);

  // Load transactions
  useEffect(() => {
    async function loadTransactions() {
      if (activeTab !== "history" && activeTab !== "transfers") return;
      setLoadingTx(true);
      try {
        const txs = await fetchEnhancedTransactions({
          address: data.pubkey,
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
    loadTransactions();
  }, [activeTab, data.pubkey, data.network]);

  // Load NFTs
  useEffect(() => {
    async function loadNFTs() {
      if (activeTab !== "nfts") return;
      setLoadingNfts(true);
      try {
        const nfts = await fetchWalletNFTs({
          walletAddress: data.pubkey,
          network: data.network,
        });
        setNftHoldings(nfts);
      } catch (error) {
        console.error("Failed to load NFTs:", error);
      } finally {
        setLoadingNfts(false);
      }
    }
    loadNFTs();
  }, [activeTab, data.pubkey, data.network]);

  // Load SNS domain
  useEffect(() => {
    async function loadDomain() {
      setLoadingDomain(true);
      try {
        const snsResult = await resolveAddressToDomain({
          address: data.pubkey,
          network: data.network,
        });
        if (snsResult.hasDomain && snsResult.domain) {
          setSnsDomain(snsResult.domain);
        }
      } catch (error) {
        console.error("Failed to load SNS domain:", error);
      } finally {
        setLoadingDomain(false);
      }
    }
    loadDomain();
  }, [data.pubkey, data.network]);

  // Load all domains for domains tab
  useEffect(() => {
    async function loadAllDomains() {
      if (activeTab !== "domains") return;
      setLoadingDomains(true);
      try {
        const domainList = await getDomainDetails({
          address: data.pubkey,
          network: data.network,
        });
        setDomains(domainList);
      } catch (error) {
        console.error("Failed to load domains:", error);
      } finally {
        setLoadingDomains(false);
      }
    }
    loadAllDomains();
  }, [activeTab, data.pubkey, data.network]);

  // Load stake accounts for stake tab
  useEffect(() => {
    async function loadStakeAccounts() {
      if (activeTab !== "stake") return;
      setLoadingStake(true);
      try {
        const accounts = await fetchStakeAccounts({
          walletAddress: data.pubkey,
          network: data.network,
        });
        setStakeAccounts(accounts);
      } catch (error) {
        console.error("Failed to load stake accounts:", error);
      } finally {
        setLoadingStake(false);
      }
    }
    loadStakeAccounts();
  }, [activeTab, data.pubkey, data.network]);

  // Calculate total token value
  const totalTokenValue = tokenHoldings.reduce((sum, holding) => {
    // In production, multiply by token price
    return sum + holding.uiAmount;
  }, 0);

  const solBalance = data.sol || 0;
  const totalValue = solBalance; // + totalTokenValue converted to USD

  if (!data.found) {
    return (
      <div className="bg-[#0d0d0d] border border-gray-800 rounded-xl p-6">
        <div className="text-center">
          <div className="text-red-400 text-lg font-semibold">
            Account Not Found
          </div>
          <div className="text-gray-400 mt-2">
            The account <span className="font-mono text-sm">{data.pubkey}</span>{" "}
            does not exist.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Header */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
        {/* Account Identity */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {data.pubkey.slice(0, 2).toUpperCase()}
              </span>
            </div>

            {/* Address Info */}
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {snsDomain ? (
                  <>
                    <h1 className="text-xl font-bold text-white">
                      {snsDomain}
                    </h1>
                    <div className="flex items-center gap-2 px-2 py-0.5 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-700/50 rounded">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-purple-300 text-xs font-semibold">
                        SNS
                      </span>
                    </div>
                  </>
                ) : (
                  <h1 className="text-xl font-bold text-white font-mono">
                    {formatAddress(data.pubkey, 8, 8)}
                  </h1>
                )}
                <CopyButton text={data.pubkey} copyKey="address" />
                <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs uppercase">
                  WALLET
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {snsDomain && (
                  <>
                    <span className="font-mono">
                      {formatAddress(data.pubkey, 6, 6)}
                    </span>
                    <span>•</span>
                  </>
                )}
                {!snsDomain && (
                  <>
                    <span>@{formatAddress(data.pubkey, 3, 3)}</span>
                    <span>•</span>
                  </>
                )}
                <span className="capitalize">{data.network}</span>
                {loadingDomain && !snsDomain && (
                  <>
                    <span>•</span>
                    <span className="text-xs text-gray-600">
                      Loading domain...
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Share2 className="w-4 h-4 text-gray-400" />
            </button>
            <a
              href={`https://explorer.solana.com/address/${data.pubkey}?cluster=${data.network}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          </div>
        </div>

        {/* Balance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Value Card */}
          <div className="bg-[#0d0d0d] border border-red-900/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs uppercase">
                Total Value
              </span>
              <Info className="w-3.5 h-3.5 text-gray-600" />
            </div>
            <div className="text-white text-2xl font-bold">
              {formatCurrency(totalValue * 120)} {/* Mock price $120/SOL */}
            </div>
            <div className={`text-sm mt-1 ${getChangeColor(0)}`}>
              {formatPercentage(0)} SOL
            </div>
          </div>

          {/* SOL Balance Card */}
          <div className="bg-[#0d0d0d] border border-red-900/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-purple-400" />
              <span className="text-gray-500 text-xs uppercase">
                SOL Balance
              </span>
            </div>
            <div className="text-white text-2xl font-bold">
              {solBalance.toFixed(4)} SOL
            </div>
            <div className="text-gray-400 text-sm mt-1">
              ≈ {formatCurrency(solBalance * 120)}
            </div>
          </div>

          {/* Token Balance Card */}
          <div className="bg-[#0d0d0d] border border-red-900/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs uppercase">
                Token Balance
              </span>
            </div>
            <div className="text-white text-2xl font-bold">
              {tokenHoldings.length} Tokens
            </div>
            <div className="text-gray-400 text-sm mt-1">
              {formatLargeNumber(totalTokenValue, 2)} total
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-800 overflow-x-auto">
          {[
            { id: "history", label: "HISTORY", icon: List },
            { id: "transfers", label: "TRANSFERS", icon: Send },
            { id: "tokens", label: "TOKENS", icon: Coins },
            { id: "nfts", label: "NFTs", icon: ImageIcon },
            { id: "domains", label: "DOMAINS", icon: Share2 },
            { id: "positions", label: "POSITIONS", icon: TrendingUp },
            { id: "stake", label: "STAKE", icon: Target },
            { id: "heatmap", label: "HEATMAP", icon: Grid3x3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-red-500 bg-[#0d0d0d] border-b-2 border-red-500"
                  : "text-gray-400 hover:text-white hover:bg-[#0d0d0d]/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "history" && (
            <HistoryTab
              transactions={transactions}
              loading={loadingTx}
              hideAdmin={hideAdmin}
              setHideAdmin={setHideAdmin}
              page={historyPage}
              setPage={setHistoryPage}
              itemsPerPage={itemsPerPage}
            />
          )}
          {activeTab === "transfers" && (
            <TransfersTab
              transactions={transactions}
              loading={loadingTx}
              hideSpam={hideSpam}
              setHideSpam={setHideSpam}
              page={transfersPage}
              setPage={setTransfersPage}
              itemsPerPage={itemsPerPage}
            />
          )}
          {activeTab === "tokens" && (
            <TokensTab
              holdings={tokenHoldings}
              loading={loadingTokens}
              showZero={showZero}
              setShowZero={setShowZero}
              page={tokensPage}
              setPage={setTokensPage}
              itemsPerPage={itemsPerPage}
            />
          )}
          {activeTab === "nfts" && (
            <NFTsTab
              nfts={nftHoldings}
              loading={loadingNfts}
              nftView={nftView}
              setNftView={setNftView}
            />
          )}
          {activeTab === "domains" && (
            <DomainsTab
              domains={domains}
              loading={loadingDomains}
              walletAddress={data.pubkey}
            />
          )}
          {activeTab === "stake" && (
            <StakeTab stakeAccounts={stakeAccounts} loading={loadingStake} />
          )}
          {(activeTab === "positions" || activeTab === "heatmap") && (
            <ComingSoonTab tabName={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
      <div className="text-sm text-gray-400">
        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-gray-300"
        >
          Previous
        </button>
        <span className="text-gray-400 text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// History Tab Component
function HistoryTab({
  transactions,
  loading,
  hideAdmin,
  setHideAdmin,
  page,
  setPage,
  itemsPerPage,
}: {
  transactions: TokenTransaction[];
  loading: boolean;
  hideAdmin: boolean;
  setHideAdmin: (value: boolean) => void;
  page: number;
  setPage: (page: number) => void;
  itemsPerPage: number;
}) {
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-white text-lg font-semibold">
            Account transactions
          </h3>
          <button
            onClick={() => setHideAdmin(!hideAdmin)}
            className={`px-2 py-1 rounded text-xs ${
              hideAdmin
                ? "bg-red-900/30 text-red-400"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            Hide admin
          </button>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300">
          <Filter className="w-4 h-4" />
          Filters
        </button>
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
              <tr className="border-b border-gray-800">
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium w-8"></th>
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  Type
                </th>
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  Info
                </th>
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  Time
                </th>
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  Programs
                </th>
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  Signature
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((tx) => {
                const isExpanded = expandedTx === tx.signature;
                const isIncoming = tx.amountUi && tx.amountUi > 0;

                return (
                  <React.Fragment key={tx.signature}>
                    <tr
                      className={`border-b border-gray-800/50 hover:bg-[#0d0d0d] transition-colors ${
                        isExpanded ? "bg-[#0d0d0d]" : ""
                      }`}
                    >
                      <td className="py-4">
                        <button
                          onClick={() =>
                            setExpandedTx(isExpanded ? null : tx.signature)
                          }
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {isIncoming ? (
                            <div className="w-8 h-8 bg-green-900/20 rounded-lg flex items-center justify-center">
                              <ArrowDownLeft className="w-4 h-4 text-green-400" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-red-900/20 rounded-lg flex items-center justify-center">
                              <ArrowUpRight className="w-4 h-4 text-red-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-white text-sm font-medium capitalize">
                              {isIncoming
                                ? "Received"
                                : tx.type === "swap"
                                ? "Swap"
                                : tx.type === "unknown"
                                ? "Transaction"
                                : tx.type}
                            </div>
                            {tx.programName && tx.programName !== "Unknown" && (
                              <div className="text-xs text-gray-500">
                                {tx.programName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        {tx.amountUi !== undefined && tx.amountUi !== 0 ? (
                          <div>
                            <div
                              className={`text-base font-mono font-bold ${
                                isIncoming ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {isIncoming ? "+" : "-"}
                              {Math.abs(tx.amountUi).toLocaleString(undefined, {
                                maximumFractionDigits: 6,
                              })}
                            </div>
                            <div className="text-gray-500 text-xs">
                              SOL{" "}
                              {tx.amountUi !== 0 &&
                                `≈ $${(Math.abs(tx.amountUi) * 120).toFixed(
                                  2
                                )}`}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">
                            <div>No transfer</div>
                            <div className="text-xs">Program call</div>
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="text-gray-300 text-sm">
                          {new Date(
                            (tx.blockTime || 0) * 1000
                          ).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {formatRelativeTime(tx.blockTime)}
                        </div>
                      </td>
                      <td className="py-4">
                        {tx.programName && tx.programName !== "Unknown" ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <div className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center">
                                <Activity className="w-3 h-3 text-gray-400" />
                              </div>
                              <span className="text-xs text-gray-400">
                                {tx.programName}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">System</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/tx/${tx.signature}`}
                            className="text-emerald-400 hover:text-emerald-300 font-mono text-sm"
                          >
                            {formatAddress(tx.signature, 8, 8)}
                          </a>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(tx.signature)
                            }
                            className="p-1 hover:bg-gray-700 rounded"
                          >
                            <Copy className="w-3 h-3 text-gray-600 hover:text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-[#0d0d0d]">
                        <td colSpan={6} className="py-4 px-8">
                          <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-gray-500 text-xs mb-1">
                                  Block
                                </div>
                                <div className="text-white font-mono">
                                  {tx.slot.toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-500 text-xs mb-1">
                                  Status
                                </div>
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    tx.success
                                      ? "bg-green-900/30 text-green-400"
                                      : "bg-red-900/30 text-red-400"
                                  }`}
                                >
                                  {tx.success ? "✓ Success" : "✗ Failed"}
                                </span>
                              </div>
                              {tx.from && (
                                <div>
                                  <div className="text-gray-500 text-xs mb-1">
                                    From
                                  </div>
                                  <a
                                    href={`/account/${tx.from}`}
                                    className="text-emerald-400 hover:text-emerald-300 font-mono text-sm"
                                  >
                                    {formatAddress(tx.from, 6, 6)}
                                  </a>
                                </div>
                              )}
                              {tx.to && (
                                <div>
                                  <div className="text-gray-500 text-xs mb-1">
                                    To
                                  </div>
                                  <a
                                    href={`/account/${tx.to}`}
                                    className="text-emerald-400 hover:text-emerald-300 font-mono text-sm"
                                  >
                                    {formatAddress(tx.to, 6, 6)}
                                  </a>
                                </div>
                              )}
                              {tx.blockTime && (
                                <div>
                                  <div className="text-gray-500 text-xs mb-1">
                                    Timestamp
                                  </div>
                                  <div className="text-gray-300 text-sm">
                                    {formatFullTimestamp(tx.blockTime)}
                                  </div>
                                </div>
                              )}
                              {tx.error && (
                                <div className="col-span-2">
                                  <div className="text-red-400 text-xs mb-1">
                                    Error
                                  </div>
                                  <div className="text-red-300 text-xs font-mono bg-red-900/20 p-2 rounded">
                                    {tx.error}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="pt-2 border-t border-gray-800">
                              <a
                                href={`/tx/${tx.signature}`}
                                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                              >
                                View full transaction details
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          <Pagination
            currentPage={page}
            totalItems={transactions.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

// Transfers Tab
function TransfersTab({
  transactions,
  loading,
  hideSpam,
  setHideSpam,
  page,
  setPage,
  itemsPerPage,
}: {
  transactions: TokenTransaction[];
  loading: boolean;
  hideSpam: boolean;
  setHideSpam: (value: boolean) => void;
  page: number;
  setPage: (page: number) => void;
  itemsPerPage: number;
}) {
  const transfers = transactions.filter(
    (tx) => tx.amountUi !== undefined && tx.amountUi !== 0
  );

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransfers = transfers.slice(startIndex, endIndex);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-white text-lg font-semibold">
            {transfers.length} transfer{transfers.length !== 1 ? "s" : ""}
          </h3>
          <button
            onClick={() => setHideSpam(!hideSpam)}
            className={`px-2 py-1 rounded text-xs ${
              hideSpam
                ? "bg-red-900/30 text-red-400"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            Hide spam
          </button>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 text-gray-600 mx-auto mb-3 animate-spin" />
          <div className="text-gray-400">Loading transfers...</div>
        </div>
      ) : transfers.length === 0 ? (
        <div className="text-center py-12">
          <Send className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400">No transfers found</div>
          <div className="text-gray-500 text-sm mt-2">
            This wallet has no token or SOL transfers
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  Type
                </th>
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  Amount
                </th>
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  From
                </th>
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  To
                </th>
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  Time
                </th>
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  Signature
                </th>
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransfers.map((tx) => {
                const isIncoming = tx.amountUi && tx.amountUi > 0;
                return (
                  <tr
                    key={tx.signature}
                    className="border-b border-gray-800/50 hover:bg-[#0d0d0d] transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {isIncoming ? (
                          <div className="w-6 h-6 bg-green-900/20 rounded-lg flex items-center justify-center">
                            <ArrowDownLeft className="w-3 h-3 text-green-400" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-red-900/20 rounded-lg flex items-center justify-center">
                            <ArrowUpRight className="w-3 h-3 text-red-400" />
                          </div>
                        )}
                        <span className="text-white text-xs font-medium">
                          {isIncoming ? "Received" : "Sent"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      {tx.amountUi !== undefined && tx.amountUi !== 0 ? (
                        <div>
                          <div
                            className={`text-sm font-mono font-medium ${
                              isIncoming ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {isIncoming ? "+" : "-"}
                            {Math.abs(tx.amountUi).toLocaleString(undefined, {
                              maximumFractionDigits: 6,
                            })}
                          </div>
                          <div className="text-gray-500 text-xs">SOL</div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      {tx.from ? (
                        <a
                          href={`/account/${tx.from}`}
                          className="text-emerald-400 hover:text-emerald-300 text-sm font-mono"
                        >
                          {formatAddress(tx.from, 4, 4)}
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      {tx.to ? (
                        <a
                          href={`/account/${tx.to}`}
                          className="text-emerald-400 hover:text-emerald-300 text-sm font-mono"
                        >
                          {formatAddress(tx.to, 4, 4)}
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="text-gray-400 text-sm">
                        {formatRelativeTime(tx.blockTime)}
                      </div>
                      {tx.blockTime && (
                        <div className="text-gray-600 text-xs">
                          {new Date(tx.blockTime * 1000).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/tx/${tx.signature}`}
                          className="text-emerald-400 hover:text-emerald-300 font-mono text-sm"
                        >
                          {formatAddress(tx.signature, 4, 4)}
                        </a>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(tx.signature)
                          }
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <Copy className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          tx.success
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {tx.success ? "✓" : "✗"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Pagination
            currentPage={page}
            totalItems={transfers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

// Tokens Tab
function TokensTab({
  holdings,
  loading,
  showZero,
  setShowZero,
  page,
  setPage,
  itemsPerPage,
}: {
  holdings: TokenHolding[];
  loading: boolean;
  showZero: boolean;
  setShowZero: (value: boolean) => void;
  page: number;
  setPage: (page: number) => void;
  itemsPerPage: number;
}) {
  const filteredHoldings = showZero
    ? holdings
    : holdings.filter((h) => h.uiAmount > 0);

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHoldings = filteredHoldings.slice(startIndex, endIndex);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-white text-lg font-semibold">
            {filteredHoldings.length} token
            {filteredHoldings.length !== 1 ? "s" : ""}
          </h3>
          {filteredHoldings.length > 0 && (
            <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs flex items-center gap-1">
              <Check className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowZero(!showZero)}
            className={`px-2 py-1 rounded text-xs ${
              showZero
                ? "bg-red-900/30 text-red-400"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            SHOW ZERO
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 text-gray-600 mx-auto mb-3 animate-spin" />
          <div className="text-gray-400">Loading tokens...</div>
        </div>
      ) : filteredHoldings.length === 0 ? (
        <div className="text-center py-12">
          <Coins className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400">No tokens found</div>
          <div className="text-gray-500 text-sm mt-2">
            {holdings.length > 0
              ? "All tokens have zero balance"
              : "This wallet doesn't hold any tokens"}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  Token
                </th>
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  Address
                </th>
                <th className="text-right pb-3 text-gray-500 text-xs uppercase font-medium">
                  Balance
                </th>
                <th className="text-right pb-3 text-gray-500 text-xs uppercase font-medium">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedHoldings.map((holding) => (
                <tr
                  key={holding.tokenAccount}
                  className="border-b border-gray-800/50 hover:bg-[#0d0d0d] transition-colors"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {holding.metadata?.logoURI ? (
                        <img
                          src={holding.metadata.logoURI}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {(holding.metadata?.symbol || holding.mint)
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-white font-medium">
                          {holding.metadata?.name || "Unknown Token"}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {holding.metadata?.symbol || "???"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <a
                      href={`/token/${holding.mint}`}
                      className="text-emerald-400 hover:text-emerald-300 font-mono text-sm"
                    >
                      {formatAddress(holding.mint, 4, 4)}
                    </a>
                  </td>
                  <td className="py-3 text-right text-white font-mono">
                    {holding.uiAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })}
                  </td>
                  <td className="py-3 text-right text-gray-400">
                    <div className="text-sm">-</div>
                    <div className="text-xs text-gray-600">Price N/A</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={page}
            totalItems={filteredHoldings.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

// NFTs Tab
function NFTsTab({
  nfts,
  loading,
  nftView,
  setNftView,
}: {
  nfts: NFTHolding[];
  loading: boolean;
  nftView: "grid" | "list";
  setNftView: (view: "grid" | "list") => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">{nfts.length} NFTs</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNftView("grid")}
            className={`p-2 rounded-lg ${
              nftView === "grid"
                ? "bg-red-900/30 text-red-400"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setNftView("list")}
            className={`p-2 rounded-lg ${
              nftView === "list"
                ? "bg-red-900/30 text-red-400"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 text-gray-600 mx-auto mb-3 animate-spin" />
          <div className="text-gray-400">Loading NFTs...</div>
        </div>
      ) : nfts.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400">No NFTs found</div>
          <div className="text-gray-500 text-sm mt-2">
            This wallet doesn't own any NFTs
          </div>
        </div>
      ) : nftView === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((nft) => (
            <div
              key={nft.tokenAccount}
              className="bg-[#0d0d0d] border border-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer group"
            >
              <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
                {nft.metadata.image ? (
                  <img
                    src={nft.metadata.image}
                    alt={nft.metadata.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling!.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full flex items-center justify-center ${
                    nft.metadata.image ? "hidden" : ""
                  }`}
                >
                  <ImageIcon className="w-12 h-12 text-white/50" />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="p-3">
                <div
                  className="text-white text-sm font-medium truncate"
                  title={nft.metadata.name}
                >
                  {nft.metadata.name}
                </div>
                {nft.metadata.collection?.name && (
                  <div className="text-gray-500 text-xs truncate">
                    {nft.metadata.collection.name}
                  </div>
                )}
                {!nft.metadata.collection && nft.metadata.symbol && (
                  <div className="text-gray-500 text-xs">
                    {nft.metadata.symbol}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {nfts.map((nft) => (
            <div
              key={nft.tokenAccount}
              className="flex items-center gap-4 p-4 bg-[#0d0d0d] border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                {nft.metadata.image ? (
                  <img
                    src={nft.metadata.image}
                    alt={nft.metadata.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-white/50" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">
                  {nft.metadata.name}
                </div>
                {nft.metadata.collection?.name && (
                  <div className="text-gray-400 text-sm truncate">
                    {nft.metadata.collection.name}
                  </div>
                )}
                <div className="text-gray-500 text-xs font-mono truncate">
                  {formatAddress(nft.mint, 6, 6)}
                </div>
              </div>
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Domains Tab
function DomainsTab({
  domains,
  loading,
  walletAddress,
}: {
  domains: DomainInfo[];
  loading: boolean;
  walletAddress: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const filteredDomains = searchTerm
    ? domains.filter((d) =>
        d.domain.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : domains;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white text-lg font-semibold">
            SNS Domains ({domains.length})
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Solana Name Service domains owned by this wallet
          </p>
        </div>
        <a
          href="https://naming.bonfida.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          Get Domain
        </a>
      </div>

      {domains.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search domains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0d0d0d] border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 text-gray-600 mx-auto mb-3 animate-spin" />
          <div className="text-gray-400">Loading domains...</div>
        </div>
      ) : domains.length === 0 ? (
        <div className="text-center py-12 bg-[#0d0d0d] border border-gray-800 rounded-lg">
          <Share2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400 mb-2">No domains found</div>
          <div className="text-gray-500 text-sm mb-4">
            This wallet doesn't own any SNS domains yet
          </div>
          <a
            href="https://naming.bonfida.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white font-medium"
          >
            Register a Domain
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      ) : filteredDomains.length === 0 ? (
        <div className="text-center py-12 bg-[#0d0d0d] border border-gray-800 rounded-lg">
          <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400">
            No domains found matching "{searchTerm}"
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDomains.map((domainInfo, index) => (
            <div
              key={index}
              className="bg-[#0d0d0d] border border-gray-800 rounded-xl p-4 hover:border-purple-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {domainInfo.domain.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white text-lg font-semibold">
                        {domainInfo.domain}
                      </h4>
                      {domainInfo.isPrimary && (
                        <span className="px-2 py-0.5 bg-purple-900/30 border border-purple-700/50 text-purple-400 rounded text-xs font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Owner:</span>
                      <span className="text-gray-400 font-mono">
                        {formatAddress(walletAddress, 4, 4)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleCopy(domainInfo.domain, `domain-${index}`)
                    }
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Copy domain"
                  >
                    {copied === `domain-${index}` ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <a
                    href={`https://naming.bonfida.org/#/domain/${domainInfo.domain.replace(
                      ".sol",
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    title="View on Bonfida"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500 text-xs uppercase mb-1">
                    Status
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-400 text-sm font-medium">
                      Active
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase mb-1">
                    Type
                  </div>
                  <div className="text-gray-300 text-sm">.sol Domain</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {domains.length > 0 && (
        <div className="mt-6 bg-purple-900/10 border border-purple-800/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-purple-300 text-sm font-medium mb-1">
                About SNS Domains
              </div>
              <div className="text-purple-200/70 text-xs">
                SNS (Solana Name Service) allows you to create human-readable
                names for your wallet addresses.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// Stake Tab
function StakeTab({
  stakeAccounts,
  loading,
}: {
  stakeAccounts: StakeAccount[];
  loading: boolean;
}) {
  const totalStaked = stakeAccounts.reduce(
    (sum, acc) => sum + acc.delegatedStake,
    0
  );
  const activeAccounts = stakeAccounts.filter((acc) => acc.state === "active");

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-white text-lg font-semibold mb-4">
          Staking Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-500 text-xs uppercase mb-2">
              Total Staked
            </div>
            <div className="text-white text-2xl font-bold">
              {totalStaked.toFixed(4)} SOL
            </div>
            <div className="text-gray-400 text-sm mt-1">
              ≈ ${(totalStaked * 120).toFixed(2)}
            </div>
          </div>
          <div className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-500 text-xs uppercase mb-2">
              Active Accounts
            </div>
            <div className="text-white text-2xl font-bold">
              {activeAccounts.length}
            </div>
            <div className="text-gray-400 text-sm mt-1">
              of {stakeAccounts.length} total
            </div>
          </div>
          <div className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-500 text-xs uppercase mb-2">Est. APY</div>
            <div className="text-green-400 text-2xl font-bold">~7.5%</div>
            <div className="text-gray-400 text-sm mt-1">Network average</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 text-gray-600 mx-auto mb-3 animate-spin" />
          <div className="text-gray-400">Loading stake accounts...</div>
        </div>
      ) : stakeAccounts.length === 0 ? (
        <div className="text-center py-12 bg-[#0d0d0d] border border-gray-800 rounded-lg">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400 mb-2">No stake accounts found</div>
          <div className="text-gray-500 text-sm mb-4">
            This wallet has no active staking
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {stakeAccounts.map((account, index) => (
            <div
              key={account.address}
              className="bg-[#0d0d0d] border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      account.state === "active"
                        ? "bg-green-900/20"
                        : account.state === "activating"
                        ? "bg-yellow-900/20"
                        : account.state === "deactivating"
                        ? "bg-orange-900/20"
                        : "bg-gray-800"
                    }`}
                  >
                    <Target
                      className={`w-5 h-5 ${
                        account.state === "active"
                          ? "text-green-400"
                          : account.state === "activating"
                          ? "text-yellow-400"
                          : account.state === "deactivating"
                          ? "text-orange-400"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      Stake Account #{index + 1}
                    </div>
                    <div className="text-gray-500 text-xs font-mono">
                      {formatAddress(account.address, 6, 6)}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase ${
                    account.state === "active"
                      ? "bg-green-900/30 text-green-400"
                      : account.state === "activating"
                      ? "bg-yellow-900/30 text-yellow-400"
                      : account.state === "deactivating"
                      ? "bg-orange-900/30 text-orange-400"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {account.state}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-gray-500 text-xs mb-1">
                    Staked Amount
                  </div>
                  <div className="text-white font-mono">
                    {account.delegatedStake.toFixed(4)} SOL
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">
                    Total Balance
                  </div>
                  <div className="text-white font-mono">
                    {account.balance.toFixed(4)} SOL
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">
                    Activation Epoch
                  </div>
                  <div className="text-gray-300">{account.activationEpoch}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Validator</div>
                  <a
                    href={`/validator/${account.voter}`}
                    className="text-emerald-400 hover:text-emerald-300 text-sm font-mono"
                  >
                    {formatAddress(account.voter, 4, 4)}
                  </a>
                </div>
              </div>

              {account.deactivationEpoch && (
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <div className="text-orange-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Deactivating at epoch {account.deactivationEpoch}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ComingSoonTab({ tabName }: { tabName: string }) {
  return (
    <div className="text-center py-12">
      <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
      <div className="text-gray-400 capitalize">{tabName} view coming soon</div>
    </div>
  );
}
