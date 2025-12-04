// src/features/editor-v2/modes/AdjustMode.jsx
import React, { useEffect } from 'react';
import { X, Check } from 'lucide-react';
import useEditorModeStore from '../modeStore';
import EditorViewportV2 from '../EditorViewportV2';
import { renderFullPipelineToDataUrl } from '../utils/imagePipeline';

/**
 * AdjustMode - Image adjustment mode
 * Features:
 * - Brightness slider (-100 to +100)
 * - Contrast slider (-100 to +100)
 * - Saturation slider (-100 to +100)
 * - Warmth slider (-100 to +100)
 * - Real-time preview
 * - Apply adjustments permanently
 */
const AdjustMode = ({ photo }) => {
  const {
    setMode,
    adjust,
    setAdjustValue,
    resetAdjust,
    saveAdjust,
    restoreAdjust,
    crop,
    transform,
    workingImageUrl,
    setWorkingImageUrl,
  } = useEditorModeStore();

  // ✅ Save current adjust values when entering Adjust mode
  useEffect(() => {
    saveAdjust();
  }, [saveAdjust]);

  // Handle cancel
  const handleCancel = () => {
    restoreAdjust();  // ✅ Restore previous values, not reset to 0
    setMode('view');
  };

  // Handle done - Apply adjustments permanently (Phase 5C)
  const handleDone = async () => {
    try {
      const imageUrl = workingImageUrl || photo.url;

      console.log('Applying adjustments:', adjust);

      // Render full pipeline with adjustments
      const dataUrl = await renderFullPipelineToDataUrl({
        imageUrl,
        crop,
        transform,
        adjust,
      });

      // Commit to working image
      setWorkingImageUrl(dataUrl);

      // Reset adjust state
      resetAdjust();

      // Return to view mode
      setMode('view');
    } catch (error) {
      console.error('Failed to apply adjustments:', error);
      alert('Failed to apply adjustments. Please try again.');
    }
  };

  // Slider change handler
  const handleSliderChange = (key, value) => {
    setAdjustValue(key, parseFloat(value));
  };

  return (
    <div className="mode-adjust-fullscreen">
      {/* Header */}
      <div className="mode-adjust-header">
        <button className="mode-adjust-cancel" onClick={handleCancel}>
          <X size={24} />
        </button>
        <h2 className="mode-adjust-title">Adjust</h2>
        <button className="mode-adjust-done" onClick={handleDone}>
          <Check size={24} />
        </button>
      </div>

      {/* Viewport */}
      <div className="mode-adjust-viewport">
        <EditorViewportV2 photo={photo} />
      </div>

      {/* Controls */}
      <div className="mode-adjust-controls">
        {/* Brightness Slider */}
        <div className="adjust-slider-group">
          <div className="adjust-slider-label">
            <span>Brightness</span>
            <span className="adjust-slider-value">{adjust.brightness}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={adjust.brightness}
            onChange={(e) => handleSliderChange('brightness', e.target.value)}
            className="adjust-slider"
          />
        </div>

        {/* Contrast Slider */}
        <div className="adjust-slider-group">
          <div className="adjust-slider-label">
            <span>Contrast</span>
            <span className="adjust-slider-value">{adjust.contrast}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={adjust.contrast}
            onChange={(e) => handleSliderChange('contrast', e.target.value)}
            className="adjust-slider"
          />
        </div>

        {/* Saturation Slider */}
        <div className="adjust-slider-group">
          <div className="adjust-slider-label">
            <span>Saturation</span>
            <span className="adjust-slider-value">{adjust.saturation}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={adjust.saturation}
            onChange={(e) => handleSliderChange('saturation', e.target.value)}
            className="adjust-slider"
          />
        </div>

        {/* Warmth Slider */}
        <div className="adjust-slider-group">
          <div className="adjust-slider-label">
            <span>Warmth</span>
            <span className="adjust-slider-value">{adjust.warmth}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={adjust.warmth}
            onChange={(e) => handleSliderChange('warmth', e.target.value)}
            className="adjust-slider"
          />
        </div>

        {/* Reset Button */}
        <button
          className="adjust-reset-btn"
          onClick={resetAdjust}
          disabled={
            adjust.brightness === 0 &&
            adjust.contrast === 0 &&
            adjust.saturation === 0 &&
            adjust.warmth === 0
          }
        >
          Reset All
        </button>
      </div>
    </div>
  );
};

export default AdjustMode;
