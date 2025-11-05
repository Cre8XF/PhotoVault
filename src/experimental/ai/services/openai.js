/**
 * OpenAI API Service
 * Provides GPT-4 Vision for image descriptions, categorization, and smart search
 *
 * PHASE 2: AI Service - Temporarily disabled for MVP
 * This service will be re-enabled when:
 * - User base reaches 500+ users, OR
 * - Pro subscriptions cover AI costs, OR
 * - 3+ months of stable operation
 */

// DISABLED FOR MVP - Uncomment for Phase 2
// const OPENAI_API = 'https://api.openai.com/v1/chat/completions';

/**
 * Get OpenAI API key from environment
 */
function getAPIKey() {
  return process.env.REACT_APP_OPENAI_KEY;
}

/**
 * Generate descriptive text for an image using GPT-4 Vision
 * @param {string} imageUrl - URL of the image
 * @param {string} prompt - Custom prompt (optional)
 * @returns {Promise<string>} Image description
 */
export async function generateImageDescription(imageUrl, prompt = null) {
  console.log('AI feature disabled - Phase 2 activation required:', 'generateImageDescription');
  return '';
}

/**
 * Categorize image into predefined categories
 * @param {string} imageUrl - URL of the image
 * @param {Array<string>} existingCategories - List of existing categories
 * @returns {Promise<string>} Category name
 */
export async function categorizeImage(imageUrl, existingCategories = ['nature', 'people', 'food', 'travel', 'pets', 'events', 'other']) {
  console.log('AI feature disabled - Phase 2 activation required:', 'categorizeImage');
  return 'other';
}

/**
 * Search photos using natural language
 * @param {string} query - Search query
 * @param {Array<Object>} photoDescriptions - Array of photo objects with descriptions
 * @returns {Promise<Array<number>>} Array of matching photo indices
 */
export async function searchPhotos(query, photoDescriptions) {
  console.log('AI feature disabled - Phase 2 activation required:', 'searchPhotos');
  return [];
}

/**
 * Generate smart album suggestions based on photo collection
 * @param {Array<Object>} photos - Array of photo objects
 * @returns {Promise<Array<Object>>} Suggested albums with photo groupings
 */
export async function suggestAlbums(photos) {
  console.log('AI feature disabled - Phase 2 activation required:', 'suggestAlbums');
  return [];
}

/**
 * Extract keywords from image
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<Array<string>>} Array of keywords
 */
export async function extractKeywords(imageUrl) {
  console.log('AI feature disabled - Phase 2 activation required:', 'extractKeywords');
  return [];
}

export default {
  generateImageDescription,
  categorizeImage,
  searchPhotos,
  suggestAlbums,
  extractKeywords
};
