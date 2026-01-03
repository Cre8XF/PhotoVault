/**
 * ============================================================================
 * PhotoVault Photo Order Migration Script
 * ============================================================================
 *
 * PURPOSE:
 * Add 'order' field to existing photos that don't have it.
 * - Sets order based on existing dateTaken/displayDate/createdAt
 * - Ensures stable sorting for manual reordering feature
 * - Only migrates non-deleted photos (deleted === false)
 * - Batches updates to respect Firestore limits (500 writes per batch)
 *
 * USAGE:
 * 1. Ensure GOOGLE_APPLICATION_CREDENTIALS is set
 * 2. Run: node scripts/migrate-photo-order.mjs
 *
 * ============================================================================
 */

import admin from 'firebase-admin'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env.local (or .env)
dotenv.config({ path: resolve(__dirname, '../.env.local') })
dotenv.config({ path: resolve(__dirname, '../.env') })

// Initialize Firebase Admin SDK
// This uses GOOGLE_APPLICATION_CREDENTIALS environment variable automatically
console.log('🔧 Initializing Firebase Admin SDK...')

try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  })
  console.log('✅ Firebase Admin SDK initialized successfully')
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message)
  console.error('\n💡 Make sure GOOGLE_APPLICATION_CREDENTIALS is set:')
  console.error(
    '   Windows: $env:GOOGLE_APPLICATION_CREDENTIALS="path\\to\\service-account.json"'
  )
  console.error(
    '   Mac/Linux: export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"'
  )
  process.exit(1)
}

const db = admin.firestore()

/**
 * Resolve photo date using priority order
 */
function resolvePhotoDate(photo) {
  const dateTaken = photo.dateTaken ? new Date(photo.dateTaken) : null
  const displayDate = photo.displayDate ? new Date(photo.displayDate) : null
  const takenAt = photo.takenAt ? new Date(photo.takenAt) : null
  const uploadedAt = photo.uploadedAt ? new Date(photo.uploadedAt) : null
  const createdAt = photo.createdAt ? new Date(photo.createdAt) : null

  // Priority order: dateTaken > displayDate > takenAt > uploadedAt > createdAt
  return (
    dateTaken || displayDate || takenAt || uploadedAt || createdAt || new Date()
  )
}

/**
 * Main migration function
 */
async function migratePhotoOrder() {
  console.log('🚀 Starting photo order migration...\n')
  console.log('📋 Migration Logic:')
  console.log('   • Only migrate non-deleted photos (deleted: false)')
  console.log('   • Set order based on dateTaken/displayDate/createdAt')
  console.log('   • Use timestamp value for stable ordering')
  console.log('   • Batch updates in chunks of 500')
  console.log('')

  try {
    // Get all non-deleted photos without order field
    const photosRef = db.collection('photos')
    const snapshot = await photosRef.where('deleted', '==', false).get()

    if (snapshot.empty) {
      console.log('⚠️  No photos found in database.')
      return
    }

    console.log(`📊 Found ${snapshot.docs.length} total photos\n`)

    // Filter photos that need migration (no order field or order is null)
    const photosToMigrate = snapshot.docs.filter((photoDoc) => {
      const data = photoDoc.data()
      return data.order === undefined || data.order === null
    })

    if (photosToMigrate.length === 0) {
      console.log('✨ All photos already have order field. Nothing to migrate.')
      return
    }

    console.log(`📝 Need to migrate ${photosToMigrate.length} photos\n`)

    // Sort photos by date first (to ensure consistent order assignment)
    const sortedPhotos = photosToMigrate
      .map((photoDoc) => ({
        id: photoDoc.id,
        data: photoDoc.data(),
      }))
      .sort((a, b) => {
        const dateA = resolvePhotoDate(a.data)
        const dateB = resolvePhotoDate(b.data)
        return dateA - dateB
      })

    let updated = 0
    let errors = 0
    const BATCH_SIZE = 500

    // Process in batches of 500
    for (let i = 0; i < sortedPhotos.length; i += BATCH_SIZE) {
      const batch = db.batch()
      const chunk = sortedPhotos.slice(i, i + BATCH_SIZE)

      console.log(
        `\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${
          chunk.length
        } photos)`
      )

      for (const photo of chunk) {
        try {
          const photoRef = db.collection('photos').doc(photo.id)
          const photoDate = resolvePhotoDate(photo.data)
          const orderValue = photoDate.getTime()

          batch.update(photoRef, {
            order: orderValue,
            updatedAt: new Date().toISOString(),
          })

          updated++
          const photoName = photo.data.name || 'Unknown'
          console.log(
            `   ✅ ${photoName}: order=${orderValue} (${photoDate.toISOString()})`
          )
        } catch (error) {
          errors++
          console.error(`   ❌ ${photo.id}: ${error.message}`)
        }
      }

      // Commit batch
      try {
        await batch.commit()
        console.log(`   💾 Batch committed successfully`)
      } catch (error) {
        errors += chunk.length
        console.error(`   ❌ Batch commit failed: ${error.message}`)
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 MIGRATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Successfully updated: ${updated}`)
    console.log(`❌ Errors:               ${errors}`)
    console.log(`📦 Total photos:          ${snapshot.docs.length}`)
    console.log(`📝 Needed migration:      ${photosToMigrate.length}`)
    console.log('='.repeat(60))

    if (updated > 0) {
      console.log('\n✨ Migration completed successfully!')
      console.log('\n📝 NEXT STEPS:')
      console.log('   1. Test manual ordering in the app')
      console.log('   2. Verify photos can be dragged and reordered')
      console.log('   3. Check that order persists after page refresh')
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migratePhotoOrder()
  .then(() => {
    console.log('\n👋 Migration script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
