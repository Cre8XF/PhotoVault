// ============================================================================
// useAIQueue Hook - Phase 3.2: AI Request Queue Management with Rate Limiting
// ============================================================================
import { useCallback, useEffect, useRef } from 'react';
import useStore from '../state/store';

/**
 * Custom hook for AI request queue management
 * Serializes AI operations with rate limiting to prevent API throttling
 *
 * Supports:
 * - Google Vision API (image tagging, face detection, landmarks)
 * - Picsart API (image enhancement, background removal, upscaling)
 * - OpenAI GPT-4 Vision (image description, categorization, smart search)
 */

// Rate limits per service (requests per minute and max concurrent)
const RATE_LIMITS = {
  googleVision: { rpm: 60, concurrent: 5, delay: 1000 },
  picsart: { rpm: 30, concurrent: 2, delay: 2000 },
  openai: { rpm: 20, concurrent: 1, delay: 3000 },
  duplicateDetection: { rpm: 100, concurrent: 10, delay: 100 }
};

export const useAIQueue = () => {
  const processingRef = useRef(false);
  const lastRequestTime = useRef({});
  const activeRequests = useRef({});

  // Zustand store selectors
  const aiQueue = useStore((state) => state.aiQueue);
  const processingAI = useStore((state) => state.processingAI);
  const addToAIQueue = useStore((state) => state.addToAIQueue);
  const removeFromAIQueue = useStore((state) => state.removeFromAIQueue);
  const updateAIQueueTask = useStore((state) => state.updateAIQueueTask);
  const setProcessingAI = useStore((state) => state.setProcessingAI);
  const setNotification = useStore((state) => state.setNotification);

  /**
   * Wait for rate limit delay if needed
   */
  const waitForRateLimit = useCallback(async (service) => {
    const limits = RATE_LIMITS[service];
    if (!limits) return;

    const now = Date.now();
    const lastTime = lastRequestTime.current[service] || 0;
    const timeSinceLastRequest = now - lastTime;

    if (timeSinceLastRequest < limits.delay) {
      const waitTime = limits.delay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    lastRequestTime.current[service] = Date.now();
  }, []);

  /**
   * Check if service has capacity for new request
   */
  const hasCapacity = useCallback((service) => {
    const limits = RATE_LIMITS[service];
    if (!limits) return true;

    const active = activeRequests.current[service] || 0;
    return active < limits.concurrent;
  }, []);

  /**
   * Track active request
   */
  const trackRequest = useCallback((service, increment = true) => {
    if (!activeRequests.current[service]) {
      activeRequests.current[service] = 0;
    }

    if (increment) {
      activeRequests.current[service]++;
    } else {
      activeRequests.current[service] = Math.max(0, activeRequests.current[service] - 1);
    }
  }, []);

  /**
   * Process next task in the queue with rate limiting
   */
  const processNextTask = useCallback(async () => {
    if (processingRef.current || aiQueue.length === 0) {
      return;
    }

    processingRef.current = true;
    setProcessingAI(true);

    const task = aiQueue[0];
    const service = task.service || task.type || 'general';

    try {
      // Wait for rate limit if needed
      await waitForRateLimit(service);

      // Check capacity
      if (!hasCapacity(service)) {
        // Wait a bit and try again
        processingRef.current = false;
        setProcessingAI(false);
        setTimeout(() => processNextTask(), 500);
        return;
      }

      // Track request
      trackRequest(service, true);

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

      // Show notification for failed tasks (but not for every single failure)
      if (task.showError !== false) {
        setNotification({
          message: `AI task failed: ${error.message}`,
          type: 'error'
        });
      }

      // Remove failed task after delay
      setTimeout(() => {
        removeFromAIQueue(task.id);
      }, 2000);
    } finally {
      // Untrack request
      trackRequest(service, false);

      processingRef.current = false;
      setProcessingAI(false);
    }
  }, [aiQueue, updateAIQueueTask, removeFromAIQueue, setProcessingAI, setNotification, waitForRateLimit, hasCapacity, trackRequest]);

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
