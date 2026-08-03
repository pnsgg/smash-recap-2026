import { PlayerFactory } from '#tests/factories/player-factory.ts'
import { TournamentFactory } from '#tests/factories/tournament-factory.ts';
import { describe, expect, test } from 'vitest'

describe('Player', () => {
  test.todo('mostPlayedCharacters')
  test.todo('highestUpset')
  test.todo('encounteredCharacters')
  test.todo('stageActivity')
  test.todo('totalSets')
  test.todo('worstMatchups')
  test.todo('uniqueOpponentsFaced')

  describe("dayOfWeekActivity", () => {
    test("should not contains values if the player did not attend any tournaments this year", () => {
      const player = PlayerFactory.make();

      expect(player.dayOfWeekActivity()).toEqual([
        { count: 0, day: "Sun", },
        { count: 0, day: "Mon", },
        { count: 0, day: "Tue", },
        { count: 0, day: "Wed", },
        { count: 0, day: "Thu", },
        { count: 0, day: "Fri", },
        { count: 0, day: "Sat", },
      ]);
    });


    test("should contains values if the player did attend tournaments this year", () => {
      const player = PlayerFactory.merge({
        tournaments: [
          ...TournamentFactory.merge({ startDate: new Date("2026-07-25") }).makeMany(100),
          ...TournamentFactory.merge({ startDate: new Date("2026-07-26") }).makeMany(1),
          ...TournamentFactory.merge({ startDate: new Date("2026-07-28") }).makeMany(5),
          ...TournamentFactory.merge({ startDate: new Date("2026-07-29") }).makeMany(3),
          ...TournamentFactory.merge({ startDate: new Date("2026-07-30") }).makeMany(2),
          ...TournamentFactory.merge({ startDate: new Date("2026-07-31") }).makeMany(9),
          ...TournamentFactory.merge({ startDate: new Date("2026-08-03") }).makeMany(6),

        ]
      }).make();

      expect(player.dayOfWeekActivity()).toEqual([
        { count: 1, day: "Sun", },
        { count: 6, day: "Mon", },
        { count: 5, day: "Tue", },
        { count: 3, day: "Wed", },
        { count: 2, day: "Thu", },
        { count: 9, day: "Fri", },
        { count: 100, day: "Sat", },
      ]);
    });
  });
});
