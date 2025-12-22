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
  Heart,
  Zap,
  TrendingUp,
  Clock,
  AlertCircle,
  ExternalLink,
  Moon,
  Sun,
  Upload,
  Check,
  Lock,
  Folder,
  Image,
  Layout,
  Mail,
} from 'lucide-react'
import { ROUTES } from '../routes'
import { useSecurityContext } from '../contexts/SecurityContext'
import {
  getFirestore,
  doc,
  deleteDoc,
  updateDoc,
  collection,
  getDocs,
} from 'firebase/firestore'

import { getAuth, deleteUser as deleteAuthUser } from 'firebase/auth'

// Firebase Storage imports removed - scanning causes 403 errors
// Storage operations handled by firebase.js CRUD functions

import { db, migrateAlbumsAddUserId, migratePhotosAddUserId } from '../firebase'
import ComingSoonModal from '../components/ComingSoonModal'
import { useStorageCalc } from '../hooks/useStorageCalc'
import SystemStatus from '../components/admin/SystemStatus'
import useStore from '../state/store'
import { sendVerificationEmail } from '../utils/emailVerification'

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
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiFeatureName, setAIFeatureName] = useState('')
  const [aiFeatureDescription, setAIFeatureDescription] = useState('')
  const [migrating, setMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState(null)
  const [sendingVerification, setSendingVerification] = useState(false)

  const { pinEnabled, biometricEnabled } = useSecurityContext()

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

  // Check for isPro: could be boolean field or role field
  const isPro =
    user?.isPro === true || user?.role === 'pro' || user?.role === 'admin'

  // Check for isAdmin: check role field
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true

  // 🔒 SIKRET: Statistics med array-guards
  const stats = React.useMemo(() => {
    return {
      totalPhotos: safePhotos.length || 0,
      totalAlbums: safeAlbums.length || 0,
      favorites: safePhotos.filter((p) => p.favorite).length || 0,
      aiAnalyzed: safePhotos.filter((p) => p.aiAnalyzed).length || 0,
      recentUploads:
        safePhotos.filter((p) => {
          if (!p.createdAt) return false
          const uploadDate = new Date(p.createdAt)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return uploadDate > weekAgo
        }).length || 0,
    }
  }, [safePhotos, safeAlbums])

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
  const handleUpgradeToPro = async () => {
    const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY
    const stripeCheckoutUrl = import.meta.env.VITE_STRIPE_CHECKOUT_URL

    if (!stripePublicKey || !stripeCheckoutUrl) {
      console.warn('Stripe keys not configured')
      showNotification(t('notifications.upgradeUnavailable'), 'error')
      return
    }

    try {
      setLoading(true)

      const checkoutUrl = `${stripeCheckoutUrl}?client_reference_id=${user.uid}&customer_email=${user.email}`
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Error initiating Stripe checkout:', error)
      showNotification(t('more.subscription.upgradeError'), 'error')
    } finally {
      setLoading(false)
    }
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
  // === SHARE FUNCTION ===
  // ============================================================================
  const handleShareProfile = async () => {
    const shareBaseUrl =
      import.meta.env.VITE_SHARE_BASE_URL || 'https://photovault.app/u/'
    const shareLink = `${shareBaseUrl}${user.uid}`

    try {
      await navigator.clipboard.writeText(shareLink)
      showNotification(t('notifications.copied'), 'success')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      showNotification(t('more.share.failed'), 'error')
    }
  }

  // ============================================================================
  // === DELETE ACCOUNT ===
  // ============================================================================
  const deleteAccount = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)
      console.log('Deleting account for:', user.uid)

      const auth = getAuth()
      const db = getFirestore()

      const collections = ['photos', 'albums', 'shared', 'favorites']

      for (const collectionName of collections) {
        const collectionRef = collection(db, 'users', user.uid, collectionName)
        const snapshot = await getDocs(collectionRef)

        await Promise.all(snapshot.docs.map((doc) => deleteDoc(doc.ref)))
      }

      await deleteDoc(doc(db, 'users', user.uid))

      // Storage deletion removed - Firebase Storage scanning causes 403 errors
      // Individual photo deletions already handled by CRUD operations
      console.log('✅ User Firestore data deleted')

      const currentUser = auth.currentUser
      if (currentUser) {
        await deleteAuthUser(currentUser)
      }

      showNotification(t('notifications.deleted'), 'success')

      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    } catch (error) {
      console.error('Error deleting account:', error)
      showNotification(t('more.account.deleteError'), 'error')
      setShowDeleteConfirm(false)
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

  // === EXTERNAL LINKS & INFO PAGES ===
  const openInfoPage = (type) => {
    const lang = i18n.language.startsWith('no') ? 'no' : 'en'

    const file = lang === 'no' ? `/info/${type}.no.html` : `/info/${type}.html`

    window.open(file, '_blank', 'noopener,noreferrer')
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
              {sendingVerification ? t('auth:sendingVerification') : t('auth:verify')}
            </button>
          </div>
        </div>
      )}

      {/* === PROFILE HEADER === */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-8 text-on-brand">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-3xl font-bold border-4 border-white/30">
                  {user?.displayName?.[0]?.toUpperCase() ||
                    user?.email?.[0]?.toUpperCase() ||
                    'U'}
                </div>
                {(pinEnabled || biometricEnabled) && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-white">
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
                <p className="text-white/90 text-sm">{user?.email}</p>
                {isAdmin && (
                  <p className="text-white/70 text-xs mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {t('more.admin.accountLabel', 'Admin account')}
                  </p>
                )}
              </div>
            </div>
            {!isPro && (
              <button
                onClick={handleUpgradeToPro}
                disabled={loading}
                className="ripple-effect bg-white/20 backdrop-blur-xl hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 border border-white/30 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                {t('subscription.upgrade')}
              </button>
            )}
            {isPro && (
              <div className="bg-yellow-500/20 backdrop-blur-xl border border-yellow-500/30 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-300" />
                <span className="font-semibold">{t('subscription.pro')}</span>
              </div>
            )}
          </div>

          {/* === QUICK STATS === */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Folder className="w-3 h-3" />
                {t('common:albums')}
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.totalAlbums}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Image className="w-3 h-3" />
                {t('common:photos')}
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.totalPhotos}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Heart className="w-3 h-3" />
                {t('common:favorites')}
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.favorites}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Folder className="w-3 h-3" />
                {t('common:unassigned')}
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.totalPhotos - stats.favorites}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Clock className="w-3 h-3" />
                {t('more.stats.recentUploads')}
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.recentUploads}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* === QUICK ACTIONS === */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => navigate(ROUTES.TOOLS)}
          className="ripple-effect glass rounded-xl p-4 hover:bg-white/10 transition flex flex-col items-center gap-2 text-center"
        >
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-medium">Create</span>
        </button>

        <button
          onClick={() => navigate('/security')}
          className="ripple-effect glass rounded-xl p-4 hover:bg-white/10 transition flex flex-col items-center gap-2 text-center"
        >
          <div className="p-3 bg-purple-600/20 rounded-xl">
            <Shield className="w-6 h-6 text-purple-400" />
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
        </button>
      </div>

      {/* === MAIN CONTENT GRID === */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* === LEFT COLUMN === */}
        <div className="space-y-6">
          {/* === STORAGE === */}
          <section className="glass rounded-2xl p-6 border-2 border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <HardDrive className="w-5 h-5 text-purple-400" />
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
                  <p className="text-sm opacity-70 mt-1">
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
                        : 'text-purple-400'
                    }`}
                  >
                    {storagePercent}%
                  </p>
                  <p className="text-xs opacity-70">{t('storage.used')}</p>
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
                    <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">
                        {t('storage.needMoreSpace')}
                      </p>
                      <p className="text-xs opacity-70 mb-3">
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
                <label className="text-sm opacity-70 mb-2 block flex items-center gap-2">
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
                    <Moon className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-orange-400" />
                  )}
                  <div>
                    <p className="font-medium">{t('theme.title')}</p>
                    <p className="text-xs opacity-70">
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
                  onClick={() => navigate('/security')}
                  className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
                >
                  <Shield className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{t('settings.security')}</p>
                      {(pinEnabled || biometricEnabled) && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <p className="text-xs opacity-70">
                      {t('more.settings.securityDesc')}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50" />
                </button>

                <button
                  onClick={() => navigate('/vault')}
                  className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
                >
                  <Lock className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <p className="font-medium">
                      {t('vault.title', { defaultValue: 'Secure Vault' })}
                    </p>
                    <p className="text-xs opacity-70">
                      {t('vault.description', {
                        defaultValue: 'Encrypted photo storage',
                      })}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50" />
                </button>

                <button className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10">
                  <Bell className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="font-medium">{t('settings.notifications')}</p>
                    <p className="text-xs opacity-70">
                      {t('more.settings.notificationsDesc')}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50" />
                </button>

                <label className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center gap-3 text-left border border-white/10 cursor-pointer">
                  <Upload className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <p className="font-medium">{t('more.import.title')}</p>
                    <p className="text-xs opacity-70">
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
                  <p className="text-xs opacity-70">
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
                  <p className="text-xs opacity-70">
                    {t('more.account.subscriptionDesc')}
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
                  <p className="text-xs opacity-70">
                    {t('more.account.logoutDesc')}
                  </p>
                </div>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="ripple-effect w-full bg-red-500/10 hover:bg-red-500/20 p-4 rounded-xl transition flex items-center gap-3 text-left border border-red-500/30 text-red-400 disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                <div className="flex-1">
                  <p className="font-medium">{t('account.deleteAccount')}</p>
                  <p className="text-xs opacity-70">
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
                onClick={() => openInfoPage('help')}
                className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-3 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
              >
                <HelpCircle className="w-5 h-5 text-gray-400" />
                <p className="font-medium text-sm">{t('info.help')}</p>
                <ExternalLink className="w-4 h-4 opacity-50 ml-auto" />
              </button>

              <button
                onClick={() => openInfoPage('privacy')}
                className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-3 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
              >
                <FileText className="w-5 h-5 text-gray-400" />
                <p className="font-medium text-sm">{t('info.privacy')}</p>
                <ExternalLink className="w-4 h-4 opacity-50 ml-auto" />
              </button>

              <button
                onClick={() => openInfoPage('terms')}
                className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-3 rounded-xl transition flex items-center gap-3 text-left border border-white/10"
              >
                <FileText className="w-5 h-5 text-gray-400" />
                <p className="font-medium text-sm">{t('info.terms')}</p>
                <ExternalLink className="w-4 h-4 opacity-50 ml-auto" />
              </button>

              <div className="bg-white/5 p-3 rounded-xl flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-gray-400" />
                  <p className="font-medium text-sm">{t('info.about')}</p>
                </div>
                <span className="text-xs opacity-70 font-mono">
                  {t('info.version')} {import.meta.env.VITE_VERSION || '7.1'}
                </span>
              </div>
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
                <p className="text-xs opacity-70">{t('more.admin.userDesc')}</p>
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
                <p className="text-xs opacity-70">
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

            <p className="text-xs opacity-70 mb-3">
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
                  <p className="text-xs opacity-70">
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
                  <p className="text-xs opacity-70">
                    {t('admin.migration.fixPhotosDesc')}
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
                  <p className="text-xs opacity-70">
                    {t('admin.migration.summary', {
                      type: migrationResult.type,
                      fixed: migrationResult.fixed,
                      skipped: migrationResult.skipped,
                      total: migrationResult.total,
                    })}
                  </p>
                  <p className="text-xs opacity-70 mt-1">
                    {t('admin.migration.refresh')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* === DELETE CONFIRMATION MODAL === */}
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
            <p className="opacity-70 mb-6">
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
                onClick={deleteAccount}
                disabled={loading}
                className="ripple-effect flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {t('buttons.deletePermanent')}
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
    </div>
  )
}

export default MorePage
