const { defineConfig } = require('vite');
const { createVuePlugin: vue } = require('vite-plugin-vue2');
const path = require('path');
const vueJsx = require('@vitejs/plugin-vue2-jsx').default;
const istanbul = require('vite-plugin-istanbul');

// https://vitejs.dev/config/
module.exports = defineConfig({
  plugins: [
    vueJsx({}),
    vue(),
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'cypress'],
      extension: ['.js', '.vue'],
      requireEnv: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      vue: 'vue/dist/vue.esm.js',
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,vue}'],
      exclude: [
        '**/*.{spec,test,cy}.js',
        'cypress/**/*.*',
        'node_modules/**/*.*',
      ],
    },
  },
});
