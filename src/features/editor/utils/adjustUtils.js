/**
 * Adjust Utilities - Phase 8C-1
 *
 * Utilities for converting adjust slider values to CSS/canvas filter strings.
 * Handles: brightness, contrast, saturation, warmth, highlights, shadows,
 * clarity, blur, and vignette adjustments.
 */

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default adjust values (all sliders at neutral)
 */
export const DEFAULT_ADJUST = {
  brightness: 0,    // -100 to 100
  contrast: 0,      // -100 to 100
  saturation: 0,    // -100 to 100
  warmth: 0,        // -100 to 100 (kelvin simulation)
  highlights: 0,    // -100 to 100
  shadows: 0,       // -100 to 100
  clarity: 0,       // -100 to 100
  blur: 0,          // 0 to 20
  vignette: 0,      // 0 to 100
};

// ============================================================================
// CONVERSION HELPERS
// ============================================================================

/**
 * Convert slider value to brightness multiplier
 * -100 → 0.0 (black), 0 → 1.0 (normal), 100 → 2.0 (very bright)
 */
const toBrightness = (value) => {
  return 1.0 + (value / 100);
};

/**
 * Convert slider value to contrast multiplier
 * -100 → 0.0 (gray), 0 → 1.0 (normal), 100 → 2.0 (high contrast)
 */
const toContrast = (value) => {
  return 1.0 + (value / 100);
};

/**
 * Convert slider value to saturation multiplier
 * -100 → 0.0 (grayscale), 0 → 1.0 (normal), 100 → 2.0 (vibrant)
 */
const toSaturation = (value) => {
  return 1.0 + (value / 100);
};

/**
 * Convert warmth to sepia + hue-rotate combo
 * Negative = cooler (blue), Positive = warmer (orange/red)
 */
const toWarmth = (value) => {
  if (value === 0) return { sepia: 0, hue: 0 };

  if (value > 0) {
    // Warm: add sepia and shift hue toward orange
    return {
      sepia: value / 200,  // 0 to 0.5
      hue: value / 2,       // 0 to 50 degrees
    };
  } else {
    // Cool: shift hue toward blue
    return {
      sepia: 0,
      hue: value / 2,       // -50 to 0 degrees
    };
  }
};

/**
 * Convert highlights to brightness adjustment (simplified for Phase 8C-1)
 * In Phase 8C-2, this will use selective tone mapping
 */
const toHighlights = (value) => {
  return 1.0 + (value / 200); // Half the effect of brightness
};

/**
 * Convert shadows to brightness adjustment (simplified for Phase 8C-1)
 */
const toShadows = (value) => {
  return 1.0 + (value / 200); // Half the effect of brightness
};

/**
 * Convert clarity to contrast adjustment (simplified for Phase 8C-1)
 * In Phase 8C-2, this will use unsharp masking
 */
const toClarity = (value) => {
  return 1.0 + (value / 150); // Subtle contrast boost
};

/**
 * Convert blur slider to blur radius
 * 0 → 0px, 20 → 20px
 */
const toBlur = (value) => {
  return Math.max(0, value);
};

// ============================================================================
// CSS/CANVAS FILTER STRING BUILDERS
// ============================================================================

/**
 * Build CSS filter string from adjust state
 * Returns a CSS filter string like: "brightness(1.2) contrast(1.1) saturate(0.9)"
 *
 * @param {Object} adjust - Adjust state object
 * @returns {string} CSS filter string
 */
export const buildCSSAdjustString = (adjust = DEFAULT_ADJUST) => {
  const filters = [];

  // Brightness
  if (adjust.brightness !== 0) {
    const brightness = toBrightness(adjust.brightness);
    filters.push(`brightness(${brightness.toFixed(2)})`);
  }

  // Contrast (base + clarity contribution)
  const contrastValue = adjust.contrast + (adjust.clarity * 0.5);
  if (contrastValue !== 0) {
    const contrast = toContrast(contrastValue);
    filters.push(`contrast(${contrast.toFixed(2)})`);
  }

  // Saturation
  if (adjust.saturation !== 0) {
    const saturation = toSaturation(adjust.saturation);
    filters.push(`saturate(${saturation.toFixed(2)})`);
  }

  // Warmth (sepia + hue-rotate)
  if (adjust.warmth !== 0) {
    const warmth = toWarmth(adjust.warmth);
    if (warmth.sepia > 0) {
      filters.push(`sepia(${warmth.sepia.toFixed(2)})`);
    }
    if (warmth.hue !== 0) {
      filters.push(`hue-rotate(${warmth.hue.toFixed(0)}deg)`);
    }
  }

  // Highlights (simplified as brightness boost)
  if (adjust.highlights !== 0) {
    const highlights = toHighlights(adjust.highlights);
    // Combine with main brightness
    if (filters.some(f => f.startsWith('brightness'))) {
      // Already has brightness, multiply
      const idx = filters.findIndex(f => f.startsWith('brightness'));
      const current = parseFloat(filters[idx].match(/[\d.]+/)[0]);
      filters[idx] = `brightness(${(current * highlights).toFixed(2)})`;
    } else {
      filters.push(`brightness(${highlights.toFixed(2)})`);
    }
  }

  // Shadows (simplified as brightness adjustment)
  if (adjust.shadows !== 0) {
    const shadows = toShadows(adjust.shadows);
    // Similar to highlights
    if (filters.some(f => f.startsWith('brightness'))) {
      const idx = filters.findIndex(f => f.startsWith('brightness'));
      const current = parseFloat(filters[idx].match(/[\d.]+/)[0]);
      filters[idx] = `brightness(${(current * shadows).toFixed(2)})`;
    } else {
      filters.push(`brightness(${shadows.toFixed(2)})`);
    }
  }

  // Blur
  if (adjust.blur > 0) {
    const blur = toBlur(adjust.blur);
    filters.push(`blur(${blur.toFixed(1)}px)`);
  }

  // Vignette: Not supported by CSS filter alone
  // Will need canvas overlay in Phase 8C-2

  return filters.length > 0 ? filters.join(' ') : 'none';
};

/**
 * Build canvas filter string from adjust state
 * For now, same as CSS (canvas supports CSS filter strings via ctx.filter)
 *
 * @param {Object} adjust - Adjust state object
 * @returns {string} Canvas filter string
 */
export const buildCanvasAdjustString = (adjust = DEFAULT_ADJUST) => {
  // Phase 8C-1: Use same CSS filter format for canvas
  // Phase 8C-2: May implement custom pixel manipulation for advanced effects
  return buildCSSAdjustString(adjust);
};

/**
 * Check if any adjust values are non-default
 */
export const hasAdjustChanges = (adjust = DEFAULT_ADJUST) => {
  return Object.keys(adjust).some(key => adjust[key] !== DEFAULT_ADJUST[key]);
};

/**
 * Merge two adjust states
 */
export const mergeAdjust = (base, override) => {
  return { ...base, ...override };
};

/**
 * Reset adjust state to defaults
 */
export const resetAdjust = () => {
  return { ...DEFAULT_ADJUST };
};
