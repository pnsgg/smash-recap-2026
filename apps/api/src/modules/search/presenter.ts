import type { SearchPlayerResult } from '#search/domain/player_search_result'

export function presentSearchResults(results: SearchPlayerResult[]) {
  return results.map((r) => ({
    id: r.id,
    slug: r.slug,
    prefix: r.prefix,
    gamerTag: r.gamerTag,
    country: r.country,
    profilePictureUrl: r.profilePictureUrl,
    nbEvents: r.nbEvents,
  }))
}
