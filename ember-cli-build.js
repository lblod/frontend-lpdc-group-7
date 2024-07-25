'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const customBuildConfig = {
    // Add options here
    autoImport: {
      webpack: {
        resolve: {
          fallback: {
            vm: false // TODO: This config should come from the editor. Remove this once we update (and they configure it)
          },
        }
      },
    },
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
