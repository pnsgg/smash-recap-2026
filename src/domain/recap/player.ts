import type { PlayerId } from '#/domain/shared-kernel/ids'
import type { Tournament } from '#/domain/recap/tournament'

export class Player {
  constructor(
    public readonly id: PlayerId,
    public readonly prefix: string | null,
    public readonly gamerTag: string,
    public readonly tournaments: Tournament[],
  ) {}

  equals(other: Player): boolean {
    return other.id === this.id
  }
}
