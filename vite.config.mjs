import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue2';
import sbom from 'rollup-plugin-sbom';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VUE_APP_');
  return {
    base: './',
    plugins: [
      vue(),
      { ...sbom({ outFormats: ['json', 'xml'] }), apply: 'build' },
    ],
    resolve: {
      alias: [
        {
          find: '@',
          replacement: fileURLToPath(new URL('src', import.meta.url)),
        },
        // Runtime templates in `template:` strings need the compiler build.
        { find: /^vue$/, replacement: 'vue/dist/vue.esm.js' },
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
      rollupOptions: {
        input: ['index.html', 'static/oidc-callback.html'],
        onwarn(warning, warn) {
          // rollup-plugin-sbom always tries to register rolldown as a tool, even without it.
          if (
            warning.plugin === 'rollup-plugin-sbom' &&
            warning.message.includes('"rolldown"')
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
  };
});
