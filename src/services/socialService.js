// ============================================================================
// socialService.js - Comments, Reactions & Notifications (Phase 4.3)
// ============================================================================

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================================================
// 💬 COMMENTS
// ============================================================================

/**
 * Add a comment to a photo
 * @param {string} photoId - Photo ID
 * @param {string} userId - User ID
 * @param {string} text - Comment text
 * @param {string|null} parentId - Parent comment ID for threading
 * @param {string[]} mentions - Array of mentioned user IDs
 * @returns {Promise<string>} Comment ID
 */
export async function addComment(photoId, userId, text, parentId = null, mentions = []) {
  try {
    const commentData = {
      photoId,
      userId,
      text,
      parentId,
      mentions,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'comments'), commentData);
    console.log(`💬 Comment added: ${docRef.id}`);

    // Create notifications for mentions
    if (mentions.length > 0) {
      await Promise.all(
        mentions.map((mentionedUserId) =>
          createNotification(mentionedUserId, 'mention', photoId, userId, text)
        )
      );
    }

    // Create notification for photo owner (if not the commenter)
    const photoDoc = await getDoc(doc(db, 'photos', photoId));
    if (photoDoc.exists()) {
      const photoOwnerId = photoDoc.data().userId;
      if (photoOwnerId !== userId) {
        await createNotification(photoOwnerId, 'comment', photoId, userId, text);
      }
    }

    return docRef.id;
  } catch (error) {
    console.error('🔥 addComment error:', error);
    throw error;
  }
}

/**
 * Get comments for a photo
 * @param {string} photoId - Photo ID
 * @param {boolean} realtime - Enable real-time updates
 * @param {function} callback - Callback for real-time updates
 * @returns {Promise<Array>|function} Comments array or unsubscribe function
 */
export async function getComments(photoId, realtime = false, callback = null) {
  try {
    const q = query(
      collection(db, 'comments'),
      where('photoId', '==', photoId),
      orderBy('createdAt', 'asc')
    );

    if (realtime && callback) {
      // Return unsubscribe function for real-time updates
      return onSnapshot(q, (snapshot) => {
        const comments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toISOString(),
          updatedAt: doc.data().updatedAt?.toDate().toISOString(),
        }));
        callback(comments);
      });
    }

    // One-time fetch
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }));
  } catch (error) {
    console.error('🔥 getComments error:', error);
    return [];
  }
}

/**
 * Update a comment
 * @param {string} commentId - Comment ID
 * @param {string} text - New comment text
 */
export async function updateComment(commentId, text) {
  try {
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, {
      text,
      updatedAt: Timestamp.now(),
    });
    console.log(`✏️ Comment updated: ${commentId}`);
  } catch (error) {
    console.error('🔥 updateComment error:', error);
    throw error;
  }
}

/**
 * Delete a comment
 * @param {string} commentId - Comment ID
 */
export async function deleteComment(commentId) {
  try {
    await deleteDoc(doc(db, 'comments', commentId));
    console.log(`🗑️ Comment deleted: ${commentId}`);
  } catch (error) {
    console.error('🔥 deleteComment error:', error);
    throw error;
  }
}

// ============================================================================
// 😊 REACTIONS
// ============================================================================

/**
 * Add or update a reaction to a photo
 * @param {string} photoId - Photo ID
 * @param {string} userId - User ID
 * @param {string} emoji - Emoji reaction
 * @returns {Promise<string>} Reaction ID
 */
export async function addReaction(photoId, userId, emoji) {
  try {
    // Check if user already reacted to this photo with this emoji
    const q = query(
      collection(db, 'reactions'),
      where('photoId', '==', photoId),
      where('userId', '==', userId),
      where('emoji', '==', emoji)
    );

    const existingReactions = await getDocs(q);

    if (!existingReactions.empty) {
      // Reaction already exists, return existing ID
      console.log(`😊 Reaction already exists`);
      return existingReactions.docs[0].id;
    }

    // Create new reaction
    const reactionData = {
      photoId,
      userId,
      emoji,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'reactions'), reactionData);
    console.log(`😊 Reaction added: ${docRef.id}`);

    // Create notification for photo owner (if not the reactor)
    const photoDoc = await getDoc(doc(db, 'photos', photoId));
    if (photoDoc.exists()) {
      const photoOwnerId = photoDoc.data().userId;
      if (photoOwnerId !== userId) {
        await createNotification(photoOwnerId, 'reaction', photoId, userId, emoji);
      }
    }

    return docRef.id;
  } catch (error) {
    console.error('🔥 addReaction error:', error);
    throw error;
  }
}

/**
 * Remove a reaction
 * @param {string} photoId - Photo ID
 * @param {string} userId - User ID
 * @param {string} emoji - Emoji reaction
 */
export async function removeReaction(photoId, userId, emoji) {
  try {
    const q = query(
      collection(db, 'reactions'),
      where('photoId', '==', photoId),
      where('userId', '==', userId),
      where('emoji', '==', emoji)
    );

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log(`🗑️ Reaction removed`);
  } catch (error) {
    console.error('🔥 removeReaction error:', error);
    throw error;
  }
}

/**
 * Get reactions for a photo
 * @param {string} photoId - Photo ID
 * @param {boolean} realtime - Enable real-time updates
 * @param {function} callback - Callback for real-time updates
 * @returns {Promise<Object>|function} Reaction summary or unsubscribe function
 */
export async function getReactions(photoId, realtime = false, callback = null) {
  try {
    const q = query(
      collection(db, 'reactions'),
      where('photoId', '==', photoId),
      orderBy('createdAt', 'desc')
    );

    const processReactions = (snapshot) => {
      const reactions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
      }));

      // Group reactions by emoji with counts
      const summary = reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
          acc[reaction.emoji] = {
            emoji: reaction.emoji,
            count: 0,
            users: [],
          };
        }
        acc[reaction.emoji].count++;
        acc[reaction.emoji].users.push(reaction.userId);
        return acc;
      }, {});

      return {
        reactions,
        summary: Object.values(summary),
      };
    };

    if (realtime && callback) {
      // Return unsubscribe function for real-time updates
      return onSnapshot(q, (snapshot) => {
        callback(processReactions(snapshot));
      });
    }

    // One-time fetch
    const snapshot = await getDocs(q);
    return processReactions(snapshot);
  } catch (error) {
    console.error('🔥 getReactions error:', error);
    return { reactions: [], summary: [] };
  }
}

/**
 * Check if user has reacted to a photo with a specific emoji
 * @param {string} photoId - Photo ID
 * @param {string} userId - User ID
 * @param {string} emoji - Emoji reaction
 * @returns {Promise<boolean>}
 */
export async function hasUserReacted(photoId, userId, emoji) {
  try {
    const q = query(
      collection(db, 'reactions'),
      where('photoId', '==', photoId),
      where('userId', '==', userId),
      where('emoji', '==', emoji)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('🔥 hasUserReacted error:', error);
    return false;
  }
}

// ============================================================================
// 🔔 NOTIFICATIONS
// ============================================================================

/**
 * Create a notification
 * @param {string} userId - Recipient user ID
 * @param {string} type - Notification type ('comment' | 'reaction' | 'share' | 'mention')
 * @param {string} photoId - Photo ID
 * @param {string} fromUserId - Sender user ID
 * @param {string} metadata - Additional metadata (comment text, emoji, etc.)
 */
export async function createNotification(userId, type, photoId, fromUserId, metadata = '') {
  try {
    // Don't create notification if user is notifying themselves
    if (userId === fromUserId) {
      return;
    }

    const notificationData = {
      userId,
      type,
      photoId,
      fromUserId,
      metadata,
      read: false,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    console.log(`🔔 Notification created: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('🔥 createNotification error:', error);
    throw error;
  }
}

/**
 * Get notifications for a user
 * @param {string} userId - User ID
 * @param {boolean} unreadOnly - Only fetch unread notifications
 * @param {boolean} realtime - Enable real-time updates
 * @param {function} callback - Callback for real-time updates
 * @returns {Promise<Array>|function} Notifications array or unsubscribe function
 */
export async function getNotifications(userId, unreadOnly = false, realtime = false, callback = null) {
  try {
    let q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (unreadOnly) {
      q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      );
    }

    if (realtime && callback) {
      // Return unsubscribe function for real-time updates
      return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toISOString(),
        }));
        callback(notifications);
      });
    }

    // One-time fetch
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));
  } catch (error) {
    console.error('🔥 getNotifications error:', error);
    return [];
  }
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
    });
    console.log(`✓ Notification marked as read: ${notificationId}`);
  } catch (error) {
    console.error('🔥 markNotificationAsRead error:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 */
export async function markAllNotificationsAsRead(userId) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, { read: true })
    );

    await Promise.all(updatePromises);
    console.log(`✓ All notifications marked as read for user: ${userId}`);
  } catch (error) {
    console.error('🔥 markAllNotificationsAsRead error:', error);
    throw error;
  }
}

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 */
export async function deleteNotification(notificationId) {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
    console.log(`🗑️ Notification deleted: ${notificationId}`);
  } catch (error) {
    console.error('🔥 deleteNotification error:', error);
    throw error;
  }
}

/**
 * Get unread notification count
 * @param {string} userId - User ID
 * @returns {Promise<number>}
 */
export async function getUnreadCount(userId) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('🔥 getUnreadCount error:', error);
    return 0;
  }
}
