const path = require('path');
const fs = require('fs-extra');
const logger = require('../utils/logger');
const androidConfig = require('../config/android.config');
const generateRootBuildGradle = require('../templates/android-webview/root-build.gradle.js');
const generateAppBuildGradle = require('../templates/android-webview/app-build.gradle.js');
const generateSettingsGradle = require('../templates/android-webview/settings.gradle.js');
const generateGradleWrapperProperties = require('../templates/android-webview/gradle-wrapper.properties.js');
const generateAndroidManifest = require('../templates/android-webview/AndroidManifest.xml.js');
const generateMainActivityJava = require('../templates/android-webview/MainActivity.java.js');

const webviewScaffoldService = {
  scaffoldProject: async (webAssetsDir, targetDir, metadata = {}) => {
    logger.info(`Scaffolding Android WebView project into: ${targetDir}`);

    const appName = metadata.appName || androidConfig.defaultApp.appName;
    const packageName = metadata.packageName || androidConfig.defaultApp.packageName;
    const packageSubPath = packageName.replace(/\./g, '/');

    const appModuleDir = path.join(targetDir, 'app');
    const javaDir = path.join(appModuleDir, 'src', 'main', 'java', packageSubPath);
    const assetsDir = path.join(appModuleDir, 'src', 'main', 'assets');
    const resDir = path.join(appModuleDir, 'src', 'main', 'res', 'values');
    const wrapperDir = path.join(targetDir, 'gradle', 'wrapper');

    await fs.ensureDir(javaDir);
    await fs.ensureDir(assetsDir);
    await fs.ensureDir(resDir);
    await fs.ensureDir(wrapperDir);

    await fs.copy(webAssetsDir, assetsDir, { overwrite: true });

    await fs.writeFile(
      path.join(targetDir, 'build.gradle'),
      generateRootBuildGradle({ gradlePluginVersion: androidConfig.gradlePluginVersion })
    );

    await fs.writeFile(
      path.join(targetDir, 'settings.gradle'),
      generateSettingsGradle(appName)
    );

    const gradlePropertiesContent = `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\n`;
    await fs.writeFile(path.join(targetDir, 'gradle.properties'), gradlePropertiesContent);

    await fs.writeFile(
      path.join(wrapperDir, 'gradle-wrapper.properties'),
      generateGradleWrapperProperties({ gradleDistributionUrl: androidConfig.gradleDistributionUrl })
    );

    await fs.writeFile(
      path.join(appModuleDir, 'build.gradle'),
      generateAppBuildGradle({
        compileSdkVersion: androidConfig.compileSdkVersion,
        minSdkVersion: androidConfig.minSdkVersion,
        targetSdkVersion: androidConfig.targetSdkVersion,
        packageName: packageName,
        versionCode: metadata.versionCode || 1,
        versionName: metadata.versionName || '1.0.0'
      })
    );

    await fs.writeFile(
      path.join(appModuleDir, 'src', 'main', 'AndroidManifest.xml'),
      generateAndroidManifest({ appName })
    );

    const stringsXml = `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <string name="app_name">${appName}</string>\n</resources>`;
    await fs.writeFile(path.join(resDir, 'strings.xml'), stringsXml);

    await fs.writeFile(
      path.join(javaDir, 'MainActivity.java'),
      generateMainActivityJava({ packageName })
    );

    logger.info(`Android WebView scaffolding completed successfully.`);
    return targetDir;
  }
};

module.exports = webviewScaffoldService;
