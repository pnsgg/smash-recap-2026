import type { StageId } from '#/domain/shared-kernel/ids'

export type StageParams = {
  id: StageId
  name: string
}

export class Stage {
  constructor(
    public readonly id: StageId,
    public readonly name: string,
  ) {
    this.checkPreconditions({ id, name })
  }

  private checkPreconditions(params: StageParams) {
    if (!params.name || params.name.trim() === '') {
      throw new Error(
        `Invalid parameter name: ${params.name}. Value cannot be empty.`,
      )
    }
  }
}
