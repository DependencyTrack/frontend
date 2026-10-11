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
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[object.property.name='$i18n'][property.name='t']",
          message: 'Use this.$t(), $i18n has no t() in vue-i18n 9+.',
        },
        {
          selector: "MemberExpression[property.name='$children']",
          message: 'Use a template ref. Vue 3 removed $children.',
        },
      ],
      'vue/no-restricted-syntax': [
        'error',
        {
          selector:
            "VElement[rawName='b-form-input'] > VStartTag VDirectiveKey[name.name='model'] > VIdentifier[name='number']",
          message:
            'Use the number prop. v-model.number on <b-form-input> breaks under @vue/compat.',
        },
      ],
      'no-restricted-imports': [
        'error',
        { name: 'vue-debounce', message: "Use debounce from 'lodash-es'." },
      ],
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
