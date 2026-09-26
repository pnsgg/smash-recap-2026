import { Elysia } from 'elysia'
import { envPlugin } from '#config/env'
import { asUserSlug, asVideogameId } from '#shared/ids'
import {
  playerRecapParamsSchema,
  playerRecapQuerySchema,
  presentPlayerRecap,
  presentTournamentOrganizerRecap,
  tournamentOrganizerRecapParamsSchema,
} from '#recap/model'
import {
  PlayerRecapService,
  playerRecapService,
  TournamentOrganizerRecapService,
  tournamentOrganizerRecapService,
} from '#recap/service'

const DEFAULT_VIDEOGAME_ID = asVideogameId('1386')

export const createRecapModule = (
  playerService: PlayerRecapService = playerRecapService,
  tournamentOrganizerService: TournamentOrganizerRecapService = tournamentOrganizerRecapService
) =>
  new Elysia()
    .use(envPlugin)
    .get(
      '/players/:slug/recap',
      async ({ params, query, env }) => {
        const year = new Date(env.RECAP_YEAR, 0, 1)
        const videogameId = asVideogameId(query.videogameId ?? DEFAULT_VIDEOGAME_ID)
        const player = await playerService.getRecap(asUserSlug(params.slug), year, videogameId)
        return presentPlayerRecap(player)
      },
      { params: playerRecapParamsSchema, query: playerRecapQuerySchema }
    )
    .get(
      '/tournament-organizers/:slug/recap',
      async ({ params, env }) => {
        const year = new Date(env.RECAP_YEAR, 0, 1)
        const recap = await tournamentOrganizerService.getRecap(asUserSlug(params.slug), year)
        return presentTournamentOrganizerRecap(recap)
      },
      { params: tournamentOrganizerRecapParamsSchema }
    )

export const recapModule = createRecapModule()
