"use client";

import React, { useMemo, useState } from "react";
import { PNodeCard } from "./PNodeCard";
import { Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { NewPNodeCard } from "./NewPNodeCard";
import { usePnodes } from "../../hooks/usePnodes";
import { PNodeTable } from "./PNodeTable";
import CustomDropdown from "../DropDown";
import { GrRefresh } from "react-icons/gr";
import clsx from "clsx";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

type SortField =
  | "address"
  | "uptime"
  | "storage_usage_percent"
  | "storage_committed"
  | "healthScore"
  | "last_seen_timestamp"
  | "version";
type SortDirection = "asc" | "desc";

export function PNodesList() {
  const { pnodes, refetch, loading } = usePnodes();
  const searchTerm = useSelector<RootState, string>(
    (state) => state.search.pnodes.value
  );
  const [sortField, setSortField] = useState<SortField>("healthScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "online" | "offline" | "public" | "private"
  >("all");

  // Ensure pnodes is an array and provide fallback
  const safeNodes = Array.isArray(pnodes) ? pnodes : [];

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [sortBy, setSortBy] = useState<"apy" | "stake" | "commission" | "name">(
    "apy"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter and sort validators
  const filteredNodes = useMemo(() => {
    let filtered = [...pnodes];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((n) => {
        const matchesSearch =
          n?.address?.toLowerCase().includes(searchLower) ||
          n?.pubkey?.toLowerCase().includes(searchLower) ||
          n?.version?.toLowerCase().includes(searchLower);

        const matchesStatus =
          filterStatus === "all" ||
          (filterStatus === "online" && n?.isOnline) ||
          (filterStatus === "offline" && !n?.isOnline) ||
          (filterStatus === "public" && n?.is_public) ||
          (filterStatus === "private" && !n?.is_public);

        return matchesSearch && matchesStatus;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortBy];
      let bValue: string | number = b[sortBy];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [pnodes, searchTerm]);

  // Paginate validators
  const paginatedNodes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredNodes.slice(startIndex, startIndex + pageSize);
  }, [filteredNodes, currentPage, pageSize]);

  // Calculate pagination info
  const totalPages = Math.ceil(filteredNodes.length / pageSize);

  const handleRefresh = () => {
    refetch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(page, totalPages));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <SortAsc className="w-4 h-4" />
    ) : (
      <SortDesc className="w-4 h-4" />
    );
  };

  return (
    <section className="py-16 w-full px-2">
      <div className="mx-auto">
        <div>
          <p className="text-sm sm:text-base text-gray-500 dark:text-solana-gray-400">
            {filteredNodes.length} PNodes found
            {totalPages > 1 && (
              <span className="hidden sm:inline ml-2">
                • Page {currentPage} of {totalPages}
              </span>
            )}
          </p>
        </div>
        <div className="mb-8 mt-3">
          {/* Results Count */}

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Page Size Selector */}
            <CustomDropdown
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.toFixed()))}
            />

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className=" flex items-end gap-2 px-3 sm:px-4 text-xs sm:text-sm"
            >
              <GrRefresh
                size={20}
                className={clsx(loading && "animate-spin")}
              />
            </button>
          </div>
        </div>

        {/* PNodes Grid */}
        {filteredNodes.length > 0 ? (
          <div className="flex flex-col lg:flex lg:flex- gap-6">
            <PNodeTable
              nodes={paginatedNodes}
              onNodeSelect={(node) => alert(node.pubkey)}
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="w-12 h-12 mx-auto mb-2" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No PNodes Found
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
