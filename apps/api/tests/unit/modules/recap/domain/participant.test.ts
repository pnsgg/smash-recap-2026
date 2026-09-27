import { ParticipantFactory } from '#tests/factories/participant_factory'
import { describe, expect, test } from 'bun:test'
import { Participant } from '#recap/domain/participant'

describe('Participant - constructor', () => {
  test('factory generates valid instances', () => {
    const participant = ParticipantFactory.build()
    expect(participant).toBeInstanceOf(Participant)
    expect(typeof participant.name).toBe('string')
  })

  test('initializes correctly with valid attributes', () => {
    expect(() => ParticipantFactory.build()).not.toThrow()
  })

  test.each(['', '   '])('throws error if name is empty or whitespace - "%s"', (invalidName) => {
    expect(() => ParticipantFactory.build({ name: invalidName })).toThrow(
      'Invalid parameter name'
    )
  })
})
