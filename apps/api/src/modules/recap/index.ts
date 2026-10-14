import { redis } from 'bun'
import { Elysia, status } from 'elysia'
import { envPlugin } from '#config/env'
import { cache, CacheClient } from '#plugins/cache'
import { asUserSlug, asVideogameId } from '#shared/ids'
import {
  notFoundResponseSchema,
  playerRecapParamsSchema,
  playerRecapQuerySchema,
  playerRecapResponseSchema,
  tournamentOrganizerRecapParamsSchema,
  tournamentOrganizerRecapResponseSchema,
  UserNotFoundError,
} from '#recap/model'
import { presentPlayerRecap, presentTournamentOrganizerRecap } from '#recap/presenter'
import {
  PlayerRecapService,
  playerRecapService,
  TournamentOrganizerRecapService,
  tournamentOrganizerRecapService,
} from '#recap/service'

const DEFAULT_VIDEOGAME_ID = asVideogameId('1386')

export const createRecapModule = (
  playerService: PlayerRecapService = playerRecapService,
  tournamentOrganizerService: TournamentOrganizerRecapService = tournamentOrganizerRecapService,
  cacheClient: CacheClient = redis
) =>
  new Elysia({ tags: ['Recap'] })
    .use(envPlugin)
    .use(cache(cacheClient))
    .onError(({ error }) => {
      if (error instanceof UserNotFoundError)
        return status(404, { error: 'not_found', message: error.message })
    })
    .model({
      'Recap.PlayerRecapResponse': playerRecapResponseSchema,
      'Recap.TournamentOrganizerRecapResponse': tournamentOrganizerRecapResponseSchema,
      'Recap.NotFound': notFoundResponseSchema,
    })
    .get(
      '/players/:slug/recap',
      async ({ params, query, env }) => {
        const year = new Date(env.RECAP_YEAR, 0, 1)
        const videogameId = asVideogameId(query.videogameId ?? DEFAULT_VIDEOGAME_ID)
        const { player, skippedEventCount } = await playerService.getRecap(
          asUserSlug(params.slug),
          year,
          videogameId
        )
        return presentPlayerRecap(player, skippedEventCount)
      },
      {
        params: playerRecapParamsSchema,
        query: playerRecapQuerySchema,
        response: { 200: 'Recap.PlayerRecapResponse', 404: 'Recap.NotFound' },
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
        response: { 200: 'Recap.TournamentOrganizerRecapResponse', 404: 'Recap.NotFound' },
        detail: {
          summary: 'Get a tournament organizer recap',
          description:
            "Fetches a tournament organizer's yearly recap stats by their start.gg user slug.",
        },
      }
    )

export const recapModule = createRecapModule()
