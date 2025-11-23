'use client'

import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { updateFilters, ValidatorFilters as Filters } from '@/store/slices/validatorSlice'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

export function ValidatorFilters() {
  const dispatch = useDispatch<AppDispatch>()
  const filters = useSelector((state: RootState) => state.validators.filters)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearchChange = (search: string) => {
    dispatch(updateFilters({ search }))
  }

  const handleFilterChange = (updates: Partial<Filters>) => {
    dispatch(updateFilters(updates))
  }

  const resetFilters = () => {
    dispatch(updateFilters({
      search: '',
      minApy: 0,
      maxCommission: 10,
      sortBy: 'apy',
      sortOrder: 'desc',
      showOnlyActive: true,
    }))
    setShowAdvanced(false)
  }

  const hasActiveFilters = filters.search || 
    filters.minApy > 0 || 
    filters.maxCommission < 10 || 
    !filters.showOnlyActive

  return (
    <div className="card space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-solana-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search validators by name or address..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input-primary pl-10 w-full"
          />
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange({ sortBy: e.target.value as Filters['sortBy'] })}
            className="input-primary"
          >
            <option value="apy">Sort by APY</option>
            <option value="name">Sort by Name</option>
            <option value="commission">Sort by Commission</option>
            <option value="stake">Sort by Stake</option>
          </select>
          
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
            className="input-primary"
          >
            <option value="desc">High to Low</option>
            <option value="asc">Low to High</option>
          </select>
        </div>

        {/* Advanced Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={clsx(
            'btn-secondary flex items-center gap-2',
            showAdvanced && 'bg-solana-purple/20 border-solana-purple/50'
          )}
        >
          <SlidersHorizontal size={18} />
          Filters
          {hasActiveFilters && (
            <span className="bg-solana-purple text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="pt-4 border-t border-solana-gray-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Min APY */}
            <div>
              <label className="block text-sm font-medium text-solana-gray-300 mb-2">
                Minimum APY: {filters.minApy}%
              </label>
              <input
                type="range"
                min="0"
                max="15"
                step="0.1"
                value={filters.minApy}
                onChange={(e) => handleFilterChange({ minApy: parseFloat(e.target.value) })}
                className="w-full h-2 bg-solana-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Max Commission */}
            <div>
              <label className="block text-sm font-medium text-solana-gray-300 mb-2">
                Max Commission: {filters.maxCommission}%
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filters.maxCommission}
                onChange={(e) => handleFilterChange({ maxCommission: parseFloat(e.target.value) })}
                className="w-full h-2 bg-solana-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-solana-gray-300 mb-2">
                Validator Status
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showOnlyActive}
                    onChange={(e) => handleFilterChange({ showOnlyActive: e.target.checked })}
                    className="w-4 h-4 text-solana-purple bg-solana-gray-800 border-solana-gray-600 rounded focus:ring-solana-purple focus:ring-2"
                  />
                  <span className="text-sm">Active only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end">
            <button
              onClick={resetFilters}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <X size={16} />
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}