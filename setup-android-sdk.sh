#!/usr/bin/env bash

set -euo pipefail

ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
CMDLINE_ZIP="/tmp/cmdline-tools.zip"

echo "=================================================="
echo "Starting Android SDK and Build Tools Installation"
echo "Target Directory: ${ANDROID_HOME}"
echo "=================================================="

mkdir -p "${ANDROID_HOME}/cmdline-tools"

echo "Downloading Android Command Line Tools..."
curl -fsSL "${CMDLINE_TOOLS_URL}" -o "${CMDLINE_ZIP}"

echo "Extracting Android Command Line Tools..."
mkdir -p /tmp/cmdline-tools-extracted
unzip -q -o "${CMDLINE_ZIP}" -d /tmp/cmdline-tools-extracted

rm -rf "${ANDROID_HOME}/cmdline-tools/latest"
mv /tmp/cmdline-tools-extracted/cmdline-tools "${ANDROID_HOME}/cmdline-tools/latest"

rm -rf "${CMDLINE_ZIP}" /tmp/cmdline-tools-extracted

export PATH="${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${PATH}"

echo "Accepting Android SDK licenses..."
yes | sdkmanager --licenses > /dev/null 2>&1 || true

echo "Installing platform-tools, platforms;android-34, build-tools;34.0.0..."
sdkmanager --install \
  "platform-tools" \
  "platforms;android-34" \
  "build-tools;34.0.0"

yes | sdkmanager --licenses > /dev/null 2>&1 || true

echo "=================================================="
echo "Android SDK Installation Successfully Completed!"
echo "SDK Location: ${ANDROID_HOME}"
echo "=================================================="
