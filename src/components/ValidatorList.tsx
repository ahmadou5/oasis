"use client";

import { useState, useMemo } from "react";

import { ValidatorCard } from "./ValidatorCard";
import { ValidatorTable } from "./ValidatorTable";
import { Skeleton } from "./Skeleton";
import { StakeModal } from "./StakeModal";
import { Grid, List, LucideRefreshCcw, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { GrRefresh } from "react-icons/gr";
import { useSelector } from "react-redux";

import CustomDropdown from "./DropDown";
import { RootState } from "../store";
import { useValidators } from "../hooks/useValidators";
import { ValidatorInfo } from "../types";

interface ValidatorListProps {
  showFilters?: boolean;
}

interface StringState {
  value: string;
}

export function ValidatorList({ showFilters = false }: ValidatorListProps) {
  const searchString = useSelector<RootState, string>(
    (state) => state.search.validators.value
  );
  // Use the enhanced validator hook as single source of truth
  const { validators, loading, error, stats, lastUpdated, refreshValidators } =
    useValidators();

  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedValidatorForStaking, setSelectedValidatorForStaking] =
    useState<ValidatorInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [sortBy, setSortBy] = useState<"apy" | "stake" | "commission" | "name">(
    "apy"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  console.log("from val", searchString);
  // Filter and sort validators
  const filteredValidators = useMemo(() => {
    let filtered = [...validators];

    // Search filter
    if (searchString) {
      const searchLower = searchString.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(searchLower) ||
          v.address.toLowerCase().includes(searchLower) ||
          (v.dataCenter && v.dataCenter.toLowerCase().includes(searchLower))
      );
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
  }, [validators, searchString, sortBy, sortOrder]);

  // Paginate validators
  const paginatedValidators = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredValidators.slice(startIndex, startIndex + pageSize);
  }, [filteredValidators, currentPage, pageSize]);

  // Calculate pagination info
  const totalPages = Math.ceil(filteredValidators.length / pageSize);

  const handleRefresh = () => {
    refreshValidators();
  };

  const handleValidatorSelect = (validator: ValidatorInfo) => {
    setSelectedValidatorForStaking(validator);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(page, totalPages));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
  };

  if (loading && validators.length === 0) {
    return (
      <div className="space-y-6 py-6">
        <div className="flex items-center justify-between">
          <Skeleton width="w-1/3" height="h-8" />
          <Skeleton width="w-32" height="h-10" radius="lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card">
              <div className="flex items-center gap-3">
                <Skeleton width="w-10" height="h-10" radius="full" />
                <div className="flex-1">
                  <Skeleton width="w-2/3" height="h-4" />
                  <div className="mt-2">
                    <Skeleton width="w-1/2" height="h-3" radius="sm" />
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                <Skeleton height="h-3" radius="sm" />
                <Skeleton height="h-3" radius="sm" />
                <Skeleton width="w-5/6" height="h-3" radius="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-green-400/5 border rounded-xl border-green-500/50 text-center py-12">
        <div className="text-red-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold mb-2">
            Failed to Load Validators
          </h3>
          <p className="text-solana-gray-400 mb-4">{error}</p>
          <button onClick={handleRefresh} className="flex ml-auto mr-auto">
            Try Again
            <GrRefresh
              size={20}
              className={clsx(loading && "animate-spin", "ml-2 mr-2")}
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm sm:text-base text-gray-500 dark:text-solana-gray-400">
            {filteredValidators.length} validators found
            {stats.activeValidators > 0 && (
              <span className="ml-2 text-solana-green">
                • {stats.activeValidators} active
              </span>
            )}
            {totalPages > 1 && (
              <span className="hidden sm:inline ml-2">
                • Page {currentPage} of {totalPages}
              </span>
            )}
            {lastUpdated && (
              <span className="hidden md:inline ml-2">
                • Updated {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Page info on mobile */}
          <div className="sm:hidden text-sm text-gray-500 dark:text-solana-gray-400">
            Page {currentPage} of {totalPages}
          </div>

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
      </div>

      {/* Enhanced Stats Display */}
      {validators.length > 0 && stats.totalValidators > 0 && (
        <div className="card mb-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            📊 Network Statistics
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <div className="text-lg sm:text-2xl font-bold text-solana-green">
                {stats.activeValidators}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-solana-gray-400">
                Active Validators
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-solana-blue">
                {(stats.totalStake / 1_000_000).toFixed(1)}M
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-solana-gray-400">
                Total Stake (SOL)
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-solana-purple">
                {stats.averageApy.toFixed(2)}%
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-solana-gray-400">
                Avg APY
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-yellow-400">
                {stats.averageCommission.toFixed(1)}%
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-solana-gray-400">
                Avg Commission
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validator Display */}
      {paginatedValidators.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-solana-gray-400">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m7-1v1"
              />
            </svg>
            <h3 className="text-xl font-semibold mb-2">No Validators Found</h3>
            <p>Try adjusting your filters or refresh the data.</p>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedValidators.map((validator) => (
            <ValidatorCard
              key={validator.address}
              validator={validator}
              onSelect={() => handleValidatorSelect(validator)}
              //totalPages
              //currentPage
            />
          ))}
        </div>
      ) : (
        <ValidatorTable
          validators={paginatedValidators}
          onValidatorSelect={handleValidatorSelect}
          totalPages={totalPages}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
        />
      )}

      {/* Loading Overlay */}
      {loading && validators.length > 0 && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-solana-gray-900 rounded-lg p-6 flex items-center gap-3">
            <Skeleton width="w-6" height="h-6" radius="full" />
            <span>Updating validators...</span>
          </div>
        </div>
      )}

      {/* Stake Modal */}
      {selectedValidatorForStaking && (
        <StakeModal
          validator={selectedValidatorForStaking}
          onClose={() => setSelectedValidatorForStaking(null)}
        />
      )}
    </div>
  );
}
