module.exports = {
  presets: [['@vue/babel-preset-jsx']],
  env: {
    test: {
      plugins: process.env.VITE_COVERAGE === 'true' ? ['istanbul'] : [],
    },
  },
};
