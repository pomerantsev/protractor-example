exports.config = {
  sauceUser: 'pomerantsevp',
  sauceKey: '497ab04e-f31b-4a7b-9b18-ae3fbe023222',
  specs: ['**/*.spec.coffee'],
  baseUrl: 'http://localhost:8000/',

  // All available platform / browser combinations can be found on https://saucelabs.com/platforms
  multiCapabilities: [
    {
      browserName: 'chrome',
      platform: 'OS X 10.10',
      version: '37'
    }

    // Flaky
    // {
    //   browserName: 'firefox',
    //   platform: 'Windows 8.1',
    //   version: '33'
    // },

    // Flaky
    // {
    //   browserName: 'firefox',
    //   platform: 'OS X 10.10',
    //   version: '33'
    // },

    // Flaky
    // {
    //   browserName: 'safari',
    //   platform: 'OS X 10.10',
    //   version: '8'
    // },

    // The following three fail badly - need more testing
    // {
    //   browserName: 'iphone',
    //   platform: 'OS X 10.9',
    //   version: '8.1',
    //   'device-orientation': 'portrait'
    // },
    // {
    //   browserName: 'android',
    //   platform: 'Linux',
    //   version: '4.1',
    //   deviceName: 'Samsung Galaxy Note Emulator',
    //   'device-orientation': 'portrait'
    // },
    // {
    //   browserName: 'android',
    //   platform: 'Linux',
    //   version: '4.4',
    //   deviceName: 'Samsung Galaxy S4 Emulator',
    //   'device-orientation': 'portrait'
    // },

    // {
    //   browserName: 'internet explorer',
    //   platform: 'Windows 7',
    //   version: '9'
    // }
  ],

  allScriptsTimeout: 60000,
  getPageTimeout: 60000
};
