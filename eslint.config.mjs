import js from '@eslint/js';
import playwright from 'eslint-plugin-playwright';
import pluginVue from 'eslint-plugin-vue';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  {
    ignores: ['dist/', 'e2e/playwright-report/', 'e2e/test-results/'],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  prettierRecommended,
  {
    languageOptions: {
      globals: { ...globals.browser, __VERSION__: 'readonly' },
    },
    rules: {
      'vue/no-restricted-syntax': [
        'error',
        {
          selector:
            "VElement[rawName='b-tab'] > VStartTag > VAttribute[key.name='style'], VElement[rawName='b-tab'] > VStartTag > VAttribute[key.argument.name='style']",
          message:
            "Use classes. BootstrapVueNext's tabs re-render forever when a <b-tab> has an inline style.",
        },
      ],
      'no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off',
      'vue/no-mutating-props': ['error', { shallowOnly: true }],
      'vue/require-explicit-emits': 'error',
      // Bootstrap 4 names.
      // https://getbootstrap.com/docs/5.0/migration/
      // https://getbootstrap.com/docs/5.3/migration/
      'vue/no-restricted-class': [
        'error',
        '/^[mp][lr](-(sm|md|lg|xl))?-(n?[0-5]|auto)$/',
        '/^(float|text)(-(sm|md|lg|xl))?-(left|right)$/',
        '/^(font-weight-.+|font-italic|text-monospace|sr-only(-focusable)?)$/',
        '/^(border-(left|right)|badge-(pill|primary|secondary|success|danger|warning|info|light|dark)|btn-block|form-group|close)$/',
        '/^((rounded|dropdown-menu)-(left|right)|thead-(light|dark)|text-(hide|justify)|form-(row|inline)|input-group-(append|prepend))$/',
        '/^(no-gutters|media(-body)?|jumbotron|card-(deck|columns)|pre-scrollable|embed-responsive.*|custom-(control|checkbox|radio|switch|select|file|range).*)$/',
      ],
    },
  },
  {
    files: ['*.js', '*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['e2e/**/*.mjs'],
    ...playwright.configs['flat/recommended'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
