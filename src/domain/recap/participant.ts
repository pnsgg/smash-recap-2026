import type { ParticipantId, PlayerId } from '#/domain/shared-kernel/ids'
import type { Seed } from '#/domain/recap/seed'

export class Participant {
  public readonly id: ParticipantId
  public readonly playerId: PlayerId
  public readonly name: string
  public readonly seed: Seed

  constructor(params: {
    id: ParticipantId
    playerId: PlayerId
    name: string
    seed: Seed
  }) {
    this.id = params.id
    this.playerId = params.playerId
    this.name = params.name
    this.seed = params.seed
  }
}
