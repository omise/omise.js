const env = process.env.NODE_ENV || 'development'

const config = {
  test: {
    vaultUrl: process.env.TEST_VAULT_URL,
    cardHost: process.env.TEST_CARD_HOST,
    interfaceUrl: process.env.TEST_INTERFACE_URL,
  },
  development: {
    vaultUrl: process.env.DEV_VAULT_URL,
    cardHost: process.env.DEV_CARD_HOST,
    interfaceUrl: process.env.DEV_INTERFACE_URL,
  },
  staging: {
    vaultUrl: process.env.STAGING_VAULT_URL,
    cardHost: process.env.STAGING_CARD_HOST,
    interfaceUrl: process.env.STAGING_INTERFACE_URL,
  },
  production: {
    vaultUrl: process.env.PROD_VAULT_URL,
    cardHost: process.env.PROD_CARD_HOST,
    interfaceUrl: process.env.PROD_INTERFACE_URL,
  },
}

module.exports = config[env]
