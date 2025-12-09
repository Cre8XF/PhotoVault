/**
 * useStorageCalc Hook - NO-OP IMPLEMENTATION
 *
 * 🚨 FIREBASE STORAGE SCANNING REMOVED 🚨
 *
 * The previous implementation used Firebase Storage listAll() which:
 * - Caused 403 permission errors
 * - Made albums disappear after page refresh
 * - Scanned user storage folders unnecessarily
 *
 * Pixtr now uses Cloudflare R2 for metadata storage.
 * Storage usage will be calculated from R2 metadata in a future update.
 *
 * This hook now returns safe default values to keep the UI working.
 */

import { useState, useEffect } from 'react';

export const useStorageCalc = (userId, propStorageUsed, propStorageLimit) => {
  // Use prop values if provided, otherwise return zeros
  const [storageUsed] = useState(propStorageUsed || 0);
  const [storageLimit] = useState(propStorageLimit || 5 * 1024 * 1024 * 1024); // 5GB default
  const [storageLoading] = useState(false);

  /**
   * Format bytes to human-readable string
   */
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Calculate storage percentage
   */
  const storagePercentage = Math.min(Math.round((storageUsed / storageLimit) * 100), 100);

  /**
   * Calculate remaining storage
   */
  const storageRemaining = Math.max(storageLimit - storageUsed, 0);

  /**
   * NO-OP: Storage calculation disabled
   * Future: Calculate from R2 metadata
   */
  const calculateStorageUsed = async () => {
    console.log('📊 [useStorageCalc] Storage scanning disabled - using R2 metadata instead');
    return storageUsed;
  };

  /**
   * NO-OP: Refresh disabled
   */
  const refreshStorage = async () => {
    console.log('📊 [useStorageCalc] Storage refresh disabled - using R2 metadata instead');
  };

  return {
    storageUsed,
    storageLimit,
    storageLoading,
    storagePercentage,
    storageRemaining,
    calculateStorageUsed,
    refreshStorage,
    formatBytes
  };
};
