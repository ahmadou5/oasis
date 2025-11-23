'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import clsx from 'clsx'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7 // Maximum number of page buttons to show

    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 4) {
        // Show ellipsis if current page is far from start
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }

      if (currentPage < totalPages - 3) {
        // Show ellipsis if current page is far from end
        pages.push('...')
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      {/* Items info */}
      <div className="text-sm text-solana-gray-400">
        Showing {startItem} to {endItem} of {totalItems} validators
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* First page button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            currentPage === 1
              ? 'text-solana-gray-500 cursor-not-allowed'
              : 'text-solana-gray-400 hover:text-white hover:bg-solana-gray-800'
          )}
          title="First page"
        >
          <ChevronsLeft size={18} />
        </button>

        {/* Previous page button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            currentPage === 1
              ? 'text-solana-gray-500 cursor-not-allowed'
              : 'text-solana-gray-400 hover:text-white hover:bg-solana-gray-800'
          )}
          title="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum, index) => (
            <button
              key={index}
              onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : undefined}
              disabled={typeof pageNum !== 'number'}
              className={clsx(
                'min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium transition-colors',
                typeof pageNum === 'number'
                  ? pageNum === currentPage
                    ? 'bg-solana-purple text-white'
                    : 'text-solana-gray-400 hover:text-white hover:bg-solana-gray-800'
                  : 'text-solana-gray-500 cursor-default'
              )}
            >
              {pageNum}
            </button>
          ))}
        </div>

        {/* Next page button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            currentPage === totalPages
              ? 'text-solana-gray-500 cursor-not-allowed'
              : 'text-solana-gray-400 hover:text-white hover:bg-solana-gray-800'
          )}
          title="Next page"
        >
          <ChevronRight size={18} />
        </button>

        {/* Last page button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            currentPage === totalPages
              ? 'text-solana-gray-500 cursor-not-allowed'
              : 'text-solana-gray-400 hover:text-white hover:bg-solana-gray-800'
          )}
          title="Last page"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  )
}