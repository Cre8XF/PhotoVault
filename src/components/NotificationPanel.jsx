// ============================================================================
// COMPONENT: NotificationPanel.jsx - Phase 4.3 Notification System
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, MessageCircle, Heart, AtSign, Share2, Check, CheckCheck, Trash2, X } from 'lucide-react';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
} from '../services/socialService';
import useAuth from '../hooks/useAuth';
import useStore from '../state/store';

const NotificationPanel = ({ onNavigateToPhoto }) => {
  const { t } = useTranslation(['common']);
  const { user } = useAuth();
  const setNotification = useStore((state) => state.setNotification);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const panelRef = useRef(null);
  const unsubscribeRef = useRef(null);

 // Real-time notification subscription
useEffect(() => {
  if (!user) return;

  setLoading(true);

  // Subscribe to all notifications for real-time updates
  const unsubscribe = getNotifications(user.uid, false, true, (updatedNotifications) => {
    setNotifications(updatedNotifications);

    // Update unread count
    const unread = updatedNotifications.filter((n) => !n.read).length;
    setUnreadCount(unread);

    setLoading(false);
  });

  // Sett kun hvis det faktisk er en funksjon
  unsubscribeRef.current = typeof unsubscribe === "function" ? unsubscribe : null;

  // Rydd opp trygt ved unmount
  return () => {
    if (typeof unsubscribeRef.current === "function") {
      unsubscribeRef.current();
    }
    unsubscribeRef.current = null;
  };
}, [user]);


  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowPanel(false);
      }
    };

    if (showPanel) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPanel]);

  // Get icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-400" />;
      case 'reaction':
        return <Heart className="w-4 h-4 text-pink-400" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-purple" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-green-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get notification message
  const getNotificationMessage = (notification) => {
    const fromUser = notification.fromUserId.substring(0, 8) + '...';

    switch (notification.type) {
      case 'comment':
        return t('common:notificationComment', { user: fromUser });
      case 'reaction':
        return t('common:notificationReaction', { user: fromUser, emoji: notification.metadata });
      case 'mention':
        return t('common:notificationMention', { user: fromUser });
      case 'share':
        return t('common:notificationShare', { user: fromUser });
      default:
        return t('common:notificationNew');
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('common:justNow');
    if (diffMins < 60) return t('common:minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('common:hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('common:daysAgo', { count: diffDays });

    return date.toLocaleDateString();
  };

  // Handle mark as read
  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();

    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotification({
        message: t('common:errorMarkingAsRead'),
        type: 'error',
      });
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      await markAllNotificationsAsRead(user.uid);

      setNotification({
        message: t('common:allNotificationsRead'),
        type: 'success',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      setNotification({
        message: t('common:errorMarkingAllAsRead'),
        type: 'error',
      });
    }
  };

  // Handle delete notification
  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();

    try {
      await deleteNotification(notificationId);

      setNotification({
        message: t('common:notificationDeleted'),
        type: 'success',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      setNotification({
        message: t('common:errorDeletingNotification'),
        type: 'error',
      });
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }

    // Navigate to photo
    if (onNavigateToPhoto) {
      onNavigateToPhoto(notification.photoId);
    }

    // Close panel
    setShowPanel(false);
  };

  // Filter notifications
  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  if (!user) {
    return null; // Don't show notifications if not logged in
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`
          relative p-2 rounded-full transition-all transform hover:scale-105
          ${
            showPanel
              ? 'bg-purple-600/40 text-white'
              : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 hover:text-white'
          }
        `}
        title={t('common:notifications')}
      >
        <Bell className="w-5 h-5" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 animate-scale-in">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple" />
                {t('common:notifications')}
              </h3>

              <button
                onClick={() => setShowPanel(false)}
                className="p-1 text-gray-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`
                  px-3 py-1 rounded-lg text-sm transition
                  ${
                    filter === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-900/60 text-gray-400 hover:text-white'
                  }
                `}
              >
                {t('common:all')} ({notifications.length})
              </button>

              <button
                onClick={() => setFilter('unread')}
                className={`
                  px-3 py-1 rounded-lg text-sm transition
                  ${
                    filter === 'unread'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-900/60 text-gray-400 hover:text-white'
                  }
                `}
              >
                {t('common:unread')} ({unreadCount})
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="ml-auto px-3 py-1 rounded-lg text-sm bg-gray-900/60 text-gray-400 hover:text-white transition flex items-center gap-1"
                  title={t('common:markAllAsRead')}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2" />
                <p>{t('common:loading')}</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>
                  {filter === 'unread'
                    ? t('common:noUnreadNotifications')
                    : t('common:noNotifications')}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      p-4 cursor-pointer transition hover:bg-gray-700/30 group
                      ${!notification.read ? 'bg-purple-900/10' : ''}
                    `}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300 mb-1">
                          {getNotificationMessage(notification)}
                        </p>

                        {notification.metadata && notification.type === 'comment' && (
                          <p className="text-xs text-gray-500 italic truncate">
                            "{notification.metadata}"
                          </p>
                        )}

                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition">
                        {!notification.read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="p-1 text-gray-400 hover:text-green-400 transition"
                            title={t('common:markAsRead')}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={(e) => handleDelete(notification.id, e)}
                          className="p-1 text-gray-400 hover:text-red-400 transition"
                          title={t('common:delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-700 text-center">
              <p className="text-xs text-gray-500">
                {t('common:clickNotificationToView')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
