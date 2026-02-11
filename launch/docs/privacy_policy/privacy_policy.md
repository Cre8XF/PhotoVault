# Privacy Policy – Pixtr

**Last updated: February 2026**

Pixtr ("we", "our", or "us") is a photo management application operated by Cre8XF. This Privacy Policy explains what data we collect, how we use it, who processes it, and what rights you have. It applies to users of the Pixtr mobile and web applications.

---

## 1. Information We Collect

**Account Information**
When you create an account, we collect your email address, display name, and profile photo (if provided). Firebase Authentication manages your sign-in credentials.

**User Content**
Photos, videos, and documents you upload to Pixtr, along with album titles, descriptions, and tags you create.

**Photo Metadata (EXIF)**
When you upload photos, we extract and store EXIF metadata including: date taken, GPS location (latitude, longitude, altitude), camera make and model, and technical settings (ISO, aperture, shutter speed, focal length). This data is used to organise your photos by date and location.

**Payment Information**
If you subscribe to a paid plan, payment is processed by Stripe. We do not store your credit card number. We receive and store your Stripe customer ID, subscription ID, subscription status, and selected plan tier from Stripe.

**Device and Technical Data**
We collect basic technical information required for the service to function, such as authentication tokens, storage usage, and feature-tier limits. We do not use third-party analytics, advertising SDKs, or crash reporting services.

---

## 2. How We Use Your Data

- To provide core Pixtr functionality: storing, organising, and displaying your photos and albums
- To synchronise your content across devices
- To manage your subscription, enforce plan limits, and process payments
- To authenticate your identity and protect your account
- To enable Vault features, including client-side encryption of private photos
- To enable album sharing features (QR codes, public album links) when you choose to share

We do not sell, rent, or share your personal data with third parties for advertising or marketing purposes.

---

## 3. Legal Basis for Processing (GDPR)

If you are located in the EU/EEA, we process your data under the following legal bases:

- **Performance of contract** – Providing the Pixtr service, managing your account, storing and delivering your photos, and processing subscriptions.
- **Consent** – Processing GPS location data from photo EXIF metadata (you control this via your device camera settings). Enabling optional features like public album sharing.
- **Legitimate interest** – Maintaining security, preventing fraud, and improving service reliability.

---

## 4. Data Storage and Security

We use the following infrastructure to store and protect your data:

- **Cloudflare R2**: Photos and videos are stored on Cloudflare R2 object storage. All data is encrypted in transit via HTTPS.
- **Google Cloud Firestore**: Photo metadata, album data, and user profiles are stored in Firestore. Firestore encrypts data at rest automatically.
- **Firebase Authentication**: Authentication is managed by Firebase Authentication (Google). Passwords are hashed by Firebase and never stored in plain text by Pixtr.
- **Local Storage (IndexedDB)**: Your browser may cache photo metadata and thumbnails locally using IndexedDB for offline access and performance. This data remains on your device.

### Vault (Private Photos)

Photos placed in the Vault are encrypted on your device before upload using AES-256-GCM with a key derived from your vault password (PBKDF2, 100,000 iterations). The encryption and decryption happen entirely in your browser. Pixtr servers never receive your vault password or the decryption key. If you lose your vault password, encrypted photos cannot be recovered.

---

## 5. Third-Party Service Providers

We use the following third-party services to operate Pixtr. Each processes data only as necessary to provide their service:

| Provider | Purpose | Data Processed |
|----------|---------|---------------|
| Google Firebase | Authentication, database | Email, user profile, photo metadata, album data |
| Cloudflare | File storage (R2), CDN, Workers | Photos, videos, encrypted vault files |
| Stripe | Payment processing | Email, payment card details, billing address |
| Netlify | Backend serverless functions | Authentication tokens, subscription events |

We do not use any third-party analytics, advertising, or crash reporting services.

---

## 6. International Data Transfers

Your data may be processed and stored in the United States and other countries where our service providers operate (Google, Cloudflare, Stripe, Netlify). These providers use Standard Contractual Clauses (SCCs) or equivalent safeguards to protect data transferred from the EU/EEA. By using Pixtr, you acknowledge that your data may be transferred internationally.

---

## 7. Data Retention

- Your photos, albums, and account data are retained for as long as your account is active.
- Deleted photos are moved to Trash and permanently removed after 30 days.
- If you delete your account, all associated data (photos, albums, metadata, vault files) is permanently deleted from our servers, except where we are required by law to retain it.
- Stripe may retain payment records independently in accordance with financial regulations and their own privacy policy.

---

## 8. Payment Processing

Paid subscriptions (Lite, Pro) are processed through Stripe. When you subscribe, you are redirected to a Stripe-hosted checkout page. Pixtr does not receive or store your full credit card number. Stripe notifies Pixtr of your subscription status via secure webhooks. For more information, see Stripe's Privacy Policy at [stripe.com/privacy](https://stripe.com/privacy).

---

## 9. Biometric Authentication

Pixtr may offer biometric authentication (fingerprint, Face ID) to unlock the Vault. All biometric processing is handled by your device operating system. Pixtr never accesses, collects, or stores biometric data.

---

## 10. Your Rights

Depending on your location, you have the following rights regarding your personal data:

- **Access** – Request a copy of the personal data we hold about you.
- **Rectification** – Correct inaccurate or incomplete personal data.
- **Erasure** – Request deletion of your account and all associated data.
- **Restriction** – Request that we limit the processing of your data.
- **Data Portability** – Download your photos and metadata in a portable format.
- **Objection** – Object to processing based on legitimate interest.
- **Lodge a complaint** – You have the right to file a complaint with your local data protection authority.

To exercise any of these rights, contact us at the email address below. You can also delete your account directly from the app settings.

---

## 11. Children's Privacy

Pixtr is not directed at children under the age of 13 (or the applicable minimum age in your jurisdiction). We do not knowingly collect personal data from children. If we become aware that a child has provided personal data, we will delete the account and associated data promptly. If you believe a child has created an account, please contact us.

---

## 12. Changes to This Policy

We may update this Privacy Policy from time to time. When we make material changes, we will update the "Last updated" date at the top and, where appropriate, notify you within the app. Continued use of Pixtr after changes are posted constitutes acceptance of the revised policy.

---

## 13. Contact Us

If you have questions about this Privacy Policy or wish to exercise your data rights, contact us at:

**Pixtr** – Operated by Cre8XF
Email: [cre8xf@gmail.com](mailto:cre8xf@gmail.com)
