import { describe, expect, test } from 'vitest'
import { mapTournamentOrganizer } from '#/infrastructure/secondary/startgg/mappers/tournament-organizer-mapper'
import type { TournamentDetailsResult } from '#/infrastructure/secondary/startgg/mappers/tournament-organizer-mapper'
import { EventType } from '#/domain/recap/event-type'
import { BracketType } from '#/domain/recap/bracket-type'
import { asUserSlug } from '#/domain/shared-kernel/ids'

describe('TournamentOrganizerMapper', () => {
  const slug = asUserSlug('my-to-slug')
  const gamerTag = 'MyTO'

  test('successfully maps clean and valid tournament organizer payload', () => {
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

    expect(result.id).toBe(slug)
    expect(result.gamerTag).toBe(gamerTag)
    expect(result.tournaments).toHaveLength(1)

    const tournament = result.tournaments[0]
    expect(tournament.id).toBe('tournament-1')
    expect(tournament.name).toBe('Genesis 10')
    expect(tournament.numAttendees).toBe(1500)
    expect(tournament.events).toHaveLength(2)

    const event1 = tournament.events[0]
    expect(event1.id).toBe('event-1')
    expect(event1.name).toBe('Super Smash Bros. Melee Singles')
    expect(event1.eventType).toBe(EventType.SINGLES)
    expect(event1.videogame.id).toBe('1')
    expect(event1.videogame.name).toBe('Super Smash Bros. Melee')
    expect(event1.isOnline).toBe(false)
    expect(event1.numEntrants).toBe(800)
    expect(event1.lastBracketType).toBe(BracketType.DOUBLE_ELIMINATION)

    const event2 = tournament.events[1]
    expect(event2.id).toBe('event-2')
    expect(event2.name).toBe('Super Smash Bros. Melee Teams')
    expect(event2.eventType).toBe(EventType.TEAMS)
    expect(event2.isOnline).toBe(true)
    expect(event2.numEntrants).toBe(200)
    expect(event2.lastBracketType).toBe(BracketType.SINGLE_ELIMINATION)
  })

  test('filters out null event elements and events without phaseGroups', () => {
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
    expect(result.tournaments[0].events).toHaveLength(1)
    expect(result.tournaments[0].events[0].id).toBe('event-1')
  })

  test('throws error when rawEventType is null', () => {
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

    expect(() =>
      mapTournamentOrganizer(slug, gamerTag, rawTournaments),
    ).toThrow('Cannot map event. Reason: Event type is missing')
  })

  test('throws error when rawEventType is unsupported event type code', () => {
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

    expect(() =>
      mapTournamentOrganizer(slug, gamerTag, rawTournaments),
    ).toThrow('Cannot map event. Reason: Unsupported event type code: 3')
  })

  test('throws error when bracketType is missing, null, or invalid', () => {
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

    expect(() =>
      mapTournamentOrganizer(slug, gamerTag, makeRawPayload(null)),
    ).toThrow('Invalid BracketType: null')
    expect(() =>
      mapTournamentOrganizer(slug, gamerTag, makeRawPayload(undefined)),
    ).toThrow('Invalid BracketType: undefined')
    expect(() =>
      mapTournamentOrganizer(
        slug,
        gamerTag,
        makeRawPayload('INVALID_BRACKET_TYPE'),
      ),
    ).toThrow('Invalid BracketType: INVALID_BRACKET_TYPE')
  })

  test('handles missing or null optional fields gracefully by using fallback values', () => {
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

    expect(result.tournaments).toHaveLength(2)

    // First tournament checks (null events, name, attendees, id)
    const t1 = result.tournaments[0]
    expect(t1.id).toBe('')
    expect(t1.name).toBe('Unknown Tournament')
    expect(t1.numAttendees).toBe(0)
    expect(t1.events).toHaveLength(0)

    // Second tournament checks (null videogame, name, isOnline, numEntrants, id)
    const t2 = result.tournaments[1]
    expect(t2.id).toBe('tournament-2')
    expect(t2.events).toHaveLength(1)

    const e1 = t2.events[0]
    expect(e1.id).toBe('')
    expect(e1.name).toBe('Unknown Event')
    expect(e1.isOnline).toBe(false)
    expect(e1.numEntrants).toBe(0)
    expect(e1.videogame.id).toBe('0')
    expect(e1.videogame.name).toBe('Unknown')
  })
})
