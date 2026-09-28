# Production APK Builder Server

A production-grade, headless Android APK compilation server built with Node.js, Express, Docker, OpenJDK 17, and Android SDK CLI Tools.

## Features
- **Authentic APK Compilation**: No mock files. Compiles debug APK binaries using Gradle and Android SDK Platform 34.
- **HTML-to-Android Conversion**: Upload standard HTML/CSS/JS (with `index.html`) in a ZIP, and it creates a full Android WebView app.
- **Native Android Support**: Upload any standard Android Gradle project ZIP and it builds it directly.
- **Zip-Slip Safe**: Guaranteed protection against path-traversal attacks inside ZIP entries.
- **Build Isolation & Queue**: Memory-safe sequential build queue.
- **Final Output Location**: Generated APK is always stored and served as `build-outputs/<BUILD_ID>/app-debug.apk`.

---

## Deployment Instructions (Render & GitHub)

### Step 1: Create GitHub Repository
1. Create a new repository on GitHub: `apk-builder-server`.
2. Push all the created files to your GitHub repository:
```bash
git init
git add .
git commit -m "Initial commit: Production APK Builder Server"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/apk-builder-server.git
git push -u origin main
