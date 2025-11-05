/**
 * useStorageCalc Hook
 * Handles storage calculation logic from Firebase Storage
 * Extracted from MorePage.jsx for better separation of concerns
 */

import { useState, useEffect } from 'react';
import { getStorage, ref as storageRef, listAll, getMetadata } from 'firebase/storage';

export const useStorageCalc = (userId, propStorageUsed, propStorageLimit) => {
  const [storageUsed, setStorageUsed] = useState(propStorageUsed || 0);
  const [storageLimit] = useState(propStorageLimit || 5 * 1024 * 1024 * 1024); // 5GB default
  const [storageLoading, setStorageLoading] = useState(false);

  /**
   * Calculate total storage used by user's files in Firebase Storage
   */
  const calculateStorageUsed = async () => {
    if (!userId) return 0;

    setStorageLoading(true);
    try {
      const storage = getStorage();
      const userFolderRef = storageRef(storage, `users/${userId}`);
      const result = await listAll(userFolderRef);

      let totalSize = 0;

      // Calculate size of all items
      const sizePromises = result.items.map(async (itemRef) => {
        try {
          const metadata = await getMetadata(itemRef);
          return metadata.size || 0;
        } catch (error) {
          console.warn(`Could not get metadata for ${itemRef.fullPath}:`, error);
          return 0;
        }
      });

      const sizes = await Promise.all(sizePromises);
      totalSize = sizes.reduce((acc, size) => acc + size, 0);

      // Recursively calculate for subfolders
      if (result.prefixes.length > 0) {
        const folderPromises = result.prefixes.map(async (folderRef) => {
          try {
            const folderResult = await listAll(folderRef);
            const folderSizePromises = folderResult.items.map(async (itemRef) => {
              try {
                const metadata = await getMetadata(itemRef);
                return metadata.size || 0;
              } catch (error) {
                console.warn(`Could not get metadata for ${itemRef.fullPath}:`, error);
                return 0;
              }
            });
            const folderSizes = await Promise.all(folderSizePromises);
            return folderSizes.reduce((acc, size) => acc + size, 0);
          } catch (error) {
            console.warn(`Could not list folder ${folderRef.fullPath}:`, error);
            return 0;
          }
        });

        const folderTotals = await Promise.all(folderPromises);
        totalSize += folderTotals.reduce((acc, size) => acc + size, 0);
      }

      setStorageUsed(totalSize);
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage:', error);
      return 0;
    } finally {
      setStorageLoading(false);
    }
  };

  /**
   * Refresh storage calculation
   */
  const refreshStorage = async () => {
    await calculateStorageUsed();
  };

  /**
   * Calculate on mount if no prop provided
   */
  useEffect(() => {
    if (!propStorageUsed && userId) {
      calculateStorageUsed();
    }
  }, [userId, propStorageUsed]);

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
