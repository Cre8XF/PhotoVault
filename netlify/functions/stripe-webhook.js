export async function handler(event) {
  console.log('HANDLER START')

  try {
    // 🔎 ENVIRONMENT SANITY CHECK
    console.log('ENV CHECK', {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length,
    })

    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY
    ) {
      throw new Error('Missing required Firebase environment variables')
    }

    // ⬇️ LAZY IMPORT (CRITICAL)
    const admin = await import('firebase-admin')

    // 🔐 FIREBASE ADMIN INIT – ONLY HERE
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      })
    }

    console.log('Firebase Admin initialized successfully')

    // ⛔ INTENTIONAL STOP
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'ok',
        message:
          'Firebase Admin init successful. Execution stopped intentionally.',
      }),
    }
  } catch (error) {
    console.error('Firebase Admin initialization failed', error)

    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'error',
        message: error.message,
      }),
    }
  }
}
