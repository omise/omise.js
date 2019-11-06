/**
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 * Test - OmiseCard.js
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 */
import config from 'config'
import OmiseCard, {
  defaultIframeAppConfig,
  iframeDefaultStyle,
  fixConfigName,
} from 'OmiseCard'

/**
 * Spec - OmiseCard.js
 * --------------------------------------------------------
 */
function setup(configFormOmiseCard = config, initWhenStart) {
  return new OmiseCard(configFormOmiseCard, initWhenStart)
}

function createOmiseScriptTag() {
  const form = document.createElement('form')
  const script = document.createElement('script')
  script.setAttribute('data-key', 'KEY')
  script.setAttribute('data-amount', '12345')

  form.appendChild(script)
  document.body.appendChild(form)
}

jest.useFakeTimers()
jest.setTimeout(30000)

describe('OmiseCard.js', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  // afterEach(() => {
  //   console.log(document.body.innerHTML);
  // });

  test('should create app object structure correctly', () => {
    const omiseCard = setup()
    const { settings, defaultConfig, configForIframeOnLoad } = omiseCard.app

    expect(settings).toEqual(config)
    expect(defaultConfig).toEqual(defaultIframeAppConfig)
    expect(configForIframeOnLoad).toEqual(defaultIframeAppConfig)
  })

  test('should `getDefaultConfig` return default configure', () => {
    const omiseCard = setup()
    expect(omiseCard.getDefaultConfig()).toEqual(defaultIframeAppConfig)
  })

  test('should not automatic inject iframe without omise script tag', () => {
    const omiseCard = setup()
    expect(document.body.querySelector('iframe')).toBeNull()
  })

  test('should inject iframe into omise script tag and can destroy it', () => {
    createOmiseScriptTag()
    const omiseCard = setup()
    expect(document.body.querySelector('iframe')).not.toBeNull()

    omiseCard.destroy()
    expect(document.body.querySelector('iframe')).toBeNull()
  })

  test('should found Omise generate button in omise script tag', () => {
    createOmiseScriptTag()
    const omiseCard = setup()
    const { className } = omiseCard.app.omiseGenerateCheckoutButton
    const targetButton = document.body.querySelector(`.${className}`)

    expect(targetButton).not.toBeNull()
  })

  test('should get form element from target correctly', () => {
    const omiseCard = setup()

    document.body.innerHTML = `
      <form>
        <div id="A">
          <div id="AA">AA</div>
        </div>
        <div id="B">B</div>
      </form>
    `
    const form = omiseCard.getFormByTarget(document.getElementById('AA'))
    expect(form.tagName).toEqual('FORM')

    document.body.innerHTML = `
      <div class="container">
        <div id="A">
          <div id="AA">AA</div>
        </div>
        <div id="B">B</div>
      </div>
    `
    const notForm = omiseCard.getFormByTarget(document.getElementById('AA'))
    expect(notForm).toBeNull()
  })

  test('should create iframe and append into body properly', () => {
    const omiseCard = setup()
    const iframe = omiseCard.createIframe()

    expect(document.body.querySelector('iframe')).toEqual(iframe)
    expect(iframe.getAttribute('style')).toEqual(iframeDefaultStyle.join('; '))
  })

  test('should create hidden input omise token properly', () => {
    document.body.innerHTML = '<form id="form-target"></form>'

    const omiseCard = setup()
    const form = document.getElementById('form-target')

    const input = omiseCard.createHiddenInputForOmiseToken(form)
    expect(input.type).toEqual('hidden')
    expect(input.name).toEqual('omiseToken')
    expect(form.querySelector(`[name="${input.name}"]`)).not.toBeNull()
  })

  test('should can detect script are running inside iframe app or not', () => {
    const omiseCard = setup()
    expect(omiseCard.isInsideIframeApp()).toBeFalsy()

    document.body.innerHTML = `<div id="${omiseCard.app.iframeAppId}"></div>`
    expect(omiseCard.isInsideIframeApp()).toBeTruthy()
  })

  test('should can not `open` iframe app without injection iframe', () => {
    const omiseCard = setup()
    expect(omiseCard.open()).toBeFalsy()
  })

  test('should can not `close` iframe app without injection iframe', () => {
    const omiseCard = setup()
    expect(omiseCard.close()).toBeFalsy()
  })

  test('should `open` iframe app properly', () => {
    createOmiseScriptTag()

    const omiseCard = setup()

    return new Promise(resolve => {
      omiseCard.open({}, iframe => {
        resolve(iframe)
      })
      omiseCard.app.iframe.onload()
      jest.runAllTimers()
    }).then(iframe => {
      expect(iframe.style.display).toEqual('block')
      expect(iframe.style.backgroundColor).toEqual('rgba(0, 0, 0, 0.4)')
    })
  })

  test('should `close` iframe app properly', () => {
    createOmiseScriptTag()
    const omiseCard = setup()

    return new Promise(resolve => {
      omiseCard.open({}, () => {
        resolve()
      })
      omiseCard.app.iframe.onload()
      jest.runAllTimers()
    })
      .then(() => {
        jest.useFakeTimers()
        return new Promise(resolve => {
          omiseCard.close(iframe => {
            resolve(iframe)
          })
          jest.runAllTimers()
        })
      })
      .then(iframe => {
        expect(iframe.style.display).toEqual('none')
        expect(iframe.style.backgroundColor).toEqual('rgba(0, 0, 0, 0)')
      })
  })

  test('should fix wrong config key correctly', () => {
    const config = {
      publicKey: 'pub_key_test_1234',
      logo: 'LOGO_URL',
      locationField: 'yes',
      amount: 1234,
    }
    const expectedResult = {
      key: 'pub_key_test_1234',
      image: 'LOGO_URL',
      location: 'yes',
      amount: 1234,
    }
    expect(fixConfigName(config)).toEqual(expectedResult)
  })

  test('should prepare config correctly', () => {
    const omiseCard = setup()
    const defaultConfig = omiseCard.getDefaultConfig()

    expect(defaultConfig).toEqual(omiseCard.prepareConfig())

    const result = Object.assign({}, defaultConfig, {
      key: 'pub_key_test_1234',
      a: 1,
      b: 2,
      otherPaymentMethods: ['a', 'b', 'c'],
    })
    const expectedResult = omiseCard.prepareConfig({
      publicKey: 'pub_key_test_1234',
      a: 1,
      b: 2,
      otherPaymentMethods: 'a, b ,  c',
    })

    expect(result).toEqual(expectedResult)
  })

  test('should set new default config corectly', () => {
    const omiseCard = setup()
    const result = omiseCard.configure({
      key: 'pub_key_1234',
    })
    const expectedResult = omiseCard.getDefaultConfig()

    expect(result).toEqual(expectedResult)
  })

  test('should add `configureButton` properly', () => {
    const omiseCard = setup()
    const buttonId = '#button-1'
    const buttonConfig = {
      amount: 1234,
      frameLabel: 'Title',
    }

    expect(omiseCard.getAllConfigureButtons().length).toEqual(0)

    const result = omiseCard.configureButton(buttonId, buttonConfig)

    expect(omiseCard.getAllConfigureButtons().length).toEqual(1)
    expect(result).toEqual({
      buttonId,
      configuration: Object.assign(
        {},
        omiseCard.getDefaultConfig(),
        buttonConfig
      ),
    })
    expect(result).toEqual(omiseCard.getAllConfigureButtons()[0])
  })

  test('should `attach` all `configureButton` correctly', () => {
    const omiseCard = setup()
    const defaultConfig = omiseCard.getDefaultConfig()

    document.body.innerHTML = `
      <form>
        <button id="button-1">Button 1</button>
        <button id="button-2">Button 2</button>
        <button id="button-3"></button>
      </form>
    `

    omiseCard.configureButton('#button-1', {
      buttonLabel: 'This is button one',
    })
    omiseCard.configureButton('#button-2')
    omiseCard.configureButton('#button-3')
    const allButtons = omiseCard.attach()

    expect(allButtons[0].innerHTML).toEqual('This is button one')
    expect(allButtons[1].innerHTML).toEqual('Button 2')
    expect(allButtons[2].innerHTML).toEqual(defaultConfig.buttonLabel)

    const iframe = document.body.querySelector('iframe')
    expect(iframe.style.display).toEqual('none')

    allButtons[1].click()
    expect(iframe.style.display).toEqual('none')
  })
})
