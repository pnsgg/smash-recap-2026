import { describe, expect, test } from 'vitest'
import { Stage } from '#/domain/recap/stage'
import { asStageId } from '#/domain/shared-kernel/ids'
import { StageFactory } from '#tests/factories/stage-factory'

describe('Stage', () => {
  describe('constructor', () => {
    test('initializes correctly with id and name', () => {
      const stage = new Stage(asStageId('stage-123'), 'Battlefield')
      expect(stage.id).toBe('stage-123')
      expect(stage.name).toBe('Battlefield')
    })

    test('throws error if name is empty or whitespace', () => {
      expect(() => new Stage(asStageId('stage-123'), '')).toThrow(
        'Invalid parameter name',
      )
      expect(() => new Stage(asStageId('stage-123'), '   ')).toThrow(
        'Invalid parameter name',
      )
    })
  })

  test('factory generates valid instances', () => {
    const stage = StageFactory.build()
    expect(stage).toBeInstanceOf(Stage)
    expect(typeof stage.id).toBe('string')
    expect(typeof stage.name).toBe('string')
  })
})
