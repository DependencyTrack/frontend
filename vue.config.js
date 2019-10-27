module.exports = {
  lintOnSave: false,
  runtimeCompiler: true,
  publicPath: "/",
  devServer: {
    proxy: { "/api": { target: process.env.VUE_APP_SERVER_URL } }
  }
};
