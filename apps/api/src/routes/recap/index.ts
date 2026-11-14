import { redis } from 'bun'
import { Elysia, status } from 'elysia'
import { envPlugin } from '#env'
import { asUserSlug, asVideogameId } from '#libs/ids'
import {
  notFoundResponseSchema,
  playerRecapParamsSchema,
  playerRecapQuerySchema,
  playerRecapResponseSchema,
  playerSummaryResponseSchema,
  tournamentOrganizerRecapParamsSchema,
  tournamentOrganizerRecapResponseSchema,
  tournamentOrganizerSummaryResponseSchema,
  UserNotFoundError,
} from '#recap/model'
import { presentPlayerSummary, presentTournamentOrganizerSummary } from '#recap/presenter'
import {
  PlayerRecapService,
  playerRecapService,
  TournamentOrganizerRecapService,
  tournamentOrganizerRecapService,
} from '#recap/service'
import { type CacheClient, RecapStore } from '#recap/store'

const DEFAULT_VIDEOGAME_ID = asVideogameId('1386')

export const createRecapModule = (
  playerService: PlayerRecapService = playerRecapService,
  tournamentOrganizerService: TournamentOrganizerRecapService = tournamentOrganizerRecapService,
  cacheClient: CacheClient = redis
) => {
  const store = new RecapStore(cacheClient, playerService, tournamentOrganizerService)

  return new Elysia({ normalize: 'typebox' })
    .use(envPlugin)
    .onError(UserNotFoundError, ({ error }) =>
      status(404, { error: 'not_found', message: error.message })
    )
    .model({
      'Recap.PlayerRecapResponse': playerRecapResponseSchema,
      'Recap.TournamentOrganizerRecapResponse': tournamentOrganizerRecapResponseSchema,
      'Recap.PlayerSummaryResponse': playerSummaryResponseSchema,
      'Recap.TournamentOrganizerSummaryResponse': tournamentOrganizerSummaryResponseSchema,
      'Recap.NotFound': notFoundResponseSchema,
    })
    .get('/players/:slug/recap', {
      params: playerRecapParamsSchema,
      query: playerRecapQuerySchema,
      response: { 200: 'Recap.PlayerRecapResponse', 404: 'Recap.NotFound' },
    }, ({ params, query, env }) =>
      store.player(
        asUserSlug(params.slug),
        env.RECAP_YEAR,
        asVideogameId(query.videogameId ?? DEFAULT_VIDEOGAME_ID)
      ))
    .get('/tournament-organizers/:slug/recap', {
      params: tournamentOrganizerRecapParamsSchema,
      response: { 200: 'Recap.TournamentOrganizerRecapResponse', 404: 'Recap.NotFound' },
    }, ({ params, env }) => store.tournamentOrganizer(asUserSlug(params.slug), env.RECAP_YEAR))
    .get('/players/:slug/summary', {
      params: playerRecapParamsSchema,
      query: playerRecapQuerySchema,
      response: { 200: 'Recap.PlayerSummaryResponse', 404: 'Recap.NotFound' },
    }, async ({ params, query, env }) =>
      presentPlayerSummary(
        await store.player(
          asUserSlug(params.slug),
          env.RECAP_YEAR,
          asVideogameId(query.videogameId ?? DEFAULT_VIDEOGAME_ID)
        )
      ))
    .get('/tournament-organizers/:slug/summary', {
      params: tournamentOrganizerRecapParamsSchema,
      response: { 200: 'Recap.TournamentOrganizerSummaryResponse', 404: 'Recap.NotFound' },
    }, async ({ params, env }) =>
      presentTournamentOrganizerSummary(await store.tournamentOrganizer(asUserSlug(params.slug), env.RECAP_YEAR)))
}

export const recapModule = createRecapModule()
