import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react'

/**
 * PrivacyPage - In-app privacy policy page
 * Consistent layout with other information pages
 */
const PrivacyPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation(['common', 'privacy'])

  return (
    <div className="min-h-screen pb-24">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 glass-card border-b border-white/20 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/more')}
            className="p-2 hover:bg-white/10 rounded-lg transition"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('privacy:title', { defaultValue: 'Privacy Policy' })}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Introduction */}
        <section className="glass-card p-6 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('privacy:lastUpdated', { defaultValue: 'Last updated: December 2024' })}
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('privacy:intro', {
              defaultValue:
                'At Pixtr, your privacy is our top priority. This privacy policy explains how we collect, use, and protect your personal information.',
            })}
          </p>
        </section>

        {/* Data Collection */}
        <section className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Database className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('privacy:dataCollection.title', {
                defaultValue: 'Information We Collect',
              })}
            </h2>
          </div>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>{t('privacy:dataCollection.account', { defaultValue: 'Account Information:' })}</strong>{' '}
              {t('privacy:dataCollection.accountDesc', {
                defaultValue: 'Email address, display name, and authentication details.',
              })}
            </p>
            <p>
              <strong>{t('privacy:dataCollection.content', { defaultValue: 'Content:' })}</strong>{' '}
              {t('privacy:dataCollection.contentDesc', {
                defaultValue: 'Photos, videos, and metadata you upload to Pixtr.',
              })}
            </p>
            <p>
              <strong>{t('privacy:dataCollection.usage', { defaultValue: 'Usage Data:' })}</strong>{' '}
              {t('privacy:dataCollection.usageDesc', {
                defaultValue: 'How you interact with the app to improve our service.',
              })}
            </p>
          </div>
        </section>

        {/* How We Use Data */}
        <section className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('privacy:dataUse.title', { defaultValue: 'How We Use Your Data' })}
            </h2>
          </div>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>{t('privacy:dataUse.service', { defaultValue: 'To provide and maintain the Pixtr service' })}</li>
            <li>{t('privacy:dataUse.improve', { defaultValue: 'To improve and personalize your experience' })}</li>
            <li>{t('privacy:dataUse.support', { defaultValue: 'To provide customer support' })}</li>
            <li>{t('privacy:dataUse.security', { defaultValue: 'To monitor and enhance security' })}</li>
          </ul>
        </section>

        {/* Data Protection */}
        <section className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <Lock className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('privacy:protection.title', { defaultValue: 'Data Protection' })}
            </h2>
          </div>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              {t('privacy:protection.desc', {
                defaultValue:
                  'We implement industry-standard security measures to protect your data:',
              })}
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>{t('privacy:protection.encryption', { defaultValue: 'End-to-end encryption for Vault photos' })}</li>
              <li>{t('privacy:protection.secure', { defaultValue: 'Secure cloud storage with Firebase' })}</li>
              <li>{t('privacy:protection.access', { defaultValue: 'Strict access controls and authentication' })}</li>
              <li>{t('privacy:protection.monitoring', { defaultValue: 'Regular security audits and monitoring' })}</li>
            </ul>
          </div>
        </section>

        {/* Your Rights */}
        <section className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('privacy:rights.title', { defaultValue: 'Your Rights' })}
            </h2>
          </div>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>{t('privacy:rights.access', { defaultValue: 'Access and download your data at any time' })}</li>
            <li>{t('privacy:rights.update', { defaultValue: 'Update or correct your personal information' })}</li>
            <li>{t('privacy:rights.delete', { defaultValue: 'Request deletion of your account and data' })}</li>
            <li>{t('privacy:rights.export', { defaultValue: 'Export your photos and metadata' })}</li>
          </ul>
        </section>

        {/* Contact */}
        <section className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t('privacy:contact.title', { defaultValue: 'Questions?' })}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {t('privacy:contact.desc', {
              defaultValue: 'If you have questions about this privacy policy, contact us at:',
            })}
          </p>
          <a
            href="mailto:privacy@pixtr.cloud"
            className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium"
          >
            privacy@pixtr.cloud
          </a>
        </section>
      </div>
    </div>
  )
}

export default PrivacyPage
