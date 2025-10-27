// ============================================================================
// COMPONENT: CommentThread.jsx - Phase 4.3 Comments with Threading & @Mentions
// ============================================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Send, Trash2, Edit2, Reply, X, Check } from 'lucide-react';
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} from '../services/socialService';
import useAuth from '../hooks/useAuth';
import useStore from '../state/store';

const CommentThread = ({ photoId, photoOwnerId }) => {
  const { t } = useTranslation(['common']);
  const { user } = useAuth();
  const setNotification = useStore((state) => state.setNotification);

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const [mentions, setMentions] = useState([]);

  const textareaRef = useRef(null);
  const editTextareaRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Real-time comment subscription
  useEffect(() => {
    if (!photoId) return;

    setLoading(true);

    // Subscribe to real-time updates
    const unsubscribe = getComments(photoId, true, (updatedComments) => {
      setComments(updatedComments);
      setLoading(false);
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [photoId]);

  // Handle @mention detection
  const handleTextChange = (text) => {
    setNewCommentText(text);

    // Detect @ mentions
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = text.substring(lastAtIndex + 1);
      const spaceIndex = textAfterAt.indexOf(' ');

      if (spaceIndex === -1 || textAfterAt.length < spaceIndex) {
        // Currently typing a mention
        setMentionSearch(textAfterAt);
        setMentionPosition(lastAtIndex);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Extract mentioned user IDs from text
  const extractMentions = (text) => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    if (!matches) return [];

    // In a real implementation, you'd lookup user IDs from usernames
    // For now, we'll return empty array as placeholder
    return [];
  };

  // Handle new comment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !user) return;

    try {
      const mentionedUsers = extractMentions(newCommentText);

      await addComment(
        photoId,
        user.uid,
        newCommentText.trim(),
        replyToId,
        mentionedUsers
      );

      setNewCommentText('');
      setReplyToId(null);
      setShowMentions(false);

      setNotification({
        message: t('common:commentAdded'),
        type: 'success',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      setNotification({
        message: t('common:errorAddingComment'),
        type: 'error',
      });
    }
  };

  // Handle comment edit
  const handleEdit = useCallback(async (commentId) => {
    if (!editText.trim()) return;

    try {
      await updateComment(commentId, editText.trim());
      setEditingId(null);
      setEditText('');

      setNotification({
        message: t('common:commentUpdated'),
        type: 'success',
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      setNotification({
        message: t('common:errorUpdatingComment'),
        type: 'error',
      });
    }
  }, [editText, setNotification, t]);

  // Handle comment delete
  const handleDelete = useCallback(async (commentId) => {
    if (!window.confirm(t('common:confirmDeleteComment'))) return;

    try {
      await deleteComment(commentId);

      setNotification({
        message: t('common:commentDeleted'),
        type: 'success',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      setNotification({
        message: t('common:errorDeletingComment'),
        type: 'error',
      });
    }
  }, [setNotification, t]);

  // Start editing a comment
  const startEditing = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  // Start replying to a comment
  const startReplying = (comment) => {
    setReplyToId(comment.id);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Get nested replies for a comment
  const getReplies = (parentId) => {
    return comments.filter((c) => c.parentId === parentId);
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

  // Render a single comment
  const renderComment = (comment, isReply = false) => {
    const isOwner = user && comment.userId === user.uid;
    const isPhotoOwner = user && user.uid === photoOwnerId;
    const canDelete = isOwner || isPhotoOwner;
    const isEditing = editingId === comment.id;
    const replies = getReplies(comment.id);

    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 mt-2' : 'mt-3'}`}>
        <div className="flex gap-2">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
              {comment.userId.substring(0, 2).toUpperCase()}
            </div>
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/50">
              {/* User Info */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-200">
                    {comment.userId.substring(0, 8)}...
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(comment.createdAt)}
                  </span>
                  {comment.updatedAt !== comment.createdAt && (
                    <span className="text-xs text-gray-500 italic">
                      ({t('common:edited')})
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                {isOwner && (
                  <div className="flex items-center gap-1">
                    {!isEditing && (
                      <>
                        <button
                          onClick={() => startEditing(comment)}
                          className="p-1 text-gray-400 hover:text-blue-400 transition"
                          title={t('common:edit')}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition"
                          title={t('common:delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {isEditing && (
                      <>
                        <button
                          onClick={() => handleEdit(comment.id)}
                          className="p-1 text-gray-400 hover:text-green-400 transition"
                          title={t('common:save')}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditText('');
                          }}
                          className="p-1 text-gray-400 hover:text-red-400 transition"
                          title={t('common:cancel')}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                )}
                {!isOwner && canDelete && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition"
                    title={t('common:delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Comment Text or Edit Form */}
              {isEditing ? (
                <textarea
                  ref={editTextareaRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 bg-gray-900/60 border border-gray-600/50 rounded-lg text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2}
                  autoFocus
                />
              ) : (
                <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
                  {comment.text}
                </p>
              )}
            </div>

            {/* Reply Button */}
            {!isReply && user && (
              <button
                onClick={() => startReplying(comment)}
                className="mt-1 text-xs text-gray-500 hover:text-purple-400 transition flex items-center gap-1"
              >
                <Reply className="w-3 h-3" />
                {t('common:reply')}
              </button>
            )}
          </div>
        </div>

        {/* Nested Replies */}
        {replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  // Get top-level comments (no parent)
  const topLevelComments = comments.filter((c) => !c.parentId);

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>{t('common:loginToComment')}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">
          {t('common:comments')} ({comments.length})
        </h3>
      </div>

      {/* Comments List */}
      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2" />
            <p>{t('common:loading')}</p>
          </div>
        ) : topLevelComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{t('common:noCommentsYet')}</p>
          </div>
        ) : (
          topLevelComments.map((comment) => renderComment(comment))
        )}
      </div>

      {/* Reply indicator */}
      {replyToId && (
        <div className="mb-2 flex items-center justify-between bg-purple-900/20 border border-purple-500/30 rounded-lg p-2">
          <span className="text-xs text-purple-300 flex items-center gap-1">
            <Reply className="w-3 h-3" />
            {t('common:replyingToComment')}
          </span>
          <button
            onClick={() => setReplyToId(null)}
            className="text-purple-400 hover:text-purple-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={newCommentText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={replyToId ? t('common:writeReply') : t('common:writeComment')}
            className="w-full p-3 pr-12 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
          />

          {/* Mention autocomplete dropdown (placeholder for future implementation) */}
          {showMentions && mentionSearch && (
            <div className="absolute bottom-full left-0 mb-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-2 w-48">
              <p className="text-xs text-gray-400 p-2">
                @{mentionSearch}...
              </p>
              {/* User list would go here */}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!newCommentText.trim()}
            className="absolute bottom-3 right-3 p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Mention hint */}
        <p className="mt-2 text-xs text-gray-500">
          {t('common:mentionHint')}
        </p>
      </form>
    </div>
  );
};

export default CommentThread;
