import { sendEmailVerification } from 'firebase/auth'
import { auth } from '../firebase'

export const sendVerificationEmail = async () => {
  const user = auth.currentUser
  if (!user) throw new Error('No authenticated user')

  // Determine the redirect URL based on environment
  const baseUrl = import.meta.env.DEV
    ? 'http://localhost:5173'
    : 'https://pixtr.cloud'

  await sendEmailVerification(user, {
    url: `${baseUrl}/verify-complete`,
    handleCodeInApp: false,
  })

  if (import.meta.env.DEV) {
    console.log('✅ Verification email sent to:', user.email)
    console.log('✅ Redirect URL:', `${baseUrl}/verify-complete`)
  }
}
