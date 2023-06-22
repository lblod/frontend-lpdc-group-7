'use strict';

module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-prettier/recommended'],
  rules: {
    'selector-class-pattern': null, // This enforces kebab-case but we use BEM which isn't compatible
  },
};
