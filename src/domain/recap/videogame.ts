import type { VideogameId } from '#/domain/shared-kernel/ids'

export type VideogameParams = {
  id: VideogameId
  name: string
}

export class Videogame {
  constructor(
    public readonly id: VideogameId,
    public readonly name: string,
  ) {
    this.checkPreconditions({ id, name })
  }

  private checkPreconditions(params: VideogameParams) {
    if (!params.name || params.name.trim() === '') {
      throw new Error(
        `Invalid parameter name: ${params.name}. Value cannot be empty.`,
      )
    }
  }
}
