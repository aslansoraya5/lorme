#!/bin/bash

echo "=========================================="
echo "  Lorme Android APK Builder"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "   Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the web app
echo "🏗️  Building web application..."
npm run build

# Check if build was successful
if [ ! -f "dist/index.html" ]; then
    echo "❌ Error: Build failed - dist/index.html not found"
    exit 1
fi

echo "✅ Web app built successfully!"
echo ""

# Check if Capacitor is installed
if ! npm list @capacitor/core &> /dev/null; then
    echo "⚠️  Capacitor not found. Installing..."
    npm install @capacitor/core @capacitor/cli @capacitor/android
fi

# Initialize Capacitor if needed
if [ ! -f "capacitor.config.json" ]; then
    echo "🔧 Initializing Capacitor..."
    npx cap init
fi

# Add Android platform
echo "🤖 Adding Android platform..."
npx cap add android --force

# Sync web assets
echo "📲 Syncing web assets..."
npx cap sync android

echo ""
echo "=========================================="
echo "  ✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Open Android Studio:"
echo "   npx cap open android"
echo ""
echo "2. In Android Studio:"
echo "   - Wait for Gradle sync to complete"
echo "   - Go to Build > Build Bundle(s) / APK(s) > Build APK(s)"
echo "   - APK will be at: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "Or build from command line:"
echo "   cd android"
echo "   ./gradlew assembleDebug"
echo ""
echo "📱 APK Location: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
