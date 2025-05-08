module.exports = {
  presets: [['@vue/babel-preset-jsx']],
  env: {
    test: {
      plugins: ['istanbul'],
    },
  },
};
