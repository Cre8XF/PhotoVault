// ============================================================================
// Photo Migrations - Phase 4B
// ============================================================================
import { getDocs, collection, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { devLog } from './log'

/**
 * Migration: Add deleted field to all existing photos
 * Sets deleted: false for all photos that don't have this field
 * Run this ONCE before deploying trash/restore feature
 */
export async function migratePhotosAddDeletedField() {
  try {
    console.log('🔧 Starting migration: Adding deleted field to photos...')

    const photosSnapshot = await getDocs(collection(db, 'photos'))
    const batch = writeBatch(db)

    let count = 0
    let alreadyHasField = 0

    photosSnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data()

      // Only update if deleted field is missing
      if (data.deleted === undefined) {
        batch.update(docSnapshot.ref, {
          deleted: false,
          updatedAt: new Date().toISOString()
        })
        count++

        if (import.meta.env.DEV) {
          devLog(`  ✅ Adding deleted:false to photo: ${docSnapshot.id}`)
        }
      } else {
        alreadyHasField++
      }
    })

    if (count > 0) {
      console.log(`📝 Committing batch update for ${count} photos...`)
      await batch.commit()
      console.log(`✅ Migration complete: ${count} photos updated`)
    } else {
      console.log(`✅ No migration needed - all photos already have deleted field`)
    }

    console.log(`📊 Migration summary:`)
    console.log(`   - Total photos: ${photosSnapshot.size}`)
    console.log(`   - Updated: ${count}`)
    console.log(`   - Already had field: ${alreadyHasField}`)

    return {
      total: photosSnapshot.size,
      updated: count,
      skipped: alreadyHasField
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}
