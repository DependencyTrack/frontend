module.exports = {
  plugins: [
       "@babel/plugin-proposal-optional-chaining"
  ],
  presets: [
    ['@vue/app', {
      polyfills: [
        'es6.array.find',
        'es6.array.from',
        'es6.symbol'
      ]
    }],
    ["@babel/preset-env", {
      "useBuiltIns": "entry"
    }]
  ]
}
