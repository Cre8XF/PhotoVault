/**
 * Picsart API Service
 * Provides background removal, image enhancement, and upscaling
 */

const PICSART_API = 'https://api.picsart.io/tools/1.0';

/**
 * Get Picsart API key from environment
 */
function getAPIKey() {
  return process.env.REACT_APP_PICSART_KEY;
}

/**
 * Remove background from image
 * @param {string} imageUrl - URL of the image
 * @param {string} format - Output format (PNG or JPG)
 * @returns {Promise<Blob>} Image blob with background removed
 */
export async function removeBackground(imageUrl, format = 'PNG') {
  const apiKey = getAPIKey();

  if (!apiKey) {
    throw new Error('Picsart API key not configured');
  }

  try {
    const formData = new FormData();
    formData.append('image_url', imageUrl);
    formData.append('format', format);
    formData.append('bg_blur', '0');
    formData.append('scale', 'fit');

    const response = await fetch(`${PICSART_API}/removebg`, {
      method: 'POST',
      headers: {
        'X-Picsart-API-Key': apiKey
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Picsart API error: ${error.message || response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Picsart removeBackground error:', error);
    throw error;
  }
}

/**
 * Enhance image with various effects
 * @param {string} imageUrl - URL of the image
 * @param {string} enhanceType - Type of enhancement
 * @returns {Promise<Blob>} Enhanced image blob
 */
export async function enhanceImage(imageUrl, enhanceType = 'auto') {
  const apiKey = getAPIKey();

  if (!apiKey) {
    throw new Error('Picsart API key not configured');
  }

  try {
    const formData = new FormData();
    formData.append('image_url', imageUrl);

    let endpoint;
    switch (enhanceType) {
      case 'auto':
        endpoint = 'enhance';
        break;
      case 'vivid':
        formData.append('effect_name', 'vivid');
        endpoint = 'effects';
        break;
      case 'dramatic':
        formData.append('effect_name', 'dramatic');
        endpoint = 'effects';
        break;
      case 'portrait':
        formData.append('effect_name', 'portrait');
        endpoint = 'effects';
        break;
      default:
        endpoint = 'enhance';
    }

    const response = await fetch(`${PICSART_API}/${endpoint}`, {
      method: 'POST',
      headers: {
        'X-Picsart-API-Key': apiKey
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Picsart API error: ${error.message || response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Picsart enhanceImage error:', error);
    throw error;
  }
}

/**
 * Upscale image
 * @param {string} imageUrl - URL of the image
 * @param {number} scaleFactor - Scale factor (2 or 4)
 * @returns {Promise<Blob>} Upscaled image blob
 */
export async function upscaleImage(imageUrl, scaleFactor = 2) {
  const apiKey = getAPIKey();

  if (!apiKey) {
    throw new Error('Picsart API key not configured');
  }

  if (![2, 4].includes(scaleFactor)) {
    throw new Error('Scale factor must be 2 or 4');
  }

  try {
    const formData = new FormData();
    formData.append('image_url', imageUrl);
    formData.append('upscale_factor', scaleFactor.toString());
    formData.append('format', 'JPG');

    const response = await fetch(`${PICSART_API}/upscale`, {
      method: 'POST',
      headers: {
        'X-Picsart-API-Key': apiKey
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Picsart API error: ${error.message || response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Picsart upscaleImage error:', error);
    throw error;
  }
}

/**
 * Apply artistic effect to image
 * @param {string} imageUrl - URL of the image
 * @param {string} effectName - Name of the effect
 * @returns {Promise<Blob>} Processed image blob
 */
export async function applyEffect(imageUrl, effectName) {
  const apiKey = getAPIKey();

  if (!apiKey) {
    throw new Error('Picsart API key not configured');
  }

  try {
    const formData = new FormData();
    formData.append('image_url', imageUrl);
    formData.append('effect_name', effectName);

    const response = await fetch(`${PICSART_API}/effects`, {
      method: 'POST',
      headers: {
        'X-Picsart-API-Key': apiKey
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Picsart API error: ${error.message || response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Picsart applyEffect error:', error);
    throw error;
  }
}

/**
 * Replace background with solid color
 * @param {string} imageUrl - URL of the image
 * @param {string} backgroundColor - Hex color code
 * @returns {Promise<Blob>} Image with new background
 */
export async function replaceBackground(imageUrl, backgroundColor = '#FFFFFF') {
  const apiKey = getAPIKey();

  if (!apiKey) {
    throw new Error('Picsart API key not configured');
  }

  try {
    const formData = new FormData();
    formData.append('image_url', imageUrl);
    formData.append('bg_color', backgroundColor);
    formData.append('format', 'PNG');

    const response = await fetch(`${PICSART_API}/removebg`, {
      method: 'POST',
      headers: {
        'X-Picsart-API-Key': apiKey
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Picsart API error: ${error.message || response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Picsart replaceBackground error:', error);
    throw error;
  }
}

export default {
  removeBackground,
  enhanceImage,
  upscaleImage,
  applyEffect,
  replaceBackground
};
