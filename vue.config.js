module.exports = {
  lintOnSave: false,
  runtimeCompiler: true,
  //publicPath: "/",
  publicPath: process.env.NODE_ENV === 'production' ? '.' : '/',
  devServer: {
    proxy: { "/api": { target: process.env.VUE_APP_SERVER_URL } }
  }
};
