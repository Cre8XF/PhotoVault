// ============================================================================
// utils/googleVision.js - Google Cloud Vision API Integration
// ============================================================================

/**
 * Google Vision API for image analysis
 * Free tier: 1000 requests/month
 * Features: Label detection, face detection, safe search, OCR
 */

const GOOGLE_VISION_API_KEY = process.env.REACT_APP_GOOGLE_VISION_KEY || '';
const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

/**
 * Analyser et bilde med Google Vision API
 * @param {string} imageUrl - URL til bildet som skal analyseres
 * @param {Object} options - Analyseringsalternativer
 * @returns {Promise<Object>} - Analyseresultater
 */
export const analyzeImage = async (imageUrl, options = {}) => {
  const { detectLabels = true, detectFaces = true, detectSafeSearch = true, detectText = false, maxLabels = 10 } = options;

  // Build features array
  const features = [];

  if (detectLabels) {
    features.push({ type: 'LABEL_DETECTION', maxResults: maxLabels });
  }

  if (detectFaces) {
    features.push({ type: 'FACE_DETECTION' });
  }

  if (detectSafeSearch) {
    features.push({ type: 'SAFE_SEARCH_DETECTION' });
  }

  if (detectText) {
    features.push({ type: 'TEXT_DETECTION' });
  }

  try {
    const response = await fetch(`${VISION_API_URL}?key=${GOOGLE_VISION_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              source: {
                imageUri: imageUrl
              }
            },
            features: features
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.responses[0].error) {
      throw new Error(data.responses[0].error.message);
    }

    return parseVisionResponse(data.responses[0]);
  } catch (error) {
    console.error('Vision API error:', error);
    throw error;
  }
};

/**
 * Parse Vision API response til brukervernnlig format
 */
const parseVisionResponse = response => {
  const result = {
    labels: [],
    faces: 0,
    hasText: false,
    text: '',
    isSafe: true,
    safeSearch: {},
    raw: response
  };

  // Parse labels
  if (response.labelAnnotations) {
    result.labels = response.labelAnnotations.map(label => ({
      name: label.description.toLowerCase(),
      confidence: Math.round(label.score * 100)
    }));
  }

  // Parse faces
  if (response.faceAnnotations) {
    result.faces = response.faceAnnotations.length;
  }

  // Parse text
  if (response.textAnnotations && response.textAnnotations.length > 0) {
    result.hasText = true;
    result.text = response.textAnnotations[0].description;
  }

  // Parse safe search
  if (response.safeSearchAnnotation) {
    const safe = response.safeSearchAnnotation;
    result.safeSearch = {
      adult: safe.adult,
      violence: safe.violence,
      racy: safe.racy
    };

    // Mark as unsafe if any category is LIKELY or VERY_LIKELY
    result.isSafe = !(
      safe.adult === 'LIKELY' ||
      safe.adult === 'VERY_LIKELY' ||
      safe.violence === 'LIKELY' ||
      safe.violence === 'VERY_LIKELY' ||
      safe.racy === 'LIKELY' ||
      safe.racy === 'VERY_LIKELY'
    );
  }

  return result;
};

/**
 * Batch analyze multiple images
 * @param {Array<string>} imageUrls - Array of image URLs
 * @param {Object} options - Analysis options
 * @returns {Promise<Array>} - Array of analysis results
 */
export const batchAnalyzeImages = async (imageUrls, options = {}) => {
  const results = [];

  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < imageUrls.length; i += batchSize) {
    const batch = imageUrls.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(url =>
        analyzeImage(url, options).catch(err => {
          console.error(`Failed to analyze ${url}:`, err);
          return null;
        })
      )
    );
    results.push(...batchResults.filter(Boolean));

    // Add delay between batches
    if (i + batchSize < imageUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
};

/**
 * Get top N labels from analysis
 */
export const getTopLabels = (analysis, count = 5) => {
  if (!analysis || !analysis.labels) return [];
  return analysis.labels
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, count)
    .map(label => label.name);
};

/**
 * Check if image has specific content
 */
export const hasContent = (analysis, searchTerms) => {
  if (!analysis || !analysis.labels) return false;
  const labelNames = analysis.labels.map(l => l.name.toLowerCase());
  return searchTerms.some(term => labelNames.some(label => label.includes(term.toLowerCase())));
};

/**
 * Categorize image based on labels
 */
export const categorizeImage = analysis => {
  if (!analysis || !analysis.labels) return 'other';

  const labels = analysis.labels.map(l => l.name.toLowerCase());

  // Categories with keywords
  const categories = {
    people: ['person', 'people', 'human', 'face', 'portrait', 'selfie', 'group'],
    nature: ['nature', 'landscape', 'mountain', 'forest', 'tree', 'plant', 'flower', 'sky'],
    food: ['food', 'dish', 'meal', 'cuisine', 'dessert', 'drink', 'ingredient'],
    animals: ['animal', 'dog', 'cat', 'bird', 'pet', 'wildlife'],
    architecture: ['building', 'architecture', 'house', 'city', 'urban', 'street'],
    indoor: ['indoor', 'room', 'interior', 'furniture', 'home'],
    travel: ['travel', 'tourism', 'vacation', 'landmark', 'beach', 'ocean'],
    event: ['event', 'party', 'celebration', 'wedding', 'concert'],
    sport: ['sport', 'game', 'athlete', 'competition'],
    art: ['art', 'painting', 'drawing', 'sculpture', 'creative']
  };

  // Find best matching category
  let bestCategory = 'other';
  let maxMatches = 0;

  Object.entries(categories).forEach(([category, keywords]) => {
    const matches = keywords.filter(keyword => labels.some(label => label.includes(keyword))).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category;
    }
  });

  return bestCategory;
};

/**
 * Check API key status
 */
export const checkAPIKey = () => {
  return {
    isConfigured: !!GOOGLE_VISION_API_KEY,
    key: GOOGLE_VISION_API_KEY ? `${GOOGLE_VISION_API_KEY.slice(0, 8)}...` : 'Not set'
  };
};

export default {
  analyzeImage,
  batchAnalyzeImages,
  getTopLabels,
  hasContent,
  categorizeImage,
  checkAPIKey
};
