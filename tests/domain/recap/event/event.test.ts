import { describe, expect, test } from 'vitest'
import { EventFactory } from '#tests/factories/event-factory'
import { Seed } from '#/domain/recap/seed'
import { Participant } from '#/domain/recap/participant'
import { asParticipantId, asPlayerId } from '#/domain/shared-kernel/ids'

describe('Event', () => {
  test('getFinalRankingUpTo sorts participants in ascending order of final placement', () => {
    const p1 = new Participant(
      asParticipantId('1'),
      asPlayerId('p1'),
      'Player A',
      new Seed(1, 9),
    )
    const p2 = new Participant(
      asParticipantId('2'),
      asPlayerId('p2'),
      'Player B',
      new Seed(2, 3),
    )
    const p3 = new Participant(
      asParticipantId('3'),
      asPlayerId('p3'),
      'Player C',
      new Seed(3, 1),
    )
    const p4 = new Participant(
      asParticipantId('4'),
      asPlayerId('p4'),
      'Player D',
      new Seed(4, 5),
    )

    const event = EventFactory.merge({
      participants: [p1, p2, p3, p4],
    }).make()

    const ranking = event.getFinalRankingUpTo(3)

    expect(ranking).toHaveLength(3)
    expect(ranking[0].id).toBe(p3.id)
    expect(ranking[1].id).toBe(p2.id)
    expect(ranking[2].id).toBe(p4.id)
  })

  test('getFinalRankingUpTo does not mutate the original participants array', () => {
    const p1 = new Participant(
      asParticipantId('1'),
      asPlayerId('p1'),
      'Player A',
      new Seed(1, 9),
    )
    const p2 = new Participant(
      asParticipantId('2'),
      asPlayerId('p2'),
      'Player B',
      new Seed(2, 1),
    )

    const event = EventFactory.merge({
      participants: [p1, p2],
    }).make()

    expect(event.participants[0].id).toBe(p1.id)

    event.getFinalRankingUpTo(2)

    expect(event.participants[0].id).toBe(p1.id)
  })
})
