const env = process.env.NODE_ENV || 'development'

const config = {
  test: {
    vaultUrl: 'http://vault.lvh.me:4500',
    cardHost: 'http://localhost:5002',
    interfaceUrl: 'http://api.lvh.me:3000',
  },
  development: {
    vaultUrl: 'https://vault.omise.co',
    cardHost: 'http://localhost:5002',
    interfaceUrl: 'https://api.omise.co',
  },
  staging: {
    vaultUrl: 'https://vault-staging.omise.co',
    cardHost: 'https://cdn.dev-omise.co',
    interfaceUrl: 'https://api-staging.omise.co',
  },
  production: {
    vaultUrl: 'https://vault.omise.co',
    cardHost: 'https://cdn.omise.co',
    interfaceUrl: 'https://api.omise.co',
  },
}

module.exports = config[env]
