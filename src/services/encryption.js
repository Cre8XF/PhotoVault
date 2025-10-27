/**
 * Encryption Service
 * Provides AES-256-GCM encryption/decryption for vault photos
 * Uses Web Crypto API with PBKDF2 key derivation
 */

/**
 * Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derive encryption key from password using PBKDF2
 * @param {string} password - User password
 * @param {Uint8Array} salt - Salt for key derivation
 * @returns {Promise<CryptoKey>} Derived encryption key
 */
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
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
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a file using AES-256-GCM
 * @param {File|Blob} file - File to encrypt
 * @param {string} password - Encryption password
 * @returns {Promise<{blob: Blob, metadata: Object}>} Encrypted blob and metadata
 */
export async function encryptFile(file, password) {
  try {
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Derive encryption key
    const key = await deriveKey(password, salt);

    // Read file as ArrayBuffer
    const fileData = await file.arrayBuffer();

    // Encrypt file data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      fileData
    );

    // Create encrypted blob
    const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });

    // Return blob and metadata
    return {
      blob: encryptedBlob,
      metadata: {
        salt: arrayBufferToBase64(salt),
        iv: arrayBufferToBase64(iv),
        algorithm: 'AES-GCM',
        originalName: file.name,
        mimeType: file.type,
        size: file.size
      }
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt file');
  }
}

/**
 * Decrypt an encrypted blob
 * @param {Blob} encryptedBlob - Encrypted blob
 * @param {Object} metadata - Encryption metadata (salt, iv, algorithm)
 * @param {string} password - Decryption password
 * @returns {Promise<Blob>} Decrypted blob
 */
export async function decryptFile(encryptedBlob, metadata, password) {
  try {
    // Convert base64 salt and IV back to Uint8Array
    const salt = new Uint8Array(base64ToArrayBuffer(metadata.salt));
    const iv = new Uint8Array(base64ToArrayBuffer(metadata.iv));

    // Derive decryption key
    const key = await deriveKey(password, salt);

    // Read encrypted blob as ArrayBuffer
    const encryptedData = await encryptedBlob.arrayBuffer();

    // Decrypt data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encryptedData
    );

    // Return decrypted blob with original MIME type
    return new Blob([decryptedData], { type: metadata.mimeType || 'application/octet-stream' });
  } catch (error) {
    console.error('Decryption failed:', error);
    if (error.name === 'OperationError') {
      const customError = new Error('Invalid password');
      customError.code = 'INVALID_PASSWORD';
      throw customError;
    }
    throw new Error('Failed to decrypt file');
  }
}

/**
 * Hash a password for storage
 * @param {string} password - Password to hash
 * @returns {Promise<string>} Hashed password (base64)
 */
export async function hashPassword(password) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return arrayBufferToBase64(hash);
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password against a hash
 * @param {string} password - Password to verify
 * @param {string} hash - Stored hash
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, hash) {
  try {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
}

/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 16)
 * @returns {string} Random password
 */
export function generateSecurePassword(length = 16) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  return password;
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result { valid: boolean, errors: string[] }
 */
export function validatePasswordStrength(password) {
  const errors = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain numbers');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
