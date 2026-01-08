import { sendEmailVerification } from 'firebase/auth'
import { auth } from '../firebase'

export const sendVerificationEmail = async () => {
  const user = auth.currentUser
  if (!user) throw new Error('No authenticated user')

  await sendEmailVerification(user)

  if (import.meta.env.DEV) {
    console.log('✅ Verification email sent to:', user.email)
  }
}
