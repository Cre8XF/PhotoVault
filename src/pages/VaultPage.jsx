// ============================================================================
// PAGE: VaultPage.jsx – Phase 3.1: Secure Vault
// ============================================================================
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Lock,
  LockOpen,
  Upload,
  Settings,
  Eye,
  EyeOff,
  Fingerprint,
  Trash2,
  AlertCircle,
  ImagePlus,
  Shield,
  Clock,
  X
} from "lucide-react";
import { useVault } from "../hooks/useVault";
import VaultSetupModal from "../components/VaultSetupModal";
import VaultSettingsModal from "../components/VaultSettingsModal";
import useStore from "../state/store";
import { useNavigate } from "react-router-dom";
const VaultPage = () => {
  const { t } = useTranslation(['vault', 'common']);
  const {
    isVaultUnlocked,
    vaultPhotos,
    vaultSettings,
    isVaultSetup,
    vaultLoading,
    unlockWithPassword,
    unlockWithBiometric,
    lockVault,
    uploadToVault,
    deleteFromVault,
    getDecryptedPhotoUrl,
    resetActivityTimer,
    checkBiometricAvailability,
  } = useVault();
const navigate = useNavigate();
  const getTimeUntilAutoLock = useStore((state) => state.getTimeUntilAutoLock);
  const setConfirmModal = useStore((state) => state.setConfirmModal);

  // UI State
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [decryptedUrls, setDecryptedUrls] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Check if biometric is available
    checkBiometricAvailability().then(setBiometricAvailable);
  }, [checkBiometricAvailability]);

  useEffect(() => {
    // Open setup modal if vault is not set up
    if (!isVaultSetup) {
      setSetupModalOpen(true);
    }
  }, [isVaultSetup]);

  useEffect(() => {
    // Update countdown timer
    if (isVaultUnlocked && vaultSettings.autoLockTimeout > 0) {
      const interval = setInterval(() => {
        const remaining = getTimeUntilAutoLock();
        setTimeRemaining(remaining);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isVaultUnlocked, vaultSettings.autoLockTimeout, getTimeUntilAutoLock]);

  useEffect(() => {
    // Track user activity for auto-lock
    const handleActivity = () => {
      if (isVaultUnlocked) {
        resetActivityTimer();
      }
    };

    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('touchstart', handleActivity);

    return () => {
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('touchstart', handleActivity);
    };
  }, [isVaultUnlocked, resetActivityTimer]);

  const handleUnlockWithPassword = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    const success = await unlockWithPassword(password);
    if (success) {
      setPassword("");
    }
  };

  const handleUnlockWithBiometric = async () => {
    await unlockWithBiometric();
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      await uploadToVault(files);
      e.target.value = ""; // Reset file input
    }
  };

  const handleDeletePhoto = (photoId) => {
    setConfirmModal({
      title: t('vault:confirmDelete.title', { defaultValue: 'Delete Photo' }),
      message: t('vault:confirmDelete.message', { defaultValue: 'Are you sure you want to permanently delete this photo from the vault?' }),
      confirmText: t('common:delete', { defaultValue: 'Delete' }),
      confirmStyle: 'danger',
      onConfirm: async () => {
        await deleteFromVault(photoId);
        setConfirmModal(null);
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  const handleViewPhoto = async (photo) => {
    const url = await getDecryptedPhotoUrl(photo);
    if (url) {
      setDecryptedUrls(prev => ({ ...prev, [photo.id]: url }));
      setSelectedPhoto(photo);
    }
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  const formatTimeRemaining = (ms) => {
    if (ms === Infinity) return null;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  // Locked state
  if (!isVaultUnlocked) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-10 h-10 text-purple-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {t('vault:locked.title', { defaultValue: 'Vault Locked' })}
              </h1>
              <p className="text-gray-400">
                {t('vault:locked.subtitle', { defaultValue: 'Enter your password to access encrypted photos' })}
              </p>
            </div>

            <form onSubmit={handleUnlockWithPassword} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('vault:locked.passwordPlaceholder', { defaultValue: 'Enter vault password' })}
                  className="w-full p-4 pr-12 rounded-xl bg-gray-800/60 border border-gray-600/50
                             text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={!password.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600
                           text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('vault:locked.unlockButton', { defaultValue: 'Unlock Vault' })}
              </button>
            </form>

            {biometricAvailable && vaultSettings.biometricEnabled && (
              <>
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-700" />
                  <span className="text-gray-400 text-sm">
                    {t('vault:locked.or', { defaultValue: 'or' })}
                  </span>
                  <div className="flex-1 h-px bg-gray-700" />
                </div>

                <button
                  onClick={handleUnlockWithBiometric}
                  className="w-full py-3 rounded-xl bg-gray-800/60 border border-gray-600/50
                             text-white font-semibold hover:bg-gray-800 transition
                             flex items-center justify-center gap-2"
                >
                  <Fingerprint className="w-5 h-5" />
                  {t('vault:locked.biometricButton', { defaultValue: 'Unlock with Biometric' })}
                </button>
              </>
            )}

            {!isVaultSetup && (
              <button
                onClick={() => setSetupModalOpen(true)}
                className="w-full mt-4 py-3 rounded-xl bg-gray-800/60 border border-gray-600/50
                           text-purple-400 font-semibold hover:bg-gray-800 transition"
              >
                {t('vault:locked.setupButton', { defaultValue: 'Set Up Vault' })}
              </button>
            )}
          </div>
        </div>

        <VaultSetupModal
          isOpen={setupModalOpen}
          onClose={() => setSetupModalOpen(false)}
          onComplete={() => setSetupModalOpen(false)}
        />
      </>
    );
  }

  // Unlocked state
  return (
    <>
      <div className="min-h-screen p-6 md:p-10 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Shield className="w-7 h-7 text-purple-400" />
              {t('vault:unlocked.title', { defaultValue: 'Secure Vault' })}
            </h1>
            <p className="text-gray-400 mt-1">
              {vaultPhotos.length} {vaultPhotos.length === 1 ? t('vault:unlocked.photo', { defaultValue: 'photo' }) : t('vault:unlocked.photos', { defaultValue: 'photos' })}
            </p>
          </div>

          <div className="flex gap-2">
            {vaultSettings.autoLockTimeout > 0 && timeRemaining < 60000 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400 font-semibold">
                  {formatTimeRemaining(timeRemaining)}
                </span>
              </div>
            )}

            <button
              onClick={() => setSettingsModalOpen(true)}
              className="p-2 rounded-xl bg-gray-800/60 border border-gray-600/50
                         text-gray-300 hover:text-white hover:bg-gray-800 transition"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={lockVault}
              className="p-2 rounded-xl bg-gray-800/60 border border-gray-600/50
                         text-gray-300 hover:text-white hover:bg-gray-800 transition"
            >
              <LockOpen className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={vaultLoading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600
                       text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition
                       flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-5 h-5" />
            {t('vault:unlocked.uploadButton', { defaultValue: 'Upload to Vault' })}
          </button>
 {/* Back to More Page */}
<div className="mt-6 text-center">
  <button
    onClick={() => navigate("/more")}
    className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 
               text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition"
  >
    ← Back to More Page
  </button>
</div>
        </div>

        {/* Photos Grid */}
        {vaultPhotos.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-800/60 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImagePlus className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {t('vault:unlocked.empty.title', { defaultValue: 'No Photos in Vault' })}
            </h3>
            <p className="text-gray-400">
              {t('vault:unlocked.empty.message', { defaultValue: 'Upload your first encrypted photo to get started' })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {vaultPhotos.map((photo) => (
              <VaultPhotoCard
                key={photo.id}
                photo={photo}
                onView={() => handleViewPhoto(photo)}
                onDelete={() => handleDeletePhoto(photo.id)}
                getDecryptedUrl={getDecryptedPhotoUrl}
              />
            ))}
          </div>
        )}

        {vaultLoading && (
          <div className="fixed bottom-4 right-4 px-4 py-3 bg-purple-600 text-white rounded-xl shadow-lg">
            {t('vault:unlocked.processing', { defaultValue: 'Processing...' })}
          </div>
        )}
      </div>

      <VaultSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closePhotoModal}
        >
          <button
            onClick={closePhotoModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/80 text-white hover:bg-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>

          <img
            src={decryptedUrls[selectedPhoto.id]}
            alt={selectedPhoto.encryptedMetadata?.originalName || 'Vault photo'}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

// Vault Photo Card Component
const VaultPhotoCard = ({ photo, onView, onDelete, getDecryptedUrl }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadThumbnail = async () => {
      try {
        const url = await getDecryptedUrl(photo);
        if (isMounted && url) {
          setThumbnailUrl(url);
        }
      } catch (error) {
        console.error('Failed to load thumbnail:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadThumbnail();

    return () => {
      isMounted = false;
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [photo, getDecryptedUrl]);

  return (
    <div className="relative group aspect-square rounded-xl overflow-hidden bg-gray-800/60">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-gray-600 animate-pulse" />
        </div>
      ) : thumbnailUrl ? (
        <>
          <img
            src={thumbnailUrl}
            alt={photo.encryptedMetadata?.originalName || 'Encrypted photo'}
            className="w-full h-full object-cover cursor-pointer"
            onClick={onView}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />
          <button
            onClick={onDelete}
            className="absolute top-2 right-2 p-2 rounded-full bg-red-600/80 text-white
                       opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
      )}
    </div>
  );
};

export default VaultPage;
