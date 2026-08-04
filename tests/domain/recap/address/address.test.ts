import { describe, expect, test } from 'vitest'
import { Address } from '#/domain/recap/address'
import { AddressFactory } from '#tests/factories/address-factory'

describe('Address', () => {
  describe('constructor', () => {
    test('initializes correctly with location attributes', () => {
      const address = new Address({
        city: 'Paris',
        state: 'IDF',
        countryCode: 'FR',
        latitude: 48.8566,
        longitude: 2.3522,
      })
      expect(address.city).toBe('Paris')
      expect(address.state).toBe('IDF')
      expect(address.countryCode).toBe('FR')
      expect(address.latitude).toBe(48.8566)
      expect(address.longitude).toBe(2.3522)
    })

    test('throws error if latitude is invalid', () => {
      expect(
        () =>
          new Address({
            city: 'Paris',
            state: null,
            countryCode: 'FR',
            latitude: 91,
            longitude: 2.3522,
          }),
      ).toThrow('Invalid parameter latitude')

      expect(
        () =>
          new Address({
            city: 'Paris',
            state: null,
            countryCode: 'FR',
            latitude: -91,
            longitude: 2.3522,
          }),
      ).toThrow('Invalid parameter latitude')
    })

    test('throws error if longitude is invalid', () => {
      expect(
        () =>
          new Address({
            city: 'Paris',
            state: null,
            countryCode: 'FR',
            latitude: 48.8566,
            longitude: 181,
          }),
      ).toThrow('Invalid parameter longitude')

      expect(
        () =>
          new Address({
            city: 'Paris',
            state: null,
            countryCode: 'FR',
            latitude: 48.8566,
            longitude: -181,
          }),
      ).toThrow('Invalid parameter longitude')
    })
  })

  test('factory generates valid instances', () => {
    const address = AddressFactory.make()
    expect(address).toBeInstanceOf(Address)
  })

  describe('distanceTo', () => {
    test('computes correct distance between two points', () => {
      const paris = new Address({
        city: 'Paris',
        state: null,
        countryCode: 'FR',
        latitude: 48.8566,
        longitude: 2.3522,
      })
      const newYork = new Address({
        city: 'New York',
        state: null,
        countryCode: 'US',
        latitude: 40.7128,
        longitude: -74.006,
      })

      const distance = paris.distanceTo(newYork)
      expect(distance).not.toBeNull()
      expect(distance).toBeGreaterThan(5820)
      expect(distance).toBeLessThan(5840)
    })

    test('returns 0 when computing distance to itself', () => {
      const paris = new Address({
        city: 'Paris',
        state: null,
        countryCode: 'FR',
        latitude: 48.8566,
        longitude: 2.3522,
      })
      expect(paris.distanceTo(paris)).toBe(0)
    })

    test('returns null if any coordinate is missing', () => {
      const paris = new Address({
        city: 'Paris',
        state: null,
        countryCode: 'FR',
        latitude: 48.8566,
        longitude: 2.3522,
      })
      const missingLat = new Address({
        city: 'NoLat',
        state: null,
        countryCode: 'US',
        latitude: null,
        longitude: -74.006,
      })
      const missingLng = new Address({
        city: 'NoLng',
        state: null,
        countryCode: 'US',
        latitude: 40.7128,
        longitude: null,
      })

      expect(paris.distanceTo(missingLat)).toBeNull()
      expect(paris.distanceTo(missingLng)).toBeNull()
      expect(missingLat.distanceTo(paris)).toBeNull()
      expect(missingLng.distanceTo(paris)).toBeNull()
    })
  })
})
