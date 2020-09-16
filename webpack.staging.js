const merge = require('webpack-merge')
const webpack = require('webpack')
const common = require('./webpack.common.js')

const config = merge({
  devtool: 'inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
}, common.webpackConfig)

module.exports = config
