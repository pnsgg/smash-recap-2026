import { TournamentOrganizer } from '#/domain/recap/tournament-organizer'
import type { Tournament } from '#/domain/recap/tournament'
import { asUserSlug } from '#/domain/shared-kernel/ids'
import { Factory } from './factory'

export const TournamentOrganizerFactory = Factory.define(
  ({ faker }) => ({
    id: faker.number.int().toString(),
    gamerTag: faker.internet.username(),
    tournaments: [] as Tournament[],
  }),
  ({ id, gamerTag, tournaments }) =>
    new TournamentOrganizer({
      id: asUserSlug(id),
      gamerTag,
      tournaments,
    }),
)
