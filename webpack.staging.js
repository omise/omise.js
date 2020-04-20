const merge = require('webpack-merge')
const webpack = require('webpack')
const common = require('./webpack.common.js')

const config = merge(common.webpackConfig, {

  devServer: {
    disableHostCheck: true,
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('staging'),
    }),
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        exclude: /(node_modules|bower_components|\.spec\.js)/,
        use: [{
          loader: 'webpack-strip-blocks',
          options: {
            blocks: common.devBlocks,
            start: '/*',
            end: '*/'
          }
        }]
      }
    ]
  }

})

module.exports = config
