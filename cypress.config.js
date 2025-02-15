const { defineConfig } = require('cypress');
const path = require('path');
const fs = require('fs');

module.exports = defineConfig({
  component: {
    devServer: {
      framework: 'vue2',
      bundler: 'vite',
      viteConfig: (viteConfig) => {
        // Use the coverage config if VITE_COVERAGE is true
        if (process.env.VITE_COVERAGE === 'true') {
          const coverageConfigPath = path.resolve(
            __dirname,
            'vite.coverage.config.js',
          );
          if (fs.existsSync(coverageConfigPath)) {
            // We can't use dynamic import in CommonJS, so we'll use a workaround
            // This will be executed by Vite which supports ESM
            return { configFile: coverageConfigPath };
          }
        }

        // Otherwise, add the code coverage support to the existing config
        const config = viteConfig || {};
        config.optimizeDeps = config.optimizeDeps || {};
        config.optimizeDeps.include = config.optimizeDeps.include || [];
        config.optimizeDeps.include.push('@cypress/code-coverage/support');

        config.resolve = config.resolve || {};
        config.resolve.alias = config.resolve.alias || {};
        config.resolve.alias['@'] = path.resolve(__dirname, 'src');

        return config;
      },
    },
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
  },
});
