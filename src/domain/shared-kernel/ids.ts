type Brand<TValue, TBrand> = TValue & { __brand: TBrand }

export type PlayerId = Brand<string, 'PlayerId'>
export type TournamentId = Brand<string, 'TournamentId'>
export type EventId = Brand<string, 'EventId'>
export type ParticipantId = Brand<string, 'ParticipantId'>
export type CharacterId = Brand<string, 'CharacterId'>
export type StageId = Brand<string, 'StageId'>
export type GameId = Brand<string, 'GameId'>

export const asPlayerId = (id: string): PlayerId => id as PlayerId
export const asTournamentId = (id: string): TournamentId => id as TournamentId
export const asEventId = (id: string): EventId => id as EventId
export const asParticipantId = (id: string): ParticipantId =>
  id as ParticipantId
export const asCharacterId = (id: string): CharacterId => id as CharacterId
export const asStageId = (id: string): StageId => id as StageId
export const asGameId = (id: string): GameId => id as GameId
