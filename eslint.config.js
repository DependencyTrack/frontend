import pluginVue from 'eslint-plugin-vue';
import recommendedConfig from 'eslint-plugin-prettier/recommended';

export default [
  {
    name: 'app/files-to-lint',
    files: ['src/**/*.{js,jsx,vue,md,yaml}'],
  },

  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  recommendedConfig,
  ...pluginVue.configs['flat/vue2-essential'],
  {
    rules: {
      'vue/component-tags-order': 'warn',
      'vue/order-in-components': 'warn',
      'vue/attribute-hyphenation': 'warn',
      'vue/one-component-per-file': 'warn',
      'vue/v-bind-style': 'warn',
      'vue/v-on-style': 'warn',
      'vue/v-slot-style': 'warn',
      'vue/no-unused-components': 'warn',
      'vue/no-side-effects-in-computed-properties': 'off', // FIXME enable this later (P1)
      'vue/no-mutating-props': 'off', // FIXME enable this later (P1)
      'vue/no-undef-components': 'warn',
      'vue/multi-word-component-names': 'off', // TODO enable this later (P3)
    },
  },
];
