#!/usr/bin/env bash
set -euo pipefail

echo "=========================================="
echo " Starting Android SDK Automated Setup...  "
echo "=========================================="

# 1. Setup Environment Paths
export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME}}"
export PATH="${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${PATH}"

echo "Target ANDROID_HOME: ${ANDROID_HOME}"
mkdir -p "${ANDROID_HOME}"

# 2. Check for required system utilities
for tool in curl unzip; do
    if ! command -v "$tool" >/dev/null 2>&1; then
        echo "ERROR: Required utility '$tool' is not installed in the Docker image." >&2
        exit 1
    fi
done

# 3. Download Android Command-line Tools (Official Linux Release)
CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
TEMP_ZIP="/tmp/cmdline-tools.zip"
EXTRACT_DIR="/tmp/cmdline-tools-extracted"

echo "Downloading Android Command-line Tools..."
curl -fsSL "${CMDLINE_TOOLS_URL}" -o "${TEMP_ZIP}"

echo "Extracting Command-line Tools..."
rm -rf "${EXTRACT_DIR}"
mkdir -p "${EXTRACT_DIR}"
unzip -q -o "${TEMP_ZIP}" -d "${EXTRACT_DIR}"

# sdkmanager requires cmdline-tools inside /cmdline-tools/latest/
mkdir -p "${ANDROID_HOME}/cmdline-tools"
rm -rf "${ANDROID_HOME}/cmdline-tools/latest"
mv "${EXTRACT_DIR}/cmdline-tools" "${ANDROID_HOME}/cmdline-tools/latest"

# Cleanup temporary files
rm -f "${TEMP_ZIP}"
rm -rf "${EXTRACT_DIR}"

# 4. Accept Android SDK Licenses non-interactively
echo "Accepting licenses..."
yes | "${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager" --licenses >/dev/null 2>&1 || true

# 5. Install Required SDK Packages (Modern Android Standard: API 34 & 33)
echo "Installing Android SDK components (platforms, build-tools, platform-tools)..."
"${ANDROID_HOME}/cmdline-tools/latest/bin/sdkmanager" --install \
    "platform-tools" \
    "platforms;android-34" \
    "build-tools;34.0.0" \
    "platforms;android-33" \
    "build-tools;33.0.2"

# 6. Verify Installation
echo "Verifying installation integrity..."
if [ ! -d "${ANDROID_HOME}/platform-tools" ]; then
    echo "ERROR: platform-tools installation failed!" >&2
    exit 1
fi

if [ ! -d "${ANDROID_HOME}/build-tools/34.0.0" ]; then
    echo "ERROR: build-tools;34.0.0 installation failed!" >&2
    exit 1
fi

if [ ! -d "${ANDROID_HOME}/platforms/android-34" ]; then
    echo "ERROR: platforms;android-34 installation failed!" >&2
    exit 1
fi

echo "=========================================="
echo " Android SDK successfully installed!     "
echo "=========================================="
