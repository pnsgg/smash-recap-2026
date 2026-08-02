import type { PlayerId } from '#/domain/shared-kernel/ids'
import type { Tournament } from '#/domain/recap/tournament'

export class Player {
  public readonly id: PlayerId
  public readonly prefix: string | null
  public readonly gamerTag: string
  public readonly tournaments: Tournament[]

  constructor(params: {
    id: PlayerId
    prefix: string | null
    gamerTag: string
    tournaments: Tournament[]
  }) {
    this.id = params.id
    this.prefix = params.prefix
    this.gamerTag = params.gamerTag
    this.tournaments = params.tournaments
  }

  equals(other: Player): boolean {
    return other.id === this.id
  }
}
