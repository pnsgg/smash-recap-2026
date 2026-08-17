import { StartggClient } from './startgg-client'
import { StartggPlayerRepository } from './player-repository'
import { asUserSlug } from '#/domain/shared-kernel/ids'

const sgg = new StartggPlayerRepository(new StartggClient(), {
  videogameIds: [1386],
})
const DISCRIMINATORS = {
  BLOU: 'user/a922f126',
  GLUTONNY: 'user/7611d833',
  MASKIME: 'user/3d2f6e89',
  LICANE: 'user/541f04fd',
  PAZ: 'user/caa366ab',
  POTICHAT: 'user/c904c6ee',
  RAARCHYOR: 'user/52b2a832',
  ROUXCHOV: 'user/89723908',
  SPARG0: 'user/b5230de8',
} as const

const outputRecap = async (
  discriminator: (typeof DISCRIMINATORS)[keyof typeof DISCRIMINATORS],
): Promise<void> => {
  console.log('*********************************************')
  const player = await sgg.getPlayerRecap(
    asUserSlug(discriminator),
    new Date('2026-12-31'),
  )
  console.log(`Fetching player recap for ${player.gamerTag}...`)

  console.log('Tournaments attended:', player.tournaments.length)
  if (player.tournaments.length > 0) {
    console.log('Day of Week Activity:')
    player.dayOfWeekActivity().forEach(({ day, count }) => {
      console.log(` - ${day}: ${count} tournaments`)
    })
    console.log()

    console.log('Tournaments by Month:')
    player.tournamentsByMonth().forEach(({ month, count }) => {
      console.log(` - ${month}: ${count} tournaments`)
    })
    console.log()

    console.log(`Total Sets: ${player.totalSets()}\n`)
    console.log(`Clean Sweeps: ${player.cleanSweeps()}\n`)

    const decidingGameSets = player.decidingGameSets()
    console.log(
      `Deciding Game Sets: ${decidingGameSets.winCount}/${decidingGameSets.count} => ${Math.ceil(decidingGameSets.winRate * 100)}%\n`,
    )

    console.log(`Total Disqualifications: ${player.totalDisqualifications()}\n`)

    console.log('Best Performances:')
    player.bestPerformances(3).forEach(({ tournament, spr }) => {
      console.log(` - ${tournament.name}: ${spr} SPR`)
    })
    console.log()

    const worstPerformance = player.worstPerformance()
    if (worstPerformance) {
      console.log(
        `Worst Performance: ${worstPerformance.spr} SPR at ${worstPerformance.tournament.name}`,
      )
      console.log()
    }

    console.log('Most Played Characters:')
    player.mostPlayedCharacters(3).forEach(({ character, count }) => {
      console.log(` - ${character.name}: ${count} times`)
    })
    console.log()

    const highestUpset = player.highestUpset()
    if (highestUpset) {
      console.log('Highest Upset:')
      console.log(` - factor: ${highestUpset.factor}`)
      console.log(
        ` - tournament: ${highestUpset.tournament.name} in ${highestUpset.event.name}`,
      )
      console.log()
    }

    console.log('Encountered Characters:')
    player.encounteredCharacters().forEach((character) => {
      console.log(` - ${character.name}`)
    })
    console.log()

    console.log('Stage Activity:')
    player.stageActivity().forEach(({ stage, count, winRate }) => {
      console.log(
        ` - ${stage.name}: ${count} games => ${Math.ceil(winRate * 100)}% wins`,
      )
    })
    console.log()

    console.log('Worst Matchups:')
    player.worstMatchups(3).forEach((mu) => {
      console.log(
        ` - Character: ${mu.character.name} => ${mu.lossCount}/${mu.count} => (${Math.ceil(mu.looseRate * 100)}% losses)`,
      )
    })
    console.log()

    console.log('Unique Opponents Faced:', player.uniqueOpponentsFaced().size)

    console.log('Head to head')
    console.log('\tBy score diff')
    player.headToHead(5, 'diff').forEach((headToHead) => {
      console.log(
        `\t\t- You: ${headToHead.playerWonSet} - ${headToHead.opponentPlayerId}: ${headToHead.opponentWonSet}`,
      )
    })
    console.log('\tBy win rate')
    player.headToHead(5, 'winRate').forEach((headToHead) => {
      console.log(
        `\t\t- You: ${headToHead.playerWonSet} - ${headToHead.opponentPlayerId}: ${headToHead.opponentWonSet}`,
      )
    })
    console.log('\tBy sets played')
    player.headToHead(5, 'total').forEach((headToHead) => {
      console.log(
        `\t\t- You: ${headToHead.playerWonSet} - ${headToHead.opponentPlayerId}: ${headToHead.opponentWonSet}`,
      )
    })
    console.log()

    console.log('Event type breakdown:')
    const eventTypeCounts = player.eventTypeBreakdown()
    for (const [type, count] of Object.entries(eventTypeCounts)) {
      console.log(` - ${type}: ${count}`)
    }
    console.log()

    console.log('Most played series:')
    player.seriesPlayed(3).forEach((series) => {
      console.log(` - ${series.seriesName}: ${series.count()} tournaments`)
    })
    console.log()
  } else {
    console.log(
      'Player has not attended enough tournaments to have a proper recap...',
    )
  }
  console.log('*********************************************\n\n')
}

for (const disctriminator of Object.values(DISCRIMINATORS)) {
  await outputRecap(disctriminator)
}
