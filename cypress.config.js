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
      // TODO this is just a workaround, making the tests _more_ deterministic, but they are still non-deterministic
      warmup: {
        clientFiles: ['cypress/support/component.js', 'src/**/*.cy.js'],
      },
      viteConfig: (viteConfig) => {
        let configFile;
        if (process.env.VITE_COVERAGE === 'true') {
          configFile = path.resolve(__dirname, 'vite.coverage.config.js');
        } else {
          configFile = path.resolve(__dirname, 'vite.config.js');
        }

        return { configFile };
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
