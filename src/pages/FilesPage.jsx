// ============================================================================
// PAGE: FilesPage.jsx – Files / Filer Navigation Page
// ============================================================================
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileText, Lock, ChevronRight, Folder } from 'lucide-react'
import UpgradePromptModal from '../components/UpgradePromptModal'
import useAuth from '../hooks/useAuth'

const FilesPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation(['files', 'nav', 'common'])
  const { userProfile } = useAuth()
  const [showUpgradeModal, setShowUpgradeModal] = useState(null)

  // 🔒 FEATURE CAPABILITIES BASED ON SUBSCRIPTION TIER
  const capabilities = React.useMemo(() => {
    const tier = userProfile?.subscriptionTier || 'FREE'
    return {
      documents: tier !== 'FREE', // LITE or PRO only
      vault: tier !== 'FREE', // LITE or PRO only
    }
  }, [userProfile])

  return (
    <div className="min-h-screen p-6 pb-24">
      {/* Page Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-purple-600/20 rounded-xl">
            <Folder className="w-7 h-7 text-purple" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('files:title')}</h1>
            <p className="text-muted text-sm">{t('files:subtitle')}</p>
          </div>
        </div>

        {/* Cards Section */}
        <div className="mt-8 space-y-4">
          {/* Documents Card */}
          <button
            onClick={() => {
              if (capabilities.documents) {
                navigate('/documents')
              } else {
                setShowUpgradeModal('documents')
              }
            }}
            className={`ripple-effect w-full glass p-6 rounded-2xl transition flex items-center gap-4 text-left border-2 border-white/10 hover:border-purple-500/30 relative ${
              !capabilities.documents ? 'opacity-80' : ''
            }`}
          >
            {/* Lite Badge for FREE users */}
            {!capabilities.documents && (
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full">
                  {t('files:documents.liteBadge')}
                </span>
              </div>
            )}

            <div className="p-4 bg-purple-600/20 rounded-xl">
              <FileText className="w-8 h-8 text-purple" />
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">
                {t('files:documents.title')}
              </h3>
              <p className="text-sm text-muted">
                {t('files:documents.description')}
              </p>
            </div>

            <ChevronRight className="w-6 h-6 opacity-50" />
          </button>

          {/* Secure Vault Card */}
          <button
            onClick={() => {
              if (capabilities.vault) {
                navigate('/vault')
              } else {
                setShowUpgradeModal('vault')
              }
            }}
            className={`ripple-effect w-full glass p-6 rounded-2xl transition flex items-center gap-4 text-left border-2 border-white/10 hover:border-purple-500/30 relative ${
              !capabilities.vault ? 'opacity-80' : ''
            }`}
          >
            {/* Lite Badge for FREE users */}
            {!capabilities.vault && (
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full">
                  {t('files:vault.liteBadge')}
                </span>
              </div>
            )}

            <div className="p-4 bg-purple-600/20 rounded-xl">
              <Lock className="w-8 h-8 text-purple" />
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">
                {t('files:vault.title')}
              </h3>
              <p className="text-sm text-muted">{t('files:vault.description')}</p>
            </div>

            <ChevronRight className="w-6 h-6 opacity-50" />
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradePromptModal
        isOpen={showUpgradeModal !== null}
        onClose={() => setShowUpgradeModal(null)}
        feature={showUpgradeModal}
      />
    </div>
  )
}

export default FilesPage
