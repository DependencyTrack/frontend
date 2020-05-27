const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  lintOnSave: false,
  runtimeCompiler: true,
  //publicPath: "/",
  publicPath: process.env.NODE_ENV === 'production' ? '.' : '/',
  devServer: {
    proxy: { "/api": { target: "http://localhost:8080" } }
  },
  configureWebpack: {
    plugins: [
      new CopyPlugin([
        { from: "node_modules/axios/dist/axios.min.js", to: "static/js", force: true },
        { from: "node_modules/oidc-client/dist/oidc-client.min.js", to: "static/js", force: true }
      ])
    ]
  }
};
