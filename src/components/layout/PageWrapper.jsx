// ============================================================================
// PageWrapper Component - Shared layout for "function world" pages
// ============================================================================
import React from 'react';

/**
 * PageWrapper - Reusable layout component for all world pages
 *
 * Handles common states: loading, error, empty, and success (children)
 *
 * @param {string} title - Optional page title
 * @param {boolean} loading - Show loading spinner
 * @param {string|null} error - Error message to display
 * @param {boolean} empty - Whether to show empty state
 * @param {string} emptyMessage - Custom empty state message
 * @param {React.ReactNode} children - Main page content
 */
export function PageWrapper({
  title,
  loading,
  error,
  empty,
  emptyMessage,
  children
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {title && (
        <header className="px-4 py-3 border-b border-border/40">
          <h1 className="text-lg font-semibold">{title}</h1>
        </header>
      )}

      <main className="flex-1 flex items-center justify-center px-4 py-6">
        {loading && (
          <div className="text-muted-foreground flex flex-col items-center gap-3">
            <div className="spinner" />
            <span>Loading…</span>
          </div>
        )}

        {!loading && error && (
          <div className="text-destructive text-center max-w-sm">
            <p className="text-lg font-semibold mb-2">Error</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && empty && (
          <div className="text-muted-foreground text-center max-w-sm">
            <p>{emptyMessage || 'Nothing to show here yet.'}</p>
          </div>
        )}

        {!loading && !error && !empty && children}
      </main>
    </div>
  );
}
