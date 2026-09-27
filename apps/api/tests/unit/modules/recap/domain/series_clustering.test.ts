import { TournamentFactory } from '#tests/factories/tournament_factory'
import { describe, expect, test } from 'bun:test'
import { clusterSeries } from '#recap/domain/series_clustering'

describe('clusterSeries', () => {
  test('groups tournaments sharing the same base name across numbered editions', () => {
    const tournaments = [
      TournamentFactory.build({ name: 'PNS BloomBagarre #1', startDate: new Date('2026-01-10') }),
      TournamentFactory.build({ name: 'PNS BloomBagarre #2', startDate: new Date('2026-01-24') }),
      TournamentFactory.build({ name: 'PNS BloomBagarre #3', startDate: new Date('2026-02-14') }),
    ]

    const series = clusterSeries(tournaments)

    expect(series).toHaveLength(1)
    expect(series[0].name).toBe('PNS BloomBagarre')
    expect(series[0].tournaments).toHaveLength(3)
  })

  test('groups editions marked with a trailing roman numeral', () => {
    const tournaments = [
      TournamentFactory.build({ name: 'Genesis IX', startDate: new Date('2025-01-01') }),
      TournamentFactory.build({ name: 'Genesis X', startDate: new Date('2026-01-01') }),
    ]

    const series = clusterSeries(tournaments)

    expect(series).toHaveLength(1)
    expect(series[0].name).toBe('Genesis')
  })

  test('groups editions with a subtitle after a separator', () => {
    const tournaments = [
      TournamentFactory.build({
        name: 'Cavalier Clash 6 | $1000 POT BONUS',
        startDate: new Date('2025-06-01'),
      }),
      TournamentFactory.build({
        name: 'Cavalier Clash 7 | $1950+ POT BONUS',
        startDate: new Date('2026-06-01'),
      }),
    ]

    const series = clusterSeries(tournaments)

    expect(series).toHaveLength(1)
    expect(series[0].name).toBe('Cavalier Clash')
  })

  test('groups editions marked with "Vol." or "Saison"', () => {
    const tournaments = [
      TournamentFactory.build({ name: 'Slay O.Clock Vol. 1', startDate: new Date('2026-01-01') }),
      TournamentFactory.build({ name: 'Slay O.Clock Vol. 2', startDate: new Date('2026-02-01') }),
    ]

    const series = clusterSeries(tournaments)

    expect(series).toHaveLength(1)
    expect(series[0].name).toBe('Slay O.Clock')
  })

  test('is case- and accent-insensitive', () => {
    const tournaments = [
      TournamentFactory.build({ name: 'Été Smash #1', startDate: new Date('2026-07-01') }),
      TournamentFactory.build({ name: 'ete smash #2', startDate: new Date('2026-08-01') }),
    ]

    const series = clusterSeries(tournaments)

    expect(series).toHaveLength(1)
  })

  test('does not group unrelated tournaments', () => {
    const tournaments = [
      TournamentFactory.build({ name: 'Genesis X', startDate: new Date('2026-01-01') }),
      TournamentFactory.build({ name: 'Low Tier City 9', startDate: new Date('2026-02-01') }),
    ]

    const series = clusterSeries(tournaments)

    expect(series).toHaveLength(0)
  })

  test('does not strip a number glued onto a season/round label, e.g. "S1#19" -> "S1"', () => {
    const tournaments = [
      TournamentFactory.build({ name: 'Dawnpath S1#19', startDate: new Date('2026-01-01') }),
      TournamentFactory.build({ name: 'Dawnpath S1 #15', startDate: new Date('2026-02-01') }),
    ]

    const series = clusterSeries(tournaments)

    expect(series).toHaveLength(1)
    expect(series[0].name).toBe('Dawnpath S1')
  })

  test('does not strip a trailing number that is part of the name, only the real "#N" edition marker after it', () => {
    const tournaments = [
      TournamentFactory.build({
        name: '$100 Anything But The 3 #141',
        startDate: new Date('2026-01-01'),
      }),
      TournamentFactory.build({
        name: '$100 Anything But The 3 #128',
        startDate: new Date('2026-02-01'),
      }),
    ]

    const series = clusterSeries(tournaments)

    expect(series).toHaveLength(1)
    expect(series[0].name).toBe('$100 Anything But The 3')
  })

  test('excludes a tournament with no recurrence (group of one)', () => {
    const tournaments = [
      TournamentFactory.build({ name: 'One-off Locals', startDate: new Date('2026-01-01') }),
      TournamentFactory.build({ name: 'PNS BloomBagarre #1', startDate: new Date('2026-01-10') }),
      TournamentFactory.build({ name: 'PNS BloomBagarre #2', startDate: new Date('2026-01-24') }),
    ]

    const series = clusterSeries(tournaments)

    expect(series).toHaveLength(1)
    expect(series[0].name).toBe('PNS BloomBagarre')
  })

  test('does not mistake a real word ending like "Vivid" for a roman numeral', () => {
    const tournaments = [
      TournamentFactory.build({ name: 'Project Vivid', startDate: new Date('2026-01-01') }),
      TournamentFactory.build({ name: 'Project Vivid', startDate: new Date('2026-02-01') }),
    ]

    const series = clusterSeries(tournaments)

    expect(series).toHaveLength(1)
    expect(series[0].name).toBe('Project Vivid')
  })

  test('sorts a series tournaments by most recent first', () => {
    const tournaments = [
      TournamentFactory.build({ name: 'PNS BloomBagarre #1', startDate: new Date('2026-01-10') }),
      TournamentFactory.build({ name: 'PNS BloomBagarre #3', startDate: new Date('2026-03-01') }),
      TournamentFactory.build({ name: 'PNS BloomBagarre #2', startDate: new Date('2026-02-01') }),
    ]

    const series = clusterSeries(tournaments)

    expect(series[0].tournaments.map((t) => t.name)).toEqual([
      'PNS BloomBagarre #3',
      'PNS BloomBagarre #2',
      'PNS BloomBagarre #1',
    ])
  })

  test('sorts series by number of occurrences, descending', () => {
    const tournaments = [
      TournamentFactory.build({ name: 'Small Series #1', startDate: new Date('2026-01-01') }),
      TournamentFactory.build({ name: 'Small Series #2', startDate: new Date('2026-02-01') }),
      TournamentFactory.build({ name: 'Big Series #1', startDate: new Date('2026-01-01') }),
      TournamentFactory.build({ name: 'Big Series #2', startDate: new Date('2026-02-01') }),
      TournamentFactory.build({ name: 'Big Series #3', startDate: new Date('2026-03-01') }),
    ]

    const series = clusterSeries(tournaments)

    expect(series.map((s) => s.name)).toEqual(['Big Series', 'Small Series'])
  })

  test('returns an empty list for an empty input', () => {
    expect(clusterSeries([])).toEqual([])
  })
})
