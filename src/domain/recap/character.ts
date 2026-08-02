import type { CharacterId } from '#/domain/shared-kernel/ids'

export class Character {
  constructor(
    public readonly id: CharacterId,
    public readonly name: string,
  ) {}
}
