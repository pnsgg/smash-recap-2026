import { describe, expect, test } from 'vitest'
import { TournamentOrganizerFactory } from '#tests/factories/tournament-organizer-factory'
import { TournamentFactory } from '#tests/factories/tournament-factory'
import { EventFactory } from '#tests/factories/event-factory'
import { VideogameFactory } from '#tests/factories/videogame-factory'

describe('TournamentOrganizer', () => {
  test('totalTournaments returns correct count', () => {
    const tournaments = TournamentFactory.buildList(3)
    const to = TournamentOrganizerFactory.build({ tournaments })

    expect(to.totalTournaments()).toBe(3)
  })

  test('biggestTournaments sorts by attendee count and respects limit', () => {
    const tournamentA = TournamentFactory.build({ numAttendees: 50 })
    const tournamentB = TournamentFactory.build({ numAttendees: 30 })
    const tournamentC = TournamentFactory.build({ numAttendees: 100 })

    const to = TournamentOrganizerFactory.build({
      tournaments: [tournamentA, tournamentB, tournamentC],
    })

    const results = to.biggestTournaments(2)
    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ tournament: tournamentC, attendees: 100 })
    expect(results[1]).toEqual({ tournament: tournamentA, attendees: 50 })
  })

  test('gamesOrganized aggregates unique games sorted by frequency', () => {
    const gameMelee = VideogameFactory.build({ name: 'Melee' })
    const gameUltimate = VideogameFactory.build({ name: 'Ultimate' })

    const event1 = EventFactory.build({ videogame: gameMelee })
    const event2 = EventFactory.build({ videogame: gameUltimate })
    const event3 = EventFactory.build({ videogame: gameUltimate })

    const tournament1 = TournamentFactory.build({
      events: [event1, event2],
    })
    const tournament2 = TournamentFactory.build({ events: [event3] })

    const to = TournamentOrganizerFactory.build({
      tournaments: [tournament1, tournament2],
    })

    const games = to.gamesOrganized()
    expect(games).toHaveLength(2)
    expect(games[0]).toEqual({ videogame: gameUltimate, count: 2 })
    expect(games[1]).toEqual({ videogame: gameMelee, count: 1 })
  })

  describe('dayOfWeekActivity', () => {
    test('should not contain values if the TO did not organize any tournaments this year', () => {
      const to = TournamentOrganizerFactory.build()

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
      const to = TournamentOrganizerFactory.build({
        tournaments: [
          ...TournamentFactory.buildList(10, {
            startDate: new Date('2026-07-25'),
          }),
          ...TournamentFactory.buildList(1, {
            startDate: new Date('2026-07-26'),
          }),
          ...TournamentFactory.buildList(5, {
            startDate: new Date('2026-07-28'),
          }),
          ...TournamentFactory.buildList(3, {
            startDate: new Date('2026-07-29'),
          }),
          ...TournamentFactory.buildList(2, {
            startDate: new Date('2026-07-30'),
          }),
          ...TournamentFactory.buildList(9, {
            startDate: new Date('2026-07-31'),
          }),
          ...TournamentFactory.buildList(6, {
            startDate: new Date('2026-08-03'),
          }),
        ],
      })

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
      const to = TournamentOrganizerFactory.build()

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
      const to = TournamentOrganizerFactory.build({
        tournaments: [
          ...TournamentFactory.buildList(100, {
            startDate: new Date('2026-01-01'),
          }),
          ...TournamentFactory.buildList(50, {
            startDate: new Date('2026-02-01'),
          }),
          ...TournamentFactory.buildList(25, {
            startDate: new Date('2026-03-01'),
          }),
          ...TournamentFactory.buildList(17, {
            startDate: new Date('2026-04-01'),
          }),
          ...TournamentFactory.buildList(71, {
            startDate: new Date('2026-05-01'),
          }),
          ...TournamentFactory.buildList(35, {
            startDate: new Date('2026-06-01'),
          }),
          ...TournamentFactory.buildList(70, {
            startDate: new Date('2026-07-01'),
          }),
          ...TournamentFactory.buildList(0, {
            startDate: new Date('2026-08-01'),
          }),
          ...TournamentFactory.buildList(1, {
            startDate: new Date('2026-09-01'),
          }),
          ...TournamentFactory.buildList(2, {
            startDate: new Date('2026-10-01'),
          }),
          ...TournamentFactory.buildList(4, {
            startDate: new Date('2026-11-01'),
          }),
          ...TournamentFactory.buildList(8, {
            startDate: new Date('2026-12-01'),
          }),
        ],
      })

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

  describe('seriesOrganized', () => {
    test('correctly groups series and ignores common prefixes like PNS', () => {
      const tournaments = [
        TournamentFactory.build({
          name: 'PNS BloomBagarre #1',
          slug: 'tournament/pns-bloombagarre-1',
          startDate: new Date('2026-01-10'),
        }),
        TournamentFactory.build({
          name: 'PNS BloomBagarre #2',
          slug: 'tournament/pns-bloombagarre-2',
          startDate: new Date('2026-01-24'),
        }),
        TournamentFactory.build({
          name: 'BloomBagarre Rose',
          slug: 'tournament/bloombagarre-rose',
          startDate: new Date('2026-02-14'),
        }),
        TournamentFactory.build({
          name: 'PNS KanD.I. #1',
          slug: 'tournament/pns-kand-i-1',
          startDate: new Date('2026-01-15'),
        }),
        TournamentFactory.build({
          name: 'PNS KanD.I. #2',
          slug: 'tournament/pns-kand-i-2',
          startDate: new Date('2026-02-20'),
        }),
      ]

      const to = TournamentOrganizerFactory.build({ tournaments })
      const series = to.seriesOrganized()

      expect(series).toHaveLength(2)

      expect(series[0].seriesName).toBe('PNS BloomBagarre')
      expect(series[0].count()).toBe(3)
      expect(series[0].tournaments).toHaveLength(3)
      expect(series[0].tournaments[0].name).toBe('BloomBagarre Rose')
      expect(series[0].tournaments[1].name).toBe('PNS BloomBagarre #2')
      expect(series[0].tournaments[2].name).toBe('PNS BloomBagarre #1')

      expect(series[1].seriesName).toBe('PNS KanD.I.')
      expect(series[1].count()).toBe(2)
      expect(series[1].tournaments).toHaveLength(2)
    })
  })
})
