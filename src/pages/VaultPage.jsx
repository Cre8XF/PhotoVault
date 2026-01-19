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
  Image,
  Shield,
  Clock,
  X,
  Video,
  FileText,
  File,
  Archive
} from "lucide-react";
import { useVault } from "../hooks/useVault";
import VaultSetupModal from "../components/VaultSetupModal";
import VaultSettingsModal from "../components/VaultSettingsModal";
import VaultViewerModal from "../components/VaultViewerModal";
import useStore from "../state/store";
import { useNavigate } from "react-router-dom";
import { getAcceptedFileTypes, getVaultFileCategory } from "../utils/vaultMedia";
import LogoLight from '../assets/logo_light.png';
import LogoDark from '../assets/logo_dark.png';
import IconLight from '../assets/icon_light.png';
import IconDark from '../assets/icon_dark.png';
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
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedVaultItem, setSelectedVaultItem] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const isDarkMode = useStore((state) => state.isDarkMode);
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

  const handleViewItem = (vaultItem) => {
    console.log('🔍 handleViewItem called:', vaultItem);
    setSelectedVaultItem(vaultItem);
    setViewerOpen(true);
    console.log('✅ State updated - viewerOpen should be true now');
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setSelectedVaultItem(null);
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
        <div className="min-h-screen flex items-center justify-center p-6 relative">
          {/* Close button - top right */}
          <button
            onClick={() => navigate('/account')}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors ripple-effect"
            aria-label={t('vault:locked.backToAccount', { defaultValue: 'Back to account' })}
            style={{ color: 'var(--text-primary)' }}
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <img
                  src={isDarkMode ? IconDark : IconLight}
                  alt="PIXTR"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('vault:locked.title', { defaultValue: 'Vault Locked' })}
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
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
                  className="w-full p-4 pr-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 icon-muted hover:icon-secondary transition-colors"
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
                {!password.trim()
                  ? t('vault:locked.enterPasswordPrompt', { defaultValue: 'Enter password to unlock' })
                  : t('vault:locked.unlockButton', { defaultValue: 'Unlock Vault' })
                }
              </button>
            </form>

            {biometricAvailable && vaultSettings.biometricEnabled && (
              <>
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {t('vault:locked.or', { defaultValue: 'or' })}
                  </span>
                  <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
                </div>

                <button
                  onClick={handleUnlockWithBiometric}
                  className="w-full py-3 rounded-xl glass hover:bg-white/10 font-semibold transition flex items-center justify-center gap-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Fingerprint className="w-5 h-5" />
                  {t('vault:locked.biometricButton', { defaultValue: 'Unlock with Biometric' })}
                </button>
              </>
            )}

            {!isVaultSetup && (
              <button
                onClick={() => setSetupModalOpen(true)}
                className="w-full mt-4 py-3 rounded-xl glass hover:bg-white/10 font-semibold transition"
                style={{ color: 'var(--color-purple-text)' }}
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
            <h1 className="text-3xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Shield className="w-7 h-7 text-purple-500 dark:text-purple" />
              {t('vault:unlocked.title', { defaultValue: 'Secure Vault' })}
            </h1>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
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
              className="p-2 rounded-xl glass hover:bg-white/10 transition"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={lockVault}
              className="p-2 rounded-xl glass hover:bg-white/10 transition"
              style={{ color: 'var(--text-secondary)' }}
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
            accept={getAcceptedFileTypes()}
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
    {t('vault:backToMore', { defaultValue: '← Back to More Page' })}
  </button>
</div>
        </div>

        {/* Photos Grid */}
        {vaultPhotos.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/10 rounded-full mb-4">
              <ImagePlus className="w-10 h-10 text-purple" />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {t('vault:unlocked.empty.title', { defaultValue: 'No Photos in Vault' })}
            </h3>
            <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
              {t('vault:unlocked.empty.message', { defaultValue: 'Upload your first encrypted photo to get started' })}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={vaultLoading}
              className="ripple-effect px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex items-center gap-2 mx-auto transition disabled:opacity-50 text-white font-semibold"
            >
              <Upload className="w-5 h-5" />
              {t('vault:unlocked.uploadButton', { defaultValue: 'Upload to Vault' })}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {vaultPhotos.map((photo) => (
              <VaultPhotoCard
                key={photo.id}
                photo={photo}
                onView={() => handleViewItem(photo)}
                onDelete={() => handleDeletePhoto(photo.id)}
                getDecryptedUrl={getDecryptedPhotoUrl}
              />
            ))}
          </div>
        )}

        {vaultLoading && (
          <div className="fixed bottom-4 right-4 px-4 py-3 bg-purple-600 dark:bg-purple-600 text-white rounded-xl shadow-lg">
            {t('vault:unlocked.processing', { defaultValue: 'Processing...' })}
          </div>
        )}
      </div>

      <VaultSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      {/* Vault Viewer Modal */}
      <VaultViewerModal
        isOpen={viewerOpen}
        vaultItem={selectedVaultItem}
        onClose={closeViewer}
        getDecryptedUrl={getDecryptedPhotoUrl}
      />
    </>
  );
};

// Vault Photo Card Component
const VaultPhotoCard = ({ photo, onView, onDelete, getDecryptedUrl }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const mimeType = photo.encryptedMetadata?.mimeType || '';
  const category = getVaultFileCategory(mimeType);
  const isImage = category === 'image';

  useEffect(() => {
    let isMounted = true;

    const loadThumbnail = async () => {
      try {
        // Only load thumbnail for images
        if (isImage) {
          const url = await getDecryptedUrl(photo);
          if (isMounted && url) {
            setThumbnailUrl(url);
          }
        }
      } catch (error) {
        // Don't show errors for thumbnail loading - grid should still work
        // User will see error when they click to open the item
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
      // Note: Don't revoke URL here as it's cached in Zustand store
    };
  }, [photo, getDecryptedUrl, isImage]);

  // Get icon for non-image files
  const getFileIcon = () => {
    switch (category) {
      case 'video':
        return <Video className="w-12 h-12 text-purple-400" />;
      case 'pdf':
        return <FileText className="w-12 h-12 text-red-400" />;
      case 'doc':
        return <FileText className="w-12 h-12 text-blue-400" />;
      case 'archive':
        return <Archive className="w-12 h-12 text-yellow-400" />;
      default:
        return <File className="w-12 h-12 text-gray-400" />;
    }
  };

  return (
    <div className="relative group aspect-square rounded-xl overflow-hidden glass">
      {loading && isImage ? (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <Lock className="w-8 h-8 animate-pulse" style={{ color: 'var(--text-muted)' }} />
        </div>
      ) : isImage && thumbnailUrl ? (
        <>
          <img
            src={thumbnailUrl}
            alt={photo.encryptedMetadata?.originalName || 'Encrypted photo'}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => {
              console.log('🖱️ Image clicked! Calling onView...');
              onView();
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all pointer-events-none" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-red-600/90 text-white
                       opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      ) : !isImage ? (
        <>
          <div
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
            onClick={() => {
              console.log('🖱️ Non-image file clicked! Calling onView...');
              onView();
            }}
          >
            {getFileIcon()}
            <p className="mt-2 text-xs text-center px-2 truncate w-full" style={{ color: 'var(--text-secondary)' }}>
              {photo.encryptedMetadata?.originalName || 'File'}
            </p>
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all pointer-events-none" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-red-600/90 text-white
                       opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      ) : (
        /* FIX: Image thumbnail failed to load - show proper fallback instead of error icon */
        <>
          <div
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
            onClick={() => {
              console.log('🖱️ Image (preview unavailable) clicked! Calling onView...');
              onView();
            }}
          >
            <Image className="w-12 h-12 text-purple-400" />
            <p className="mt-2 text-xs text-center px-2 truncate w-full" style={{ color: 'var(--text-secondary)' }}>
              {photo.encryptedMetadata?.originalName || 'Image'}
            </p>
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all pointer-events-none" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-red-600/90 text-white
                       opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};

export default VaultPage;
