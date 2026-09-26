import { EventFactory } from '#tests/factories/event_factory'
import { TournamentFactory } from '#tests/factories/tournament_factory'
import { TournamentOrganizerFactory } from '#tests/factories/tournament_organizer_factory'
import { VideogameFactory } from '#tests/factories/videogame_factory'
import { test } from '@japa/runner'

test.group('TournamentOrganizer', () => {
  test('totalTournaments returns correct count', ({ assert }) => {
    const tournaments = TournamentFactory.buildList(3)
    const to = TournamentOrganizerFactory.build({ tournaments })

    assert.equal(to.totalTournaments(), 3)
  })

  test('biggestTournaments sorts by attendee count and respects limit', ({ assert }) => {
    const tournamentA = TournamentFactory.build({ numAttendees: 50 })
    const tournamentB = TournamentFactory.build({ numAttendees: 30 })
    const tournamentC = TournamentFactory.build({ numAttendees: 100 })

    const to = TournamentOrganizerFactory.build({
      tournaments: [tournamentA, tournamentB, tournamentC],
    })

    const results = to.biggestTournaments(2)
    assert.lengthOf(results, 2)
    assert.deepEqual(results[0], { tournament: tournamentC, attendees: 100 })
    assert.deepEqual(results[1], { tournament: tournamentA, attendees: 50 })
  })

  test('gamesOrganized aggregates unique games sorted by frequency', ({ assert }) => {
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
    assert.lengthOf(games, 2)
    assert.deepEqual(games[0], { videogame: gameUltimate, count: 2 })
    assert.deepEqual(games[1], { videogame: gameMelee, count: 1 })
  })

  test('dayOfWeekActivity should not contain values if the TO did not organize any tournaments this year', ({
    assert,
  }) => {
    const to = TournamentOrganizerFactory.build()

    assert.deepEqual(to.dayOfWeekActivity(), [
      { count: 0, day: 'Sun' },
      { count: 0, day: 'Mon' },
      { count: 0, day: 'Tue' },
      { count: 0, day: 'Wed' },
      { count: 0, day: 'Thu' },
      { count: 0, day: 'Fri' },
      { count: 0, day: 'Sat' },
    ])
  })

  test('dayOfWeekActivity should contain values if the TO did organize tournaments this year', ({
    assert,
  }) => {
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

    assert.deepEqual(to.dayOfWeekActivity(), [
      { count: 1, day: 'Sun' },
      { count: 6, day: 'Mon' },
      { count: 5, day: 'Tue' },
      { count: 3, day: 'Wed' },
      { count: 2, day: 'Thu' },
      { count: 9, day: 'Fri' },
      { count: 10, day: 'Sat' },
    ])
  })

  test('tournamentsByMonth should not contain values if the TO did not organize any tournaments this year', ({
    assert,
  }) => {
    const to = TournamentOrganizerFactory.build()

    assert.deepEqual(to.tournamentsByMonth(), [
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

  test('tournamentsByMonth should contain values if the TO did organize tournaments this year', ({
    assert,
  }) => {
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

    assert.deepEqual(to.tournamentsByMonth(), [
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
