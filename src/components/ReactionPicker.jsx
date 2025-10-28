// ============================================================================
// COMPONENT: ReactionPicker.jsx - Phase 4.3 Emoji Reactions
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Smile, Plus } from 'lucide-react';
import {
  addReaction,
  removeReaction,
  getReactions,
  hasUserReacted,
} from '../services/socialService';
import useAuth from '../hooks/useAuth';
import useStore from '../state/store';

// Available emoji reactions
const REACTIONS = ['❤️', '👍', '😂', '😮', '🎉', '🔥'];

const ReactionPicker = ({ photoId, photoOwnerId }) => {
  const { t } = useTranslation(['common']);
  const { user } = useAuth();
  const setNotification = useStore((state) => state.setNotification);

  const [reactionData, setReactionData] = useState({ reactions: [], summary: [] });
  const [showPicker, setShowPicker] = useState(false);
  const [userReactions, setUserReactions] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const pickerRef = useRef(null);
  const unsubscribeRef = useRef(null);

 // Real-time reaction subscription
useEffect(() => {
  if (!photoId) return;

  setLoading(true);

  // Subscribe to real-time updates
  const unsubscribe = getReactions(photoId, true, (data) => {
    setReactionData(data);

    // Update user's reactions
    if (user) {
      const userReactionSet = new Set();
      data.reactions.forEach((reaction) => {
        if (reaction.userId === user.uid) {
          userReactionSet.add(reaction.emoji);
        }
      });
      setUserReactions(userReactionSet);
    }

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
}, [photoId, user]);


  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPicker]);

  // Handle reaction click
  const handleReactionClick = async (emoji) => {
    if (!user) {
      setNotification({
        message: t('common:notifications.mustBeLoggedIn'),
        type: 'error',
      });
      return;
    }

    try {
      // Check if user already reacted with this emoji
      const alreadyReacted = userReactions.has(emoji);

      if (alreadyReacted) {
        // Remove reaction
        await removeReaction(photoId, user.uid, emoji);

        setNotification({
          message: t('common:reactionRemoved'),
          type: 'success',
        });
      } else {
        // Add reaction
        await addReaction(photoId, user.uid, emoji);

        setNotification({
          message: t('common:reactionAdded'),
          type: 'success',
        });
      }

      setShowPicker(false);
    } catch (error) {
      console.error('Error handling reaction:', error);
      setNotification({
        message: t('common:errorHandlingReaction'),
        type: 'error',
      });
    }
  };

  // Get tooltip text for reaction
  const getReactionTooltip = (emoji) => {
    const summary = reactionData.summary.find((s) => s.emoji === emoji);
    if (!summary) return emoji;

    const count = summary.count;
    const hasUserReacted = user && summary.users.includes(user.uid);

    if (hasUserReacted && count === 1) {
      return t('common:youReacted');
    } else if (hasUserReacted && count > 1) {
      return t('common:youAndOthersReacted', { count: count - 1 });
    } else {
      return t('common:othersReacted', { count });
    }
  };

  if (!user) {
    return null; // Don't show reactions if not logged in
  }

  return (
    <div className="relative">
      {/* Reaction Summary */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Existing Reactions */}
        {reactionData.summary.map((item) => {
          const isUserReaction = userReactions.has(item.emoji);

          return (
            <button
              key={item.emoji}
              onClick={() => handleReactionClick(item.emoji)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
                transition-all transform hover:scale-105
                ${
                  isUserReaction
                    ? 'bg-purple-600/40 border-2 border-purple-400 text-white'
                    : 'bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:bg-gray-700/60'
                }
              `}
              title={getReactionTooltip(item.emoji)}
            >
              <span className="text-base">{item.emoji}</span>
              <span className="font-medium">{item.count}</span>
            </button>
          );
        })}

        {/* Add Reaction Button */}
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-full text-sm
              transition-all transform hover:scale-105
              ${
                showPicker
                  ? 'bg-purple-600/40 border-2 border-purple-400 text-white'
                  : 'bg-gray-800/60 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/60'
              }
            `}
            title={t('common:addReaction')}
          >
            <Smile className="w-4 h-4" />
            <Plus className="w-3 h-3" />
          </button>

          {/* Emoji Picker Dropdown */}
          {showPicker && (
            <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-3 z-50 animate-scale-in">
              <div className="flex gap-2">
                {REACTIONS.map((emoji) => {
                  const isUserReaction = userReactions.has(emoji);

                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReactionClick(emoji)}
                      className={`
                        w-10 h-10 rounded-lg text-2xl
                        transition-all transform hover:scale-125
                        ${
                          isUserReaction
                            ? 'bg-purple-600/40 ring-2 ring-purple-400'
                            : 'bg-gray-900/60 hover:bg-gray-700/60'
                        }
                      `}
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>

              {/* Picker Arrow */}
              <div className="absolute bottom-0 left-4 transform translate-y-full">
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-800"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
          <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full" />
          <span>{t('common:loading')}</span>
        </div>
      )}

      {/* No Reactions Yet */}
      {!loading && reactionData.summary.length === 0 && (
        <p className="text-gray-500 text-sm mt-1">
          {t('common:noReactionsYet')}
        </p>
      )}
    </div>
  );
};

export default ReactionPicker;
