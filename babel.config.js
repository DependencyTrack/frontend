module.exports = {
  plugins: [
       "@babel/plugin-proposal-optional-chaining"
  ],
  presets: [
    ['@vue/babel-preset-jsx'],
    ['@babel/preset-env', {
      'useBuiltIns': 'entry',
      'corejs': '3.30'
    }]
  ]
}
