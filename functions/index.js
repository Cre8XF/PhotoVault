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
