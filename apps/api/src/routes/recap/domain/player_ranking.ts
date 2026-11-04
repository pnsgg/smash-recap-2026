
export type PlayerRanking = {
  rank: number
  previousRank: number | null
  seriesName: string
  title: string
  startAt: Date
  endAt: Date
  imageUrl: string | null
}

export const rankingsDuring = (rankings: PlayerRanking[], year: number): PlayerRanking[] => {
  const from = new Date(Date.UTC(year, 0, 1))
  const to = new Date(Date.UTC(year + 1, 0, 1))
  return rankings.filter((r) => r.endAt >= from && r.startAt < to)
}
