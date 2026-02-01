// ============================================================================
// APP.js – v6.0 Phase 2: Modern Architecture with Zustand & Hooks
// ============================================================================
import React, { lazy, Suspense } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from './i18n'

// Contexts & Providers
import AuthProvider from './providers/AuthProvider'
import {
  SecurityProvider,
  useSecurityContext,
} from './contexts/SecurityContext'
import { ToastProvider } from './contexts/ToastContext'

// Pages - Lazy loaded for performance
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const AuthActionHandler = lazy(() => import('./pages/AuthActionHandler'))
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'))
const VerifyComplete = lazy(() => import('./pages/VerifyComplete'))
const HomeDashboard = lazy(() => import('./pages/HomeDashboard'))
const AlbumsPage = lazy(() => import('./pages/AlbumsPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const MorePage = lazy(() => import('./pages/MorePage'))
const AlbumPage = lazy(() => import('./pages/AlbumPage'))
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'))
const FilesPage = lazy(() => import('./pages/FilesPage'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const SecuritySettings = lazy(() => import('./pages/SecuritySettings'))
const VaultPage = lazy(() => import('./pages/VaultPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'))
const BillingPage = lazy(() => import('./pages/BillingPage'))
const BillingSuccessPage = lazy(() => import('./pages/BillingSuccessPage'))
const BillingCancelPage = lazy(() => import('./pages/BillingCancelPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const HelpPage = lazy(() => import('./pages/HelpPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const PublicAlbumPage = lazy(() => import('./pages/PublicAlbumPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const TrashPage = lazy(() => import('./pages/TrashPage'))

// Function Worlds - Phase 1 - Lazy loaded
const ToolsPage = lazy(() => import('./pages/ToolsPage'))
const CollageTemplatesPage = lazy(() => import('./pages/CollageTemplatesPage'))
const CollageNewPage = lazy(() => import('./pages/CollageNewPage'))
const CollageEditPage = lazy(() => import('./pages/CollageEditPage'))
const PhotoPage = lazy(() => import('./pages/PhotoPage'))
const SlideshowPage = lazy(() => import('./pages/SlideshowPage'))
const EditorPage = lazy(() => import('./features/editor/pages/EditorPage'))
const EditorPageV4 = lazy(() => import('./features/editor/pages/EditorPageV4'))

// AI Tools - Phase 5 - Lazy loaded
const AIToolsPage = lazy(() => import('./pages/ai/AIToolsPage'))
const AIEnhancePage = lazy(() => import('./pages/ai/AIEnhancePage'))
const AIRemoveBgPage = lazy(() => import('./pages/ai/AIRemoveBgPage'))
const AIPortraitPage = lazy(() => import('./pages/ai/AIPortraitPage'))
const AIColorPage = lazy(() => import('./pages/ai/AIColorPage'))
const AIUpscalePage = lazy(() => import('./pages/ai/AIUpscalePage'))

// Collage View (for viewing saved collages) - Lazy loaded
const CollageView = lazy(() => import('./features/collage/pages/CollageView'))

// Route map
import { ROUTES } from './routes'

// Components
import ErrorBoundary from './components/ErrorBoundary'
import UploadModal from './components/UploadModal'
import AlbumModal from './components/AlbumModal'
import ConfirmModal from './components/ConfirmModal'
import Notification from './components/Notification'
import UpgradeModal from './components/UpgradeModal' // 🆕 FREEMIUM
import VerificationBanner from './components/VerificationBanner' // ✅ P0-2: Email verification
import Particles from './components/Particles'
import PINLockScreen from './components/PINLockScreen'
import NotificationPanel from './components/NotificationPanel'
import ToastContainer from './components/ToastContainer'
import Loading from './components/Loading'

// Hooks
import useAuth from './hooks/useAuth'
import usePhotoData from './hooks/usePhotoData'
import useStore from './state/store'
import { useToast } from './hooks/useToast'

// P3-B: Browser Detection
import {
  isRestrictedBrowserContext,
  getContextMessage,
  logBrowserContext,
  isLikelyFromEmailLink,
} from './utils/browserDetect'

// PATCH 5: Development utilities
import { runEnvDiagnostics } from './utils/envDiagnostics'

// Icons
import {
  Home,
  FolderOpen,
  Plus,
  Search,
  Menu,
  Bell,
  User,
  ExternalLink,
  FileText,
  Image,
  Folder,
} from 'lucide-react'

/**
 * EditorPageWrapper - Conditionally renders V3 or V4 editor based on settings
 */
function EditorPageWrapper() {
  const [useV4, setUseV4] = React.useState(() => {
    const saved = localStorage.getItem('useEditorV4')
    return saved === 'true'
  })

  // Listen for localStorage changes (when user toggles in settings)
  React.useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('useEditorV4')
      setUseV4(saved === 'true')
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (import.meta.env.DEV) {
    console.log(
      `🎨 Using Editor ${useV4 ? 'V4 (Google Photos style)' : 'V3 (Classic)'}`
    )
  }

  return useV4 ? <EditorPageV4 /> : <EditorPage />
}

/**
 * Main App Component with new architecture
 */
function App() {
  // P3-B: Browser context detection
  const [showBrowserContextBanner, setShowBrowserContextBanner] =
    React.useState(false)
  const [browserContextMessage, setBrowserContextMessage] = React.useState(null)

  // Initialize browser context detection on mount
  React.useEffect(() => {
    // PATCH 5: Run environment diagnostics in development
    runEnvDiagnostics(false) // Set to true for verbose output

    // Log browser context for debugging
    logBrowserContext()

    // P3-B: Check browser context
    if (isRestrictedBrowserContext() && isLikelyFromEmailLink()) {
      const message = getContextMessage()
      setBrowserContextMessage(message)
      setShowBrowserContextBanner(true)
    }
  }, [])

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            <SecurityProvider>
              {/* P3-B: Browser context banner */}
              {showBrowserContextBanner && browserContextMessage && (
                <div className="fixed top-0 left-0 right-0 z-[9998] bg-gradient-to-r from-blue-600/95 to-indigo-600/95 backdrop-blur-sm border-b border-white/20 shadow-lg">
                  <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                      <ExternalLink className="w-6 h-6 text-white flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">
                          {browserContextMessage.title}
                        </p>
                        <p className="text-white/90 text-xs mt-1">
                          {browserContextMessage.message}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowBrowserContextBanner(false)}
                        className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <Suspense
                fallback={
                  <div className="fixed inset-0 flex items-center justify-center">
                    <Loading size="xl" />
                  </div>
                }
              >
                <Routes>
                  {/* Public landing page */}
                  <Route path="/landing" element={<PublicRoute />} />

                  {/* Login page */}
                  <Route path="/login" element={<LoginPage />} />

                  {/* Public album sharing */}
                  <Route path="/share/:slug" element={<PublicAlbumPage />} />

                  {/* Email verification landing page - handleCodeInApp: true */}
                  <Route path="/verify-email" element={<VerifyEmailPage />} />

                  {/* Email verification completion page - redirect from verification email */}
                  <Route path="/verify-complete" element={<VerifyComplete />} />

                  {/* Firebase auth action handler - handles email verification links from Netlify */}
                  <Route
                    path="/__/auth/action"
                    element={<AuthActionHandler />}
                  />

                  {/* Function Worlds - Protected Routes */}
                  <Route
                    path={ROUTES.TOOLS}
                    element={
                      <ProtectedRoute>
                        <ToolsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.COLLAGE_TEMPLATES}
                    element={
                      <ProtectedRoute>
                        <CollageTemplatesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.COLLAGE_NEW}
                    element={
                      <ProtectedRoute>
                        <CollageNewPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.COLLAGE_EDIT}
                    element={
                      <ProtectedRoute>
                        <CollageEditPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.PHOTO}
                    element={
                      <ProtectedRoute>
                        <PhotoPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={ROUTES.SLIDESHOW}
                    element={
                      <ProtectedRoute>
                        <SlideshowPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/edit/:photoId"
                    element={
                      <ProtectedRoute>
                        <Suspense
                          fallback={
                            <div className="fixed inset-0 flex items-center justify-center editor-bg-primary">
                              <Loading size="xl" />
                            </div>
                          }
                        >
                          <EditorPageWrapper />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />

                  {/* ⚠️ PHASE 2: AI Tools - HIDDEN FOR LAUNCH (code kept latent) */}
                  {/* AI routes disabled - no navigation, deep links return 404 */}
                  {/*
                <Route path={ROUTES.AI_TOOLS} element={
                  <ProtectedRoute>
                    <AIToolsPage />
                  </ProtectedRoute>
                } />
                <Route path={ROUTES.AI_ENHANCE} element={
                  <ProtectedRoute>
                    <AIEnhancePage />
                  </ProtectedRoute>
                } />
                <Route
                  path={ROUTES.AI_REMOVE_BG}
                  element={
                    <ProtectedRoute>
                      <AIRemoveBgPage />
                    </ProtectedRoute>
                  }
                />
                <Route path={ROUTES.AI_PORTRAIT} element={
                  <ProtectedRoute>
                    <AIPortraitPage />
                  </ProtectedRoute>
                } />
                <Route path={ROUTES.AI_COLOR} element={
                  <ProtectedRoute>
                    <AIColorPage />
                  </ProtectedRoute>
                } />
                <Route path={ROUTES.AI_UPSCALE} element={
                  <ProtectedRoute>
                    <AIUpscalePage />
                  </ProtectedRoute>
                } />
                */}

                  {/* Collage viewer - Protected Route (uses PhotoPage for UX parity) */}
                  <Route
                    path="/collage/view/:id"
                    element={
                      <ProtectedRoute>
                        <PhotoPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Collage view - Protected Route */}
                  <Route
                    path="/collage/:id"
                    element={
                      <ProtectedRoute>
                        <CollageView />
                      </ProtectedRoute>
                    }
                  />

                  {/* All authenticated routes - wrapped in ProtectedRoute */}
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <AppContent />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </SecurityProvider>
          </ToastProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

/**
 * Public Route Component - Shows landing page for unauthenticated users
 * Redirects authenticated users to home
 */
function PublicRoute() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Redirect authenticated users to home
  React.useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="xl" />
      </div>
    )
  }

  if (user) {
    return null // While redirecting
  }

  return <LandingPage />
}

/**
 * Protected Route Component - Ensures user is authenticated
 * Redirects unauthenticated users to login
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Redirect unauthenticated users to landing
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/landing', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="xl" />
      </div>
    )
  }

  if (!user) {
    return null // While redirecting
  }

  return children
}

/**
 * App Content Component
 */
function AppContent() {
  const { t } = useTranslation(['common', 'nav'])
  const navigate = useNavigate()
  const location = useLocation()

  // Custom hooks
  const { user, userProfile, loading, handleLogout, isAdmin, emailVerified } =
    useAuth()
  const {
    albums,
    photos,
    handleUpload,
    handleAlbumSave,
    handleCreateAlbumFromUpload,
    handleDeletePhoto,
    handleSetAlbumCover,
    handleUpdatePhotoCount,
    toggleFavorite,
    refreshData,
  } = usePhotoData()

  // Determine user plan (FREE by default)
  const plan = userProfile?.plan || user?.plan || 'free'
  const isFreeUser = plan === 'free'

  // Security context
  const { isLocked, pinEnabled } = useSecurityContext()

  // Toast notifications
  const { toasts, removeToast } = useToast()

  // Zustand store
  const uploadModalOpen = useStore((state) => state.uploadModalOpen)
  const uploadInitialMode = useStore((state) => state.uploadInitialMode)
  const albumModalOpen = useStore((state) => state.albumModalOpen)
  const confirmModal = useStore((state) => state.confirmModal)
  const notification = useStore((state) => state.notification)
  const editingAlbum = useStore((state) => state.editingAlbum)
  const selectedPhotoIndex = useStore((state) => state.selectedPhotoIndex)
  const isDarkMode = useStore((state) => state.isDarkMode)
  const selectedAlbum = useStore((state) => state.selectedAlbum)
  const storageUsed = useStore((state) => state.storageUsed)
  const storageLimit = useStore((state) => state.storageLimit)
  const isFullscreen = useStore((state) => state.isFullscreen)
  const isWorldView = useStore((state) => state.isWorldView)

  const setUploadModalOpen = useStore((state) => state.setUploadModalOpen)
  const setUploadInitialMode = useStore((state) => state.setUploadInitialMode)
  const setAlbumModalOpen = useStore((state) => state.setAlbumModalOpen)
  const setEditingAlbum = useStore((state) => state.setEditingAlbum)
  const setConfirmModal = useStore((state) => state.setConfirmModal)
  const clearNotification = useStore((state) => state.clearNotification)
  const setSelectedAlbum = useStore((state) => state.setSelectedAlbum)
  const setTheme = useStore((state) => state.setTheme)

  // Photo context setters - Phase 2A
  const setCurrentPhotoId = useStore((state) => state.setCurrentPhotoId)
  const setPhotoContext = useStore((state) => state.setPhotoContext)
  const setPhotoOrder = useStore((state) => state.setPhotoOrder)
  const setPhotoIndex = useStore((state) => state.setPhotoIndex)

  // Context-aware photo source state
  const [photoSourceList, setPhotoSourceList] = React.useState([])
  const [photoSourceIndex, setPhotoSourceIndex] = React.useState(0)

  // Mobile keyboard detection - hide bottom nav when keyboard is open
  const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(false)
  const [initialHeight, setInitialHeight] = React.useState(
    typeof window !== 'undefined' ? window.innerHeight : 0
  )

  // ✅ P0-2: Email verification banner state
  const [bannerDismissed, setBannerDismissed] = React.useState(false)

  // Phase 2A: Handle photo click - Navigate to PhotoPage
  const handlePhotoClick = (photo, sourceList) => {
    const list = Array.isArray(sourceList) ? sourceList : photos
    const index = list.findIndex((p) => p.id === photo.id)
    const photoIndex = index >= 0 ? index : 0
    const photoIds = list.map((p) => p.id)

    // Determine context based on current page
    const currentPath = location.pathname
    let context = 'all'
    if (
      currentPath.startsWith('/albums') ||
      currentPath.startsWith('/album/') ||
      selectedAlbum
    ) {
      context = 'album'
    } else if (currentPath === '/') {
      // Check if it's favorites by seeing if sourceList is favoritePhotos
      const isFavorites = list.every((p) => p.favorite)
      context = isFavorites ? 'favorites' : 'all'
    }

    // Set global photo context state
    setCurrentPhotoId(photo.id)
    setPhotoContext(context)
    setPhotoOrder(photoIds)
    setPhotoIndex(photoIndex)

    // Keep legacy state for backward compatibility
    setPhotoSourceList(list)
    setPhotoSourceIndex(photoIndex)

    // Navigate to PhotoPage instead of opening modal
    navigate(`/photo/${photo.id}`, { state: { from: location } })
  }

  // Handle album click
  const handleAlbumClick = (album) => {
    setSelectedAlbum(album)
    navigate(`/album/${album.id}`)
  }

  // Handle navigate to photo from notification
  const handleNavigateToPhoto = (photoId) => {
    const photo = photos.find((p) => p.id === photoId)
    if (photo) {
      handlePhotoClick(photo)
    }
  }

  // Apply theme on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const isDark = savedTheme === 'dark'
    setTheme(isDark)
  }, [setTheme])

  // Global drag & drop for file uploads
  React.useEffect(() => {
    if (!user) return

    const handleGlobalDrop = (e) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files)
      const imageFiles = files.filter((f) => f.type.startsWith('image/'))

      if (imageFiles.length > 0 && !uploadModalOpen) {
        setUploadModalOpen(true)
        setTimeout(() => {
          const event = new CustomEvent('externalFileDrop', {
            detail: imageFiles,
          })
          window.dispatchEvent(event)
        }, 100)
      }
    }

    const handleGlobalDragOver = (e) => {
      e.preventDefault()
    }

    window.addEventListener('drop', handleGlobalDrop)
    window.addEventListener('dragover', handleGlobalDragOver)

    return () => {
      window.removeEventListener('drop', handleGlobalDrop)
      window.removeEventListener('dragover', handleGlobalDragOver)
    }
  }, [user, uploadModalOpen, setUploadModalOpen])

  // Save metadata on window unload (Phase 1)
  React.useEffect(() => {
    if (!user) return

    const saveMetadata = useStore.getState().saveMetadata

    const handleBeforeUnload = (e) => {
      // Force immediate save before page closes
      if (import.meta.env.DEV)
        console.log('🔄 [App] Saving metadata before page unload...')
      saveMetadata(true) // immediate save
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [user])

  // Set initial language on mount
  React.useEffect(() => {
    const savedLang = localStorage.getItem('photoVaultLanguage') || 'no'
    i18n.changeLanguage(savedLang)
  }, [])

  // Detect keyboard open/close on mobile - hide bottom nav when keyboard opens
  React.useEffect(() => {
    // Only run on mobile devices (width < 768px)
    if (window.innerWidth >= 768) return

    // Store initial viewport height on mount
    const initialVH = window.visualViewport?.height || window.innerHeight
    setInitialHeight(initialVH)

    const handleResize = () => {
      // Skip on desktop/tablet
      if (window.innerWidth >= 768) {
        setIsKeyboardOpen(false)
        return
      }

      // Use visualViewport if available (more accurate on iOS)
      const currentHeight = window.visualViewport?.height || window.innerHeight

      // Keyboard is considered open if viewport height shrinks by >25%
      // (keyboard typically takes 40-60% of screen on mobile)
      const heightDifference = initialHeight - currentHeight
      const threshold = 0.25
      const isOpen = heightDifference > initialHeight * threshold

      setIsKeyboardOpen(isOpen)
    }

    // Listen to both events for better cross-browser support
    window.addEventListener('resize', handleResize)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
    }
  }, [initialHeight])

  // ✅ NOTE: Auth guard moved to ProtectedRoute wrapper
  // AppContent now assumes user is authenticated

  // Show PIN lock screen if locked
  if (isLocked && pinEnabled) {
    return <PINLockScreen />
  }

  // Determine if we should show bottom navigation
  // Phase 1: Hide bottom nav when in any "world view"
  const currentPath = location.pathname
  const showBottomNav =
    !isWorldView &&
    !isFullscreen &&
    !currentPath.startsWith('/album/') &&
    currentPath !== '/admin' &&
    currentPath !== '/security' &&
    currentPath !== '/vault' &&
    currentPath !== '/profile' &&
    currentPath !== '/about' &&
    currentPath !== '/settings' &&
    currentPath !== '/subscription' &&
    !currentPath.startsWith('/collage/')

  return (
    <div className="min-h-screen relative">
      <Particles />

      {/* ✅ P0-2: Email verification banner */}
      {!bannerDismissed && (
        <VerificationBanner
          user={user}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      {/* Main content - React Router based rendering */}
      <main className="relative z-10">
        <Routes>
          {/* Photo Library is now the home page */}
          <Route
            path="/"
            element={
              <SearchPage
                photos={photos}
                albums={albums}
                onPhotoClick={handlePhotoClick}
                toggleFavorite={toggleFavorite}
                refreshData={refreshData}
              />
            }
          />

          {/* Silent redirects for backward compatibility */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/search" element={<Navigate to="/" replace />} />

          {/* HomeDashboard moved to /discover (accessible but not in nav) */}
          <Route
            path="/discover"
            element={
              <HomeDashboard
                albums={albums}
                photos={photos}
                user={userProfile || user}
                refreshData={refreshData}
                onPhotoClick={handlePhotoClick}
                onUpload={handleUpload}
              />
            }
          />

          <Route
            path="/albums"
            element={
              <AlbumsPage
                user={userProfile || user}
                albums={albums}
                photos={photos}
                onAlbumClick={handleAlbumClick}
                onPhotoClick={handlePhotoClick}
                toggleFavorite={toggleFavorite}
                refreshData={refreshData}
              />
            }
          />

          <Route
            path="/documents"
            element={
              <DocumentsPage
                photos={photos}
                onDeletePhoto={handleDeletePhoto}
              />
            }
          />

          <Route path="/files" element={<FilesPage />} />

          <Route
            path="/more"
            element={
              <MorePage
                user={userProfile || user}
                storageUsed={storageUsed}
                storageLimit={storageLimit}
                photos={photos}
                albums={albums}
                isDarkMode={isDarkMode}
                setIsDarkMode={setTheme}
                onLogout={handleLogout}
              />
            }
          />

          <Route
            path="/account"
            element={
              <MorePage
                user={userProfile || user}
                storageUsed={storageUsed}
                storageLimit={storageLimit}
                photos={photos}
                albums={albums}
                isDarkMode={isDarkMode}
                setIsDarkMode={setTheme}
                onLogout={handleLogout}
              />
            }
          />

          <Route path="/security" element={<SecuritySettings />} />

          <Route path="/vault" element={<VaultPage />} />

          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/about" element={<AboutPage />} />

          <Route path="/help" element={<HelpPage />} />

          <Route path="/privacy" element={<PrivacyPage />} />

          <Route path="/terms" element={<TermsPage />} />

          <Route path="/settings" element={<SettingsPage />} />

          <Route path="/trash" element={<TrashPage />} />

          <Route
            path="/subscription"
            element={<SubscriptionPage user={userProfile || user} />}
          />

          <Route path="/billing" element={<BillingPage />} />

          <Route path="/billing/success" element={<BillingSuccessPage />} />

          <Route path="/billing/cancel" element={<BillingCancelPage />} />

          <Route
            path="/album/:albumId"
            element={
              <AlbumPage
                albums={albums}
                user={userProfile || user}
                photos={photos}
                refreshData={refreshData}
                onDeletePhoto={handleDeletePhoto}
                onSetAlbumCover={handleSetAlbumCover}
                onUpload={handleUpload}
                onSaveAlbum={handleAlbumSave}
                onUpdatePhotoCount={handleUpdatePhotoCount}
                onToggleFavorite={toggleFavorite}
              />
            }
          />

          {isAdmin() && <Route path="/admin" element={<AdminDashboard />} />}
        </Routes>
      </main>

      {/* Floating Notification Bell - Bottom left */}
      {!isFreeUser && (
        <div className="fixed bottom-24 left-4 z-30">
          <NotificationPanel onNavigateToPhoto={handleNavigateToPhoto} />
        </div>
      )}

      {/* Bottom Navigation */}
      {showBottomNav && !isKeyboardOpen && (
        <nav className="bottom-nav-float">
          <div className="flex justify-around items-center gap-1">
            {/* Photos */}
            <button
              onClick={() => navigate('/')}
              className={`ripple-effect nav-item-premium ${
                location.pathname === '/' ? 'active' : ''
              }`}
              aria-label={t('nav:photos')}
            >
              <Image className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav:photos')}</span>
            </button>

            {/* Albums */}
            <button
              onClick={() => navigate('/albums')}
              className={`ripple-effect nav-item-premium ${
                location.pathname === '/albums' ? 'active' : ''
              }`}
            >
              <FolderOpen className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav:albums')}</span>
            </button>

            {/* Upload (center FAB) */}
            <button
              onClick={() => setUploadModalOpen(true)}
              className="ripple-effect bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-4 rounded-full shadow-lg transition transform hover:scale-110 -mt-6"
              aria-label={t('nav:upload')}
              data-upload-trigger
            >
              <Plus className="w-7 h-7 text-white" />
            </button>

            {/* Files */}
            <button
              onClick={() => navigate('/files')}
              className={`ripple-effect nav-item-premium ${
                location.pathname === '/files' ? 'active' : ''
              }`}
              aria-label={t('nav:files')}
            >
              <Folder className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav:files')}</span>
            </button>

            {/* Account */}
            <button
              onClick={() => navigate('/more')}
              className={`ripple-effect nav-item-premium ${
                location.pathname.startsWith('/more') ||
                location.pathname.startsWith('/profile') ||
                location.pathname.startsWith('/settings') ||
                location.pathname.startsWith('/account')
                  ? 'active'
                  : ''
              }`}
              aria-label={t('nav:account')}
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav:account')}</span>
            </button>
          </div>
        </nav>
      )}

      {/* Modals */}
      {uploadModalOpen && (
        <UploadModal
          isOpen={uploadModalOpen}
          initialMode={uploadInitialMode}
          albums={albums}
          onClose={() => {
            setUploadModalOpen(false)
            setUploadInitialMode('upload') // Reset to default
          }}
          onUpload={handleUpload}
          onCreateAlbum={handleCreateAlbumFromUpload}
        />
      )}

      {albumModalOpen && (
        <AlbumModal
          isOpen={albumModalOpen}
          editingAlbum={editingAlbum}
          onClose={() => {
            setAlbumModalOpen(false)
            setEditingAlbum(null)
          }}
          onSave={(albumData) => handleAlbumSave(albumData, editingAlbum)}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          isOpen={true}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal(null)}
          confirmLabel={confirmModal.confirmLabel || t('common:confirm')}
          cancelLabel={confirmModal.cancelLabel || t('common:cancel')}
        />
      )}

      {/* 🆕 FREEMIUM: Upgrade Modal */}
      <UpgradeModal />

      {notification && (
        <Notification notification={notification} onClose={clearNotification} />
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default App
