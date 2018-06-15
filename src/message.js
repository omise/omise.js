/**
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 * Post message
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 */
import config from './config'
import { safeJsonParse } from 'helpers/utils'

export const messageType = {
  CLOSE_IFRAME: 'CLOSE_IFRAME',
  SHOW_IFRAME_APP_FORM: 'SHOW_IFRAME_APP_FORM',
  CLOSE_AND_SEND_TOKEN: 'CLOSE_AND_SEND_TOKEN',
}

export default function listenMessage(OmiseCardInstance) {
  global.addEventListener(
    'message',
    receiveMessage => {
      const messageData = safeJsonParse(receiveMessage.data)
      const { type, data } = messageData
      messageTypeHandler(OmiseCardInstance, type, data)
    },
    false
  )
}

export function messageShowIframeAppForm(target, data) {
  postMessage(target, messageType.SHOW_IFRAME_APP_FORM, data, config.cardHost)
}

export function messageCloseIframe() {
  postMessage(parent.window, messageType.CLOSE_IFRAME, null, '*')
}

export function messageCloseAndSendToken(token) {
  postMessage(parent.window, messageType.CLOSE_AND_SEND_TOKEN, token, '*')
}

function messageTypeHandler(OmiseCardInstance, type, data) {
  switch (type) {
    case messageType.CLOSE_IFRAME:
      OmiseCardInstance.close()
      break
    case messageType.CLOSE_AND_SEND_TOKEN:
      OmiseCardInstance.close()
      OmiseCardInstance.setTokenAtOmiseTokenField(data)
      break
  }
}

function postMessage(target, type, data, targetOrigin) {
  const messageData = JSON.stringify({
    type,
    data,
  })

  target.postMessage(messageData, targetOrigin)
}
