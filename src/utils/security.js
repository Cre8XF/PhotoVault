// ============================================================================
// security.js - Kryptering og sikkerhetsfunksjoner
// FASE 3 - Sikkerhet & Privacy
// ============================================================================

/**
 * Hash en PIN-kode med Web Crypto API
 * @param {string} pin - PIN-kode (4-6 siffer)
 * @returns {Promise<string>} - Base64-encoded hash
 */
export async function hashPIN(pin) {
  if (!pin || pin.length < 4 || pin.length > 6) {
    throw new Error('PIN må være mellom 4 og 6 siffer');
  }

  if (!/^\d+$/.test(pin)) {
    throw new Error('PIN kan kun inneholde tall');
  }

  try {
    // Convert PIN to ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);

    // Hash with SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert to base64
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('Error hashing PIN:', error);
    throw new Error('Kunne ikke hashe PIN');
  }
}

/**
 * Verifiser en PIN mot en lagret hash
 * @param {string} inputPin - Inntastet PIN
 * @param {string} storedHash - Lagret hash
 * @returns {Promise<boolean>} - True hvis PIN stemmer
 */
export async function verifyPIN(inputPin, storedHash) {
  try {
    const inputHash = await hashPIN(inputPin);
    return inputHash === storedHash;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
}

/**
 * Valider PIN-format
 * @param {string} pin - PIN til validering
 * @returns {Object} - { valid: boolean, error: string }
 */
export function validatePIN(pin) {
  if (!pin) {
    return { valid: false, error: 'PIN er påkrevd' };
  }

  if (pin.length < 4) {
    return { valid: false, error: 'PIN må være minst 4 siffer' };
  }

  if (pin.length > 6) {
    return { valid: false, error: 'PIN kan maks være 6 siffer' };
  }

  if (!/^\d+$/.test(pin)) {
    return { valid: false, error: 'PIN kan kun inneholde tall' };
  }

  // Check for weak PINs
  const weakPins = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321', '0123'];
  if (weakPins.includes(pin)) {
    return { valid: false, error: 'PIN er for svak. Velg en annen kombinasjon' };
  }

  return { valid: true };
}

/**
 * Generate en krypteringsnøkkel fra passord
 * @param {string} password - Passord/PIN
 * @param {Uint8Array} salt - Salt (16 bytes)
 * @returns {Promise<CryptoKey>} - AES-GCM nøkkel
 */
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Krypter data med AES-GCM
 * @param {string} data - Data som skal krypteres
 * @param {string} password - Passord/PIN
 * @returns {Promise<string>} - Base64-encoded kryptert data
 */
export async function encryptData(data, password) {
  try {
    // Generate salt og IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Derive key fra password
    const key = await deriveKey(password, salt);

    // Encode data
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    // Encrypt
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encodedData
    );

    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Kunne ikke kryptere data');
  }
}

/**
 * Dekrypter data med AES-GCM
 * @param {string} encryptedData - Base64-encoded kryptert data
 * @param {string} password - Passord/PIN
 * @returns {Promise<string>} - Dekryptert data
 */
export async function decryptData(encryptedData, password) {
  try {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);

    // Derive key fra password
    const key = await deriveKey(password, salt);

    // Decrypt
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      data
    );

    // Decode data
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Kunne ikke dekryptere data. Feil passord?');
  }
}

/**
 * Encrypt et bilde-objekt
 * @param {Object} photo - Bilde-objekt
 * @param {string} password - Passord
 * @returns {Promise<Object>} - Kryptert bilde-objekt
 */
export async function encryptPhoto(photo, password) {
  try {
    const sensitiveData = JSON.stringify({
      url: photo.url,
      thumbnailSmall: photo.thumbnailSmall,
      thumbnailMedium: photo.thumbnailMedium,
      name: photo.name
    });

    const encrypted = await encryptData(sensitiveData, password);

    return {
      ...photo,
      encrypted: true,
      encryptedData: encrypted,
      // Remove sensitive fields
      url: null,
      thumbnailSmall: null,
      thumbnailMedium: null,
      name: '🔒 Kryptert bilde'
    };
  } catch (error) {
    console.error('Error encrypting photo:', error);
    throw error;
  }
}

/**
 * Decrypt et bilde-objekt
 * @param {Object} photo - Kryptert bilde-objekt
 * @param {string} password - Passord
 * @returns {Promise<Object>} - Dekryptert bilde-objekt
 */
export async function decryptPhoto(photo, password) {
  try {
    if (!photo.encrypted || !photo.encryptedData) {
      return photo; // Ikke kryptert
    }

    const decrypted = await decryptData(photo.encryptedData, password);
    const sensitiveData = JSON.parse(decrypted);

    return {
      ...photo,
      ...sensitiveData,
      encrypted: false,
      encryptedData: null
    };
  } catch (error) {
    console.error('Error decrypting photo:', error);
    throw error;
  }
}

/**
 * Generate en sikker tilfeldig PIN
 * @param {number} length - PIN-lengde (4-6)
 * @returns {string} - Tilfeldig PIN
 */
export function generateRandomPIN(length = 4) {
  if (length < 4 || length > 6) {
    length = 4;
  }

  let pin = '';
  for (let i = 0; i < length; i++) {
    pin += Math.floor(Math.random() * 10);
  }

  // Sjekk at den ikke er svak
  const validation = validatePIN(pin);
  if (!validation.valid) {
    return generateRandomPIN(length); // Prøv igjen
  }

  return pin;
}

/**
 * Sjekk PIN-styrke
 * @param {string} pin - PIN til sjekk
 * @returns {Object} - { strength: 'weak'|'medium'|'strong', score: 0-100 }
 */
export function checkPINStrength(pin) {
  if (!pin) {
    return { strength: 'weak', score: 0 };
  }

  let score = 0;

  // Length bonus
  if (pin.length >= 6) score += 40;
  else if (pin.length >= 5) score += 20;
  else score += 10;

  // Check for patterns
  const hasPattern = /(\d)\1{2,}/.test(pin); // Repeating digits
  const isSequential = /(?:0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)/.test(pin);
  
  if (hasPattern || isSequential) {
    score -= 30;
  } else {
    score += 30;
  }

  // Unique digits bonus
  const uniqueDigits = new Set(pin.split('')).size;
  score += uniqueDigits * 5;

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  let strength = 'weak';
  if (score >= 70) strength = 'strong';
  else if (score >= 40) strength = 'medium';

  return { strength, score };
}

// ============================================================================
// XSS PROTECTION - Prevents Cross-Site Scripting attacks
// ============================================================================

/**
 * Validates and sanitizes image URLs to prevent XSS attacks
 *
 * 🚨 SECURITY: Blocks dangerous protocols like:
 * - javascript:alert('XSS')
 * - data:text/html,<script>alert('XSS')</script>
 * - vbscript:msgbox('XSS')
 *
 * ✅ Allows safe protocols:
 * - https://example.com/image.jpg
 * - http://example.com/image.jpg (localhost only)
 * - data:image/png;base64,...
 * - blob:http://localhost:3000/...
 *
 * @param {string} url - The URL to validate
 * @param {string} fallback - Fallback URL if validation fails
 * @returns {string} - Sanitized URL or fallback
 */
export const sanitizeImageUrl = (url, fallback = '') => {
  // Null/undefined/empty check
  if (!url || typeof url !== 'string') {
    if (url !== '' && url !== null && url !== undefined) {
      console.warn('⚠️ Security: Invalid image URL type:', typeof url)
    }
    return fallback
  }

  // Trim whitespace
  const trimmed = url.trim()

  if (trimmed.length === 0) {
    return fallback
  }

  // Block dangerous protocols (XSS vectors)
  const dangerousProtocols = /^(javascript:|data:(?!image\/))/i

  if (dangerousProtocols.test(trimmed)) {
    console.error('🚨 SECURITY XSS: Blocked dangerous protocol in URL:', trimmed.substring(0, 100))
    return fallback
  }

  // Only allow safe protocols
  const allowedProtocols = /^(https?:|data:image\/|blob:https?:)/i

  if (!allowedProtocols.test(trimmed)) {
    console.error('🚨 SECURITY XSS: Invalid/unsafe protocol in URL:', trimmed.substring(0, 100))
    return fallback
  }

  // Additional validation for data URLs
  if (trimmed.startsWith('data:')) {
    // Strictly validate data URL format for images
    const validDataUrl = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml|bmp|ico);base64,/i

    if (!validDataUrl.test(trimmed)) {
      console.error('🚨 SECURITY XSS: Invalid data URL format (must be base64 encoded image)')
      return fallback
    }

    // Check for suspicious content in data URL
    const dataUrlContent = trimmed.substring(0, 200).toLowerCase()
    const suspiciousPatterns = ['<script', 'onerror', 'onload', 'javascript:', '<iframe']

    for (const pattern of suspiciousPatterns) {
      if (dataUrlContent.includes(pattern)) {
        console.error('🚨 SECURITY XSS: Suspicious content detected in data URL')
        return fallback
      }
    }
  }

  // Check for event handler injection attempts (e.g., "image.jpg?x=' onerror='alert(1)")
  const eventHandlerPattern = /\bon(error|load|click|mouseover|focus)\s*=/i

  if (eventHandlerPattern.test(trimmed)) {
    console.error('🚨 SECURITY XSS: Event handler injection attempt detected')
    return fallback
  }

  // URL looks safe
  return trimmed
}

/**
 * Validates that a string is safe to use as HTML attribute
 * Removes potentially dangerous characters
 *
 * @param {string} value - The value to validate
 * @returns {string} - Sanitized value
 */
export const sanitizeAttribute = (value) => {
  if (!value || typeof value !== 'string') {
    return ''
  }

  // Remove HTML/JavaScript dangerous characters
  return value
    .replace(/[<>'"&]/g, (char) => {
      // HTML entity encoding
      const entities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      }
      return entities[char] || char
    })
    .trim()
}

/**
 * Sanitizes text content to prevent XSS
 * Use this for rendering user-generated text content
 *
 * @param {string} text - The text to sanitize
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return ''
  }

  // Remove HTML tags (repeatedly) and escape special characters
  let sanitized = text;
  let previous;
  do {
    previous = sanitized;
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  } while (sanitized !== previous);
  return sanitized
    .replace(/[<>'"&]/g, (char) => {
      const entities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      }
      return entities[char] || char
    })
    .trim()
}

/**
 * Validates Firebase Storage URLs
 * Ensures URL is from trusted Firebase storage domain
 *
 * @param {string} url - The Firebase storage URL
 * @returns {boolean} - True if valid Firebase storage URL
 */
export const isValidFirebaseStorageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false
  }

  // Firebase storage domains
  const firebaseStorageDomains = [
    'firebasestorage.googleapis.com',
    'storage.googleapis.com'
  ]

  try {
    const urlObj = new URL(url)
    return firebaseStorageDomains.some(domain => urlObj.hostname.includes(domain))
  } catch (e) {
    console.warn('Invalid URL format:', url)
    return false
  }
}

/**
 * Inline SVG placeholder for missing images
 * Safe to use as it's controlled content, not user input
 */
export const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23334155" width="400" height="300"/%3E%3Ctext fill="%2394a3b8" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage not available%3C/text%3E%3C/svg%3E'

/**
 * Album placeholder
 */
export const PLACEHOLDER_ALBUM = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%234c1d95" width="400" height="300"/%3E%3Ctext fill="%23a78bfa" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo cover image%3C/text%3E%3C/svg%3E'

export default {
  // PIN & Encryption
  hashPIN,
  verifyPIN,
  validatePIN,
  encryptData,
  decryptData,
  encryptPhoto,
  decryptPhoto,
  generateRandomPIN,
  checkPINStrength,
  // XSS Protection
  sanitizeImageUrl,
  sanitizeAttribute,
  sanitizeText,
  isValidFirebaseStorageUrl,
  PLACEHOLDER_IMAGE,
  PLACEHOLDER_ALBUM
};
