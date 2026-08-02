import type { StageId } from '#/domain/shared-kernel/ids'

export class Stage {
  constructor(
    public readonly id: StageId,
    public readonly name: string,
  ) {}
}
