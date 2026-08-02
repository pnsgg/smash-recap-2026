import { describe, expect, test } from 'vitest'
import { Address } from '#/domain/recap/address'
import { AddressFactory } from '#tests/factories/address-factory'

describe('Address', () => {
  test('initializes correctly with location attributes', () => {
    const address = new Address('Paris', 'IDF', 'FR', 48.8566, 2.3522)
    expect(address.city).toBe('Paris')
    expect(address.state).toBe('IDF')
    expect(address.countryCode).toBe('FR')
    expect(address.latitude).toBe(48.8566)
    expect(address.longitude).toBe(2.3522)
  })

  test('factory generates valid instances', () => {
    const address = AddressFactory.make()
    expect(address).toBeInstanceOf(Address)
  })

  describe('distanceTo', () => {
    test('computes correct distance between two points', () => {
      const paris = new Address('Paris', null, 'FR', 48.8566, 2.3522)
      const newYork = new Address('New York', null, 'US', 40.7128, -74.006)

      const distance = paris.distanceTo(newYork)
      expect(distance).not.toBeNull()
      expect(distance).toBeGreaterThan(5820)
      expect(distance).toBeLessThan(5840)
    })

    test('returns 0 when computing distance to itself', () => {
      const paris = new Address('Paris', null, 'FR', 48.8566, 2.3522)
      expect(paris.distanceTo(paris)).toBe(0)
    })

    test('returns null if any coordinate is missing', () => {
      const paris = new Address('Paris', null, 'FR', 48.8566, 2.3522)
      const missingLat = new Address('NoLat', null, 'US', null, -74.006)
      const missingLng = new Address('NoLng', null, 'US', 40.7128, null)

      expect(paris.distanceTo(missingLat)).toBeNull()
      expect(paris.distanceTo(missingLng)).toBeNull()
      expect(missingLat.distanceTo(paris)).toBeNull()
      expect(missingLng.distanceTo(paris)).toBeNull()
    })
  })
})
