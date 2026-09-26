import { StageFactory } from '#tests/factories/stage_factory'
import { test } from '@japa/runner'
import { Stage } from '#recap/domain/stage'
import { asStageId } from '#shared/domain/ids'

test.group('Stage - constructor', () => {
  test('factory generates valid instances', ({ assert }) => {
    const stage = StageFactory.build()
    assert.instanceOf(stage, Stage)
    assert.equal(typeof stage.id, 'string')
    assert.equal(typeof stage.name, 'string')
  })

  test('initializes correctly with id and name', ({ assert }) => {
    const stage = new Stage(asStageId('stage-123'), 'Battlefield')
    assert.equal(stage.id, 'stage-123')
    assert.equal(stage.name, 'Battlefield')
  })

  test('throws error if name is empty or whitespace', ({ assert }) => {
    assert.throws(() => new Stage(asStageId('stage-123'), ''), 'Invalid parameter name')
    assert.throws(() => new Stage(asStageId('stage-123'), '   '), 'Invalid parameter name')
  })
})
