"use client";

import { useState, useMemo } from "react";
import { ValidatorInfo } from "@/store/slices/validatorSlice";
import { useValidators } from "@/hooks/useValidators";
import { ValidatorCard } from "./ValidatorCard";
import { ValidatorTable } from "./ValidatorTable";
import { LoadingSpinner } from "./LoadingSpinner";
import { StakeModal } from "./StakeModal";
import { Grid, List, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { NewValidatorCard } from "./Home/NewValidatorCard";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface ValidatorListProps {
  showFilters?: boolean;
}

export function ValidatorList({ showFilters = true }: ValidatorListProps) {
  const searchString = useSelector<RootState>((state) => state.search.value);
  // Use the enhanced validator hook as single source of truth
  const { validators, loading, error, stats, lastUpdated, refreshValidators } =
    useValidators();

  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedValidatorForStaking, setSelectedValidatorForStaking] =
    useState<ValidatorInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
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
      const searchLower = searchTerm.toLowerCase();
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
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
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
          <button onClick={handleRefresh} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            {showFilters ? "Top Validators" : "All Validators"}
          </h2>

          {/* Simple Search */}
          {showFilters && (
            <div className="mt-4 max-w-md">
              <input
                type="text"
                placeholder="Search validators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-primary w-full"
              />
            </div>
          )}
          <p className="text-gray-500 dark:text-solana-gray-400">
            {filteredValidators.length} validators found
            {stats.activeValidators > 0 && (
              <span className="ml-2 text-solana-green">
                • {stats.activeValidators} active
              </span>
            )}
            {totalPages > 1 && (
              <span className="ml-2">
                • Page {currentPage} of {totalPages}
              </span>
            )}
            {lastUpdated && (
              <span className="ml-2">
                • Updated {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-solana-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("table")}
              className={clsx(
                "p-2 rounded-md transition-colors",
                viewMode === "table"
                  ? "bg-solana-purple text-white"
                  : "text-solana-gray-400 hover:text-white"
              )}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={clsx(
                "p-2 rounded-md transition-colors",
                viewMode === "grid"
                  ? "bg-solana-purple text-white"
                  : "text-solana-gray-400 hover:text-white"
              )}
            >
              <Grid size={18} />
            </button>
          </div>

          {/* Page Size Selector */}
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="input-primary text-sm"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={16} className={clsx(loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Enhanced Stats Display */}
      {validators.length > 0 && stats.totalValidators > 0 && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📊 Network Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-solana-green">
                {stats.activeValidators}
              </div>
              <div className="text-sm text-gray-500 dark:text-solana-gray-400">
                Active Validators
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-solana-blue">
                {(stats.totalStake / 1_000_000).toFixed(1)}M
              </div>
              <div className="text-sm text-gray-500 dark:text-solana-gray-400">
                Total Stake (SOL)
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-solana-purple">
                {stats.averageApy.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-solana-gray-400">
                Avg APY
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {stats.averageCommission.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-solana-gray-400">
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
            <LoadingSpinner />
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
