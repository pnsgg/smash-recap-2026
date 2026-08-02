import type { VideogameId } from '#/domain/shared-kernel/ids'

export class Videogame {
  constructor(
    public readonly id: VideogameId,
    public readonly name: string,
  ) {}
}
