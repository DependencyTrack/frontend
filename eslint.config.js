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
];
