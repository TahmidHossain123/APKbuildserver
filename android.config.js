const path = require('path');

const androidConfig = {
  sdkPath: process.env.ANDROID_HOME || '/opt/android-sdk',
  javaHome: process.env.JAVA_HOME || '/usr/lib/jvm/java-17-openjdk-amd64',

  compileSdkVersion: 34,
  buildToolsVersion: '34.0.0',
  minSdkVersion: 24,
  targetSdkVersion: 34,

  gradlePluginVersion: '8.3.2',
  gradleDistributionUrl: 'https\\://services.gradle.org/distributions/gradle-8.4-bin.zip',

  defaultApp: {
    packageName: 'com.apkbuilder.generatedapp',
    appName: 'Generated App',
    versionCode: 1,
    versionName: '1.0.0'
  },

  gradleArgs: [
    'assembleDebug',
    '--no-daemon',
    '--stacktrace',
    '--warning-mode', 'all'
  ],

  getBuildEnvironment: function () {
    return {
      ...process.env,
      ANDROID_HOME: this.sdkPath,
      ANDROID_SDK_ROOT: this.sdkPath,
      JAVA_HOME: this.javaHome,
      PATH: `${this.javaHome}/bin:${this.sdkPath}/cmdline-tools/latest/bin:${this.sdkPath}/platform-tools:${this.sdkPath}/build-tools/34.0.0:${process.env.PATH}`,
      GRADLE_OPTS: process.env.GRADLE_OPTS || '-Dorg.gradle.daemon=false -Dorg.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m'
    };
  }
};

module.exports = androidConfig;
