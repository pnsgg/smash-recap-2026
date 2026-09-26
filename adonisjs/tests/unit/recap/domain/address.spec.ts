import { AddressFactory } from '#tests/factories/address_factory'
import { test } from '@japa/runner'
import { Address } from '#recap/domain/address'

test.group('Address - constructor', () => {
  test('factory generates valid instances', ({ assert }) => {
    const address = AddressFactory.build()
    assert.instanceOf(address, Address)
  })

  test('initializes correctly with location attributes', ({ assert }) => {
    const address = new Address({
      city: 'Paris',
      state: 'IDF',
      countryCode: 'FR',
      latitude: 48.8566,
      longitude: 2.3522,
    })
    assert.equal(address.city, 'Paris')
    assert.equal(address.state, 'IDF')
    assert.equal(address.countryCode, 'FR')
    assert.equal(address.latitude, 48.8566)
    assert.equal(address.longitude, 2.3522)
  })

  test('throws error if latitude is invalid - {$self}')
    .with([91, -91])
    .run(({ assert }, invalidLatitude) => {
      assert.throws(
        () =>
          new Address({
            city: 'Paris',
            state: null,
            countryCode: 'FR',
            latitude: invalidLatitude,
            longitude: 2.3522,
          }),
        'Invalid parameter latitude'
      )
    })

  test('throws error if longitude is invalid - {$self}')
    .with([181, -181])
    .run(({ assert }, invalidLongitude) => {
      assert.throws(
        () =>
          new Address({
            city: 'Paris',
            state: null,
            countryCode: 'FR',
            latitude: 48.8566,
            longitude: invalidLongitude,
          }),
        'Invalid parameter longitude'
      )
    })
})

test.group('Address - distanceTo', () => {
  test('computes correct distance between two points', ({ assert }) => {
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
    assert.isNotNull(distance)
    assert.isAbove(distance!, 5820)
    assert.isBelow(distance!, 5840)
  })

  test('returns 0 when computing distance to itself', ({ assert }) => {
    const paris = new Address({
      city: 'Paris',
      state: null,
      countryCode: 'FR',
      latitude: 48.8566,
      longitude: 2.3522,
    })
    assert.equal(paris.distanceTo(paris), 0)
  })

  test('returns null if any coordinate is missing')
    .with([
      { lat: null, lng: -74.006 },
      { lat: 40.7128, lng: null },
    ])
    .run(({ assert }, { lat, lng }) => {
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

      assert.isNull(paris.distanceTo(missingCoord))
      assert.isNull(missingCoord.distanceTo(paris))
    })
})
