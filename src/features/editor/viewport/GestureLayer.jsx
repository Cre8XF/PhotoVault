/**
 * GestureLayer - Phase 8: EditorViewport Rebuild
 *
 * Handles all user input and converts to transform updates
 * - Scroll zoom (desktop)
 * - Pinch zoom (mobile)
 * - Drag pan (desktop and mobile)
 * - Double-tap zoom (mobile)
 * - Provides updates to viewport engine
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { getDistance, getMidpoint } from './mathUtils';

const GestureLayer = ({
  enabled = true,
  mode = 'view', // 'view' | 'crop'
  onZoom,
  onPan,
  onDoubleTap,
  currentZoom = 1,
  minZoom = 0.5,
  maxZoom = 3,
}) => {
  const gestureStateRef = useRef({
    isPanning: false,
    isZooming: false,
    startX: 0,
    startY: 0,
    lastTapTime: 0,
    initialPinchDistance: 0,
    initialZoom: 1,
  });

  // Handle wheel (scroll zoom)
  const handleWheel = useCallback(
    (e) => {
      if (!enabled || mode === 'crop') return;

      e.preventDefault();

      // Get pointer position relative to viewport
      const rect = e.currentTarget.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      // Calculate zoom delta (negative deltaY = zoom in)
      const delta = -e.deltaY * 0.001;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom + delta));

      if (onZoom) {
        onZoom(newZoom, pointerX, pointerY);
      }
    },
    [enabled, mode, currentZoom, minZoom, maxZoom, onZoom]
  );

  // Handle mouse down
  const handleMouseDown = useCallback(
    (e) => {
      if (!enabled || mode === 'crop') return;

      gestureStateRef.current.isPanning = true;
      gestureStateRef.current.startX = e.clientX;
      gestureStateRef.current.startY = e.clientY;
    },
    [enabled, mode]
  );

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e) => {
      if (!gestureStateRef.current.isPanning || !onPan) return;

      const deltaX = e.clientX - gestureStateRef.current.startX;
      const deltaY = e.clientY - gestureStateRef.current.startY;

      gestureStateRef.current.startX = e.clientX;
      gestureStateRef.current.startY = e.clientY;

      onPan(deltaX, deltaY);
    },
    [onPan]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    gestureStateRef.current.isPanning = false;
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback(
    (e) => {
      if (!enabled) return;

      const touches = e.touches;

      if (touches.length === 1) {
        // Single touch - could be pan or double-tap
        const now = Date.now();
        const timeSinceLastTap = now - gestureStateRef.current.lastTapTime;

        if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
          // Double tap detected
          if (onDoubleTap) {
            const rect = e.currentTarget.getBoundingClientRect();
            const tapX = touches[0].clientX - rect.left;
            const tapY = touches[0].clientY - rect.top;
            onDoubleTap(tapX, tapY);
          }
          gestureStateRef.current.lastTapTime = 0;
        } else {
          gestureStateRef.current.lastTapTime = now;
          gestureStateRef.current.isPanning = mode !== 'crop';
          gestureStateRef.current.startX = touches[0].clientX;
          gestureStateRef.current.startY = touches[0].clientY;
        }
      } else if (touches.length === 2) {
        // Pinch zoom
        e.preventDefault();
        gestureStateRef.current.isZooming = true;
        gestureStateRef.current.isPanning = false;

        const distance = getDistance(
          touches[0].clientX,
          touches[0].clientY,
          touches[1].clientX,
          touches[1].clientY
        );

        gestureStateRef.current.initialPinchDistance = distance;
        gestureStateRef.current.initialZoom = currentZoom;
      }
    },
    [enabled, mode, currentZoom, onDoubleTap]
  );

  // Handle touch move
  const handleTouchMove = useCallback(
    (e) => {
      const touches = e.touches;

      if (touches.length === 1 && gestureStateRef.current.isPanning) {
        // Pan
        if (!onPan) return;

        const deltaX = touches[0].clientX - gestureStateRef.current.startX;
        const deltaY = touches[0].clientY - gestureStateRef.current.startY;

        gestureStateRef.current.startX = touches[0].clientX;
        gestureStateRef.current.startY = touches[0].clientY;

        onPan(deltaX, deltaY);
      } else if (touches.length === 2 && gestureStateRef.current.isZooming) {
        // Pinch zoom
        e.preventDefault();

        const distance = getDistance(
          touches[0].clientX,
          touches[0].clientY,
          touches[1].clientX,
          touches[1].clientY
        );

        const scale = distance / gestureStateRef.current.initialPinchDistance;
        const newZoom = Math.max(
          minZoom,
          Math.min(maxZoom, gestureStateRef.current.initialZoom * scale)
        );

        // Get pinch center
        const rect = e.currentTarget.getBoundingClientRect();
        const midpoint = getMidpoint(
          touches[0].clientX,
          touches[0].clientY,
          touches[1].clientX,
          touches[1].clientY
        );
        const centerX = midpoint.x - rect.left;
        const centerY = midpoint.y - rect.top;

        if (onZoom) {
          onZoom(newZoom, centerX, centerY);
        }
      }
    },
    [onPan, onZoom, minZoom, maxZoom]
  );

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    gestureStateRef.current.isPanning = false;
    gestureStateRef.current.isZooming = false;
  }, []);

  // Add global mouse listeners
  useEffect(() => {
    if (gestureStateRef.current.isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [handleMouseMove, handleMouseUp]);

  if (!enabled) return null;

  const cursorClass = gestureStateRef.current.isPanning ? 'panning' : currentZoom > 1 ? 'grab' : '';

  return (
    <div
      className={`viewport-gesture-layer ${cursorClass}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
};

export default GestureLayer;
