import type { EventId } from '#/domain/shared-kernel/ids'
import type { Participant } from '#/domain/recap/participant'
import type { Set } from '#/domain/recap/set'
import type { Videogame } from '#/domain/recap/videogame'

export class Event {
  public readonly id: EventId
  public readonly name: string
  public readonly videogame: Videogame
  public readonly isOnline: boolean
  public readonly participants: Participant[]
  public readonly sets: Set[]

  constructor(params: {
    id: EventId
    name: string
    videogame: Videogame
    isOnline: boolean
    participants: Participant[]
    sets: Set[]
  }) {
    this.id = params.id
    this.name = params.name
    this.videogame = params.videogame
    this.isOnline = params.isOnline
    this.participants = params.participants
    this.sets = params.sets
  }

  getFinalRankingUpTo(upTo: number): Participant[] {
    return [...this.participants]
      .sort((p1, p2) => p1.seed.finalPlacement - p2.seed.finalPlacement)
      .slice(0, upTo)
  }
}
