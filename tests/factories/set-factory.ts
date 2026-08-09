import { BracketType } from '#/domain/recap/bracket-type'
import { Set, SetPlayer } from '#/domain/recap/set'
import { asSetId, asEventId, asPlayerId } from '#/domain/shared-kernel/ids'
import type { PlayerId } from '#/domain/shared-kernel/ids'
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

    const p1 = new SetPlayer({
      playerId: p1Id,
      seed: SeedFactory.make(),
      score: faker.number.int({ min: 0, max: 3 }),
      isDisqualified: false,
    })
    const p2 = new SetPlayer({
      playerId: p2Id,
      seed: SeedFactory.make(),
      score: faker.number.int({ min: 0, max: 3 }),
      isDisqualified: false,
    })
    const competitors = new Map<PlayerId, SetPlayer>([
      [p1Id, p1],
      [p2Id, p2],
    ])

    return {
      id: faker.number.int().toString(),
      eventId: faker.number.int().toString(),
      competitors,
      winnerId: winnerId,
      round: faker.number.int({ min: -10, max: 10 }),
      fullRoundText: faker.helpers.arrayElement([
        'Winners Semis',
        'Losers Quarterfinals',
        'Grand Finals',
      ]),
      bracketType: BracketType.DOUBLE_ELIMINATION,
      games: [] as Game[],
      completedAt: faker.date.past(),
    }
  },
  ({
    id,
    eventId,
    bracketType,
    competitors,
    winnerId,
    round,
    fullRoundText,
    games,
    completedAt,
  }) =>
    new Set({
      id: asSetId(id),
      eventId: asEventId(eventId),
      competitors,
      winnerId,
      round,
      fullRoundText,
      games,
      completedAt,
      bracketType,
    }),
).state('withGames', (attrs, { faker }) => {
  const playerIds = Array.from(attrs.competitors.keys())
  const p1Id = playerIds[0]
  const p2Id = playerIds[1]

  const games = Array.from({ length: 3 }, (_, i) => {
    const winnerId = faker.helpers.arrayElement([p1Id, p2Id, null])
    return GameFactory.merge({
      orderNum: i + 1,
      winnerId,
      selections: [
        new GameSelection(p1Id, CharacterFactory.make()),
        new GameSelection(p2Id, CharacterFactory.make()),
      ],
    }).make()
  })
  return { games }
})
