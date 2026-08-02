import { Address } from '#/domain/recap/address'
import { Factory } from './factory'

export const AddressFactory = Factory.define(
  ({ faker }) => ({
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    countryCode: faker.location.countryCode(),
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
  }),
  ({ city, state, countryCode, latitude, longitude }) =>
    new Address({ city, state, countryCode, latitude, longitude }),
)
