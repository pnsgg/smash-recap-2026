import { SearchPlayerResult } from '#/domain/search/player-search-result'
import { asPlayerId } from '#/domain/shared-kernel/ids'

export function mapSearchPlayerResult(params: {
  id: string | number
  prefix: string | null | undefined
  gamerTag: string
  country: string | null | undefined
  profilePictureUrl: string | null | undefined
  nbEvents: number | null | undefined
}): SearchPlayerResult {
  return new SearchPlayerResult({
    id: asPlayerId(params.id.toString()),
    prefix: params.prefix || null,
    gamerTag: params.gamerTag,
    country: params.country || null,
    profilePictureUrl: params.profilePictureUrl || null,
    nbEvents: params.nbEvents || 0,
  })
}
