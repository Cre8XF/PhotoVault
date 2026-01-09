// ============================================================================
// COMPONENT: UpgradePromptModal.jsx – Locked Feature Upgrade Prompt
// Shows upgrade prompt when FREE users click locked premium features
// ============================================================================

import React from "react";
import { X, Lock, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const UpgradePromptModal = ({
  isOpen,
  onClose,
  feature = null
}) => {
  const { t } = useTranslation(['translation']);
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  if (!isOpen || !feature) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Determine target tier based on current tier
  const currentTier = userProfile?.subscriptionTier || 'FREE';
  const targetTier = currentTier === 'FREE' ? 'LITE' : 'PRO';

  // Get feature content
  const featureContent = {
    title: t(`upgrade.${feature}.title`, feature),
    description: t(`upgrade.${feature}.description`, ''),
    benefits: [
      t(`upgrade.${feature}.benefits.0`, ''),
      t(`upgrade.${feature}.benefits.1`, ''),
      t(`upgrade.${feature}.benefits.2`, '')
    ].filter(Boolean)
  };

  const handleUpgrade = () => {
    onClose();
    navigate('/subscription');
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        className="glass rounded-2xl shadow-2xl border-2 border-purple-500/30 w-full max-w-md animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-purple-600/10 to-pink-600/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={t('buttons.close')}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {featureContent.title}
            </h2>
          </div>

          <p className="text-purple font-medium mt-2">
            {t('upgrade.title', { tier: targetTier })}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <p className="text-sm text-gray-300">
              {featureContent.description}
            </p>
          </div>

          {/* Benefits List */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              {t('subscription.features', 'Features')}
            </h3>

            <ul className="space-y-3">
              {featureContent.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-200">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  <span className="text-sm">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-[var(--bg-primary)] space-y-3">
          <button
            onClick={handleUpgrade}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02]"
          >
            {t('upgrade.cta', { tier: targetTier })}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
          >
            {t('upgrade.cancel', 'Cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePromptModal;
