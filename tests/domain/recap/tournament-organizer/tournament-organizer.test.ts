import { describe, expect, test } from 'vitest'
import { TournamentOrganizerFactory } from '#tests/factories/tournament-organizer-factory'
import { TournamentFactory } from '#tests/factories/tournament-factory'
import { EventFactory } from '#tests/factories/event-factory'
import { VideogameFactory } from '#tests/factories/videogame-factory'
import { BracketType } from '#/domain/recap/bracket-type'

describe('TournamentOrganizer', () => {
  test('totalTournaments returns correct count', () => {
    const tournaments = TournamentFactory.makeMany(3)
    const to = TournamentOrganizerFactory.merge({ tournaments }).make()

    expect(to.totalTournaments()).toBe(3)
  })

  test('biggestTournaments sorts by attendee count and respects limit', () => {
    const tournamentA = TournamentFactory.merge({ numAttendees: 50 }).make()
    const tournamentB = TournamentFactory.merge({ numAttendees: 30 }).make()
    const tournamentC = TournamentFactory.merge({ numAttendees: 100 }).make()

    const to = TournamentOrganizerFactory.merge({
      tournaments: [tournamentA, tournamentB, tournamentC],
    }).make()

    const results = to.biggestTournaments(2)
    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ tournament: tournamentC, attendees: 100 })
    expect(results[1]).toEqual({ tournament: tournamentA, attendees: 50 })
  })

  test('gamesOrganized aggregates unique games sorted by frequency', () => {
    const gameMelee = VideogameFactory.merge({ name: 'Melee' }).make()
    const gameUltimate = VideogameFactory.merge({ name: 'Ultimate' }).make()

    const event1 = EventFactory.merge({ videogame: gameMelee }).make()
    const event2 = EventFactory.merge({ videogame: gameUltimate }).make()
    const event3 = EventFactory.merge({ videogame: gameUltimate }).make()

    const tournament1 = TournamentFactory.merge({
      events: [event1, event2],
    }).make()
    const tournament2 = TournamentFactory.merge({ events: [event3] }).make()

    const to = TournamentOrganizerFactory.merge({
      tournaments: [tournament1, tournament2],
    }).make()

    const games = to.gamesOrganized()
    expect(games).toHaveLength(2)
    expect(games[0]).toEqual({ videogame: gameUltimate, count: 2 })
    expect(games[1]).toEqual({ videogame: gameMelee, count: 1 })
  })

  test('eventTypeDistribution aggregates event bracket types sorted by frequency', () => {
    const event1 = EventFactory.merge({
      lastBracketType: BracketType.DOUBLE_ELIMINATION,
    }).make()
    const event2 = EventFactory.merge({
      lastBracketType: BracketType.SWISS,
    }).make()
    const event3 = EventFactory.merge({
      lastBracketType: BracketType.SWISS,
    }).make()

    const tournament = TournamentFactory.merge({
      events: [event1, event2, event3],
    }).make()
    const to = TournamentOrganizerFactory.merge({
      tournaments: [tournament],
    }).make()

    const distribution = to.eventTypeDistribution()
    expect(distribution).toHaveLength(2)
    expect(distribution[0]).toEqual({ type: BracketType.SWISS, count: 2 })
    expect(distribution[1]).toEqual({
      type: BracketType.DOUBLE_ELIMINATION,
      count: 1,
    })
  })

  describe('dayOfWeekActivity', () => {
    test('should not contain values if the TO did not organize any tournaments this year', () => {
      const to = TournamentOrganizerFactory.make()

      expect(to.dayOfWeekActivity()).toEqual([
        { count: 0, day: 'Sun' },
        { count: 0, day: 'Mon' },
        { count: 0, day: 'Tue' },
        { count: 0, day: 'Wed' },
        { count: 0, day: 'Thu' },
        { count: 0, day: 'Fri' },
        { count: 0, day: 'Sat' },
      ])
    })

    test('should contain values if the TO did organize tournaments this year', () => {
      const to = TournamentOrganizerFactory.merge({
        tournaments: [
          ...TournamentFactory.merge({
            startDate: new Date('2026-07-25'),
          }).makeMany(10),
          ...TournamentFactory.merge({
            startDate: new Date('2026-07-26'),
          }).makeMany(1),
          ...TournamentFactory.merge({
            startDate: new Date('2026-07-28'),
          }).makeMany(5),
          ...TournamentFactory.merge({
            startDate: new Date('2026-07-29'),
          }).makeMany(3),
          ...TournamentFactory.merge({
            startDate: new Date('2026-07-30'),
          }).makeMany(2),
          ...TournamentFactory.merge({
            startDate: new Date('2026-07-31'),
          }).makeMany(9),
          ...TournamentFactory.merge({
            startDate: new Date('2026-08-03'),
          }).makeMany(6),
        ],
      }).make()

      expect(to.dayOfWeekActivity()).toEqual([
        { count: 1, day: 'Sun' },
        { count: 6, day: 'Mon' },
        { count: 5, day: 'Tue' },
        { count: 3, day: 'Wed' },
        { count: 2, day: 'Thu' },
        { count: 9, day: 'Fri' },
        { count: 10, day: 'Sat' },
      ])
    })
  })
})

