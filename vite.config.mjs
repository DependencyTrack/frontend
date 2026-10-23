import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { BootstrapVueNextResolver } from 'bootstrap-vue-next/resolvers';
import sbom from 'rollup-plugin-sbom';
import pkg from './package.json' with { type: 'json' };

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VUE_APP_');
  return {
    base: './',
    define: {
      __VERSION__: JSON.stringify({
        version: pkg.version,
        uuid: randomUUID(),
        timestamp: new Date().toISOString(),
      }),
    },
    plugins: [
      vue(),
      Components({ resolvers: [BootstrapVueNextResolver()], dts: false }),
      { ...sbom({ outFormats: ['json', 'xml'] }), apply: 'build' },
    ],
    resolve: {
      alias: [
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
