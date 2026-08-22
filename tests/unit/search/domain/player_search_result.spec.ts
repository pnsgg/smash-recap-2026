import { test } from '@japa/runner'
import { SearchPlayerResult } from '#search/domain/player_search_result'
import { asPlayerId, asUserSlug } from '#shared/domain/ids'

test.group('SearchPlayerResult - constructor', () => {
  test('initializes all fields correctly', ({ assert }) => {
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

    assert.equal(result.id, props.id)
    assert.equal(result.slug, props.slug)
    assert.equal(result.prefix, props.prefix)
    assert.equal(result.gamerTag, props.gamerTag)
    assert.equal(result.country, props.country)
    assert.equal(result.profilePictureUrl, props.profilePictureUrl)
    assert.equal(result.nbEvents, props.nbEvents)
  })
})

test.group('SearchPlayerResult - fullName', () => {
  test('returns gamerTag prefixed with prefix when prefix is present', ({ assert }) => {
    const result = new SearchPlayerResult({
      id: asPlayerId('player-123'),
      slug: asUserSlug('user-slug'),
      prefix: 'PNS',
      gamerTag: 'Rouxchov',
      country: null,
      profilePictureUrl: null,
      nbEvents: 5,
    })

    assert.equal(result.fullName(), 'PNS Rouxchov')
  })

  test('returns only gamerTag when prefix is null', ({ assert }) => {
    const result = new SearchPlayerResult({
      id: asPlayerId('player-123'),
      slug: asUserSlug('user-slug'),
      prefix: null,
      gamerTag: 'Clembs',
      country: null,
      profilePictureUrl: null,
      nbEvents: 5,
    })

    assert.equal(result.fullName(), 'Clembs')
  })

  test('returns only gamerTag when prefix is empty string', ({ assert }) => {
    const result = new SearchPlayerResult({
      id: asPlayerId('player-123'),
      slug: asUserSlug('user-slug'),
      prefix: '',
      gamerTag: 'Clembs',
      country: null,
      profilePictureUrl: null,
      nbEvents: 5,
    })

    assert.equal(result.fullName(), 'Clembs')
  })
})

test.group('SearchPlayerResult - rankResults', () => {
  test('filters out players with 0 events and sorts descending by nbEvents', ({ assert }) => {
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

    assert.lengthOf(ranked, 2)
    assert.equal(ranked[0], player3)
    assert.equal(ranked[1], player1)
  })
})
