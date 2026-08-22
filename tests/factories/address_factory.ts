import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { Address } from '#recap/domain/address'

export const AddressFactory = Factory.define<Address>(() => {
  return new Address({
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    countryCode: faker.location.countryCode(),
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
  })
})
