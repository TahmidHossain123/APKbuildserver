function generateSettingsGradle(appName = 'Generated App') {
  const sanitizedAppName = appName.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${sanitizedAppName}"
include ':app'
`;
}

module.exports = generateSettingsGradle;
