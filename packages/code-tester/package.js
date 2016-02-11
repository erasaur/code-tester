Package.describe({
  name: 'code-tester',
  version: '0.0.1',
  documentation: 'README.md'
});

Npm.depends({
  'esprima': '2.7.2'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use([
    'cosmos:browserify@0.9.2',
    'underscore'
  ], 'client');
  api.addFiles([
    'code-tester.js',
    'esprima.browserify.js'
  ], 'client');

  api.export('CodeTester');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('code-tester');
  api.addFiles('tests.js');
});
