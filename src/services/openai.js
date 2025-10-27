/**
 * OpenAI API Service
 * Provides GPT-4 Vision for image descriptions, categorization, and smart search
 */

const OPENAI_API = 'https://api.openai.com/v1/chat/completions';

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
  const apiKey = getAPIKey();

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const defaultPrompt = 'Describe this image in 2-3 sentences. Focus on key subjects, setting, and mood.';

  try {
    const response = await fetch(OPENAI_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt || defaultPrompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI generateImageDescription error:', error);
    throw error;
  }
}

/**
 * Categorize image into predefined categories
 * @param {string} imageUrl - URL of the image
 * @param {Array<string>} existingCategories - List of existing categories
 * @returns {Promise<string>} Category name
 */
export async function categorizeImage(imageUrl, existingCategories = ['nature', 'people', 'food', 'travel', 'pets', 'events', 'other']) {
  const apiKey = getAPIKey();

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch(OPENAI_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Categorize this image into ONE of these categories: ${existingCategories.join(', ')}. Return only the category name, nothing else.`
              },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 20
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const category = data.choices[0].message.content.trim().toLowerCase();

    // Validate category is in the list
    return existingCategories.includes(category) ? category : 'other';
  } catch (error) {
    console.error('OpenAI categorizeImage error:', error);
    return 'other';
  }
}

/**
 * Search photos using natural language
 * @param {string} query - Search query
 * @param {Array<Object>} photoDescriptions - Array of photo objects with descriptions
 * @returns {Promise<Array<number>>} Array of matching photo indices
 */
export async function searchPhotos(query, photoDescriptions) {
  const apiKey = getAPIKey();

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  if (photoDescriptions.length === 0) {
    return [];
  }

  try {
    const photoList = photoDescriptions
      .map((p, i) => `${i}: ${p.aiDescription || 'No description'} [tags: ${p.aiTags?.join(', ') || 'none'}]`)
      .join('\n');

    const response = await fetch(OPENAI_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: `Given this search query: "${query}"

Find matching photos from this list:
${photoList}

Return only the photo indices that match, as comma-separated numbers. If no matches, return "none".`
          }
        ],
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content.trim();

    if (result.toLowerCase() === 'none') {
      return [];
    }

    // Parse comma-separated indices
    const indices = result
      .split(',')
      .map(i => parseInt(i.trim()))
      .filter(i => !isNaN(i) && i >= 0 && i < photoDescriptions.length);

    return indices;
  } catch (error) {
    console.error('OpenAI searchPhotos error:', error);
    return [];
  }
}

/**
 * Generate smart album suggestions based on photo collection
 * @param {Array<Object>} photos - Array of photo objects
 * @returns {Promise<Array<Object>>} Suggested albums with photo groupings
 */
export async function suggestAlbums(photos) {
  const apiKey = getAPIKey();

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  if (photos.length === 0) {
    return [];
  }

  try {
    const photoSummary = photos.slice(0, 50).map(p => ({
      id: p.id,
      date: p.createdAt,
      tags: p.aiTags || [],
      description: p.aiDescription || p.name
    }));

    const response = await fetch(OPENAI_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that organizes photos into smart albums based on their content, dates, and themes.'
          },
          {
            role: 'user',
            content: `Analyze these photos and suggest smart album groupings:

${JSON.stringify(photoSummary, null, 2)}

Return valid JSON with this structure:
{
  "albums": [
    {
      "name": "Album Name",
      "photoIds": ["id1", "id2"],
      "reason": "Why these photos belong together"
    }
  ]
}

Create 3-5 meaningful albums. Group by theme, location, time period, or subject matter.`
          }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;

    const result = JSON.parse(jsonString);
    return result.albums || [];
  } catch (error) {
    console.error('OpenAI suggestAlbums error:', error);
    return [];
  }
}

/**
 * Extract keywords from image
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<Array<string>>} Array of keywords
 */
export async function extractKeywords(imageUrl) {
  const apiKey = getAPIKey();

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch(OPENAI_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'List 5-10 relevant keywords for this image. Return as comma-separated values only.'
              },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 50
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const keywords = data.choices[0].message.content
      .trim()
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0);

    return keywords;
  } catch (error) {
    console.error('OpenAI extractKeywords error:', error);
    return [];
  }
}

export default {
  generateImageDescription,
  categorizeImage,
  searchPhotos,
  suggestAlbums,
  extractKeywords
};
