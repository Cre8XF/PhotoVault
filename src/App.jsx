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
const HomeDashboard = lazy(() => import('./pages/HomeDashboard'))
const AlbumsPage = lazy(() => import('./pages/AlbumsPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const MorePage = lazy(() => import('./pages/MorePage'))
const AlbumPage = lazy(() => import('./pages/AlbumPage'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const SecuritySettings = lazy(() => import('./pages/SecuritySettings'))
const VaultPage = lazy(() => import('./pages/VaultPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'))
const PublicAlbumPage = lazy(() => import('./pages/PublicAlbumPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

// Function Worlds - Phase 1 - Lazy loaded
const ToolsPage = lazy(() => import('./pages/ToolsPage'))
const CollageTemplatesPage = lazy(() => import('./pages/CollageTemplatesPage'))
const CollageNewPage = lazy(() => import('./pages/CollageNewPage'))
const CollageEditPage = lazy(() => import('./pages/CollageEditPage'))
const PhotoPage = lazy(() => import('./pages/PhotoPage'))
const SlideshowPage = lazy(() => import('./pages/SlideshowPage'))
const EditorPage = lazy(() => import('./features/editor/pages/EditorPage'))

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
import Particles from './components/Particles'
import PINLockScreen from './components/PINLockScreen'
import NotificationPanel from './components/NotificationPanel'
import ToastContainer from './components/ToastContainer'
import LoadingSpinner from './components/LoadingSpinner'
import VerificationBanner from './components/VerificationBanner'

// Hooks
import useAuth from './hooks/useAuth'
import usePhotoData from './hooks/usePhotoData'
import useStore from './state/store'
import { useToast } from './hooks/useToast'

// Icons
import { Home, FolderOpen, Plus, Search, Menu, Bell, User } from 'lucide-react'

/**
 * Main App Component with new architecture
 */
function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            <SecurityProvider>
              <Suspense
                fallback={
                  <div className="fixed inset-0 flex items-center justify-center">
                    <LoadingSpinner size="xl" />
                  </div>
                }
              >
              <Routes>
                {/* Public landing page */}
                <Route path="/" element={<PublicRoute />} />

                {/* Login page */}
                <Route path="/login" element={<LoginPage />} />

                {/* Public album sharing */}
                <Route path="/share/:slug" element={<PublicAlbumPage />} />

                {/* Firebase auth action handler - handles email verification links from Netlify */}
                <Route path="/__/auth/action" element={<AuthActionHandler />} />

                {/* Function Worlds */}
                <Route path={ROUTES.TOOLS} element={<ToolsPage />} />
                <Route
                  path={ROUTES.COLLAGE_TEMPLATES}
                  element={<CollageTemplatesPage />}
                />
                <Route path={ROUTES.COLLAGE_NEW} element={<CollageNewPage />} />
                <Route
                  path={ROUTES.COLLAGE_EDIT}
                  element={<CollageEditPage />}
                />
                <Route path={ROUTES.PHOTO} element={<PhotoPage />} />
                <Route path={ROUTES.SLIDESHOW} element={<SlideshowPage />} />
                <Route
                  path="/edit/:photoId"
                  element={
                    <Suspense fallback={
                      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a]">
                        <LoadingSpinner size="xl" />
                      </div>
                    }>
                      <EditorPage />
                    </Suspense>
                  }
                />

                {/* AI Tools */}
                <Route path={ROUTES.AI_TOOLS} element={<AIToolsPage />} />
                <Route path={ROUTES.AI_ENHANCE} element={<AIEnhancePage />} />
                <Route
                  path={ROUTES.AI_REMOVE_BG}
                  element={<AIRemoveBgPage />}
                />
                <Route path={ROUTES.AI_PORTRAIT} element={<AIPortraitPage />} />
                <Route path={ROUTES.AI_COLOR} element={<AIColorPage />} />
                <Route path={ROUTES.AI_UPSCALE} element={<AIUpscalePage />} />

                {/* Collage view */}
                <Route path="/collage/:id" element={<CollageView />} />

                {/* All authenticated routes - wrapped in ProtectedRoute */}
                <Route path="/*" element={
                  <ProtectedRoute>
                    <AppContent />
                  </ProtectedRoute>
                } />
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
      navigate('/home', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
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

  // Redirect unauthenticated users to login
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
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
  const { user, userProfile, loading, handleLogout, isAdmin, emailVerified } = useAuth()
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
    } else if (currentPath === '/search') {
      context = 'search'
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
    currentPath !== '/settings' &&
    currentPath !== '/subscription' &&
    !currentPath.startsWith('/collage/')

  // Check if email verification banner should be shown
  const showVerificationBanner = user && !emailVerified

  return (
    <div className="min-h-screen relative">
      <Particles />

      {/* Email Verification Banner */}
      <VerificationBanner user={user} />

      {/* Main content - React Router based rendering */}
      <main className={`relative z-10 ${showVerificationBanner ? 'pt-16 md:pt-14' : ''}`}>
        <Routes>
          <Route
            path="/home"
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
            path="/search"
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

          <Route path="/security" element={<SecuritySettings />} />

          <Route path="/vault" element={<VaultPage />} />

          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/settings" element={<SettingsPage />} />

          <Route
            path="/subscription"
            element={<SubscriptionPage user={userProfile || user} />}
          />

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

          {isAdmin && <Route path="/admin" element={<AdminDashboard />} />}
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
          <div className="flex justify-around items-center gap-2">
            {/* Home */}
            <button
              onClick={() => navigate('/home')}
              className={`ripple-effect nav-item-premium ${
                location.pathname === '/home' ? 'active' : ''
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav:home')}</span>
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
            >
              <Plus className="w-7 h-7 text-white" />
            </button>

            {/* Search */}
            <button
              onClick={() => navigate('/search')}
              className={`ripple-effect nav-item-premium ${
                location.pathname === '/search' ? 'active' : ''
              }`}
            >
              <Search className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav:search')}</span>
            </button>

            {/* Account */}
            <button
              onClick={() => navigate('/more')}
              className={`ripple-effect nav-item-premium ${
                location.pathname === '/more' ? 'active' : ''
              }`}
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

      {notification && (
        <Notification notification={notification} onClose={clearNotification} />
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default App
