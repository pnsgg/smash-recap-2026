import { Videogame } from '#/domain/recap/videogame'
import { asVideogameId } from '#/domain/shared-kernel/ids'
import { Factory } from './factory'

const GAMES = [
  'Super Smash Bros. Ultimate',
  'Super Smash Bros. Melee',
  'Super Smash Bros. Brawl',
  'Super Smash Bros. for Wii U',
  'Super Smash Bros. (64)',
  'Street Fighter 6',
  'Rivals 2',
]

export const VideogameFactory = Factory.define(
  ({ faker }) => ({
    id: faker.number.int().toString(),
    name: faker.helpers.arrayElement(GAMES),
  }),
  ({ id, name }) => new Videogame(asVideogameId(id), name),
)
