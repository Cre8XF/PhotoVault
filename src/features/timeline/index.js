/**
 * Timeline Feature - Phase 1: Date Grouping Logic
 *
 * Main exports for the timeline feature module
 */

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

// Components will be added in Phase 2
// export { default as TimelineView } from './components/TimelineView'
// export { default as DateSection } from './components/DateSection'
// export { default as TimelineNavigation } from './components/TimelineNavigation'
// export { default as OnThisDayWidget } from './components/OnThisDayWidget'

// Hooks will be added in Phase 2
// export { useTimeline } from './hooks/useTimeline'
