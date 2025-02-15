import pluginVue from 'eslint-plugin-vue';
import recommendedConfig from 'eslint-plugin-prettier/recommended';

export default [
  {
    name: 'app/files-to-lint',
    files: ['src/**/*.{js,vue,md,yaml}'],
  },

  recommendedConfig,
  ...pluginVue.configs['flat/vue2-essential'],
];
