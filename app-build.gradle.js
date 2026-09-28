function generateAppBuildGradle(options = {}) {
  const compileSdk = options.compileSdkVersion || 34;
  const minSdk = options.minSdkVersion || 24;
  const targetSdk = options.targetSdkVersion || 34;
  const applicationId = options.packageName || 'com.apkbuilder.generatedapp';
  const versionCode = options.versionCode || 1;
  const versionName = options.versionName || '1.0.0';

  return `plugins {
    id 'com.android.application'
}

android {
    namespace '${applicationId}'
    compileSdk ${compileSdk}

    defaultConfig {
        applicationId "${applicationId}"
        minSdk ${minSdk}
        targetSdk ${targetSdk}
        versionCode ${versionCode}
        versionName "${versionName}"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            debuggable true
            applicationIdSuffix ".debug"
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.webkit:webkit:1.10.0'
    implementation 'androidx.activity:activity:1.8.2'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
}
`;
}

module.exports = generateAppBuildGradle;
