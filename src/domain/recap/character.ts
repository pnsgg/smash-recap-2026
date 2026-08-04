import type { CharacterId } from '#/domain/shared-kernel/ids'

export class Character {
  constructor(
    public readonly id: CharacterId,
    public readonly name: string,
  ) {
    if (!name || name.trim() === '') {
      throw new Error(`Invalid parameter name: ${name}. Value cannot be empty.`)
    }
  }
}
