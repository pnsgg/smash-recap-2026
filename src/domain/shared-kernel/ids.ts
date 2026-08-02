type Brand<TValue, TBrand> = TValue & { __brand: TBrand }

export type PlayerId = Brand<string, 'PlayerId'>
export type TournamentId = Brand<string, 'TournamentId'>
export type EventId = Brand<string, 'EventId'>
export type ParticipantId = Brand<string, 'ParticipantId'>

export const asPlayerId = (id: string): PlayerId => id as PlayerId
export const asTournamentId = (id: string): TournamentId => id as TournamentId
export const asEventId = (id: string): EventId => id as EventId
export const asParticipantId = (id: string): ParticipantId =>
  id as ParticipantId
