import { describe, expect, test } from 'vitest'
import { Participant } from '#/domain/recap/participant'
import { ParticipantFactory } from '#tests/factories/participant-factory'

describe('Participant', () => {
  describe('constructor', () => {
    test('initializes correctly with valid attributes', () => {
      expect(() => ParticipantFactory.make()).not.toThrow()
    })

    test('throws error if name is empty or whitespace', () => {
      expect(() => ParticipantFactory.merge({ name: '' }).make()).toThrow(
        'Invalid parameter name',
      )
      expect(() => ParticipantFactory.merge({ name: '   ' }).make()).toThrow(
        'Invalid parameter name',
      )
    })
  })

  test('factory generates valid instances', () => {
    const participant = ParticipantFactory.make()
    expect(participant).toBeInstanceOf(Participant)
    expect(typeof participant.name).toBe('string')
  })
})
