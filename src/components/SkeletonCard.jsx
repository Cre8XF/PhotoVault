// ============================================================================
// COMPONENT: SkeletonCard.jsx – Premium Skeleton Loading State
// ============================================================================
import React from 'react'

/**
 * Premium skeleton card for album loading states
 */
export const SkeletonCard = ({ height = '280px' }) => (
  <div className="skeleton-premium" style={{ height }}>
    <div className="h-48 bg-gradient-to-br from-purple-500/10 to-transparent rounded-t-xl" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-white/10 rounded w-1/2" />
    </div>
  </div>
)

/**
 * Skeleton for photo grid items
 */
export const SkeletonPhoto = ({ compact = false }) => (
  <div
    className="skeleton-premium"
    style={{ height: compact ? '160px' : '224px' }}
  >
    <div className="w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl" />
  </div>
)

/**
 * Skeleton for list items
 */
export const SkeletonListItem = () => (
  <div className="skeleton-premium flex items-center gap-4 p-4" style={{ height: '80px' }}>
    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/10 to-transparent rounded-lg" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-white/10 rounded w-2/3" />
      <div className="h-3 bg-white/10 rounded w-1/3" />
    </div>
  </div>
)

export default SkeletonCard
