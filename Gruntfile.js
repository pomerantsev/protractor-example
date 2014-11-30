module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['connect:server:keepalive']);

  var sauceUser = 'pomerantsevp';
  var sauceKey = '497ab04e-f31b-4a7b-9b18-ae3fbe023222';

  grunt.initConfig({
    connect: {
      testserver: {
        options: {
          port: 8000,
          hostname: '0.0.0.0',
          middleware: function (connect, options) {
            console.log('options.base', options.base);
            var base = Array.isArray(options.base) ? options.base[options.base.length - 1] : options.base;
            return [
              connect.static(base)
            ];
          }
        }
      }
    },
    protractor: {
      local: {
        options: {
          configFile: 'test/protractor-local.conf.js'
        }
      },
      travis: {
        options: {
          configFile: 'test/protractor-travis.conf.js',
          args: {
            sauceUser: sauceUser,
            sauceKey: sauceKey
          }
        }
      }
    }
  });

  grunt.registerTask('webdriver', 'Update webdriver', function() {
    var done = this.async();
    var p = require('child_process').spawn('node', ['node_modules/protractor/bin/webdriver-manager', 'update']);
    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
    p.on('exit', function(code){
      if(code !== 0) grunt.fail.warn('Webdriver failed to update');
      done();
    });
  });

  grunt.registerTask('sauce-connect', 'Launch Sauce Connect', function () {
    var done = this.async();
    require('sauce-connect-launcher')({
      username: sauceUser,
      accessKey: sauceKey
    }, function (err, sauceConnectProcess) {
      if (err) {
        console.error(err.message);
      } else {
        done();
      }
    });
  });

  grunt.registerTask(
    'test:protractor-local',
    'Run the end to end tests with Protractor and keep a test server running in the background',
    [
      'webdriver',
      'connect:testserver',
      'protractor:local'
    ]
  );

  grunt.registerTask(
    'test:protractor-travis',
    'Run the end to end tests with Protractor for Travis CI builds',
    [
      'connect:testserver',
      'sauce-connect',
      'protractor:travis'
    ]
  );
};
