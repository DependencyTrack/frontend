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
            "MemberExpression[object.name='Vue'][property.name='extend']",
          message:
            'Use cell() from bootstrapTableMixin. Vue 3 removed Vue.extend.',
        },
        {
          selector: 'CallExpression[callee.property.name=/^\\$(on|off|once)$/]',
          message:
            'Use EventBus from shared/eventbus. Vue 3 removed $on, $off and $once.',
        },
        {
          selector:
            "CallExpression[callee.property.name='$emit'][arguments.0.value='input']",
          message:
            "Emit update:modelValue for a modelValue prop. Vue 3's v-model doesn't use input and value.",
        },
        {
          selector: 'CallExpression[arguments.0.value=/^bv::(\\w+::)?modal/]',
          message:
            'Open and close modals through v-model. BootstrapVueNext has no $root events and no $bvModal.show/hide.',
        },
        {
          selector:
            "MemberExpression[object.type='ThisExpression'][property.name='$bvModal']",
          message:
            'Open modals through v-model and confirmations through this.$confirm(). BootstrapVueNext has no $bvModal.',
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
        {
          selector: 'CallExpression[arguments.0.value=/^bv::(\\w+::)?modal/]',
          message:
            'Open and close modals through v-model. BootstrapVueNext has no $root events and no $bvModal.show/hide.',
        },
        {
          selector: "Identifier[name='$bvModal']",
          message:
            'Open modals through v-model and confirmations through this.$confirm(). BootstrapVueNext has no $bvModal.',
        },
        {
          selector: "VAttribute[directive=true][key.name.name='b-modal']",
          message:
            'Open and close modals through v-model. BootstrapVueNext has no $root events and no $bvModal.show/hide.',
        },
      ],
      'no-restricted-imports': [
        'error',
        { name: 'vue-debounce', message: "Use debounce from 'lodash-es'." },
        {
          name: 'vue-page-title',
          message: "Use setPageTitle from 'shared/utils'.",
        },
        { name: 'vue-toastr', message: 'Use this.$toastr.' },
        {
          name: 'vee-validate',
          message: 'Use native constraint validation.',
        },
        {
          name: '@coreui/vue',
          importNames: ['Switch'],
          message: 'Use <b-form-checkbox switch>.',
        },
        {
          name: 'vue-bootstrap-toggle',
          message: 'Use <b-form-checkbox switch>.',
        },
        {
          name: '@johmun/vue-tags-input',
          message: "Use TagsInput from 'forms/TagsInput.vue'.",
        },
        {
          name: '@coreui/coreui/dist/js/coreui-utilities',
          message: "Use getStyle and hexToRgba from 'shared/utils'.",
        },
        {
          name: '@coreui/coreui-plugin-chartjs-custom-tooltips',
          message: "Use Chart.js's built-in tooltips.",
        },
        {
          name: 'vue2-org-tree',
          message:
            "Use DependencyGraphNode from 'portfolio/projects/DependencyGraphNode.vue'.",
        },
      ],
      'no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off',
      'vue/no-deprecated-delete-set': 'error',
      'vue/no-deprecated-destroyed-lifecycle': 'error',
      'vue/no-deprecated-dollar-scopedslots-api': 'error',
      'vue/no-deprecated-model-definition': [
        'error',
        { allowVue3Compat: true },
      ],
      'vue/no-deprecated-slot-attribute': 'error',
      'vue/no-deprecated-slot-scope-attribute': 'error',
      'vue/no-deprecated-v-on-native-modifier': 'error',
      'vue/no-deprecated-v-bind-sync': 'error',
      'vue/no-mutating-props': ['error', { shallowOnly: true }],
      'vue/no-v-model-argument': 'off',
      // Bootstrap 4 names, see src/assets/scss/_bootstrap5.scss.
      // https://getbootstrap.com/docs/5.0/migration/
      // https://getbootstrap.com/docs/5.3/migration/
      'vue/no-restricted-class': [
        'error',
        '/^[mp][lr](-(sm|md|lg|xl))?-(n?[0-5]|auto)$/',
        '/^(float|text)(-(sm|md|lg|xl))?-(left|right)$/',
        '/^(font-weight-.+|font-italic|text-monospace|sr-only(-focusable)?)$/',
        '/^(border-(left|right)|badge-(pill|primary|secondary|success|danger|warning|info|light|dark)|btn-block|form-group)$/',
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
