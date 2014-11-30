var config = require('./protractor-shared.conf').config;

config.sauceUser = 'pomerantsevp';
config.sauceKey = '497ab04e-f31b-4a7b-9b18-ae3fbe023222';

// All available platform / browser combinations can be found on https://saucelabs.com/platforms
config.multiCapabilities = [
  {
    browserName: 'chrome',
    platform: 'OS X 10.10',
    version: '37'
  }
];

exports.config = config;
