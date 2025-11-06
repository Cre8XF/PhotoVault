// ============================================================================
// utils/picsartAI.js - Picsart API Integration (Oppdatert)
// ============================================================================

/**
 * Picsart API for image enhancement and manipulation
 * Free tier: 100 requests/month
 * Features: Background removal, upscale, effects, filters
 */

const PICSART_API_KEY = process.env.REACT_APP_PICSART_KEY || '';
const PICSART_BASE_URL = 'https://api.picsart.io/tools/1.0';

/**
 * Fjern bakgrunn fra bilde
 * @param {string} imageUrl - URL til bildet
 * @param {Object} options - Alternativer
 * @returns {Promise<Object>} - Resultat med ny bilde-URL
 */
export const removeBackground = async (imageUrl, options = {}) => {
  const {
    format = 'PNG',
    outputType = 'cutout', // 'cutout' or 'mask'
    bgColor = null, // hex color for background (optional)
    bgBlur = 0, // blur background instead of removing (0-100)
  } = options;

  try {
    const formData = new FormData();
    formData.append('image_url', imageUrl);
    formData.append('format', format);
    formData.append('output_type', outputType);
    
    if (bgColor) formData.append('bg_color', bgColor);
    if (bgBlur > 0) formData.append('bg_blur', bgBlur);

    const response = await fetch(`${PICSART_BASE_URL}/removebg`, {
      method: 'POST',
      headers: {
        'X-Picsart-API-Key': PICSART_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Background removal failed');
    }

    const data = await response.json();
    return {
      success: true,
      url: data.data.url,
      originalUrl: imageUrl,
    };
  } catch (error) {
    console.error('Picsart removeBackground error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Forbedre bildekvalitet med AI
 * @param {string} imageUrl - URL til bildet
 * @param {Object} options - Alternativer
 * @returns {Promise<Object>} - Resultat med forbedret bilde
 */
export const enhanceImage = async (imageUrl, options = {}) => {
  const {
    upscale = 2, // 2x or 4x upscaling
    denoise = 50, // 0-100
    sharpen = 30, // 0-100
    format = 'JPG',
  } = options;

  try {
    const formData = new FormData();
    formData.append('image_url', imageUrl);
    formData.append('upscale_factor', upscale);
    formData.append('format', format);

    const response = await fetch(`${PICSART_BASE_URL}/upscale`, {
      method: 'POST',
      headers: {
        'X-Picsart-API-Key': PICSART_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Image enhancement failed');
    }

    const data = await response.json();
    return {
      success: true,
      url: data.data.url,
      originalUrl: imageUrl,
      improvements: {
        upscale,
        denoise,
        sharpen,
      },
    };
  } catch (error) {
    console.error('Picsart enhanceImage error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Anvend effekt på bilde
 * @param {string} imageUrl - URL til bildet
 * @param {string} effectName - Navn på effekt
 * @returns {Promise<Object>} - Resultat med effekt anvendt
 */
export const applyEffect = async (imageUrl, effectName = 'apr1') => {
  try {
    const formData = new FormData();
    formData.append('image_url', imageUrl);
    formData.append('effect_name', effectName);

    const response = await fetch(`${PICSART_BASE_URL}/effects`, {
      method: 'POST',
      headers: {
        'X-Picsart-API-Key': PICSART_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Effect application failed');
    }

    const data = await response.json();
    return {
      success: true,
      url: data.data.url,
      originalUrl: imageUrl,
      effect: effectName,
    };
  } catch (error) {
    console.error('Picsart applyEffect error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Tilgjengelige effekter
 */
export const AVAILABLE_EFFECTS = {
  // Portrait effects
  apr1: { name: 'Portrait Enhancer', category: 'portrait' },
  icy: { name: 'Icy', category: 'artistic' },
  
  // Artistic effects
  brnz2: { name: 'Bronze', category: 'artistic' },
  cyber2: { name: 'Cyber', category: 'artistic' },
  april: { name: 'April', category: 'artistic' },
  
  // Vintage effects
  urban: { name: 'Urban', category: 'vintage' },
  noise: { name: 'Film Grain', category: 'vintage' },
  
  // Color effects
  vivid: { name: 'Vivid', category: 'color' },
  warm: { name: 'Warm', category: 'color' },
  cool: { name: 'Cool', category: 'color' },
};

/**
 * Batch prosessering av flere bilder
 * @param {Array<string>} imageUrls - Array av bilde-URLer
 * @param {Function} operation - Funksjon å utføre (removeBackground, enhanceImage, etc)
 * @param {Object} options - Alternativer
 * @returns {Promise<Array>} - Array av resultater
 */
export const batchProcess = async (imageUrls, operation, options = {}) => {
  const results = [];
  
  // Process one at a time to respect rate limits
  for (const url of imageUrls) {
    try {
      const result = await operation(url, options);
      results.push(result);
      
      // Add delay between requests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Batch processing failed for ${url}:`, error);
      results.push({
        success: false,
        originalUrl: url,
        error: error.message,
      });
    }
  }
  
  return results;
};

/**
 * Sjekk API-nøkkel status
 */
export const checkAPIKey = () => {
  return {
    isConfigured: !!PICSART_API_KEY,
    key: PICSART_API_KEY ? `${PICSART_API_KEY.slice(0, 8)}...` : 'Not set',
  };
};

/**
 * Estimer kostnader for operasjon
 * Free tier: 100 requests/month
 * Paid: $9.99/month for 1000 requests
 */
export const estimateCost = (requestCount) => {
  const freeRequests = 100;
  
  if (requestCount <= freeRequests) {
    return {
      cost: 0,
      tier: 'free',
      remaining: freeRequests - requestCount,
    };
  }
  
  const paidRequests = requestCount - freeRequests;
  const cost = Math.ceil(paidRequests / 1000) * 9.99;
  
  return {
    cost: cost.toFixed(2),
    tier: 'paid',
    paidRequests,
  };
};

export default {
  removeBackground,
  enhanceImage,
  applyEffect,
  batchProcess,
  checkAPIKey,
  estimateCost,
  AVAILABLE_EFFECTS,
};
