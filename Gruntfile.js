var spawn = require('child_process').spawn;

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['connect:server:keepalive']);

  grunt.initConfig({
    connect: {
      // server: {
      //   options: {
      //     port: 9000,
      //     hostname: '0.0.0.0',
      //     middleware: function (connect) {
      //       return [
      //         connect().use(
      //           '/bower_components',
      //           connect.static('./bower_components')
      //         ),
      //         connect.static('src')
      //       ];
      //     }
      //   }
      // },
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
      normal: 'test/protractor-local.conf.js',
      travis: 'test/protractor-travis.conf.js'
    }
  });

  function updateWebdriver (done) {
    var p = spawn('node', ['node_modules/protractor/bin/webdriver-manager', 'update']);
    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
    p.on('exit', function(code){
      if(code !== 0) grunt.fail.warn('Webdriver failed to update');
      done();
    });
  }

  function startProtractor (config, done) {
    // var sauceUser = grunt.option('sauceUser');
    // var sauceKey = grunt.option('sauceKey');
    // var tunnelIdentifier = grunt.option('capabilities.tunnel-identifier');
    // var sauceBuild = grunt.option('capabilities.build');
    // var browser = grunt.option('browser');
    // var specs = grunt.option('specs');
    var args = ['node_modules/protractor/bin/protractor', config];
    // if (sauceUser) args.push('--sauceUser=' + sauceUser);
    // if (sauceKey) args.push('--sauceKey=' + sauceKey);
    // if (tunnelIdentifier) args.push('--capabilities.tunnel-identifier=' + tunnelIdentifier);
    // if (sauceBuild) args.push('--capabilities.build=' + sauceBuild);
    // if (specs) args.push('--specs=' + specs);
    // if (browser) {
    //   args.push('--browser=' + browser);
    // }


    var p = spawn('node', args);
    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
    p.on('exit', function(code){
      if(code !== 0) grunt.fail.warn('Protractor test(s) failed. Exit code: ' + code);
      done();
    });
  }

  grunt.registerTask('webdriver', 'Update webdriver', function() {
    updateWebdriver(this.async());
  });

  grunt.registerMultiTask('protractor', 'Run Protractor integration tests', function() {
    startProtractor(this.data, this.async());
  });

  grunt.registerTask('sauceConnect', 'Launch Sauce Connect', function () {
    var done = this.async();
    require('sauce-connect-launcher')({
      username: 'pomerantsevp',
      accessKey: '497ab04e-f31b-4a7b-9b18-ae3fbe023222'
    }, function (err, sauceConnectProcess) {
      if (err) {
        console.error(err.message);
      } else {
        done();
      }
    });
  });

  grunt.registerTask(
    'test:protractor',
    'Run the end to end tests with Protractor and keep a test server running in the background',
    [
      'webdriver',
      'connect:testserver',
      'protractor:normal'
    ]
  );

  grunt.registerTask(
    'test:travis-protractor',
    'Run the end to end tests with Protractor for Travis CI builds',
    [
      'connect:testserver',
      'sauceConnect',
      'protractor:travis'
    ]
  );
};
