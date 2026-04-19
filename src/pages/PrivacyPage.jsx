import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  Globe,
  CreditCard,
  Server,
  Users,
  Clock,
  Mail,
  FileText,
} from 'lucide-react'

/**
 * PrivacyPage - In-app privacy policy page
 * Google Play-compliant, GDPR-aligned privacy policy
 * Last audit: February 2026
 */
const PrivacyPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation(['common', 'privacy'])

  const SectionHeader = ({ icon: Icon, iconBg, iconColor, title }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 ${iconBg} rounded-lg`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
    </div>
  )

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
            {t('privacy:lastUpdated', {
              defaultValue: 'Last updated: February 2026',
            })}
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('privacy:intro', {
              defaultValue:
                'Pixtr ("we", "our", or "us") is a photo management application operated by Cre8XF. This Privacy Policy explains what data we collect, how we use it, who processes it, and what rights you have. It applies to users of the Pixtr mobile and web applications.',
            })}
          </p>
        </section>

        {/* 1. Information We Collect */}
        <section className="glass-card p-6 mb-6">
          <SectionHeader
            icon={Database}
            iconBg="bg-purple-600/20"
            iconColor="text-purple"
            title={t('privacy:dataCollection.title', {
              defaultValue: '1. Information We Collect',
            })}
          />
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>
                {t('privacy:dataCollection.account', {
                  defaultValue: 'Account Information',
                })}
              </strong>
              <br />
              {t('privacy:dataCollection.accountDesc', {
                defaultValue:
                  'When you create an account, we collect your email address, display name, and profile photo (if provided). Firebase Authentication manages your sign-in credentials.',
              })}
            </p>
            <p>
              <strong>
                {t('privacy:dataCollection.content', {
                  defaultValue: 'User Content',
                })}
              </strong>
              <br />
              {t('privacy:dataCollection.contentDesc', {
                defaultValue:
                  'Photos, videos, and documents you upload to Pixtr, along with album titles, descriptions, and tags you create.',
              })}
            </p>
            <p>
              <strong>
                {t('privacy:dataCollection.metadata', {
                  defaultValue: 'Photo Metadata (EXIF)',
                })}
              </strong>
              <br />
              {t('privacy:dataCollection.metadataDesc', {
                defaultValue:
                  'When you upload photos, we extract and store EXIF metadata including: date taken, GPS location (latitude, longitude, altitude), camera make and model, and technical settings (ISO, aperture, shutter speed, focal length). This data is used to organise your photos by date and location.',
              })}
            </p>
            <p>
              <strong>
                {t('privacy:dataCollection.payment', {
                  defaultValue: 'Payment Information',
                })}
              </strong>
              <br />
              {t('privacy:dataCollection.paymentDesc', {
                defaultValue:
                  'If you subscribe to a paid plan, payment is processed by Stripe. We do not store your credit card number. We receive and store your Stripe customer ID, subscription ID, subscription status, and selected plan tier from Stripe.',
              })}
            </p>
            <p>
              <strong>
                {t('privacy:dataCollection.device', {
                  defaultValue: 'Device and Technical Data',
                })}
              </strong>
              <br />
              {t('privacy:dataCollection.deviceDesc', {
                defaultValue:
                  'We collect basic technical information required for the service to function, such as authentication tokens, storage usage, and feature-tier limits. We do not use third-party analytics, advertising SDKs, or crash reporting services.',
              })}
            </p>
          </div>
        </section>

        {/* 2. How We Use Your Data */}
        <section className="glass-card p-6 mb-6">
          <SectionHeader
            icon={Eye}
            iconBg="bg-blue-600/20"
            iconColor="text-blue-400"
            title={t('privacy:dataUse.title', {
              defaultValue: '2. How We Use Your Data',
            })}
          />
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>
              {t('privacy:dataUse.service', {
                defaultValue:
                  'To provide core Pixtr functionality: storing, organising, and displaying your photos and albums',
              })}
            </li>
            <li>
              {t('privacy:dataUse.sync', {
                defaultValue: 'To synchronise your content across devices',
              })}
            </li>
            <li>
              {t('privacy:dataUse.subscription', {
                defaultValue:
                  'To manage your subscription, enforce plan limits, and process payments',
              })}
            </li>
            <li>
              {t('privacy:dataUse.security', {
                defaultValue:
                  'To authenticate your identity and protect your account',
              })}
            </li>
            <li>
              {t('privacy:dataUse.vault', {
                defaultValue:
                  'To enable Vault features, including client-side encryption of private photos',
              })}
            </li>
            <li>
              {t('privacy:dataUse.sharing', {
                defaultValue:
                  'To enable album sharing features (QR codes, public album links) when you choose to share',
              })}
            </li>
          </ul>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">
            {t('privacy:dataUse.noSell', {
              defaultValue:
                'We do not sell, rent, or share your personal data with third parties for advertising or marketing purposes.',
            })}
          </p>
        </section>

        {/* 3. Legal Basis for Processing (GDPR) */}
        <section className="glass-card p-6 mb-6">
          <SectionHeader
            icon={FileText}
            iconBg="bg-indigo-600/20"
            iconColor="text-indigo-400"
            title={t('privacy:legalBasis.title', {
              defaultValue: '3. Legal Basis for Processing (GDPR)',
            })}
          />
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              {t('privacy:legalBasis.intro', {
                defaultValue:
                  'If you are located in the EU/EEA, we process your data under the following legal bases:',
              })}
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>
                  {t('privacy:legalBasis.contract', {
                    defaultValue: 'Performance of contract',
                  })}
                </strong>{' '}
                {t('privacy:legalBasis.contractDesc', {
                  defaultValue:
                    '– Providing the Pixtr service, managing your account, storing and delivering your photos, and processing subscriptions.',
                })}
              </li>
              <li>
                <strong>
                  {t('privacy:legalBasis.consent', {
                    defaultValue: 'Consent',
                  })}
                </strong>{' '}
                {t('privacy:legalBasis.consentDesc', {
                  defaultValue:
                    '– Processing GPS location data from photo EXIF metadata (you control this via your device camera settings). Enabling optional features like public album sharing.',
                })}
              </li>
              <li>
                <strong>
                  {t('privacy:legalBasis.legitimate', {
                    defaultValue: 'Legitimate interest',
                  })}
                </strong>{' '}
                {t('privacy:legalBasis.legitimateDesc', {
                  defaultValue:
                    '– Maintaining security, preventing fraud, and improving service reliability.',
                })}
              </li>
            </ul>
          </div>
        </section>

        {/* 4. Data Storage & Security */}
        <section className="glass-card p-6 mb-6">
          <SectionHeader
            icon={Lock}
            iconBg="bg-green-600/20"
            iconColor="text-green-400"
            title={t('privacy:storage.title', {
              defaultValue: '4. Data Storage and Security',
            })}
          />
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <p>
              {t('privacy:storage.intro', {
                defaultValue:
                  'We use the following infrastructure to store and protect your data:',
              })}
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                {t('privacy:storage.r2', {
                  defaultValue:
                    'Photos and videos are stored on Cloudflare R2 object storage. All data is encrypted in transit via HTTPS.',
                })}
              </li>
              <li>
                {t('privacy:storage.firestore', {
                  defaultValue:
                    'Photo metadata, album data, and user profiles are stored in Google Cloud Firestore. Firestore encrypts data at rest automatically.',
                })}
              </li>
              <li>
                {t('privacy:storage.auth', {
                  defaultValue:
                    'Authentication is managed by Firebase Authentication (Google). Passwords are hashed by Firebase and never stored in plain text by Pixtr.',
                })}
              </li>
              <li>
                {t('privacy:storage.local', {
                  defaultValue:
                    'Your browser may cache photo metadata and thumbnails locally using IndexedDB for offline access and performance. This data remains on your device.',
                })}
              </li>
            </ul>

            <div className="mt-4 p-4 bg-green-600/10 rounded-lg border border-green-500/20">
              <p className="font-semibold mb-2">
                {t('privacy:storage.vaultTitle', {
                  defaultValue: 'Vault (Private Photos)',
                })}
              </p>
              <p>
                {t('privacy:storage.vaultDesc', {
                  defaultValue:
                    'Photos placed in the Vault are encrypted on your device before upload using AES-256-GCM with a key derived from your vault password (PBKDF2, 100,000 iterations). The encryption and decryption happen entirely in your browser. Pixtr servers never receive your vault password or the decryption key. If you lose your vault password, encrypted photos cannot be recovered.',
                })}
              </p>
            </div>
          </div>
        </section>

        {/* 5. Third-Party Service Providers */}
        <section className="glass-card p-6 mb-6">
          <SectionHeader
            icon={Server}
            iconBg="bg-orange-600/20"
            iconColor="text-orange-400"
            title={t('privacy:thirdParty.title', {
              defaultValue: '5. Third-Party Service Providers',
            })}
          />
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              {t('privacy:thirdParty.intro', {
                defaultValue:
                  'We use the following third-party services to operate Pixtr. Each processes data only as necessary to provide their service:',
              })}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-600">
                    <th className="py-2 pr-4 font-semibold">
                      {t('privacy:thirdParty.provider', {
                        defaultValue: 'Provider',
                      })}
                    </th>
                    <th className="py-2 pr-4 font-semibold">
                      {t('privacy:thirdParty.purpose', {
                        defaultValue: 'Purpose',
                      })}
                    </th>
                    <th className="py-2 font-semibold">
                      {t('privacy:thirdParty.dataProcessed', {
                        defaultValue: 'Data Processed',
                      })}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-2 pr-4">Google Firebase</td>
                    <td className="py-2 pr-4">
                      {t('privacy:thirdParty.firebasePurpose', {
                        defaultValue: 'Authentication, database',
                      })}
                    </td>
                    <td className="py-2">
                      {t('privacy:thirdParty.firebaseData', {
                        defaultValue:
                          'Email, user profile, photo metadata, album data',
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Cloudflare</td>
                    <td className="py-2 pr-4">
                      {t('privacy:thirdParty.cloudflarePurpose', {
                        defaultValue: 'File storage (R2), CDN, Workers',
                      })}
                    </td>
                    <td className="py-2">
                      {t('privacy:thirdParty.cloudflareData', {
                        defaultValue: 'Photos, videos, encrypted vault files',
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Stripe</td>
                    <td className="py-2 pr-4">
                      {t('privacy:thirdParty.stripePurpose', {
                        defaultValue: 'Payment processing',
                      })}
                    </td>
                    <td className="py-2">
                      {t('privacy:thirdParty.stripeData', {
                        defaultValue:
                          'Email, payment card details, billing address',
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Netlify</td>
                    <td className="py-2 pr-4">
                      {t('privacy:thirdParty.netlifyPurpose', {
                        defaultValue: 'Backend serverless functions',
                      })}
                    </td>
                    <td className="py-2">
                      {t('privacy:thirdParty.netlifyData', {
                        defaultValue:
                          'Authentication tokens, subscription events',
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              {t('privacy:thirdParty.noAnalytics', {
                defaultValue:
                  'We do not use any third-party analytics, advertising, or crash reporting services.',
              })}
            </p>
          </div>
        </section>

        {/* 6. International Data Transfers */}
        <section className="glass-card p-6 mb-6">
          <SectionHeader
            icon={Globe}
            iconBg="bg-cyan-600/20"
            iconColor="text-cyan-400"
            title={t('privacy:transfers.title', {
              defaultValue: '6. International Data Transfers',
            })}
          />
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              {t('privacy:transfers.desc', {
                defaultValue:
                  'Your data may be processed and stored in the United States and other countries where our service providers operate (Google, Cloudflare, Stripe, Netlify). These providers use Standard Contractual Clauses (SCCs) or equivalent safeguards to protect data transferred from the EU/EEA. By using Pixtr, you acknowledge that your data may be transferred internationally.',
              })}
            </p>
          </div>
        </section>

        {/* 7. Data Retention */}
        <section className="glass-card p-6 mb-6">
          <SectionHeader
            icon={Clock}
            iconBg="bg-yellow-600/20"
            iconColor="text-yellow-400"
            title={t('privacy:retention.title', {
              defaultValue: '7. Data Retention',
            })}
          />
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <ul className="list-disc list-inside space-y-2">
              <li>
                {t('privacy:retention.active', {
                  defaultValue:
                    'Your photos, albums, and account data are retained for as long as your account is active.',
                })}
              </li>
              <li>
                {t('privacy:retention.trash', {
                  defaultValue:
                    'Deleted photos are moved to Trash and permanently removed after 30 days.',
                })}
              </li>
              <li>
                {t('privacy:retention.account', {
                  defaultValue:
                    'If you delete your account, all associated data (photos, albums, metadata, vault files) is permanently deleted from our servers, except where we are required by law to retain it.',
                })}
              </li>
              <li>
                {t('privacy:retention.stripe', {
                  defaultValue:
                    'Stripe may retain payment records independently in accordance with financial regulations and their own privacy policy.',
                })}
              </li>
            </ul>
          </div>
        </section>

        {/* 8. Payment Processing */}
        <section className="glass-card p-6 mb-6">
          <SectionHeader
            icon={CreditCard}
            iconBg="bg-pink-600/20"
            iconColor="text-pink-400"
            title={t('privacy:payment.title', {
              defaultValue: '8. Payment Processing',
            })}
          />
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              {t('privacy:payment.desc', {
                defaultValue:
                  'Paid subscriptions (Lite, Pro) are processed through Stripe. When you subscribe, you are redirected to a Stripe-hosted checkout page. Pixtr does not receive or store your full credit card number. Stripe notifies Pixtr of your subscription status via secure webhooks. For more information, see Stripe\'s Privacy Policy at stripe.com/privacy.',
              })}
            </p>
          </div>
        </section>

        {/* 9. Biometric Authentication */}
        <section className="glass-card p-6 mb-6">
          <SectionHeader
            icon={Users}
            iconBg="bg-teal-600/20"
            iconColor="text-teal-400"
            title={t('privacy:biometric.title', {
              defaultValue: '9. Biometric Authentication',
            })}
          />
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              {t('privacy:biometric.desc', {
                defaultValue:
                  'Pixtr may offer biometric authentication (fingerprint, Face ID) to unlock the Vault. All biometric processing is handled by your device operating system. Pixtr never accesses, collects, or stores biometric data.',
              })}
            </p>
          </div>
        </section>

        {/* 10. Your Rights */}
        <section className="glass-card p-6 mb-6">
          <SectionHeader
            icon={Shield}
            iconBg="bg-purple-600/20"
            iconColor="text-purple"
            title={t('privacy:rights.title', {
              defaultValue: '10. Your Rights',
            })}
          />
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              {t('privacy:rights.intro', {
                defaultValue:
                  'Depending on your location, you have the following rights regarding your personal data:',
              })}
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>
                  {t('privacy:rights.accessLabel', {
                    defaultValue: 'Access',
                  })}
                </strong>{' '}
                {t('privacy:rights.accessDesc', {
                  defaultValue:
                    '– Request a copy of the personal data we hold about you.',
                })}
              </li>
              <li>
                <strong>
                  {t('privacy:rights.rectificationLabel', {
                    defaultValue: 'Rectification',
                  })}
                </strong>{' '}
                {t('privacy:rights.rectificationDesc', {
                  defaultValue:
                    '– Correct inaccurate or incomplete personal data.',
                })}
              </li>
              <li>
                <strong>
                  {t('privacy:rights.erasureLabel', {
                    defaultValue: 'Erasure',
                  })}
                </strong>{' '}
                {t('privacy:rights.erasureDesc', {
                  defaultValue:
                    '– Request deletion of your account and all associated data.',
                })}
              </li>
              <li>
                <strong>
                  {t('privacy:rights.restrictionLabel', {
                    defaultValue: 'Restriction',
                  })}
                </strong>{' '}
                {t('privacy:rights.restrictionDesc', {
                  defaultValue:
                    '– Request that we limit the processing of your data.',
                })}
              </li>
              <li>
                <strong>
                  {t('privacy:rights.portabilityLabel', {
                    defaultValue: 'Data Portability',
                  })}
                </strong>{' '}
                {t('privacy:rights.portabilityDesc', {
                  defaultValue:
                    '– Download your photos and metadata in a portable format.',
                })}
              </li>
              <li>
                <strong>
                  {t('privacy:rights.objectLabel', {
                    defaultValue: 'Objection',
                  })}
                </strong>{' '}
                {t('privacy:rights.objectDesc', {
                  defaultValue:
                    '– Object to processing based on legitimate interest.',
                })}
              </li>
              <li>
                <strong>
                  {t('privacy:rights.complaintLabel', {
                    defaultValue: 'Lodge a complaint',
                  })}
                </strong>{' '}
                {t('privacy:rights.complaintDesc', {
                  defaultValue:
                    '– You have the right to file a complaint with your local data protection authority.',
                })}
              </li>
            </ul>
            <p className="mt-2">
              {t('privacy:rights.howTo', {
                defaultValue:
                  'To exercise any of these rights, contact us at the email address below. You can also delete your account directly from the app settings.',
              })}
            </p>
          </div>
        </section>

        {/* 11. Children's Privacy */}
        <section className="glass-card p-6 mb-6">
          <SectionHeader
            icon={Users}
            iconBg="bg-red-600/20"
            iconColor="text-red-400"
            title={t('privacy:children.title', {
              defaultValue: "11. Children's Privacy",
            })}
          />
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              {t('privacy:children.desc', {
                defaultValue:
                  'Pixtr is not directed at children under the age of 13 (or the applicable minimum age in your jurisdiction). We do not knowingly collect personal data from children. If we become aware that a child has provided personal data, we will delete the account and associated data promptly. If you believe a child has created an account, please contact us.',
              })}
            </p>
          </div>
        </section>

        {/* 12. Changes to This Policy */}
        <section className="glass-card p-6 mb-6">
          <SectionHeader
            icon={FileText}
            iconBg="bg-gray-600/20"
            iconColor="text-gray-400"
            title={t('privacy:changes.title', {
              defaultValue: '12. Changes to This Policy',
            })}
          />
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              {t('privacy:changes.desc', {
                defaultValue:
                  'We may update this Privacy Policy from time to time. When we make material changes, we will update the "Last updated" date at the top and, where appropriate, notify you within the app. Continued use of Pixtr after changes are posted constitutes acceptance of the revised policy.',
              })}
            </p>
          </div>
        </section>

        {/* 13. Contact */}
        <section className="glass-card p-6">
          <SectionHeader
            icon={Mail}
            iconBg="bg-purple-600/20"
            iconColor="text-purple"
            title={t('privacy:contact.title', {
              defaultValue: '13. Contact Us',
            })}
          />
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="mb-3">
              {t('privacy:contact.desc', {
                defaultValue:
                  'If you have questions about this Privacy Policy or wish to exercise your data rights, contact us at:',
              })}
            </p>
            <p className="mb-1">
              <strong>Pixtr</strong> – {t('privacy:contact.operator', { defaultValue: 'Operated by Cre8XF' })}
            </p>
            <a
              href="mailto:cre8xf@gmail.com"
              className="text-purple-600 dark:text-purple hover:underline font-medium"
            >
              cre8xf@gmail.com
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PrivacyPage
