import { AddressFactory } from '#tests/factories/address_factory'
import { describe, expect, test } from 'bun:test'
import { Address } from '#recap/domain/address'

describe('Address - constructor', () => {
  test('factory generates valid instances', () => {
    const address = AddressFactory.build()
    expect(address).toBeInstanceOf(Address)
  })

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

  test.each([91, -91])('throws error if latitude is invalid - %p', (invalidLatitude) => {
    expect(
      () =>
        new Address({
          city: 'Paris',
          state: null,
          countryCode: 'FR',
          latitude: invalidLatitude,
          longitude: 2.3522,
        })
    ).toThrow('Invalid parameter latitude')
  })

  test.each([181, -181])('throws error if longitude is invalid - %p', (invalidLongitude) => {
    expect(
      () =>
        new Address({
          city: 'Paris',
          state: null,
          countryCode: 'FR',
          latitude: 48.8566,
          longitude: invalidLongitude,
        })
    ).toThrow('Invalid parameter longitude')
  })
})

describe('Address - distanceTo', () => {
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
    expect(distance!).toBeGreaterThan(5820)
    expect(distance!).toBeLessThan(5840)
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

  test.each([
    { lat: null, lng: -74.006 },
    { lat: 40.7128, lng: null },
  ])('returns null if any coordinate is missing', ({ lat, lng }) => {
    const paris = new Address({
      city: 'Paris',
      state: null,
      countryCode: 'FR',
      latitude: 48.8566,
      longitude: 2.3522,
    })
    const missingCoord = new Address({
      city: 'NoCoord',
      state: null,
      countryCode: 'US',
      latitude: lat,
      longitude: lng,
    })

    expect(paris.distanceTo(missingCoord)).toBeNull()
    expect(missingCoord.distanceTo(paris)).toBeNull()
  })
})
