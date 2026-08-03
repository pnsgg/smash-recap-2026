import { Event } from '#/domain/recap/event'
import type { Participant } from '#/domain/recap/participant'
import type { Set } from '#/domain/recap/set'
import { SetPlayer } from '#/domain/recap/set'
import { asEventId } from '#/domain/shared-kernel/ids'
import type { PlayerId } from '#/domain/shared-kernel/ids'
import { BracketType } from '#/domain/recap/bracket-type'
import { Factory } from './factory'
import { ParticipantFactory } from './participant-factory'
import { SetFactory } from './set-factory'
import { VideogameFactory } from './videogame-factory'

export const EventFactory = Factory.define(
  ({ faker }) => ({
    id: faker.number.int().toString(),
    name: faker.company.buzzNoun(),
    videogame: VideogameFactory.make(),
    isOnline: faker.datatype.boolean(),
    bracketType: faker.helpers.arrayElement(Object.values(BracketType)),
    participants: [] as Participant[],
    sets: [] as Set[],
  }),
  ({ id, name, videogame, isOnline, bracketType, participants, sets }) =>
    new Event({
      id: asEventId(id),
      name,
      videogame,
      isOnline,
      bracketType,
      participants,
      sets,
    }),
)
  .state('withParticipants', () => ({
    participants: ParticipantFactory.makeMany(5),
  }))
  .state('withSets', (attrs, { faker }) => {
    const participants =
      attrs.participants.length >= 2
        ? attrs.participants
        : ParticipantFactory.makeMany(5)

    const mainPlayer = participants[0]

    const sets = Array.from({ length: 3 }, () => {
      const opponent = faker.helpers.arrayElement(participants.slice(1))
      const p1 = new SetPlayer({
        playerId: mainPlayer.playerId,
        seed: mainPlayer.seed,
        score: faker.number.int({ min: 0, max: 3 }),
        isDisqualified: false,
      })
      const p2 = new SetPlayer({
        playerId: opponent.playerId,
        seed: opponent.seed,
        score: faker.number.int({ min: 0, max: 3 }),
        isDisqualified: false,
      })
      const competitors = new Map<PlayerId, SetPlayer>([
        [mainPlayer.playerId, p1],
        [opponent.playerId, p2],
      ])

      return SetFactory.merge({
        eventId: attrs.id,
        competitors,
        winnerId: faker.helpers.arrayElement([
          mainPlayer.playerId,
          opponent.playerId,
        ]),
      }).make()
    })

    return {
      participants,
      sets,
    }
  })

export const EventFactoryWithNoParticipants = EventFactory
