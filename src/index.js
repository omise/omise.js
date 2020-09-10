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

global.Omise = OmiseFactory(config)
global.OmiseCard = OmiseCardFactory(config)
