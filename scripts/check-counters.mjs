/**
 * ============================================================================
 * Pixtr Counter Health Check Script
 * ============================================================================
 *
 * PURPOSE:
 * Detect mismatches between stored album counters and actual album counts
 * to ensure counter integrity for freemium tier limits.
 *
 * USAGE:
 * node scripts/check-counters.mjs
 *
 * CHECKS:
 * 1. currentAlbumCount vs actual album count
 * 2. Album photoCount vs actual photo count per album
 *
 * ============================================================================
 */

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env
dotenv.config({ path: resolve(__dirname, '../.env') })

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
}

// Validate configuration
const missingVars = []
if (!firebaseConfig.apiKey) missingVars.push('REACT_APP_FIREBASE_API_KEY')
if (!firebaseConfig.authDomain) missingVars.push('REACT_APP_FIREBASE_AUTH_DOMAIN')
if (!firebaseConfig.projectId) missingVars.push('REACT_APP_FIREBASE_PROJECT_ID')
if (!firebaseConfig.storageBucket) missingVars.push('REACT_APP_FIREBASE_STORAGE_BUCKET')

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:')
  missingVars.forEach(varName => console.error(`   - ${varName}`))
  console.error('\n💡 Please create a .env file with your Firebase configuration.')
  console.error('   See .env.example for reference.')
  process.exit(1)
}

// Initialize Firebase
console.log('🔧 Initializing Firebase...')
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

/**
 * Check album counter health for all users
 */
async function checkAlbumCounters() {
  console.log('\n🔍 Checking album counters...\n')

  try {
    const usersSnap = await getDocs(collection(db, 'users'))
    const mismatches = []
    let totalUsers = 0
    let usersChecked = 0

    for (const userDoc of usersSnap.docs) {
      totalUsers++
      const userId = userDoc.id
      const userData = userDoc.data()
      const email = userData.email || 'unknown'
      const storedCount = userData.currentAlbumCount || 0

      // Count actual albums
      const albumsQuery = query(
        collection(db, 'albums'),
        where('userId', '==', userId)
      )
      const albumsSnap = await getDocs(albumsQuery)
      const actualCount = albumsSnap.size

      usersChecked++

      if (storedCount !== actualCount) {
        const diff = actualCount - storedCount
        mismatches.push({
          userId,
          email,
          stored: storedCount,
          actual: actualCount,
          diff: diff,
          severity: Math.abs(diff) > 5 ? 'HIGH' : 'LOW'
        })
        console.log(`❌ ${email}: stored=${storedCount}, actual=${actualCount}, diff=${diff > 0 ? '+' : ''}${diff}`)
      } else {
        console.log(`✅ ${email}: ${storedCount} albums (match)`)
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 ALBUM COUNTER HEALTH SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total users checked:  ${usersChecked}`)
    console.log(`Mismatches found:     ${mismatches.length}`)
    console.log(`Accuracy:             ${((usersChecked - mismatches.length) / usersChecked * 100).toFixed(1)}%`)
    console.log('='.repeat(60))

    if (mismatches.length === 0) {
      console.log('\n✅ All counters match! No action needed.')
    } else {
      console.log('\n⚠️  Counter mismatches detected:\n')
      console.table(mismatches)

      console.log('\n📝 RECOMMENDED ACTIONS:')
      console.log('   1. Review application logs for counter adjustment failures')
      console.log('   2. If mismatches persist, consider running a reconciliation')
      console.log('   3. Check for race conditions in album creation/deletion')

      const highSeverity = mismatches.filter(m => m.severity === 'HIGH')
      if (highSeverity.length > 0) {
        console.log(`\n🚨 HIGH SEVERITY: ${highSeverity.length} users have large discrepancies (>5 albums)`)
      }
    }

    return mismatches
  } catch (error) {
    console.error('\n❌ Health check failed:', error)
    throw error
  }
}

/**
 * Check photo counters for all albums
 */
async function checkPhotoCounters() {
  console.log('\n\n🔍 Checking photo counters for albums...\n')

  try {
    const albumsSnap = await getDocs(collection(db, 'albums'))
    const mismatches = []
    let totalAlbums = 0
    let albumsChecked = 0

    for (const albumDoc of albumsSnap.docs) {
      totalAlbums++
      const albumId = albumDoc.id
      const albumData = albumDoc.data()
      const albumName = albumData.name || 'Unnamed'
      const storedCount = albumData.photoCount || 0

      // Count actual photos
      const photosQuery = query(
        collection(db, 'photos'),
        where('albumId', '==', albumId)
      )
      const photosSnap = await getDocs(photosQuery)
      const actualCount = photosSnap.size

      albumsChecked++

      if (storedCount !== actualCount) {
        const diff = actualCount - storedCount
        mismatches.push({
          albumId,
          albumName,
          userId: albumData.userId || 'unknown',
          stored: storedCount,
          actual: actualCount,
          diff: diff,
          severity: Math.abs(diff) > 10 ? 'HIGH' : 'LOW'
        })
        console.log(`❌ "${albumName}": stored=${storedCount}, actual=${actualCount}, diff=${diff > 0 ? '+' : ''}${diff}`)
      } else {
        console.log(`✅ "${albumName}": ${storedCount} photos (match)`)
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 PHOTO COUNTER HEALTH SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total albums checked: ${albumsChecked}`)
    console.log(`Mismatches found:     ${mismatches.length}`)
    console.log(`Accuracy:             ${albumsChecked > 0 ? ((albumsChecked - mismatches.length) / albumsChecked * 100).toFixed(1) : 0}%`)
    console.log('='.repeat(60))

    if (mismatches.length === 0) {
      console.log('\n✅ All photo counters match! No action needed.')
    } else {
      console.log('\n⚠️  Photo counter mismatches detected:\n')
      console.table(mismatches)

      console.log('\n📝 RECOMMENDED ACTIONS:')
      console.log('   1. Review photo upload/delete logs for counter adjustment failures')
      console.log('   2. Check for orphaned photos (photos without albumId)')
      console.log('   3. Verify atomic updates in photo operations')

      const highSeverity = mismatches.filter(m => m.severity === 'HIGH')
      if (highSeverity.length > 0) {
        console.log(`\n🚨 HIGH SEVERITY: ${highSeverity.length} albums have large discrepancies (>10 photos)`)
      }
    }

    return mismatches
  } catch (error) {
    console.error('\n❌ Photo counter check failed:', error)
    throw error
  }
}

/**
 * Main function
 */
async function main() {
  console.log('═'.repeat(60))
  console.log('🔍 PIXTR COUNTER HEALTH CHECK')
  console.log('═'.repeat(60))

  try {
    // Check album counters
    const albumMismatches = await checkAlbumCounters()

    // Check photo counters
    const photoMismatches = await checkPhotoCounters()

    // Final summary
    console.log('\n\n' + '═'.repeat(60))
    console.log('🎯 FINAL HEALTH REPORT')
    console.log('═'.repeat(60))
    console.log(`Album counter mismatches: ${albumMismatches.length}`)
    console.log(`Photo counter mismatches: ${photoMismatches.length}`)
    console.log(`Total issues found:       ${albumMismatches.length + photoMismatches.length}`)
    console.log('═'.repeat(60))

    if (albumMismatches.length === 0 && photoMismatches.length === 0) {
      console.log('\n🎉 All counters are healthy! No issues detected.')
    } else {
      console.log('\n⚠️  Counter integrity issues detected. Review recommendations above.')
    }

  } catch (error) {
    console.error('\n💥 Health check failed:', error)
    process.exit(1)
  }
}

// Run health check
main()
  .then(() => {
    console.log('\n👋 Health check complete')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
