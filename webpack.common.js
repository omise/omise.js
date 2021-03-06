/**
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 * Webpack default config
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 */

const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const CleanPlugin = require('clean-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const moment = require('moment')
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'))


// add banner to script.
const banner = `
  /*!
   * OmiseJs v${packageJson.version}
   * Copyright: Omise
   *
   * Date: ${moment().format('YYYY/MM/DD HH:mm')}
   */
  `.trim()

/**
 * --------------------------------------------------------
 * Webpack settings
 * --------------------------------------------------------
 */
const config = {
  entry: './src/index.js',
  output: {
    filename: 'omise.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },

  resolve: {
    modules: ['src', 'node_modules'],
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          },
        ],
      },
    ],
  },

  plugins: [
    new CleanPlugin('dist'),
    new Dotenv({
      path: '.env',
      safe: true,
    }),
    new webpack.BannerPlugin({
      banner,
      raw: true,
    }),
  ],
}

module.exports = config
