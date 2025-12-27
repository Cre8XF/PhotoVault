import admin from 'firebase-admin'

/**
 * SINGLETON Firebase Admin Initialization
 *
 * This module ensures firebase-admin is initialized EXACTLY ONCE across
 * all Netlify function invocations, preventing the "DECODER routines::unsupported"
 * error that occurs when firebase-admin is re-initialized multiple times.
 *
 * CRITICAL:
 * - ALL Netlify functions must import Firestore from this module
 * - NEVER call admin.initializeApp() directly in function handlers
 * - Service account credentials are normalized here (private_key newlines)
 */

let firestore = null

/**
 * Initialize Firebase Admin and return Firestore instance
 * @returns {admin.firestore.Firestore} Firestore instance
 */
function getFirestore() {
  // Return existing instance if already initialized
  if (firestore) {
    return firestore
  }

  // Initialize firebase-admin if not already initialized
  if (!admin.apps.length) {
    try {
      // Parse service account from environment
      // Support both JSON string and individual env vars
      let serviceAccount

      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // Parse JSON service account
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
          // Normalize private_key newlines
          if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
          }
        } catch (parseError) {
          console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', parseError.message)
          throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT format')
        }
      } else {
        // Use individual environment variables
        // DIAGNOSTIC: Verify private key formatting at runtime
        const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY
        console.log('🔍 DIAGNOSTIC: FIREBASE_PRIVATE_KEY verification')
        console.log('   - Present:', !!rawPrivateKey)
        console.log('   - Contains BEGIN marker:', rawPrivateKey?.includes('BEGIN PRIVATE KEY') || false)
        console.log('   - Contains escaped newlines (\\\\n):', rawPrivateKey?.includes('\\n') || false)
        console.log('   - Length:', rawPrivateKey?.length || 0)

        serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // CRITICAL: Normalize private_key to ensure proper newline characters
          privateKey: rawPrivateKey?.replace(/\\n/g, '\n'),
        }

        // Validate required fields
        if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
          throw new Error('Missing required Firebase Admin environment variables')
        }

        // DIAGNOSTIC: Verify normalization result
        console.log('🔍 DIAGNOSTIC: After normalization')
        console.log('   - Contains real newlines:', serviceAccount.privateKey?.includes('\n') || false)
        console.log('   - First 50 chars:', serviceAccount.privateKey?.substring(0, 50))
      }

      // Initialize Firebase Admin with normalized credentials
      console.log('🔧 Attempting Firebase Admin initialization...')
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })

      console.log('✅ Firebase Admin initialized (singleton)')
    } catch (error) {
      console.error('❌ Firebase Admin initialization failed:', error.message)
      throw error
    }
  } else {
    console.log('✅ Firebase Admin already initialized (reusing existing app)')
  }

  // Cache and return Firestore instance
  firestore = admin.firestore()
  return firestore
}

/**
 * Get Firestore FieldValue for server timestamps
 */
function getFieldValue() {
  return admin.firestore.FieldValue
}

// Export singleton Firestore instance getter
export { getFirestore, getFieldValue }
