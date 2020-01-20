/**
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 * OmiseCard
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 */
import listenMessage, {
  messageShowIframeAppForm,
  messageCloseIframe,
  messageCloseAndSendToken,
} from './message'

import {
  merge,
  isEmpty,
  extractDataFromElement,
  camelCaseToDash,
} from 'helpers/utils'

export const defaultIframeAppConfig = {
  key: '',
  amount: 0,
  currency: 'THB', // THB,USD,JPY
  image: 'https://cdn.omise.co/assets/frontend-images/store-logo.svg',
  frameLabel: 'Omise',
  defaultPaymentMethod: 'credit_card',
  otherPaymentMethods: [],
  frameDescription: 'Secured by Omise',
  submitLabel: 'Pay',
  buttonLabel: 'Pay with Omise',
  location: 'no',
  submitAuto: 'yes',
  submitFormTarget: '',
  cardBrands: 'visa mastercard',
  locale: 'en', // en,th,ja
  autoCardNumberFormat: 'yes', // yes,no
  expiryDateStyle: '', // basic
  hideAmount: 'false', // false, true
}

export const iframeDefaultStyle = [
  'display: none',
  'visibility: visible',
  'position: fixed',
  'left: 0px',
  'top: 0px',
  'width: 100%',
  'height: 100%',
  'z-index: 2147483647',
  'padding: 0',
  'margin: 0',
  'border: 0 none transparent',
  'background-color: rgba(0, 0, 0, 0)',
  'overflow-x: hidden',
  'overflow-y: auto',
  '-webkit-tap-highlight-color: transparent',
  'transition: background-color .2s',
]

const noop = () => {}

export default class OmiseCard {
  constructor(settings, initWhenStart = true) {
    this.setup(settings)

    if (initWhenStart) {
      this.init()
    }
  }

  /**
   * Setup Omise.js
   * @param {Object} settings - setting for Omise.js
   */
  setup(settings) {
    this.app = {
      settings: { ...settings },
      iframe: null,
      iframeLoaded: false,
      omiseScriptTag: null,
      omiseGenerateCheckoutButton: null,
      iframeAppId: 'omise-checkout-iframe-app',
      defaultConfig: { ...defaultIframeAppConfig },
      configForIframeOnLoad: { ...defaultIframeAppConfig },
      currentOpenConfig: {},
      formElement: null,
      allConfigureButtons: [],
    }

    return this.app
  }

  /**
   * Run on start up
   */
  init() {
    const foundIframe = this.app.iframe != null
    const scripts = document.getElementsByTagName('script')

    const scriptsLen = scripts.length

    for (let i = 0; i < scriptsLen; i++) {
      const script = scripts[i]
      if (
        script.hasAttribute('data-key') &&
        script.hasAttribute('data-amount')
      ) {
        this.app.omiseScriptTag = script
        break
      }
    }

    if (!foundIframe && !this.isInsideIframeApp() && this.app.omiseScriptTag) {
      this.createIframe()
      this.app.omiseGenerateCheckoutButton = this.createOmiseCheckoutButton()
      listenMessage(this)
    }
  }

  /**
   * Get default config
   *
   * @return {object} current default config.
   */
  getDefaultConfig() {
    return this.app.defaultConfig
  }

  /**
   * Get all configure buttons.
   * @return {Array} all configure buttons.
   */
  getAllConfigureButtons() {
    return this.app.allConfigureButtons
  }

  /**
   * Set token at omise token hidden field.
   * @param {String} token - omise token.
   */
  setTokenAtOmiseTokenField(token) {
    const mergedConfig = {
      ...this.app.defaultConfig,
      ...this.app.currentOpenConfig,
    }
    const { submitAuto, onCreateTokenSuccess } = mergedConfig

    if (this.app.formElement) {
      if (this.isOmiseSource(token)) {
        this.app.formElement.omiseSource.value = token
      } else {
        this.app.formElement.omiseToken.value = token
      }
    }

    if (submitAuto === 'yes' && this.app.formElement) {
      this.app.formElement.submit()
    }

    ;(onCreateTokenSuccess || noop)(token)

    // clear current open config after submited
    this.app.currentOpenConfig = {}
  }

  isOmiseSource(string) {
    return /^src_/.test(string)
  }

  /**
   * Get form element from target by travel up to DOM tree.
   * @param {Element} target - target element for find form element.
   * @return {Element} form element.
   */
  getFormByTarget(target) {
    let currentNode = target

    // travel DOM until found form tag
    while (currentNode && currentNode.tagName !== 'FORM') {
      currentNode = currentNode.parentNode
    }

    return currentNode
  }

  /**
   * Create iframe at merchant page
   */
  createIframe() {
    const iframe = document.createElement('iframe')
    iframe.id = this.app.iframeAppId
    iframe.src = `${this.app.settings.cardHost}/pay.html`
    iframe.setAttribute('style', iframeDefaultStyle.join('; '))
    document.body.appendChild(iframe)
    iframe.onload = () => {
      if (this.app.iframe.style.display === 'block') {
        messageShowIframeAppForm(iframe.contentWindow, {
          config: this.app.configForIframeOnLoad,
        })
      }
      this.app.iframeLoaded = true
    }

    this.app.iframe = iframe

    return this.app.iframe
  }

  /**
   * Create hidden input for store Omise Token.
   * @param  {Element} target - target element for insert input.
   * @return {Element} hidden input element.
   */
  createHiddenInputForOmiseToken(target) {
    let formElement = null

    if (target && target.tagName === 'FORM') {
      formElement = target
    }

    if (!formElement) {
      throw new Error(
        [
          'Missing form element. Generate button or custom button must contain in form element.',
          'https://github.com/omise/examples/blob/master/omise.js/example-4-custom-integration-multiple-buttons.html',
          'Or setting submit form target',
          'https://github.com/omise/examples/blob/master/omise.js/example-5-custom-integration-specify-checkout-form.html',
        ].join('\n')
      )
    }

    let inputOmiseToken = formElement.querySelector('input[name="omiseToken"]')

    if (inputOmiseToken == null) {
      inputOmiseToken = document.createElement('input')
      inputOmiseToken.setAttribute('type', 'hidden')
      inputOmiseToken.setAttribute('name', 'omiseToken')
      formElement.appendChild(inputOmiseToken)
    }

    let inputOmiseSource = formElement.querySelector(
      'input[name="omiseSource"]'
    )

    if (inputOmiseSource == null) {
      inputOmiseSource = document.createElement('input')
      inputOmiseSource.setAttribute('type', 'hidden')
      inputOmiseSource.setAttribute('name', 'omiseSource')
      formElement.appendChild(inputOmiseSource)
    }

    return inputOmiseToken
  }

  /**
   * Auto create pay with omise button at next omise script tags
   * @return {Element} omise generate checkout button.
   */
  createOmiseCheckoutButton() {
    const config = this.prepareConfig(
      extractDataFromElement(this.app.omiseScriptTag)
    )
    const checkoutButton = document.createElement('button')
    checkoutButton.className = 'omise-checkout-button'
    checkoutButton.innerHTML = config.buttonLabel

    const { omiseScriptTag } = this.app
    if (omiseScriptTag) {
      const formElement = this.getFormByTarget(omiseScriptTag)
      this.app.formElement = formElement
      this.createHiddenInputForOmiseToken(formElement)
    } else {
      console.warn('Missing Omise script tag')
    }

    // bind button event.
    checkoutButton.addEventListener(
      'click',
      event => {
        event.preventDefault()

        if (omiseScriptTag) {
          const configFromScriptTag = extractDataFromElement(omiseScriptTag)
          const config = this.prepareConfig(configFromScriptTag)
          this.app.configForIframeOnLoad = { ...config }
          this.open(config)
        } else {
          console.warn('Missing Omise script tag')
        }
      },
      false
    )

    // inject button next script tag.
    omiseScriptTag.parentNode.insertBefore(
      checkoutButton,
      omiseScriptTag.nextSibling
    )

    return checkoutButton
  }

  /**
   * Checking omiseCard.js are running at Omise iframe app or not
   */
  isInsideIframeApp() {
    return document.getElementById(this.app.iframeAppId) != null
  }

  /**
   * Prepare configure before send to checkout form.
   * @param {Object} newConfig     - new config for merge with default config.
   * @return {Object} configure after merged and fix.
   */
  prepareConfig(newConfig = {}) {
    const { otherPaymentMethods } = newConfig

    if (otherPaymentMethods && typeof otherPaymentMethods == 'string') {
      newConfig.otherPaymentMethods = this.stringToArray(otherPaymentMethods)
    }

    return merge(this.app.defaultConfig, fixConfigName(newConfig))
  }

  /**
   * Split a given string into an array
   * String format "text1, text2(text3), text4(text5, text6)"
   * @param {string} str
   * @returns {array} - Returns an array
   */
  stringToArray(str) {
    const arr = str.match(/[\w_]+(\([^)]+\))?/g) || []
    return arr
  }

  /**
   * Set default configure.
   * @param  {object} newConfig - new config for merge with default.
   * @return {object} default config.
   */
  configure(newConfig) {
    this.app.defaultConfig = this.prepareConfig(newConfig)

    if (!this.isInsideIframeApp()) {
      if (!this.app.iframe) {
        this.createIframe()
        listenMessage(this)
      }
    }

    return this.app.defaultConfig
  }

  /**
   * Open iframe app.
   * @param  {Object}   newConfig - new config for iframe app.
   * @param  {Function} callback  - callback fire after iframe app opened.
   * @return result for open.
   */
  open(newConfig = {}, callback = noop) {
    if (!this.app.iframe) {
      return false
    }

    const openIframeWithNewConfig = () => {
      const config = this.prepareConfig(newConfig)
      this.app.currentOpenConfig = { ...config }
      this.app.iframe.style.backgroundColor = 'rgba(0, 0, 0, .4)'
      this.app.iframe.style.display = 'block'
      setTimeout(() => {
        messageShowIframeAppForm(this.app.iframe.contentWindow, {
          config,
        })
        callback(this.app.iframe)
      })
    }

    if (this.app.iframeLoaded) {
      openIframeWithNewConfig()
    } else {
      const observeTimeout = 3000
      const observeDelay = 100
      let observeCount = 0

      const observeTimer = setInterval(() => {
        observeCount += observeDelay
        if (observeCount >= observeTimeout || this.app.iframeLoaded) {
          if (this.app.iframeLoaded) {
            openIframeWithNewConfig()
          }
          clearInterval(observeTimer)
        }
      }, observeDelay)
    }
    return true
  }

  /**
   * Close iframe app
   * @param  {Function} callback  - callback fire after iframe app closed.
   * @return result for close.
   */
  close(callback = noop) {
    if (!this.app.iframe) {
      return false
    }

    this.app.iframe.style.backgroundColor = 'rgba(0, 0, 0, 0)'

    setTimeout(() => {
      this.app.iframe.style.display = 'none'
      callback(this.app.iframe)
      const { onFormClosed } = this.app.currentOpenConfig
      ;(onFormClosed || noop)(this.app.iframe)
    }, 250)

    return true
  }

  /**
   * Destroy iframe app
   */
  destroy() {
    const iframe = document.getElementById(this.app.iframeAppId)

    if (this.app.iframe && iframe) {
      const iframe = document.getElementById(this.app.iframeAppId)
      document.body.removeChild(iframe)

      // reset app object to default
      this.setup()
    }
  }

  /**
   * Create handler for iframe app for control OmiseCard.js
   */
  createParentFrameHandler() {
    return {
      closeIframe() {
        messageCloseIframe()
      },

      closeAndSendToken(token) {
        messageCloseAndSendToken(token)
      },
    }
  }

  /**
   * NOTE: LEGACY
   * Set configure to pay button
   * @param {string} buttonId - button target id.
   * @param {object} config   - configure for pay button.
   * @return {object} new button configure.
   */
  configureButton(buttonId, config) {
    const configForButton = this.prepareConfig(config)
    const newButtonConfig = {
      buttonId,
      configuration: configForButton,
    }

    this.app.allConfigureButtons.push(newButtonConfig)

    return newButtonConfig
  }

  /**
   * NOTE: LEGACY
   * Activate all configure buttons.
   */
  attach() {
    const attachedButtons = []
    this.app.allConfigureButtons.forEach(item => {
      const { configuration } = item
      const button = document.querySelector(item.buttonId)
      const defaultButtonText = this.app.defaultConfig.buttonLabel
      let buttonText = defaultButtonText

      if (
        configuration.buttonLabel &&
        buttonText !== configuration.buttonLabel
      ) {
        buttonText = configuration.buttonLabel
      } else if (button.innerHTML) {
        buttonText = button.innerHTML
      }

      button.innerHTML = buttonText

      const { submitFormTarget } = this.app.defaultConfig
      const formElement = submitFormTarget
        ? document.querySelector(submitFormTarget)
        : this.getFormByTarget(button)
      this.createHiddenInputForOmiseToken(formElement)

      button.addEventListener(
        'click',
        event => {
          event.preventDefault()
          const { target } = event
          this.app.configForIframeOnLoad = configuration
          this.app.formElement = formElement
          this.open(configuration)
        },
        false
      )

      attachedButtons.push(button)
    })

    if (!this.isInsideIframeApp()) {
      if (!this.app.iframe) {
        this.createIframe()
        listenMessage(this)
      }
    }

    return attachedButtons
  }
}

/**
 * Fix config name that doesn't match with other.
 * @param {object} config - config for iframe app.
 * @return {object} fix config.
 */
export function fixConfigName(config) {
  const fixConfig = {}
  const needToFixKeys = {
    publicKey: 'key',
    logo: 'image',
    locationField: 'location',
  }

  // assign value and fix key
  for (const key in config) {
    // found key that need to fix
    const correctKeyName = needToFixKeys[key]
    if (correctKeyName) {
      fixConfig[correctKeyName] = config[key]
    } else {
      fixConfig[key] = config[key]
    }
  }

  return fixConfig
}
