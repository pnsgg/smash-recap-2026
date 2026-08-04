import { describe, expect, test } from 'vitest'
import { TournamentFactory } from '#tests/factories/tournament-factory'
import { EventFactory } from '#tests/factories/event-factory'
import { SetFactory } from '#tests/factories/set-factory'
import { SetPlayer } from '#/domain/recap/set'
import { Participant } from '#/domain/recap/participant'
import { Seed } from '#/domain/recap/seed'
import { BracketType } from '#/domain/recap/bracket-type'
import { asParticipantId, asPlayerId } from '#/domain/shared-kernel/ids'

describe('Tournament', () => {
  describe('getPlayerSPR', () => {
    test('returns null if player did not participate in any event', () => {
      const playerId = asPlayerId('target-player')

      const event = EventFactory.merge({
        participants: [
          new Participant({
            id: asParticipantId('1'),
            playerId: asPlayerId('other-player'),
            name: 'Other',
            seed: new Seed(1, 1),
          }),
        ],
      }).make()

      const tournament = TournamentFactory.merge({
        events: [event],
      }).make()

      expect(tournament.getPlayerSPR(playerId)).toBeNull()
    })

    test('calculates SPR correctly for a single event', () => {
      const playerId = asPlayerId('target-player')

      const participant = new Participant({
        id: asParticipantId('1'),
        playerId,
        name: 'Target',
        seed: new Seed(8, 5),
      })

      const event = EventFactory.merge({
        bracketType: BracketType.SINGLE_ELIMINATION,
        participants: [participant],
      }).make()

      const tournament = TournamentFactory.merge({
        events: [event],
      }).make()

      expect(tournament.getPlayerSPR(playerId)).toBe(0)
    })

    test('returns the maximum SPR achieved across multiple events', () => {
      const playerId = asPlayerId('target-player')

      const p1 = new Participant({
        id: asParticipantId('1'),
        playerId,
        name: 'Target',
        seed: new Seed(8, 5),
      })
      const event1 = EventFactory.merge({
        bracketType: BracketType.SINGLE_ELIMINATION,
        participants: [p1],
      }).make()

      const p2 = new Participant({
        id: asParticipantId('2'),
        playerId,
        name: 'Target',
        seed: new Seed(8, 1),
      })
      const event2 = EventFactory.merge({
        bracketType: BracketType.SINGLE_ELIMINATION,
        participants: [p2],
      }).make()

      const tournament = TournamentFactory.merge({
        events: [event1, event2],
      }).make()

      expect(tournament.getPlayerSPR(playerId)).toBe(3)
    })

    test('returns the maximum SPR when the first event has higher SPR than subsequent events', () => {
      const playerId = asPlayerId('1')

      const p1 = new Participant({
        id: asParticipantId('1'),
        playerId,
        name: 'Target',
        seed: new Seed(8, 1),
      })
      const event1 = EventFactory.merge({
        bracketType: BracketType.SINGLE_ELIMINATION,
        participants: [p1],
      }).make()

      const p2 = new Participant({
        id: asParticipantId('2'),
        playerId,
        name: 'Target',
        seed: new Seed(8, 5),
      })
      const event2 = EventFactory.merge({
        bracketType: BracketType.SINGLE_ELIMINATION,
        participants: [p2],
      }).make()

      const tournament = TournamentFactory.merge({
        events: [event1, event2],
      }).make()

      expect(tournament.getPlayerSPR(playerId)).toBe(3)
    })
  })

  describe('getPlayerHighestUpset', () => {
    test('returns highest upset across all events', () => {
      const playerId = asPlayerId('target-player')
      const opponentId = asPlayerId('opponent')

      const set1 = SetFactory.merge({
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
      }).make()

      const event1 = EventFactory.merge({
        bracketType: BracketType.DOUBLE_ELIMINATION,
        sets: [set1],
      }).make()

      const set2 = SetFactory.merge({
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
      }).make()

      const event2 = EventFactory.merge({
        bracketType: BracketType.DOUBLE_ELIMINATION,
        sets: [set2],
      }).make()

      const tournament = TournamentFactory.merge({
        events: [event1, event2],
      }).make()

      const bestUpset = tournament.getPlayerHighestUpset(playerId)
      expect(bestUpset).not.toBeNull()
      expect(bestUpset!.factor).toBe(6)
      expect(bestUpset!.set.id).toBe(set2.id)
    })

    test('returns the highest upset when the first event has higher upset than subsequent events', () => {
      const playerId = asPlayerId('target-player')
      const opponentId = asPlayerId('opponent')

      const set1 = SetFactory.merge({
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
      }).make()

      const event1 = EventFactory.merge({
        bracketType: BracketType.DOUBLE_ELIMINATION,
        sets: [set1],
      }).make()

      const set2 = SetFactory.merge({
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
      }).make()

      const event2 = EventFactory.merge({
        bracketType: BracketType.DOUBLE_ELIMINATION,
        sets: [set2],
      }).make()

      const tournament = TournamentFactory.merge({
        events: [event1, event2],
      }).make()

      const bestUpset = tournament.getPlayerHighestUpset(playerId)
      expect(bestUpset).not.toBeNull()
      expect(bestUpset!.factor).toBe(6)
      expect(bestUpset!.set.id).toBe(set1.id)
    })
  })
})
