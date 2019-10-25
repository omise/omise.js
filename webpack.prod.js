const merge = require('webpack-merge')
const webpack = require('webpack')
const common = require('./webpack.common.js')

const config = merge(common, {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
})

module.exports = config
