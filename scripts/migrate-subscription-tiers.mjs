/**
 * ============================================================================
 * PhotoVault Subscription Tier Migration Script
 * ============================================================================
 *
 * PURPOSE:
 * Migrate existing users from isPro boolean to new tier system:
 * - GRATIS: 1GB storage, original quality, no video
 * - LITE: 5GB storage, compression, no video
 * - PRO: 50GB storage, compression, video support
 *
 * USAGE:
 * 1. Ensure .env file exists with Firebase config
 * 2. Run: node scripts/migrate-subscription-tiers.js
 *
 * ============================================================================
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore'
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

// Storage limits in bytes
const STORAGE_LIMITS = {
  GRATIS: 1073741824,      // 1GB
  LITE: 5368709120,        // 5GB
  PRO: 53687091200,        // 50GB
  ADMIN: null              // Unlimited
}

/**
 * Main migration function
 */
async function migrateTiers() {
  console.log('🚀 Starting subscription tier migration...\n')
  console.log('📋 Migration Logic:')
  console.log('   • role: "admin" → PRO tier (50GB)')
  console.log('   • isPro: true → PRO tier (50GB)')
  console.log('   • default → GRATIS tier (1GB)')
  console.log('')

  try {
    // Get all users
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)

    if (snapshot.empty) {
      console.log('⚠️  No users found in database.')
      return
    }

    console.log(`📊 Found ${snapshot.docs.length} users to process\n`)

    let updated = 0
    let skipped = 0
    let errors = 0

    // Process each user
    for (const userDoc of snapshot.docs) {
      const data = userDoc.data()
      const email = data.email || 'unknown'

      try {
        // Check if already migrated
        if (data.subscriptionTier && data.storageLimit) {
          console.log(`⏭️  ${email}: Already migrated (${data.subscriptionTier})`)
          skipped++
          continue
        }

        // Determine new tier based on old isPro/role
        let newTier = 'GRATIS'
        let newStorageLimit = STORAGE_LIMITS.GRATIS

        if (data.role === 'admin') {
          // Admins get PRO tier
          newTier = 'PRO'
          newStorageLimit = STORAGE_LIMITS.PRO
        } else if (data.isPro === true) {
          // Old pro users get PRO tier
          newTier = 'PRO'
          newStorageLimit = STORAGE_LIMITS.PRO
        } else {
          // Everyone else gets GRATIS tier
          newTier = 'GRATIS'
          newStorageLimit = STORAGE_LIMITS.GRATIS
        }

        // Update user document
        await updateDoc(doc(db, 'users', userDoc.id), {
          subscriptionTier: newTier,
          storageLimit: newStorageLimit,
          updatedAt: new Date().toISOString()
        })

        updated++
        console.log(`✅ ${email}: ${newTier} (${formatBytes(newStorageLimit)})`)

      } catch (error) {
        errors++
        console.error(`❌ ${email}: ${error.message}`)
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 MIGRATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Successfully updated: ${updated}`)
    console.log(`⏭️  Already migrated:     ${skipped}`)
    console.log(`❌ Errors:               ${errors}`)
    console.log(`📦 Total users:          ${snapshot.docs.length}`)
    console.log('='.repeat(60))

    if (updated > 0) {
      console.log('\n✨ Migration completed successfully!')
      console.log('\n📝 NEXT STEPS:')
      console.log('   1. Deploy updated Firestore rules: firebase deploy --only firestore:rules')
      console.log('   2. Deploy updated Storage rules: firebase deploy --only storage:rules')
      console.log('   3. Test user tier checks in the app')
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (bytes === null) return 'Unlimited'
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Run migration
migrateTiers()
  .then(() => {
    console.log('\n👋 Migration script finished')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
