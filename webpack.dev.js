const merge = require('webpack-merge')
const webpack = require('webpack')
const common = require('./webpack.common.js')

const config = merge(common, {
  devtool: 'inline-source-map',
  devServer: {
    disableHostCheck: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
})

module.exports = config
