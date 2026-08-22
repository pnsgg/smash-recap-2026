import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { Tournament } from '#recap/domain/tournament'
import { TournamentOrganizer } from '#recap/domain/tournament_organizer'
import { asUserSlug } from '#shared/domain/ids'

export const TournamentOrganizerFactory = Factory.define<TournamentOrganizer>(({ sequence }) => {
  return new TournamentOrganizer({
    id: asUserSlug(sequence.toString()),
    gamerTag: faker.internet.username(),
    tournaments: [] as Tournament[],
  })
})
