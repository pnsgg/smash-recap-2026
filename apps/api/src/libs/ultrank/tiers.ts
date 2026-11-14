import data from './tournaments.json'

/**
 * UltRank's tournament tiers, by score. Source: SmashWiki's UltRank 2026 page
 * (https://www.ssbwiki.com/UltRank_2026); UltRank's database only stores the score.
 */
export const ULTRANK_TIERS = [
  { tier: 'SP', name: 'Superpremier', minScore: 17_000 },
  { tier: 'P+', name: 'Premier+', minScore: 13_000 },
  { tier: 'P', name: 'Premier', minScore: 9_000 },
  { tier: 'S+', name: 'Supermajor+', minScore: 6_500 },
  { tier: 'S', name: 'Supermajor', minScore: 5_000 },
  { tier: 'A+', name: 'Major+', minScore: 4_000 },
  { tier: 'A', name: 'Major', minScore: 3_000 },
  { tier: 'B+', name: 'National', minScore: 2_000 },
  { tier: 'B', name: 'Superregional', minScore: 1_000 },
  { tier: 'C', name: 'Regional', minScore: 500 },
  { tier: 'D', name: 'Notable', minScore: 0 },
] as const

export type UltrankTier = (typeof ULTRANK_TIERS)[number]['tier']

const scores: Record<string, number> = data.scores

export const tierOfScore = (score: number): UltrankTier =>
  (ULTRANK_TIERS.find((t) => score >= t.minScore) ?? ULTRANK_TIERS[ULTRANK_TIERS.length - 1]).tier

/** start.gg's `tournament/<t>/event/<e>` as UltRank keys it: `<t>/<e>`. */
const ultrankKey = (eventSlug: string) => eventSlug.replace(/^tournament\//, '').replace('/event/', '/')

/**
 * The UltRank tier of a start.gg event, or null when UltRank does not rank it: under its minimum (entrants or player
 * points), not Ultimate, excluded (weeklies…), or after the last import.
 */
export const ultrankTier = (eventSlug: string | null, lookup: Record<string, number> = scores): UltrankTier | null => {
  if (!eventSlug) return null
  const score = lookup[ultrankKey(eventSlug)]
  return score === undefined ? null : tierOfScore(score)
}
