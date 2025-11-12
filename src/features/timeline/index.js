/**
 * Timeline Feature - Phase 1 & 2: Date Grouping Logic & Timeline UI
 *
 * Main exports for the timeline feature module
 */

// Main Component
export { default as TimelineView } from './components/TimelineView'

// Sub-components
export { default as DateSection } from './components/DateSection'
export { default as TimelineNavigation } from './components/TimelineNavigation'

// Date Grouping Utilities
export {
  groupPhotosByDate,
  groupPhotosByMonth,
  groupPhotosByYear,
  getPhotoDate,
  getDateStatistics,
  getPhotosOnThisDay,
  getAvailableYears,
  getAvailableMonthsForYear
} from './utils/dateGrouping'

// Phase 3 components (On This Day Widget)
// export { default as OnThisDayWidget } from './components/OnThisDayWidget'

// Hooks
// export { useTimeline } from './hooks/useTimeline'
