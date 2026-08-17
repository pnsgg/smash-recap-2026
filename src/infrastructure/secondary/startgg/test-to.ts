import { StartggClient } from './startgg-client'
import { StartggTournamentOrganizerRepository } from './tournament-organizer-repository'
import { asUserSlug } from '#/domain/shared-kernel/ids'
import { EventTypeHelper } from '#/domain/recap/event-type'

const client = new StartggClient()
const sgg = new StartggTournamentOrganizerRepository(client)

const DISCRIMINATORS = {
  CLEMBS: 'user/e3a5b49b',
  MASKIME: 'user/3d2f6e89',
  ROUXCHOV: 'user/89723908',
} as const

const outputToRecap = async (
  discriminator: (typeof DISCRIMINATORS)[keyof typeof DISCRIMINATORS],
): Promise<void> => {
  console.log('*********************************************')
  const to = await sgg.getTournamentOrganizerRecap(
    asUserSlug(discriminator),
    new Date('2026-12-31'),
  )
  console.log(`Fetching TO recap for ${to.gamerTag}...`)

  console.log('Total Tournaments Organized:', to.totalTournaments())
  if (to.totalTournaments() > 0) {
    console.log('\nBiggest Tournaments:')
    to.biggestTournaments(3).forEach(({ tournament, attendees }, idx) => {
      console.log(` ${idx + 1}. ${tournament.name} (${attendees} attendees)`)
    })

    console.log('\nGames Organized:')
    to.gamesOrganized().forEach(({ videogame, count }) => {
      console.log(` - ${videogame.name}: ${count} times`)
    })

    console.log('\nEvent Type:')
    to.eventTypeBreakdown().forEach(({ type, count }) => {
      console.log(` - ${EventTypeHelper.toString(type)}: ${count} events`)
    })

    console.log('\nSeries Organized:')
    to.seriesOrganized(3).forEach((series) => {
      console.log(` - ${series.seriesName}: ${series.count()} tournaments`)
    })
  } else {
    console.log('This user did not organize any tournaments this year.')
  }
}

const run = async () => {
  for (const discriminator of Object.values(DISCRIMINATORS)) {
    await outputToRecap(discriminator)
  }
}

run()
