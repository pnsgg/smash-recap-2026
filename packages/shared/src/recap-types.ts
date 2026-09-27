import type { presentPlayerRecap, presentTournamentOrganizerRecap } from '@api/modules/recap/model'

export type PlayerRecapProps = ReturnType<typeof presentPlayerRecap>
export type TournamentOrganizerRecapProps = ReturnType<typeof presentTournamentOrganizerRecap>
