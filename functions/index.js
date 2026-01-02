const functions = require('firebase-functions')
const admin = require('firebase-admin')

// Initialize admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()
const storage = admin.storage()

/**
 * Clean up deleted photos older than 7 days
 * Runs daily at 02:00 Oslo time
 */
exports.cleanupDeletedPhotos = functions
  .region('europe-west1') // Use European region for GDPR compliance
  .pubsub
  .schedule('every day 02:00')
  .timeZone('Europe/Oslo')
  .onRun(async (context) => {
    console.log('🗑️ [Cleanup] Starting deleted photos cleanup...')
    const startTime = Date.now()

    // Calculate cutoff date (7 days ago)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const cutoffDate = sevenDaysAgo.toISOString()

    console.log(`🗑️ [Cleanup] Cutoff date: ${cutoffDate}`)

    try {
      // Query deleted photos older than 7 days
      const snapshot = await db.collection('photos')
        .where('deleted', '==', true)
        .where('deletedAt', '<=', cutoffDate)
        .get()

      console.log(`🗑️ [Cleanup] Found ${snapshot.size} photos to delete`)

      if (snapshot.empty) {
        console.log('✅ [Cleanup] No photos to clean up')
        return null
      }

      // Process deletions
      const batch = db.batch()
      const storagePromises = []
      const albumUpdates = new Map() // Track album photoCount decrements
      const userUpdates = new Map() // Track user storageUsed decrements

      snapshot.forEach((doc) => {
        const photo = doc.data()
        console.log(`🗑️ [Cleanup] Processing: ${photo.name} (${photo.id})`)

        // 1. Delete from storage
        if (photo.storagePath) {
          // R2 photos don't have storagePath in Firebase Storage
          // They're deleted via R2 API in frontend, so skip here
          if (photo.storageBackend === 'firebase') {
            const fileRef = storage.bucket().file(photo.storagePath)
            storagePromises.push(
              fileRef.delete().catch(err => {
                console.warn(`⚠️ [Cleanup] Failed to delete ${photo.storagePath}:`, err.message)
              })
            )
          }
        }

        // 2. Delete thumbnail if video
        if (photo.thumbnailUrl && photo.type === 'video') {
          // Extract path from thumbnailUrl if possible
          // Note: This is best-effort, thumbnails might be in R2
        }

        // 3. Track album photoCount decrement
        if (photo.albumId) {
          const currentCount = albumUpdates.get(photo.albumId) || 0
          albumUpdates.set(photo.albumId, currentCount - 1)
        }

        // 4. Track user storageUsed decrement
        if (photo.userId && photo.size) {
          const currentSize = userUpdates.get(photo.userId) || 0
          userUpdates.set(photo.userId, currentSize - photo.size)
        }

        // 5. Delete Firestore document
        batch.delete(doc.ref)
      })

      // Apply album photoCount updates
      albumUpdates.forEach((decrement, albumId) => {
        const albumRef = db.collection('albums').doc(albumId)
        batch.update(albumRef, {
          photoCount: admin.firestore.FieldValue.increment(decrement)
        })
      })

      // Apply user storageUsed updates
      userUpdates.forEach((decrement, userId) => {
        const userRef = db.collection('users').doc(userId)
        batch.update(userRef, {
          storageUsed: admin.firestore.FieldValue.increment(decrement)
        })
      })

      // Execute batch
      await Promise.all([
        ...storagePromises,
        batch.commit()
      ])

      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      console.log(`✅ [Cleanup] Complete in ${duration}s`)
      console.log(`✅ [Cleanup] Deleted ${snapshot.size} photos`)
      console.log(`✅ [Cleanup] Updated ${albumUpdates.size} albums`)
      console.log(`✅ [Cleanup] Updated ${userUpdates.size} users`)

      return {
        success: true,
        photosDeleted: snapshot.size,
        albumsUpdated: albumUpdates.size,
        usersUpdated: userUpdates.size,
        duration
      }
    } catch (error) {
      console.error('❌ [Cleanup] Failed:', error)
      throw error
    }
  })

/**
 * Scheduled function: Reconcile user counters
 * Runs every Sunday at 03:00 Oslo time
 *
 * Checks:
 * 1. currentAlbumCount matches actual album count
 * 2. photoCount in each album matches actual photo count
 * 3. storageUsed matches sum of photo sizes
 */
exports.reconcileCounters = functions
  .region('europe-west1') // Oslo region
  .pubsub
  .schedule('0 3 * * 0') // Every Sunday at 03:00
  .timeZone('Europe/Oslo')
  .onRun(async (context) => {
    console.log('🔄 Starting counter reconciliation...')
    const startTime = Date.now()

    let usersProcessed = 0
    let issuesFound = 0
    let issuesFixed = 0

    try {
      // Get all users
      const usersSnapshot = await db.collection('users').get()

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id
        const userData = userDoc.data()
        usersProcessed++

        // Skip admins
        if (userData.role === 'admin') {
          console.log(`⏭️ Skipping admin user: ${userId}`)
          continue
        }

        // ===== 1. RECONCILE ALBUM COUNT =====
        const albumsSnapshot = await db
          .collection('albums')
          .where('userId', '==', userId)
          .get()

        const actualAlbumCount = albumsSnapshot.size
        const storedAlbumCount = userData.currentAlbumCount || 0

        if (actualAlbumCount !== storedAlbumCount) {
          console.warn(`⚠️ User ${userId} album count mismatch:`, {
            stored: storedAlbumCount,
            actual: actualAlbumCount,
            email: userData.email
          })

          issuesFound++

          // Fix the count
          await userDoc.ref.update({
            currentAlbumCount: actualAlbumCount,
            lastReconciled: admin.firestore.FieldValue.serverTimestamp()
          })

          issuesFixed++
        }

        // ===== 2. RECONCILE PHOTO COUNTS IN ALBUMS =====
        for (const albumDoc of albumsSnapshot.docs) {
          const albumId = albumDoc.id
          const albumData = albumDoc.data()

          // Count photos in this album (from top-level photos collection)
          const photosSnapshot = await db
            .collection('photos')
            .where('userId', '==', userId)
            .where('albumId', '==', albumId)
            .where('deleted', '==', false) // Only count non-deleted
            .get()

          const actualPhotoCount = photosSnapshot.size
          const storedPhotoCount = albumData.photoCount || 0

          if (actualPhotoCount !== storedPhotoCount) {
            console.warn(`⚠️ Album ${albumId} photo count mismatch:`, {
              stored: storedPhotoCount,
              actual: actualPhotoCount,
              albumName: albumData.name
            })

            issuesFound++

            // Fix the count
            await albumDoc.ref.update({
              photoCount: actualPhotoCount,
              lastReconciled: admin.firestore.FieldValue.serverTimestamp()
            })

            issuesFixed++
          }
        }

        // ===== 3. RECONCILE STORAGE USED =====
        const allPhotosSnapshot = await db
          .collection('photos')
          .where('userId', '==', userId)
          .where('deleted', '==', false)
          .get()

        let calculatedStorageUsed = 0
        allPhotosSnapshot.docs.forEach(photoDoc => {
          const photoData = photoDoc.data()
          calculatedStorageUsed += photoData.size || 0
        })

        const storedStorageUsed = userData.storageUsed || 0
        const difference = Math.abs(calculatedStorageUsed - storedStorageUsed)

        // Allow 1MB margin of error (compression, metadata, etc.)
        if (difference > 1048576) {
          console.warn(`⚠️ User ${userId} storage mismatch:`, {
            stored: storedStorageUsed,
            calculated: calculatedStorageUsed,
            difference: difference
          })

          issuesFound++

          // Fix storage
          await userDoc.ref.update({
            storageUsed: calculatedStorageUsed,
            lastReconciled: admin.firestore.FieldValue.serverTimestamp()
          })

          issuesFixed++
        }
      }

      // Log summary
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      console.log('✅ Reconciliation complete:', {
        usersProcessed,
        issuesFound,
        issuesFixed,
        duration: `${duration}s`
      })

      // Store reconciliation report
      await db.collection('system').doc('lastReconciliation').set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        usersProcessed,
        issuesFound,
        issuesFixed,
        duration: parseFloat(duration)
      })

      return {
        success: true,
        usersProcessed,
        issuesFound,
        issuesFixed,
        duration
      }

    } catch (error) {
      console.error('❌ Reconciliation error:', error)
      throw error
    }
  })

/**
 * Callable function: Manual reconciliation
 * Triggered by admin from frontend
 */
exports.manualReconcile = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated'
      )
    }

    // Check admin role
    let userDoc
    try {
      userDoc = await db.collection('users').doc(context.auth.uid).get()
    } catch (error) {
      console.error('❌ Failed to fetch user document:', error)
      throw new functions.https.HttpsError(
        'internal',
        'Failed to verify user permissions'
      )
    }

    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Must be admin'
      )
    }

    console.log(`🔄 Manual reconciliation triggered by admin: ${context.auth.uid}`)
    const startTime = Date.now()

    let usersProcessed = 0
    let issuesFound = 0
    let issuesFixed = 0

    try {
      // Get all users
      const usersSnapshot = await db.collection('users').get()

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id
        const userData = userDoc.data()
        usersProcessed++

        // Skip admins
        if (userData.role === 'admin') {
          console.log(`⏭️ Skipping admin user: ${userId}`)
          continue
        }

        // ===== 1. RECONCILE ALBUM COUNT =====
        const albumsSnapshot = await db
          .collection('albums')
          .where('userId', '==', userId)
          .get()

        const actualAlbumCount = albumsSnapshot.size
        const storedAlbumCount = userData.currentAlbumCount || 0

        if (actualAlbumCount !== storedAlbumCount) {
          console.warn(`⚠️ User ${userId} album count mismatch:`, {
            stored: storedAlbumCount,
            actual: actualAlbumCount,
            email: userData.email
          })

          issuesFound++

          // Fix the count
          await userDoc.ref.update({
            currentAlbumCount: actualAlbumCount,
            lastReconciled: admin.firestore.FieldValue.serverTimestamp()
          })

          issuesFixed++
        }

        // ===== 2. RECONCILE PHOTO COUNTS IN ALBUMS =====
        for (const albumDoc of albumsSnapshot.docs) {
          const albumId = albumDoc.id
          const albumData = albumDoc.data()

          // Count photos in this album
          const photosSnapshot = await db
            .collection('photos')
            .where('userId', '==', userId)
            .where('albumId', '==', albumId)
            .where('deleted', '==', false)
            .get()

          const actualPhotoCount = photosSnapshot.size
          const storedPhotoCount = albumData.photoCount || 0

          if (actualPhotoCount !== storedPhotoCount) {
            console.warn(`⚠️ Album ${albumId} photo count mismatch:`, {
              stored: storedPhotoCount,
              actual: actualPhotoCount,
              albumName: albumData.name
            })

            issuesFound++

            // Fix the count
            await albumDoc.ref.update({
              photoCount: actualPhotoCount,
              lastReconciled: admin.firestore.FieldValue.serverTimestamp()
            })

            issuesFixed++
          }
        }

        // ===== 3. RECONCILE STORAGE USED =====
        const allPhotosSnapshot = await db
          .collection('photos')
          .where('userId', '==', userId)
          .where('deleted', '==', false)
          .get()

        let calculatedStorageUsed = 0
        allPhotosSnapshot.docs.forEach(photoDoc => {
          const photoData = photoDoc.data()
          calculatedStorageUsed += photoData.size || 0
        })

        const storedStorageUsed = userData.storageUsed || 0
        const difference = Math.abs(calculatedStorageUsed - storedStorageUsed)

        // Allow 1MB margin of error
        if (difference > 1048576) {
          console.warn(`⚠️ User ${userId} storage mismatch:`, {
            stored: storedStorageUsed,
            calculated: calculatedStorageUsed,
            difference: difference
          })

          issuesFound++

          // Fix storage
          await userDoc.ref.update({
            storageUsed: calculatedStorageUsed,
            lastReconciled: admin.firestore.FieldValue.serverTimestamp()
          })

          issuesFixed++
        }
      }

      // Log summary
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      console.log('✅ Manual reconciliation complete:', {
        usersProcessed,
        issuesFound,
        issuesFixed,
        duration: `${duration}s`
      })

      // Store reconciliation report
      await db.collection('system').doc('lastReconciliation').set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        usersProcessed,
        issuesFound,
        issuesFixed,
        duration: parseFloat(duration),
        triggeredBy: context.auth.uid
      })

      return {
        success: true,
        message: `Reconciliation complete! Processed ${usersProcessed} users, found ${issuesFound} issues, fixed ${issuesFixed}.`,
        usersProcessed,
        issuesFound,
        issuesFixed,
        duration
      }

    } catch (error) {
      console.error('❌ Manual reconciliation error:', error)
      throw new functions.https.HttpsError('internal', error.message)
    }
  })
