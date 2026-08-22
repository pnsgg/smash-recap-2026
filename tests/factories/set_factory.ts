import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { BracketType } from '#recap/domain/bracket_type'
import type { Game } from '#recap/domain/game'
import { Set, SetPlayer } from '#recap/domain/set'
import { asEventId, asPlayerId, asSetId } from '#shared/domain/ids'
import type { EventId, PlayerId, SetId } from '#shared/domain/ids'
import { SeedFactory } from './seed_factory.js'

type SetOverrides = {
  id?: SetId
  eventId?: EventId
  bracketType?: BracketType
  competitors?: Map<PlayerId, SetPlayer>
  winnerId?: PlayerId
  round?: number
  fullRoundText?: string
  games?: Game[]
  completedAt?: Date | null
}

export const SetFactory = Factory.define<Set, any, Set, SetOverrides>(({ sequence, params }) => {
  const id = params.id ?? asSetId(sequence.toString())
  const eventId = params.eventId ?? asEventId(faker.number.int().toString())
  const bracketType = params.bracketType ?? BracketType.DOUBLE_ELIMINATION
  const round = params.round ?? faker.number.int({ min: -10, max: 10 })
  const fullRoundText =
    params.fullRoundText ??
    faker.helpers.arrayElement(['Winners Semis', 'Losers Quarterfinals', 'Grand Finals'])
  const games = params.games ?? ([] as Game[])
  const completedAt = params.completedAt === undefined ? faker.date.past() : params.completedAt

  let competitors = params.competitors
  if (competitors === undefined) {
    const p1Id = asPlayerId(faker.number.int().toString())
    const p2Id = asPlayerId(faker.number.int().toString())
    const p1 = new SetPlayer({
      playerId: p1Id,
      seed: SeedFactory.build(),
      score: faker.number.int({ min: 0, max: 3 }),
      isDisqualified: false,
    })
    const p2 = new SetPlayer({
      playerId: p2Id,
      seed: SeedFactory.build(),
      score: faker.number.int({ min: 0, max: 3 }),
      isDisqualified: false,
    })
    competitors = new Map<PlayerId, SetPlayer>([
      [p1Id, p1],
      [p2Id, p2],
    ])
  }

  let winnerId = params.winnerId
  if (winnerId === undefined) {
    const playerIds = Array.from(competitors.keys())
    winnerId =
      playerIds.length > 0
        ? faker.helpers.arrayElement(playerIds)
        : asPlayerId(faker.number.int().toString())
  }

  return new Set({
    id,
    eventId,
    bracketType,
    competitors,
    winnerId,
    round,
    fullRoundText,
    games,
    completedAt,
  })
}).afterBuild((set) => {
  // Sort the games array by orderNum after Fishery's Object.assign overrides
  ;(set as any).games = [...set.games].sort((a, b) => a.orderNum - b.orderNum)
  return set
})
