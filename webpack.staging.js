const merge = require('webpack-merge')
const path = require('path')
const webpack = require('webpack')
const CleanPlugin = require('clean-webpack-plugin')
const common = require('./webpack.common.js')

const config = merge(common, {
  devtool: 'inline-source-map',
  devServer: {
    disableHostCheck: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: 'staging',
      },
    }),
  ],
})

module.exports = config
