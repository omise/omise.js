# Omise.js

Omise.js is a JavaScript library which helps secure card information by sending sensitive details from the cardholder's browser directly to the Omise server. The details are converted into a one-time-use token which can be used to create a charge right away or attached to a customer object for later use.

## Setup

Insert Omise.js script into your page, you can select from our two CDNs

Primary CDN (Singapore)

```html
<script src="https://cdn.omise.co/omise.js.gz"></script>
```

Secondary CDN (Japan)

```html
<script src="https://cdn2.omise.co/omise.js.gz"></script>
```

For uncompressed version, remove .gz extension.

#### Then set your public key in a `script` tag

```js
Omise.setPublicKey('pkey_test_4xpip92iqmehclz4a4d')
```

That's it. You're good to send card data securely to Omise servers.

## Browser compatibility

Omise.js relies on the excellent [easyXDM](https://github.com/oyvindkinsey/easyXDM) library for communication with the API. The following browsers are supported:

- Internet Explorer 8 and above.
- Opera 9 and above.
- Firefox 1.0 and above.
- Safari 4 and above.
- Chrome 2 and above.

With the following mobile environment:

- iOS 4 and above.
- Android 2.2 and above.
- Windows Phone 8 and above.

With the following browsers operate in compatibility mode:

- Internet Explorer 6-7 if Flash is installed on user machine.
- Internet Explorer 6 requires TLS 1.0 to be enabled in the browser settings.

### Example

The following example shows you how to send the card data to Omise API and get a token back.  
If card authorization passed, `response.card.security_code_check` will be `true`. If it's `false` you should ask user to check the card details.  
The Token is in `response.id`, send this token to your backend for creating a charge using your secret key.

```html
  <form id="card" name="checkoutForm" method="GET" action="checkout.php">
    <input name="holder_name" type="text" />
    <input name="number" type="text" />
    <input name="expiration_month" type="number" />
    <input name="expiration_year" type="number" />
    <input name="security_code" type="number" />
    <button type="submit" id="checkoutButton">Checkout</button>
  </form>
```

```js
// Given that you have a form element with an id of "card" in your page.
var card_form = document.getElementById('card')

// Serialize the card into a valid card object.
var card = {
  name: card_form.holder_name.value,
  number: card_form.number.value,
  expiration_month: card_form.expiration_month.value,
  expiration_year: card_form.expiration_year.value,
  security_code: card_form.security_code.value,
}

Omise.createToken('card', card, function(statusCode, response) {
  if (statusCode == 200) {
    // Success: send back the TOKEN_ID to your server to create a charge.
    // The TOKEN_ID can be found in `response.id`.
  } else {
    // Error: display an error message. Note that `response.message` contains
    // a preformatted error message. Also note that `response.code` will be
    // "invalid_card" in case of validation error on the card.

    // Example Error displaying
    alert(response.code + ': ' + response.message)
  }
})
```

### Response Object:

```js
{
  "object": "token",
  "id": "tokn_test_5086xl7c9k5rnx35qba",
  "livemode": false,
  "location": "https://vault.omise.co/tokens/tokn_test_5086xl7c9k5rnx35qba",
  "used": false,
  "card": {
    "object": "card",
    "id": "card_test_5086xl7amxfysl0ac5l",
    "livemode": false,
    "country": "us",
    "city": "Bangkok",
    "postal_code": "10320",
    "financing": "",
    "last_digits": "4242",
    "brand": "Visa",
    "expiration_month": 10,
    "expiration_year": 2018,
    "fingerprint": "mKleiBfwp+PoJWB/ipngANuECUmRKjyxROwFW5IO7TM=",
    "name": "Somchai Prasert",
    "security_code_check": true,
    "created": "2015-06-02T05:41:46Z"
  },
  "created": "2015-06-02T05:41:46Z"
}
```

Please note that it is important to leave `name` attribute in form `input`s to prevent the credit card data to be sent to your server. For more completed example, please refer to [examples](https://github.com/omise/examples/tree/master/omise.js)

## LIBRARY DEVELOPMENT

```
git clone https://github.com/omise/omise.js.git
cd omise.js
yarn install
yarn start
```

Now you can view omise.js at `http://localhost:5001/omise.js` or insert Omise.js script into your page

```
<script src="http://localhost:5001/omise.js"></script>
```

## Build distribution

### DON'T FORGET TO ADD `NODE_ENV` for specific CDN URL.

| NODE_ENV               | CDN URL                  |
| ---------------------- | ------------------------ |
| `staging`              | https://cdn.dev-omise.co |
| `production`           | https://cdn.omise.co     |
| `development`(default) | http://localhost:5002    |

> if you not sure, please use `production`

**Example**

```shell
NODE_ENV=production yarn build
```

## Documentation

You can find the Omise.js documentation at https://www.omise.co/omise-js-api

## End 2 End testing

to run e2e testing you need to start both pay.js and omise.js

and run `yarn install` first for install missing dependencies.

1.  run omise.js by `yarn start`, now you can access via `http://localhost:5001/omise.js`
2.  run pay.js from pay.js's repo and change omise.js url on `payjs-repo/pay.html`

```
from
<script src="omise.js"></script>
to
<script src="http://localhost:5001/omise.js"></script>
```

3.  start server to run fixtures and binding port to 4126

```
yarn -g http-server
http-server -p 4126 cypress/fixtures/
```

now you can access example html at `http://localhost:4126`

4.  run end to end testing

```
yarn run e2e
```

if you would like to run test runner GUI please use

```
yarn run e2e:open
```
