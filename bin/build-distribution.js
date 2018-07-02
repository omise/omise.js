/**
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 * Build distribution Omise.js
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 */
const fs = require('fs')
const chalk = require('chalk')
const moment = require('moment')

console.log(chalk.bgYellow('Start building Omise.js'))

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

const payJs = fs.readFileSync('./dist/omise.js', 'utf8')
fs.writeFileSync('./dist/omise.js', `${banner}\n${payJs}`, 'utf8')

console.log('\n')
console.log('---------------------------')
console.log('| Build omise.js success! |')
console.log('---------------------------')
console.log('\n')
