import { describe, expect, test } from 'vitest'
import { EventFactory } from '#tests/factories/event-factory'
import { Seed } from '#/domain/recap/seed'
import { Participant } from '#/domain/recap/participant'
import { asParticipantId, asPlayerId } from '#/domain/shared-kernel/ids'

describe('Event', () => {
  test('getFinalRankingUpTo sorts participants in ascending order of final placement', () => {
    const p1 = new Participant({
      id: asParticipantId('1'),
      playerId: asPlayerId('p1'),
      name: 'Player A',
      seed: new Seed(1, 9),
    })
    const p2 = new Participant({
      id: asParticipantId('2'),
      playerId: asPlayerId('p2'),
      name: 'Player B',
      seed: new Seed(2, 3),
    })
    const p3 = new Participant({
      id: asParticipantId('3'),
      playerId: asPlayerId('p3'),
      name: 'Player C',
      seed: new Seed(3, 1),
    })
    const p4 = new Participant({
      id: asParticipantId('4'),
      playerId: asPlayerId('p4'),
      name: 'Player D',
      seed: new Seed(4, 5),
    })

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
    const p1 = new Participant({
      id: asParticipantId('1'),
      playerId: asPlayerId('p1'),
      name: 'Player A',
      seed: new Seed(1, 9),
    })
    const p2 = new Participant({
      id: asParticipantId('2'),
      playerId: asPlayerId('p2'),
      name: 'Player B',
      seed: new Seed(2, 1),
    })

    const event = EventFactory.merge({
      participants: [p1, p2],
    }).make()

    expect(event.participants[0].id).toBe(p1.id)

    event.getFinalRankingUpTo(2)

    expect(event.participants[0].id).toBe(p1.id)
  })
})
