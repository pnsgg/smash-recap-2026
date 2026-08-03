import { Game, GameSelection } from '#/domain/recap/game'
import type { Stage } from '#/domain/recap/stage'
import { asGameId, asPlayerId } from '#/domain/shared-kernel/ids'
import { CharacterFactory } from './character-factory'
import { StageFactory } from './stage-factory'
import { Factory } from './factory'

export const GameFactory = Factory.define(
  ({ faker }) => {
    const p1Id = asPlayerId(faker.number.int().toString())
    const p2Id = asPlayerId(faker.number.int().toString())
    const p1Char = CharacterFactory.make()
    const p2Char = CharacterFactory.make()

    return {
      id: faker.number.int().toString(),
      orderNum: faker.number.int({ min: 1, max: 5 }),
      winnerId: faker.helpers.arrayElement([p1Id, p2Id, null]),
      stage: StageFactory.make(),
      selections: [
        new GameSelection(p1Id, p1Char),
        new GameSelection(p2Id, p2Char),
      ],
    }
  },
  ({ id, orderNum, winnerId, stage, selections }) =>
    new Game({
      id: asGameId(id),
      orderNum,
      winnerId,
      stage,
      selections,
    }),
)
