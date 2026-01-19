// ============================================================================
// useVault Hook - Phase 3.1: Vault Management
// ============================================================================
import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db, auth } from '../firebase'
import useStore from '../state/store'
import {
  encryptFile,
  decryptFile,
  hashPassword,
  verifyPassword,
} from '../services/encryption'
import {
  uploadVaultBlob,
  fetchVaultBlob,
  deleteVaultBlob,
  isVaultApiConfigured,
} from '../utils/vaultApi'
import { Capacitor } from '@capacitor/core'

// Først deklarer variabelen
let NativeBiometric = null

// Dynamisk import hvis vi er på native-plattform
if (Capacitor.isNativePlatform()) {
  import('capacitor-native-biometric')
    .then((mod) => {
      NativeBiometric = mod.NativeBiometric
    })
    .catch(() => {
      console.log('NativeBiometric not available')
    })
}

/**
 * Custom hook for vault management
 * Handles encrypted photo storage, unlock/lock, and biometric auth
 */
export const useVault = () => {
  const { t } = useTranslation(['vault', 'common'])

  // Zustand store selectors
  const user = useStore((state) => state.user)
  const isVaultUnlocked = useStore((state) => state.isVaultUnlocked)
  const vaultPhotos = useStore((state) => state.vaultPhotos)
  const vaultSettings = useStore((state) => state.vaultSettings)
  const vaultPasswordHash = useStore((state) => state.vaultPasswordHash)
  const vaultPassword = useStore((state) => state.vaultPassword) // In-memory only
  const vaultLoading = useStore((state) => state.vaultLoading)

  // Actions
  const setupVault = useStore((state) => state.setupVault)
  const unlockVault = useStore((state) => state.unlockVault)
  const lockVault = useStore((state) => state.lockVault)
  const addPhotoToVault = useStore((state) => state.addPhotoToVault)
  const removePhotoFromVault = useStore((state) => state.removePhotoFromVault)
  const setVaultPhotos = useStore((state) => state.setVaultPhotos)
  const updateVaultSettings = useStore((state) => state.updateVaultSettings)
  const updateActivityTime = useStore((state) => state.updateActivityTime)
  const checkAutoLock = useStore((state) => state.checkAutoLock)
  const resetVault = useStore((state) => state.resetVault)
  const setVaultLoading = useStore((state) => state.setVaultLoading)
  const showNotification = useStore((state) => state.showNotification)
  const cacheDecryptedThumbnail = useStore(
    (state) => state.cacheDecryptedThumbnail
  )
  const getCachedThumbnail = useStore((state) => state.getCachedThumbnail)
  const clearThumbnailCache = useStore((state) => state.clearThumbnailCache)
  const ensureVaultUnlocked = useStore((state) => state.ensureVaultUnlocked)

  // Auto-lock timer
  const autoLockTimerRef = useRef(null)

  /**
   * Set up vault for the first time
   */
  const setupVaultWithPassword = useCallback(
    async (password, settings = {}) => {
      try {
        const passwordHash = await hashPassword(password)
        setupVault(passwordHash, settings)

        // Store password temporarily in sessionStorage for biometric setup
        if (settings.biometricEnabled && NativeBiometric) {
          try {
            await NativeBiometric.setCredentials({
              username: 'vault',
              password: password,
              server: 'photovault.vault',
            })
          } catch (error) {
            console.error('Failed to store biometric credentials:', error)
          }
        }

        showNotification(t('vault:notifications.vaultSetupSuccess'), 'success')
        return true
      } catch (error) {
        console.error('Vault setup failed:', error)
        showNotification(t('vault:notifications.vaultSetupFailed'), 'error')
        return false
      }
    },
    [setupVault, showNotification, t]
  )
  /**
   * Load vault photos from Firestore
   */
  const loadVaultPhotos = useCallback(async () => {
    if (!user) return

    try {
      setVaultLoading(true)
      const q = query(
        collection(db, 'vault_photos'),
        where('userId', '==', user.uid)
      )

      const querySnapshot = await getDocs(q)
      const photos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setVaultPhotos(photos)
    } catch (error) {
      console.error('Failed to load vault photos:', error)
      showNotification(t('vault:notifications.loadFailed'), 'error')
    } finally {
      setVaultLoading(false)
    }
  }, [user, setVaultPhotos, setVaultLoading, showNotification, t])

  /**
   * Unlock vault with password
   * SECURITY: Password stored in memory only, never persisted
   */
  const unlockWithPassword = useCallback(
    async (password) => {
      try {
        const isValid = await verifyPassword(password, vaultPasswordHash)

        if (isValid) {
          const passwordHash = await hashPassword(password)
          const success = unlockVault(passwordHash, password) // Pass password for memory storage

          if (success) {
            // Load vault photos
            await loadVaultPhotos()

            showNotification(t('vault:notifications.vaultUnlocked'), 'success')
            return true
          }
        }

        showNotification(t('vault:notifications.invalidPassword'), 'error')
        return false
      } catch (error) {
        console.error('Unlock failed:', error)
        showNotification(t('vault:notifications.unlockFailed'), 'error')
        return false
      }
    },
    [vaultPasswordHash, unlockVault, loadVaultPhotos, showNotification, t]
  )

  /**
   * Unlock vault with biometric
   */
  const unlockWithBiometric = useCallback(async () => {
    if (!NativeBiometric) {
      showNotification(t('vault:notifications.biometricNotAvailable'), 'error')
      return false
    }

    try {
      const result = await NativeBiometric.verifyIdentity({
        reason: t('vault:biometric.unlockReason'),
        title: t('vault:biometric.unlockTitle'),
        subtitle: '',
        description: '',
      })

      if (result.verified) {
        const credentials = await NativeBiometric.getCredentials({
          server: 'photovault.vault',
        })

        if (credentials && credentials.password) {
          return await unlockWithPassword(credentials.password)
        }
      }

      return false
    } catch (error) {
      console.error('Biometric unlock failed:', error)
      showNotification(t('vault:notifications.biometricFailed'), 'error')
      return false
    }
  }, [unlockWithPassword, showNotification, t])

  /**
   * Lock vault and clear sensitive data
   * SECURITY: Password cleared from memory in vaultSlice.lockVault()
   * FIX 4: Improved UX clarity when vault locks
   */
  const lockVaultSafely = useCallback(() => {
    lockVault()
    clearThumbnailCache()
    // FIX 4: Clear notification that vault has been locked
    showNotification(
      t('vault:notifications.vaultLocked', {
        defaultValue: 'Vault locked. Your encrypted files are secure.'
      }),
      'info'
    )
  }, [lockVault, clearThumbnailCache, showNotification, t])

  /**
   * Upload photos to vault
   * SECURITY: Uses password from memory (Zustand state)
   * FIX 3: Use single source of truth via ensureVaultUnlocked
   */
  const uploadToVault = useCallback(
    async (files) => {
      // FIX 3: Use centralized unlock state check
      if (!user) {
        showNotification(t('vault:notifications.vaultLocked'), 'error')
        return
      }

      // Check vault unlock state with consistency enforcement
      if (!ensureVaultUnlocked()) {
        // FIX 4: Clear notification when vault is locked
        showNotification(
          t('vault:notifications.vaultLocked', {
            defaultValue: 'Vault is locked. Please unlock the vault to upload files.'
          }),
          'error'
        )
        return
      }

      // Check if Vault API is configured
      if (!isVaultApiConfigured()) {
        showNotification(
          'Vault backend not configured. Please try again later.',
          'error'
        )
        return
      }

      try {
        setVaultLoading(true)

        for (const file of files) {
          // Encrypt file
          const { blob: encryptedBlob, metadata: encryptionMetadata } =
            await encryptFile(file, vaultPassword)

          // Generate unique ID
          const photoId = `${user.uid}_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 9)}`

          // Save metadata to Firestore first
          const photoDoc = {
            userId: user.uid,
            encryptedMetadata: {
              originalName: encryptionMetadata.originalName,
              mimeType: encryptionMetadata.mimeType,
              size: encryptionMetadata.size,
            },
            cryptoMetadata: {
              salt: encryptionMetadata.salt,
              iv: encryptionMetadata.iv,
              algorithm: encryptionMetadata.algorithm,
            },
            storageRef: `vault/${user.uid}/${photoId}.enc`, // Keep for backward compat
            createdAt: serverTimestamp(),
            lastAccessedAt: serverTimestamp(),
          }

          const docRef = await addDoc(collection(db, 'vault_photos'), photoDoc)

          // Get Firebase auth token
          const currentUser = auth.currentUser
          if (!currentUser) {
            throw new Error('Not authenticated')
          }
          const token = await currentUser.getIdToken()

          // Convert encrypted blob to ArrayBuffer
          const bytes = await encryptedBlob.arrayBuffer()

          // Upload encrypted blob to R2 via Worker
          await uploadVaultBlob({
            id: docRef.id,
            token,
            bytes,
            fileName: encryptionMetadata.originalName,
            fileType: encryptionMetadata.mimeType,
          })

          addPhotoToVault({
            id: docRef.id,
            ...photoDoc,
          })
        }

        showNotification(
          t('vault:notifications.uploadSuccess', { count: files.length }),
          'success'
        )
      } catch (error) {
        console.error('Upload to vault failed:', error)
        if (error.message === 'VAULT_API_NOT_CONFIGURED') {
          showNotification(
            'Vault backend not configured. Please try again later.',
            'error'
          )
        } else {
          showNotification(t('vault:notifications.uploadFailed'), 'error')
        }
      } finally {
        setVaultLoading(false)
      }
    },
    [
      user,
      ensureVaultUnlocked,
      addPhotoToVault,
      setVaultLoading,
      showNotification,
      t,
    ]
  )

  /**
   * Delete photo from vault
   */
  const deleteFromVault = useCallback(
    async (photoId) => {
      if (!user || !isVaultUnlocked) return

      try {
        const photo = vaultPhotos.find((p) => p.id === photoId)
        if (!photo) return

        // Delete from R2 via Worker (best effort)
        if (isVaultApiConfigured()) {
          try {
            const currentUser = auth.currentUser
            if (!currentUser) {
              throw new Error('Not authenticated')
            }
            const token = await currentUser.getIdToken()
            await deleteVaultBlob({ id: photoId, token })
          } catch (error) {
            console.warn('Failed to delete from R2:', error)
            // Continue with Firestore deletion even if R2 delete fails
          }
        }

        // Delete from Firestore
        await deleteDoc(doc(db, 'vault_photos', photoId))

        // Remove from state
        removePhotoFromVault(photoId)

        showNotification(t('vault:notifications.deleteSuccess'), 'success')
      } catch (error) {
        console.error('Delete from vault failed:', error)
        showNotification(t('vault:notifications.deleteFailed'), 'error')
      }
    },
    [
      user,
      isVaultUnlocked,
      vaultPhotos,
      removePhotoFromVault,
      showNotification,
      t,
    ]
  )

  /**
   * Decrypt and get photo blob URL
   * SECURITY: Uses password from memory (Zustand state)
   * NOTE: This function now throws errors instead of auto-locking
   * Callers should handle errors and prompt user to re-unlock if needed
   */
  const getDecryptedPhotoUrl = useCallback(
    async (photo) => {
      if (!isVaultUnlocked) {
        throw new Error('VAULT_LOCKED')
      }

      // Check cache first
      const cached = getCachedThumbnail(photo.id)
      if (cached) return cached

      if (!vaultPassword) {
        // Don't auto-lock - throw error so caller can handle
        throw new Error('SESSION_EXPIRED')
      }

      // Check if Vault API is configured
      if (!isVaultApiConfigured()) {
        throw new Error('VAULT_API_NOT_CONFIGURED')
      }

      try {
        // Get Firebase auth token
        const currentUser = auth.currentUser
        if (!currentUser) {
          throw new Error('Not authenticated')
        }
        const token = await currentUser.getIdToken()

        // Download encrypted blob from R2 via Worker
        const encryptedBuffer = await fetchVaultBlob({
          id: photo.id,
          token,
        })
        const encryptedBlob = new Blob([encryptedBuffer])

        // Decrypt
        const decryptedBlob = await decryptFile(
          encryptedBlob,
          photo.cryptoMetadata,
          vaultPassword
        )

        // Create blob URL
        const blobUrl = URL.createObjectURL(decryptedBlob)

        // Cache it
        cacheDecryptedThumbnail(photo.id, blobUrl)

        // Update last accessed time (don't await to improve performance)
        updateDoc(doc(db, 'vault_photos', photo.id), {
          lastAccessedAt: serverTimestamp(),
        }).catch((err) => console.warn('Failed to update lastAccessedAt:', err))

        return blobUrl
      } catch (error) {
        console.error('Failed to decrypt photo:', error)

        // Don't auto-lock - throw error with proper code
        if (
          error.code === 'INVALID_PASSWORD' ||
          error.message.includes('password')
        ) {
          throw new Error('INVALID_PASSWORD')
        }

        if (error.message === 'SESSION_EXPIRED') {
          throw error
        }

        if (error.message === 'VAULT_API_NOT_CONFIGURED') {
          throw error
        }

        // Network or other errors
        throw new Error('DECRYPT_FAILED')
      }
    },
    [
      user,
      isVaultUnlocked,
      vaultPassword,
      getCachedThumbnail,
      cacheDecryptedThumbnail,
    ]
  )

  /**
   * Reset vault and delete all vault data
   */
  const resetVaultCompletely = useCallback(async () => {
    if (!user) return

    try {
      setVaultLoading(true)

      // Delete all vault photos
      for (const photo of vaultPhotos) {
        try {
          // Delete from R2 via Worker (best effort)
          if (isVaultApiConfigured()) {
            try {
              const currentUser = auth.currentUser
              if (!currentUser) {
                throw new Error('Not authenticated')
              }
              const token = await currentUser.getIdToken()
              await deleteVaultBlob({ id: photo.id, token })
            } catch (error) {
              console.warn('Failed to delete from R2:', error)
              // Continue with Firestore deletion even if R2 delete fails
            }
          }

          // Delete from Firestore
          await deleteDoc(doc(db, 'vault_photos', photo.id))
        } catch (error) {
          console.error('Failed to delete photo:', error)
        }
      }

      // Reset vault state
      resetVault()

      showNotification(t('vault:notifications.vaultReset'), 'success')
    } catch (error) {
      console.error('Vault reset failed:', error)
      showNotification(t('vault:notifications.resetFailed'), 'error')
    } finally {
      setVaultLoading(false)
    }
  }, [user, vaultPhotos, resetVault, setVaultLoading, showNotification, t])

  /**
   * Reset activity timer
   */
  const resetActivityTimer = useCallback(() => {
    updateActivityTime()
  }, [updateActivityTime])

  /**
   * Check biometric availability
   */
  const checkBiometricAvailability = useCallback(async () => {
    if (!NativeBiometric) return false

    try {
      const result = await NativeBiometric.isAvailable()
      return result.isAvailable
    } catch (error) {
      return false
    }
  }, [])

  /**
   * Auto-lock timer effect
   */
  useEffect(() => {
    if (isVaultUnlocked && vaultSettings.autoLockTimeout > 0) {
      // Set up auto-lock timer
      autoLockTimerRef.current = setInterval(() => {
        const shouldLock = checkAutoLock()
        if (shouldLock) {
          lockVaultSafely()
        }
      }, 5000) // Check every 5 seconds

      return () => {
        if (autoLockTimerRef.current) {
          clearInterval(autoLockTimerRef.current)
        }
      }
    }
  }, [
    isVaultUnlocked,
    vaultSettings.autoLockTimeout,
    checkAutoLock,
    lockVaultSafely,
  ])

  /**
   * Lock vault on page visibility change
   * FIX: Removed immediate lock on document.hidden to prevent mobile file picker
   * from invalidating vault session. Auto-lock still active via inactivity timer.
   */
  // REMOVED: Aggressive page visibility lock
  // This was causing vault to lock when mobile file pickers opened
  // Vault now locks only via:
  // 1. Inactivity timeout (auto-lock timer)
  // 2. Manual lock button
  // 3. Explicit user action

  return {
    // State
    isVaultUnlocked,
    vaultPhotos,
    vaultSettings,
    vaultLoading,
    isVaultSetup: vaultSettings.isVaultSetup,

    // Actions
    setupVaultWithPassword,
    unlockWithPassword,
    unlockWithBiometric,
    lockVault: lockVaultSafely,
    uploadToVault,
    deleteFromVault,
    getDecryptedPhotoUrl,
    resetVault: resetVaultCompletely,
    updateVaultSettings,
    resetActivityTimer,
    checkBiometricAvailability,
    loadVaultPhotos,
  }
}
