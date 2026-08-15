import { describe, expect, test } from 'vitest'
import { SearchPlayerResult } from '#/domain/search/player-search-result'
import { asPlayerId, asUserSlug } from '#/domain/shared-kernel/ids'

describe('SearchPlayerResult', () => {
  describe('constructor', () => {
    test('initializes all fields correctly', () => {
      const props = {
        id: asPlayerId('player-123'),
        slug: asUserSlug('user-slug'),
        prefix: 'MVG',
        gamerTag: 'Mew2King',
        country: 'US',
        profilePictureUrl: 'https://example.com/pfp.png',
        nbEvents: 42,
      }

      const result = new SearchPlayerResult(props)

      expect(result.id).toBe(props.id)
      expect(result.slug).toBe(props.slug)
      expect(result.prefix).toBe(props.prefix)
      expect(result.gamerTag).toBe(props.gamerTag)
      expect(result.country).toBe(props.country)
      expect(result.profilePictureUrl).toBe(props.profilePictureUrl)
      expect(result.nbEvents).toBe(props.nbEvents)
    })
  })

  describe('fullName', () => {
    test('returns gamerTag prefixed with prefix when prefix is present', () => {
      const result = new SearchPlayerResult({
        id: asPlayerId('player-123'),
        slug: asUserSlug('user-slug'),
        prefix: 'PNS',
        gamerTag: 'Rouxchov',
        country: null,
        profilePictureUrl: null,
        nbEvents: 5,
      })

      expect(result.fullName()).toBe('PNS Rouxchov')
    })

    test('returns only gamerTag when prefix is null', () => {
      const result = new SearchPlayerResult({
        id: asPlayerId('player-123'),
        slug: asUserSlug('user-slug'),
        prefix: null,
        gamerTag: 'Clembs',
        country: null,
        profilePictureUrl: null,
        nbEvents: 5,
      })

      expect(result.fullName()).toBe('Clembs')
    })

    test('returns only gamerTag when prefix is empty string', () => {
      const result = new SearchPlayerResult({
        id: asPlayerId('player-123'),
        slug: asUserSlug('user-slug'),
        prefix: '',
        gamerTag: 'Clembs',
        country: null,
        profilePictureUrl: null,
        nbEvents: 5,
      })

      expect(result.fullName()).toBe('Clembs')
    })
  })

  describe('rankResults', () => {
    test('filters out players with 0 events and sorts descending by nbEvents', () => {
      const player1 = new SearchPlayerResult({
        id: asPlayerId('p1'),
        slug: asUserSlug('s1'),
        prefix: null,
        gamerTag: 'Player1',
        country: null,
        profilePictureUrl: null,
        nbEvents: 10,
      })
      const player2 = new SearchPlayerResult({
        id: asPlayerId('p2'),
        slug: asUserSlug('s2'),
        prefix: null,
        gamerTag: 'Player2',
        country: null,
        profilePictureUrl: null,
        nbEvents: 0,
      })
      const player3 = new SearchPlayerResult({
        id: asPlayerId('p3'),
        slug: asUserSlug('s3'),
        prefix: null,
        gamerTag: 'Player3',
        country: null,
        profilePictureUrl: null,
        nbEvents: 25,
      })

      const results = [player1, player2, player3]
      const ranked = SearchPlayerResult.rankResults(results)

      expect(ranked).toHaveLength(2)
      expect(ranked[0]).toBe(player3)
      expect(ranked[1]).toBe(player1)
    })
  })
})
