const { defineConfig } = require('cypress');
const path = require('path');

module.exports = defineConfig({
  video: true,
  videoCompression: 32,
  trashAssetsBeforeRuns: false,
  component: {
    devServer: {
      framework: 'vue2',
      bundler: 'vite',
      warmup: {
        clientFiles: ['cypress/support/component.ts', 'src/**/*.cy.js'],
      },
      viteConfig: (viteConfig) => {
        // Use the coverage config if VITE_COVERAGE is true
        if (process.env.VITE_COVERAGE === 'true') {
          const coverageConfigPath = path.resolve(
            __dirname,
            'vite.coverage.config.js',
          );
          // We can't use dynamic import in CommonJS, so we'll use a workaround
          // This will be executed by Vite which supports ESM
          return { configFile: coverageConfigPath };
        }

        // Otherwise, add the code coverage support to the existing config
        const coverageConfigPath = path.resolve(__dirname, 'vite.config.js');
        return { configFile: coverageConfigPath };
      },
    },
    setupNodeEvents(on, config) {
      if (process.env.VITE_COVERAGE === 'true') {
        require('@cypress/code-coverage/task')(on, config);
      }
      return config;
    },
  },
});
