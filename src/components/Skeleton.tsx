'use client'

import clsx from 'clsx'
import React from 'react'

type SkeletonRadius = 'none' | 'sm' | 'md' | 'lg' | 'full'

type SkeletonProps = {
  /** Tailwind width class (e.g. 'w-full', 'w-32') */
  width?: string
  /** Tailwind height class (e.g. 'h-4', 'h-10') */
  height?: string
  /** Extra classes for layout (margins, flex behavior, etc.) */
  className?: string
  /** Border radius preset */
  radius?: SkeletonRadius
}

const radiusClasses: Record<SkeletonRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

/**
 * A shimmer skeleton block.
 *
 * Usage:
 *   <Skeleton width="w-full" height="h-4" />
 */
export function Skeleton({
  width = 'w-full',
  height = 'h-4',
  className,
  radius = 'md',
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        'relative overflow-hidden',
        width,
        height,
        radiusClasses[radius],
        // Base fill
        'bg-gray-200 dark:bg-gray-700',
        // Shimmer gradient
        'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800',
        'bg-[length:200%_100%] animate-shimmer',
        className
      )}
    />
  )
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="h-3"
          width={i === lines - 1 ? 'w-2/3' : 'w-full'}
          radius="sm"
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={clsx('card', className)}>
      <div className="flex items-center gap-3">
        <Skeleton width="w-10" height="h-10" radius="full" />
        <div className="flex-1">
          <Skeleton width="w-1/3" height="h-4" />
          <div className="mt-2">
            <Skeleton width="w-2/3" height="h-3" radius="sm" />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <SkeletonText lines={3} />
      </div>
    </div>
  )
}
