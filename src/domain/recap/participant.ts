import type { ParticipantId, PlayerId } from '#/domain/shared-kernel/ids'
import type { Seed } from '#/domain/recap/seed'

export type ParticipantParams = {
  id: ParticipantId
  playerId: PlayerId
  name: string
  seed: Seed
}

export class Participant {
  public readonly id: ParticipantId
  public readonly playerId: PlayerId
  public readonly name: string
  public readonly seed: Seed

  constructor(params: ParticipantParams) {
    this.checkPreconditions(params)

    this.id = params.id
    this.playerId = params.playerId
    this.name = params.name
    this.seed = params.seed
  }

  private checkPreconditions(params: ParticipantParams) {
    if (!params.name || params.name.trim() === '') {
      throw new Error(
        `Invalid parameter name: ${params.name}. Value cannot be empty.`,
      )
    }
  }
}
