import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  HelpCircle,
  Upload,
  Image,
  Lock,
  Settings,
  Mail,
} from 'lucide-react'

/**
 * HelpPage - In-app help and support page
 * Consistent layout with other information pages
 */
const HelpPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation(['common', 'help'])

  const helpTopics = [
    {
      icon: Upload,
      title: t('help:topics.uploading.title', {
        defaultValue: 'Uploading Photos',
      }),
      description: t('help:topics.uploading.desc', {
        defaultValue:
          'Upload photos by clicking the Upload button on the home page. Supports JPEG, PNG, and HEIC formats.',
      }),
    },
    {
      icon: Image,
      title: t('help:topics.albums.title', {
        defaultValue: 'Creating Albums',
      }),
      description: t('help:topics.albums.desc', {
        defaultValue:
          'Organize your photos into albums. Go to Albums tab, click Create Album, and add photos.',
      }),
    },
    {
      icon: Lock,
      title: t('help:topics.vault.title', {
        defaultValue: 'Using Secure Vault',
      }),
      description: t('help:topics.vault.desc', {
        defaultValue:
          'The Vault encrypts photos locally before upload. Set up a vault password in More → Vault.',
      }),
    },
    {
      icon: Settings,
      title: t('help:topics.settings.title', {
        defaultValue: 'Account Settings',
      }),
      description: t('help:topics.settings.desc', {
        defaultValue:
          'Manage your account, subscription, and preferences in the Settings page.',
      }),
    },
  ]

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
              {t('help:title', { defaultValue: 'Help & Support' })}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Getting Started */}
        <section className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <HelpCircle className="w-5 h-5 text-purple" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('help:gettingStarted.title', {
                defaultValue: 'Getting Started',
              })}
            </h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {t('help:gettingStarted.intro', {
              defaultValue:
                'Pixtr is designed to be simple and intuitive. Here are the basics to get you started.',
            })}
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>
              {t('help:gettingStarted.step1', {
                defaultValue: 'Upload your first photo using the Upload button',
              })}
            </li>
            <li>
              {t('help:gettingStarted.step2', {
                defaultValue: 'Create an album to organize photos',
              })}
            </li>
            <li>
              {t('help:gettingStarted.step3', {
                defaultValue: 'Share albums with QR codes or links',
              })}
            </li>
            <li>
              {t('help:gettingStarted.step4', {
                defaultValue:
                  'Explore features like Collage Builder and Timeline',
              })}
            </li>
          </ol>
        </section>

        {/* Common Topics */}
        <section className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t('help:commonTopics.title', { defaultValue: 'Common Topics' })}
          </h2>
          <div className="space-y-4">
            {helpTopics.map((topic, index) => (
              <div
                key={index}
                className="bg-white/5 p-4 rounded-xl border border-white/10"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-white/10 rounded-lg">
                    <topic.icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-gray-700 dark:text-gray-400">
                      {topic.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t('help:faq.title', { defaultValue: 'Frequently Asked Questions' })}
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">
                {t('help:faq.q1.question', {
                  defaultValue: 'How do I upgrade my plan?',
                })}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                {t('help:faq.q1.answer', {
                  defaultValue:
                    'Go to More → Subscription to view and upgrade your plan.',
                })}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">
                {t('help:faq.q2.question', {
                  defaultValue: 'Are my photos encrypted?',
                })}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                {t('help:faq.q2.answer', {
                  defaultValue:
                    'Photos uploaded to the Vault are encrypted client-side before upload. Regular photos use secure cloud storage.',
                })}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">
                {t('help:faq.q3.question', {
                  defaultValue: 'Can I export my data?',
                })}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                {t('help:faq.q3.answer', {
                  defaultValue:
                    'Yes! Use the Export button in More page to download all your photos and metadata.',
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('help:contact.title', { defaultValue: 'Contact Support' })}
            </h2>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {t('help:contact.description', {
              defaultValue:
                "Can't find what you're looking for? Get in touch with our support team.",
            })}
          </p>
          <a
            href="mailto:support@pixtr.cloud"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600
                       hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition"
          >
            <Mail className="w-4 h-4" />
            {t('help:contact.button', { defaultValue: 'Email Support' })}
          </a>
        </section>
      </div>
    </div>
  )
}

export default HelpPage
