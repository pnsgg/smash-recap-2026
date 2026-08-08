import type { PlayerId } from '#/domain/shared-kernel/ids'
import type { Tournament } from '#/domain/recap/tournament'
import type { Character } from '#/domain/recap/character'
import type { Event } from '#/domain/recap/event'
import type { Set as EventSet } from '#/domain/recap/set'
import type { Stage } from '#/domain/recap/stage'

export type PlayerParams = {
  id: PlayerId
  prefix: string | null
  gamerTag: string
  tournaments: Tournament[]
}

export class Player {
  public readonly id: PlayerId
  public readonly prefix: string | null
  public readonly gamerTag: string
  public readonly tournaments: Tournament[]

  constructor(params: PlayerParams) {
    this.checkPreconditions(params)

    this.id = params.id
    this.prefix = params.prefix
    this.gamerTag = params.gamerTag
    this.tournaments = params.tournaments
  }

  private checkPreconditions(params: PlayerParams) {
    if (!params.gamerTag || params.gamerTag.trim() === '') {
      throw new Error(
        `Invalid parameter gamer tag: ${params.gamerTag}. Value cannot be empty.`,
      )
    }
  }

  equals(other: Player): boolean {
    return other.id === this.id
  }

  /**
   * Computes the player's tournament activity breakdown by day of the week.
   */
  dayOfWeekActivity(): { day: string; count: number }[] {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const activityMap = new Map<string, number>(dayNames.map((d) => [d, 0]))

    for (const tournament of this.tournaments) {
      const day = dayNames[tournament.startDate.getDay()]
      activityMap.set(day, (activityMap.get(day) || 0) + 1)
    }

    return dayNames.map((day) => ({
      day,
      count: activityMap.get(day) || 0,
    }))
  }

  /**
   * Groups the player's tournaments by their starting month and returns the counts.
   */
  tournamentsByMonth(): { month: string; count: number }[] {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    const activityMap = new Map<string, number>(monthNames.map((m) => [m, 0]))

    for (const tournament of this.tournaments) {
      const month = monthNames[tournament.startDate.getMonth()]
      activityMap.set(month, (activityMap.get(month) || 0) + 1)
    }

    return monthNames.map((month) => ({
      month,
      count: activityMap.get(month) || 0,
    }))
  }

  /**
   * Computes the total number of sets won by the player with a clean sweep (e.g., 2-0, 3-0).
   * Excludes disqualified (DQ) sets.
   */
  cleanSweeps(): number {
    return this.tournaments
      .flatMap((t) => t.events.flatMap((e) => e.sets))
      .filter((set) => set.winnerId === this.id && set.isCleanSweep()).length
  }

  /**
   * Computes the total number and win rate of sets that went to the last/deciding game.
   * A deciding game is defined as a match ending with a game score difference of exactly 1.
   * Excludes DQ sets.
   */
  decidingGameSets(): { count: number; winCount: number; winRate: number } {
    const sets = this.tournaments
      .flatMap((t) => t.events.flatMap((e) => e.sets))
      .filter((set) => set.competitors.has(this.id) && set.isDecidingGameSet())

    const count = sets.length
    const winCount = sets.filter((set) => set.winnerId === this.id).length
    const winRate = count > 0 ? winCount / count : 0

    return { count, winCount, winRate }
  }

  /**
   * Computes the total number of sets in which the player was disqualified.
   */
  totalDisqualifications(): number {
    return this.tournaments
      .flatMap((t) => t.events.flatMap((e) => e.sets))
      .filter((set) => set.isPlayerDisqualified(this.id)).length
  }

  /**
   * Computes the player's best tournament performances based on SPR.
   */
  bestPerformances(limit: number): { tournament: Tournament; spr: number }[] {
    return this.tournaments
      .map((tournament) => ({
        tournament,
        spr: tournament.getPlayerSPR(this.id),
      }))
      .filter(
        (perf): perf is { tournament: Tournament; spr: number } =>
          perf.spr !== null,
      )
      .sort((a, b) => b.spr - a.spr)
      .filter(({ spr }) => spr > 0)
      .slice(0, limit)
  }

  /**
   * Computes the player's single worst tournament performance based on SPR.
   */
  worstPerformance(): { tournament: Tournament; spr: number } | null {
    const perfs = this.tournaments
      .map((tournament) => ({
        tournament,
        spr: tournament.getPlayerSPR(this.id),
      }))
      .filter(
        (perf): perf is { tournament: Tournament; spr: number } =>
          perf.spr !== null,
      )
      .sort((a, b) => a.spr - b.spr)

    return perfs.length > 0 ? perfs[0] : null
  }

  /**
   * Computes the player's most used characters across the season.
   */
  mostPlayedCharacters(
    limit: number,
  ): { character: Character; count: number }[] {
    const counts = new Map<string, { character: Character; count: number }>()

    const characters = this.tournaments.flatMap((t) =>
      t.events.flatMap((e) => e.getPlayerCharacters(this.id)),
    )

    for (const character of characters) {
      const existing = counts.get(character.name)
      if (existing) {
        existing.count++
      } else {
        counts.set(character.name, { character, count: 1 })
      }
    }

    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  /**
   * Finds the player's highest upset (win against a higher seeded player).
   * Returns details of the match, or null if no upsets were achieved.
   */
  highestUpset(): {
    set: EventSet
    event: Event
    tournament: Tournament
    factor: number
  } | null {
    let bestUpset: {
      set: EventSet
      event: Event
      tournament: Tournament
      factor: number
    } | null = null

    for (const tournament of this.tournaments) {
      const upset = tournament.getPlayerHighestUpset(this.id)
      if (upset) {
        if (bestUpset === null || upset.factor > bestUpset.factor) {
          bestUpset = {
            set: upset.set,
            event: upset.event,
            tournament,
            factor: upset.factor,
          }
        }
      }
    }

    return bestUpset
  }

  /**
   * Returns a set characters played by opponents in games.
   */
  encounteredCharacters(): Set<Character> {
    const opponentChars = this.tournaments.flatMap((t) =>
      t.events.flatMap((e) => e.getOpponentCharacters(this.id)),
    )

    return new Set(opponentChars)
  }

  /**
   * Aggregates the player's stage usage and win rates.
   */
  stageActivity(): { stage: Stage; count: number; winRate: number }[] {
    const rawRecords = this.tournaments.flatMap((t) =>
      t.getStageActivity(this.id),
    )

    const statsMap = new Map<
      string,
      { stage: Stage; wins: number; total: number }
    >()
    for (const record of rawRecords) {
      const stageName = record.stage.name
      const current = statsMap.get(stageName) || {
        stage: record.stage,
        wins: 0,
        total: 0,
      }
      current.total++
      if (record.won) {
        current.wins++
      }
      statsMap.set(stageName, current)
    }

    return Array.from(statsMap.values()).map((stat) => ({
      stage: stat.stage,
      count: stat.total,
      winRate: stat.total > 0 ? stat.wins / stat.total : 0,
    }))
  }

  /**
   * Computes the total sets played by this player across the season.
   */
  totalSets(): number {
    return this.tournaments.reduce(
      (sum, tournament) => sum + tournament.getPlayerSetsCount(this.id),
      0,
    )
  }

  /**
   * Calculates the opponent characters the player has the hardest time against.
   * Returns them sorted by game loss count descending.
   */
  worstMatchups(limit: number): {
    character: Character
    count: number
    lossCount: number
    looseRate: number
  }[] {
    const records = this.tournaments.flatMap((t) =>
      t.getPlayerLossesAgainstCharacters(this.id),
    )

    const statsMap = new Map<
      string,
      { character: Character; wins: number; losses: number }
    >()
    for (const record of records) {
      const name = record.opponentCharacter.name
      const current = statsMap.get(name) || {
        character: record.opponentCharacter,
        wins: 0,
        losses: 0,
      }
      if (record.lost) {
        current.losses++
      } else {
        current.wins++
      }
      statsMap.set(name, current)
    }

    return Array.from(statsMap.values())
      .map((stat) => {
        const total = stat.wins + stat.losses
        return {
          character: stat.character,
          count: total,
          lossCount: stat.losses,
          looseRate: total > 0 ? stat.losses / total : 0,
        }
      })
      .sort((a, b) => b.lossCount - a.lossCount)
      .slice(0, limit)
  }

  uniqueOpponentsFaced(): Set<PlayerId> {
    const ids = this.tournaments.flatMap((t) => t.getOpponentPlayerIds(this.id))
    return new Set(ids)
  }
}
