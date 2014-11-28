exports.config = {
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
  specs: ['**/*.spec.js'],
  baseUrl: 'http://localhost:8000/',

  multiCapabilities: [
    {
      'browserName': 'chrome',
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      'build': process.env.TRAVIS_BUILD_NUMBER
    }
  ],

  allScriptsTimeout: 30000,
  getPageTimeout: 30000
};
