"use client";

import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import { ValidatorInfo, XandeumNodeWithMetrics } from "../../types";
import { NewPNodeCard } from "./NewPNodeCard";

interface PNodesTableProps {
  nodes: XandeumNodeWithMetrics[];
  onNodeSelect: (node: XandeumNodeWithMetrics) => void;
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
}

type SortField = "name" | "apy" | "commission" | "stake" | "skipRate";
type SortDirection = "asc" | "desc";

export function PNodeTable({
  nodes,
  onNodeSelect,
  totalPages,
  currentPage,
  handlePageChange,
}: PNodesTableProps) {
  const [sortField, setSortField] = useState<SortField>("apy");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedNodes = [...nodes].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    // Type-safe property access
    switch (sortField) {
      case "name":
        aValue = a.name || a.address;
        bValue = b.name || b.address;
        break;
      case "apy":
        aValue = a.apy || 0;
        bValue = b.apy || 0;
        break;
      case "commission":
        aValue = a.commission || 0;
        bValue = b.commission || 0;
        break;
      case "stake":
        aValue = a.stake || 0;
        bValue = b.stake || 0;
        break;
      case "skipRate":
        aValue = a.uptime || 0;
        bValue = b.uptime || 0;
        break;
      default:
        aValue = 0;
        bValue = 0;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="opacity-40" />;
    }

    return sortDirection === "asc" ? (
      <ArrowUp size={14} className="text-solana-purple" />
    ) : (
      <ArrowDown size={14} className="text-solana-purple" />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-solana-green";
      case "delinquent":
        return "bg-yellow-400";
      case "inactive":
        return "bg-red-400";
      default:
        return "bg-solana-gray-400";
    }
  };

  return (
    <div className="border border-green-600/40 rounded-xl p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="w-full">
          <div className="w-full">
            {sortedNodes.map((node) => (
              <NewPNodeCard
                key={node.address}
                pnode={node}
                onSelect={() => onNodeSelect(node)}
              />
            ))}
          </div>
          <div className="flex items-end justify-end py-3 px-2">
            {totalPages > 1 && (
              <div className="flex items-end gap-2 mt-0 justify-end px-4">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-9 h-9 rounded-md bg-gray-800/0 hover:bg-green-700/20 border border-green-400/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-300 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Page Numbers */}
                {(() => {
                  const pages = [];
                  const maxVisible = 3;
                  let startPage = Math.max(1, currentPage - 1);
                  let endPage = Math.min(
                    totalPages,
                    startPage + maxVisible - 1
                  );

                  if (endPage - startPage < maxVisible - 1) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`w-9 h-9 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                          currentPage === i
                            ? "bg-green-400/60 text-gray-900"
                            : "bg-gray-800/0 border border-green-400/40 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  return pages;
                })()}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 rounded-md bg-gray-800/0 hover:bg-green-700/20 disabled:opacity-30 disabled:cursor-not-allowed border border-green-400/40 flex items-center justify-center text-gray-300 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
