/**
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 * Omise.js Core
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 */

import { isUri } from 'valid-url'
import 'whatwg-fetch'

export default function OmiseFactory(config) {
  const result = verifyConfigStructure(config)
  if (result.error) throw new Error(result.message)

  const RPC_TIMEOUT = 30000

  let //----------------- Public interface

    Omise = {
      config,
      publicKey: null,
      setPublicKey,
      createSource,
      createToken,
    },
    // ------------------ Private vars

    _rpc = null

  function _createRpc(callback) {
    if (_rpc) {
      return _rpc
    } else {
      const { vaultUrl } = Omise.config
      const tm = setTimeout(() => {
        _rpc.destroy()
        _rpc = null
        callback && callback()
      }, RPC_TIMEOUT)

      _rpc = new easyXDM.Rpc(
        {
          remote: `${vaultUrl}/provider`,
          onReady() {
            clearTimeout(tm)
          },
        },
        {
          remote: {
            createToken: {},
          },
        }
      )

      return _rpc
    }
  }

  function setPublicKey(publicKey) {
    Omise.publicKey = publicKey
    return Omise.publicKey
  }

  function createSource(type, options, callback) {
    const auth = btoa(Omise.publicKey)

    options.type = type

    const url = `${Omise.config.interfaceUrl}/sources/`

    fetch(url, {
      method: 'post',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })
      .then(response =>
        response.json().then(data => callback(response.status, data))
      )
      .catch(error => {
        callback(0, {
          code: 'create_source_error',
          error: error.message,
        })
      })
  }

  function createToken(as, attributes, handler) {
    const data = { [as]: attributes }
    _createRpc(() => {
      handler(0, {
        code: 'rpc_error',
        message: 'unable to connect to provider after timeout',
      })
    }).createToken(
      Omise.publicKey,
      data,
      response => handler(response.status, response.data),
      e => handler(e.data.status, e.data.data)
    )
  }

  return Omise
}

/**
 * Helper to verify config structure.
 * @param {Object} config - config for omise.js.
 */
export function verifyConfigStructure(config) {
  const result = {
    error: false,
    message: '',
  }

  if (!config.vaultUrl || !isUri(config.vaultUrl)) {
    result.message = 'Missing vaultUrl'
  } else if (!config.cardHost || !isUri(config.cardHost)) {
    result.message = 'Missing cardHost'
  } else if (!config.interfaceUrl || !isUri(config.interfaceUrl)) {
    result.message = 'Missing interfaceUrl'
  }

  result.error = result.message !== ''

  return result
}
