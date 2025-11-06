// ============================================================================
// AppRoutes - Phase 2: Centralized Routing Configuration
// ============================================================================
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useStore from '../state/store';
import { useSecurityContext } from '../contexts/SecurityContext';

// Eager-loaded components (critical path)
import LoginPage from '../pages/LoginPage';
import PINLockScreen from '../components/PINLockScreen';

// Lazy-loaded pages (code splitting)
const HomeDashboard = lazy(() => import('../pages/HomeDashboard'));
const AlbumsPage = lazy(() => import('../pages/AlbumsPage'));
const AlbumPage = lazy(() => import('../pages/AlbumPage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const MorePage = lazy(() => import('../pages/MorePage'));
const SecuritySettings = lazy(() => import('../pages/SecuritySettings'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const SubscriptionPage = lazy(() => import('../pages/SubscriptionPage'));
// PHASE 2: AI Settings - Disabled for MVP (moved to experimental/ai/)
// const AISettingsPage = lazy(() => import('../pages/AISettingsPage'));
const VaultPage = lazy(() => import('../pages/VaultPage'));

/**
 * Loading fallback component
 */
const LoadingFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="spinner" />
  </div>
);

/**
 * Protected route wrapper
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const user = useStore((state) => state.user);
  const userProfile = useStore((state) => state.userProfile);
  const loading = useStore((state) => state.loading);

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && userProfile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * Main routing configuration
 */
export const AppRoutes = () => {
  const user = useStore((state) => state.user);
  const loading = useStore((state) => state.loading);
  const { isLocked, pinEnabled } = useSecurityContext();

  // Show loading spinner during initial auth check
  if (loading) {
    return <LoadingFallback />;
  }

  // Show PIN lock screen if enabled and locked
  if (isLocked && pinEnabled && user) {
    return <PINLockScreen />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" replace />}
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/albums"
          element={
            <ProtectedRoute>
              <AlbumsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/albums/:albumId"
          element={
            <ProtectedRoute>
              <AlbumPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/more"
          element={
            <ProtectedRoute>
              <MorePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <SubscriptionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/security"
          element={
            <ProtectedRoute>
              <SecuritySettings />
            </ProtectedRoute>
          }
        />

        {/* PHASE 2: AI Settings - Disabled for MVP
        <Route
          path="/ai-settings"
          element={
            <ProtectedRoute>
              <AISettingsPage />
            </ProtectedRoute>
          }
        />
        */}

        <Route
          path="/vault"
          element={
            <ProtectedRoute>
              <VaultPage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
