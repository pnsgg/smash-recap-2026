import { test } from '@japa/runner'
import { BracketType } from '#recap/domain/bracket_type'
import { EventType } from '#recap/domain/event_type'
import { asUserSlug } from '#shared/domain/ids'
import { mapTournamentOrganizer } from '#shared/infrastructure/secondary/startgg/mappers/tournament_organizer_mapper'
import type { TournamentDetailsResult } from '#shared/infrastructure/secondary/startgg/mappers/tournament_organizer_mapper'

test.group('TournamentOrganizerMapper', () => {
  const slug = asUserSlug('my-to-slug')
  const gamerTag = 'MyTO'

  test('successfully maps clean and valid tournament organizer payload', ({ assert }) => {
    const rawTournaments: TournamentDetailsResult[] = [
      {
        id: 'tournament-1',
        name: 'Genesis 10',
        numAttendees: 1500,
        events: [
          {
            id: 'event-1',
            name: 'Super Smash Bros. Melee Singles',
            type: 1,
            videogame: {
              id: '1',
              name: 'Super Smash Bros. Melee',
            },
            isOnline: false,
            numEntrants: 800,
            phaseGroups: [
              {
                bracketType: 'DOUBLE_ELIMINATION',
              },
            ],
          },
          {
            id: 'event-2',
            name: 'Super Smash Bros. Melee Teams',
            type: 5,
            videogame: {
              id: '1',
              name: 'Super Smash Bros. Melee',
            },
            isOnline: true,
            numEntrants: 200,
            phaseGroups: [
              {
                bracketType: 'SINGLE_ELIMINATION',
              },
            ],
          },
        ],
      },
    ]

    const result = mapTournamentOrganizer(slug, gamerTag, rawTournaments)

    assert.equal(result.id, slug)
    assert.equal(result.gamerTag, gamerTag)
    assert.lengthOf(result.tournaments, 1)

    const tournament = result.tournaments[0]
    assert.equal(tournament.id, 'tournament-1')
    assert.equal(tournament.name, 'Genesis 10')
    assert.equal(tournament.numAttendees, 1500)
    assert.lengthOf(tournament.events, 2)

    const event1 = tournament.events[0]
    assert.equal(event1.id, 'event-1')
    assert.equal(event1.name, 'Super Smash Bros. Melee Singles')
    assert.equal(event1.eventType, EventType.SINGLES)
    assert.equal(event1.videogame.id, '1')
    assert.equal(event1.videogame.name, 'Super Smash Bros. Melee')
    assert.equal(event1.isOnline, false)
    assert.equal(event1.numEntrants, 800)
    assert.equal(event1.lastBracketType, BracketType.DOUBLE_ELIMINATION)

    const event2 = tournament.events[1]
    assert.equal(event2.id, 'event-2')
    assert.equal(event2.name, 'Super Smash Bros. Melee Teams')
    assert.equal(event2.eventType, EventType.TEAMS)
    assert.equal(event2.isOnline, true)
    assert.equal(event2.numEntrants, 200)
    assert.equal(event2.lastBracketType, BracketType.SINGLE_ELIMINATION)
  })

  test('filters out null event elements and events without phaseGroups', ({ assert }) => {
    const rawTournaments: TournamentDetailsResult[] = [
      {
        id: 'tournament-1',
        name: 'Genesis 10',
        numAttendees: 1500,
        events: [
          null,
          {
            id: 'event-1',
            name: 'Valid Event',
            type: 1,
            videogame: { id: '1', name: 'Game' },
            isOnline: false,
            numEntrants: 10,
            phaseGroups: [{ bracketType: 'DOUBLE_ELIMINATION' }],
          },
          {
            id: 'event-2',
            name: 'Event without phaseGroups',
            type: 1,
            videogame: { id: '1', name: 'Game' },
            isOnline: false,
            numEntrants: 10,
            phaseGroups: null,
          },
          {
            id: 'event-3',
            name: 'Event with empty phaseGroups',
            type: 1,
            videogame: { id: '1', name: 'Game' },
            isOnline: false,
            numEntrants: 10,
            phaseGroups: [],
          },
        ],
      },
    ]

    const result = mapTournamentOrganizer(slug, gamerTag, rawTournaments)
    assert.lengthOf(result.tournaments[0].events, 1)
    assert.equal(result.tournaments[0].events[0].id, 'event-1')
  })

  test('throws error when rawEventType is null', ({ assert }) => {
    const rawTournaments: TournamentDetailsResult[] = [
      {
        id: 'tournament-1',
        name: 'Genesis 10',
        numAttendees: 1500,
        events: [
          {
            id: 'event-1',
            name: 'Event with null type',
            type: null,
            videogame: { id: '1', name: 'Game' },
            isOnline: false,
            numEntrants: 10,
            phaseGroups: [{ bracketType: 'DOUBLE_ELIMINATION' }],
          },
        ],
      },
    ]

    assert.throws(
      () => mapTournamentOrganizer(slug, gamerTag, rawTournaments),
      'Cannot map event. Reason: Event type is missing'
    )
  })

  test('throws error when rawEventType is unsupported event type code', ({ assert }) => {
    const rawTournaments: TournamentDetailsResult[] = [
      {
        id: 'tournament-1',
        name: 'Genesis 10',
        numAttendees: 1500,
        events: [
          {
            id: 'event-1',
            name: 'Event with unsupported type',
            type: 3,
            videogame: { id: '1', name: 'Game' },
            isOnline: false,
            numEntrants: 10,
            phaseGroups: [{ bracketType: 'DOUBLE_ELIMINATION' }],
          },
        ],
      },
    ]

    assert.throws(
      () => mapTournamentOrganizer(slug, gamerTag, rawTournaments),
      'Cannot map event. Reason: Unsupported event type code: 3'
    )
  })

  test('throws error when bracketType is missing, null, or invalid', ({ assert }) => {
    const makeRawPayload = (bracketType: any): TournamentDetailsResult[] => [
      {
        id: 'tournament-1',
        name: 'Genesis 10',
        numAttendees: 1500,
        events: [
          {
            id: 'event-1',
            name: 'Event',
            type: 1,
            videogame: { id: '1', name: 'Game' },
            isOnline: false,
            numEntrants: 10,
            phaseGroups: [{ bracketType }],
          },
        ],
      },
    ]

    assert.throws(
      () => mapTournamentOrganizer(slug, gamerTag, makeRawPayload(null)),
      'Invalid BracketType: null'
    )
    assert.throws(
      () => mapTournamentOrganizer(slug, gamerTag, makeRawPayload(undefined)),
      'Invalid BracketType: undefined'
    )
    assert.throws(
      () => mapTournamentOrganizer(slug, gamerTag, makeRawPayload('INVALID_BRACKET_TYPE')),
      'Invalid BracketType: INVALID_BRACKET_TYPE'
    )
  })

  test('handles missing or null optional fields gracefully by using fallback values', ({
    assert,
  }) => {
    const rawTournaments: TournamentDetailsResult[] = [
      {
        id: null,
        name: null,
        numAttendees: null,
        events: null,
      },
      {
        id: 'tournament-2',
        name: 'Genesis 10',
        numAttendees: 1500,
        events: [
          {
            id: null,
            name: null,
            type: 1,
            videogame: null,
            isOnline: null,
            numEntrants: null,
            phaseGroups: [{ bracketType: 'DOUBLE_ELIMINATION' }],
          },
        ],
      },
    ]

    const result = mapTournamentOrganizer(slug, gamerTag, rawTournaments)

    assert.lengthOf(result.tournaments, 2)

    // First tournament checks (null events, name, attendees, id)
    const t1 = result.tournaments[0]
    assert.equal(t1.id, '')
    assert.equal(t1.name, 'Unknown Tournament')
    assert.equal(t1.numAttendees, 0)
    assert.lengthOf(t1.events, 0)

    // Second tournament checks (null videogame, name, isOnline, numEntrants, id)
    const t2 = result.tournaments[1]
    assert.equal(t2.id, 'tournament-2')
    assert.lengthOf(t2.events, 1)

    const e1 = t2.events[0]
    assert.equal(e1.id, '')
    assert.equal(e1.name, 'Unknown Event')
    assert.equal(e1.isOnline, false)
    assert.equal(e1.numEntrants, 0)
    assert.equal(e1.videogame.id, '0')
    assert.equal(e1.videogame.name, 'Unknown')
  })
})
