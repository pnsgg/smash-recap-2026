import { StageFactory } from '#tests/factories/stage_factory'
import { describe, expect, test } from 'bun:test'
import { Stage } from '#recap/domain/stage'
import { asStageId } from '#shared/ids'

describe('Stage - constructor', () => {
  test('factory generates valid instances', () => {
    const stage = StageFactory.build()
    expect(stage).toBeInstanceOf(Stage)
    expect(typeof stage.id).toBe('string')
    expect(typeof stage.name).toBe('string')
  })

  test('initializes correctly with id and name', () => {
    const stage = new Stage(asStageId('stage-123'), 'Battlefield')
    expect(stage.id).toBe(asStageId('stage-123'))
    expect(stage.name).toBe('Battlefield')
  })

  test('throws error if name is empty or whitespace', () => {
    expect(() => new Stage(asStageId('stage-123'), '')).toThrow('Invalid parameter name')
    expect(() => new Stage(asStageId('stage-123'), '   ')).toThrow('Invalid parameter name')
  })
})
