// ============================================================================
// biometric.js - Biometrisk autentisering (Web Authentication API)
// FASE 3 - Sikkerhet & Privacy
// ============================================================================

/* global PublicKeyCredential */

/**
 * Sjekk om biometrisk autentisering er tilgjengelig
 * @returns {Promise<boolean>} - True hvis tilgjengelig
 */
export async function checkBiometricSupport() {
  try {
    // Check if WebAuthn is available
    if (!window.PublicKeyCredential) {
      console.log('WebAuthn not supported');
      return false;
    }

    // Check if platform authenticator is available
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    
    if (available) {
      console.log('✓ Biometric authentication available');
    } else {
      console.log('✗ Biometric authentication not available');
    }

    return available;
  } catch (error) {
    console.error('Error checking biometric support:', error);
    return false;
  }
}

/**
 * Registrer biometrisk kredensial
 * @param {string} userId - Bruker-ID
 * @param {string} userName - Brukernavn
 * @returns {Promise<Object>} - { success: boolean, credential?: Object, error?: string }
 */
export async function registerBiometric(userId, userName) {
  try {
    if (!window.PublicKeyCredential) {
      return { success: false, error: 'WebAuthn ikke støttet' };
    }

    // Generate challenge (random 32 bytes)
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // Convert userId to ArrayBuffer
    const userIdBuffer = new TextEncoder().encode(userId);

    // PublicKeyCredentialCreationOptions
    const publicKeyOptions = {
      challenge: challenge,
      rp: {
        name: 'PhotoVault',
        id: window.location.hostname
      },
      user: {
        id: userIdBuffer,
        name: userName,
        displayName: userName
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },  // ES256
        { type: 'public-key', alg: -257 } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Use platform authenticator (Touch ID, Face ID, Windows Hello)
        requireResidentKey: false,
        userVerification: 'required'
      },
      timeout: 60000,
      attestation: 'none'
    };

    // Create credential
    const credential = await navigator.credentials.create({
      publicKey: publicKeyOptions
    });

    if (!credential) {
      return { success: false, error: 'Kunne ikke opprette kredensial' };
    }

    // Store credential ID
    const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
    localStorage.setItem('photoVaultBiometricCredential', credentialId);

    return { success: true, credential };
  } catch (error) {
    console.error('Error registering biometric:', error);
    
    let errorMessage = 'Kunne ikke registrere biometri';
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Biometrisk autentisering avbrutt';
    } else if (error.name === 'InvalidStateError') {
      errorMessage = 'Biometri allerede registrert';
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Autentiser med biometri
 * @param {string} reason - Årsak for autentisering (vises til bruker)
 * @returns {Promise<Object>} - { success: boolean, error?: string }
 */
export async function authenticateWithBiometric(reason = 'Bekreft identitet') {
  try {
    if (!window.PublicKeyCredential) {
      return { success: false, error: 'WebAuthn ikke støttet' };
    }

    // Get stored credential ID
    const storedCredentialId = localStorage.getItem('photoVaultBiometricCredential');
    if (!storedCredentialId) {
      return { success: false, error: 'Ingen biometrisk kredensial funnet' };
    }

    // Generate challenge
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // Convert credential ID from base64
    const credentialIdBuffer = Uint8Array.from(atob(storedCredentialId), c => c.charCodeAt(0));

    // PublicKeyCredentialRequestOptions
    const publicKeyOptions = {
      challenge: challenge,
      timeout: 60000,
      rpId: window.location.hostname,
      allowCredentials: [{
        type: 'public-key',
        id: credentialIdBuffer,
        transports: ['internal']
      }],
      userVerification: 'required'
    };

    // Get credential (triggers biometric prompt)
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyOptions
    });

    if (!assertion) {
      return { success: false, error: 'Autentisering feilet' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error authenticating with biometric:', error);
    
    let errorMessage = 'Biometrisk autentisering feilet';
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Autentisering avbrutt';
    } else if (error.name === 'InvalidStateError') {
      errorMessage = 'Ugyldig tilstand';
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Slett biometrisk kredensial
 * @returns {boolean} - True hvis slettet
 */
export function removeBiometricCredential() {
  try {
    localStorage.removeItem('photoVaultBiometricCredential');
    return true;
  } catch (error) {
    console.error('Error removing biometric credential:', error);
    return false;
  }
}

/**
 * Sjekk om biometrisk kredensial er registrert
 * @returns {boolean} - True hvis registrert
 */
export function hasBiometricCredential() {
  return !!localStorage.getItem('photoVaultBiometricCredential');
}

/**
 * Get biometric type (hvis mulig)
 * @returns {Promise<string>} - 'fingerprint' | 'face' | 'unknown'
 */
export async function getBiometricType() {
  try {
    // This is a best-effort detection
    // WebAuthn API doesn't expose the exact authenticator type
    
    const available = await checkBiometricSupport();
    if (!available) return 'none';

    // Try to detect from user agent
    const ua = navigator.userAgent.toLowerCase();
    
    if (ua.includes('iphone') || ua.includes('ipad')) {
      // iOS devices - could be Touch ID or Face ID
      // Face ID was introduced with iPhone X
      if (ua.includes('iphone') && !ua.includes('iphone x')) {
        return 'fingerprint'; // Likely Touch ID
      }
      return 'face'; // Likely Face ID
    }
    
    if (ua.includes('android')) {
      return 'fingerprint'; // Most Android devices use fingerprint
    }
    
    if (ua.includes('windows')) {
      return 'face'; // Windows Hello often uses face
    }
    
    if (ua.includes('mac')) {
      return 'fingerprint'; // Touch ID on MacBooks
    }

    return 'unknown';
  } catch (error) {
    console.error('Error detecting biometric type:', error);
    return 'unknown';
  }
}

/**
 * Get biometric icon navn basert på type
 * @returns {Promise<string>} - Lucide icon navn
 */
export async function getBiometricIcon() {
  const type = await getBiometricType();
  
  switch (type) {
    case 'fingerprint':
      return 'Fingerprint';
    case 'face':
      return 'Scan';
    case 'unknown':
    default:
      return 'Shield';
  }
}

/**
 * Get biometric display navn
 * @returns {Promise<string>} - Display navn
 */
export async function getBiometricDisplayName() {
  const type = await getBiometricType();
  
  switch (type) {
    case 'fingerprint':
      return 'Fingeravtrykk';
    case 'face':
      return 'Ansiktsgjenkjenning';
    case 'unknown':
      return 'Biometrisk';
    case 'none':
    default:
      return 'Ikke tilgjengelig';
  }
}

export default {
  checkBiometricSupport,
  registerBiometric,
  authenticateWithBiometric,
  removeBiometricCredential,
  hasBiometricCredential,
  getBiometricType,
  getBiometricIcon,
  getBiometricDisplayName
};
