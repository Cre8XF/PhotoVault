/**
 * Timeline Feature - Phase 1, 2 & 3: Date Grouping, Timeline UI & On This Day Widget
 *
 * Main exports for the timeline feature module
 */

// Main Component
export { default as TimelineView } from './components/TimelineView'

// Sub-components
export { default as DateSection } from './components/DateSection'
export { default as TimelineNavigation } from './components/TimelineNavigation'
export { default as OnThisDayWidget } from './components/OnThisDayWidget'

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

// Hooks (Phase 4)
// export { useTimeline } from './hooks/useTimeline'
