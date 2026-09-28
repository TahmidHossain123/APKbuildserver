function generateGradleWrapperProperties(options = {}) {
  const distributionUrl = options.gradleDistributionUrl || 'https\\://services.gradle.org/distributions/gradle-8.4-bin.zip';

  return `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=${distributionUrl}
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;
}

module.exports = generateGradleWrapperProperties;
