import { describe, expect, test } from 'bun:test'
import { EventFactory } from '#tests/factories/event_factory'
import { PlayerFactory } from '#tests/factories/player_factory'
import { SeedFactory } from '#tests/factories/seed_factory'
import { SetFactory } from '#tests/factories/set_factory'
import { TournamentFactory } from '#tests/factories/tournament_factory'
import type { Player } from '#recap/domain/player'
import type { PlayerRanking } from '#recap/domain/player_ranking'
import type { PlayerRepository } from '#recap/domain/ports/player_repository'
import { BracketType } from '#recap/domain/bracket_type'
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

const UPSET_OPPONENT = asPlayerId('3')

const seeded = (playerId: PlayerId, score: number, initialSeed: number) =>
  new SetPlayer({ isDisqualified: false, playerId, score, seed: SeedFactory.build({ initialSeed }) })

/** A player seeded 33rd who beat the 1st seed: a big upset. */
const playerWithUpset = () =>
  PlayerFactory.build({
    id: PLAYER,
    tournaments: TournamentFactory.buildList(1, {
      events: EventFactory.buildList(1, {
        sets: SetFactory.buildList(1, {
          bracketType: BracketType.DOUBLE_ELIMINATION,
          competitors: new Map()
            .set(PLAYER, seeded(PLAYER, 2, 33))
            .set(UPSET_OPPONENT, seeded(UPSET_OPPONENT, 0, 1)),
          winnerId: PLAYER,
        }),
      }),
    }),
  })

const repositoryFor = (
  player: Player,
  getPlayerProfile: PlayerRepository['getPlayerProfile'],
  rankings: PlayerRanking[] = []
) => {
  const asked: PlayerId[] = []
  const repository: PlayerRepository = {
    searchPlayerByGamerTag: async () => [],
    getPlayerRecap: async () => ({ player, skippedEventCount: 0 }),
    getPlayerRankings: async () => rankings,
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

  test('looks up who the biggest upset was against', async () => {
    const profile = { prefix: 'ZETA', gamerTag: 'Top Seed', avatarUrl: null }
    const { repository, asked } = repositoryFor(playerWithUpset(), async () => profile)

    const recap = await getRecap(repository)

    expect(recap.player.highestUpset()?.factor).toBeGreaterThan(0)
    expect(asked).toEqual([UPSET_OPPONENT])
    expect(recap.upsetOpponentProfile).toEqual(profile)
  })

  test('keeps only the rankings whose period overlaps the recap year', async () => {
    const ranking = (title: string, start: string, end: string): PlayerRanking => ({
      rank: 4,
      previousRank: 9,
      seriesName: 'Series',
      title,
      startAt: new Date(start),
      endAt: new Date(end),
      imageUrl: null,
    })
    const { repository } = repositoryFor(PlayerFactory.build({ id: PLAYER }), async () => null, [
      ranking('2025', '2025-01-31', '2025-12-31'),
      ranking('2026 Half Year', '2026-01-01', '2026-06-28'),
      ranking('Across the new year', '2025-12-01', '2026-02-01'),
      ranking('2027', '2027-01-01', '2027-06-30'),
    ])

    const recap = await getRecap(repository)

    expect(recap.rankings.map((r) => r.title)).toEqual(['2026 Half Year', 'Across the new year'])
  })

  test('a failed rankings lookup still gives the recap, without rankings', async () => {
    const { repository } = repositoryFor(PlayerFactory.build({ id: PLAYER }), async () => null)
    repository.getPlayerRankings = async () => {
      throw new Error('start.gg is down')
    }

    const recap = await getRecap(repository)

    expect(recap.rankings).toEqual([])
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
