import type { Address } from '#recap/domain/address'
import type { Character } from '#recap/domain/character'
import type { Event } from '#recap/domain/event'
import type { Set } from '#recap/domain/set'
import type { Stage } from '#recap/domain/stage'
import type { PlayerId, TournamentId } from '#libs/ids'

export type TournamentParams = {
  id: TournamentId
  name: string
  address: Address | null
  events: Event[]
  startDate: Date
  numAttendees?: number | null
  timezone?: string | null
  imageUrl?: string | null
}

export type LocalTime = {
  weekday: number
  month: number
  hour: number
  minute: number
}

export class Tournament {
  public readonly id: TournamentId
  public readonly name: string
  public readonly address: Address | null
  public readonly events: Event[]
  public readonly startDate: Date
  public readonly numAttendees: number
  /** IANA timezone, e.g. "Europe/Paris" */
  public readonly timezone: string | null
  public readonly imageUrl: string | null

  constructor(params: TournamentParams) {
    this.checkPreconditions(params)
    this.id = params.id
    this.name = params.name
    this.address = params.address
    this.events = params.events
    this.startDate = params.startDate
    this.numAttendees = params.numAttendees ?? 0
    this.timezone = params.timezone ?? null
    this.imageUrl = params.imageUrl ?? null
  }

  private checkPreconditions(params: TournamentParams) {
    if (!params.name || params.name.trim() === '') {
      throw new Error(`Invalid parameter name: ${params.name}. Value cannot be empty.`)
    }
  }

  /**
   * Expresses an instant in the tournament's local time.
   * Falls back to UTC when the timezone is unknown.
   */
  toLocalTime(date: Date): LocalTime {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: this.timezone ?? 'UTC',
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).formatToParts(date)
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((p) => p.type === type)?.value)

    const month = part('month') - 1
    return {
      weekday: new Date(Date.UTC(part('year'), month, part('day'))).getUTCDay(),
      month,
      hour: part('hour'),
      minute: part('minute'),
    }
  }

  /**
   * Computes the Seeding Performance Rating (SPR) of a player for this tournament.
   * Returns the maximum SPR achieved in any of the tournament's events, or null if none.
   */
  getPlayerSPR(playerId: PlayerId): number | null {
    let maxSpr: number | null = null
    for (const event of this.events) {
      const spr = event.getPlayerSPR(playerId)
      if (spr !== null) {
        if (maxSpr === null || spr > maxSpr) {
          maxSpr = spr
        }
      }
    }
    return maxSpr
  }

  /**
   * Finds the player's highest upset (win against a higher seeded player) in this tournament.
   */
  getPlayerHighestUpset(playerId: PlayerId): { set: Set; event: Event; factor: number } | null {
    let bestUpset: { set: Set; event: Event; factor: number } | null = null
    for (const event of this.events) {
      const upset = event.getPlayerHighestUpset(playerId)
      if (upset) {
        if (bestUpset === null || upset.factor > bestUpset.factor) {
          bestUpset = { set: upset.set, event, factor: upset.factor }
        }
      }
    }
    return bestUpset
  }

  /**
   * Aggregates stage activity outcomes for a player in this tournament.
   */
  getStageActivity(playerId: PlayerId): { stage: Stage; won: boolean }[] {
    return this.events.flatMap((event) => event.getStageActivity(playerId))
  }

  /**
   * Counts total sets played by a player in this tournament.
   */
  getPlayerSetsCount(playerId: PlayerId): number {
    return this.events.reduce((sum, event) => sum + event.getPlayerSetsCount(playerId), 0)
  }

  /**
   * Aggregates losses against characters for a player in this tournament.
   */
  getPlayerLossesAgainstCharacters(
    playerId: PlayerId
  ): { opponentCharacter: Character; lost: boolean }[] {
    return this.events.flatMap((event) => event.getPlayerLossesAgainstCharacters(playerId))
  }

  /**
   * Aggregates opponent player IDs faced in this tournament.
   */
  getOpponentPlayerIds(playerId: PlayerId): PlayerId[] {
    return this.events.flatMap((event) => event.getOpponentPlayerIds(playerId))
  }
}
