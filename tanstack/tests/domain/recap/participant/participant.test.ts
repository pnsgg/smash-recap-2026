import { describe, expect, test } from 'vitest'
import { Participant } from '#/domain/recap/participant'
import { ParticipantFactory } from '#tests/factories/participant-factory'

describe('Participant', () => {
  describe('constructor', () => {
    test('initializes correctly with valid attributes', () => {
      expect(() => ParticipantFactory.build()).not.toThrow()
    })

    test('throws error if name is empty or whitespace', () => {
      expect(() => ParticipantFactory.build({ name: '' })).toThrow(
        'Invalid parameter name',
      )
      expect(() => ParticipantFactory.build({ name: '   ' })).toThrow(
        'Invalid parameter name',
      )
    })
  })

  test('factory generates valid instances', () => {
    const participant = ParticipantFactory.build()
    expect(participant).toBeInstanceOf(Participant)
    expect(typeof participant.name).toBe('string')
  })
})
