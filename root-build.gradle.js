function generateRootBuildGradle(options = {}) {
  const agpVersion = options.gradlePluginVersion || '8.3.2';

  return `// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:${agpVersion}'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

tasks.register('clean', Delete) {
    delete rootProject.buildDir
}
`;
}

module.exports = generateRootBuildGradle;
