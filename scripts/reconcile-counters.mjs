#!/usr/bin/env node

/**
 * Pixtr Counter Reconciliation Script
 *
 * Detects and optionally fixes mismatches between:
 * 1. Album photo counts (album.photoCount vs actual photos)
 * 2. User album counts (user.currentAlbumCount vs actual albums)
 *
 * Usage:
 *   node scripts/reconcile-counters.mjs --report     # Report only (safe)
 *   node scripts/reconcile-counters.mjs --fix        # Fix mismatches
 */

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where
} from 'firebase/firestore'
import { config } from 'dotenv'

// Load environment variables
config()

// Firebase config (from environment)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Parse CLI arguments
const args = process.argv.slice(2)
const isFixMode = args.includes('--fix')
const isReportMode = args.includes('--report') || args.length === 0

if (!isFixMode && !isReportMode) {
  console.error('❌ Invalid arguments. Use --report or --fix')
  process.exit(1)
}

// ============================================================
// ALBUM PHOTO COUNT RECONCILIATION
// ============================================================

async function reconcileAlbumCounts() {
  console.log('🔍 Checking album photo counts...\n')

  const mismatches = []
  const fixes = []

  // Get all albums
  const albumsSnap = await getDocs(collection(db, 'albums'))

  for (const albumDoc of albumsSnap.docs) {
    const albumId = albumDoc.id
    const albumData = albumDoc.data()
    const storedCount = albumData.photoCount || 0
    const albumName = albumData.name || 'Unnamed Album'

    // Count actual photos in this album
    const photosQuery = query(
      collection(db, 'photos'),
      where('albumId', '==', albumId)
      // Note: If implementing soft-delete, add: where('deleted', '==', false)
    )
    const photosSnap = await getDocs(photosQuery)
    const actualCount = photosSnap.size

    if (storedCount !== actualCount) {
      const mismatch = {
        albumId,
        albumName,
        stored: storedCount,
        actual: actualCount,
        diff: actualCount - storedCount
      }

      mismatches.push(mismatch)

      // Fix if in fix mode
      if (isFixMode) {
        await updateDoc(doc(db, 'albums', albumId), {
          photoCount: actualCount,
          updatedAt: new Date().toISOString()
        })

        fixes.push({
          albumId,
          albumName,
          corrected: `${storedCount} → ${actualCount}`
        })
      }
    }
  }

  // Report results
  if (mismatches.length === 0) {
    console.log('✅ All album photo counts are accurate!\n')
  } else {
    console.log(`⚠️  Found ${mismatches.length} album count mismatch(es):\n`)
    console.table(mismatches)

    if (isFixMode) {
      console.log('\n✅ Fixed album counts:\n')
      console.table(fixes)
    } else {
      console.log('\n💡 Run with --fix to correct these mismatches\n')
    }
  }

  return mismatches.length
}

// ============================================================
// USER ALBUM COUNT RECONCILIATION
// ============================================================

async function reconcileUserAlbumCounts() {
  console.log('🔍 Checking user album counts...\n')

  const mismatches = []
  const fixes = []

  // Get all users
  const usersSnap = await getDocs(collection(db, 'users'))

  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id
    const userData = userDoc.data()
    const storedCount = userData.currentAlbumCount || 0
    const email = userData.email || 'Unknown'
    const tier = userData.subscriptionTier || 'GRATIS'

    // Count actual albums for this user
    const albumsQuery = query(
      collection(db, 'albums'),
      where('userId', '==', userId)
    )
    const albumsSnap = await getDocs(albumsQuery)
    const actualCount = albumsSnap.size

    if (storedCount !== actualCount) {
      const mismatch = {
        userId,
        email,
        tier,
        stored: storedCount,
        actual: actualCount,
        diff: actualCount - storedCount
      }

      mismatches.push(mismatch)

      // Fix if in fix mode
      if (isFixMode) {
        await updateDoc(doc(db, 'users', userId), {
          currentAlbumCount: actualCount,
          updatedAt: new Date().toISOString()
        })

        fixes.push({
          email,
          tier,
          corrected: `${storedCount} → ${actualCount}`
        })
      }
    }
  }

  // Report results
  if (mismatches.length === 0) {
    console.log('✅ All user album counts are accurate!\n')
  } else {
    console.log(`⚠️  Found ${mismatches.length} user album count mismatch(es):\n`)
    console.table(mismatches)

    if (isFixMode) {
      console.log('\n✅ Fixed user album counts:\n')
      console.table(fixes)
    } else {
      console.log('\n💡 Run with --fix to correct these mismatches\n')
    }
  }

  return mismatches.length
}

// ============================================================
// MAIN EXECUTION
// ============================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('         PIXTR COUNTER RECONCILIATION SCRIPT           ')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`Mode: ${isFixMode ? '🔧 FIX' : '📊 REPORT'}`)
  console.log('═══════════════════════════════════════════════════════\n')

  try {
    const albumMismatches = await reconcileAlbumCounts()
    const userMismatches = await reconcileUserAlbumCounts()

    const totalMismatches = albumMismatches + userMismatches

    console.log('═══════════════════════════════════════════════════════')
    if (totalMismatches === 0) {
      console.log('  ✅ ALL COUNTERS ACCURATE - NO ACTION NEEDED          ')
    } else if (isFixMode) {
      console.log(`  ✅ FIXED ${totalMismatches} MISMATCH(ES)                       `)
    } else {
      console.log(`  ⚠️  FOUND ${totalMismatches} MISMATCH(ES) - RUN WITH --fix      `)
    }
    console.log('═══════════════════════════════════════════════════════\n')

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Reconciliation failed:', error)
    process.exit(1)
  }
}

main()
