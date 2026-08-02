import type { TournamentId } from '#/domain/shared-kernel/ids'
import type { Event } from '#/domain/recap/event'
import type { Address } from '#/domain/recap/address'

export class Tournament {
  public readonly id: TournamentId
  public readonly name: string
  public readonly address: Address | null
  public readonly events: Event[]
  public readonly startDate: Date

  constructor(params: {
    id: TournamentId
    name: string
    address: Address | null
    events: Event[]
    startDate: Date
  }) {
    this.id = params.id
    this.name = params.name
    this.address = params.address
    this.events = params.events
    this.startDate = params.startDate
  }
}
