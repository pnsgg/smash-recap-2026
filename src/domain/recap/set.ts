import type { SetId, EventId, PlayerId } from '#/domain/shared-kernel/ids'
import type { Game } from '#/domain/recap/game'
import type { Seed } from '#/domain/recap/seed'

export class SetPlayer {
  public readonly playerId: PlayerId
  public readonly seed: Seed
  public readonly score: number
  public readonly isDisqualified: boolean

  constructor(params: {
    playerId: PlayerId
    seed: Seed
    score: number
    isDisqualified: boolean
  }) {
    this.playerId = params.playerId
    this.seed = params.seed
    this.score = params.score
    this.isDisqualified = params.isDisqualified
  }
}

export class Set {
  public readonly id: SetId
  public readonly eventId: EventId
  public readonly competitors: Map<PlayerId, SetPlayer>
  public readonly winnerId: PlayerId
  public readonly round: number
  public readonly fullRoundText: string
  public readonly games: Game[]
  public readonly completedAt: Date | null

  constructor(params: {
    id: SetId
    eventId: EventId
    competitors: Map<PlayerId, SetPlayer>
    winnerId: PlayerId
    round: number
    fullRoundText: string
    games: Game[]
    completedAt: Date | null
  }) {
    this.id = params.id
    this.eventId = params.eventId
    this.competitors = params.competitors
    this.winnerId = params.winnerId
    this.round = params.round
    this.fullRoundText = params.fullRoundText
    this.games = params.games
    this.completedAt = params.completedAt
  }
}
