import { ParticipantFactory } from '#tests/factories/participant_factory'
import { test } from '@japa/runner'
import { Participant } from '#recap/domain/participant'

test.group('Participant - constructor', () => {
  test('factory generates valid instances', ({ assert }) => {
    const participant = ParticipantFactory.build()
    assert.instanceOf(participant, Participant)
    assert.typeOf(participant.name, 'string')
  })

  test('initializes correctly with valid attributes', ({ assert }) => {
    assert.doesNotThrow(() => ParticipantFactory.build())
  })

  test('throws error if name is empty or whitespace - "{$self}"')
    .with(['', '   '])
    .run(({ assert }, invalidName) => {
      assert.throws(() => ParticipantFactory.build({ name: invalidName }), 'Invalid parameter name')
    })
})
