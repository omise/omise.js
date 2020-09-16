const merge = require('webpack-merge')
const webpack = require('webpack')
const common = require('./webpack.common.js')

const config = merge({
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
}, common.webpackConfig)

module.exports = config
