import { CharacterFactory } from '#tests/factories/character_factory'
import { EventFactory } from '#tests/factories/event_factory'
import { GameFactory } from '#tests/factories/game_factory'
import { ParticipantFactory } from '#tests/factories/participant_factory'
import { PlayerFactory } from '#tests/factories/player_factory'
import { SetFactory } from '#tests/factories/set_factory'
import { TournamentFactory } from '#tests/factories/tournament_factory'
import { describe, expect, test } from 'bun:test'
import type { Character } from '#recap/domain/character'
import type { Event } from '#recap/domain/event'
import { EventType } from '#recap/domain/event_type'
import { GameSelection } from '#recap/domain/game'
import { Seed } from '#recap/domain/seed'
import { SetPlayer } from '#recap/domain/set'
import { asPlayerId, type PlayerId } from '#libs/ids'

const me = asPlayerId('me')

/** A set between `me` and `opponent`, seeded as given, won by `winner`, with the characters picked per game. */
const set = (opts: {
  opponent: PlayerId
  winner: PlayerId
  opponentSeed?: number | null
  dq?: boolean
  opponentPicks?: Character[]
}) => {
  const mine = CharacterFactory.build({ name: 'Mine' })
  const picks = opts.opponentPicks ?? []
  return SetFactory.build({
    competitors: new Map([
      [me, new SetPlayer({ playerId: me, seed: new Seed(1, 1), score: 2, isDisqualified: false })],
      [
        opts.opponent,
        new SetPlayer({
          playerId: opts.opponent,
          seed: opts.opponentSeed === null ? null : new Seed(opts.opponentSeed ?? 9, 9),
          score: 0,
          isDisqualified: opts.dq ?? false,
        }),
      ],
    ]),
    winnerId: opts.winner,
    games: picks.map((pick, i) =>
      GameFactory.build({
        orderNum: i + 1,
        winnerId: opts.winner,
        selections: [new GameSelection(me, mine), new GameSelection(opts.opponent, pick)],
      })
    ),
  })
}

const event = (opts: {
  placement: number
  entrants: number
  sets?: ReturnType<typeof set>[]
  names?: Record<string, string>
  teams?: boolean
  completed?: boolean
}): Event =>
  EventFactory.build({
    isCompleted: opts.completed ?? true,
    eventType: opts.teams ? EventType.TEAMS : EventType.SINGLES,
    numEntrants: opts.entrants,
    sets: opts.sets ?? [],
    participants: [
      ParticipantFactory.build({ playerId: me, name: 'Me', seed: new Seed(1, opts.placement) }),
      ...Object.entries(opts.names ?? {}).map(([id, name]) => ParticipantFactory.build({ playerId: asPlayerId(id), name })),
    ],
  })

const playerWith = (...events: Event[][]) =>
  PlayerFactory.build({
    id: me,
    tournaments: events.map((evs, i) => TournamentFactory.build({ events: evs, startDate: new Date(2026, i, 1) })),
  })

describe('Player - setRecord', () => {
  test('counts sets won and lost, without DQs', () => {
    const a = asPlayerId('a')
    const player = playerWith([
      event({
        placement: 1,
        entrants: 8,
        names: { a: 'A' },
        sets: [set({ opponent: a, winner: me }), set({ opponent: a, winner: a }), set({ opponent: a, winner: me, dq: true })],
      }),
    ])
    expect(player.setRecord()).toEqual({ won: 1, lost: 1 })
  })
})

describe('Player - bestFinishes', () => {
  test('sorts by the share of the bracket placed at or above, then by the bigger event', () => {
    const player = playerWith(
      [event({ placement: 129, entrants: 558 })],
      [event({ placement: 1, entrants: 12 })],
      [event({ placement: 17, entrants: 790 })],
      [event({ placement: 1, entrants: 1325 })],
      [event({ placement: 4, entrants: 2814 })],
      [event({ placement: 2, entrants: 24 })]
    )
    expect(player.bestFinishes(10).map((p) => [p.placement, p.entrants])).toEqual([
      [1, 1325],
      [4, 2814],
      [17, 790],
      // 2nd of 24 and 1st of 12 are both the top 1/12: the bigger event first.
      [2, 24],
      [1, 12],
      [129, 558],
    ])
    expect(player.bestFinishes(10)[0]!.topShare).toBeCloseTo(1 / 1325)
    expect(player.bestFinishes(2)).toHaveLength(2)
  })

  test('leaves out team events, unfinished events and events without an entrant count', () => {
    const player = playerWith(
      [event({ placement: 1, entrants: 900, teams: true })],
      [event({ placement: 1, entrants: 500, completed: false })],
      [event({ placement: 1, entrants: 0 })],
      [event({ placement: 3, entrants: 64 })]
    )
    expect(player.bestFinishes(5).map((p) => [p.placement, p.entrants])).toEqual([[3, 64]])
  })

  test('lists the players beaten, best event seed first, each once, without losses or DQs', () => {
    const [a, b, c, d] = ['a', 'b', 'c', 'd'].map(asPlayerId)
    const fox = CharacterFactory.build({ name: 'Fox' })
    const player = playerWith([
      event({
        placement: 1,
        entrants: 32,
        names: { a: 'A', b: 'B', c: 'C', d: 'D' },
        sets: [
          set({ opponent: a, winner: me, opponentSeed: 12 }),
          set({ opponent: b, winner: me, opponentSeed: 2, opponentPicks: [fox, fox] }),
          set({ opponent: a, winner: me, opponentSeed: 12 }),
          set({ opponent: c, winner: c, opponentSeed: 1 }),
          set({ opponent: d, winner: me, opponentSeed: 3, dq: true }),
        ],
      }),
    ])
    const [top] = player.bestFinishes(1)
    expect(top!.wins.map((w) => [w.name, w.seed])).toEqual([
      ['B', 2],
      ['A', 12],
    ])
    expect(top!.wins[0]!.character?.name).toBe('Fox')
    expect(top!.wins[1]!.character).toBeNull()
  })

  test('caps the players beaten per event', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'].map(asPlayerId)
    const player = playerWith([
      event({
        placement: 1,
        entrants: 32,
        names: Object.fromEntries(ids.map((id) => [id, id.toUpperCase()])),
        sets: ids.map((id, i) => set({ opponent: id, winner: me, opponentSeed: i + 2 })),
      }),
    ])
    expect(player.bestFinishes(1, 4)[0]!.wins.map((w) => w.name)).toEqual(['A', 'B', 'C', 'D'])
  })
})

describe('Player - mostBeaten', () => {
  test('counts sets won per opponent, most first, then by name, with their most played character', () => {
    const [a, b, c] = ['a', 'b', 'c'].map(asPlayerId)
    const fox = CharacterFactory.build({ name: 'Fox' })
    const falco = CharacterFactory.build({ name: 'Falco' })
    const player = playerWith(
      [
        event({
          placement: 1,
          entrants: 8,
          names: { a: 'Old A', b: 'B', c: 'C' },
          sets: [
            set({ opponent: a, winner: me, opponentPicks: [fox] }),
            set({ opponent: c, winner: me }),
            set({ opponent: b, winner: me }),
            set({ opponent: b, winner: b }),
          ],
        }),
      ],
      [
        event({
          placement: 2,
          entrants: 8,
          names: { a: 'New A' },
          sets: [set({ opponent: a, winner: me, opponentPicks: [falco, falco] })],
        }),
        event({ placement: 1, entrants: 4, teams: true, names: { c: 'C' }, sets: [set({ opponent: c, winner: me })] }),
      ]
    )
    const beaten = player.mostBeaten(10)
    expect(beaten.map((o) => [o.name, o.count])).toEqual([
      ['New A', 2],
      ['B', 1],
      ['C', 1],
    ])
    expect(beaten[0]!.character?.name).toBe('Falco')
    expect(player.mostBeaten(1)).toHaveLength(1)
  })
})
