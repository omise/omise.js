describe('Installment', () => {
  it('Should display installment as main payment method', () => {
    cy.visit('/omiseCard_multi_form.html')
    cy.get('button#checkout-installment-1').click()
    cy.get('iframe#omise-checkout-iframe-app').then($iframe => {
      const $body = $iframe.contents().find('body')

      cy.wrap($body).find('.OmiseCheckoutForm_container.open')

      cy.wrap($body).contains('Bangkok Bank')
      cy.wrap($body).contains('Krungsri First Choice')
      cy.wrap($body).contains('Krungsri')
      cy.wrap($body).contains('Kasikorn')
      cy.wrap($body)
        .contains('KTC')
        .click()

      cy.wrap($body).contains('1 Months')
      cy.wrap($body).contains('2 Months')
      cy.wrap($body)
        .contains('3 Months')
        .click()

      cy.wrap($body).wait(3000)

      cy.url()
        .should('include', '/banking.php')
        .should('include', 'omiseSource=src_test_')
    })
  })

  it('Should display installment as other payment method', () => {
    cy.visit('/omiseCard_multi_form.html')
    cy.get('button#checkout-installment-2').click()
    cy.get('iframe#omise-checkout-iframe-app').then($iframe => {
      const $body = $iframe.contents().find('body')

      cy.wrap($body).find('.OmiseCheckoutForm_container.open')

      cy.wrap($body)
        .contains('Installment')
        .click()

      cy.wrap($body).contains('Bangkok Bank')
      cy.wrap($body).contains('Krungsri First Choice')
      cy.wrap($body).contains('Krungsri')
      cy.wrap($body).contains('Kasikorn')
      cy.wrap($body)
        .contains('KTC')
        .click()

      cy.wrap($body).contains('1 Months')
      cy.wrap($body).contains('2 Months')
      cy.wrap($body)
        .contains('3 Months')
        .click()

      cy.wrap($body).wait(3000)

      cy.url()
        .should('include', '/banking.php')
        .should('include', 'omiseSource=src_test_')
    })
  })
})
