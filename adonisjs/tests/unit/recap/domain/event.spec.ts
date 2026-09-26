import { EventFactory } from '#tests/factories/event_factory'
import { test } from '@japa/runner'
import { BracketType } from '#recap/domain/bracket_type'
import { EventType } from '#recap/domain/event_type'
import { Participant } from '#recap/domain/participant'
import { Seed } from '#recap/domain/seed'
import { asParticipantId, asPlayerId } from '#shared/domain/ids'

test.group('Event - constructor', () => {
  test('throws error if name is empty or whitespace - "{$self}"')
    .with(['', '   '])
    .run(({ assert }, invalidName) => {
      assert.throws(() => EventFactory.build({ name: invalidName }), 'Invalid parameter name')
    })

  test('correctly sets isTeams based on eventType - {eventType}')
    .with([
      { eventType: EventType.SINGLES, expectedIsTeams: false },
      { eventType: EventType.TEAMS, expectedIsTeams: true },
    ])
    .run(({ assert }, { eventType, expectedIsTeams }) => {
      const event = EventFactory.build({ eventType })
      assert.equal(event.isTeams(), expectedIsTeams)
    })
})

test.group('Event - getFinalRankingUpTo', () => {
  test('sorts participants in ascending order of final placement', ({ assert }) => {
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

    const event = EventFactory.build({
      participants: [p1, p2, p3, p4],
    })

    const ranking = event.getFinalRankingUpTo(3)

    assert.lengthOf(ranking, 3)
    assert.equal(ranking[0].id, p3.id)
    assert.equal(ranking[1].id, p2.id)
    assert.equal(ranking[2].id, p4.id)
  })

  test('does not mutate the original participants array', ({ assert }) => {
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

    const event = EventFactory.build({
      participants: [p1, p2],
    })

    assert.equal(event.participants[0].id, p1.id)

    event.getFinalRankingUpTo(2)

    assert.equal(event.participants[0].id, p1.id)
  })
})

test.group('Event - getPlayerSPR', () => {
  test('returns null if player did not participate', ({ assert }) => {
    const playerId = asPlayerId('non-existent')
    const event = EventFactory.build({
      participants: [],
    })
    assert.isNull(event.getPlayerSPR(playerId))
  })

  test('calculates correct SPR for a participant', ({ assert }) => {
    const playerId = asPlayerId('player-1')
    const p = new Participant({
      id: asParticipantId('1'),
      playerId,
      name: 'Player 1',
      seed: new Seed(8, 5),
    })
    const event = EventFactory.build({
      lastBracketType: BracketType.SINGLE_ELIMINATION,
      participants: [p],
    })
    assert.equal(event.getPlayerSPR(playerId), 0)
  })
})
