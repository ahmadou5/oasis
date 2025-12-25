"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  List,
  Code,
  ShieldCheck,
  Shield,
  Key,
  ChevronDown,
  ChevronRight,
  Filter,
  FileText,
  AlertCircle,
  Info,
  RefreshCw,
  Activity,
} from "lucide-react";
import type { AccountOverview } from "@/lib/solana/accountOverview";
import {
  formatAddress,
  formatRelativeTime,
  formatFullTimestamp,
} from "@/utils/tokenFormatters";

interface CopyState {
  [key: string]: boolean;
}

type TabType = "history" | "idl" | "verification" | "security" | "authority";

interface EnhancedProgramViewProps {
  data: AccountOverview;
}

export function EnhancedProgramView({ data }: EnhancedProgramViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("history");
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [hideSpam, setHideSpam] = useState(false);
  const [showJson, setShowJson] = useState(false);

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

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const CopyButton = ({ text, copyKey }: { text: string; copyKey: string }) => (
    <button
      onClick={() => handleCopy(text, copyKey)}
      className="p-1 rounded hover:bg-gray-700 transition-colors"
      title="Copy to clipboard"
    >
      {copyStates[copyKey] ? (
        <Check className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-gray-500 hover:text-gray-300" />
      )}
    </button>
  );

  // Determine if program is immutable (simplified check)
  const isImmutable: boolean = !data.owner || data.executable;
  const isVerified = false; // Would check verification registry

  return (
    <div className="space-y-6">
      {/* Program Header */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
        <div className="flex items-start justify-between">
          {/* Program Identity */}
          <div className="flex items-center gap-4">
            {/* Program Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Code className="w-8 h-8 text-white" />
            </div>

            {/* Program Info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">
                  {data.kind === "program" ? "Smart Contract" : "Program"}
                </h1>
                <a
                  href={`https://explorer.solana.com/address/${data.pubkey}?cluster=${data.network}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-0.5 bg-orange-900/30 text-orange-400 rounded text-xs uppercase font-medium">
                  PROGRAM
                </span>
                <span className="text-gray-500 font-mono">
                  {formatAddress(data.pubkey, 6, 6)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-700 hover:border-gray-600 rounded-lg text-sm text-gray-300 transition-colors">
              Get Verifiable
            </button>
            {isImmutable && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-900/20 border border-green-800/50 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-green-400 text-sm font-medium">
                  Immutable
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-800 overflow-x-auto">
          {[
            { id: "history", label: "HISTORY", icon: List },
            { id: "idl", label: "IDL", icon: Code },
            { id: "verification", label: "VERIFICATION", icon: ShieldCheck },
            { id: "security", label: "SECURITY", icon: Shield },
            { id: "authority", label: "AUTHORITY", icon: Key },
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
              data={data}
              hideSpam={hideSpam}
              setHideSpam={setHideSpam}
            />
          )}
          {activeTab === "idl" && (
            <IDLTab
              data={data}
              expanded={expandedSections}
              toggleSection={toggleSection}
            />
          )}
          {activeTab === "verification" && (
            <VerificationTab
              data={data}
              isVerified={isVerified}
              expanded={expandedSections}
              toggleSection={toggleSection}
              showJson={showJson}
              setShowJson={setShowJson}
            />
          )}
          {activeTab === "security" && (
            <SecurityTab
              data={data}
              expanded={expandedSections}
              toggleSection={toggleSection}
            />
          )}
          {activeTab === "authority" && (
            <AuthorityTab
              data={data}
              isImmutable={isImmutable}
              expanded={expandedSections}
              toggleSection={toggleSection}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// History Tab Component
function HistoryTab({
  data,
  hideSpam,
  setHideSpam,
}: {
  data: AccountOverview;
  hideSpam: boolean;
  setHideSpam: (value: boolean) => void;
}) {
  const transactions = data.walletSignatures || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-white text-lg font-semibold">
            Account transactions
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

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400">No transactions found</div>
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
                  Time
                </th>
                <th className="text-left pb-3 text-gray-500 text-xs uppercase font-medium">
                  Signature
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((tx) => (
                <tr
                  key={tx.signature}
                  className="border-b border-gray-800/50 hover:bg-[#0d0d0d] transition-colors"
                >
                  <td className="py-3">
                    <span className="text-gray-300 text-sm">Transaction</span>
                  </td>
                  <td className="py-3 text-gray-400 text-sm">
                    {formatRelativeTime(tx.blockTime)}
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
                        onClick={() =>
                          navigator.clipboard.writeText(tx.signature)
                        }
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <Copy className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
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

// IDL Tab Component
function IDLTab({
  data,
  expanded,
  toggleSection,
}: {
  data: AccountOverview;
  expanded: Set<string>;
  toggleSection: (id: string) => void;
}) {
  const hasIDL = false; // Would check for actual IDL

  return (
    <div>
      <h3 className="text-white text-lg font-semibold mb-6">Anchor IDL</h3>

      {!hasIDL && (
        <div>
          {/* Empty State */}
          <div className="bg-[#0d0d0d] border border-red-900/30 rounded-xl p-12 text-center mb-6">
            <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-red-400" />
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">NO IDL FOUND</h4>
            <p className="text-gray-400 mb-4 max-w-md mx-auto">
              The Anchor IDL for this program is not available or could not be
              retrieved.
            </p>
            <div className="text-left max-w-md mx-auto">
              <div className="text-red-400 text-sm font-semibold mb-2">
                Possible Reasons:
              </div>
              <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                <li>The program may not be an Anchor program</li>
                <li>The IDL might not be published on chain</li>
                <li>There could be network connectivity issues</li>
              </ul>
            </div>
          </div>

          {/* Expandable Explanation */}
          <ExpandableSection
            id="idl-what"
            title="WHAT'S AN IDL?"
            expanded={expanded}
            toggleSection={toggleSection}
          >
            <div className="space-y-4 text-gray-300">
              <p>
                An IDL (Interface Definition Language) is a JSON file that
                describes the structure, instructions, and data types of an
                Anchor smart contract on Solana.
              </p>
              <div>
                <h5 className="text-red-400 font-semibold mb-2">
                  KEY COMPONENTS:
                </h5>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong>Instructions:</strong> Available functions that can
                    be called on the program
                  </li>
                  <li>
                    <strong>Accounts:</strong> Account structures and their
                    validation rules
                  </li>
                  <li>
                    <strong>Types:</strong> Custom data structures used by the
                    program
                  </li>
                  <li>
                    <strong>Events:</strong> Events emitted by the program for
                    off-chain tracking
                  </li>
                  <li>
                    <strong>Errors:</strong> Custom error codes and messages
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="text-red-400 font-semibold mb-2">
                  WHY IS THIS IMPORTANT?
                </h5>
                <p>
                  IDLs enable developers to interact with smart contracts
                  programmatically, generate client libraries automatically, and
                  understand the program's interface without reading the source
                  code.
                </p>
              </div>
            </div>
          </ExpandableSection>
        </div>
      )}
    </div>
  );
}

// Verification Tab Component
function VerificationTab({
  data,
  isVerified,
  expanded,
  toggleSection,
  showJson,
  setShowJson,
}: {
  data: AccountOverview;
  isVerified: boolean;
  expanded: Set<string>;
  toggleSection: (id: string) => void;
  showJson: boolean;
  setShowJson: (value: boolean) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white text-lg font-semibold">
          Program Verification
        </h3>
        <button
          onClick={() => setShowJson(!showJson)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300"
        >
          <Code className="w-4 h-4" />
          Show JSON
        </button>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-900/20 border border-orange-800/50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-orange-400" />
          <span className="text-orange-400 font-medium">Unverified Build</span>
        </div>
      </div>

      {/* Verification Info Grid */}
      <div className="bg-[#0d0d0d] border border-gray-800 rounded-xl divide-y divide-gray-800">
        <InfoRow
          label="Status"
          value={isVerified ? "Verified" : "Unverified"}
        />
        <InfoRow label="Message" value="On-chain program not verified" />
        <InfoRow label="On-chain Hash" value="N/A" mono />
        <InfoRow label="Executable Hash" value="N/A" mono />
        <InfoRow label="Last Verified" value="Not verified yet" />
        <InfoRow label="Signed" value="No signer" />
        <InfoRow label="Repository" value="Not available" />
      </div>

      {/* Expandable Explanation */}
      <div className="mt-6">
        <ExpandableSection
          id="verification-what"
          title="WHAT DOES THIS MEAN?"
          expanded={expanded}
          toggleSection={toggleSection}
        >
          <div className="space-y-4 text-gray-300">
            <p>
              Program verification allows developers to prove that the on-chain
              bytecode matches the published source code, increasing
              transparency and trust.
            </p>
            <p>
              An unverified program means the bytecode cannot be independently
              verified against source code, which doesn't necessarily mean it's
              malicious, but users should exercise additional caution.
            </p>
            <div>
              <h5 className="text-red-400 font-semibold mb-2">
                VERIFICATION BENEFITS:
              </h5>
              <ul className="space-y-1 list-disc list-inside">
                <li>Increases user confidence in the program</li>
                <li>Allows security audits of the source code</li>
                <li>Enables reproducible builds</li>
                <li>Demonstrates developer transparency</li>
              </ul>
            </div>
          </div>
        </ExpandableSection>
      </div>
    </div>
  );
}

// Security Tab Component
function SecurityTab({
  data,
  expanded,
  toggleSection,
}: {
  data: AccountOverview;
  expanded: Set<string>;
  toggleSection: (id: string) => void;
}) {
  const hasSecurityTxt = false; // Would check for actual security.txt

  return (
    <div>
      <h3 className="text-white text-lg font-semibold mb-6">SECURITY.TXT</h3>

      {!hasSecurityTxt && (
        <div>
          {/* Empty State */}
          <div className="bg-[#0d0d0d] border border-red-900/30 rounded-xl p-12 text-center mb-6">
            <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-red-400" />
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">
              NO SECURITY.TXT FOUND
            </h4>
            <p className="text-gray-400 mb-4 max-w-md mx-auto">
              The security.txt for this program is not available or could not be
              retrieved.
            </p>
            <div className="text-left max-w-md mx-auto">
              <div className="text-red-400 text-sm font-semibold mb-2">
                Possible Reasons:
              </div>
              <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                <li>The program does not have a security.txt file</li>
                <li>There could be network connectivity issues</li>
                <li>The security.txt file might be incorrectly formatted</li>
              </ul>
            </div>
          </div>

          {/* Expandable Explanation */}
          <ExpandableSection
            id="security-what"
            title="WHAT'S A SECURITY.TXT?"
            expanded={expanded}
            toggleSection={toggleSection}
          >
            <div className="space-y-4 text-gray-300">
              <p>
                A security.txt file is a standard way for programs to
                communicate security policies, vulnerability disclosure
                procedures, and contact information for security researchers.
              </p>
              <div>
                <h5 className="text-red-400 font-semibold mb-2">
                  TYPICAL CONTENTS:
                </h5>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Security contact email or form</li>
                  <li>Encryption key for secure communication</li>
                  <li>Policy on responsible disclosure</li>
                  <li>Bug bounty program information (if applicable)</li>
                  <li>Preferred languages for communication</li>
                </ul>
              </div>
              <p>
                Having a security.txt demonstrates a program's commitment to
                security and provides a clear channel for reporting
                vulnerabilities.
              </p>
            </div>
          </ExpandableSection>
        </div>
      )}
    </div>
  );
}

// Authority Tab Component
function AuthorityTab({
  data,
  isImmutable,
  expanded,
  toggleSection,
}: {
  data: AccountOverview;
  isImmutable: boolean;
  expanded: Set<string>;
  toggleSection: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white text-lg font-semibold">Program Authority</h3>
        {isImmutable && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-900/20 border border-green-800/50 rounded-lg">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium uppercase">
              Immutable
            </span>
          </div>
        )}
      </div>

      {/* Authority Status */}
      <div className="bg-[#0d0d0d] border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Key className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h4 className="text-white text-lg font-semibold mb-2">
              This program is {isImmutable ? "immutable" : "upgradeable"} and{" "}
              {isImmutable ? "cannot" : "can"} be upgraded
            </h4>
            <p className="text-gray-400">
              {isImmutable
                ? "The upgrade authority has been revoked, making this program permanently immutable."
                : "This program has an upgrade authority and can be modified by the authority holder."}
            </p>
          </div>
        </div>
      </div>

      {/* Expandable Explanation */}
      <ExpandableSection
        id="authority-what"
        title="WHAT DOES THIS MEAN?"
        expanded={expanded}
        toggleSection={toggleSection}
      >
        <div className="space-y-4 text-gray-300">
          <div>
            <h5 className="text-red-400 font-semibold mb-2">
              IMMUTABLE PROGRAMS:
            </h5>
            <p className="mb-2">
              An immutable program cannot be modified after deployment. The
              upgrade authority has been permanently revoked, providing strong
              guarantees that the code cannot change.
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                <strong>Security:</strong> No risk of malicious upgrades
              </li>
              <li>
                <strong>Trust:</strong> Users know the code will never change
              </li>
              <li>
                <strong>Tradeoff:</strong> Bugs cannot be fixed; new deployment
                required
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-red-400 font-semibold mb-2">
              UPGRADEABLE PROGRAMS:
            </h5>
            <p className="mb-2">
              An upgradeable program can be modified by the upgrade authority,
              allowing bug fixes and improvements but requiring trust in the
              authority holder.
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                <strong>Flexibility:</strong> Can fix bugs and add features
              </li>
              <li>
                <strong>Maintenance:</strong> Easier to maintain over time
              </li>
              <li>
                <strong>Risk:</strong> Authority holder can make malicious
                changes
              </li>
            </ul>
          </div>
        </div>
      </ExpandableSection>
    </div>
  );
}

// Helper Components
function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className={`text-white text-sm ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function ExpandableSection({
  id,
  title,
  expanded,
  toggleSection,
  children,
}: {
  id: string;
  title: string;
  expanded: Set<string>;
  toggleSection: (id: string) => void;
  children: React.ReactNode;
}) {
  const isExpanded = expanded.has(id);

  return (
    <div className="bg-[#0d0d0d] border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
      >
        <span className="text-red-400 font-semibold text-sm">{title}</span>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-gray-800">{children}</div>
      )}
    </div>
  );
}
