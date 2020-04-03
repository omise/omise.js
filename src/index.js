/**
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 * The new Omise.js
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 */
import 'helpers/polyfill'

import 'vendors/easyXDM.js'

import config from './config'
import OmiseFactory from './Omise'
import OmiseCard from './OmiseCard'

export default OmiseFactory

global.Omise = OmiseFactory(config)
global.OmiseCard = new OmiseCard(config)
