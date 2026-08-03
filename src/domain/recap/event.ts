import type { EventId, PlayerId } from '#/domain/shared-kernel/ids'
import type { Participant } from '#/domain/recap/participant'
import type { Set } from '#/domain/recap/set'
import type { Videogame } from '#/domain/recap/videogame'
import type { BracketType } from '#/domain/recap/bracket-type'
import type { Character } from '#/domain/recap/character'
import type { Stage } from '#/domain/recap/stage'

export class Event {
  public readonly id: EventId
  public readonly name: string
  public readonly videogame: Videogame
  public readonly isOnline: boolean
  public readonly bracketType: BracketType
  public readonly participants: Participant[]
  public readonly sets: Set[]

  constructor(params: {
    id: EventId
    name: string
    videogame: Videogame
    isOnline: boolean
    bracketType: BracketType
    participants: Participant[]
    sets: Set[]
  }) {
    this.id = params.id
    this.name = params.name
    this.videogame = params.videogame
    this.isOnline = params.isOnline
    this.bracketType = params.bracketType
    this.participants = params.participants
    this.sets = params.sets
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
    return participant.seed.seedingPerformanceRating(this.bracketType)
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
  getPlayerHighestUpset(
    playerId: PlayerId,
  ): { set: Set; factor: number } | null {
    let bestSet: { set: Set; factor: number } | null = null
    for (const set of this.sets) {
      if (set.winnerId !== playerId) continue
      const factor = set.upsetFactor(this.bracketType)
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
   */
  getPlayerSetsCount(playerId: PlayerId): number {
    return this.sets.filter((set) => set.competitors.has(playerId)).length
  }

  /**
   * Aggregates losses against characters for a player in this event.
   */
  getPlayerLossesAgainstCharacters(
    playerId: PlayerId,
  ): { opponentCharacter: Character; lost: boolean }[] {
    return this.sets.flatMap((set) =>
      set.getPlayerLossesAgainstCharacters(playerId),
    )
  }

  /**
   * Aggregates opponent player IDs faced in this event.
   */
  getOpponentPlayerIds(playerId: PlayerId): PlayerId[] {
    return this.sets.flatMap((set) => set.getOpponentPlayerIds(playerId))
  }
}
