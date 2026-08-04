import type { VideogameId } from '#/domain/shared-kernel/ids'

export class Videogame {
  constructor(
    public readonly id: VideogameId,
    public readonly name: string,
  ) {
    if (!name || name.trim() === '') {
      throw new Error(`Invalid parameter name: ${name}. Value cannot be empty.`)
    }
  }
}
