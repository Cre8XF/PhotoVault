#!/bin/bash

# PhotoVault FASE 4 - Quick Start Script
# Dette scriptet setter opp hele Capacitor-miljøet automatisk

echo "🚀 PhotoVault FASE 4 - Quick Start"
echo "=================================="
echo ""

# Sjekk om Node.js er installert
if ! command -v node &> /dev/null; then
    echo "❌ Node.js ikke funnet. Installer Node.js først."
    exit 1
fi

echo "✅ Node.js versjon: $(node -v)"
echo ""

# Installer dependencies
echo "📦 Installerer dependencies..."
npm install

# Bygg React-app
echo ""
echo "🔨 Bygger React-app..."
npm run build

# Initialiser Capacitor
echo ""
echo "⚡ Initialiserer Capacitor..."
npx cap init PhotoVault com.cre8web.photovault --web-dir=build

# Legg til iOS platform
echo ""
echo "🍎 Legger til iOS platform..."
npx cap add ios

# Legg til Android platform
echo ""
echo "🤖 Legger til Android platform..."
npx cap add android

# Synkroniser
echo ""
echo "🔄 Synkroniserer assets..."
npx cap sync

# Installer CocoaPods (hvis på macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo "☕ Installerer CocoaPods dependencies..."
    cd ios/App
    pod install
    cd ../..
fi

echo ""
echo "✅ FASE 4 Setup Fullført!"
echo ""
echo "📱 Neste steg:"
echo "   iOS:     npm run cap:open:ios"
echo "   Android: npm run cap:open:android"
echo ""
echo "📚 Les DEPLOYMENT_GUIDE.md for mer informasjon"
