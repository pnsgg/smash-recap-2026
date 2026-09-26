import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { Videogame } from '#recap/domain/videogame'
import { asVideogameId } from '#shared/domain/ids'

const GAMES = [
  'Super Smash Bros. Ultimate',
  'Super Smash Bros. Melee',
  'Super Smash Bros. Brawl',
  'Super Smash Bros. for Wii U',
  'Super Smash Bros. (64)',
  'Street Fighter 6',
  'Rivals 2',
]

export const VideogameFactory = Factory.define<Videogame>(({ sequence }) => {
  return new Videogame(asVideogameId(sequence.toString()), faker.helpers.arrayElement(GAMES))
})
