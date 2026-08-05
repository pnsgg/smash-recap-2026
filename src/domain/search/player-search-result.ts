import type { PlayerId } from '#/domain/shared-kernel/ids'

export type SearchPlayerResultProps = {
  id: PlayerId
  prefix: string | null
  gamerTag: string
  country: string | null
  profilePictureUrl: string | null
  nbEvents: number
}

export class SearchPlayerResult {
  public readonly id: PlayerId
  public readonly prefix: string | null
  public readonly gamerTag: string
  public readonly country: string | null
  public readonly profilePictureUrl: string | null
  public readonly nbEvents: number

  constructor(params: SearchPlayerResultProps) {
    this.id = params.id
    this.prefix = params.prefix
    this.gamerTag = params.gamerTag
    this.country = params.country
    this.profilePictureUrl = params.profilePictureUrl
    this.nbEvents = params.nbEvents
  }

  fullName(): string {
    return this.gamerTag ? `${this.prefix} ${this.gamerTag}` : this.gamerTag
  }

  /**
   * Rank results
   * - Filters out players with no events attended
   * - Sorts the remaining results by number of events attended, descending
   */
  static rankResults(results: SearchPlayerResult[]): SearchPlayerResult[] {
    return results
      .filter((player) => player.nbEvents > 0)
      .sort((a, b) => b.nbEvents - a.nbEvents)
  }
}
