const CopyPlugin = require('copy-webpack-plugin');
const { CycloneDxWebpackPlugin } = require('@cyclonedx/webpack-plugin');

module.exports = {
  productionSourceMap: false,
  runtimeCompiler: true,
  // Relative paths cannot be supported. Research by @nscur0 - https://owasp.slack.com/archives/CTC03GX9S/p1608400149085400
  publicPath: '.',
  devServer: {
    proxy: { '/api': { target: import.meta.env.VUE_APP_SERVER_URL } },
  },
  configureWebpack: {
    devtool: 'source-map',
    plugins: [
      new CopyPlugin([
        {
          from: 'node_modules/axios/dist/axios.min.js',
          to: 'static/js',
          force: true,
        },
        {
          from: 'node_modules/oidc-client/dist/oidc-client.min.js',
          to: 'static/js',
          force: true,
        },
      ]),
      new CycloneDxWebpackPlugin({
        context: '../',
        outputLocation: '../',
      }),
    ],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
    },
  },
};
