// ============================================================================
// COMPONENT: ComingSoonModal.jsx – Coming Soon Feature Modal
// Shows informative modal for AI features that are temporarily disabled for MVP
// ============================================================================

import React from "react";
import { X, Sparkles, Zap, Users, ImagePlus, Copy, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

const ComingSoonModal = ({
  isOpen,
  onClose,
  featureName = null,
  description = null
}) => {
  const { t } = useTranslation(['common']);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // AI features list with icons
  const aiFeatures = [
    {
      key: 'autoTagging',
      icon: Sparkles,
      color: 'text-purple'
    },
    {
      key: 'faceRecognition',
      icon: Users,
      color: 'text-pink-400'
    },
    {
      key: 'smartSearch',
      icon: Search,
      color: 'text-blue-400'
    },
    {
      key: 'imageEnhancement',
      icon: ImagePlus,
      color: 'text-green-400'
    },
    {
      key: 'backgroundRemoval',
      icon: Zap,
      color: 'text-yellow-400'
    },
    {
      key: 'duplicateDetection',
      icon: Copy,
      color: 'text-orange-400'
    }
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border-2 border-purple-500/30 w-full max-w-lg animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-purple-600/10 to-pink-600/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={t('comingSoon.close')}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {t('comingSoon.title')}
            </h2>
          </div>

          {featureName && (
            <p className="text-purple font-medium mt-2">
              {featureName}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Custom description if provided */}
          {description && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <p className="text-sm text-gray-300">
                {description}
              </p>
            </div>
          )}

          {/* Default coming soon message */}
          <div>
            <p className="text-gray-300 mb-4">
              {t('comingSoon.description')}
            </p>

            <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple" />
                {t('comingSoon.aiFeatures.title')}
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                {t('comingSoon.aiFeatures.description')}
              </p>

              <ul className="space-y-3">
                {aiFeatures.map(({ key, icon: Icon, color }) => (
                  <li key={key} className="flex items-center gap-3 text-gray-200">
                    <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
                    <span className="text-sm">
                      {t(`comingSoon.aiFeatures.${key}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-blue-200 mb-2 font-medium">
              💡 {t('comingSoon.contact')}
            </p>
            <a
              href="mailto:support@fotio.app?subject=Early Access Request"
              className="text-blue-400 hover:text-blue-300 text-sm underline transition-colors"
            >
              support@fotio.app
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-[var(--bg-primary)]">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02]"
          >
            {t('comingSoon.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonModal;
