/**
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 * The new Omise.js
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 */
import 'helpers/polyfill'

import 'vendors/easyXDM.js'

import config from './config'
import Omise from './Omise'
import OmiseCard from './OmiseCard'

module.exports = Omise

global.Omise = new Omise(config)
global.OmiseCard = new OmiseCard(config)
