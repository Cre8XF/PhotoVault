// ============================================================================
// useInfiniteScroll.js - Custom hook for infinite scroll functionality
// ============================================================================
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for infinite scroll
 * @param {Array} items - All items to display
 * @param {number} itemsPerPage - Number of items to load per page
 * @param {Object} options - Additional options
 * @returns {Object} Infinite scroll state and functions
 */
export function useInfiniteScroll(items = [], itemsPerPage = 20, options = {}) {
  const {
    threshold = 0.8,
    rootMargin = '200px',
  } = options;

  const [displayedItems, setDisplayedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Calculate total pages
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Load more items
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    // Simulate network delay for smoother UX
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = 0;
      const endIndex = nextPage * itemsPerPage;
      
      const newItems = items.slice(startIndex, endIndex);
      setDisplayedItems(newItems);
      setCurrentPage(nextPage);
      setHasMore(endIndex < items.length);
      setIsLoading(false);
    }, 100);
  }, [items, currentPage, itemsPerPage, hasMore, isLoading]);

  // Reset when items change
  useEffect(() => {
    const initialItems = items.slice(0, itemsPerPage);
    setDisplayedItems(initialItems);
    setCurrentPage(1);
    setHasMore(items.length > itemsPerPage);
  }, [items, itemsPerPage]);

  // Setup Intersection Observer
  useEffect(() => {
    if (!sentinelRef.current) return;

    const options = {
      root: null,
      rootMargin,
      threshold
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    }, options);

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current && sentinelRef.current) {
        observerRef.current.unobserve(sentinelRef.current);
      }
    };
  }, [hasMore, isLoading, loadMore, threshold, rootMargin]);

  // Reset function
  const reset = useCallback(() => {
    const initialItems = items.slice(0, itemsPerPage);
    setDisplayedItems(initialItems);
    setCurrentPage(1);
    setHasMore(items.length > itemsPerPage);
    setIsLoading(false);
  }, [items, itemsPerPage]);

  return {
    displayedItems,
    hasMore,
    isLoading,
    sentinelRef,
    currentPage,
    totalPages,
    loadMore,
    reset,
    stats: {
      total: items.length,
      displayed: displayedItems.length,
      remaining: items.length - displayedItems.length
    }
  };
}

/**
 * Custom hook for virtualized scrolling (for large lists)
 * @param {Array} items - All items
 * @param {number} itemHeight - Fixed height of each item
 * @param {number} containerHeight - Height of scroll container
 * @returns {Object} Virtualization state
 */
export function useVirtualScroll(items = [], itemHeight = 200, containerHeight = 600) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);
  
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    stats: {
      total: items.length,
      visible: visibleItems.length,
      start: startIndex,
      end: endIndex
    }
  };
}

/**
 * Custom hook for lazy loading with pagination
 * @param {Function} fetchFunction - Async function to fetch data
 * @param {Object} options - Pagination options
 * @returns {Object} Pagination state and functions
 */
export function useLazyPagination(fetchFunction, options = {}) {
  const {
    pageSize = 20,
    initialPage = 1
  } = options;

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const newItems = await fetchFunction(page, pageSize);
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
        setPage(prev => prev + 1);
        setHasMore(newItems.length === pageSize);
      }
    } catch (err) {
      console.error('Load more failed:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, page, pageSize, isLoading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
  }, [initialPage]);

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
    page
  };
}
