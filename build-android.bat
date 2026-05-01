@echo off
echo ==========================================
echo   Lorme Android APK Builder
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed
    pause
    exit /b 1
)

echo npm found:
npm --version
echo.

REM Install dependencies
echo Installing dependencies...
call npm install
echo.

REM Build the web app
echo Building web application...
call npm run build
echo.

REM Check if build was successful
if not exist "dist\index.html" (
    echo ERROR: Build failed - dist\index.html not found
    pause
    exit /b 1
)

echo Web app built successfully!
echo.

REM Check if Capacitor is installed
call npm list @capacitor/core >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Capacitor not found. Installing...
    call npm install @capacitor/core @capacitor/cli @capacitor/android
)

REM Initialize Capacitor if needed
if not exist "capacitor.config.json" (
    echo Initializing Capacitor...
    call npx cap init
)

REM Add Android platform
echo Adding Android platform...
call npx cap add android --force

REM Sync web assets
echo Syncing web assets...
call npx cap sync android

echo.
echo ==========================================
echo   Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Open Android Studio:
echo    npx cap open android
echo.
echo 2. In Android Studio:
echo    - Wait for Gradle sync to complete
echo    - Go to Build > Build Bundle(s) / APK(s) > Build APK(s)
echo    - APK will be at: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Or build from command line:
echo    cd android
echo    gradlew assembleDebug
echo.
echo APK Location: android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
