import { useState, useCallback, useRef } from 'react'

export const usePullToRefresh = (onRefresh, threshold = 80) => {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const isRefreshing = useRef(false)

  const handleTouchStart = useCallback((e) => {
    // Only trigger if scrolled to top
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (isRefreshing.current || startY.current === 0) return

    const currentY = e.touches[0].clientY
    const distance = currentY - startY.current

    if (distance > 0 && window.scrollY === 0) {
      e.preventDefault()
      setPullDistance(Math.min(distance, threshold * 1.5))
      setIsPulling(distance > threshold)
    }
  }, [threshold])

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > threshold && !isRefreshing.current) {
      isRefreshing.current = true
      setIsPulling(false)

      // Haptic feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }

      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        isRefreshing.current = false
        setPullDistance(0)
        startY.current = 0
      }
    } else {
      setPullDistance(0)
      setIsPulling(false)
      startY.current = 0
    }
  }, [pullDistance, threshold, onRefresh])

  return {
    isPulling,
    pullDistance,
    isRefreshing: isRefreshing.current,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}
