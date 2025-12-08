// ============================================================================
// HOOK: useStorageIntegrity.js – Auto-Repair System for Firestore + R2
// ============================================================================

import { useState, useCallback } from 'react'
import useStore from '../state/store'
import { db } from '../firebase'
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore'

const WORKER_API_URL = import.meta.env.VITE_METADATA_API_URL || 'https://metadata-worker.your-domain.workers.dev'

/**
 * Storage Integrity Scanner and Repair System
 * Detects and repairs mismatches between Firestore and R2
 */
export function useStorageIntegrity() {
  const [scanning, setScanning] = useState(false)
  const [repairing, setRepairing] = useState(false)
  const { user, photos, setIntegrityResults, appendRepairLog } = useStore()

  /**
   * Check if a file exists in R2
   * @param {string} storagePath - The R2 storage path
   * @returns {Promise<boolean>} - True if file exists
   */
  const checkFileExists = useCallback(async (storagePath) => {
    try {
      const response = await fetch(`${WORKER_API_URL}/api/check-file?path=${encodeURIComponent(storagePath)}`)
      const result = await response.json()
      return result.exists
    } catch (error) {
      console.error('Error checking file existence:', error)
      return false
    }
  }, [])

  /**
   * Run full integrity scan
   * Checks all photos for:
   * - Missing files in R2 (Firestore entry exists but R2 file is missing)
   * - Orphaned files in R2 (R2 file exists but no Firestore entry)
   */
  const runIntegrityScan = useCallback(async () => {
    if (!user?.uid) {
      console.error('No user ID available for scan')
      return { status: 'error', message: 'User not authenticated' }
    }

    setScanning(true)
    console.log('🔍 Starting storage integrity scan...')

    try {
      // 1. Get all photos from Firestore for current user
      const photosQuery = query(
        collection(db, 'photos'),
        where('userId', '==', user.uid)
      )
      const photosSnapshot = await getDocs(photosQuery)
      const firestorePhotos = photosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      console.log(`📊 Found ${firestorePhotos.length} photos in Firestore`)

      // 2. Check each photo's storagePath in R2
      const missingFiles = []
      const validFiles = []

      for (const photo of firestorePhotos) {
        if (!photo.storagePath) {
          missingFiles.push({
            ...photo,
            issue: 'no_storage_path',
            message: 'Photo has no storagePath field'
          })
          continue
        }

        const exists = await checkFileExists(photo.storagePath)
        if (!exists) {
          missingFiles.push({
            ...photo,
            issue: 'file_missing_in_r2',
            message: 'File not found in R2 storage'
          })
        } else {
          validFiles.push(photo)
        }
      }

      console.log(`✅ Valid files: ${validFiles.length}`)
      console.log(`❌ Missing files: ${missingFiles.length}`)

      // 3. Check for orphaned files in "unassigned" folder
      // (Files in R2 that have no Firestore entry)
      let orphanFiles = []
      try {
        const response = await fetch(`${WORKER_API_URL}/api/list-orphans?userId=${user.uid}`)
        const result = await response.json()
        orphanFiles = result.orphans || []
        console.log(`🔍 Found ${orphanFiles.length} orphaned files in R2`)
      } catch (error) {
        console.warn('Could not check for orphaned files:', error)
      }

      // 4. Store results
      const results = {
        lastRun: new Date().toISOString(),
        missingFiles,
        orphanFiles,
        repaired: []
      }

      setIntegrityResults(results)

      return {
        status: 'success',
        problems: missingFiles.length + orphanFiles.length,
        missingFiles: missingFiles.length,
        orphanFiles: orphanFiles.length
      }
    } catch (error) {
      console.error('❌ Scan failed:', error)
      return {
        status: 'error',
        message: error.message
      }
    } finally {
      setScanning(false)
    }
  }, [user, checkFileExists, setIntegrityResults])

  /**
   * Repair missing files
   * Attempts to recover missing files or clean up orphaned references
   */
  const repairMissingFiles = useCallback(async (missingFiles) => {
    if (!user?.uid) return { status: 'error', message: 'User not authenticated' }
    if (!missingFiles || missingFiles.length === 0) {
      return { status: 'success', message: 'No files to repair' }
    }

    setRepairing(true)
    console.log(`🔧 Starting repair of ${missingFiles.length} missing files...`)

    try {
      const repaired = []
      const failed = []

      for (const photo of missingFiles) {
        try {
          // Strategy 1: Check if file exists in R2 but path is wrong
          // Strategy 2: Delete Firestore entry if file is truly gone

          if (photo.issue === 'file_missing_in_r2') {
            // Delete Firestore entry for missing file
            const photoRef = doc(db, 'photos', photo.id)
            await updateDoc(photoRef, {
              deleted: true,
              deletedAt: new Date().toISOString(),
              deletedReason: 'file_missing_in_storage'
            })

            repaired.push({
              photoId: photo.id,
              action: 'marked_deleted',
              message: `Marked photo ${photo.name} as deleted (file missing)`
            })

            appendRepairLog({
              timestamp: new Date().toISOString(),
              photoId: photo.id,
              action: 'marked_deleted',
              status: 'success'
            })
          }
        } catch (error) {
          console.error(`Failed to repair ${photo.id}:`, error)
          failed.push({
            photoId: photo.id,
            error: error.message
          })
        }
      }

      console.log(`✅ Repaired: ${repaired.length}, Failed: ${failed.length}`)

      return {
        status: 'success',
        repaired: repaired.length,
        failed: failed.length,
        details: { repaired, failed }
      }
    } catch (error) {
      console.error('❌ Repair failed:', error)
      return {
        status: 'error',
        message: error.message
      }
    } finally {
      setRepairing(false)
    }
  }, [user, appendRepairLog])

  /**
   * Repair orphaned files
   * Creates Firestore entries for orphaned R2 files
   */
  const repairOrphans = useCallback(async (orphanFiles) => {
    if (!user?.uid) return { status: 'error', message: 'User not authenticated' }
    if (!orphanFiles || orphanFiles.length === 0) {
      return { status: 'success', message: 'No orphans to repair' }
    }

    setRepairing(true)
    console.log(`🔧 Starting orphan repair for ${orphanFiles.length} files...`)

    try {
      const repaired = []

      for (const orphan of orphanFiles) {
        try {
          // Create Firestore entry for orphaned file
          const photoData = {
            name: orphan.name || 'Recovered Photo',
            url: orphan.url,
            userId: user.uid,
            albumId: null, // Unassigned
            storagePath: orphan.path,
            size: orphan.size || 0,
            type: orphan.type || 'image/jpeg',
            favorite: false,
            createdAt: orphan.uploadedAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            recovered: true,
            recoveredAt: new Date().toISOString()
          }

          const { addPhoto } = await import('../firebase')
          const photoId = await addPhoto(photoData)

          repaired.push({
            photoId,
            action: 'created_from_orphan',
            message: `Created Firestore entry for orphaned file ${orphan.name}`
          })

          appendRepairLog({
            timestamp: new Date().toISOString(),
            photoId,
            action: 'recovered_orphan',
            status: 'success'
          })
        } catch (error) {
          console.error(`Failed to repair orphan ${orphan.path}:`, error)
        }
      }

      console.log(`✅ Repaired ${repaired.length} orphaned files`)

      return {
        status: 'success',
        repaired: repaired.length,
        details: { repaired }
      }
    } catch (error) {
      console.error('❌ Orphan repair failed:', error)
      return {
        status: 'error',
        message: error.message
      }
    } finally {
      setRepairing(false)
    }
  }, [user, appendRepairLog])

  /**
   * Regenerate presigned URLs for all photos
   * Useful when URLs have expired or need refreshing
   */
  const regeneratePresignedUrls = useCallback(async () => {
    if (!user?.uid) return { status: 'error', message: 'User not authenticated' }

    setRepairing(true)
    console.log('🔄 Regenerating presigned URLs...')

    try {
      const response = await fetch(`${WORKER_API_URL}/api/regenerate-urls?userId=${user.uid}`, {
        method: 'POST'
      })

      const result = await response.json()

      if (result.success) {
        console.log(`✅ Regenerated ${result.count} URLs`)
        return {
          status: 'success',
          count: result.count,
          message: `Regenerated ${result.count} presigned URLs`
        }
      } else {
        throw new Error(result.error || 'Failed to regenerate URLs')
      }
    } catch (error) {
      console.error('❌ URL regeneration failed:', error)
      return {
        status: 'error',
        message: error.message
      }
    } finally {
      setRepairing(false)
    }
  }, [user])

  /**
   * Run all repairs automatically
   */
  const repairAll = useCallback(async () => {
    console.log('🔧 Starting full auto-repair...')

    // 1. Run scan
    const scanResult = await runIntegrityScan()

    if (scanResult.status !== 'success') {
      return scanResult
    }

    // 2. Get current state
    const { integrityScan } = useStore.getState()

    // 3. Repair missing files
    if (integrityScan.missingFiles.length > 0) {
      await repairMissingFiles(integrityScan.missingFiles)
    }

    // 4. Repair orphans
    if (integrityScan.orphanFiles.length > 0) {
      await repairOrphans(integrityScan.orphanFiles)
    }

    // 5. Run final scan to verify
    const finalScan = await runIntegrityScan()

    return {
      status: 'success',
      message: 'Auto-repair complete',
      final: finalScan
    }
  }, [runIntegrityScan, repairMissingFiles, repairOrphans])

  return {
    scanning,
    repairing,
    runIntegrityScan,
    repairMissingFiles,
    repairOrphans,
    regeneratePresignedUrls,
    repairAll
  }
}
