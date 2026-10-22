import type { Tournament } from '#recap/domain/tournament'

export type TournamentSeries = {
  name: string
  tournaments: Tournament[]
}

// Drops a trailing subtitle/sponsor blurb, e.g. "Cavalier Clash 7 | $1950+ POT BONUS" -> "Cavalier Clash 7"
const SUBTITLE_SEPARATOR = /\s*(?:\||:|\s-\s).*$/

// "#19" glued directly onto the previous word with no space, e.g. "Dawnpath S1#19" -> strip
// "#19", not "1" (matching on whitespace-split words alone would wrongly eat into "S1"). Only
// "#" is treated this way, not ".", since periods are common in abbreviations ("Vol.", "O.Clock")
// and would false-positive too easily if glued-matched the same way.
const GLUED_MARKER_NUMBER = /^(.*\S)#\d+$/

const BARE_NUMBER = /^\d+(?:st|nd|rd|th)?$/i
const MARKER_PREFIXED_NUMBER = /^[#.]\s*\d+$/
// A whole word that reads as a roman numeral (1-3999), e.g. "Genesis X" -> edition marker "X".
// Can false-positive on real words made entirely of M/D/C/L/X/V/I (e.g. "MIX"), same inherent
// trade-off as any such heuristic.
const ROMAN_NUMERAL = /^(?:m{0,4}(?:cm|cd|d?c{0,3})(?:xc|xl|l?x{0,3})(?:ix|iv|v?i{0,3}))$/i
const VOLUME_WORD = /^vol(?:ume)?\.?$/i
const SEASON_WORD = /^sai?son$/i

/**
 * Strips a single trailing "edition marker" word/token from a name, e.g.
 * "PNS BloomBagarre #3" -> "PNS BloomBagarre", "Slay O.Clock Vol. 2" -> "Slay O.Clock".
 * Operates on whole whitespace-delimited words (except for the glued-marker case) so it
 * never eats into the middle of a token like "S1".
 *
 * `allowBareNumber` gates stripping a trailing number with no explicit marker character
 * (no "#"/"."), since that's the most ambiguous case: real data has names like "Anything
 * But The 3 #141", where "3" is part of the name and only "#141" is the actual edition
 * marker. Bare numbers are only stripped on the first pass, never as a follow-up strip
 * after something else was already removed.
 */
function stripTrailingEditionToken(name: string, allowBareNumber: boolean): string {
  const glued = name.match(GLUED_MARKER_NUMBER)
  if (glued) return glued[1].trim()

  const words = name.trim().split(/\s+/)
  if (words.length === 0 || (words.length === 1 && words[0] === '')) return name

  const last = words[words.length - 1]

  // Checked before the single-word cases below, so "Vol. 1" is consumed as a pair
  // rather than only stripping "1" and leaving a dangling "Vol.".
  if (words.length >= 2) {
    const secondLast = words[words.length - 2]
    if ((VOLUME_WORD.test(secondLast) || SEASON_WORD.test(secondLast)) && /^\d+$/.test(last)) {
      return words.slice(0, -2).join(' ')
    }
  }

  if (MARKER_PREFIXED_NUMBER.test(last) || ROMAN_NUMERAL.test(last)) {
    return words.slice(0, -1).join(' ')
  }

  if (allowBareNumber && BARE_NUMBER.test(last)) {
    return words.slice(0, -1).join(' ')
  }

  return name
}

/**
 * Strips a trailing subtitle and edition marker(s) from a tournament name, e.g.
 * "PNS BloomBagarre #3" -> "PNS BloomBagarre". Used both to build the grouping
 * key and to pick a clean display name for a cluster.
 */
function stripEditionMarkers(name: string): string {
  let result = name.replace(SUBTITLE_SEPARATOR, '').trim()

  // Repeat: some names stack markers, e.g. "Genesis X #2".
  let isFirstPass = true
  let previous: string
  do {
    previous = result
    result = stripTrailingEditionToken(result, isFirstPass).trim()
    isFirstPass = false
  } while (result !== previous && result.length > 0)

  return result || name.trim()
}

function normalizeForGrouping(name: string): string {
  return stripEditionMarkers(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Picks the most representative display name for a cluster: the most common
 * cleaned name among the group, tie-broken by the shortest one.
 */
function representativeName(tournaments: Tournament[]): string {
  const counts = new Map<string, number>()
  for (const tournament of tournaments) {
    const cleaned = stripEditionMarkers(tournament.name)
    counts.set(cleaned, (counts.get(cleaned) ?? 0) + 1)
  }

  let best = ''
  let bestCount = -1
  for (const [name, count] of counts) {
    if (count > bestCount || (count === bestCount && name.length < best.length)) {
      best = name
      bestCount = count
    }
  }
  return best
}

/**
 * Groups tournaments into recurring series (the same event across editions),
 * e.g. "PNS BloomBagarre #1" and "PNS BloomBagarre #2" become one series.
 * A group of a single tournament isn't a "series" and is excluded. Results
 * are sorted by number of occurrences, descending.
 */
export function clusterSeries(tournaments: Tournament[]): TournamentSeries[] {
  const groups = new Map<string, Tournament[]>()

  for (const tournament of tournaments) {
    const key = normalizeForGrouping(tournament.name)
    if (!key) continue

    const group = groups.get(key)
    if (group) {
      group.push(tournament)
    } else {
      groups.set(key, [tournament])
    }
  }

  return Array.from(groups.values())
    .filter((group) => group.length >= 2)
    .map((group) => ({
      name: representativeName(group),
      tournaments: [...group].sort((a, b) => b.startDate.getTime() - a.startDate.getTime()),
    }))
    .sort((a, b) => b.tournaments.length - a.tournaments.length)
}
