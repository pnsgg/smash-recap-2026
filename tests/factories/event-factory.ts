import { Event } from '#/domain/recap/event'
import type { Participant } from '#/domain/recap/participant'
import type { Set } from '#/domain/recap/set'
import { SetPlayer } from '#/domain/recap/set'
import { asEventId } from '#/domain/shared-kernel/ids'
import { Factory } from './factory'
import { ParticipantFactory } from './participant-factory'
import { SetFactory } from './set-factory'
import { VideogameFactory } from './videogame-factory'

export const EventFactory = Factory.define(
  ({ faker }) => ({
    id: faker.number.int().toString(),
    name: faker.company.buzzNoun(),
    videogame: VideogameFactory.make(),
    participants: [] as Participant[],
    sets: [] as Set[],
  }),
  ({ id, name, videogame, participants, sets }) =>
    new Event(asEventId(id), name, videogame, participants, sets),
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
      return SetFactory.merge({
        eventId: attrs.id,
        player1: new SetPlayer(
          mainPlayer.playerId,
          mainPlayer.seed,
          faker.number.int({ min: 0, max: 3 }),
          false,
        ),
        player2: new SetPlayer(
          opponent.playerId,
          opponent.seed,
          faker.number.int({ min: 0, max: 3 }),
          false,
        ),
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
