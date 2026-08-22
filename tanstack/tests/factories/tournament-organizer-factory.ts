import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { TournamentOrganizer } from '#/domain/recap/tournament-organizer'
import type { Tournament } from '#/domain/recap/tournament'
import { asUserSlug } from '#/domain/shared-kernel/ids'

export const TournamentOrganizerFactory = Factory.define<TournamentOrganizer>(
  ({ sequence }) => {
    return new TournamentOrganizer({
      id: asUserSlug(sequence.toString()),
      gamerTag: faker.internet.username(),
      tournaments: [] as Tournament[],
    })
  },
)
