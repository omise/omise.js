const merge = require('webpack-merge')
const webpack = require('webpack')
const commonConfig = require('./webpack.common.js')

const config = merge({
  mode: 'production',
  devtool: 'inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('staging'),
    }),
  ],
}, commonConfig)

module.exports = config
