import type { ParticipantId, PlayerId } from '#/domain/shared-kernel/ids'
import type { Seed } from '#/domain/recap/seed'

export class Participant {
  constructor(
    public readonly id: ParticipantId,
    public readonly playerId: PlayerId,
    public readonly name: string,
    public readonly seed: Seed,
  ) {}
}
