import { EventFactory } from '#tests/factories/event_factory'
import { SetFactory } from '#tests/factories/set_factory'
import { TournamentFactory } from '#tests/factories/tournament_factory'
import { test } from '@japa/runner'
import { BracketType } from '#recap/domain/bracket_type'
import { Participant } from '#recap/domain/participant'
import { Seed } from '#recap/domain/seed'
import { SetPlayer } from '#recap/domain/set'
import { asParticipantId, asPlayerId } from '#shared/domain/ids'

test.group('Tournament - constructor', () => {
  test('initializes correctly with valid name', ({ assert }) => {
    assert.doesNotThrow(() => TournamentFactory.build())
  })

  test('throws error if name is empty or whitespace - "{$self}"')
    .with(['', '   '])
    .run(({ assert }, invalidName) => {
      assert.throws(() => TournamentFactory.build({ name: invalidName }), 'Invalid parameter name')
    })
})

test.group('Tournament - getPlayerHighestUpset', () => {
  test('returns highest upset across all events', ({ assert }) => {
    const playerId = asPlayerId('target-player')
    const opponentId = asPlayerId('opponent')

    const set1 = SetFactory.build({
      competitors: new Map([
        [
          playerId,
          new SetPlayer({
            playerId,
            seed: new Seed(8, 1),
            score: 2,
            isDisqualified: false,
          }),
        ],
        [
          opponentId,
          new SetPlayer({
            playerId: opponentId,
            seed: new Seed(2, 1),
            score: 0,
            isDisqualified: false,
          }),
        ],
      ]),
      winnerId: playerId,
    })

    const event1 = EventFactory.build({
      lastBracketType: BracketType.DOUBLE_ELIMINATION,
      sets: [set1],
    })

    const set2 = SetFactory.build({
      competitors: new Map([
        [
          playerId,
          new SetPlayer({
            playerId,
            seed: new Seed(16, 1),
            score: 2,
            isDisqualified: false,
          }),
        ],
        [
          opponentId,
          new SetPlayer({
            playerId: opponentId,
            seed: new Seed(2, 1),
            score: 0,
            isDisqualified: false,
          }),
        ],
      ]),
      winnerId: playerId,
    })

    const event2 = EventFactory.build({
      lastBracketType: BracketType.DOUBLE_ELIMINATION,
      sets: [set2],
    })

    const tournament = TournamentFactory.build({
      events: [event1, event2],
    })

    const bestUpset = tournament.getPlayerHighestUpset(playerId)
    assert.isNotNull(bestUpset)
    assert.equal(bestUpset!.factor, 6)
    assert.equal(bestUpset!.set.id, set2.id)
  })

  test('returns the highest upset when the first event has higher upset than subsequent events', ({
    assert,
  }) => {
    const playerId = asPlayerId('target-player')
    const opponentId = asPlayerId('opponent')

    const set1 = SetFactory.build({
      competitors: new Map([
        [
          playerId,
          new SetPlayer({
            playerId,
            seed: new Seed(16, 1),
            score: 2,
            isDisqualified: false,
          }),
        ],
        [
          opponentId,
          new SetPlayer({
            playerId: opponentId,
            seed: new Seed(2, 1),
            score: 0,
            isDisqualified: false,
          }),
        ],
      ]),
      winnerId: playerId,
    })

    const event1 = EventFactory.build({
      lastBracketType: BracketType.DOUBLE_ELIMINATION,
      sets: [set1],
    })

    const set2 = SetFactory.build({
      competitors: new Map([
        [
          playerId,
          new SetPlayer({
            playerId,
            seed: new Seed(8, 1),
            score: 2,
            isDisqualified: false,
          }),
        ],
        [
          opponentId,
          new SetPlayer({
            playerId: opponentId,
            seed: new Seed(2, 1),
            score: 0,
            isDisqualified: false,
          }),
        ],
      ]),
      winnerId: playerId,
    })

    const event2 = EventFactory.build({
      lastBracketType: BracketType.DOUBLE_ELIMINATION,
      sets: [set2],
    })

    const tournament = TournamentFactory.build({
      events: [event1, event2],
    })

    const bestUpset = tournament.getPlayerHighestUpset(playerId)
    assert.isNotNull(bestUpset)
    assert.equal(bestUpset!.factor, 6)
    assert.equal(bestUpset!.set.id, set1.id)
  })
})

test.group('Tournament - getPlayerSPR', () => {
  test('returns null if player did not participate in any event', ({ assert }) => {
    const playerId = asPlayerId('target-player')

    const event = EventFactory.build({
      participants: [
        new Participant({
          id: asParticipantId('1'),
          playerId: asPlayerId('other-player'),
          name: 'Other',
          seed: new Seed(1, 1),
        }),
      ],
    })

    const tournament = TournamentFactory.build({
      events: [event],
    })

    assert.isNull(tournament.getPlayerSPR(playerId))
  })

  test('calculates SPR correctly for a single event', ({ assert }) => {
    const playerId = asPlayerId('target-player')

    const participant = new Participant({
      id: asParticipantId('1'),
      playerId,
      name: 'Target',
      seed: new Seed(8, 5),
    })

    const event = EventFactory.build({
      lastBracketType: BracketType.SINGLE_ELIMINATION,
      participants: [participant],
    })

    const tournament = TournamentFactory.build({
      events: [event],
    })

    assert.equal(tournament.getPlayerSPR(playerId), 0)
  })

  test('returns the maximum SPR achieved across multiple events', ({ assert }) => {
    const playerId = asPlayerId('target-player')

    const p1 = new Participant({
      id: asParticipantId('1'),
      playerId,
      name: 'Target',
      seed: new Seed(8, 5),
    })
    const event1 = EventFactory.build({
      lastBracketType: BracketType.SINGLE_ELIMINATION,
      participants: [p1],
    })

    const p2 = new Participant({
      id: asParticipantId('2'),
      playerId,
      name: 'Target',
      seed: new Seed(8, 1),
    })
    const event2 = EventFactory.build({
      lastBracketType: BracketType.SINGLE_ELIMINATION,
      participants: [p2],
    })

    const tournament = TournamentFactory.build({
      events: [event1, event2],
    })

    assert.equal(tournament.getPlayerSPR(playerId), 3)
  })

  test('returns the maximum SPR when the first event has higher SPR than subsequent events', ({
    assert,
  }) => {
    const playerId = asPlayerId('1')

    const p1 = new Participant({
      id: asParticipantId('1'),
      playerId,
      name: 'Target',
      seed: new Seed(8, 1),
    })
    const event1 = EventFactory.build({
      lastBracketType: BracketType.SINGLE_ELIMINATION,
      participants: [p1],
    })

    const p2 = new Participant({
      id: asParticipantId('2'),
      playerId,
      name: 'Target',
      seed: new Seed(8, 5),
    })
    const event2 = EventFactory.build({
      lastBracketType: BracketType.SINGLE_ELIMINATION,
      participants: [p2],
    })

    const tournament = TournamentFactory.build({
      events: [event1, event2],
    })

    assert.equal(tournament.getPlayerSPR(playerId), 3)
  })
})
