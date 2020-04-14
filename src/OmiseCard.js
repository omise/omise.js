/**
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 * OmiseCard
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 */
import listenMessage, {
  messageShowIframeAppForm,
  messageCloseIframe,
  messageCloseAndSendToken
} from './message';

import {
  merge,
  isEmpty,
  extractDataFromElement,
  camelCaseToDash
} from 'helpers/utils';

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
  hideAmount: 'false' // false, true
};

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
  'transition: background-color .2s'
];

const noop = () => {};

export default function OmiseCardFactory(settings, initWhenStart = true) {

  const ID_IFRAME_APP = 'omise-checkout-iframe-app';

  let OmiseCard;


  //----------------- Public interface

    OmiseCard = {
      attach,
      configure,
      configureButton,
      open,
      close,
      setTokenAtOmiseTokenField,
      createParentFrameHandler
    };

  /* dev:start */

  //------------------ Expose private members for use in test suite

    OmiseCard = {
      ...OmiseCard,
      get app() { return _app; },
      getDefaultConfig: _getDefaultConfig,
      getAllConfigureButtons: _getAllConfigureButtons,
      getFormByTarget: _getFormByTarget,
      createIframe: _createIframe,
      createHiddenInputForOmiseToken: _createHiddenInputForOmiseToken,
      isInsideIframeApp: _isInsideIframeApp,
      prepareConfig: _prepareConfig,
      destroy: _destroy
    };

  /* dev:end */

  // ------------------ Private vars
  let

    _app = {}

  ;

  _setup(settings);
  initWhenStart && _init();

  /**
   * Setup Omise.js
   * @param {Object} settings - setting for Omise.js
   */
  function _setup(settings) {
    _app = {
      settings: { ...settings },
      iframe: null,
      iframeLoaded: false,
      omiseScriptTag: null,
      omiseGenerateCheckoutButton: null,
      iframeAppId: ID_IFRAME_APP,
      defaultConfig: { ...defaultIframeAppConfig },
      configForIframeOnLoad: { ...defaultIframeAppConfig },
      currentOpenConfig: {},
      formElement: null,
      allConfigureButtons: [],
      createParentFrameHandler 
    };

    return _app;
  }

  /**
   * Run on start up
   */
  function _init() {
    const foundIframe = _app.iframe != null;

    [...document.getElementsByTagName('script')].forEach(script => {
      if (script.hasAttribute('data-key') && script.hasAttribute('data-amount')) {
        _app.omiseScriptTag = script;
      }
    });

    if (!foundIframe && !_isInsideIframeApp() && _app.omiseScriptTag) {
      _createIframe();
      _app.omiseGenerateCheckoutButton = _createOmiseCheckoutButton();
      listenMessage(OmiseCard);
    }
  }

  /**
   * Get default config
   *
   * @return {object} current default config.
   */
  function _getDefaultConfig() {
    return _app.defaultConfig;
  }

  /**
   * Get all configure buttons.
   * @return {Array} all configure buttons.
   */
  function _getAllConfigureButtons() {
    return _app.allConfigureButtons;
  }

  /**
   * Set token at omise token hidden field.
   * @param {String} token - omise token.
   */
  function setTokenAtOmiseTokenField(token) {
    const { submitAuto, onCreateTokenSuccess } = {
      ..._app.defaultConfig,
      ..._app.currentOpenConfig
    };
    const isSource = _isOmiseSource(token);

    if (_app.formElement) {
      if (isSource) {
        _app.formElement.omiseSource.value = token;
      } else {
        _app.formElement.omiseToken.value = token;
      }
    }

    if (submitAuto === 'yes' && _app.formElement) {
      _app.formElement.submit();
    }
    (onCreateTokenSuccess || noop)(token, isSource); 

    // clear current open config after submited
    _app.currentOpenConfig = {};
  }

  /**
   * Check if passed string is a source id (assumed to be a token id otherwise).
   * @param {String} token - omise token.
   */
  function _isOmiseSource(string) {
    return /^src_/.test(string);
  }

  /**
   * Get form element from target by traversing up DOM tree.
   * @param {Element} target - target element for find form element.
   * @return {Element} form element.
   */
  function _getFormByTarget(target) {
    let currentNode = target;

    // traverse up DOM until form tag found
    while (currentNode && currentNode.tagName !== 'FORM') {
      currentNode = currentNode.parentNode;
    }

    return currentNode;
  }

  /**
   * Create iframe at merchant page
   */
  function _createIframe() {
    const iframe = document.createElement('iframe');
    iframe.id = _app.iframeAppId;
    iframe.src = `${_app.settings.cardHost}/pay.html`;
    iframe.setAttribute('style', iframeDefaultStyle.join('; '));
    document.body.appendChild(iframe);
    iframe.onload = () => {
      if (_app.iframe.style.display === 'block') {
        messageShowIframeAppForm(iframe.contentWindow, {
          config: _app.configForIframeOnLoad
        })
      }
      _app.iframeLoaded = true;
    };

    _app.iframe = iframe;

    return _app.iframe;
  }

  /**
   * Create hidden input for store Omise Token.
   * @param  {Element} target - target element for insert input.
   * @return {Element} hidden input element.
   */
  function _createHiddenInputForOmiseToken(target) {
    let formElement = null;

    if (target && target.tagName === 'FORM') formElement = target;

    if (!formElement) {
      throw new Error(
        [
          'Missing form element. Generate button or custom button must contain in form element.',
          'https://github.com/omise/examples/blob/master/omise.js/example-4-custom-integration-multiple-buttons.html',
          'Or setting submit form target',
          'https://github.com/omise/examples/blob/master/omise.js/example-5-custom-integration-specify-checkout-form.html',
        ].join('\n')
      );
    }

    let inputs = {};
    ['omiseToken', 'omiseSource'].forEach((name) => {
      let input = formElement.querySelector(`input[name="${name}"]`);
      if (!input) {
        input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', name);
        formElement.appendChild(input);
      }
      inputs[name] = input;
    });

    return inputs.omiseToken;
  }

  /**
   * Auto create pay with omise button at next omise script tags
   * @return {Element} omise generate checkout button.
   */
  function _createOmiseCheckoutButton() {
    const
      { omiseScriptTag } = _app,
      config = _prepareConfig(extractDataFromElement(omiseScriptTag)),
      checkoutButton = document.createElement('button')
    ;

    checkoutButton.className = 'omise-checkout-button'
    checkoutButton.innerHTML = config.buttonLabel

    if (omiseScriptTag) {
      const formElement = _getFormByTarget(omiseScriptTag);
      _app.formElement = formElement
      _createHiddenInputForOmiseToken(formElement);
    } else {
      console.warn('Missing Omise script tag');
    }

    // bind button event.
    checkoutButton.addEventListener(
      'click',
      event => {
        event.preventDefault()

        if (omiseScriptTag) {
          const config = _prepareConfig(extractDataFromElement(omiseScriptTag));
          _app.configForIframeOnLoad = { ...config };
          open(config);
        } else {
          console.warn('Missing Omise script tag');
        }
      },
      false
    );

    // inject button next script tag.
    omiseScriptTag.parentNode.insertBefore(checkoutButton, omiseScriptTag.nextSibling);

    return checkoutButton;
  }

  /**
   * Checking omiseCard.js are running at Omise iframe app or not
   */
  function _isInsideIframeApp() {
    return document.getElementById(_app.iframeAppId) != null;
  }

  /**
   * Prepare configure before send to checkout form.
   * @param {Object} newConfig     - new config for merge with default config.
   * @return {Object} configure after merged and fix.
   */
  function _prepareConfig(newConfig = {}) {
    const { otherPaymentMethods } = newConfig;

    if (otherPaymentMethods && typeof otherPaymentMethods == 'string') {
      newConfig.otherPaymentMethods = _stringToArray(otherPaymentMethods);
    }

    return merge(_app.defaultConfig, fixConfigName(newConfig));
  }

  /**
   * Split a given string into an array
   * String format "text1, text2(text3), text4(text5, text6)"
   * @param {string} str
   * @returns {array} - Returns an array
   */
  function _stringToArray(str) {
    return ( str.match(/[\w_]+(\([^)]+\))?/g) || [] );
  }

  /**
   * Set default configure.
   * @param  {object} newConfig - new config for merge with default.
   * @return {object} default config.
   */
  function configure(newConfig) {
    _app.defaultConfig = _prepareConfig(newConfig);

    if (!_isInsideIframeApp()) {
      if (!_app.iframe) {
        _createIframe();
        listenMessage(OmiseCard);
      }
    }

    return _app.defaultConfig;
  }

  /**
   * Open iframe app.
   * @param  {Object}   newConfig - new config for iframe app.
   * @param  {Function} callback  - callback fire after iframe app opened.
   * @return result for open.
   */
  function open(newConfig = {}, callback = noop) {
    if (!_app.iframe) return false;

    const openIframeWithNewConfig = () => {
      const config = _prepareConfig(newConfig);
      _app.currentOpenConfig = { ...config };
      _app.iframe.style.backgroundColor = 'rgba(0, 0, 0, .4)';
      _app.iframe.style.display = 'block';
      setTimeout(() => {
        messageShowIframeAppForm(
          _app.iframe.contentWindow,
          { config }
        );
        callback(_app.iframe);
      });
    };

    if (_app.iframeLoaded) {
      openIframeWithNewConfig()
    } else {
      let observeCount = 0
      const
        observeTimeout = 3000,
        observeDelay = 100,
        observeTimer = setInterval(() => {
          observeCount += observeDelay;
          if (observeCount >= observeTimeout || _app.iframeLoaded) {
            if (_app.iframeLoaded) openIframeWithNewConfig();
            clearInterval(observeTimer);
          }
        }, observeDelay)
      ;
    }
    return true;
  }

  function close(callback = noop) {
    if (!_app.iframe) return false;

    _app.iframe.style.backgroundColor = 'rgba(0, 0, 0, 0)';

    setTimeout(() => {
      _app.iframe.style.display = 'none';
      callback(_app.iframe);
      const { onFormClosed } = _app.currentOpenConfig;
      (onFormClosed || noop)(_app.iframe);
    }, 250);

    return true;
  }

  /**
   * Destroy iframe app
   * *** REMOVE? ***
   */
  function _destroy() {
    const iframe = document.getElementById(_app.iframeAppId);

    if (_app.iframe && iframe) {
      document.body.removeChild(iframe);

      // reset app object to default
      _setup();
    }
  }

  /**
   * Create handler for iframe app for control OmiseCard.js
   * *** REMOVE? ***
   */
  function createParentFrameHandler() {
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
  function configureButton(buttonId, config) {
    const newButtonConfig = {
      buttonId,
      configuration: _prepareConfig(config),
    };

    _app.allConfigureButtons.push(newButtonConfig);

    return newButtonConfig;
  }


  /**
   * NOTE: LEGACY
   * Activate all configure buttons.
   */
  function attach() {
    const attachedButtons = [];
    _app.allConfigureButtons.forEach(item => {
      const
        { configuration } = item,
        button = document.querySelector(item.buttonId),
        defaultButtonText = _app.defaultConfig.buttonLabel
      ;
      let buttonText = defaultButtonText;

      if (configuration.buttonLabel && buttonText !== configuration.buttonLabel) {
        buttonText = configuration.buttonLabel;
      } else if (button.innerHTML) {
        buttonText = button.innerHTML;
      }

      button.innerHTML = buttonText;

      const { submitFormTarget } = _app.defaultConfig;
      const formElement = submitFormTarget
        ? document.querySelector(submitFormTarget)
        : _getFormByTarget(button);

      _createHiddenInputForOmiseToken(formElement);

      button.addEventListener(
        'click',
        event => {
          event.preventDefault()
          _app.configForIframeOnLoad = configuration;
          _app.formElement = formElement;
          open(configuration);
        },
        false
      );

      attachedButtons.push(button);
    });

    if (!_isInsideIframeApp()) {
      if (!_app.iframe) {
        _createIframe();
        listenMessage(OmiseCard);
      }
    }

    return attachedButtons;
  }

  
  return OmiseCard;

}

/**
 * Fix config name that doesn't match with other.
 * @param {object} config - config for iframe app.
 * @return {object} fix config.
 */
export function fixConfigName(config) {
  const
    fixConfig = {},
    needToFixKeys = {
      publicKey: 'key',
      logo: 'image',
      locationField: 'location',
    }
  ;

  // assign value and fix key
  for (const key in config) {
    // found key that need to fix
    const correctKeyName = needToFixKeys[key];
    fixConfig[correctKeyName||key] = config[key];
  }

  return fixConfig;
}
