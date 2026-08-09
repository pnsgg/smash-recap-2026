import { Player } from '#/domain/recap/player'
import { Tournament } from '#/domain/recap/tournament'
import { Address } from '#/domain/recap/address'
import { Event } from '#/domain/recap/event'
import { Participant } from '#/domain/recap/participant'
import { Seed } from '#/domain/recap/seed'
import { Set, SetPlayer } from '#/domain/recap/set'
import { Game, GameSelection } from '#/domain/recap/game'
import { Character } from '#/domain/recap/character'
import { Stage } from '#/domain/recap/stage'
import { Videogame } from '#/domain/recap/videogame'
import {
  asPlayerId,
  asTournamentId,
  asEventId,
  asParticipantId,
  asSetId,
  asGameId,
  asCharacterId,
  asStageId,
  asVideogameId,
} from '#/domain/shared-kernel/ids'
import type { PlayerId } from '#/domain/shared-kernel/ids'
import type { ResultOf } from 'gql.tada'
import type { getEvent } from '../queries/get-event'
import { mapBracketType } from './utils'

export type EventResult = Exclude<
  ResultOf<typeof getEvent>['event'],
  null | undefined
>
type EntrantResult = Exclude<EventResult['userEntrant'], null | undefined>
type PaginatedSets = Exclude<EntrantResult['paginatedSets'], null | undefined>
type SetResult = Exclude<
  Exclude<PaginatedSets['nodes'], null | undefined>[number],
  null | undefined
>
type GameResult = Exclude<
  Exclude<SetResult['games'], null | undefined>[number],
  null | undefined
>

export function mapPlayerRecap(
  playerId: PlayerId,
  playerHeader: {
    gamerTag: string
    prefix: string | null
  },
  rawEvents: EventResult[],
): Player {
  const tournamentsMap = new Map<
    string,
    {
      tournament: Exclude<EventResult['tournament'], null | undefined>
      events: EventResult[]
    }
  >()

  for (const rawEvent of rawEvents) {
    if (!rawEvent.tournament || !rawEvent.tournament.id) continue
    const tournamentId = rawEvent.tournament.id.toString()
    if (!tournamentsMap.has(tournamentId)) {
      tournamentsMap.set(tournamentId, {
        tournament: rawEvent.tournament,
        events: [],
      })
    }
    tournamentsMap.get(tournamentId)!.events.push(rawEvent)
  }

  const tournaments: Tournament[] = []

  for (const [_, group] of tournamentsMap) {
    const rawTournament = group.tournament
    const events: Event[] = []

    for (const rawEvent of group.events) {
      const mappedEvent = mapEvent(rawEvent, playerId)
      if (mappedEvent) events.push(mappedEvent)
    }

    const rawTournamentId = rawTournament.id?.toString()
    if (!rawTournamentId) throw new Error('Tournament ID is missing')

    const rawTournamentName = rawTournament.name
    if (!rawTournamentName) throw new Error('Tournament name is missing')

    tournaments.push(
      new Tournament({
        id: asTournamentId(rawTournamentId),
        name: rawTournamentName,
        address:
          rawTournament.lat !== null ||
          rawTournament.lng !== null ||
          rawTournament.city ||
          rawTournament.addrState ||
          rawTournament.countryCode
            ? new Address({
                city: rawTournament.city || null,
                state: rawTournament.addrState || null,
                countryCode: rawTournament.countryCode || null,
                latitude: rawTournament.lat
                  ? parseFloat(rawTournament.lat.toString())
                  : null,
                longitude: rawTournament.lng
                  ? parseFloat(rawTournament.lng.toString())
                  : null,
              })
            : null,
        startDate: new Date(((rawTournament.startAt as number) || 0) * 1000),
        events,
      }),
    )
  }

  return new Player({
    id: playerId,
    gamerTag: playerHeader.gamerTag,
    prefix: playerHeader.prefix,
    tournaments,
  })
}

export function mapEmptyPlayer(
  playerId: PlayerId,
  playerHeader: {
    gamerTag: string
    prefix: string | null
  },
): Player {
  return new Player({
    id: playerId,
    gamerTag: playerHeader.gamerTag,
    prefix: playerHeader.prefix,
    tournaments: [],
  })
}

// TODO: Prevent throws as it block the entire recap generation
function mapEvent(
  rawEvent: EventResult,
  targetPlayerId: PlayerId,
): Event | null {
  if (rawEvent.userEntrant?.isDisqualified) return null

  const userEntrant = rawEvent.userEntrant
  if (!userEntrant || !userEntrant.id) return null

  const videogameId = rawEvent.videogame?.id?.toString()
  if (!videogameId)
    throw new Error('Cannot map event. Reason: Videogame ID is missing')

  const videogameName = rawEvent.videogame?.name
  if (!videogameName)
    throw new Error('Cannot map event. Reason: Videogame name is missing')

  const videogame = new Videogame(asVideogameId(videogameId), videogameName)

  const rawBracketType = userEntrant.phaseGroups?.[0]?.bracketType
  const bracketType = mapBracketType(rawBracketType)
  const placement = userEntrant.standing?.placement
  if (placement === null || placement === undefined)
    throw new Error(
      'Cannot map event. Reason: User entrant placement is missing',
    )
  const initialSeedNum = userEntrant.initialSeedNum
  if (initialSeedNum === null)
    throw new Error(
      'Cannot map event. Reason: User entrant initial seed is missing',
    )

  const seed = new Seed(initialSeedNum, placement)

  const entrantIdToPlayerId = new Map<string, PlayerId>()
  const participantsMap = new Map<string, Participant>()

  entrantIdToPlayerId.set(userEntrant.id.toString(), targetPlayerId)
  if (!userEntrant.name)
    throw new Error('Cannot map event. Reason: User entrant name is missing')
  participantsMap.set(
    userEntrant.id.toString(),
    new Participant({
      id: asParticipantId(userEntrant.id.toString()),
      playerId: targetPlayerId,
      name: userEntrant.name,
      seed,
    }),
  )

  const eventId = rawEvent.id?.toString()
  if (!eventId) throw new Error('Cannot map event. Reason: Event ID is missing')

  const eventName = rawEvent.name
  if (!eventName)
    throw new Error('Cannot map event. Reason: Event name is missing')

  const sets: Set[] = []
  const rawSets = userEntrant.paginatedSets?.nodes || []
  for (const rawSet of rawSets) {
    if (!rawSet) continue
    const mappedSet = mapSet(
      rawSet,
      eventId,
      entrantIdToPlayerId,
      participantsMap,
    )
    if (mappedSet) sets.push(mappedSet)
  }

  return new Event({
    id: asEventId(eventId),
    name: eventName,
    videogame,
    isOnline: !!rawEvent.isOnline,
    bracketType,
    participants: Array.from(participantsMap.values()),
    sets,
  })
}

function mapSet(
  rawSet: SetResult,
  eventId: string,
  entrantIdToPlayerId: Map<string, PlayerId>,
  participantsMap: Map<string, Participant>,
): Set | null {
  const competitors = new Map<PlayerId, SetPlayer>()

  for (const slot of rawSet.slots || []) {
    if (!slot || !slot.entrant) continue
    const entrant = slot.entrant
    if (!entrant.id || !entrant.players) continue
    const firstPlayer = entrant.players[0]
    if (!firstPlayer || !firstPlayer.id) continue
    const playerId = asPlayerId(firstPlayer.id.toString())

    entrantIdToPlayerId.set(entrant.id.toString(), playerId)

    const initialSeed = slot.seed?.seedNum || 1
    const rawScore = slot.standing?.stats?.score?.value ?? 0
    const score = Math.max(0, rawScore)
    const finalPlacement = entrant.standing?.placement || 1

    competitors.set(
      playerId,
      new SetPlayer({
        playerId,
        seed: new Seed(initialSeed, finalPlacement),
        score,
        isDisqualified: !!entrant.isDisqualified,
      }),
    )

    if (!participantsMap.has(entrant.id.toString())) {
      if (entrant.name === null)
        throw new Error('Cannot map set. Reason: Entrant name is missing')
      participantsMap.set(
        entrant.id.toString(),
        new Participant({
          id: asParticipantId(entrant.id.toString()),
          playerId,
          name: entrant.name,
          seed: new Seed(initialSeed, finalPlacement),
        }),
      )
    }
  }

  if (competitors.size === 0) return null

  const winnerId = rawSet.winnerId
    ? entrantIdToPlayerId.get(rawSet.winnerId.toString())
    : null
  const finalWinnerId = winnerId || Array.from(competitors.keys())[0]

  const games: Game[] = []
  for (const rawGame of rawSet.games || []) {
    if (!rawGame) continue
    const mappedGame = mapGame(rawGame, entrantIdToPlayerId)
    if (mappedGame) games.push(mappedGame)
  }

  const setId = rawSet.id?.toString()
  if (!setId) throw new Error('Cannot map set. Reason: Set ID is missing')

  const fullRoundText = rawSet.fullRoundText
  if (!fullRoundText)
    throw new Error('Cannot map set. Reason: Set fullRoundText is missing')

  return new Set({
    id: asSetId(setId),
    eventId: asEventId(eventId),
    competitors,
    winnerId: finalWinnerId,
    round: rawSet.round || 0,
    fullRoundText,
    games,
    completedAt: rawSet.completedAt ? new Date((rawSet.completedAt as number) * 1000) : null,
    bracketType: 1 as unknown as any, // FIXME: remove this cast when Event domain is updated
  })
}

function mapGame(
  rawGame: GameResult,
  entrantIdToPlayerId: Map<string, PlayerId>,
): Game | null {
  const gameWinnerPlayerId = rawGame.winnerId
    ? entrantIdToPlayerId.get(rawGame.winnerId.toString())
    : null

  let stage: Stage | null = null
  if (rawGame.stage) {
    const stageId = rawGame.stage.id?.toString()
    if (!stageId) throw new Error('Stage ID is missing')

    const stageName = rawGame.stage.name
    if (!stageName) throw new Error('Stage name is missing')

    stage = new Stage(asStageId(stageId), stageName)
  }

  const selections: GameSelection[] = []
  for (const sel of rawGame.selections || []) {
    if (!sel || !sel.entrant || !sel.character || !sel.entrant.id) continue
    const playerId = entrantIdToPlayerId.get(sel.entrant.id.toString())
    if (!playerId) continue

    const characterId = sel.character.id?.toString()
    if (!characterId) throw new Error('Character ID is missing')

    const characterName = sel.character.name
    if (!characterName) throw new Error('Character name is missing')

    selections.push(
      new GameSelection(
        playerId,
        new Character(asCharacterId(characterId), characterName),
      ),
    )
  }

  const gameId = rawGame.id?.toString()
  if (!gameId) throw new Error('Game ID is missing')

  const orderNum = rawGame.orderNum
  if (orderNum === null)
    throw new Error('Cannot map game. Reason: orderNum is missing')

  return new Game({
    id: asGameId(gameId),
    orderNum,
    winnerId: gameWinnerPlayerId || null,
    stage,
    selections,
  })
}
