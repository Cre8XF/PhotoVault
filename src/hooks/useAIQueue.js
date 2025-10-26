// ============================================================================
// useAIQueue Hook - Phase 2: AI Request Queue Management
// ============================================================================
import { useCallback, useEffect, useRef } from 'react';
import useStore from '../state/store';

/**
 * Custom hook for AI request queue management
 * Serializes AI operations to prevent API rate limit issues
 *
 * Supports:
 * - Google Vision API (image tagging)
 * - Picsart API (image enhancement)
 * - OpenAI GPT (smart sorting)
 */
export const useAIQueue = () => {
  const processingRef = useRef(false);

  // Zustand store selectors
  const aiQueue = useStore((state) => state.aiQueue);
  const processingAI = useStore((state) => state.processingAI);
  const addToAIQueue = useStore((state) => state.addToAIQueue);
  const removeFromAIQueue = useStore((state) => state.removeFromAIQueue);
  const updateAIQueueTask = useStore((state) => state.updateAIQueueTask);
  const setProcessingAI = useStore((state) => state.setProcessingAI);
  const setNotification = useStore((state) => state.setNotification);

  /**
   * Process next task in the queue
   */
  const processNextTask = useCallback(async () => {
    if (processingRef.current || aiQueue.length === 0) {
      return;
    }

    processingRef.current = true;
    setProcessingAI(true);

    const task = aiQueue[0];

    try {
      updateAIQueueTask(task.id, { status: 'processing' });

      // Execute the task
      if (task.execute && typeof task.execute === 'function') {
        await task.execute();
      }

      // Mark as completed and remove from queue
      updateAIQueueTask(task.id, { status: 'completed' });

      // Remove task after a short delay to show completion
      setTimeout(() => {
        removeFromAIQueue(task.id);
      }, 500);

    } catch (error) {
      console.error(`AI Queue error for task ${task.id}:`, error);

      updateAIQueueTask(task.id, {
        status: 'failed',
        error: error.message
      });

      // Show notification for failed tasks
      setNotification({
        message: `AI task failed: ${error.message}`,
        type: 'error'
      });

      // Remove failed task after delay
      setTimeout(() => {
        removeFromAIQueue(task.id);
      }, 2000);
    } finally {
      processingRef.current = false;
      setProcessingAI(false);
    }
  }, [aiQueue, updateAIQueueTask, removeFromAIQueue, setProcessingAI, setNotification]);

  /**
   * Auto-process queue when tasks are added
   */
  useEffect(() => {
    if (aiQueue.length > 0 && !processingRef.current) {
      processNextTask();
    }
  }, [aiQueue.length, processNextTask]);

  /**
   * Queue AI tagging task
   */
  const queueImageTagging = useCallback((photoId, imageUrl, callback) => {
    const task = {
      type: 'image_tagging',
      photoId,
      imageUrl,
      execute: async () => {
        // Google Vision API call would go here
        console.log(`Processing image tagging for ${photoId}`);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Call callback with results if provided
        if (callback) {
          await callback({
            tags: ['nature', 'landscape', 'sunset'],
            faces: 0,
            category: 'nature'
          });
        }
      }
    };

    addToAIQueue(task);
  }, [addToAIQueue]);

  /**
   * Queue image enhancement task
   */
  const queueImageEnhancement = useCallback((photoId, imageUrl, callback) => {
    const task = {
      type: 'image_enhancement',
      photoId,
      imageUrl,
      execute: async () => {
        // Picsart API call would go here
        console.log(`Processing image enhancement for ${photoId}`);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Call callback with results if provided
        if (callback) {
          await callback({
            enhancedUrl: imageUrl, // Would be the enhanced URL from Picsart
            enhanced: true
          });
        }
      }
    };

    addToAIQueue(task);
  }, [addToAIQueue]);

  /**
   * Queue background removal task
   */
  const queueBackgroundRemoval = useCallback((photoId, imageUrl, callback) => {
    const task = {
      type: 'background_removal',
      photoId,
      imageUrl,
      execute: async () => {
        // Picsart API call would go here
        console.log(`Processing background removal for ${photoId}`);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Call callback with results if provided
        if (callback) {
          await callback({
            noBgUrl: imageUrl, // Would be the no-bg URL from Picsart
            bgRemoved: true
          });
        }
      }
    };

    addToAIQueue(task);
  }, [addToAIQueue]);

  /**
   * Queue smart sorting task (GPT)
   */
  const queueSmartSorting = useCallback((photos, criteria, callback) => {
    const task = {
      type: 'smart_sorting',
      photoCount: photos.length,
      criteria,
      execute: async () => {
        // OpenAI GPT API call would go here
        console.log(`Processing smart sorting for ${photos.length} photos`);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Call callback with results if provided
        if (callback) {
          await callback({
            sortedPhotos: photos, // Would be sorted by GPT
            suggestions: []
          });
        }
      }
    };

    addToAIQueue(task);
  }, [addToAIQueue]);

  /**
   * Clear all tasks from queue
   */
  const clearQueue = useCallback(() => {
    aiQueue.forEach(task => removeFromAIQueue(task.id));
    setProcessingAI(false);
    processingRef.current = false;
  }, [aiQueue, removeFromAIQueue, setProcessingAI]);

  /**
   * Get queue statistics
   */
  const getQueueStats = useCallback(() => {
    return {
      total: aiQueue.length,
      pending: aiQueue.filter(t => t.status === 'pending').length,
      processing: aiQueue.filter(t => t.status === 'processing').length,
      failed: aiQueue.filter(t => t.status === 'failed').length,
      isProcessing: processingAI
    };
  }, [aiQueue, processingAI]);

  return {
    // State
    aiQueue,
    processingAI,

    // Queue management
    queueImageTagging,
    queueImageEnhancement,
    queueBackgroundRemoval,
    queueSmartSorting,
    clearQueue,

    // Utilities
    queueStats: getQueueStats(),
  };
};

export default useAIQueue;
