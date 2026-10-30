import { describe, expect, test } from 'bun:test'
import { EventFactory } from '#tests/factories/event_factory'
import { PlayerFactory } from '#tests/factories/player_factory'
import { SeedFactory } from '#tests/factories/seed_factory'
import { SetFactory } from '#tests/factories/set_factory'
import { TournamentFactory } from '#tests/factories/tournament_factory'
import type { Player } from '#recap/domain/player'
import type { PlayerRepository } from '#recap/domain/ports/player_repository'
import { SetPlayer } from '#recap/domain/set'
import { PlayerRecapService } from '#recap/service'
import { asPlayerId, asUserSlug, asVideogameId, type PlayerId } from '#libs/ids'

const PLAYER = asPlayerId('1')
const NEMESIS = asPlayerId('2')

const setPlayer = (playerId: PlayerId, score: number) =>
  new SetPlayer({ isDisqualified: false, playerId, score, seed: SeedFactory.build() })

/** A player who lost three sets to the same opponent: enough for a nemesis. */
const playerWithNemesis = () =>
  PlayerFactory.build({
    id: PLAYER,
    tournaments: TournamentFactory.buildList(1, {
      events: EventFactory.buildList(1, {
        sets: SetFactory.buildList(3, {
          competitors: new Map()
            .set(PLAYER, setPlayer(PLAYER, 0))
            .set(NEMESIS, setPlayer(NEMESIS, 3)),
          winnerId: NEMESIS,
        }),
      }),
    }),
  })

const repositoryFor = (player: Player, getPlayerProfile: PlayerRepository['getPlayerProfile']) => {
  const asked: PlayerId[] = []
  const repository: PlayerRepository = {
    searchPlayerByGamerTag: async () => [],
    getPlayerRecap: async () => ({ player, skippedEventCount: 0 }),
    getPlayerProfile: async (id) => {
      asked.push(id)
      return getPlayerProfile(id)
    },
  }
  return { repository, asked }
}

const getRecap = (repository: PlayerRepository) =>
  new PlayerRecapService(repository).getRecap(
    asUserSlug('user/1'),
    new Date('2026-01-01'),
    asVideogameId('1386')
  )

describe('PlayerRecapService', () => {
  test('looks up who the nemesis is', async () => {
    const profile = {
      prefix: 'PNS',
      gamerTag: 'Rival',
      avatarUrl: 'https://images.start.gg/rival.jpg',
    }
    const { repository, asked } = repositoryFor(playerWithNemesis(), async () => profile)

    const recap = await getRecap(repository)

    expect(asked).toEqual([NEMESIS])
    expect(recap.nemesisProfile).toEqual(profile)
  })

  test('the nemesis is also the rival here: one lookup serves both', async () => {
    const profile = { prefix: null, gamerTag: 'Rival', avatarUrl: null }
    const { repository, asked } = repositoryFor(playerWithNemesis(), async () => profile)

    const recap = await getRecap(repository)

    expect(asked).toEqual([NEMESIS])
    expect(recap.rivalProfile).toEqual(profile)
  })

  test('asks nothing when there is no nemesis', async () => {
    const { repository, asked } = repositoryFor(PlayerFactory.build(), async () => null)

    const recap = await getRecap(repository)

    expect(asked).toEqual([])
    expect(recap.nemesisProfile).toBeNull()
    expect(recap.rivalProfile).toBeNull()
  })

  test('a failed profile lookup still gives the recap, with an unnamed nemesis', async () => {
    const { repository } = repositoryFor(playerWithNemesis(), async () => {
      throw new Error('start.gg is down')
    })

    const recap = await getRecap(repository)

    expect(recap.player.nemesis()?.opponentPlayerId).toBe(NEMESIS)
    expect(recap.nemesisProfile).toBeNull()
  })
})
