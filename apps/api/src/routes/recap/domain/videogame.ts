import type { VideogameId } from '#libs/ids'

export type VideogameParams = {
  id: VideogameId
  name: string
}

export class Videogame {
  constructor(
    public readonly id: VideogameId,
    public readonly name: string,
    /** The game's cover art on start.gg, if it has one. */
    public readonly imageUrl: string | null = null
  ) {
    this.checkPreconditions({ id, name })
  }

  private checkPreconditions(params: VideogameParams) {
    if (!params.name || params.name.trim() === '') {
      throw new Error(`Invalid parameter name: ${params.name}. Value cannot be empty.`)
    }
  }
}
