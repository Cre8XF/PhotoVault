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

/**
 * Check email verification status
 * @param {Object} user - Firebase user object
 * @returns {Promise<boolean>} - True if email is verified
 */
export const checkEmailVerification = async (user) => {
  if (!user) return false;

  try {
    // Reload user from Firebase to get fresh emailVerified status
    await user.reload();

    const isVerified = user.emailVerified;
    console.log('📧 Email verified status:', isVerified);

    return isVerified;
  } catch (error) {
    console.error('❌ Error checking verification:', error);
    return false;
  }
};
