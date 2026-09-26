import { Elysia } from 'elysia'
import { envPlugin } from '#config/env'
import { UserNotFoundError } from '#recap/domain/user_not_found_error'
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
  new Elysia({ tags: ['Recap'] })
    .use(envPlugin)
    .onError(({ error, set }) => {
      if (error instanceof UserNotFoundError) {
        set.status = 404
        return { error: 'not_found', message: error.message }
      }
    })
    .get(
      '/players/:slug/recap',
      async ({ params, query, env }) => {
        const year = new Date(env.RECAP_YEAR, 0, 1)
        const videogameId = asVideogameId(query.videogameId ?? DEFAULT_VIDEOGAME_ID)
        const player = await playerService.getRecap(asUserSlug(params.slug), year, videogameId)
        return presentPlayerRecap(player)
      },
      {
        params: playerRecapParamsSchema,
        query: playerRecapQuerySchema,
        detail: {
          summary: 'Get a player recap',
          description:
            "Fetches a player's yearly recap stats by their start.gg user slug and an optional videogame ID (defaults to Super Smash Bros. Ultimate).",
        },
      }
    )
    .get(
      '/tournament-organizers/:slug/recap',
      async ({ params, env }) => {
        const year = new Date(env.RECAP_YEAR, 0, 1)
        const recap = await tournamentOrganizerService.getRecap(asUserSlug(params.slug), year)
        return presentTournamentOrganizerRecap(recap)
      },
      {
        params: tournamentOrganizerRecapParamsSchema,
        detail: {
          summary: 'Get a tournament organizer recap',
          description:
            "Fetches a tournament organizer's yearly recap stats by their start.gg user slug.",
        },
      }
    )

export const recapModule = createRecapModule()
