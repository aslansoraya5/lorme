# Lorme Android App - Build Instructions

## 📱 How to Build Android APK

### Option 1: Using Capacitor (Recommended)

1. **Install Capacitor CLI globally:**
   ```bash
   npm install -g @capacitor/cli
   ```

2. **Initialize Capacitor (already configured):**
   ```bash
   npx cap init
   ```

3. **Add Android platform:**
   ```bash
   npx cap add android
   ```

4. **Build the web app:**
   ```bash
   npm run build
   ```

5. **Sync with Android:**
   ```bash
   npx cap sync android
   ```

6. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

7. **Build APK in Android Studio:**
   - Go to Build > Build Bundle(s) / APK(s) > Build APK(s)
   - APK will be generated at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Using Command Line (No Android Studio)

```bash
# Navigate to android folder
cd android

# Build debug APK
./gradlew assembleDebug

# APK location: app/build/outputs/apk/debug/app-debug.apk
```

### Option 3: Quick PWA to APK (Easiest)

1. Visit: https://pwabuilder.com
2. Enter your website URL (or host the web app)
3. Download Android App Package
4. Install on your Android device

---

## 📦 APK Information

- **App Name**: Lorme
- **Package Name**: com.lorme.app
- **Version**: 1.0.0
- **Minimum SDK**: 22 (Android 5.1)
- **Target SDK**: 34 (Android 14)
- **Permissions**: None required (runs entirely in browser)

---

## 🔒 Security Notes

This app:
- ✅ Stores all data locally on device
- ✅ No internet permission required
- ✅ No external server communication
- ✅ Privacy-first design

---

## 📥 Installation

1. Transfer the `.apk` file to your Android device
2. Enable "Install from Unknown Sources" in Settings
3. Tap the APK file to install
4. Open Lorme and start using!

---

## 🆘 Troubleshooting

**Error: "Android SDK not found"**
- Install Android Studio
- Set ANDROID_HOME environment variable

**Error: "Gradle build failed"**
- Update Gradle wrapper
- Check Android SDK installation

**APK installation blocked**
- Enable "Unknown Sources" in device settings
- Check if Play Protect is blocking installation

---

## 📞 Support

For issues, check:
- [Capacitor Documentation](https://capacitorjs.com/)
- [Android Developer Guide](https://developer.android.com/)
