import React, { useState } from 'react';
import { Mail, RotateCw, Edit, RefreshCw } from 'lucide-react';
import { auth } from '../firebase';
import { sendVerificationEmail, checkEmailVerification } from '../utils/emailVerification';

/**
 * Email Verification Banner
 * Shows at top of app when user's email is not verified
 * Provides manual resend and verification check buttons
 */
export default function VerificationBanner({ user }) {
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');

  /**
   * Resend verification email
   */
  const handleResendVerification = async () => {
    setSending(true);
    setMessage('');

    try {
      await sendVerificationEmail(auth.currentUser);
      setMessage('✅ Verification email sent! Check your inbox (and spam folder).');
      setTimeout(() => setMessage(''), 8000);
    } catch (error) {
      console.error('❌ Resend error:', error);

      // Better error messages
      if (error.code === 'auth/too-many-requests') {
        setMessage('⚠️ Too many requests. Wait a few minutes and try again.');
      } else {
        setMessage('❌ Could not send email. Try again later.');
      }

      setTimeout(() => setMessage(''), 5000);
    } finally {
      setSending(false);
    }
  };

  /**
   * Check if email has been verified and refresh app
   * Uses window.location.reload() for deterministic state sync
   */
  const handleCheckVerification = async () => {
    setChecking(true);
    setMessage('');

    try {
      const isVerified = await checkEmailVerification(auth.currentUser);

      if (isVerified) {
        setMessage('✅ Email verified! Reloading app...');

        // ✅ DETERMINISTIC SOLUTION: Full page reload
        // This ensures ALL state (React, Zustand, Firebase) syncs correctly
        // Works reliably on mobile, desktop, PWA, and WebView
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage('⚠️ Email not verified yet. Please click the link in your email first.');
        setTimeout(() => setMessage(''), 6000);
      }
    } catch (error) {
      console.error('❌ Check verification error:', error);
      setMessage('❌ Error checking status. Try again.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setChecking(false);
    }
  };

  /**
   * Navigate to profile page to change email
   */
  const handleChangeEmail = () => {
    window.location.href = '/profile';
  };

  // Hide banner if email is already verified
  if (user?.emailVerified) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-pink-100 dark:bg-pink-900/20 border-b border-pink-200 dark:border-pink-800/30 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Message */}
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-pink-600 dark:text-pink-400 flex-shrink-0" />
            <p className="text-sm font-medium text-pink-800 dark:text-pink-200">
              Please verify your email to unlock sharing and Pro features.
            </p>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Resend Email Button */}
            <button
              onClick={handleResendVerification}
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCw className={`w-4 h-4 ${sending ? 'animate-spin' : ''}`} />
              {sending ? 'Sending...' : 'Resend Email'}
            </button>

            {/* I Verified Button - BETA HELPER */}
            <button
              onClick={handleCheckVerification}
              disabled={checking}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Click after verifying your email"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Checking...' : 'I Verified'}
            </button>

            {/* Change Email Button */}
            <button
              onClick={handleChangeEmail}
              className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 rounded-lg text-sm font-medium transition"
            >
              <Edit className="w-4 h-4" />
              Change Email
            </button>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className="mt-2 text-xs text-pink-700 dark:text-pink-300 animate-fade-in">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
