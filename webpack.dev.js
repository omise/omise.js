const merge = require('webpack-merge')
const webpack = require('webpack')
const commonConfig = require('./webpack.common.js')

const config = merge({
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    disableHostCheck: true,
    inline: true,
    host: '0.0.0.0',
    port: 5001,
    historyApiFallback: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
}, commonConfig)

module.exports = config
