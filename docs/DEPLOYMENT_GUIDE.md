# 🚀 PhotoVault FASE 4 - Native App Deployment Guide

## 📋 Oversikt

Denne guiden tar deg gjennom hele prosessen fra web-app til native iOS og Android apps.

---

## 🛠️ Forutsetninger

### Software som må installeres:

#### For iOS:
- macOS (påkrevd for iOS-bygging)
- Xcode 14+ (fra Mac App Store)
- CocoaPods: `sudo gem install cocoapods`
- Apple Developer Account ($99/år)

#### For Android:
- Android Studio
- Java JDK 11+
- Android SDK (via Android Studio)
- Google Play Developer Account ($25 engangsgebyr)

#### Generelt:
- Node.js 16+
- npm eller yarn

---

## 📦 STEG 1: Installer dependencies

```bash
cd photovault

# Installer alle dependencies
npm install

# Installer Capacitor CLI globalt (valgfritt)
npm install -g @capacitor/cli
```

---

## 🔧 STEG 2: Initialiser Capacitor

```bash
# Initialiser Capacitor (hvis ikke allerede gjort)
npx cap init PhotoVault com.cre8web.photovault

# Bygg React-appen
npm run build

# Legg til iOS og Android platforms
npx cap add ios
npx cap add android

# Synkroniser web assets til native apps
npx cap sync
```

---

## 📱 STEG 3: iOS Setup

### 3.1 Åpne Xcode-prosjektet

```bash
npx cap open ios
```

### 3.2 Konfigurer i Xcode

1. **Velg Team**
   - Klikk på prosjektet i navigator
   - Under "Signing & Capabilities"
   - Velg ditt Apple Developer Team

2. **Sjekk Bundle Identifier**
   - Må matche: `com.cre8web.photovault`

3. **Sett Deployment Target**
   - iOS 13.0 minimum

4. **Legg til Capabilities**
   - Signing & Capabilities → + Capability
   - Legg til: Push Notifications, Background Modes

5. **Sjekk Info.plist**
   - Alle permissions skal allerede være der
   - Kamera, Photo Library, Face ID beskrivelser

### 3.3 Installer CocoaPods

```bash
cd ios/App
pod install
cd ../..
```

### 3.4 Test på simulator

1. Velg simulator (iPhone 14 Pro anbefalt)
2. Trykk Play (⌘R)
3. Test alle funksjoner

### 3.5 Build for TestFlight

1. Product → Archive
2. Når ferdig → Distribute App
3. Velg "App Store Connect"
4. Upload til TestFlight
5. Inviter testere via App Store Connect

---

## 🤖 STEG 4: Android Setup

### 4.1 Åpne Android Studio

```bash
npx cap open android
```

### 4.2 Konfigurer i Android Studio

1. **Update Gradle Files**
   - Build → Rebuild Project
   - Vent på synkronisering

2. **Sjekk AndroidManifest.xml**
   - Skal allerede inneholde alle permissions

3. **Sett Package Name**
   - Build → Edit Flavors
   - Application ID: `com.cre8web.photovault`

4. **Sett Minimum SDK**
   - API 22 (Android 5.1) minimum
   - Target SDK 33 (Android 13)

### 4.3 Test på emulator

1. Tools → AVD Manager
2. Create Virtual Device (Pixel 5 anbefalt)
3. Run → Run 'app'

### 4.4 Build for Google Play

#### Generer Signing Key

```bash
cd android/app
keytool -genkey -v -keystore photovault-release.keystore -alias photovault -keyalg RSA -keysize 2048 -validity 10000
```

**Lagre passordet trygt!**

#### Opprett key.properties

Lag `android/key.properties`:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=photovault
storeFile=photovault-release.keystore
```

#### Build Release APK

```bash
cd android
./gradlew assembleRelease
```

APK finnes på: `android/app/build/outputs/apk/release/app-release.apk`

#### Build AAB (for Play Store)

```bash
./gradlew bundleRelease
```

AAB finnes på: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🎨 STEG 5: App Icons & Splash Screens

### Generer icons

1. Gå til: https://icon.kitchen eller https://appicon.co
2. Last opp logo (1024x1024 PNG)
3. Last ned iOS og Android assets
4. Erstatt:
   - iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
   - Android: `android/app/src/main/res/mipmap-*/`

### Splash Screen

**iOS:**
- Xcode → LaunchScreen.storyboard
- Eller bruk Assets.xcassets for LaunchImage

**Android:**
- Lag splash.png (2732x2732)
- Plasser i `android/app/src/main/res/drawable/splash.png`

---

## 🔄 STEG 6: Oppdateringsrutine

Når du gjør endringer i React-koden:

```bash
# 1. Bygg React-app
npm run build

# 2. Synkroniser til native apps
npx cap sync

# 3. Åpne og test
# iOS:
npx cap open ios

# Android:
npx cap open android
```

**Automatisk med npm scripts:**

```bash
# iOS
npm run ios:build

# Android
npm run android:build
```

---

## 🧪 STEG 7: Testing

### Sjekkliste før lansering:

#### Funksjonalitet
- [ ] Login/logout fungerer
- [ ] Native kamera fungerer
- [ ] Gallery-picker fungerer
- [ ] Biometric auth fungerer
- [ ] Bilder lastes opp til Firebase
- [ ] Album-opprettelse fungerer
- [ ] Favoritt-toggle fungerer
- [ ] Søk fungerer
- [ ] Push notifications (fremtidig)

#### Native Features
- [ ] Kamera-permissions vises
- [ ] Photo library-permissions vises
- [ ] Biometric prompt vises
- [ ] Haptic feedback fungerer
- [ ] Status bar style riktig
- [ ] App icon vises korrekt
- [ ] Splash screen vises

#### Performance
- [ ] App starter raskt (<3 sek)
- [ ] Smooth scrolling
- [ ] Ingen memory leaks
- [ ] Battery drain akseptabel

#### Design
- [ ] Lys/mørk tema fungerer
- [ ] Responsiv på alle skjermstørrelser
- [ ] Safe areas respekteres (notch, home indicator)

---

## 📤 STEG 8: Lansering

### iOS App Store

1. **App Store Connect**
   - Opprett ny app
   - Fyll inn metadata
   - Last opp screenshots (5.5", 6.5")
   - Skriv beskrivelse
   - Velg kategori: Photo & Video

2. **Privacy Policy**
   - Må ha URL til privacy policy
   - Eksempel: https://yoursite.com/privacy

3. **Submit for Review**
   - Gjennomsnittlig review-tid: 24-48 timer
   - Vær tilgjengelig for spørsmål fra Apple

### Google Play Store

1. **Google Play Console**
   - Opprett ny app
   - Last opp AAB-fil
   - Fyll inn Store Listing
   - Last opp screenshots (flere størrelser)
   - Content rating questionnaire
   - Privacy policy URL

2. **Release Tracks**
   - Internal testing
   - Closed testing
   - Open testing
   - Production

3. **Submit for Review**
   - Raskere enn iOS (timer til få dager)

---

## 🔐 STEG 9: Sikkerhet

### Firebase Security Rules

Oppdater Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /photos/{photoId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    match /albums/{albumId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🐛 Feilsøking

### iOS-problemer

**"Command PhaseScriptExecution failed"**
```bash
cd ios/App
pod deintegrate
pod install
```

**"No valid signing identity"**
- Logg inn med Apple Developer Account i Xcode
- Preferences → Accounts → Download Manual Profiles

**Biometric fungerer ikke i simulator**
- Face ID må aktiveres i Simulator: Features → Face ID → Enrolled

### Android-problemer

**"Execution failed for task ':app:processDebugResources'"**
```bash
cd android
./gradlew clean
./gradlew build
```

**Camera svart skjerm**
- Sjekk permissions i AndroidManifest.xml
- Test på ekte enhet (ikke emulator)

**APK installer ikke**
```bash
adb uninstall com.cre8web.photovault
adb install app-release.apk
```

---

## 📊 Analytics & Monitoring

### Firebase Analytics

Legg til tracking:

```javascript
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics();

// Track photo upload
logEvent(analytics, 'photo_uploaded', {
  album_id: albumId,
  photo_count: 1
});

// Track feature usage
logEvent(analytics, 'feature_used', {
  feature_name: 'ai_enhance'
});
```

### Crashlytics (Android)

```bash
npm install @react-native-firebase/crashlytics
```

---

## 🔄 Versjonering

### Bump Version

**iOS (Xcode):**
- TARGETS → PhotoVault → General
- Version: 4.0.0 → 4.0.1
- Build: 1 → 2

**Android:**
```gradle
// android/app/build.gradle
versionCode 2
versionName "4.0.1"
```

### Git Tags

```bash
git tag -a v4.0.1 -m "Release version 4.0.1"
git push origin v4.0.1
```

---

## 📞 Support

### Før lansering

Test med venner/familie via:
- iOS: TestFlight (100 interne, 10,000 eksterne testere)
- Android: Closed Testing track

### Etter lansering

Sett opp:
- Support email: support@photovault.app
- FAQ-side
- In-app chat (Intercom, Zendesk, etc.)

---

## 🎉 Du er klar!

Sjekkliste før lansering:
- [ ] Alle filer fra denne guiden implementert
- [ ] Testing fullført på begge platformer
- [ ] App icons og splash screens på plass
- [ ] Privacy policy publisert
- [ ] Firebase security rules oppdatert
- [ ] Store listings skrevet
- [ ] Screenshots tatt
- [ ] Support-kanaler satt opp

**Lykke til med lanseringen! 🚀**

---

**Versjon:** 4.0.0  
**Laget av:** Roger / Cre8Web  
**Dato:** 20. oktober 2025
