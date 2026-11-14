import type { BracketType } from '#recap/domain/bracket_type'
import type { Character } from '#recap/domain/character'
import { EventType } from '#recap/domain/event_type'
import type { Participant } from '#recap/domain/participant'
import type { Set } from '#recap/domain/set'
import type { Stage } from '#recap/domain/stage'
import type { Videogame } from '#recap/domain/videogame'
import type { EventId, PlayerId } from '#libs/ids'

/** A set the player won, and who they beat in it. */
export type PlayerWin = {
  set: Set
  opponentPlayerId: PlayerId
  /** The opponent's entrant name in this event. */
  opponentName: string
  /** The opponent's seed in this event, or null when start.gg has none. */
  opponentSeed: number | null
  opponentCharacter: Character | null
}

export type EventParams = {
  id: EventId
  /** start.gg's `tournament/<t>/event/<e>`, or null when unknown. */
  slug?: string | null
  name: string
  videogame: Videogame
  isOnline: boolean
  /** null when start.gg's type is neither singles nor teams. */
  eventType: EventType | null
  lastBracketType: BracketType
  participants: Participant[]
  sets: Set[]
  numEntrants?: number
  /** False while start.gg has the event in progress: its placements are not final yet. Defaults to true. */
  isCompleted?: boolean
}

export class Event {
  public readonly id: EventId
  public readonly slug: string | null
  public readonly name: string
  public readonly videogame: Videogame
  public readonly isOnline: boolean
  public readonly eventType: EventType | null
  public readonly lastBracketType: BracketType
  public readonly participants: Participant[]
  public readonly sets: Set[]
  public readonly numEntrants: number
  public readonly isCompleted: boolean

  constructor(params: EventParams) {
    this.checkPreconditions(params)

    this.id = params.id
    this.slug = params.slug ?? null
    this.name = params.name
    this.videogame = params.videogame
    this.isOnline = params.isOnline
    this.eventType = params.eventType
    this.lastBracketType = params.lastBracketType
    this.participants = params.participants
    this.sets = params.sets
    this.numEntrants = params.numEntrants ?? 0
    this.isCompleted = params.isCompleted ?? true
  }

  private checkPreconditions(params: EventParams) {
    if (!params.name || params.name.trim() === '') {
      throw new Error(`Invalid parameter name: ${params.name}. Value cannot be empty.`)
    }
  }

  isTeams(): boolean {
    return this.eventType === EventType.TEAMS
  }

  getFinalRankingUpTo(upTo: number): Participant[] {
    return [...this.participants]
      .sort((p1, p2) => p1.seed.finalPlacement - p2.seed.finalPlacement)
      .slice(0, upTo)
  }

  /**
   * Computes the Seeding Performance Rating (SPR) of a player in this event.
   * Returns null if the player was not a participant or the bracket format is unsupported.
   */
  getPlayerSPR(playerId: PlayerId): number | null {
    const participant = this.participants.find((p) => p.playerId === playerId)
    if (!participant) return null
    return participant.seed.seedingPerformanceRating(this.lastBracketType)
  }

  /** The player's final placement in this event, or null if they were not in it. */
  getPlayerPlacement(playerId: PlayerId): number | null {
    return this.participants.find((p) => p.playerId === playerId)?.seed.finalPlacement ?? null
  }

  /**
   * The sets the player won in this event and who they beat: the opponent's entrant name, event
   * seed and the character they played most in that set. Excludes sets with a DQ: they were not played.
   */
  getPlayerWins(playerId: PlayerId): PlayerWin[] {
    const wins: PlayerWin[] = []
    for (const set of this.sets) {
      if (set.winnerId !== playerId || set.hasDisqualification()) continue
      const opponent = set.opponentOf(playerId)
      if (!opponent) continue
      const name = this.participants.find((p) => p.playerId === opponent.playerId)?.name
      if (!name) continue
      wins.push({
        set,
        opponentPlayerId: opponent.playerId,
        opponentName: name,
        opponentSeed: opponent.seed?.initialSeed ?? null,
        opponentCharacter: set.mostPlayedCharacter(opponent.playerId),
      })
    }
    return wins
  }

  /**
   * Retrieves characters played by a player in this event.
   */
  getPlayerCharacters(playerId: PlayerId): Character[] {
    return this.sets.flatMap((set) => set.getPlayerCharacters(playerId))
  }

  /**
   * Retrieves characters played by a player's opponents in this event.
   */
  getOpponentCharacters(playerId: PlayerId): Character[] {
    return this.sets.flatMap((set) => set.getOpponentCharacters(playerId))
  }

  /**
   * Finds the player's highest upset (win against a higher seeded player) in this event.
   */
  getPlayerHighestUpset(playerId: PlayerId): { set: Set; factor: number } | null {
    let bestSet: { set: Set; factor: number } | null = null
    for (const set of this.sets) {
      if (set.winnerId !== playerId) continue
      const factor = set.upsetFactor()
      if (factor !== null && factor > 0) {
        if (bestSet === null || factor > bestSet.factor) {
          bestSet = { set, factor }
        }
      }
    }
    return bestSet
  }

  /**
   * Aggregates stage activity outcomes for a player in this event.
   */
  getStageActivity(playerId: PlayerId): { stage: Stage; won: boolean }[] {
    return this.sets.flatMap((set) => set.getStageActivity(playerId))
  }

  /**
   * Counts total sets played by a player in this event.
   * Excludes sets where either competitor was disqualified: they were not played.
   */
  getPlayerSetsCount(playerId: PlayerId): number {
    return this.sets.filter(
      (set) => set.competitors.has(playerId) && !set.hasDisqualification()
    ).length
  }

  /**
   * Aggregates losses against characters for a player in this event.
   */
  getPlayerLossesAgainstCharacters(
    playerId: PlayerId
  ): { opponentCharacter: Character; lost: boolean }[] {
    return this.sets.flatMap((set) => set.getPlayerLossesAgainstCharacters(playerId))
  }

  /**
   * Aggregates opponent player IDs faced in this event.
   */
  getOpponentPlayerIds(playerId: PlayerId): PlayerId[] {
    return this.sets.flatMap((set) => set.getOpponentPlayerIds(playerId))
  }
}
