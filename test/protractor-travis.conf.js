exports.config = {
  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: '497ab04e-f31b-4a7b-9b18-ae3fbe023222',
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
