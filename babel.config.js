module.exports = {
  presets: [
    ['@vue/babel-preset-jsx'],
    ['@babel/preset-env', {
      'useBuiltIns': 'entry',
      'corejs': '3.33'
    }]
  ]
}
