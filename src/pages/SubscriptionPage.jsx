// ============================================================================
// SubscriptionPage - Phase 2: Subscription & Storage Management
// ============================================================================
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import usePhotoData from '../hooks/usePhotoData';
import useStore from '../state/store';
import {
  ArrowLeft,
  Crown,
  HardDrive,
  Image,
  Zap,
  Check,
  Sparkles,
  Shield,
  Database,
} from 'lucide-react';

/**
 * Subscription Page
 * Shows current plan, storage usage, and AI quota
 */
const SubscriptionPage = () => {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const { userProfile, isPro, isAdmin } = useAuth();
  const { photos } = usePhotoData();
  const storageUsed = useStore((state) => state.storageUsed);
  const storageLimit = useStore((state) => state.storageLimit);

  /**
   * Calculate storage usage percentage
   */
  const storagePercentage = useMemo(() => {
    if (isAdmin) return 0; // Unlimited for admins
    return Math.min((storageUsed / storageLimit) * 100, 100);
  }, [storageUsed, storageLimit, isAdmin]);

  /**
   * Format bytes to human-readable size
   */
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * Get current plan details
   */
  const currentPlan = useMemo(() => {
    if (isAdmin) {
      return {
        name: 'Admin',
        storage: 'Unlimited',
        aiRequests: 'Unlimited',
        color: 'from-red-600 to-red-800',
        icon: <Shield className="w-6 h-6" />,
      };
    } else if (isPro) {
      return {
        name: 'Pro',
        storage: '50 GB',
        aiRequests: '1000/month',
        color: 'from-purple-600 to-pink-600',
        icon: <Crown className="w-6 h-6" />,
      };
    } else {
      return {
        name: 'Free',
        storage: '500 MB',
        aiRequests: '100/month',
        color: 'from-blue-600 to-cyan-600',
        icon: <Database className="w-6 h-6" />,
      };
    }
  }, [isAdmin, isPro]);

  /**
   * Subscription plans
   */
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      storage: '500 MB',
      aiRequests: '100/month',
      features: [
        'Basic photo storage',
        'Basic AI tagging',
        'Album organization',
        'Mobile app access',
      ],
      color: 'from-blue-600 to-cyan-600',
      current: !isPro && !isAdmin,
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: 'per month',
      storage: '50 GB',
      aiRequests: '1000/month',
      features: [
        'Everything in Free',
        'Advanced AI features',
        'Priority processing',
        'Image enhancement',
        'Background removal',
        'Smart search',
        'Priority support',
      ],
      color: 'from-purple-600 to-pink-600',
      current: isPro && !isAdmin,
      recommended: true,
    },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-card border-b border-white/20 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/more')}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Subscription & Storage</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Current Plan Card */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Current Plan</h2>
            <div
              className={`px-4 py-2 bg-gradient-to-r ${currentPlan.color} rounded-full text-white font-medium flex items-center gap-2`}
            >
              {currentPlan.icon}
              {currentPlan.name}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Storage */}
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-400">Storage</span>
              </div>
              <p className="text-2xl font-bold">{currentPlan.storage}</p>
            </div>

            {/* Photos */}
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Image className="w-5 h-5 text-pink-400" />
                <span className="text-sm text-gray-400">Photos</span>
              </div>
              <p className="text-2xl font-bold">{photos.length}</p>
            </div>

            {/* AI Requests */}
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-400">AI Requests</span>
              </div>
              <p className="text-2xl font-bold">{currentPlan.aiRequests}</p>
            </div>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Storage Usage</h2>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">
                {formatBytes(storageUsed)} / {isAdmin ? '∞' : formatBytes(storageLimit)}
              </span>
              <span className="text-gray-400">
                {isAdmin ? 'Unlimited' : `${storagePercentage.toFixed(1)}%`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${
                  storagePercentage > 90
                    ? 'from-red-500 to-red-600'
                    : storagePercentage > 70
                    ? 'from-yellow-500 to-orange-600'
                    : 'from-purple-600 to-pink-600'
                } transition-all duration-500`}
                style={{ width: `${isAdmin ? 20 : storagePercentage}%` }}
              />
            </div>
          </div>

          {storagePercentage > 80 && !isAdmin && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400">
                You're running low on storage. Consider upgrading to Pro for 50 GB.
              </p>
            </div>
          )}
        </div>

        {/* Available Plans */}
        {!isAdmin && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Plan</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`glass-card p-6 relative ${
                    plan.current ? 'ring-2 ring-purple-500' : ''
                  } ${plan.recommended ? 'shadow-2xl' : ''}`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs font-medium text-white flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Recommended
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-400">/{plan.period}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-purple-400" />
                      <span>{plan.storage} storage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <span>{plan.aiRequests} AI requests</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    disabled={plan.current}
                    className={`w-full py-3 rounded-lg font-medium transition ${
                      plan.current
                        ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                        : `bg-gradient-to-r ${plan.color} hover:opacity-90 text-white`
                    }`}
                  >
                    {plan.current ? 'Current Plan' : 'Upgrade Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Notice */}
        {isAdmin && (
          <div className="glass-card p-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border-2 border-red-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-bold text-red-400">Administrator Account</h3>
            </div>
            <p className="text-gray-300">
              You have unlimited storage and AI requests. This account has full administrative
              privileges.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;
