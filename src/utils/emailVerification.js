import { sendEmailVerification } from 'firebase/auth';

/**
 * Send email verification with proper configuration
 * @param {Object} user - Firebase user object
 * @returns {Promise<void>}
 */
export const sendVerificationEmail = async (user) => {
  if (!user) {
    throw new Error('No user provided');
  }

  // Action code settings - CRITICAL for proper redirect
  const actionCodeSettings = {
    url: `${window.location.origin}/more`,
    handleCodeInApp: false,
  };

  try {
    await sendEmailVerification(user, actionCodeSettings);
    console.log('✅ Verification email sent to:', user.email);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw error;
  }
};

// ✅ checkEmailVerification removed - use useAuth().refreshUser() instead
// Single source of truth: emailVerified from Zustand store
