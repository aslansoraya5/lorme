# 📱 Lorme Android App

## 🚀 Quick Download

### Option 1: Direct APK Download (Easiest)
1. Build the APK using the instructions below
2. Transfer `app-debug.apk` to your Android device
3. Install and enjoy!

### Option 2: Build from Source

#### Prerequisites:
- Node.js 16+
- Android Studio (for full build) OR
- Android SDK command line tools (for CLI build)

#### Build Steps:

**Windows:**
```bash
build-android.bat
```

**Mac/Linux:**
```bash
chmod +x build-android.sh
./build-android.sh
```

**Manual Steps:**
```bash
# Install dependencies
npm install

# Build web app
npm run build

# Add Android platform
npx cap add android

# Sync web assets
npx cap sync android

# Open in Android Studio
npx cap open android

# OR build from command line
cd android
./gradlew assembleDebug  # Mac/Linux
gradlew assembleDebug    # Windows
```

#### APK Location:
- **Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📋 App Information

| Property | Value |
|----------|-------|
| **App Name** | Lorme |
| **Package** | com.lorme.app |
| **Version** | 1.0.0 |
| **Min SDK** | 22 (Android 5.1) |
| **Target SDK** | 34 (Android 14) |
| **Size** | ~300 MB (with dependencies) |

---

## 🔐 Permissions

The app requires **NO special permissions**:
- ✅ No internet access needed
- ✅ No storage access required
- ✅ All data stored locally
- ✅ Privacy-first design

---

## 📥 Installation on Android Device

1. **Enable Unknown Sources:**
   - Go to Settings > Security
   - Enable "Unknown Sources" or "Install unknown apps"

2. **Transfer APK:**
   - USB cable
   - Cloud storage (Google Drive, Dropbox)
   - Email attachment
   - Bluetooth

3. **Install:**
   - Navigate to the APK file
   - Tap to install
   - Open Lorme!

---

## 🛠️ Build Options

### Option A: Full Build with Android Studio (Recommended)
1. Run `build-android.sh` or `build-android.bat`
2. Open Android Studio when prompted
3. Wait for Gradle sync
4. Build > Build APK

**Pros:**
- Visual debugging
- Easy to modify
- Professional build process

**Cons:**
- Requires 3GB+ download (Android Studio)
- Takes longer to set up

### Option B: Command Line Only
```bash
cd android
./gradlew assembleDebug
```

**Pros:**
- Faster
- No Android Studio needed

**Cons:**
- Requires Android SDK setup
- Less visual feedback

### Option C: PWA to APK (Fastest)
1. Host the web app (or use localhost)
2. Use https://pwabuilder.com
3. Generate APK automatically

**Pros:**
- No build tools needed
- 5-minute setup

**Cons:**
- Less control
- Web wrapper limitations

---

## 🐛 Troubleshooting

### "Gradle build failed"
```bash
# Update Gradle wrapper
cd android
./gradlew wrapper --gradle-version=8.0
```

### "Android SDK not found"
- Install Android Studio
- Set `ANDROID_HOME` environment variable
- Accept SDK licenses: `sdkmanager --licenses`

### "APK installation blocked"
- Enable "Install unknown apps" for your file manager
- Disable Google Play Protect temporarily
- Check if APK is corrupted (rebuild)

### "Capacitor sync failed"
```bash
# Clean and rebuild
npx cap sync android --force
cd android
./gradlew clean
./gradlew assembleDebug
```

---

## 📱 Features

- ✅ Auto-reply rules with keyword matching
- ✅ Scheduled messages with recurring options
- ✅ Quick reply shortcuts
- ✅ Business hours configuration
- ✅ Response logging
- ✅ Dark mode support
- ✅ 100% offline functionality
- ✅ Local data storage

---

## 🔒 Privacy & Security

- **No Internet Permission**: App works completely offline
- **Local Storage**: All data stored in device's local storage
- **No Tracking**: No analytics or tracking libraries
- **No External Calls**: No communication with external servers

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review [Capacitor Docs](https://capacitorjs.com/)
3. Check [Android Developer Guide](https://developer.android.com/)

---

## 📄 License

This app is provided for educational and legitimate business purposes only.
Complies with WhatsApp Business Policy.

---

## 🆙 Updates

To update the app:
1. Update web code in `src/`
2. Run `npm run build`
3. Run `npx cap sync android`
4. Rebuild APK
5. Install new version (will update existing app)

---

**Last Updated**: 2026
**Version**: 1.0.0
