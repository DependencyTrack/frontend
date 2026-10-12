import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import sbom from 'rollup-plugin-sbom';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VUE_APP_');
  return {
    base: './',
    plugins: [
      vue({
        template: { compilerOptions: { compatConfig: { MODE: 2 } } },
      }),
      { ...sbom({ outFormats: ['json', 'xml'] }), apply: 'build' },
    ],
    resolve: {
      alias: [
        { find: /^vue$/, replacement: '@vue/compat' },
        {
          find: '@',
          replacement: fileURLToPath(new URL('src', import.meta.url)),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: [
            'color-functions',
            'global-builtin',
            'if-function',
            'import',
            'slash-div',
          ],
        },
      },
    },
    server: {
      port: 8080,
      proxy: env.VUE_APP_SERVER_URL ? { '/api': env.VUE_APP_SERVER_URL } : {},
    },
    build: {
      rolldownOptions: {
        input: ['index.html', 'static/oidc-callback.html'],
      },
    },
  };
});
