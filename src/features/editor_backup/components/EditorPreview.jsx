// ============================================================================
// COMPONENT: EditorPreview.jsx - Photo preview with transforms
// ============================================================================

import React, { useMemo } from 'react';
import { getPreviewStyle, applyVignette } from '../utils/photoTransforms';

/**
 * EditorPreview Component
 *
 * Renders photo with all applied transforms
 * - CSS filters for color adjustments
 * - CSS transform for rotation and flipping
 * - Vignette overlay
 * - Crop region indicator (if in crop mode)
 */
const EditorPreview = ({ photo, transform, activeMode, className = '' }) => {
  // Get combined style from transforms
  const previewStyle = useMemo(() => getPreviewStyle(transform), [transform]);

  // Get vignette opacity
  const vignetteOpacity = useMemo(
    () => applyVignette(transform.vignette),
    [transform.vignette]
  );

  if (!photo) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-black/50 ${className}`}>
        <p className="text-sm opacity-50">No photo loaded</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-black ${className}`}>
      {/* Main Photo */}
      <div className="w-full h-full flex items-center justify-center">
        <img
          src={photo.url}
          alt={photo.name || 'Photo'}
          className="max-w-full max-h-full object-contain"
          style={previewStyle}
        />
      </div>

      {/* Vignette Overlay */}
      {transform.vignette > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, transparent 30%, black 150%)',
            opacity: vignetteOpacity,
          }}
        />
      )}

      {/* Crop Region Indicator (only in crop mode) */}
      {activeMode === 'crop' && transform.crop && (
        <div
          className="absolute border-2 border-white border-dashed"
          style={{
            left: `${transform.crop.x}px`,
            top: `${transform.crop.y}px`,
            width: `${transform.crop.width}px`,
            height: `${transform.crop.height}px`,
          }}
        >
          <div className="absolute inset-0 bg-white/10" />
        </div>
      )}

      {/* Crop Mode Grid Overlay */}
      {activeMode === 'crop' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border border-white/20" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPreview;
