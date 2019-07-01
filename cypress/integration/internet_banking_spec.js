describe('Internet banking', () => {
  it('Should display individual bank on defaultPaymentMethod', () => {
    cy.visit('/omiseCard_multi_form.html')
    cy.get('button#checkout-internet-banking-2').click()
    cy.get('iframe#omise-checkout-iframe-app').then($iframe => {
      const $body = $iframe.contents().find('body')

      cy.wrap($body).find('.OmiseCheckoutForm_container.open')

      cy.wrap($body).contains('Siam Commercial Bank')
      cy.wrap($body).contains('Krungthai Bank')
      cy.wrap($body)
        .contains('Bangkok Bank')
        .should('not.exist')
      cy.wrap($body)
        .contains('Bank of Ayudyha')
        .should('not.exist')
    })
  })

  it('Should display individual bank on defaultPaymentMethod and OtherPaymentMethods', () => {
    cy.visit('/omiseCard_multi_form.html')
    cy.get('button#checkout-internet-banking-3').click()
    cy.get('iframe#omise-checkout-iframe-app').then($iframe => {
      const $body = $iframe.contents().find('body')

      cy.wrap($body).find('.OmiseCheckoutForm_container.open')

      cy.wrap($body).contains('Siam Commercial Bank')
      cy.wrap($body).contains('Krungthai Bank')
      cy.wrap($body)
        .contains('Bangkok Bank')
        .should('not.exist')
      cy.wrap($body)
        .contains('Bank of Ayudyha')
        .should('not.exist')

      cy.wrap($body)
        .contains('Other Methods')
        .click()
      cy.wrap($body)
        .contains('Internet Banking')
        .click()

      cy.wrap($body).contains('Siam Commercial Bank')
      cy.wrap($body)
        .contains('Krungthai Bank')
        .should('not.exist')
      cy.wrap($body)
        .contains('Bangkok Bank')
        .should('not.exist')
      cy.wrap($body)
        .contains('Bank of Ayudyha')
        .should('not.exist')
    })
  })
})
