// ============================================================================
// PAGE: MorePage.jsx – v7.1 MED ARRAY-GUARDS FIKSET
// ============================================================================
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  User,
  Settings,
  Shield,
  Globe,
  Bell,
  HardDrive,
  CreditCard,
  LogOut,
  Trash2,
  HelpCircle,
  FileText,
  Info,
  Wand2,
  Scan,
  ImagePlus,
  Users,
  Sparkles,
  Copy,
  CheckCircle,
  Crown,
  ChevronRight,
  Languages,
  Download,
  Share2,
  Zap,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Moon,
  Sun,
  Upload,
  Check,
  Lock,
  Folder,
  Image,
  Mail,
  GripVertical,
  Database,
} from 'lucide-react'
import { ROUTES } from '../routes'
import { useSecurityContext } from '../contexts/SecurityContext'
import {
  getFirestore,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  collection,
  getDocs,
} from 'firebase/firestore'

import { getAuth } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'

// Firebase Storage imports removed - scanning causes 403 errors
// Storage operations handled by firebase.js CRUD functions

import {
  db,
  functions,
  migrateAlbumsAddUserId,
  migratePhotosAddUserId,
  getPhotosByUser,
} from '../firebase'
import {
  migratePhotosAddDeletedField,
  migratePhotosAddOrderField,
} from '../utils/photoMigrations'
import { reauthenticateUser, deleteAuthUser } from '../utils/authHelpers'
import { deleteAllUserR2Objects } from '../utils/r2Upload'
import ComingSoonModal from '../components/ComingSoonModal'
import SharePixtrModal from '../components/SharePixtrModal'
import UpgradePromptModal from '../components/UpgradePromptModal'
import { useStorageCalc } from '../hooks/useStorageCalc'
import SystemStatus from '../components/admin/SystemStatus'
import useStore from '../state/store'
import { sendVerificationEmail } from '../utils/emailVerification'
import useAuth from '../hooks/useAuth'

const MorePage = ({
  user,
  storageUsed: propStorageUsed,
  storageLimit: propStorageLimit,
  photos,
  albums,
  isDarkMode,
  setIsDarkMode,
  onLogout,
}) => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation([
    'translation',
    'common',
    'albums',
    'info',
    'auth',
  ])
  const emailVerified = useStore((state) => state.emailVerified)
  const [expandedSection, setExpandedSection] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [showAIModal, setShowAIModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [aiFeatureName, setAIFeatureName] = useState('')
  const [aiFeatureDescription, setAIFeatureDescription] = useState('')
  const [migrating, setMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState(null)
  const [sendingVerification, setSendingVerification] = useState(false)
  const [reconciling, setReconciling] = useState(false)
  const [reconcileResult, setReconcileResult] = useState(null)
  const [lastReconciliation, setLastReconciliation] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(null)

  const { pinEnabled, biometricEnabled } = useSecurityContext()

  // ✅ DOCUMENT ACCESS CONTROL
  const { canUploadDocument, isAdmin: checkIsAdmin, userProfile } = useAuth()

  // 🔒 FEATURE CAPABILITIES BASED ON SUBSCRIPTION TIER
  const capabilities = {
    documents: userProfile?.subscriptionTier !== 'FREE',
    vault: userProfile?.subscriptionTier !== 'FREE'
  }

  // 🔒 SIKRE AT PROPS ER ARRAYS
  const safePhotos = React.useMemo(() => {
    if (!Array.isArray(photos)) {
      console.warn(
        '⚠️ MorePage received non-array photos:',
        typeof photos,
        photos
      )
      return []
    }
    return photos
  }, [photos])

  const safeAlbums = React.useMemo(() => {
    if (!Array.isArray(albums)) {
      console.warn(
        '⚠️ MorePage received non-array albums:',
        typeof albums,
        albums
      )
      return []
    }
    return albums
  }, [albums])

  // Use storage calculation hook
  const {
    storageUsed,
    storageLimit,
    storagePercentage: storagePercent,
    storageLoading,
    refreshStorage,
    formatBytes,
  } = useStorageCalc(user?.uid, propStorageUsed, propStorageLimit)

  // ✅ FIX: Check for isPro using subscriptionTier (canonical source)
  const isPro =
    user?.isPro === true ||
    user?.role === 'pro' ||
    user?.role === 'admin' ||
    userProfile?.subscriptionTier === 'PRO'

  // Check for isAdmin: check role field
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true

  // ✅ FIX: Check for isLite using subscriptionTier (canonical source)
  const isLite = userProfile?.subscriptionTier === 'LITE'

  // ============================================================================
  // === NOTIFICATION SYSTEM ===
  // ============================================================================
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // ============================================================================
  // === STRIPE INTEGRATION ===
  // ============================================================================
  const handleUpgradeToPro = () => {
    // Navigate to billing page for Stripe Checkout
    navigate('/billing')
  }

  // MVP: Show "Coming Soon" modal for AI features
  const showAIFeatureModal = (featureName, description) => {
    console.log(
      'AI feature disabled - Phase 2 activation required:',
      featureName
    )
    setAIFeatureName(featureName)
    setAIFeatureDescription(description)
    setShowAIModal(true)
  }

  // ============================================================================
  // === EMAIL VERIFICATION ===
  // ============================================================================
  const handleSendVerification = async () => {
    if (!user || sendingVerification) return

    try {
      setSendingVerification(true)
      await sendVerificationEmail(user)
      showNotification(t('auth:verificationEmailSent'), 'success')
    } catch (error) {
      console.error('Failed to send verification email:', error)
      // Silent failure - no blocking toast, just log
      if (import.meta.env.DEV) {
        showNotification(t('auth:verificationEmailFailed'), 'info')
      }
    } finally {
      setSendingVerification(false)
    }
  }

  // ============================================================================
  // === EXPORT FUNCTION ===
  // ============================================================================
  const exportUserData = async () => {
    const exportUrl = import.meta.env.VITE_EXPORT_URL

    if (!exportUrl) {
      console.warn('Export URL not configured')
      showNotification(t('more.export.unavailable'), 'error')
      return
    }

    try {
      setLoading(true)
      console.log('Exporting user data for:', user.uid)

      const response = await fetch(exportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
        }),
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `photovault-export-${user.uid}-${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      showNotification(t('notifications.exported'), 'success')
    } catch (error) {
      console.error('Error exporting data:', error)
      showNotification(t('more.export.failed'), 'error')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // === IMPORT FUNCTION ===
  // ============================================================================
  const handleImportData = async (event) => {
    const importUrl = import.meta.env.VITE_IMPORT_URL
    const file = event.target.files?.[0]

    if (!file) return

    if (!importUrl) {
      console.warn('Import URL not configured')
      showNotification(t('more.import.unavailable'), 'error')
      return
    }

    try {
      setLoading(true)
      console.log('Importing user data:', file.name)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', user.uid)
      formData.append('email', user.email)

      const response = await fetch(importUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Import failed: ${response.status}`)
      }

      const result = await response.json()
      console.log('Import result:', result)

      showNotification(t('notifications.imported'), 'success')

      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      console.error('Error importing data:', error)
      showNotification(t('more.import.failed'), 'error')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // === SHARE PIXTR APP ===
  // ============================================================================
  const handleShareProfile = () => {
    setShowShareModal(true)
  }

  // ============================================================================
  // === DELETE ACCOUNT (SAFE & ATOMIC) ===
  // ============================================================================

  /**
   * Step 1: Show confirmation dialog
   */
  const handleDeleteAccountClick = () => {
    setShowDeleteConfirm(true)
  }

  /**
   * Step 2: User confirms deletion - show password modal for re-authentication
   */
  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false)
    setShowPasswordModal(true)
    setDeletePassword('')
  }

  /**
   * Step 3: Execute safe account deletion after re-authentication
   * ORDER: Re-auth → R2 → Firestore → Firebase Auth
   */
  const deleteAccount = async () => {
    if (!user?.uid) {
      showNotification('No user found', 'error')
      return
    }

    if (!deletePassword) {
      showNotification('Password is required', 'error')
      return
    }

    try {
      setLoading(true)
      console.log('═══════════════════════════════════════════════')
      console.log('🗑️ SAFE DELETE ACCOUNT STARTED')
      console.log('═══════════════════════════════════════════════')
      console.log('User ID:', user.uid)
      console.log('Email:', user.email)
      console.log('Timestamp:', new Date().toISOString())

      // ============================================================
      // STEP 1: RE-AUTHENTICATE (REQUIRED BY FIREBASE)
      // ============================================================
      console.log('🔐 STEP 1: Re-authenticating user...')
      try {
        await reauthenticateUser(deletePassword)
        console.log('✅ STEP 1 COMPLETE: User re-authenticated successfully')
      } catch (error) {
        console.error('❌ STEP 1 FAILED: Re-authentication failed')
        throw error // Abort - do NOT proceed if re-auth fails
      }

      // Get fresh Firebase token after re-auth
      const auth = getAuth()
      const firebaseToken = await auth.currentUser.getIdToken()

      // ============================================================
      // STEP 2: DELETE ALL R2 OBJECTS
      // ============================================================
      console.log('🗑️ STEP 2: Deleting all R2 objects...')
      try {
        // Fetch all user photos to get R2 URLs
        const userPhotos = await getPhotosByUser(user.uid)
        console.log(`Found ${userPhotos.length} photos to delete from R2`)

        if (userPhotos.length > 0) {
          const r2Result = await deleteAllUserR2Objects(
            userPhotos,
            firebaseToken
          )
          console.log('✅ STEP 2 COMPLETE: R2 deletion result:', r2Result)

          if (r2Result.failed > 0) {
            console.warn(
              `⚠️ Warning: ${r2Result.failed} R2 objects failed to delete`
            )
            // Continue anyway - Firestore is the source of truth
          }
        } else {
          console.log('✅ STEP 2 COMPLETE: No R2 objects to delete')
        }
      } catch (error) {
        console.error('❌ STEP 2 FAILED: R2 deletion error:', error)
        // Continue anyway - Firestore cleanup is more critical
        console.warn('⚠️ Continuing with Firestore deletion despite R2 errors')
      }

      // ============================================================
      // STEP 3: DELETE FIRESTORE DATA
      // ============================================================
      console.log('🗑️ STEP 3: Deleting Firestore data...')
      try {
        const db = getFirestore()

        // Delete subcollections under users/{uid}
        const collections = ['photos', 'albums', 'shared', 'favorites']

        for (const collectionName of collections) {
          const collectionRef = collection(
            db,
            'users',
            user.uid,
            collectionName
          )
          const snapshot = await getDocs(collectionRef)

          console.log(
            `Deleting ${snapshot.size} documents from users/${user.uid}/${collectionName}`
          )

          await Promise.all(snapshot.docs.map((doc) => deleteDoc(doc.ref)))
        }

        // Delete main user document
        await deleteDoc(doc(db, 'users', user.uid))
        console.log('✅ STEP 3 COMPLETE: All Firestore data deleted')
      } catch (error) {
        console.error('❌ STEP 3 FAILED: Firestore deletion error:', error)
        throw error // Abort - Firestore is critical
      }

      // ============================================================
      // STEP 4: DELETE FIREBASE AUTH USER
      // ============================================================
      console.log('🗑️ STEP 4: Deleting Firebase Auth user...')
      try {
        await deleteAuthUser()
        console.log('✅ STEP 4 COMPLETE: Firebase Auth user deleted')
      } catch (error) {
        console.error('❌ STEP 4 FAILED: Auth deletion error:', error)
        throw error // Critical failure - user should retry
      }

      console.log('═══════════════════════════════════════════════')
      console.log('🎉 ACCOUNT DELETION COMPLETE - SUCCESS')
      console.log('═══════════════════════════════════════════════')

      // ============================================================
      // STEP 5: LOG OUT AND REDIRECT
      // ============================================================
      showNotification(
        'Account deleted successfully. Redirecting...',
        'success'
      )

      // Close modals
      setShowPasswordModal(false)
      setShowDeleteConfirm(false)

      // Redirect to landing page after short delay
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    } catch (error) {
      console.error('═══════════════════════════════════════════════')
      console.error('💥 ACCOUNT DELETION FAILED')
      console.error('═══════════════════════════════════════════════')
      console.error('Error:', error)

      // Show user-friendly error message
      let errorMessage = 'Failed to delete account. Please try again.'
      if (error.message) {
        errorMessage = error.message
      }

      showNotification(errorMessage, 'error')

      // Reset state
      setShowPasswordModal(false)
      setShowDeleteConfirm(false)
      setDeletePassword('')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // === MIGRATION FUNCTIONS ===
  // ============================================================================
  const handleMigrateAlbums = async () => {
    if (!window.confirm(t('admin.migrationConfirmAlbums'))) {
      return
    }

    try {
      setMigrating(true)
      setMigrationResult(null)
      console.log('🔧 Starting album migration...')

      const result = await migrateAlbumsAddUserId()

      console.log('✅ Migration complete:', result)
      setMigrationResult({
        type: 'albums',
        ...result,
      })

      showNotification(
        `Migration complete! Fixed: ${result.fixed} albums, Skipped: ${result.skipped} albums`,
        'success'
      )

      // Refresh page after 2 seconds to show updated data
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('❌ Migration failed:', error)
      showNotification('Migration failed: ' + error.message, 'error')
    } finally {
      setMigrating(false)
    }
  }

  const handleMigratePhotos = async () => {
    if (!window.confirm(t('admin.migrationConfirmPhotos'))) {
      return
    }

    try {
      setMigrating(true)
      setMigrationResult(null)
      console.log('🔧 Starting photo migration...')

      const result = await migratePhotosAddUserId()

      console.log('✅ Migration complete:', result)
      setMigrationResult({
        type: 'photos',
        ...result,
      })

      showNotification(
        `Migration complete! Fixed: ${result.fixed} photos, Skipped: ${result.skipped} photos`,
        'success'
      )

      // Refresh page after 2 seconds to show updated data
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('❌ Migration failed:', error)
      showNotification('Migration failed: ' + error.message, 'error')
    } finally {
      setMigrating(false)
    }
  }

  const handleMigrateDeletedField = async () => {
    if (
      !window.confirm(
        'Run migration to add deleted:false to all photos? This is required for Phase 4B trash feature.'
      )
    ) {
      return
    }

    try {
      setMigrating(true)
      setMigrationResult(null)
      console.log('🔧 Starting deleted field migration...')

      const result = await migratePhotosAddDeletedField()

      console.log('✅ Migration complete:', result)
      setMigrationResult({
        type: 'deleted-field',
        ...result,
      })

      showNotification(
        `Migration complete! Updated: ${result.updated} photos, Skipped: ${result.skipped} photos`,
        'success'
      )

      // Refresh page after 2 seconds to show updated data
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('❌ Migration failed:', error)
      showNotification('Migration failed: ' + error.message, 'error')
    } finally {
      setMigrating(false)
    }
  }

  const handleMigrateOrderField = async () => {
    if (
      !window.confirm('Add order field to all photos for drag-drop sorting?')
    ) {
      return
    }

    try {
      setMigrating(true)
      setMigrationResult(null)
      console.log('🔧 Starting order field migration...')

      const result = await migratePhotosAddOrderField()

      console.log('✅ Migration complete:', result)
      setMigrationResult({
        type: 'order-field',
        ...result,
      })

      showNotification(
        `Migration complete! Processed: ${result.processed}, Updated: ${result.updated}, Time: ${result.duration}s`,
        'success'
      )

      // Refresh page after 2 seconds to show updated data
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('❌ Migration failed:', error)
      showNotification('Migration failed: ' + error.message, 'error')
    } finally {
      setMigrating(false)
    }
  }

  // ============================================================================
  // === COUNTER RECONCILIATION ===
  // ============================================================================

  // Fetch last reconciliation report (admin only)
  React.useEffect(() => {
    if (!isAdmin) return

    const fetchReconciliationReport = async () => {
      try {
        const reportDoc = await getDoc(doc(db, 'system', 'lastReconciliation'))
        if (reportDoc.exists()) {
          setLastReconciliation(reportDoc.data())
        }
      } catch (error) {
        console.error('Error fetching reconciliation report:', error)
      }
    }

    fetchReconciliationReport()
  }, [isAdmin])

  const handleManualReconcile = async () => {
    if (
      !window.confirm(
        'Kjør manuell counter reconciliation? Dette kan ta noen minutter.'
      )
    ) {
      return
    }

    setReconciling(true)
    setReconcileResult(null)

    try {
      const manualReconcile = httpsCallable(functions, 'manualReconcile')
      const result = await manualReconcile()

      console.log('✅ Manual reconciliation result:', result.data)

      const { success, message, usersProcessed, issuesFound, issuesFixed } =
        result.data

      setReconcileResult({
        success,
        message,
        usersProcessed,
        issuesFound,
        issuesFixed,
      })

      showNotification(
        `Reconciliation fullført! Brukere: ${usersProcessed}, Issues: ${issuesFound}, Fikset: ${issuesFixed}`,
        'success'
      )

      // Refresh the last reconciliation data
      const reportDoc = await getDoc(doc(db, 'system', 'lastReconciliation'))
      if (reportDoc.exists()) {
        setLastReconciliation(reportDoc.data())
      }
    } catch (error) {
      console.error('❌ Manual reconciliation error:', error)

      setReconcileResult({
        success: false,
        message: error.message,
      })

      showNotification('Reconciliation feilet: ' + error.message, 'error')
    } finally {
      setReconciling(false)
    }
  }

  // === INFO PAGES NAVIGATION ===
  const navigateToInfoPage = (path) => {
    navigate(path)
  }

  // ============================================================================
  // === UI HELPERS ===
  // ============================================================================
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    const langName = lng === 'no' ? 'Norsk' : 'English'
    showNotification(
      t('notifications.languageChanged', { lang: langName }),
      'success'
    )
  }

  // ============================================================================
  // === RENDER ===
  // ============================================================================
  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 animate-fade-in max-w-6xl mx-auto">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 glass rounded-xl p-4 shadow-lg animate-slide-in-right flex items-center gap-3 ${
            notification.type === 'success'
              ? 'border-green-500/50'
              : 'border-red-500/50'
          } border-2`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center text-on-glass">
          <div className="glass rounded-2xl p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            <span className="font-medium">{t('notifications.processing')}</span>
          </div>
        </div>
      )}

      {/* === EMAIL VERIFICATION NOTICE === */}
      {user && !emailVerified && (
        <div className="mb-4 glass rounded-2xl p-4 border border-blue-500/30 bg-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-on-glass mb-0.5">
                {t('auth:verifyEmailTitle')}
              </h3>
              <p className="text-xs text-on-glass/70">
                {t('auth:verifyEmailText')}
              </p>
            </div>
            <button
              onClick={handleSendVerification}
              disabled={sendingVerification}
              className="flex-shrink-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingVerification
                ? t('auth:sendingVerification')
                : t('auth:verify')}
            </button>
          </div>
        </div>
      )}

      {/* === PROFILE HEADER === */}
      <div className="mb-8 glass rounded-2xl p-6 border border-purple-500/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-white">
                {user?.displayName?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase() ||
                  'U'}
              </div>
              {(pinEnabled || biometricEnabled) && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-2 border-white">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-on-glass">
                  {user?.displayName ||
                    user?.email?.split('@')[0] ||
                    t('profile.user')}
                </h2>
                {isAdmin && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 font-semibold">
                    <Crown className="w-3 h-3" />
                    {t('more.admin.badge')}
                  </span>
                )}
              </div>
              <p className="text-on-glass/70 text-sm">{user?.email}</p>
              {isAdmin && (
                <p className="text-on-glass/60 text-xs mt-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {t('more.admin.accountLabel', 'Admin account')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === QUICK ACTIONS === */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => navigate('/security')}
          className="ripple-effect glass rounded-xl p-4 hover:bg-white/10 transition flex flex-col items-center gap-2 text-center"
        >
          <div className="p-3 bg-purple-600/20 rounded-xl">
            <Shield className="w-6 h-6 text-purple" />
          </div>
          <span className="text-sm font-medium">{t('settings.security')}</span>
        </button>

        <button
          onClick={exportUserData}
          disabled={loading}
          className="ripple-effect glass rounded-xl p-4 hover:bg-white/10 transition flex flex-col items-center gap-2 text-center disabled:opacity-50"
        >
          <div className="p-3 bg-blue-600/20 rounded-xl">
            <Download className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-sm font-medium">{t('buttons.export')}</span>
        </button>

        <button
          onClick={handleShareProfile}
          className="ripple-effect glass rounded-xl p-4 hover:bg-white/10 transition flex flex-col items-center gap-2 text-center"
        >
          <div className="p-3 bg-pink-600/20 rounded-xl">
            <Share2 className="w-6 h-6 text-pink-400" />
          </div>
          <span className="text-sm font-medium">{t('buttons.share')}</span>
          <span className="text-xs text-gray-600 dark:text-gray-500">
            {t('buttons.sharePixtrApp', { defaultValue: 'Share Pixtr' })}
          </span>
        </button>
      </div>

      {/* === CONTENT === */}
      {/* Always show Content section - with locks for FREE users */}
      <section className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Folder className="w-5 h-5 text-purple" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {t('content.title', 'Content')}
            </h3>
            <p className="text-xs text-muted">
              {t(
                'content.subtitle',
                'Your uploaded files and protected content'
              )}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {/* Documents button */}
          <button
            onClick={() => capabilities.documents
              ? navigate('/documents')
              : setShowUpgradeModal('documents')
            }
            className={`ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10 relative ${
              !capabilities.documents ? 'opacity-60' : ''
            }`}
          >
            {!capabilities.documents && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5 text-purple" />
              </div>
            )}
            <FileText className="w-5 h-5 text-purple" />
            <div className="flex-1">
              <p className="font-medium">{t('nav:documents', 'Documents')}</p>
              <p className="text-xs text-muted">
                {t(
                  'documents:subtitle',
                  'PDFs, Word files and other documents'
                )}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 opacity-50" />
          </button>

          {/* Vault button */}
          <button
            onClick={() => capabilities.vault
              ? navigate('/vault')
              : setShowUpgradeModal('vault')
            }
            className={`ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10 relative ${
              !capabilities.vault ? 'opacity-60' : ''
            }`}
          >
            {!capabilities.vault && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5 text-purple" />
              </div>
            )}
            <Lock className="w-5 h-5 text-purple" />
            <div className="flex-1">
              <p className="font-medium">
                {t('vault.title', { defaultValue: 'Secure Vault' })}
              </p>
              <p className="text-xs text-muted">
                {t('vault.description', {
                  defaultValue: 'Encrypted private photos and files',
                })}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 opacity-50" />
          </button>
        </div>
      </section>

      {/* === MAIN CONTENT GRID === */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* === LEFT COLUMN === */}
        <div className="space-y-6">
          {/* === STORAGE === */}
          <section className="glass rounded-2xl p-6 border-2 border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <HardDrive className="w-5 h-5 text-purple" />
                </div>
                <h3 className="font-semibold text-lg">
                  {t('account.storage')}
                </h3>
              </div>
              {storagePercent > 80 && (
                <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {t('storage.almostFull')}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold">
                    {formatBytes(storageUsed)}
                  </p>
                  <p className="text-sm text-muted mt-1">
                    {t('more.storage.of')} {formatBytes(storageLimit)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-2xl font-bold ${
                      storagePercent > 90
                        ? 'text-red-400'
                        : storagePercent > 70
                        ? 'text-orange-400'
                        : 'text-purple'
                    }`}
                  >
                    {storagePercent}%
                  </p>
                  <p className="text-xs text-muted">{t('storage.used')}</p>
                </div>
              </div>

              <div className="relative w-full bg-white/10 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    storagePercent > 90
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : storagePercent > 70
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}
                  style={{ width: `${Math.min(storagePercent, 100)}%` }}
                >
                  <div className="h-full w-full bg-white/20 animate-pulse"></div>
                </div>
              </div>

              {!isPro && storagePercent > 70 && (
                <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-purple flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">
                        {t('storage.needMoreSpace')}
                      </p>
                      <p className="text-xs text-muted mb-3">
                        {t('storage.upgradeHint')}
                      </p>
                      <button
                        onClick={handleUpgradeToPro}
                        disabled={loading}
                        className="ripple-effect w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg font-semibold transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Zap className="w-4 h-4" />
                        {t('subscription.upgrade')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* === LANGUAGE & THEME === */}
          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg">
                {t('customization.title')}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted mb-2 block flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  {t('language.title')}
                </label>
                <select
                  value={i18n.language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                >
                  <option value="no">🇳🇴 {t('language.norwegian')}</option>
                  <option value="en">🇬🇧 {t('language.english')}</option>
                </select>
              </div>

              <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-purple" />
                  ) : (
                    <Sun className="w-5 h-5 text-orange-400" />
                  )}
                  <div>
                    <p className="font-medium">{t('theme.title')}</p>
                    <p className="text-xs text-muted">
                      {isDarkMode
                        ? t('customization.themeDark')
                        : t('customization.themeLight')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsDarkMode(!isDarkMode)
                    const themeName = !isDarkMode
                      ? t('theme.dark')
                      : t('theme.light')
                    showNotification(
                      t('notifications.themeChanged', { theme: themeName }),
                      'success'
                    )
                  }}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    isDarkMode ? 'bg-purple-600' : 'bg-gray-400'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform flex items-center justify-center ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  >
                    {isDarkMode ? (
                      <Moon className="w-3 h-3 text-purple-600" />
                    ) : (
                      <Sun className="w-3 h-3 text-orange-500" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* === SETTINGS === */}
          <section className="glass rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleSection('settings')}
              className="w-full p-6 hover:bg-white/5 transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-600/20 rounded-lg">
                  <Settings className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-lg">{t('settings.title')}</h3>
              </div>
              <ChevronRight
                className={`w-5 h-5 transition-transform duration-300 ${
                  expandedSection === 'settings' ? 'rotate-90' : ''
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                expandedSection === 'settings' ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="px-6 pb-6 space-y-2">
                <button
                  onClick={() => navigate('/documents')}
                  className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
                >
                  <FileText className="w-5 h-5 text-purple" />
                  <div className="flex-1">
                    <p className="font-medium">
                      {t('nav:documents', 'Documents')}
                    </p>
                    <p className="text-xs text-muted">
                      {t(
                        'documents:subtitle',
                        'Manage your uploaded documents'
                      )}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50" />
                </button>

                <button
                  onClick={() => navigate('/security')}
                  className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
                >
                  <Shield className="w-5 h-5 text-purple" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{t('settings.security')}</p>
                      {(pinEnabled || biometricEnabled) && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted">
                      {t('more.settings.securityDesc')}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50" />
                </button>

                <button className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10">
                  <Bell className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="font-medium">{t('settings.notifications')}</p>
                    <p className="text-xs text-muted">
                      {t('more.settings.notificationsDesc')}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50" />
                </button>

                <label className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10 cursor-pointer">
                  <Upload className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <p className="font-medium">{t('more.import.title')}</p>
                    <p className="text-xs text-muted">
                      {t('more.import.description')}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50" />
                  <input
                    type="file"
                    accept=".zip,.json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="space-y-6">
          {/* === ACCOUNT === */}
          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-600/20 rounded-lg">
                <User className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-lg">{t('account.title')}</h3>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate('/profile')}
                className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
              >
                <User className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium">{t('account.profile')}</p>
                  <p className="text-xs text-muted">
                    {t('more.account.profileDesc')}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </button>

              <button
                onClick={() => navigate('/subscription')}
                className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
              >
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{t('account.subscription')}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isPro
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {isPro ? t('subscription.pro') : t('subscription.free')}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    {t('more.account.subscriptionDesc')}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </button>

              <button
                onClick={() => navigate('/trash')}
                className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
              >
                <Trash2 className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium">Trash</p>
                  <p className="text-xs text-muted">
                    Deleted photos (auto-delete after 7 days)
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </button>

              <button
                onClick={onLogout}
                className="ripple-effect w-full bg-red-500/10 hover:bg-red-500/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-red-500/30 text-red-400"
              >
                <LogOut className="w-5 h-5" />
                <div className="flex-1">
                  <p className="font-medium">{t('account.logout')}</p>
                  <p className="text-xs text-muted">
                    {t('more.account.logoutDesc')}
                  </p>
                </div>
              </button>

              <button
                onClick={handleDeleteAccountClick}
                disabled={loading}
                className="ripple-effect w-full bg-red-500/10 hover:bg-red-500/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-red-500/30 text-red-400 disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                <div className="flex-1">
                  <p className="font-medium">{t('account.deleteAccount')}</p>
                  <p className="text-xs text-muted">
                    {t('more.account.deleteDesc')}
                  </p>
                </div>
              </button>
            </div>
          </section>

          {/* === INFO & HELP === */}
          <section className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-teal-600/20 rounded-lg">
                <Info className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="font-semibold text-lg">{t('info.title')}</h3>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigateToInfoPage('/help')}
                className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-3 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
              >
                <HelpCircle className="w-5 h-5 text-gray-400" />
                <p className="font-medium text-sm">{t('info.help')}</p>
                <ChevronRight className="w-4 h-4 opacity-50 ml-auto" />
              </button>

              <button
                onClick={() => navigateToInfoPage('/privacy')}
                className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-3 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
              >
                <FileText className="w-5 h-5 text-gray-400" />
                <p className="font-medium text-sm">{t('info.privacy')}</p>
                <ChevronRight className="w-4 h-4 opacity-50 ml-auto" />
              </button>

              <button
                onClick={() => navigateToInfoPage('/terms')}
                className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-3 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
              >
                <FileText className="w-5 h-5 text-gray-400" />
                <p className="font-medium text-sm">{t('info.terms')}</p>
                <ChevronRight className="w-4 h-4 opacity-50 ml-auto" />
              </button>

              <button
                onClick={() => navigate('/about')}
                className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-3 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
              >
                <Info className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{t('info.about')}</p>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* === ADMIN PANEL === */}
      {isAdmin && (
        <section className="glass rounded-2xl p-6 mt-6 border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-600/5 to-orange-600/5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-yellow-600/20 rounded-lg">
              <Crown className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="font-semibold text-lg">{t('admin.title')}</h3>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full ml-auto">
              {t('more.admin.access')}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <button
              onClick={() => {
                console.log('🔍 User management clicked')
                navigate('/admin')
              }}
              className="ripple-effect bg-yellow-600/10 hover:bg-yellow-600/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-yellow-500/30"
            >
              <Users className="w-5 h-5 text-yellow-400" />
              <div className="flex-1">
                <p className="font-medium">{t('admin.userManagement')}</p>
                <p className="text-xs text-muted">{t('more.admin.userDesc')}</p>
              </div>
              <ChevronRight className="w-5 h-5 opacity-50" />
            </button>

            <button
              onClick={() => {
                console.log('🔍 Database tools clicked')
                navigate('/admin')
              }}
              className="ripple-effect bg-yellow-600/10 hover:bg-yellow-600/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-yellow-500/30"
            >
              <HardDrive className="w-5 h-5 text-yellow-400" />
              <div className="flex-1">
                <p className="font-medium">{t('admin.databaseTools')}</p>
                <p className="text-xs text-muted">
                  {t('more.admin.databaseDesc')}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 opacity-50" />
            </button>
          </div>

          {/* System Status - Storage Integrity */}
          <div className="mt-4 pt-4 border-t border-yellow-500/20">
            <SystemStatus />
          </div>

          {/* Migration Tools - Developer/Debug */}
          <div className="mt-4 pt-4 border-t border-yellow-500/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              <h4 className="font-semibold text-sm text-orange-400">
                🔧 {t('admin.migration.title')}
              </h4>
            </div>

            <p className="text-xs text-muted mb-3">
              {t('admin.migration.description')}
            </p>

            <div className="grid md:grid-cols-2 gap-3">
              <button
                onClick={handleMigrateAlbums}
                disabled={migrating || loading}
                className="ripple-effect bg-orange-600/10 hover:bg-orange-600/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-2 bg-orange-600/30 rounded-lg">
                  <Folder className="w-5 h-5 text-orange-300" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {migrating
                      ? t('admin.migration.runningAlbums')
                      : t('admin.migration.fixAlbums')}
                  </p>
                  <p className="text-xs text-muted">
                    {t('admin.migration.fixAlbumsDesc')}
                  </p>
                </div>
              </button>

              <button
                onClick={handleMigratePhotos}
                disabled={migrating || loading}
                className="ripple-effect bg-orange-600/10 hover:bg-orange-600/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-2 bg-orange-600/30 rounded-lg">
                  <Image className="w-5 h-5 text-orange-300" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {migrating
                      ? t('admin.migration.runningPhotos')
                      : t('admin.migration.fixPhotos')}
                  </p>
                  <p className="text-xs text-muted">
                    {t('admin.migration.fixPhotosDesc')}
                  </p>
                </div>
              </button>

              <button
                onClick={handleMigrateDeletedField}
                disabled={migrating || loading}
                className="ripple-effect bg-purple-600/10 hover:bg-purple-600/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-2 bg-purple-600/30 rounded-lg">
                  <Trash2 className="w-5 h-5 text-purple" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {migrating
                      ? 'Running Migration...'
                      : 'Phase 4B: Add Deleted Field'}
                  </p>
                  <p className="text-xs text-muted">
                    Add deleted:false to all photos (required for trash feature)
                  </p>
                </div>
              </button>

              <button
                onClick={handleMigrateOrderField}
                disabled={migrating || loading}
                className="ripple-effect bg-purple-600/10 hover:bg-purple-600/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-2 bg-purple-600/30 rounded-lg">
                  <GripVertical className="w-5 h-5 text-purple" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {migrating
                      ? 'Running Migration...'
                      : 'Phase 4B-2: Add Order Field'}
                  </p>
                  <p className="text-xs text-muted">
                    Add order field to photos for manual sorting
                  </p>
                </div>
              </button>

              {/* Migration Result Display */}
              {migrationResult && (
                <div className="mt-3 bg-green-600/10 border border-green-500/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-green-400 mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <p className="font-semibold text-sm">
                      {t('admin.migration.complete')}
                    </p>
                  </div>
                  <p className="text-xs text-muted">
                    {t('admin.migration.summary', {
                      type: migrationResult.type,
                      fixed: migrationResult.fixed,
                      skipped: migrationResult.skipped,
                      total: migrationResult.total,
                    })}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {t('admin.migration.refresh')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Counter Reconciliation - P0-3 */}
          <div className="mt-4 pt-4 border-t border-yellow-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-blue-400" />
              <h4 className="font-semibold text-sm text-blue-400">
                Counter Reconciliation
              </h4>
            </div>

            <p className="text-xs text-muted mb-3">
              Sjekk og fiks album count, photo count og storage used for alle
              brukere.
            </p>

            <button
              onClick={handleManualReconcile}
              disabled={reconciling}
              className="ripple-effect bg-blue-600/10 hover:bg-blue-600/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              <div className="p-2 bg-blue-600/30 rounded-lg">
                <Database className="w-5 h-5 text-blue-300" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {reconciling ? 'Kjører...' : 'Kjør Reconciliation'}
                </p>
                <p className="text-xs text-muted">
                  Verifiser og korrigere tellere for alle brukere
                </p>
              </div>
            </button>

            {reconcileResult && (
              <div
                className={`mt-3 p-3 rounded-lg ${
                  reconcileResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}
              >
                <p className="text-sm">{reconcileResult.message}</p>
              </div>
            )}

            {lastReconciliation && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Siste kjøring:</strong>{' '}
                  {lastReconciliation.timestamp
                    ?.toDate?.()
                    ?.toLocaleString('nb-NO') || 'N/A'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Brukere prosessert: {lastReconciliation.usersProcessed || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Issues funnet: {lastReconciliation.issuesFound || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Issues fikset: {lastReconciliation.issuesFixed || 0}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* === DELETE CONFIRMATION MODAL (Step 1) === */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass rounded-2xl p-6 max-w-md w-full border-2 border-red-500/30 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-600/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold">
                {t('modals.deleteAccountTitle')}
              </h3>
            </div>

            {/* EXPLICIT WARNING */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-red-400 mb-2">
                ⚠️ {t('modals.deleteWarning')}
              </p>
              <p className="text-sm opacity-90 mb-2">
                {t('modals.deleteWillRemove')}
              </p>
              <ul className="text-sm opacity-90 space-y-1 list-disc list-inside">
                <li>{t('modals.deleteItem1')}</li>
                <li>{t('modals.deleteItem2')}</li>
                <li>{t('modals.deleteItem3')}</li>
                <li>{t('modals.deleteItem4')}</li>
              </ul>
            </div>

            <p className="text-muted mb-6 text-sm">
              {t('modals.deleteAccountMessage')}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="ripple-effect flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-semibold transition disabled:opacity-50"
              >
                {t('buttons.cancel')}
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="ripple-effect flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === PASSWORD RE-AUTHENTICATION MODAL (Step 2) === */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass rounded-2xl p-6 max-w-md w-full border-2 border-red-500/30 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-600/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold">Confirm Your Password</h3>
            </div>

            <p className="text-muted mb-4 text-sm">
              For security, please enter your password to confirm account
              deletion.
            </p>

            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && deletePassword) {
                  deleteAccount()
                }
              }}
              autoFocus
              disabled={loading}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setDeletePassword('')
                }}
                disabled={loading}
                className="ripple-effect flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-semibold transition disabled:opacity-50"
              >
                {t('buttons.cancel')}
              </button>
              <button
                onClick={deleteAccount}
                disabled={loading || !deletePassword}
                className="ripple-effect flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === COMING SOON MODAL === */}
      <ComingSoonModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        featureName={aiFeatureName}
        description={aiFeatureDescription}
      />

      {/* === SHARE PIXTR MODAL === */}
      <SharePixtrModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* === UPGRADE PROMPT MODAL === */}
      <UpgradePromptModal
        isOpen={showUpgradeModal !== null}
        onClose={() => setShowUpgradeModal(null)}
        feature={showUpgradeModal}
      />
    </div>
  )
}

export default MorePage
