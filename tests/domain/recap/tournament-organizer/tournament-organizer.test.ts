import { describe, expect, test } from 'vitest'
import { TournamentOrganizerFactory } from '#tests/factories/tournament-organizer-factory'
import { TournamentFactory } from '#tests/factories/tournament-factory'
import { EventFactory } from '#tests/factories/event-factory'
import { VideogameFactory } from '#tests/factories/videogame-factory'

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

  describe('tournamentsByMonth', () => {
    test('should not contain values if the TO did not organize any tournaments this year', () => {
      const to = TournamentOrganizerFactory.make()

      expect(to.tournamentsByMonth()).toEqual([
        { count: 0, month: 'Jan' },
        { count: 0, month: 'Feb' },
        { count: 0, month: 'Mar' },
        { count: 0, month: 'Apr' },
        { count: 0, month: 'May' },
        { count: 0, month: 'Jun' },
        { count: 0, month: 'Jul' },
        { count: 0, month: 'Aug' },
        { count: 0, month: 'Sep' },
        { count: 0, month: 'Oct' },
        { count: 0, month: 'Nov' },
        { count: 0, month: 'Dec' },
      ])
    })

    test('should contain values if the TO did organize tournaments this year', () => {
      const to = TournamentOrganizerFactory.merge({
        tournaments: [
          ...TournamentFactory.merge({
            startDate: new Date('2026-01-01'),
          }).makeMany(100),
          ...TournamentFactory.merge({
            startDate: new Date('2026-02-01'),
          }).makeMany(50),
          ...TournamentFactory.merge({
            startDate: new Date('2026-03-01'),
          }).makeMany(25),
          ...TournamentFactory.merge({
            startDate: new Date('2026-04-01'),
          }).makeMany(17),
          ...TournamentFactory.merge({
            startDate: new Date('2026-05-01'),
          }).makeMany(71),
          ...TournamentFactory.merge({
            startDate: new Date('2026-06-01'),
          }).makeMany(35),
          ...TournamentFactory.merge({
            startDate: new Date('2026-07-01'),
          }).makeMany(70),
          ...TournamentFactory.merge({
            startDate: new Date('2026-08-01'),
          }).makeMany(0),
          ...TournamentFactory.merge({
            startDate: new Date('2026-09-01'),
          }).makeMany(1),
          ...TournamentFactory.merge({
            startDate: new Date('2026-10-01'),
          }).makeMany(2),
          ...TournamentFactory.merge({
            startDate: new Date('2026-11-01'),
          }).makeMany(4),
          ...TournamentFactory.merge({
            startDate: new Date('2026-12-01'),
          }).makeMany(8),
        ],
      }).make()

      expect(to.tournamentsByMonth()).toEqual([
        { count: 100, month: 'Jan' },
        { count: 50, month: 'Feb' },
        { count: 25, month: 'Mar' },
        { count: 17, month: 'Apr' },
        { count: 71, month: 'May' },
        { count: 35, month: 'Jun' },
        { count: 70, month: 'Jul' },
        { count: 0, month: 'Aug' },
        { count: 1, month: 'Sep' },
        { count: 2, month: 'Oct' },
        { count: 4, month: 'Nov' },
        { count: 8, month: 'Dec' },
      ])
    })
  })
})
