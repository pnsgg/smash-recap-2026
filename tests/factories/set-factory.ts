import { Set, SetPlayer } from '#/domain/recap/set'
import { asSetId, asEventId, asPlayerId } from '#/domain/shared-kernel/ids'
import { GameFactory } from './game-factory'
import { SeedFactory } from './seed-factory'
import { CharacterFactory } from './character-factory'
import { Factory } from './factory'
import { GameSelection } from '#/domain/recap/game'
import type { Game } from '#/domain/recap/game'

export const SetFactory = Factory.define(
  ({ faker }) => {
    const p1Id = asPlayerId(faker.number.int().toString())
    const p2Id = asPlayerId(faker.number.int().toString())
    const winnerId = faker.helpers.arrayElement([p1Id, p2Id])

    return {
      id: faker.number.int().toString(),
      eventId: faker.number.int().toString(),
      player1: new SetPlayer(
        p1Id,
        SeedFactory.make(),
        faker.number.int({ min: 0, max: 3 }),
        false,
      ),
      player2: new SetPlayer(
        p2Id,
        SeedFactory.make(),
        faker.number.int({ min: 0, max: 3 }),
        false,
      ),
      winnerId: winnerId,
      round: faker.number.int({ min: -10, max: 10 }),
      fullRoundText: faker.helpers.arrayElement([
        'Winners Semis',
        'Losers Quarterfinals',
        'Grand Finals',
      ]),
      games: [] as Game[],
      completedAt: faker.date.past(),
    }
  },
  ({
    id,
    eventId,
    player1,
    player2,
    winnerId,
    round,
    fullRoundText,
    games,
    completedAt,
  }) =>
    new Set(
      asSetId(id),
      asEventId(eventId),
      player1,
      player2,
      winnerId,
      round,
      fullRoundText,
      games,
      completedAt,
    ),
).state('withGames', (attrs, { faker }) => {
  const games = Array.from({ length: 3 }, (_, i) => {
    const winnerId = faker.helpers.arrayElement([
      attrs.player1.playerId,
      attrs.player2.playerId,
      null,
    ])
    return GameFactory.merge({
      orderNum: i + 1,
      winnerId,
      selections: [
        new GameSelection(attrs.player1.playerId, CharacterFactory.make()),
        new GameSelection(attrs.player2.playerId, CharacterFactory.make()),
      ],
    }).make()
  })
  return { games }
})
