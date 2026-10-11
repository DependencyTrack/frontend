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
        {
          selector:
            'CallExpression[callee.property.name=/^\\$(on|off|once)$/]:not([arguments.0.value=/^bv::/])',
          message:
            'Use EventBus from shared/eventbus. Vue 3 removed $on, $off and $once.',
        },
        {
          selector:
            "CallExpression[callee.property.name='$emit'][arguments.0.value='input']",
          message:
            "Emit update:modelValue for a modelValue prop. Vue 3's v-model doesn't use input and value.",
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
        {
          selector:
            "CallExpression[callee.name='$emit'][arguments.0.value='input']",
          message:
            "Emit update:modelValue for a modelValue prop. Vue 3's v-model doesn't use input and value.",
        },
      ],
      'no-restricted-imports': [
        'error',
        { name: 'vue-debounce', message: "Use debounce from 'lodash-es'." },
        {
          name: 'vue-page-title',
          message: "Use setPageTitle from 'shared/utils'.",
        },
      ],
      'no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off',
      'vue/no-deprecated-delete-set': 'error',
      'vue/no-deprecated-model-definition': [
        'error',
        { allowVue3Compat: true },
      ],
      'vue/no-deprecated-slot-attribute': 'error',
      'vue/no-deprecated-slot-scope-attribute': 'error',
      'vue/no-mutating-props': ['error', { shallowOnly: true }],
    },
  },
  {
    // Its $set calls go away with vue2-org-tree.
    files: ['src/views/portfolio/projects/ProjectDependencyGraph.vue'],
    rules: { 'vue/no-deprecated-delete-set': 'off' },
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
