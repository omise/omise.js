/**
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 * The new Omise.js
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 */

import 'helpers/polyfill'

import 'vendors/easyXDM.js'

import config from './config'
import OmiseFactory from './Omise'
import OmiseCardFactory from './OmiseCard'

export default OmiseFactory

/* dev:start */
console.log('Development mode')
/* dev:end */

global.Omise = OmiseFactory(config)
global.OmiseCard = OmiseCardFactory(config)
