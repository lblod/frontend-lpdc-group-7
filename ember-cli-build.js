'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const customBuildConfig = {
    // Add options here
    'ember-simple-auth': {
      useSessionSetupMethod: true,
    },
    '@appuniversum/ember-appuniversum': {
      dutchDatePickerLocalization: true,
      disableWormholeElement: true,
    },
  };

  let app = new EmberApp(defaults, customBuildConfig);

  return app.toTree();
};
