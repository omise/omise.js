/**
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 * Test - Omise.js
 * -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 */
import config from 'config'
import Omise, { verifyConfigStructure } from 'Omise'

/**
 * Spec - Omise.js
 * --------------------------------------------------------
 */
describe('Omise.js', () => {
  test('should verify config structure correctly', () => {
    expect(verifyConfigStructure({ a: 1 }).error).toBeTruthy
    expect(verifyConfigStructure({ vaultUrl: 'vaultUrl' }).error).toBeTruthy
    expect(
      verifyConfigStructure({
        vaultUrl: 'vaultUrl',
      }).error
    ).toBeTruthy
    expect(
      verifyConfigStructure({
        vaultUrl: 'vaultUrl',
        cardHost: 'cardHost',
      }).error
    ).toBeTruthy
    expect(
      verifyConfigStructure({
        vaultUrl: 'vaultUrl',
        cardHost: 'cardHost',
      }).error
    ).toBeTruthy

    expect(verifyConfigStructure(config).error).toBeFalsy()
  })

  test('should set public key correctly', () => {
    const omise = new Omise(config)
    const key = 'public_key_12345'

    expect(omise.setPublicKey(key)).toEqual(key)
    expect(omise.publicKey).toEqual(key)
  })
})
