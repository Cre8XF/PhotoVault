// ============================================================================
// ProfilePage - Phase 2: User Profile Management + XSS Protection
// ============================================================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, updateEmail } from 'firebase/auth';
import { db } from '../firebase';
import useAuth from '../hooks/useAuth';
import useStore from '../state/store';
import { sanitizeImageUrl, PLACEHOLDER_IMAGE } from '../utils/security';
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Calendar,
  Save,
  Camera,
  HardDrive,
} from 'lucide-react';

/**
 * Profile Page
 * Display and update user information
 */
const ProfilePage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation(['profile', 'common']);
  const { user, userProfile, fetchUserProfile, tier } = useAuth();
  const setNotification = useStore((state) => state.setNotification);
  const storageUsed = useStore((state) => state.storageUsed);
  const storageLimit = useStore((state) => state.storageLimit);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    photoURL: '',
  });

  // Load user data
  useEffect(() => {
    if (user && userProfile) {
      setFormData({
        displayName: user.displayName || userProfile.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || userProfile.photoURL || '',
      });
    }
  }, [user, userProfile]);

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Save profile changes
   */
  const handleSave = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: formData.displayName,
        photoURL: formData.photoURL,
      });

      // Update email if changed
      if (formData.email !== user.email) {
        await updateEmail(user, formData.email);
      }

      // Update Firestore user document
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: formData.displayName,
        photoURL: formData.photoURL,
        updatedAt: new Date().toISOString(),
      });

      // Refresh user profile
      await fetchUserProfile(user.uid);

      setNotification({
        message: t('common:notifications.profileUpdated') || 'Profile updated successfully',
        type: 'success',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        message: error.message || 'Failed to update profile',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return t('profile:fallback.notAvailable');
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  /**
   * Format bytes to human-readable size
   */
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * Calculate storage percentage
   */
  const storagePercentage = storageLimit === 0 ? 0 : Math.min((storageUsed / storageLimit) * 100, 100);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-card border-b border-white/20 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/more')}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">{t('profile:header.title')}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Profile Photo Section */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              {formData.photoURL ? (
                <img
                  src={sanitizeImageUrl(formData.photoURL, PLACEHOLDER_IMAGE)}
                  alt="Profile"
                  onError={(e) => {
                    console.error('❌ Failed to load profile photo:', formData.photoURL)
                    e.target.src = PLACEHOLDER_IMAGE
                  }}
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-4 border-purple-500">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
              <button className="absolute bottom-0 right-0 p-2 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg transition">
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>
            <h2 className="text-xl font-semibold">
              {formData.displayName || t('profile:profileCard.noName')}
            </h2>
            <p className="text-sm text-gray-400">{formData.email}</p>
          </div>

          {/* Subscription Tier Badge */}
          <div className="flex justify-center mb-4">
            <div
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                tier() === 'ADMIN'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : tier() === 'PRO'
                  ? 'bg-purple-500/20 text-purple border border-purple-500/30'
                  : tier() === 'LITE'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              {tier()}
            </div>
          </div>

          {/* Storage Usage Widget */}
          <div className="mt-4 p-4 glass rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-purple" />
                <span className="text-sm font-medium">Lagring</span>
              </div>
              <button
                onClick={() => navigate('/subscription')}
                className="text-xs text-purple hover:text-purple transition-colors"
              >
                Detaljer →
              </button>
            </div>

            {/* Mini progress bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{formatBytes(storageUsed)}</span>
                <span>{formatBytes(storageLimit)}</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    storagePercentage > 90
                      ? 'bg-red-500'
                      : storagePercentage > 80
                      ? 'bg-yellow-500'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600'
                  }`}
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Percentage and warning */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {storagePercentage.toFixed(1)}% brukt
              </span>
              {storagePercentage > 80 && (
                <span className="text-xs text-yellow-400 font-medium">
                  ⚠️ {(100 - storagePercentage).toFixed(0)}% igjen
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information Form */}
        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{t('profile:sections.profileInfo')}</h3>

          {/* Display Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              <User className="w-4 h-4 inline mr-2" />
              {t('profile:form.displayName')}
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={t('profile:form.namePlaceholder')}
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              {t('profile:form.emailAddress')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={t('profile:form.emailPlaceholder')}
            />
            <p className="text-xs text-gray-400 mt-1">
              {t('profile:form.emailWarning')}
            </p>
          </div>

          {/* Photo URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              <Camera className="w-4 h-4 inline mr-2" />
              {t('profile:form.photoURL')}
            </label>
            <input
              type="url"
              name="photoURL"
              value={formData.photoURL}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="spinner w-5 h-5" />
                {t('profile:form.saving')}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                {t('profile:form.saveChanges')}
              </span>
            )}
          </button>
        </div>

        {/* Account Details */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">{t('profile:sections.accountDetails')}</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-gray-400">{t('profile:accountDetails.userId')}</span>
              <span className="text-sm font-mono">{user?.uid?.substring(0, 12)}...</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-gray-400">
                <Calendar className="w-4 h-4 inline mr-2" />
                {t('profile:accountDetails.accountCreated')}
              </span>
              <span className="text-sm">
                {formatDate(userProfile?.createdAt || user?.metadata?.creationTime)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">
                <Calendar className="w-4 h-4 inline mr-2" />
                {t('profile:accountDetails.lastUpdated')}
              </span>
              <span className="text-sm">
                {formatDate(userProfile?.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
