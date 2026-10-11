import js from '@eslint/js';
import playwright from 'eslint-plugin-playwright';
import pluginVue from 'eslint-plugin-vue';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/',
      'e2e/playwright-report/',
      'e2e/test-results/',
      'src/views/components/VueEasyPieChart.vue',
    ],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/vue2-essential'],
  prettierRecommended,
  {
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off',
      'vue/no-mutating-props': ['error', { shallowOnly: true }],
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
