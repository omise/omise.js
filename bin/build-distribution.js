/**
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 * Build distribution Omise.js
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 */
const fs = require('fs');
const chalk = require('chalk');
const { exec } = require('child_process');
const moment = require('moment');

console.log(chalk.bgYellow('Start building Omise.js'));
const env = process.env.NODE_ENV
exec('npm run build', (err) => {
  if (err) { return; }

  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

  // add banner to script.
  const banner = `
  /*!
   * OmiseJs v${packageJson.version}
   * Copyright: Omise
   *
   * Date: ${moment().format('YYYY/MM/DD HH:mm')}
   */
  `.trim();

  let cdnUrl
  if (env === 'staging') {
    cdnUrl = 'https://omise-cdn.s3.amazonaws.com/assets/omise-js-v2';
  } else if (env === 'production') {
    cdnUrl = 'https://cdn.omise.co';
  } else {
    cdnUrl = 'http://localhost:5002';
  }

  const payJs = fs.readFileSync('./dist/omise.js', 'utf8');
  const pattern = new RegExp('http://localhost:5002', 'g');
  const fixedPayJs = payJs.replace(pattern, cdnUrl);
  fs.writeFileSync('./dist/omise.js', `${banner}\n${fixedPayJs}`, 'utf8');

  console.log('\n');
  console.log('---------------------------');
  console.log('| Build omise.js success! |');
  console.log('---------------------------');
  console.log('\n');

});
