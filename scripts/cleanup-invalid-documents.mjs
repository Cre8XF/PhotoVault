// ============================================================================
// cleanup-invalid-documents.mjs
// Script to remove documents uploaded by FREE tier users (tier bypass)
// ============================================================================

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, deleteDoc, getDoc } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import readline from 'readline'

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Documents to delete (from logs)
const invalidDocuments = [
  {
    id: 'fgmNk1p6HoVSdfN82Y0C',
    name: '1767091568137_Untitled_1.docx',
    r2Path:
      'users/XVw5gfqzdiWzM9O3f64kp6Zlae02/unassigned/1767164308785_1767091568137_Untitled_1.docx',
  },
  {
    id: 'gh3u5yzwIK9wPTlKljZb',
    name: 'Notes_251228_200812.pdf',
    r2Path:
      'users/XVw5gfqzdiWzM9O3f64kp6Zlae02/unassigned/1767164311459_Notes_251228_200812.pdf',
  },
]

/**
 * Delete file from R2 storage
 */
async function deleteFromR2(storagePath, idToken) {
  const endpoint =
    'https://pixtr-upload-worker.rogsor80.workers.dev/delete'

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ path: storagePath }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`R2 delete failed: ${response.statusText} - ${error}`)
  }

  return response.json()
}

/**
 * Prompt user for confirmation
 */
function promptConfirmation(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(`${message} (y/n): `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y')
    })
  })
}

/**
 * Main cleanup function
 */
async function cleanupInvalidDocuments() {
  console.log('🧹 Cleanup Script: Invalid Document Removal')
  console.log('==========================================\n')
  console.log('This script will delete the following documents:\n')

  invalidDocuments.forEach((doc, index) => {
    console.log(`${index + 1}. ${doc.name}`)
    console.log(`   Firestore ID: ${doc.id}`)
    console.log(`   R2 Path: ${doc.r2Path}\n`)
  })

  const confirmed = await promptConfirmation(
    'Do you want to proceed with deletion?'
  )

  if (!confirmed) {
    console.log('\n❌ Cleanup cancelled by user.')
    process.exit(0)
  }

  console.log('\n🔐 Authentication required...')
  console.log('Please login with admin credentials.\n')

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const email = await new Promise((resolve) => {
    rl.question('Email: ', (answer) => resolve(answer))
  })

  const password = await new Promise((resolve) => {
    rl.question('Password: ', (answer) => {
      resolve(answer)
    })
  })

  rl.close()

  try {
    // Sign in
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )
    const user = userCredential.user
    console.log(`\n✅ Authenticated as: ${user.email}\n`)

    // Get ID token for R2 deletion
    const idToken = await user.getIdToken()

    console.log('🗑️  Starting deletion process...\n')

    for (const document of invalidDocuments) {
      console.log(`Processing: ${document.name}`)

      try {
        // 1. Check if document exists in Firestore
        const docRef = doc(db, 'photos', document.id)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          console.log(
            `   ⚠️  Document ${document.id} not found in Firestore (already deleted?)`
          )
        } else {
          // 2. Delete from Firestore
          await deleteDoc(docRef)
          console.log(`   ✅ Deleted from Firestore: ${document.id}`)
        }

        // 3. Delete from R2 storage
        try {
          await deleteFromR2(document.r2Path, idToken)
          console.log(`   ✅ Deleted from R2: ${document.r2Path}`)
        } catch (r2Error) {
          console.log(
            `   ⚠️  R2 delete failed (file may not exist): ${r2Error.message}`
          )
        }

        console.log(`   ✅ Cleanup complete for ${document.name}\n`)
      } catch (error) {
        console.error(`   ❌ Error deleting ${document.name}:`, error.message)
        console.error(`   Stack trace:`, error.stack)
      }
    }

    console.log('✅ Cleanup complete!\n')
    console.log('Summary:')
    console.log(`- Documents processed: ${invalidDocuments.length}`)
    console.log(
      '- Check the output above for any errors or warnings.\n'
    )
  } catch (error) {
    console.error('\n❌ Authentication failed:', error.message)
    console.error('Please check your credentials and try again.\n')
    process.exit(1)
  }
}

// Run cleanup
cleanupInvalidDocuments()
  .then(() => {
    console.log('✅ Script completed successfully.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Cleanup failed:', error)
    process.exit(1)
  })
