"use client";

import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  List,
  Scale,
  FileText,
  Terminal,
  Code,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { TransactionDetail } from "@/types/transaction";
import {
  formatAddress,
  formatFullTimestamp,
  formatRelativeTime,
} from "@/utils/tokenFormatters";

type TabType = "summary" | "balances" | "instructions" | "logs" | "raw";

interface EnhancedTransactionViewProps {
  data: TransactionDetail;
}

export function EnhancedTransactionView({
  data,
}: EnhancedTransactionViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [copied, setCopied] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const CopyButton = ({ text, copyKey }: { text: string; copyKey: string }) => (
    <button
      onClick={() => handleCopy(text, copyKey)}
      className="p-1 rounded hover:bg-gray-800 transition-colors"
      title="Copy to clipboard"
    >
      {copied === copyKey ? (
        <Check className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-gray-500 hover:text-gray-300" />
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
        {/* Status Badge and AI Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {data.status === "success" ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/20 border border-green-800/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold uppercase text-sm">
                  {data.type}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/20 border border-red-800/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold uppercase text-sm">
                  FAILED
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg font-semibold text-white transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Explain with AI
          </button>
        </div>

        {/* Transaction Flow Visualization */}
        {data.swapInfo && (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-6 mb-4">
              {/* From Token */}
              <div className="flex-1 max-w-xs">
                <div className="bg-red-900/20 border-2 border-red-800/50 rounded-xl p-4">
                  <div className="text-gray-400 text-xs uppercase mb-2">
                    From
                  </div>
                  <div className="text-red-400 text-2xl font-bold font-mono">
                    -{data.swapInfo.fromToken.amount.toFixed(6)}
                  </div>
                  <div className="text-gray-300 text-sm mt-1 flex items-center gap-2">
                    <span>{data.swapInfo.fromToken.symbol}</span>
                    <span className="text-gray-600">≅</span>
                    <span className="text-xs text-gray-500 font-mono">
                      {formatAddress(data.swapInfo.fromToken.mint, 4, 4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight className="w-8 h-8 text-gray-600 flex-shrink-0" />

              {/* To Token */}
              <div className="flex-1 max-w-xs">
                <div className="bg-green-900/20 border-2 border-green-800/50 rounded-xl p-4">
                  <div className="text-gray-400 text-xs uppercase mb-2">To</div>
                  <div className="text-green-400 text-2xl font-bold font-mono">
                    +{data.swapInfo.toToken.amount.toFixed(6)}
                  </div>
                  <div className="text-gray-300 text-sm mt-1 flex items-center gap-2">
                    <span>{data.swapInfo.toToken.symbol}</span>
                    <span className="text-gray-600">≅</span>
                    <span className="text-xs text-gray-500 font-mono">
                      {formatAddress(data.swapInfo.toToken.mint, 4, 4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-gray-400 text-sm">
              Transaction using{" "}
              <a
                href={`/account/${data.swapInfo.program}`}
                className="text-emerald-400 hover:text-emerald-300 font-medium"
              >
                {data.swapInfo.programName}
              </a>{" "}
              that involves {data.swapInfo.fromToken.symbol},{" "}
              {data.swapInfo.toToken.symbol}
            </div>
          </div>
        )}
      </div>

      {/* Tabbed Navigation */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-800 overflow-x-auto">
          {[
            { id: "summary", label: "SUMMARY", icon: List },
            { id: "balances", label: "BALANCES", icon: Scale },
            { id: "instructions", label: "INSTRUCTIONS", icon: FileText },
            { id: "logs", label: "LOGS", icon: Terminal },
            { id: "raw", label: "RAW", icon: Code },
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
          {activeTab === "summary" && (
            <SummaryTab data={data} CopyButton={CopyButton} />
          )}
          {activeTab === "balances" && (
            <BalancesTab data={data} CopyButton={CopyButton} />
          )}
          {activeTab === "instructions" && (
            <InstructionsTab data={data} CopyButton={CopyButton} />
          )}
          {activeTab === "logs" && <LogsTab data={data} />}
          {activeTab === "raw" && (
            <RawTab data={data} CopyButton={CopyButton} />
          )}
        </div>
      </div>

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                AI Transaction Explanation
              </h3>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="text-gray-300 space-y-3">
              <p>
                This transaction is a{" "}
                <strong className="text-white">{data.type}</strong> operation
                that{" "}
                {data.status === "success"
                  ? "completed successfully"
                  : "failed"}
                .
              </p>
              {data.swapInfo && (
                <p>
                  The user swapped{" "}
                  <strong className="text-red-400">
                    {data.swapInfo.fromToken.amount.toFixed(6)}{" "}
                    {data.swapInfo.fromToken.symbol}
                  </strong>{" "}
                  for{" "}
                  <strong className="text-green-400">
                    {data.swapInfo.toToken.amount.toFixed(6)}{" "}
                    {data.swapInfo.toToken.symbol}
                  </strong>{" "}
                  using {data.swapInfo.programName}.
                </p>
              )}
              <p>
                The transaction involved {data.programs.length} program
                {data.programs.length !== 1 ? "s" : ""} and consumed{" "}
                {data.computeUnitsConsumed.toLocaleString()} compute units.
              </p>
              <p>
                Total fee paid:{" "}
                <strong className="text-white">
                  {(data.fee / 1e9).toFixed(9)} SOL
                </strong>
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => handleCopy(data.signature, "ai-signature")}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
              >
                Copy Signature
              </button>
              <button
                onClick={() => setShowAIModal(false)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Summary Tab Component
function SummaryTab({
  data,
  CopyButton,
}: {
  data: TransactionDetail;
  CopyButton: React.ComponentType<{ text: string; copyKey: string }>;
}) {
  const [showInstructionSummary, setShowInstructionSummary] = useState(true);
  const [showTokenAccounts, setShowTokenAccounts] = useState(false);

  return (
    <div className="space-y-6">
      {/* Transaction Meta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-gray-500 text-xs uppercase mb-2">Signature</div>
          <div className="flex items-center gap-2">
            <span className="text-white font-mono text-sm">
              {formatAddress(data.signature, 12, 12)}
            </span>
            <CopyButton text={data.signature} copyKey="signature" />
          </div>
        </div>

        <div>
          <div className="text-gray-500 text-xs uppercase mb-2">Time</div>
          <div className="text-white text-sm">
            {formatRelativeTime(data.blockTime)} (
            {formatFullTimestamp(data.blockTime)})
          </div>
        </div>

        <div>
          <div className="text-gray-500 text-xs uppercase mb-2">Programs</div>
          <div className="flex items-center gap-2 flex-wrap">
            {data.programs.slice(0, 3).map((program, i) => (
              <div
                key={i}
                className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                title={program.name}
              >
                {program.name.slice(0, 2).toUpperCase()}
              </div>
            ))}
            {data.programs.length > 3 && (
              <span className="text-gray-500 text-xs">
                +{data.programs.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Instruction Summary */}
      <div className="border-t border-gray-800 pt-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowInstructionSummary(!showInstructionSummary)}
            className="flex items-center gap-2 text-white font-semibold"
          >
            {showInstructionSummary ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            INSTRUCTION SUMMARY
          </button>
          <button
            onClick={() => setShowTokenAccounts(!showTokenAccounts)}
            className={`px-2 py-1 rounded text-xs ${
              showTokenAccounts
                ? "bg-red-900/30 text-red-400"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            Show Token Accounts
          </button>
        </div>

        {showInstructionSummary && (
          <div className="space-y-3">
            {data.instructions.map((ix, index) => (
              <div
                key={index}
                className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-4"
              >
                <div className="text-gray-300 text-sm">
                  <span className="text-emerald-400">#{index + 1}</span>{" "}
                  Interact with{" "}
                  <span className="text-white font-medium">
                    {ix.instructionType}
                  </span>{" "}
                  through{" "}
                  <a
                    href={`/account/${ix.programId}`}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    {ix.programName}
                  </a>
                </div>
                {ix.accounts.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    {ix.accounts.slice(0, 2).map((acc, i) => (
                      <div key={i}>
                        Account:{" "}
                        <span className="font-mono">
                          {formatAddress(acc.pubkey, 6, 6)}
                        </span>
                        {acc.isSigner && (
                          <span className="ml-2 text-yellow-500">(Signer)</span>
                        )}
                        {acc.isWritable && (
                          <span className="ml-2 text-blue-500">(Writable)</span>
                        )}
                      </div>
                    ))}
                    {ix.accounts.length > 2 && (
                      <div className="text-gray-600">
                        + {ix.accounts.length - 2} more accounts
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="border-t border-gray-800 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Signer</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-sm">
                {formatAddress(data.feePayer, 6, 6)}
              </span>
              <CopyButton text={data.feePayer} copyKey="signer" />
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Total Fee</span>
            <span className="text-white font-mono text-sm">
              {(data.fee / 1e9).toFixed(9)} ≅ SOL
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Slot</span>
            <span className="text-white font-mono text-sm">
              {data.slot.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">
              Compute Units Consumed
            </span>
            <span className="text-white font-mono text-sm">
              {data.computeUnitsConsumed.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between col-span-full">
            <span className="text-gray-500 text-sm">Recent Blockhash</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-sm">
                {formatAddress(data.recentBlockhash, 8, 8)}
              </span>
              <CopyButton text={data.recentBlockhash} copyKey="blockhash" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Balances Tab Component
function BalancesTab({
  data,
  CopyButton,
}: {
  data: TransactionDetail;
  CopyButton: React.ComponentType<{ text: string; copyKey: string }>;
}) {
  const [hideUnchanged, setHideUnchanged] = useState(false);

  const filteredBalances = hideUnchanged
    ? data.balanceChanges.filter((bc) => bc.change !== 0)
    : data.balanceChanges;

  const filteredTokenBalances = hideUnchanged
    ? data.tokenBalanceChanges.filter((tb) => tb.change !== 0)
    : data.tokenBalanceChanges;

  return (
    <div className="space-y-6">
      {/* SOL Balances */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg border-b-2 border-red-500 pb-1 inline-block">
            SOL BALANCES
          </h3>
          <button
            onClick={() => setHideUnchanged(!hideUnchanged)}
            className={`px-3 py-1 rounded text-xs ${
              hideUnchanged
                ? "bg-red-900/30 text-red-400"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            Hide unchanged accounts
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  #
                </th>
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  Address
                </th>
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  Owner
                </th>
                <th className="text-right pb-3 text-gray-500 text-xs uppercase font-medium">
                  Post Balance
                </th>
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBalances.map((balance, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-800/50 hover:bg-[#0d0d0d] transition-colors"
                >
                  <td className="py-3 text-gray-400 text-sm">{index}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/account/${balance.address}`}
                        className="text-emerald-400 hover:text-emerald-300 font-mono text-sm"
                      >
                        {formatAddress(balance.address, 6, 6)}
                      </a>
                      <CopyButton
                        text={balance.address}
                        copyKey={`balance-${index}`}
                      />
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-xs text-gray-400">S</span>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {balance.owner}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="font-mono">
                      <div
                        className={`text-sm ${
                          balance.change > 0
                            ? "text-green-400"
                            : balance.change < 0
                            ? "text-red-400"
                            : "text-white"
                        }`}
                      >
                        {(balance.postBalance / 1e9).toFixed(9)} SOL
                      </div>
                      {balance.change !== 0 && (
                        <div
                          className={`text-xs ${
                            balance.change > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {balance.change > 0 ? "+" : ""}
                          {(balance.change / 1e9).toFixed(9)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2 flex-wrap">
                      {balance.isFeePayer && (
                        <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 rounded text-xs">
                          Fee Payer
                        </span>
                      )}
                      {balance.isSigner && (
                        <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 rounded text-xs">
                          Signer
                        </span>
                      )}
                      {balance.isWritable && (
                        <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded text-xs">
                          Writable
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Token Balances */}
      {data.tokenBalanceChanges.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg border-b-2 border-red-500 pb-1 inline-block">
              TOKEN BALANCES
            </h3>
            <button
              onClick={() => setHideUnchanged(!hideUnchanged)}
              className={`px-3 py-1 rounded text-xs ${
                hideUnchanged
                  ? "bg-red-900/30 text-red-400"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              Hide unchanged accounts
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                    Owner
                  </th>
                  <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                    Token Account
                  </th>
                  <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                    Token Mint
                  </th>
                  <th className="text-right pb-3 text-gray-500 text-xs uppercase font-medium">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTokenBalances.map((token, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-800/50 hover:bg-[#0d0d0d] transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-3 h-3 text-gray-600" />
                        <a
                          href={`/account/${token.owner}`}
                          className="text-emerald-400 hover:text-emerald-300 font-mono text-sm"
                        >
                          {formatAddress(token.owner, 4, 4)}
                        </a>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-mono text-sm">
                          {formatAddress(token.tokenAccount, 6, 6)}
                        </span>
                        <CopyButton
                          text={token.tokenAccount}
                          copyKey={`token-${index}`}
                        />
                      </div>
                    </td>
                    <td className="py-3">
                      <a
                        href={`/token/${token.mint}`}
                        className="text-emerald-400 hover:text-emerald-300 font-mono text-sm"
                      >
                        {formatAddress(token.mint, 4, 4)}
                      </a>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {token.change > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span
                          className={`font-mono text-sm ${
                            token.change > 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {token.change > 0 ? "+" : ""}
                          {token.change.toFixed(6)} {token.symbol}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Instructions Tab Component
function InstructionsTab({
  data,
  CopyButton,
}: {
  data: TransactionDetail;
  CopyButton: React.ComponentType<{ text: string; copyKey: string }>;
}) {
  const [expandedInstructions, setExpandedInstructions] = useState<Set<number>>(
    new Set([0])
  );
  const [showTokenAccounts, setShowTokenAccounts] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  const toggleInstruction = (index: number) => {
    const newExpanded = new Set(expandedInstructions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedInstructions(newExpanded);
  };

  // Decode instruction data to hex
  const decodeToHex = (base64Data: string): string => {
    try {
      const buffer = Buffer.from(base64Data, "base64");
      let hex = "";
      for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i].toString(16).padStart(2, "0");
        hex += byte + " ";
        if ((i + 1) % 16 === 0) hex += "\n";
      }
      return hex.trim();
    } catch {
      return base64Data;
    }
  };

  // Format data in readable chunks
  const formatInstructionData = (base64Data: string): JSX.Element => {
    if (!base64Data) return <span className="text-gray-600">(empty)</span>;

    try {
      const buffer = Buffer.from(base64Data, "base64");
      const hex = decodeToHex(base64Data);
      const bytes = Array.from(buffer);

      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs">
              Length: {bytes.length} bytes
            </span>
            <button
              onClick={() => setShowRawData(!showRawData)}
              className="text-xs text-emerald-400 hover:text-emerald-300"
            >
              {showRawData ? "Show Hex" : "Show Base64"}
            </button>
          </div>

          {showRawData ? (
            <div className="text-gray-400 text-xs font-mono whitespace-pre-wrap break-all">
              {base64Data}
            </div>
          ) : (
            <div className="space-y-1">
              {hex.split("\n").map((line, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-gray-600 text-xs w-12">
                    {(i * 16).toString(16).padStart(4, "0")}
                  </span>
                  <span className="text-gray-300 text-xs font-mono">
                    {line}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } catch {
      return <span className="text-gray-400">{base64Data}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-lg">
            Transaction Instructions
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            {data.instructions.length} instruction
            {data.instructions.length !== 1 ? "s" : ""} executed
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTokenAccounts(!showTokenAccounts)}
            className={`px-3 py-1 rounded text-xs ${
              showTokenAccounts
                ? "bg-red-900/30 text-red-400"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            {showTokenAccounts ? "Hide" : "Show"} Token Accounts
          </button>
          <button
            onClick={() => {
              const allIndices: Set<number> = new Set(
                data.instructions.map((_, i) => i)
              );
              setExpandedInstructions(
                expandedInstructions?.size === data.instructions.length
                  ? new Set()
                  : allIndices
              );
            }}
            className="px-3 py-1 rounded text-xs bg-gray-800 text-gray-400 hover:bg-gray-700"
          >
            {expandedInstructions.size === data.instructions.length
              ? "Collapse All"
              : "Expand All"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {data.instructions.map((instruction, index) => {
          const isExpanded = expandedInstructions.has(index);
          const innerInstructionCount =
            instruction.innerInstructions?.length || 0;

          return (
            <div
              key={index}
              className="bg-[#0d0d0d] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors"
            >
              {/* Card Header */}
              <button
                onClick={() => toggleInstruction(index)}
                className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-black/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    #{index + 1}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">
                        {instruction.programName}
                      </span>
                      {innerInstructionCount > 0 && (
                        <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded text-xs">
                          +{innerInstructionCount} inner
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500 text-xs font-mono mt-1">
                      {formatAddress(instruction.programId, 8, 8)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`/account/${instruction.programId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-500 hover:text-emerald-400" />
                  </a>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Card Content */}
              {isExpanded && (
                <div className="border-t border-gray-800 p-4 space-y-6">
                  {/* Program Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-500 text-xs uppercase mb-2">
                        Program
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-white text-sm">
                          {instruction.programName}
                        </div>
                        <CopyButton
                          text={instruction.programId}
                          copyKey={`prog-${index}`}
                        />
                      </div>
                      <div className="text-gray-600 text-xs font-mono mt-1">
                        {instruction.programId}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs uppercase mb-2">
                        Instruction Type
                      </div>
                      <div className="text-white text-sm font-mono">
                        {instruction.instructionType}
                      </div>
                    </div>
                  </div>

                  {/* Accounts Table */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-gray-500 text-xs uppercase">
                        Accounts ({instruction.accounts.length})
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-yellow-900/20 text-yellow-400 rounded">
                          Signer
                        </span>
                        <span className="px-2 py-0.5 bg-blue-900/20 text-blue-400 rounded">
                          Writable
                        </span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left pb-2 text-gray-600 text-xs w-12">
                              #
                            </th>
                            <th className="text-left pb-2 text-gray-600 text-xs">
                              Account Address
                            </th>
                            <th className="text-left pb-2 text-gray-600 text-xs">
                              Permissions
                            </th>
                            <th className="text-left pb-2 text-gray-600 text-xs">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {instruction.accounts.map((account, accIndex) => (
                            <tr
                              key={accIndex}
                              className="border-b border-gray-800/50 hover:bg-black/20"
                            >
                              <td className="py-3 text-gray-500 text-xs font-mono">
                                {accIndex}
                              </td>
                              <td className="py-3">
                                <a
                                  href={`/account/${account.pubkey}`}
                                  className="text-emerald-400 hover:text-emerald-300 font-mono text-xs"
                                >
                                  {account.pubkey}
                                </a>
                              </td>
                              <td className="py-3">
                                <div className="flex gap-1">
                                  {account.isSigner && (
                                    <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 rounded text-xs font-semibold">
                                      SIGNER
                                    </span>
                                  )}
                                  {account.isWritable && (
                                    <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded text-xs font-semibold">
                                      WRITABLE
                                    </span>
                                  )}
                                  {!account.isSigner && !account.isWritable && (
                                    <span className="px-2 py-0.5 bg-gray-800 text-gray-500 rounded text-xs">
                                      READ ONLY
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3">
                                <CopyButton
                                  text={account.pubkey}
                                  copyKey={`acc-${index}-${accIndex}`}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Instruction Data */}
                  <div>
                    <div className="text-gray-500 text-xs uppercase mb-3">
                      Instruction Data
                    </div>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-xs">
                      {formatInstructionData(instruction.data)}
                    </div>
                  </div>

                  {/* Inner Instructions */}
                  {instruction.innerInstructions &&
                    instruction.innerInstructions.length > 0 && (
                      <div>
                        <div className="text-gray-500 text-xs uppercase mb-3">
                          Inner Instructions (
                          {instruction.innerInstructions.length})
                        </div>
                        <div className="space-y-3 pl-4 border-l-2 border-blue-800">
                          {instruction.innerInstructions.map(
                            (inner, innerIndex) => (
                              <div
                                key={innerIndex}
                                className="bg-black/30 border border-gray-800 rounded-lg p-4"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-blue-400 text-xs font-mono">
                                        #{innerIndex}
                                      </span>
                                      <span className="text-white font-medium">
                                        {inner.programName}
                                      </span>
                                    </div>
                                    <div className="text-gray-500 text-xs font-mono mt-1">
                                      {formatAddress(inner.programId, 8, 8)}
                                    </div>
                                  </div>
                                  <CopyButton
                                    text={inner.programId}
                                    copyKey={`inner-${index}-${innerIndex}`}
                                  />
                                </div>

                                {inner.accounts &&
                                  inner.accounts.length > 0 && (
                                    <div className="mt-3">
                                      <div className="text-gray-600 text-xs mb-2">
                                        {inner.accounts.length} accounts
                                      </div>
                                      <div className="space-y-1">
                                        {inner.accounts
                                          .slice(0, 3)
                                          .map((acc, i) => (
                                            <div
                                              key={i}
                                              className="text-gray-500 text-xs font-mono flex items-center gap-2"
                                            >
                                              <span className="text-gray-700">
                                                #{i}
                                              </span>
                                              <a
                                                href={`/account/${acc.pubkey}`}
                                                className="text-emerald-400 hover:text-emerald-300"
                                              >
                                                {formatAddress(
                                                  acc.pubkey,
                                                  6,
                                                  6
                                                )}
                                              </a>
                                              {acc.isSigner && (
                                                <span className="text-yellow-600 text-xs">
                                                  S
                                                </span>
                                              )}
                                              {acc.isWritable && (
                                                <span className="text-blue-600 text-xs">
                                                  W
                                                </span>
                                              )}
                                            </div>
                                          ))}
                                        {inner.accounts.length > 3 && (
                                          <div className="text-gray-700 text-xs">
                                            + {inner.accounts.length - 3} more
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Logs Tab Component
function LogsTab({ data }: { data: TransactionDetail }) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set([0])
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  // Group logs by program invocation with depth tracking
  const groupedLogs: Array<{
    program: string;
    logs: string[];
    depth: number;
    success: boolean;
    failed: boolean;
  }> = [];
  let currentGroup: {
    program: string;
    logs: string[];
    depth: number;
    success: boolean;
    failed: boolean;
  } | null = null;
  let depthStack = 0;

  data.logs.forEach((log, index) => {
    const invokeMatch = log.match(/Program (\w+) invoke \[(\d+)\]/);
    if (invokeMatch) {
      if (currentGroup) {
        groupedLogs.push(currentGroup);
      }
      depthStack = parseInt(invokeMatch[2]);
      currentGroup = {
        program: invokeMatch[1],
        logs: [log],
        depth: depthStack,
        success: false,
        failed: false,
      };
    } else if (currentGroup) {
      currentGroup.logs.push(log);

      if (log.includes("success")) {
        currentGroup.success = true;
      }
      if (log.includes("failed") || log.includes("error")) {
        currentGroup.failed = true;
      }

      // Check if this is the completion of current program
      const consumedMatch = log.match(/Program (\w+) consumed/);
      const successMatch = log.match(/Program (\w+) success/);
      const failedMatch = log.match(/Program (\w+) failed/);

      if (consumedMatch || successMatch || failedMatch) {
        const logProgram =
          consumedMatch?.[1] || successMatch?.[1] || failedMatch?.[1];
        if (logProgram === currentGroup.program) {
          groupedLogs.push(currentGroup);
          currentGroup = null;
        }
      }
    }
  });

  if (currentGroup) {
    groupedLogs.push(currentGroup);
  }

  // Filter logs by search term
  const filteredGroups = searchTerm
    ? groupedLogs.filter(
        (group) =>
          group.logs.some((log) =>
            log.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          (KNOWN_PROGRAMS[group.program] || "Unknown")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : groupedLogs;

  // Get log type styling
  const getLogStyle = (log: string): string => {
    if (log.includes("success")) return "text-green-400 font-semibold";
    if (log.includes("failed") || log.includes("error"))
      return "text-red-400 font-semibold";
    if (log.includes("invoke")) return "text-blue-400";
    if (log.includes("consumed")) return "text-purple-400";
    if (log.includes("Program log:")) return "text-gray-300";
    if (log.includes("Program data:")) return "text-yellow-400";
    return "text-gray-400";
  };

  // Parse and format log messages
  const formatLogMessage = (log: string, lineNumber: number): JSX.Element => {
    // Highlight search term
    if (searchTerm && log.toLowerCase().includes(searchTerm.toLowerCase())) {
      const regex = new RegExp(`(${searchTerm})`, "gi");
      const parts = log.split(regex);
      return (
        <div className="flex gap-3">
          {showLineNumbers && (
            <span className="text-gray-700 text-xs w-8 text-right flex-shrink-0">
              {lineNumber}
            </span>
          )}
          <span className={getLogStyle(log)}>
            {parts.map((part, i) =>
              regex.test(part) ? (
                <span
                  key={i}
                  className="bg-yellow-500/30 text-yellow-200 px-1 rounded"
                >
                  {part}
                </span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </span>
        </div>
      );
    }

    return (
      <div className="flex gap-3">
        {showLineNumbers && (
          <span className="text-gray-700 text-xs w-8 text-right flex-shrink-0">
            {lineNumber}
          </span>
        )}
        <span className={getLogStyle(log)}>{log}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-lg">
            Program Execution Logs
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            {filteredGroups.length} program
            {filteredGroups.length !== 1 ? "s" : ""} executed •{" "}
            {data.logs.length} log entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`px-3 py-1 rounded text-xs ${
              showLineNumbers
                ? "bg-red-900/30 text-red-400"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            {showLineNumbers ? "Hide" : "Show"} Line #
          </button>
          <button
            onClick={() => {
              const allIndices = new Set(filteredGroups.map((_, i) => i));
              setExpandedSections(
                expandedSections.size === filteredGroups.length
                  ? new Set()
                  : allIndices
              );
            }}
            className="px-3 py-1 rounded text-xs bg-gray-800 text-gray-400 hover:bg-gray-700"
          >
            {expandedSections.size === filteredGroups.length
              ? "Collapse All"
              : "Expand All"}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0d0d0d] border border-gray-800 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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

      <div className="space-y-3">
        {filteredGroups.map((group, index) => {
          const isExpanded = expandedSections.has(index);
          const programName =
            KNOWN_PROGRAMS[group.program] || "Unknown Program";
          const computedUnits = group.logs
            .find((log) => log.includes("consumed"))
            ?.match(/(\d+)/)?.[0];

          return (
            <div
              key={index}
              className={`bg-[#0d0d0d] border rounded-lg overflow-hidden ${
                group.failed
                  ? "border-red-800/50"
                  : group.success
                  ? "border-green-800/50"
                  : "border-gray-800"
              }`}
              style={{ marginLeft: `${group.depth * 12}px` }}
            >
              <button
                onClick={() => toggleSection(index)}
                className="w-full p-4 flex items-center justify-between hover:bg-black/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        group.failed
                          ? "bg-red-500"
                          : group.success
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    />
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {programName}
                        </span>
                        {group.depth > 1 && (
                          <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">
                            Depth {group.depth}
                          </span>
                        )}
                        {computedUnits && (
                          <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 rounded text-xs">
                            {parseInt(computedUnits).toLocaleString()} CU
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500 text-xs font-mono mt-1">
                        {group.program}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs">
                    {group.failed ? (
                      <span className="text-red-400 font-semibold">
                        ✗ FAILED
                      </span>
                    ) : group.success ? (
                      <span className="text-green-400 font-semibold">
                        ✓ SUCCESS
                      </span>
                    ) : (
                      <span className="text-gray-500">PENDING</span>
                    )}
                  </div>
                  <span className="text-gray-600 text-xs">
                    {group.logs.length} logs
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-800 p-4 bg-black/50">
                  <div className="font-mono text-xs space-y-0.5 overflow-x-auto">
                    {group.logs.map((log, logIndex) => (
                      <div key={logIndex}>
                        {formatLogMessage(log, logIndex + 1)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12 bg-[#0d0d0d] border border-gray-800 rounded-lg">
          <Terminal className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400">
            No logs found matching "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
}

// Raw Tab Component
function RawTab({
  data,
  CopyButton,
}: {
  data: TransactionDetail;
  CopyButton: React.ComponentType<{ text: string; copyKey: string }>;
}) {
  const [showNativeIncluded, setShowNativeIncluded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(["root"])
  );
  const [viewMode, setViewMode] = useState<"tree" | "raw">("tree");

  const jsonString = JSON.stringify(data.rawData, null, 2);

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy JSON:", err);
    }
  };

  const togglePath = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  // JSON Tree viewer component
  const JSONTreeNode = ({
    value,
    path = "root",
    depth = 0,
  }: {
    value: any;
    path?: string;
    depth?: number;
  }) => {
    const isExpanded = expandedPaths.has(path);
    const isObject =
      value !== null && typeof value === "object" && !Array.isArray(value);
    const isArray = Array.isArray(value);
    const isPrimitive = !isObject && !isArray;

    if (isPrimitive) {
      return (
        <span
          className={`${
            typeof value === "string"
              ? "text-green-400"
              : typeof value === "number"
              ? "text-blue-400"
              : typeof value === "boolean"
              ? "text-purple-400"
              : value === null
              ? "text-red-400"
              : "text-gray-300"
          }`}
        >
          {typeof value === "string" ? `"${value}"` : String(value)}
        </span>
      );
    }

    const keys = Object.keys(value);
    const itemCount = keys.length;

    return (
      <div className="relative">
        <button
          onClick={() => togglePath(path)}
          className="flex items-center gap-2 hover:bg-gray-800/50 rounded px-1 -ml-1"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
          )}
          <span className="text-gray-400">{isArray ? "[" : "{"}</span>
          {!isExpanded && (
            <span className="text-gray-600 text-xs">
              {itemCount} {isArray ? "items" : "properties"}
            </span>
          )}
          {!isExpanded && (
            <span className="text-gray-400">{isArray ? "]" : "}"}</span>
          )}
        </button>

        {isExpanded && (
          <div className="ml-4 border-l border-gray-800 pl-3 mt-1">
            {keys.map((key, index) => {
              const childPath = `${path}.${key}`;
              const childValue = value[key];

              return (
                <div key={key} className="py-0.5">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-300">
                      {isArray ? `[${key}]` : `"${key}"`}:
                    </span>
                    <JSONTreeNode
                      value={childValue}
                      path={childPath}
                      depth={depth + 1}
                    />
                  </div>
                </div>
              );
            })}
            <div className="text-gray-400 -ml-4">
              {isArray ? "]" : "}"}
              {depth === 0 && (
                <span className="text-gray-600 text-xs ml-2">
                  {" "}
                  {itemCount} total
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Syntax highlighted JSON
  const syntaxHighlightJSON = (json: string): JSX.Element[] => {
    const lines = json.split("\n");
    return lines.map((line, index) => {
      let highlightedLine = line;

      // Property names
      highlightedLine = highlightedLine.replace(
        /"([^"]+)":/g,
        '<span class="text-blue-300">"$1":</span>'
      );

      // String values
      highlightedLine = highlightedLine.replace(
        /: "([^"]*)"/g,
        ': <span class="text-green-400">"$1"</span>'
      );

      // Numbers
      highlightedLine = highlightedLine.replace(
        /: (-?\d+\.?\d*)/g,
        ': <span class="text-blue-400">$1</span>'
      );

      // Booleans
      highlightedLine = highlightedLine.replace(
        /: (true|false)/g,
        ': <span class="text-purple-400">$1</span>'
      );

      // Null
      highlightedLine = highlightedLine.replace(
        /: (null)/g,
        ': <span class="text-red-400">$1</span>'
      );

      return (
        <div key={index} className="flex gap-3">
          <span className="text-gray-700 text-xs w-12 text-right flex-shrink-0 select-none">
            {index + 1}
          </span>
          <span dangerouslySetInnerHTML={{ __html: highlightedLine }} />
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-lg">
            Raw Transaction Data
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Complete transaction response from Solana RPC
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("tree")}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                viewMode === "tree"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Tree View
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                viewMode === "raw"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Raw JSON
            </button>
          </div>

          {viewMode === "tree" && (
            <button
              onClick={() => {
                const allPaths = new Set<string>();
                const traverse = (obj: any, path: string) => {
                  if (obj !== null && typeof obj === "object") {
                    allPaths.add(path);
                    Object.keys(obj).forEach((key) => {
                      traverse(obj[key], `${path}.${key}`);
                    });
                  }
                };
                traverse(data.rawData, "root");

                if (expandedPaths.size > 1) {
                  setExpandedPaths(new Set(["root"]));
                } else {
                  setExpandedPaths(allPaths);
                }
              }}
              className="px-3 py-1 rounded text-xs bg-gray-800 text-gray-400 hover:bg-gray-700"
            >
              {expandedPaths.size > 1 ? "Collapse All" : "Expand All"}
            </button>
          )}

          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-sm text-white font-medium"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy All
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-3">
          <div className="text-gray-500 text-xs">Size</div>
          <div className="text-white font-mono text-lg mt-1">
            {(jsonString.length / 1024).toFixed(2)} KB
          </div>
        </div>
        <div className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-3">
          <div className="text-gray-500 text-xs">Lines</div>
          <div className="text-white font-mono text-lg mt-1">
            {jsonString.split("\n").length}
          </div>
        </div>
        <div className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-3">
          <div className="text-gray-500 text-xs">Instructions</div>
          <div className="text-white font-mono text-lg mt-1">
            {data.instructions.length}
          </div>
        </div>
        <div className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-3">
          <div className="text-gray-500 text-xs">Accounts</div>
          <div className="text-white font-mono text-lg mt-1">
            {data.rawData?.transaction?.message?.accountKeys?.length || 0}
          </div>
        </div>
      </div>

      {/* JSON Display */}
      <div className="bg-[#0d0d0d] border border-gray-800 rounded-lg overflow-hidden">
        <div className="border-b border-gray-800 p-3 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400 text-sm font-medium">
              {viewMode === "tree" ? "Interactive JSON Tree" : "Formatted JSON"}
            </span>
          </div>
          <div className="text-gray-600 text-xs">
            {viewMode === "tree"
              ? "Click to expand/collapse"
              : "Syntax highlighted"}
          </div>
        </div>

        <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
          {viewMode === "tree" ? (
            <div className="font-mono text-xs text-gray-300">
              <JSONTreeNode value={data.rawData} />
            </div>
          ) : (
            <div className="font-mono text-xs text-gray-300">
              {syntaxHighlightJSON(jsonString)}
            </div>
          )}
        </div>
      </div>

      {/* Quick Access Links */}
      <div className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-4">
        <div className="text-gray-500 text-xs uppercase mb-3">Quick Access</div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setViewMode("tree");
              setExpandedPaths(new Set(["root", "root.meta"]));
            }}
            className="text-left p-2 bg-black/30 hover:bg-black/50 rounded border border-gray-800 hover:border-gray-700 transition-colors"
          >
            <div className="text-white text-sm">Transaction Meta</div>
            <div className="text-gray-500 text-xs">
              Fee, status, compute units
            </div>
          </button>
          <button
            onClick={() => {
              setViewMode("tree");
              setExpandedPaths(new Set(["root", "root.transaction"]));
            }}
            className="text-left p-2 bg-black/30 hover:bg-black/50 rounded border border-gray-800 hover:border-gray-700 transition-colors"
          >
            <div className="text-white text-sm">Transaction Message</div>
            <div className="text-gray-500 text-xs">
              Instructions, accounts, signatures
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// Import KNOWN_PROGRAMS for logs
const KNOWN_PROGRAMS: Record<string, string> = {
  "11111111111111111111111111111111": "System Program",
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: "Token Program",
  ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL: "Associated Token Program",
  ComputeBudget111111111111111111111111111111: "Compute Budget Program",
  JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: "Jupiter Aggregator",
};
