import { Address } from './recap/address'
import { Event } from './recap/event'
import { Participant } from './recap/participant'
import { Player } from './recap/player'
import { Seed } from './recap/seed'
import { Tournament } from './recap/tournament'
import { Videogame } from './recap/videogame'
import { BracketType } from './recap/bracket-type'
import {
  asEventId,
  asParticipantId,
  asPlayerId,
  asTournamentId,
  asVideogameId,
} from './shared-kernel/ids'

const player = new Player({
  id: asPlayerId('1'),
  gamerTag: 'Licane',
  prefix: 'ARK',
  tournaments: [
    new Tournament({
      id: asTournamentId('kilyan-2-kilya-x-pns'),
      name: 'KiLyAN #2 - Kilya x PNS',
      address: new Address({
        city: 'Ramonville',
        state: 'Occitanie',
        countryCode: 'FR',
        longitude: 43.54019,
        latitude: 1.4718005,
      }),
      startDate: new Date('2026-06-28T19:00:00.000Z'),
      events: [
        new Event({
          id: asEventId('1'),
          name: 'Super Smash Bros. Ultimate',
          videogame: new Videogame(
            asVideogameId('123'),
            'Super Smash Bros. Ultimate',
          ),
          isOnline: false,
          bracketType: BracketType.DOUBLE_ELIMINATION,
          participants: [
            new Participant({
              id: asParticipantId('participant-1'),
              playerId: asPlayerId('1'),
              name: 'Licane',
              seed: new Seed(1, 1),
            }),
            new Participant({
              id: asParticipantId('participant-2'),
              playerId: asPlayerId('2'),
              name: 'Potichat',
              seed: new Seed(2, 2),
            }),
            new Participant({
              id: asParticipantId('participant-3'),
              playerId: asPlayerId('3'),
              name: 'Clément',
              seed: new Seed(3, 3),
            }),
            new Participant({
              id: asParticipantId('participant-4'),
              playerId: asPlayerId('4'),
              name: 'Mayou',
              seed: new Seed(6, 4),
            }),
            new Participant({
              id: asParticipantId('participant-5'),
              playerId: asPlayerId('5'),
              name: 'Rouxchov',
              seed: new Seed(4, 5),
            }),
            new Participant({
              id: asParticipantId('participant-6'),
              playerId: asPlayerId('6'),
              name: 'Gaston',
              seed: new Seed(9, 5),
            }),
            new Participant({
              id: asParticipantId('participant-7'),
              playerId: asPlayerId('7'),
              name: 'Prideness',
              seed: new Seed(7, 7),
            }),
            new Participant({
              id: asParticipantId('participant-8'),
              playerId: asPlayerId('8'),
              name: 'Frederike',
              seed: new Seed(7, 5),
            }),
            new Participant({
              id: asParticipantId('participant-9'),
              playerId: asPlayerId('9'),
              name: 'Cel1',
              seed: new Seed(8, 9),
            }),
            new Participant({
              id: asParticipantId('participant-10'),
              playerId: asPlayerId('10'),
              name: 'Mr. Saturne',
              seed: new Seed(9, 10),
            }),
          ],
          sets: [],
        }),
      ],
    }),
  ],
})
