import type { CharacterId } from '#libs/ids'

export type CharacterParams = {
  id: CharacterId
  name: string
}

export type CharacterImages = {
  renderUrl: string | null
  stockIconUrl: string | null
}

export const NO_CHARACTER_IMAGES: CharacterImages = { renderUrl: null, stockIconUrl: null }

export class Character {
  constructor(
    public readonly id: CharacterId,
    public readonly name: string,
    public readonly images: CharacterImages = NO_CHARACTER_IMAGES
  ) {
    this.checkPreconditions({ id, name })
  }

  private checkPreconditions(params: CharacterParams) {
    if (!params.name || params.name.trim() === '') {
      throw new Error(`Invalid parameter name: ${params.name}. Value cannot be empty.`)
    }
  }
}
