import type { CharacterId } from '#/domain/shared-kernel/ids'

export type CharacterParams = {
  id: CharacterId
  name: string
}

export class Character {
  constructor(
    public readonly id: CharacterId,
    public readonly name: string,
  ) {
    this.checkPreconditions({ id, name })
  }

  private checkPreconditions(params: CharacterParams) {
    if (!params.name || params.name.trim() === '') {
      throw new Error(
        `Invalid parameter name: ${params.name}. Value cannot be empty.`,
      )
    }
  }
}
