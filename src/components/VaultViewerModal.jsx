// ============================================================================
// COMPONENT: VaultViewerModal – Full Media Viewer for Vault
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import { X, Download, FileText, AlertCircle, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getVaultFileCategory, revokeObjectUrl, formatFileSize } from '../utils/vaultMedia';

/**
 * VaultViewerModal - Universal viewer for vault items (images, videos, documents)
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Object} props.vaultItem - Vault item to display
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.getDecryptedUrl - Function to get decrypted blob URL
 */
const VaultViewerModal = ({ isOpen, vaultItem, onClose, getDecryptedUrl }) => {
  const { t } = useTranslation(['vault', 'common']);
  const [objectUrl, setObjectUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const objectUrlRef = useRef(null);

  // Get file info
  const mimeType = vaultItem?.encryptedMetadata?.mimeType || '';
  const originalName = vaultItem?.encryptedMetadata?.originalName || 'file';
  const fileSize = vaultItem?.encryptedMetadata?.size || 0;
  const category = getVaultFileCategory(mimeType);

  // Load decrypted file when modal opens
  useEffect(() => {
    if (!isOpen || !vaultItem) {
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadFile = async () => {
      try {
        const url = await getDecryptedUrl(vaultItem);

        if (isMounted) {
          if (url) {
            setObjectUrl(url);
            objectUrlRef.current = url;
          } else {
            setError(t('vault:viewer.loadError', { defaultValue: 'Failed to load file' }));
          }
        }
      } catch (err) {
        console.error('Failed to load vault file:', err);
        if (isMounted) {
          // Provide specific error messages based on error type
          let errorMessage = t('vault:viewer.loadError', { defaultValue: 'Failed to load file' });

          if (err.message === 'SESSION_EXPIRED') {
            errorMessage = t('vault:viewer.sessionExpired', {
              defaultValue: 'Your vault session has expired. Please close this viewer and unlock the vault again.',
            });
          } else if (err.message === 'INVALID_PASSWORD') {
            errorMessage = t('vault:viewer.invalidPassword', {
              defaultValue: 'Invalid password. Your vault session may have been corrupted. Please close and unlock again.',
            });
          } else if (err.message === 'VAULT_LOCKED') {
            errorMessage = t('vault:viewer.vaultLocked', {
              defaultValue: 'Vault is locked. Please unlock to view files.',
            });
          } else if (err.message === 'DECRYPT_FAILED') {
            errorMessage = t('vault:viewer.decryptFailed', {
              defaultValue: 'Failed to decrypt file. The file may be corrupted.',
            });
          }

          setError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFile();

    return () => {
      isMounted = false;
    };
  }, [isOpen, vaultItem, getDecryptedUrl, t]);

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        // Note: We don't revoke here because the URL is cached in Zustand store
        // The store handles cleanup when the cache is cleared
        objectUrlRef.current = null;
      }
    };
  }, []);

  // Handle download
  const handleDownload = () => {
    if (!objectUrl) return;

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle close
  const handleClose = () => {
    setObjectUrl(null);
    setLoading(true);
    setError(null);
    onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) {
    console.log('🚪 VaultViewerModal: Modal is CLOSED (isOpen=false)');
    return null;
  }

  console.log('🚀 VaultViewerModal: Modal is RENDERING', { vaultItem, loading, error, objectUrl });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'var(--overlay-bg)' }}
      onClick={handleBackdropClick}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10" style={{
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3), transparent)'
      }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{originalName}</h3>
            {fileSize > 0 && (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{formatFileSize(fileSize)}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {objectUrl && !loading && (
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
                style={{ color: 'var(--text-primary)' }}
                aria-label={t('common:download', { defaultValue: 'Download' })}
              >
                <Download className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={handleClose}
              className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
              style={{ color: 'var(--text-primary)' }}
              aria-label={t('common:close', { defaultValue: 'Close' })}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative w-full h-full flex items-center justify-center pt-20 pb-4">
        {loading && (
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-10 h-10 animate-spin" style={{ color: 'var(--text-primary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {t('vault:viewer.loading', { defaultValue: 'Loading...' })}
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3" style={{ color: 'var(--color-error)' }}>
            <AlertCircle className="w-12 h-12" />
            <p className="text-lg">{error}</p>
            <button
              onClick={handleClose}
              className="mt-4 px-4 py-2 rounded-lg glass hover:bg-white/10 transition-colors"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('common:close', { defaultValue: 'Close' })}
            </button>
          </div>
        )}

        {!loading && !error && objectUrl && (
          <>
            {/* Image Viewer */}
            {category === 'image' && (
              <img
                src={objectUrl}
                alt={originalName}
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* Video Viewer */}
            {category === 'video' && (
              <video
                src={objectUrl}
                controls
                playsInline
                className="max-w-full max-h-full rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {t('vault:viewer.videoNotSupported', {
                  defaultValue: 'Your browser does not support video playback.',
                })}
              </video>
            )}

            {/* PDF Viewer */}
            {category === 'pdf' && (
              <iframe
                src={objectUrl}
                title={originalName}
                className="w-full h-full rounded-lg bg-white"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* Document/Other - Download prompt */}
            {!['image', 'video', 'pdf'].includes(category) && (
              <div
                className="glass rounded-xl p-8 max-w-md"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-color)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <FileText className="w-16 h-16 text-purple-400" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      {originalName}
                    </h3>
                    <p className="mb-1" style={{ color: 'var(--text-secondary)' }}>
                      {t('vault:viewer.previewNotAvailable', {
                        defaultValue: 'Preview not available for this file type',
                      })}
                    </p>
                    {fileSize > 0 && (
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatFileSize(fileSize)}</p>
                    )}
                  </div>
                  <button
                    onClick={handleDownload}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600
                               hover:from-purple-700 hover:to-blue-700 font-semibold
                               flex items-center justify-center gap-2 transition-colors"
                    style={{ color: '#ffffff' }}
                  >
                    <Download className="w-5 h-5" />
                    {t('common:download', { defaultValue: 'Download' })}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VaultViewerModal;
