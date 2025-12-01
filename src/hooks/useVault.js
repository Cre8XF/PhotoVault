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
import { ref, uploadBytes, getBytes, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'
import useStore from '../state/store'
import {
  encryptFile,
  decryptFile,
  hashPassword,
  verifyPassword,
} from '../services/encryption'
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
   * Unlock vault with password
   */
  const unlockWithPassword = useCallback(
    async (password) => {
      try {
        const isValid = await verifyPassword(password, vaultPasswordHash)

        if (isValid) {
          const passwordHash = await hashPassword(password)
          const success = unlockVault(passwordHash)

          if (success) {
            // Store password in sessionStorage for decryption
            sessionStorage.setItem('vaultPassword', password)

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
    [vaultPasswordHash, unlockVault, showNotification, t]
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
   */
  const lockVaultSafely = useCallback(() => {
    lockVault()
    clearThumbnailCache()
    sessionStorage.removeItem('vaultPassword')
    showNotification(t('vault:notifications.vaultLocked'), 'info')
  }, [lockVault, clearThumbnailCache, showNotification, t])

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
   * Upload photos to vault
   */
  const uploadToVault = useCallback(
    async (files) => {
      if (!user || !isVaultUnlocked) {
        showNotification(t('vault:notifications.vaultLocked'), 'error')
        return
      }

      const password = sessionStorage.getItem('vaultPassword')
      if (!password) {
        showNotification(t('vault:notifications.sessionExpired'), 'error')
        lockVaultSafely()
        return
      }

      try {
        setVaultLoading(true)

        for (const file of files) {
          // Encrypt file
          const { blob: encryptedBlob, metadata: encryptionMetadata } =
            await encryptFile(file, password)

          // Generate unique ID
          const photoId = `${user.uid}_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 9)}`

          // Upload encrypted blob to Firebase Storage
          const storageRef = ref(storage, `vault/${user.uid}/${photoId}.enc`)
          await uploadBytes(storageRef, encryptedBlob)

          // Save metadata to Firestore
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
            storageRef: storageRef.fullPath,
            createdAt: serverTimestamp(),
            lastAccessedAt: serverTimestamp(),
          }

          const docRef = await addDoc(collection(db, 'vault_photos'), photoDoc)

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
        showNotification(t('vault:notifications.uploadFailed'), 'error')
      } finally {
        setVaultLoading(false)
      }
    },
    [
      user,
      isVaultUnlocked,
      addPhotoToVault,
      setVaultLoading,
      showNotification,
      lockVaultSafely,
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

        // Delete from Storage
        const storageRef = ref(storage, photo.storageRef)
        await deleteObject(storageRef)

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
   */
  const getDecryptedPhotoUrl = useCallback(
    async (photo) => {
      if (!isVaultUnlocked) return null

      // Check cache first
      const cached = getCachedThumbnail(photo.id)
      if (cached) return cached

      const password = sessionStorage.getItem('vaultPassword')
      if (!password) {
        lockVaultSafely()
        return null
      }

      try {
        // Download encrypted blob
        const storageRef = ref(storage, photo.storageRef)
        const encryptedBytes = await getBytes(storageRef)
        const encryptedBlob = new Blob([encryptedBytes])

        // Decrypt
        const decryptedBlob = await decryptFile(
          encryptedBlob,
          photo.cryptoMetadata,
          password
        )

        // Create blob URL
        const blobUrl = URL.createObjectURL(decryptedBlob)

        // Cache it
        cacheDecryptedThumbnail(photo.id, blobUrl)

        // Update last accessed time
        await updateDoc(doc(db, 'vault_photos', photo.id), {
          lastAccessedAt: serverTimestamp(),
        })

        return blobUrl
      } catch (error) {
        console.error('Failed to decrypt photo:', error)
        if (error.code === 'INVALID_PASSWORD') {
          lockVaultSafely()
        }
        return null
      }
    },
    [
      isVaultUnlocked,
      getCachedThumbnail,
      cacheDecryptedThumbnail,
      lockVaultSafely,
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
          // Delete from Storage
          const storageRef = ref(storage, photo.storageRef)
          await deleteObject(storageRef)

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
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isVaultUnlocked) {
        lockVaultSafely()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isVaultUnlocked, lockVaultSafely])

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
