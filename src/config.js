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
    vaultUrl: process.env.PRODUCTION_VAULT_URL,
    cardHost: process.env.PRODUCTION_CARD_HOST,
    interfaceUrl: process.env.PRODUCTION_INTERFACE_URL,
  },
}

module.exports = config[env]
