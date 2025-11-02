/**
 * Google Vision API Service
 * Provides image analysis, label detection, face detection, and landmark recognition
 *
 * PHASE 2: AI Service - Temporarily disabled for MVP
 * This service will be re-enabled when:
 * - User base reaches 500+ users, OR
 * - Pro subscriptions cover AI costs, OR
 * - 3+ months of stable operation
 */

// DISABLED FOR MVP - Uncomment for Phase 2
// const GOOGLE_VISION_API = 'https://vision.googleapis.com/v1/projects/photovault-app-a0946/locations/global/images:annotate';


/**
 * Get Google Vision API key from environment
 */
function getAPIKey() {
  return process.env.REACT_APP_GOOGLE_VISION_KEY;
}

/**
 * Analyze image using Google Vision API
 * @param {string} imageUrl - URL of the image to analyze
 * @param {Array<string>} features - Features to detect
 * @returns {Promise<Object>} Analysis results
 */

// DISABLED FOR MVP - Uncomment for Phase 2
/*
export async function analyzeImage(
  imageUrl,
  features = ['LABEL_DETECTION', 'FACE_DETECTION', 'SAFE_SEARCH_DETECTION', 'LANDMARK_DETECTION', 'IMAGE_PROPERTIES']
) {
  const apiKey = getAPIKey();

  if (!apiKey) {
    throw new Error('Google Vision API key not configured');
  }

  try {
    const response = await fetch(`${GOOGLE_VISION_API}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { source: { imageUri: imageUrl } },
            features: features.map(f => ({ type: f, maxResults: 10 }))
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google Vision API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();

    if (data.responses && data.responses[0].error) {
      throw new Error(`Google Vision API error: ${data.responses[0].error.message}`);
    }

    return data.responses[0];
  } catch (error) {
    console.error('Google Vision API error:', error);
    throw error;
  }
}
*/

// MVP: Return placeholder data
export async function analyzeImage(imageUrl, features) {
  console.log('AI feature disabled - Phase 2 activation required:', 'analyzeImage');
  return {
    labelAnnotations: [],
    faceAnnotations: [],
    landmarkAnnotations: [],
    safeSearchAnnotation: {
      adult: 'UNKNOWN',
      spoof: 'UNKNOWN',
      medical: 'UNKNOWN',
      violence: 'UNKNOWN',
      racy: 'UNKNOWN'
    },
    imagePropertiesAnnotation: null
  };
}

/**
 * Parse Vision API response into structured data
 * @param {Object} response - Raw API response
 * @returns {Object} Parsed data
 */
export function parseVisionResponse(response) {
  return {
    labels: response.labelAnnotations?.map(l => l.description) || [],
    faces: response.faceAnnotations?.length || 0,
    faceCoordinates:
      response.faceAnnotations?.map(f => ({
        boundingPoly: f.boundingPoly,
        confidence: f.detectionConfidence,
        landmarks: f.landmarks
      })) || [],
    landmark: response.landmarkAnnotations?.[0]?.description || null,
    safeSearch: response.safeSearchAnnotation || {
      adult: 'UNKNOWN',
      spoof: 'UNKNOWN',
      medical: 'UNKNOWN',
      violence: 'UNKNOWN',
      racy: 'UNKNOWN'
    },
    dominantColors: response.imagePropertiesAnnotation?.dominantColors?.colors?.map(c => ({
      color: c.color,
      score: c.score,
      pixelFraction: c.pixelFraction
    })) || []
  };
}

/**
 * Detect labels only (faster, cheaper)
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<Array<string>>} Array of label strings
 */
export async function detectLabels(imageUrl) {
  console.log('AI feature disabled - Phase 2 activation required:', 'detectLabels');
  return [];
}

/**
 * Detect faces only
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<number>} Number of faces detected
 */
export async function detectFaces(imageUrl) {
  console.log('AI feature disabled - Phase 2 activation required:', 'detectFaces');
  return 0;
}

/**
 * Detect landmark
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<string|null>} Landmark name or null
 */
export async function detectLandmark(imageUrl) {
  console.log('AI feature disabled - Phase 2 activation required:', 'detectLandmark');
  return null;
}

/**
 * Batch analyze multiple images
 * @param {Array<string>} imageUrls - Array of image URLs
 * @param {Array<string>} features - Features to detect
 * @returns {Promise<Array<Object>>} Array of analysis results
 */
export async function batchAnalyzeImages(imageUrls, features) {
  console.log('AI feature disabled - Phase 2 activation required:', 'batchAnalyzeImages');
  return imageUrls.map(() => parseVisionResponse({}));
}

/**
 * Check if safe search flags are safe
 * @param {Object} safeSearch - Safe search object from API
 * @returns {boolean} True if image is safe
 */
export function isSafeImage(safeSearch) {
  const unsafe = ['LIKELY', 'VERY_LIKELY'];
  return (
    !unsafe.includes(safeSearch.adult) &&
    !unsafe.includes(safeSearch.violence) &&
    !unsafe.includes(safeSearch.racy)
  );
}

export default {
  analyzeImage,
  parseVisionResponse,
  detectLabels,
  detectFaces,
  detectLandmark,
  batchAnalyzeImages,
  isSafeImage
};
