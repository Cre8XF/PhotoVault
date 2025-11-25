// ============================================================================
// COMPONENT: CropPanelMobile.jsx - Google Photos Style Collapsible Crop Panel
// EditorWorld v2 - Phase 1
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useEditorStore from '../editorStore';
import { applyCropAspectRatio, clampCropRect } from '../utils/cropTransformBridge';
import './crop-panel-mobile.css';

/**
 * CropPanelMobile - Collapsible bottom sheet for crop controls (mobile only)
 *
 * Features:
 * - Collapsed (56px) / Expanded (150px) states
 * - Swipe up/down gestures to toggle
 * - Ratio chips for aspect ratio selection
 * - Apply button with instructions
 * - Google Photos-inspired UX
 *
 * @param {React.RefObject} viewportRef - Reference to EditorViewport
 * @param {Function} onCropApplied - Callback when crop is applied
 */
const CropPanelMobile = ({ viewportRef, onCropApplied }) => {
  const { t } = useTranslation();
  const { transform, applyTransform } = useEditorStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef(null);
  const touchStartY = useRef(0);

  // Available aspect ratios
  const ratios = [
    { label: t('editor.crop.free', 'Free'), value: null },
    { label: t('editor.crop.square', '1:1'), value: 1 },
    { label: t('editor.crop.portrait', '4:5'), value: 4/5 },
    { label: t('editor.crop.landscape', '16:9'), value: 16/9 },
  ];

  // Get current ratio
  const currentRatio = transform.crop?.aspectRatio;

  // Toggle expand/collapse
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle ratio selection
  const handleRatioSelect = (ratio) => {
    const crop = transform.crop;
    if (crop) {
      if (ratio === null) {
        // Free aspect ratio
        applyTransform('crop', { ...crop, aspectRatio: null });
      } else {
        // Apply aspect ratio constraint
        const newCrop = applyCropAspectRatio(crop, ratio, 'center');
        const clampedCrop = clampCropRect(newCrop);
        applyTransform('crop', { ...clampedCrop, aspectRatio: ratio });
      }
    }
  };

  // Handle apply crop
  const handleApplyCrop = () => {
    const cropRect = transform.crop;
    if (cropRect && viewportRef?.current) {
      viewportRef.current.applyCrop(cropRect);
      console.log('🔷 Crop applied to canvas (mobile panel)');

      // Notify parent
      if (typeof onCropApplied === 'function') {
        onCropApplied();
      }
    }
  };

  // Touch gesture handlers
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const touchCurrentY = e.touches[0].clientY;
    const deltaY = touchCurrentY - touchStartY.current;

    // Swipe up (deltaY < -20) → expand
    if (deltaY < -20 && !isExpanded) {
      setIsExpanded(true);
    }
    // Swipe down (deltaY > 20) → collapse
    else if (deltaY > 20 && isExpanded) {
      setIsExpanded(false);
    }
  };

  // Add touch listeners
  useEffect(() => {
    const panel = panelRef.current;
    if (panel) {
      panel.addEventListener('touchstart', handleTouchStart);
      panel.addEventListener('touchmove', handleTouchMove);

      return () => {
        panel.removeEventListener('touchstart', handleTouchStart);
        panel.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [isExpanded]);

  return (
    <div
      className={`crop-panel-mobile ${isExpanded ? 'expanded' : 'collapsed'}`}
      ref={panelRef}
    >
      {/* Header with ratio chips + expand toggle */}
      <div className="crop-panel-header">
        <div className="ratio-chips">
          {ratios.map((ratio) => (
            <button
              key={ratio.label}
              onClick={() => handleRatioSelect(ratio.value)}
              className={`crop-chip ${currentRatio === ratio.value ? 'active' : ''}`}
            >
              {ratio.label}
            </button>
          ))}
        </div>

        <button
          className="expand-toggle-btn"
          onClick={toggleExpand}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '▾' : '▴'}
        </button>
      </div>

      {/* Expanded content */}
      <div className="crop-panel-body">
        <button
          onClick={handleApplyCrop}
          disabled={!transform.crop}
          className="apply-btn"
        >
          {t('editor.crop.apply', 'Apply Crop')}
        </button>

        <p className="instructions">
          {t('editor.crop.instructions', 'Drag handles to crop. Pinch to zoom.')}
        </p>
      </div>
    </div>
  );
};

export default CropPanelMobile;
