import { defineConfig } from 'vite';
import { createVuePlugin as vue } from 'vite-plugin-vue2';
import vueJsx from '@vitejs/plugin-vue2-jsx';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vueJsx({}), vue()],
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
