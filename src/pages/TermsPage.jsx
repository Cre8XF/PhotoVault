import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, FileText, AlertCircle, CheckCircle } from 'lucide-react'

/**
 * TermsPage - In-app terms of service page
 * Consistent layout with other information pages
 */
const TermsPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation(['common', 'terms'])

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
              {t('terms:title', { defaultValue: 'Terms of Service' })}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Introduction */}
        <section className="glass-card p-6 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('terms:lastUpdated', { defaultValue: 'Last updated: December 2024' })}
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('terms:intro', {
              defaultValue:
                'By using Pixtr, you agree to these Terms of Service. Please read them carefully.',
            })}
          </p>
        </section>

        {/* Acceptance */}
        <section className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('terms:acceptance.title', { defaultValue: 'Acceptance of Terms' })}
            </h2>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('terms:acceptance.desc', {
              defaultValue:
                'By creating an account and using Pixtr, you accept these terms and agree to comply with all applicable laws and regulations.',
            })}
          </p>
        </section>

        {/* User Responsibilities */}
        <section className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('terms:responsibilities.title', { defaultValue: 'Your Responsibilities' })}
            </h2>
          </div>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>{t('terms:responsibilities.accurate', { defaultValue: 'Provide accurate account information' })}</li>
            <li>{t('terms:responsibilities.secure', { defaultValue: 'Keep your password secure and confidential' })}</li>
            <li>{t('terms:responsibilities.legal', { defaultValue: 'Use the service legally and respectfully' })}</li>
            <li>{t('terms:responsibilities.content', { defaultValue: 'Only upload content you own or have permission to use' })}</li>
          </ul>
        </section>

        {/* Service Usage */}
        <section className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t('terms:usage.title', { defaultValue: 'Acceptable Use' })}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {t('terms:usage.intro', { defaultValue: 'You agree NOT to:' })}
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>{t('terms:usage.violate', { defaultValue: 'Violate any laws or regulations' })}</li>
            <li>{t('terms:usage.harm', { defaultValue: 'Upload harmful, offensive, or illegal content' })}</li>
            <li>{t('terms:usage.interfere', { defaultValue: 'Interfere with the service or other users' })}</li>
            <li>{t('terms:usage.reverse', { defaultValue: 'Reverse engineer or attempt to extract source code' })}</li>
          </ul>
        </section>

        {/* Subscription Terms */}
        <section className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t('terms:subscription.title', { defaultValue: 'Subscription & Payment' })}
          </h2>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>{t('terms:subscription.billing', { defaultValue: 'Billing:' })}</strong>{' '}
              {t('terms:subscription.billingDesc', { defaultValue: 'Subscriptions are billed monthly or annually.' })}
            </p>
            <p>
              <strong>{t('terms:subscription.cancellation', { defaultValue: 'Cancellation:' })}</strong>{' '}
              {t('terms:subscription.cancellationDesc', { defaultValue: 'You may cancel at any time. No refunds for partial periods.' })}
            </p>
            <p>
              <strong>{t('terms:subscription.changes', { defaultValue: 'Price Changes:' })}</strong>{' '}
              {t('terms:subscription.changesDesc', { defaultValue: 'We may adjust pricing with 30 days notice.' })}
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-600/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('terms:liability.title', { defaultValue: 'Limitation of Liability' })}
            </h2>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('terms:liability.desc', {
              defaultValue:
                'Pixtr is provided "as is" without warranties. We are not liable for data loss, service interruptions, or indirect damages. Always maintain backups of important data.',
            })}
          </p>
        </section>

        {/* Termination */}
        <section className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t('terms:termination.title', { defaultValue: 'Termination' })}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('terms:termination.desc', {
              defaultValue:
                'We may suspend or terminate your account for violations of these terms. You may delete your account at any time from the settings page.',
            })}
          </p>
        </section>

        {/* Contact */}
        <section className="glass-card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t('terms:contact.title', { defaultValue: 'Questions?' })}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {t('terms:contact.desc', {
              defaultValue: 'If you have questions about these terms, contact us at:',
            })}
          </p>
          <a
            href="mailto:legal@pixtr.cloud"
            className="text-purple-600 dark:text-purple hover:underline text-sm font-medium"
          >
            legal@pixtr.cloud
          </a>
        </section>
      </div>
    </div>
  )
}

export default TermsPage
