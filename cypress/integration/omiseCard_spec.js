function checkoutCreditCard($body) {
  cy.wrap($body).find('.OmiseCheckoutForm_container.open')

  cy.wrap($body)
    .find('input[name="cardNumber"]')
    .type('4111111111111111')

  cy.wrap($body)
    .find('input[name="nameOnCard"]')
    .type('John Doe')

  cy.wrap($body)
    .find('input[name="expiryDate"]')
    .type('10')
    .type('25')

  cy.wrap($body)
    .find('input[name="securityCode"]')
    .type('111')

  cy.wrap($body)
    .find('.OmiseCheckoutForm_checkoutButton button')
    .click()
}

describe('Omise Card', function() {
  it('Should checkout by pre-built payment form', function() {
    cy.visit('/prebuilt.html')
    cy.get('button.omise-checkout-button').click()
    cy.get('iframe#omise-checkout-iframe-app').then($iframe => {
      const $body = $iframe.contents().find('body')
      checkoutCreditCard($body)

      cy.wrap($body).wait(3000)

      cy.url()
        .should('include', '/checkout.php')
        .should('include', 'omiseToken=tokn_test_')
    })
  })

  it('Should checkout by pre-built payment form with unknown `data-other-payment-methods`', function() {
    cy.visit('/prebuilt_unknow_other_methods.html')
    cy.get('button.omise-checkout-button').click()
    cy.get('iframe#omise-checkout-iframe-app').then($iframe => {
      const $body = $iframe.contents().find('body')
      cy.wrap($body).should('not.contain', 'Other Methods')
    })
  })

  context('multiple <form> tags with diffirent action url', () => {
    it('Should checkout by pre-built payment form', () => {
      cy.visit('/omiseCard_multi_form.html')
      cy.get('button.omise-checkout-button').click()

      cy.get('iframe#omise-checkout-iframe-app').then($iframe => {
        const $body = $iframe.contents().find('body')

        checkoutCreditCard($body)

        cy.wrap($body).wait(3000)

        cy.url()
          .should('include', '/checkout.php')
          .should('include', 'omiseToken=tokn_test_')
      })
    })

    it('Should checkout by OmiseCard.configureButton() and redirected to /card.php', () => {
      cy.visit('/omiseCard_multi_form.html')
      cy.get('button#checkout-credit-card').click()
      cy.get('iframe#omise-checkout-iframe-app').then($iframe => {
        const $body = $iframe.contents().find('body')

        checkoutCreditCard($body)

        cy.wrap($body).wait(3000)

        cy.url()
          .should('include', '/card.php')
          .should('include', 'omiseToken=tokn_test_')
      })
    })

    it('Should checkout by OmiseCard.configureButton() and redirected to /banking.php', () => {
      cy.visit('/omiseCard_multi_form.html')
      cy.get('button#checkout-internet-banking').click()
      cy.get('iframe#omise-checkout-iframe-app').then($iframe => {
        const $body = $iframe.contents().find('body')

        cy.wrap($body).find('.OmiseCheckoutForm_container.open')

        cy.wrap($body)
          .contains('Bangkok Bank')
          .click()

        cy.wrap($body).wait(3000)

        cy.url()
          .should('include', '/banking.php')
          .should('include', 'omiseSource=src_test_')
      })
    })
  })

  context('defaultPaymentsMethod and otherPaymentMethod', () => {
    it('Should checkout by default payment method', () => {
      cy.visit('/default_method_with_apm.html')
      cy.get('button#checkout-button').click()
      cy.get('iframe#omise-checkout-iframe-app').then($iframe => {
        const $body = $iframe.contents().find('body')

        checkoutCreditCard($body)

        cy.wrap($body).wait(3000)

        cy.url()
          .should('include', '/checkout.php')
          .should('include', 'omiseToken=tokn_test_')
      })
    })

    it('Should checkout by other payment methods', () => {
      cy.visit('/default_method_with_apm.html')
      cy.get('button#checkout-button').click()
      cy.get('iframe#omise-checkout-iframe-app').then($iframe => {
        const $body = $iframe.contents().find('body')

        cy.wrap($body)
          .contains('Other Methods')
          .click()

        cy.wrap($body).contains('Convenience Store')

        cy.wrap($body)
          .contains('Alipay')
          .click()

        cy.wrap($body)
          .contains('Pay with Alipay')
          .click()

        cy.wrap($body).wait(3000)

        cy.url()
          .should('include', '/checkout.php')
          .should('include', 'omiseSource=src_test_')
      })
    })
  })

  context('full page otherPaymentMethod for econtext', () => {
    it('Should show `Convenience Store` as APM label', () => {
      cy.visit('/apm_full_page.html')
      cy.get('button#checkout-button').click()
      cy.get('iframe#omise-checkout-iframe-app').then($iframe => {
        const $body = $iframe.contents().find('body')
        cy.wrap($body)
          .contains('Convenience Store')
          .click()

        cy.wrap($body)
          .find('input[name="name"]')
          .type('John')

        cy.wrap($body)
          .find('input[name="email"]')
          .type('john@gmail.com')

        cy.wrap($body)
          .find('input[name="phone_number"]')
          .type('1234567890')

        cy.wrap($body)
          .contains('Next')
          .click()

        cy.url()
          .should('include', '/checkout.php')
          .should('include', 'omiseSource=src_test_')
      })
    })
  })

  context('Translation', () => {
    it('Should be translate other methods text when set locale to `jp`', () => {
      cy.visit('/translation.html')
      cy.get('button#checkout-button').click()
      cy.get('iframe#omise-checkout-iframe-app').then($iframe => {
        const $body = $iframe.contents().find('body')
        cy.wrap($body)
          .contains('他の決済手段')
          .click()

        cy.wrap($body).contains('他の決済手段')
      })
    })
  })
})
